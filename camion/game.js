'use strict';
/* CAMION · stato di gioco, fisica, lavori, GPS, traffico, salvataggi, audio */
const Lt=10,WB=3.95,FUEL_K=40,GRAV=9.81,DAY_SECS=720;
let W=null,G=null,worldMode='';
const keys={},touch={l:0,r:0,gas:0,brk:0};
const $=s=>document.querySelector(s);
const fmt=n=>Math.round(n).toLocaleString('it-IT');
const angNorm=a=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const xpAt=L=>Math.round(150*Math.pow(L-1,1.6));
const lvlOf=xp=>{let L=1;while(xp>=xpAt(L+1))L++;return L;};
let toastT=0;
function toast(msg,ms){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),ms||2600);}

/* ---------- partita ---------- */
function newGame(seed){
  seed=String(seed||'AAAA').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)||'AAAA';
  W=new World(seed);chunkCache.clear();mapTiles.clear();sprCache.clear();
  const s0=W.site(0,0),C=W.city(s0);
  G={seed,t:0,clock:8*60,day:0,money:6000,xp:0,level:1,truck:W.starterTruck(),x:s0.x,y:s0.y,th:C.theta,v:0,steer:0,phi:C.theta,
    trailer:{type:'furgone',cargo:null,hue:null},job:null,taken:{},done:0,disc:{},explored:{},visited:{},km:0,gps:null,cruise:0,lights:true,sold:{},
    stats:{earned:0,spent:0,crashes:0,delivered:0,fines:0,disc:0},hornT:0,twT:0,fineT:0,speedT:0,sf:null,menu:null,paused:false,zone:'',lastSave:0};
  G.explored=G.explored||{};markExplored();
  traffic.length=0;
  return G;
}
function saveKey(seed){return 'camion.save.'+seed;}
function saveGame(silent){
  if(!G)return;
  const T=G.truck;
  const d={v:1,seed:G.seed,t:G.t,clock:G.clock,day:G.day,money:G.money,xp:G.xp,x:G.x,y:G.y,th:G.th,phi:G.phi,trailer:G.trailer,job:G.job,taken:G.taken,done:G.done,disc:G.disc,explored:G.explored,visited:G.visited,km:G.km,gps:G.gps&&{target:G.gps.target},cruise:0,sold:G.sold,stats:G.stats,
    truck:{mid:T.model.id,hue:T.hue,accent:T.accent,dmg:T.dmg,fuel:T.fuel,up:T.up,odo:T.odo},when:Date.now()};
  try{localStorage.setItem(saveKey(G.seed),JSON.stringify(d));localStorage.setItem('camion.last',G.seed);if(!silent)toast('Partita salvata');G.lastSave=G.t;}catch(e){if(!silent)toast('Impossibile salvare');}
}
function loadGame(seed){
  let raw;try{raw=localStorage.getItem(saveKey(seed));}catch(e){}
  if(!raw)return false;
  let d;try{d=JSON.parse(raw);}catch(e){return false;}
  newGame(seed);
  const m=W.models.find(x=>x.id===d.truck.mid)||W.models[0];
  Object.assign(G,{t:d.t,clock:d.clock,day:d.day,money:d.money,xp:d.xp,level:lvlOf(d.xp),x:d.x,y:d.y,th:d.th,phi:d.phi,trailer:d.trailer,job:d.job,taken:d.taken||{},done:d.done||0,disc:d.disc||{},explored:d.explored||{},visited:d.visited||{},km:d.km||0,sold:d.sold||{},stats:Object.assign(G.stats,d.stats||{})});
  G.truck={model:m,hue:d.truck.hue,accent:d.truck.accent,dmg:d.truck.dmg,fuel:d.truck.fuel,up:d.truck.up,odo:d.truck.odo};
  if(d.gps&&d.gps.target){G.gps={target:d.gps.target,path:null,len:0,t:-99};}
  if(G.job&&!G.gps)setGps(destTarget(G.job));
  return true;
}
function listSaves(){const o=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('camion.save.')){const d=JSON.parse(localStorage.getItem(k));o.push({seed:d.seed,money:d.money,level:lvlOf(d.xp),day:d.day,when:d.when});}}}catch(e){}return o.sort((a,b)=>b.when-a.when);}

/* ---------- superfici ---------- */
const BSURF={[B_WATER]:{n:'acqua',mu:.1,crr:.4},[B_SAND]:{n:'sabbia',mu:.5,crr:.085},[B_PLAIN]:{n:'erba',mu:.55,crr:.055},[B_FOREST]:{n:'bosco',mu:.5,crr:.065},[B_DESERT]:{n:'sabbia',mu:.5,crr:.08},[B_STEPPE]:{n:'steppa',mu:.58,crr:.06},[B_ROCK]:{n:'roccia',mu:.62,crr:.05},[B_SNOW]:{n:'neve',mu:.3,crr:.075}};
function cityPos(x,y){
  const s=W.siteNear(x,y,0);if(!s)return null;
  const d=Math.hypot(x-s.x,y-s.y);if(d>s.r*.98)return null;
  if(!s.size)return{s,street:false,lot:false,out:true};
  const C=W.city(s),cs=Math.cos(C.theta),sn=Math.sin(C.theta),dx=x-s.x,dy=y-s.y,u=dx*cs+dy*sn,v=-dx*sn+dy*cs,sp=C.sp;
  const ku=Math.round(u/sp),kv=Math.round(v/sp);
  const onU=Math.abs(u-ku*sp)<(ku%4===0?C.sw*.62:C.sw/2),onV=Math.abs(v-kv*sp)<(kv%4===0?C.sw*.62:C.sw/2);
  return{s,street:onU||onV,lot:true};
}
function surfaceAt(x,y){
  const wx=G?weather.wet:0;
  const q=W.roadQuery(x,y,14);
  if(q&&q.d<q.road.width/2+.4){return{k:'road',mu:(q.road.kind==='sterrata'?.62:.88)*(1-.32*wx),crr:q.road.kind==='sterrata'?.025:.007,limit:q.road.limit,road:q};}
  const cp=cityPos(x,y);
  if(cp){
    if(cp.out)return{k:'dirt',mu:.65*(1-.3*wx),crr:.03,limit:30,city:cp.s};
    return{k:cp.street?'road':'lot',mu:(cp.street?.88:.8)*(1-.32*wx),crr:cp.street?.008:.014,limit:cp.street?50:20,city:cp.s,q};
  }
  const e=W.elev(x,y),b=W.biomeAt(x,y,e),bs=BSURF[b];
  if(b===B_WATER)return{k:'water',mu:.1,crr:.4,limit:0,b};
  return{k:'off',mu:bs.mu*(1-.3*wx-(b===B_SNOW?.0:0)),crr:bs.crr,limit:0,b,name:bs.n,q};
}

/* ---------- meteo e tempo ---------- */
const weather={rain:0,snow:0,fog:0,wet:0,night:0,hour:8};
function updateWeather(dt){
  const t=G.t;
  const nW=fbm(W.n^91,t/260,3.1,2),nF=fbm(W.n^92,t/340,7.7,2),m=W.moist(G.x,G.y);
  let p=sstep(.56,.74,nW+(m-.5)*.45);
  const tt=W.temp(G.x,G.y,W.elev(G.x,G.y));
  const cold=tt<.3;
  weather.rain+=((cold?0:p)-weather.rain)*Math.min(1,dt*.5);weather.snow+=((cold?p:0)-weather.snow)*Math.min(1,dt*.5);
  weather.fog+=(sstep(.66,.84,nF)*.85-weather.fog)*Math.min(1,dt*.3);
  weather.wet+=(Math.max(weather.rain,weather.snow*.8)-weather.wet)*Math.min(1,dt*.15);
  const h=(G.clock/60)%24;weather.hour=h;
  weather.night=1-sstep(5,7.2,h)*(1-sstep(18.6,21,h));
}
function fmtClock(){const m=Math.floor(G.clock)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}

/* ---------- audio ---------- */
const AU={ctx:null,on:true};
function audioInit(){
  if(AU.ctx||!window.AudioContext&&!window.webkitAudioContext)return;
  try{
    const c=AU.ctx=new (window.AudioContext||window.webkitAudioContext)();
    AU.master=c.createGain();AU.master.gain.value=.5;AU.master.connect(c.destination);
    AU.o1=c.createOscillator();AU.o1.type='sawtooth';AU.o2=c.createOscillator();AU.o2.type='square';
    AU.f=c.createBiquadFilter();AU.f.type='lowpass';AU.f.frequency.value=400;AU.g=c.createGain();AU.g.gain.value=0;
    AU.o1.connect(AU.f);AU.o2.connect(AU.f);AU.f.connect(AU.g);AU.g.connect(AU.master);AU.o1.start();AU.o2.start();
    const buf=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    AU.noise=c.createBufferSource();AU.noise.buffer=buf;AU.noise.loop=true;AU.nf=c.createBiquadFilter();AU.nf.type='bandpass';AU.nf.frequency.value=900;AU.ng=c.createGain();AU.ng.gain.value=0;
    AU.noise.connect(AU.nf);AU.nf.connect(AU.ng);AU.ng.connect(AU.master);AU.noise.start();
  }catch(e){AU.ctx=null;}
}
function audioUpdate(rpm,thr,v){
  if(!AU.ctx||!AU.on)return;
  const t=AU.ctx.currentTime,f=rpm/60;
  AU.o1.frequency.setTargetAtTime(f*1.0,t,.05);AU.o2.frequency.setTargetAtTime(f*.5,t,.05);
  AU.f.frequency.setTargetAtTime(260+thr*700+rpm*.18,t,.08);
  AU.g.gain.setTargetAtTime(G.truck.fuel>0?.05+thr*.05:0,t,.08);
  AU.ng.gain.setTargetAtTime(Math.min(.12,Math.abs(v)/25*.06+weather.rain*.07),t,.2);AU.nf.frequency.setTargetAtTime(500+Math.abs(v)*40,t,.2);
}
function blip(freq,dur,type,vol,slide){
  if(!AU.ctx||!AU.on)return;const c=AU.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq*slide),t+dur);
  g.gain.setValueAtTime(vol||.15,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(AU.master);o.start(t);o.stop(t+dur+.02);
}
function horn(){if(!AU.ctx||!AU.on)return;blip(370,.7,'square',.12);blip(440,.7,'square',.1);}
function thump(a){blip(90,.35,'sawtooth',Math.min(.4,.1+a*.02),.4);}
function chime(){[660,880,1320].forEach((f,i)=>setTimeout(()=>blip(f,.35,'sine',.14),i*110));}

/* ---------- GPS ---------- */
function destTarget(job){
  const s=W._site.get(job.to);if(!s)return null;const C=W.city(s),p=C.pois.find(q=>q.kind==='company'&&q.comp.id===job.toComp);
  return p?{x:p.x,y:p.y,label:p.comp.name+' · '+s.name,site:s.id,job:true}:{x:s.x,y:s.y,label:s.name,site:s.id,job:true};
}
function setGps(t){G.gps=t?{target:t,path:null,len:0,t:-99}:null;if(t)planPath(true);}
function localOf(C,x,y){const cs=Math.cos(C.theta),sn=Math.sin(C.theta),dx=x-C.x,dy=y-C.y;return[dx*cs+dy*sn,-dx*sn+dy*cs];}
function worldOf(C,u,v){const cs=Math.cos(C.theta),sn=Math.sin(C.theta);return[C.x+u*cs-v*sn,C.y+u*sn+v*cs];}
/* percorso lungo la griglia stradale di una città: verso un POI oppure verso il centro */
function gridPath(C,x,y,poi){
  const sp=C.sp;if(!sp)return poi?[[poi.x,poi.y]]:[[C.x,C.y]];
  const[u0,v0]=localOf(C,x,y),iu=Math.round(u0/sp),iv=Math.round(v0/sp),du=Math.abs(u0-iu*sp),dv=Math.abs(v0-iv*sp),P=[];
  P.push(du<dv?[iu*sp,v0]:[u0,iv*sp]);P.push([iu*sp,iv*sp]);const cu=iu*sp,cv=iv*sp;
  if(poi&&poi.blk){const b=poi.blk;
    if(b.dx!==0){const ku=(b.i+(b.dx>0?1:0))*sp;P.push([ku,cv]);P.push([ku,b.v]);}
    else{const kv=(b.j+(b.dy>0?1:0))*sp;P.push([cu,kv]);P.push([b.u,kv]);}
    P.push(localOf(C,poi.x,poi.y));
  }else{P.push([0,cv]);P.push([0,0]);}
  return P.map(([u,v])=>worldOf(C,u,v));
}
function planPath(force){
  const g=G.gps;if(!g)return;const tg=g.target;
  if(!force&&G.t-g.t<2.2)return;g.t=G.t;
  const ts=W._site.get(tg.site)||W.siteAt(tg.x,tg.y);
  const tC=ts&&ts.size?W.city(ts):null,tPoi=tC&&tC.pois.find(p=>Math.hypot(p.x-tg.x,p.y-tg.y)<1.5);
  const cp=cityPos(G.x,G.y),inSite=cp&&cp.s&&cp.s.size?cp.s:null;
  let pts=[[G.x,G.y]];
  const orient=(rd,from)=>rd.a===from?rd.pts.slice():rd.pts.slice().reverse();
  const addRoute=(from,r)=>{let cur=from;for(const r2 of r.roads){for(const p of orient(r2,cur))pts.push(p);cur=r2.a===cur?r2.b:r2.a;}};
  let done=false;
  if(inSite&&ts&&inSite.id===ts.id){for(const p of gridPath(tC,G.x,G.y,tPoi||{x:tg.x,y:tg.y}))pts.push(p);done=true;}
  else if(inSite&&ts){const r=W.route(inSite,ts);if(r){for(const p of gridPath(W.city(inSite),G.x,G.y,null))pts.push(p);pts.push([inSite.x,inSite.y]);addRoute(inSite,r);pts.push([ts.x,ts.y]);}}
  else{
    const q=W.roadQuery(G.x,G.y,500);
    if(q&&ts){
      const rd=q.road,i=q.i,toB=rd.len-(rd.cum[i]+Math.hypot(q.px-rd.pts[i][0],q.py-rd.pts[i][1])),toA=rd.len-toB;
      const ra=W.route(rd.a,ts),rb=W.route(rd.b,ts),ca=ra?toA+ra.len:1e18,cb=rb?toB+rb.len:1e18;
      if(ca<1e17||cb<1e17){const viaA=ca<cb;pts.push([q.px,q.py]);
        if(viaA){for(let k=i;k>=0;k--)pts.push(rd.pts[k]);}else{for(let k=i+1;k<rd.pts.length;k++)pts.push(rd.pts[k]);}
        addRoute(viaA?rd.a:rd.b,viaA?ra:rb);pts.push([ts.x,ts.y]);}
    }else if(ts){const near=W.siteAt(G.x,G.y);if(near&&near.exists&&near.id!==ts.id){const r=W.route(near,ts);if(r){pts.push([near.x,near.y]);addRoute(near,r);pts.push([ts.x,ts.y]);}}}
  }
  if(!done){if(tC){for(const p of gridPath(tC,ts.x,ts.y,tPoi||{x:tg.x,y:tg.y}))pts.push(p);}pts.push([tg.x,tg.y]);}
  const out=[pts[0]];for(let k=1;k<pts.length;k++){const a=out[out.length-1];if(Math.hypot(pts[k][0]-a[0],pts[k][1]-a[1])>3)out.push(pts[k]);}
  let len=0;const cum=[0];for(let k=1;k<out.length;k++){len+=Math.hypot(out[k][0]-out[k-1][0],out[k][1]-out[k-1][1]);cum.push(len);}
  g.path=out;g.cum=cum;g.len=len;
}
/* punto del percorso a distanza s dal punto più vicino al camion */
function pathAhead(dist){
  const g=G.gps;if(!g||!g.path||g.path.length<2)return null;
  let bi=0,bd=1e18;for(let i=0;i<g.path.length-1;i++){const a=g.path[i],b=g.path[i+1],vx=b[0]-a[0],vy=b[1]-a[1];let t=((G.x-a[0])*vx+(G.y-a[1])*vy)/(vx*vx+vy*vy||1);t=clamp(t,0,1);const d=Math.hypot(G.x-a[0]-vx*t,G.y-a[1]-vy*t);if(d<bd){bd=d;bi=i;}}
  const a=g.path[bi],b=g.path[bi+1],seg=Math.hypot(b[0]-a[0],b[1]-a[1])||1;let t0=clamp(((G.x-a[0])*(b[0]-a[0])+(G.y-a[1])*(b[1]-a[1]))/(seg*seg),0,1);
  let s=g.cum[bi]+t0*seg+dist;if(s>=g.len)return{x:g.path[g.path.length-1][0],y:g.path[g.path.length-1][1],off:bd,rem:0,end:true};
  let k=bi;while(k<g.path.length-2&&g.cum[k+1]<s)k++;
  const p=g.path[k],n=g.path[k+1],f=(s-g.cum[k])/(g.cum[k+1]-g.cum[k]||1);
  return{x:p[0]+(n[0]-p[0])*f,y:p[1]+(n[1]-p[1])*f,off:bd,rem:g.len-(g.cum[bi]+t0*seg)};
}

/* ---------- punti di interesse ---------- */
function nearbyPois(x,y,rad){
  const out=[];const cx=Math.round(x/CELL),cy=Math.round(y/CELL);
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const s=W.site(cx+i,cy+j);if(!s.exists||Math.hypot(x-s.x,y-s.y)>s.r+rad+40)continue;const C=W.city(s);for(const p of C.pois){if(Math.hypot(x-p.x,y-p.y)<rad)out.push({p,s});}}
  return out;
}
function currentPoi(){
  const l=nearbyPois(G.x,G.y,22);let best=null,bd=1e9;
  for(const o of l){const d=Math.hypot(G.x-o.p.x,G.y-o.p.y);if(d<o.p.r&&d<bd){bd=d;best=o;}}
  return best;
}

/* ---------- lavori ---------- */
function xpForJob(j){return Math.round(j.dist/55+j.tons*2.2);}
function acceptJob(j){
  if(G.job)return 'Hai già un incarico in corso';
  const cg=CARGO_BY[j.cargo];if(G.level<cg.lvl)return 'Serve il livello '+cg.lvl;
  if(j.tons>G.truck.model.cap)return 'Il tuo camion porta al massimo '+G.truck.model.cap+' t';
  const fromC=W.companiesOf(W._site.get(j.from)).find(c=>c.id===j.fromComp);
  G.job=Object.assign({},j,{start:G.t,deadline:G.t+j.secs,dmg:0,fromName:fromC.name,fromHue:fromC.hue});G.taken[j.id]=1;
  G.trailer={type:cg.tr,cargo:cg.id,hue:fromC.hue};
  setGps(destTarget(G.job));saveGame(true);blip(520,.15,'triangle',.15);blip(780,.2,'triangle',.15);
  return null;
}
function jobEarn(job){
  const cg=CARGO_BY[job.cargo],late=Math.max(0,G.t-job.deadline),left=Math.max(0,job.deadline-G.t);
  const dmgPen=clamp(job.dmg*cg.fr*1.8,0,.75),latePen=late>0?clamp(late/job.secs*.6+.12,.12,.55):0,bonus=left>job.secs*.3?.08:0;
  const pay=Math.round(job.pay*(1-dmgPen)*(1-latePen)*(1+bonus));
  return{pay,dmgPen,latePen,bonus,late,xp:Math.round(xpForJob(job)*(1-dmgPen*.5))};
}
function deliverJob(){
  const j=G.job;if(!j)return null;const e=jobEarn(j);
  G.money+=e.pay;G.xp+=e.xp;G.stats.earned+=e.pay;G.stats.delivered++;G.done++;
  const L=lvlOf(G.xp);let up=false;if(L>G.level){G.level=L;up=true;}
  G.job=null;G.trailer={type:'furgone',cargo:null,hue:null};G.gps=null;saveGame(true);chime();
  return Object.assign({up,level:G.level,job:j},e);
}
function cancelJob(){if(!G.job)return;const fee=Math.min(G.money,Math.round(G.job.pay*.1));G.money-=fee;G.stats.spent+=fee;G.job=null;G.trailer={type:'furgone',cargo:null,hue:null};G.gps=null;return fee;}

/* ---------- scoperte e mappa esplorata ---------- */
function markExplored(){
  const cx=Math.round(G.x/CELL),cy=Math.round(G.y/CELL);
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const k=(cx+i)+','+(cy+j);const mx=(cx+i)*CELL,my=(cy+j)*CELL;if(Math.hypot(G.x-mx,G.y-my)<CELL*.95)G.explored[k]=1;}
}
function checkDiscoveries(){
  const bi=Math.floor(G.x/512),bj=Math.floor(G.y/512);
  for(let j=bj-1;j<=bj+1;j++)for(let i=bi-1;i<=bi+1;i++){const lm=W.landmarkIn(i,j);if(!lm||G.disc[lm.id])continue;if(Math.hypot(G.x-lm.x,G.y-lm.y)<32){G.disc[lm.id]=1;G.money+=lm.reward;G.xp+=lm.xp;G.stats.disc++;G.stats.earned+=lm.reward;const L=lvlOf(G.xp);if(L>G.level){G.level=L;toast('Livello '+L+'!');}
      chime();return lm;}}
  return null;
}
function isWild(x,y){return !W.isCore(x,y);}

/* ---------- fisica ---------- */
function inputs(){
  const up=keys.ArrowUp||keys.w||touch.gas,dn=keys.ArrowDown||keys.s||touch.brk;
  const st=((keys.ArrowRight||keys.d||touch.r)?1:0)-((keys.ArrowLeft||keys.a||touch.l)?1:0);
  return{up:!!up,dn:!!dn,st,hb:!!keys[' ']};
}
function circlesNow(){
  const c=Math.cos(G.th),s=Math.sin(G.th),cp=Math.cos(G.phi),sp=Math.sin(G.phi),o=[];
  for(const d of[4.9,2.8,.6])o.push([G.x+c*d,G.y+s*d,1.32,0]);
  for(const d of[.2,3.2,6.2,9.2,11.6])o.push([G.x-cp*d,G.y-sp*d,1.3,1]);
  return o;
}
function hitDamage(vn){
  if(vn<2.2||G.t-(G.hitT||-9)<.35)return;
  G.hitT=G.t;const T=G.truck,sev=vn*vn;
  T.dmg=clamp(T.dmg+sev*.0009,0,1);G.stats.crashes++;
  if(G.job)G.job.dmg=clamp(G.job.dmg+sev*.0016*(.4+(CARGO_BY[G.job.cargo].fr)),0,1);
  thump(vn);if(vn>4)toast('Impatto! Danni al camion '+Math.round(T.dmg*100)+'%',1600);
}
function collideSolids(){
  let any=false;
  const cs=circlesNow();
  for(const ci of cs){
    const [cx,cy,r]=ci;const list=W.solidsIn(cx,cy,r+2);
    for(const o of list){
      const dx=cx-o.x,dy=cy-o.y,lx=dx*o.c+dy*o.s,ly=-dx*o.s+dy*o.c;
      const px=clamp(lx,-o.hw,o.hw),py=clamp(ly,-o.hh,o.hh);let nx=lx-px,ny=ly-py,dist=Math.hypot(nx,ny);
      if(dist>=r)continue;
      let depth;
      if(dist<1e-4){const ex=o.hw-Math.abs(lx),ey=o.hh-Math.abs(ly);if(ex<ey){nx=Math.sign(lx)||1;ny=0;depth=ex+r;}else{nx=0;ny=Math.sign(ly)||1;depth=ey+r;}}
      else{nx/=dist;ny/=dist;depth=r-dist;}
      const wx=nx*o.c-ny*o.s,wy=nx*o.s+ny*o.c;
      G.x+=wx*depth;G.y+=wy*depth;
      const vx=Math.cos(G.th)*G.v,vy=Math.sin(G.th)*G.v,vn=vx*wx+vy*wy;
      if(vn<0){hitDamage(-vn);const k=1.12;const nvx=vx-vn*wx*k,nvy=vy-vn*wy*k;G.v=nvx*Math.cos(G.th)+nvy*Math.sin(G.th);}
      any=true;
    }
  }
  return any;
}
function step(dt){
  const T=G.truck,m=T.model,I=inputs();
  const cargoM=G.job?G.job.tons*1000:0,mass=m.mass+6500+cargoM+T.fuel*.84;
  const sf=G.sf=surfaceAt(G.x,G.y);
  if(sf.k==='road'||sf.k==='lot')G.lastRoad={x:G.x,y:G.y};
  let thr=0,brk=0;
  if(I.up){if(G.v>-.6)thr=1;else brk=1;}
  if(I.dn){if(G.v>.6)brk=1;else thr=-1;}
  if(G.cruise>0){if(I.dn||I.hb||sf.k==='water'){G.cruise=0;}else if(!I.up){const e=G.cruise-G.v;thr=clamp(e*.6,0,1);if(e<-1.5)brk=clamp(-e*.12,0,.4);}}
  const eng=T.fuel>0?1:0,P=m.hp*745.7*(1+.08*T.up.eng)*(1-T.dmg*.4)*eng;
  const vmaxMs=Math.min(m.topKmh/3.6,27.8),va=Math.abs(G.v);
  let F=0;
  if(thr>0){F=Math.min(P*.82/Math.max(va,1.2),P/9)*thr;if(G.v>vmaxMs)F=0;}
  else if(thr<0){F=-Math.min(P*.6/Math.max(va,1.2),P/8);if(-G.v>4.4)F=0;}
  const fTrac=sf.mu*.62*mass*GRAV;F=clamp(F,-fTrac,fTrac);
  // pendenza
  const ex=Math.cos(G.th)*12,ey=Math.sin(G.th)*12;
  let gr=clamp((W.elev(G.x+ex,G.y+ey)-W.elev(G.x,G.y))/12*260,-.08,.08);if(sf.k==='road')gr*=.6;
  const CdA=5.2*(1-.06*T.up.aero),sg=Math.sign(G.v);
  const drag=.5*1.2*CdA*G.v*Math.abs(G.v);
  let fr=sf.crr*mass*GRAV+(brk*5.2*Math.min(1,sf.mu/.85)+(I.hb?2.6:0))*mass+(thr===0&&brk===0?mass*.22:0);
  if(sf.k==='off'&&sf.b===B_FOREST)fr+=mass*.3;
  if(sf.k==='water'){fr+=mass*5;G.v=clamp(G.v,-2.5,2.5);}
  let v1=G.v+(F-drag-mass*GRAV*gr)/mass*dt;
  const dvf=fr/mass*dt;
  if(Math.abs(v1)>dvf)v1-=Math.sign(v1)*dvf;else v1=0;
  if(thr>0&&G.v>vmaxMs)v1=Math.min(v1,G.v);
  G.v=v1;
  // sterzo
  const tgt=I.st,rate=Math.abs(tgt)>0?(sg*G.steer*tgt<0?5:2.6):4.2;
  G.steer+=clamp(tgt-G.steer,-rate*dt,rate*dt);
  const dmax=.62/(1+Math.pow(Math.abs(G.v)/11,2)),delta=G.steer*dmax;
  let kappa=Math.tan(delta)/WB;
  const alat=sf.mu*(1+.06*T.up.tyre)*GRAV*.8;G.slip=0;
  if(Math.abs(G.v)>1&&Math.abs(kappa)*G.v*G.v>alat){kappa=Math.sign(kappa)*alat/(G.v*G.v);G.slip=1;G.v*=1-.25*dt;}
  G.th+=G.v*kappa*dt;
  G.x+=Math.cos(G.th)*G.v*dt;G.y+=Math.sin(G.th)*G.v*dt;
  // rimorchio
  let diff=angNorm(G.th-G.phi);G.phi+=G.v*Math.sin(diff)/Lt*dt;diff=angNorm(G.th-G.phi);
  if(Math.abs(diff)>1.38){G.phi=G.th-Math.sign(diff)*1.38;if(Math.abs(G.v)>1.5){G.v*=.9;hitDamage(Math.abs(G.v)*.4);}}
  collideSolids();
  // carburante
  const fl=(Math.max(0,F)*Math.abs(G.v)/(.38*36e6)+.0005)*FUEL_K*m.eff*dt;T.fuel=Math.max(0,T.fuel-fl);
  T.odo+=Math.abs(G.v)*dt;G.km+=Math.abs(G.v)*dt;
  // acqua
  if(sf.k==='water'){G.twT+=dt;if(G.twT>4)tow('Il camion è finito in acqua!');}else G.twT=0;
  if(T.fuel<=0&&Math.abs(G.v)<.3){G.noFuelT=(G.noFuelT||0)+dt;if(G.noFuelT>1&&!G.noFuelMsg){G.noFuelMsg=1;toast('Carburante esaurito! Apri il menu (Esc) per il soccorso',4000);}}else{G.noFuelT=0;if(T.fuel>0)G.noFuelMsg=0;}
  // multe
  const kmh=Math.abs(G.v)*3.6,limit=sf.limit||0;
  if(!isWild(G.x,G.y)&&limit>0&&kmh>limit+14){G.speedT+=dt;if(G.speedT>1.3&&G.t-G.fineT>14){const fine=Math.round(90+(kmh-limit)*3);G.money=Math.max(0,G.money-fine);G.stats.fines+=fine;G.fineT=G.t;toast('📸 Autovelox! Multa di € '+fine+' ('+Math.round(kmh)+' km/h in zona '+limit+')',3200);}}else G.speedT=Math.max(0,G.speedT-dt);
  // tempo
  G.t+=dt;G.clock+=dt*(1440/DAY_SECS);if(G.clock>=1440){G.clock-=1440;G.day++;}
  // rpm / marcia
  const topv=vmaxMs,gear=clamp(Math.floor(va/topv*12)+1,1,12),inG=(va/topv*12)%1;
  G.gear=va<.3?0:gear;G.rpm=700+inG*1100+Math.abs(thr)*250+(thr===0?0:0);
  return{thr,brk};
}
function tow(why){
  const q=W.roadQuery(G.x,G.y,8000)||null;const fee=300;G.money=Math.max(0,G.money-fee);G.stats.spent+=fee;
  if(q){const rd=q.road;G.x=q.px;G.y=q.py;G.th=Math.atan2(q.dy,q.dx);G.phi=G.th;}else if(G.lastRoad){G.x=G.lastRoad.x;G.y=G.lastRoad.y;G.phi=G.th;}
  G.v=0;G.twT=0;G.truck.dmg=clamp(G.truck.dmg+.03,0,1);toast(why+' Soccorso stradale: € '+fee,3200);
}
function rescueFuel(){
  // porta alla pompa più vicina e fa il pieno parziale
  let best=null,bd=1e18;const cx=Math.round(G.x/CELL),cy=Math.round(G.y/CELL);
  for(const s of W.sitesAround(cx,cy,3)){const C=W.city(s);for(const p of C.pois)if(p.kind==='gas'){const d=Math.hypot(G.x-p.x,G.y-p.y);if(d<bd){bd=d;best=p;}}}
  if(!best){toast('Nessun distributore nelle vicinanze…');return false;}
  const fee=Math.min(G.money,500+Math.round(bd/20));G.money-=fee;G.stats.spent+=fee;G.x=best.x;G.y=best.y+14;G.v=0;G.truck.fuel=Math.max(G.truck.fuel,30);G.noFuelMsg=0;toast('Soccorso carburante: € '+fee);return true;
}

/* ---------- traffico ---------- */
const traffic=[];
function roadAt(rd,s){ // punto e direzione alla distanza s lungo la strada
  s=clamp(s,0,rd.len);let lo=0,hi=rd.cum.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(rd.cum[mid]<=s)lo=mid;else hi=mid;}
  const a=rd.pts[lo],b=rd.pts[hi],f=(s-rd.cum[lo])/((rd.cum[hi]-rd.cum[lo])||1);
  return{x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f,ang:Math.atan2(b[1]-a[1],b[0]-a[0])};
}
function carPose(c){const p=roadAt(c.rd,c.s),a=c.dir>0?p.ang:p.ang+Math.PI,off=c.rd.width*.25;return{x:p.x-Math.sin(a)*off,y:p.y+Math.cos(a)*off,ang:a};}
function updateTraffic(dt){
  const cx=Math.round(G.x/CELL),cy=Math.round(G.y/CELL),roads=W.nearRoads(cx,cy).filter(r=>r.kind!=='sterrata'||Math.random()<.2);
  G.trT=(G.trT||0)-dt;
  const maxN=isWild(G.x,G.y)?3:14;
  if(G.trT<=0&&traffic.length<maxN&&roads.length){
    G.trT=.15;const rd=roads[Math.floor(Math.random()*roads.length)];
    let bi=0,bd=1e18;for(let k=0;k<rd.pts.length;k++){const d=Math.hypot(rd.pts[k][0]-G.x,rd.pts[k][1]-G.y);if(d<bd){bd=d;bi=k;}}
    const dir=Math.random()<.5?1:-1,s=rd.cum[bi]+(Math.random()<.5?-1:1)*(170+Math.random()*330);
    if(bd<=420&&s>=0&&s<=rd.len){
    const p=roadAt(rd,s),d=Math.hypot(p.x-G.x,p.y-G.y);
    if(d>170&&d<520&&!traffic.some(c=>{const q=carPose(c);return Math.hypot(q.x-p.x,q.y-p.y)<40;})){
      const q=Math.random(),kind=q<.2?'truck':q<.35?'van':'car';
      traffic.push({rd,s,dir,v:0,vmax:rd.limit/3.6*(.65+Math.random()*.3)*(kind==='truck'?.85:1),hue:Math.floor(Math.random()*360),kind,stop:0,id:Math.random()});
    }
    }
  }
  const poses=traffic.map(carPose);
  for(let i=traffic.length-1;i>=0;i--){
    const c=traffic[i],me=poses[i];
    let tv=c.vmax;
    for(let j=0;j<traffic.length;j++){if(i===j)continue;const o=traffic[j];if(o.rd!==c.rd||o.dir!==c.dir)continue;const gap=(o.s-c.s)*c.dir;if(gap>0&&gap<34){tv=Math.min(tv,Math.max(0,o.v-(34-gap)*.2));if(gap<9)tv=0;}}
    // ostacolo giocatore
    const fx=Math.cos(me.ang),fy=Math.sin(me.ang);
    for(const ci of playerCircles){const dx=ci[0]-me.x,dy=ci[1]-me.y,fw=dx*fx+dy*fy,lt=Math.abs(-dx*fy+dy*fx);if(fw>0&&fw<26&&lt<3){tv=Math.min(tv,Math.max(0,(fw-8)*.4));}}
    if(c.stop>0){c.stop-=dt;tv=0;}
    c.v+=clamp(tv-c.v,-9*dt,2.2*dt);c.s+=c.dir*c.v*dt;
    const d=Math.hypot(me.x-G.x,me.y-G.y);
    if(c.s<0||c.s>c.rd.len||d>640)traffic.splice(i,1);
  }
  // collisioni col giocatore
  for(let i=0;i<traffic.length;i++){
    const c=traffic[i],p=carPose(i<poses.length?traffic[i]:c),len=c.kind==='truck'?3.2:c.kind==='van'?2.2:1.9;
    const cs=Math.cos(p.ang),sn=Math.sin(p.ang);
    for(const ci of playerCircles){
      for(const off of[-len*.5,len*.5]){
        const ox=p.x+cs*off,oy=p.y+sn*off,dx=ci[0]-ox,dy=ci[1]-oy,d=Math.hypot(dx,dy),r=ci[2]+1.0;
        if(d<r&&d>.01){const nx=dx/d,ny=dy/d;G.x+=nx*(r-d)*.6;G.y+=ny*(r-d)*.6;const vn=Math.max(0,-(Math.cos(G.th)*G.v*nx+Math.sin(G.th)*G.v*ny)+c.v*.5);if(vn>1){hitDamage(vn*.8);G.v*=.8;c.stop=2.5;c.v=0;}}
      }
    }
  }
}
let playerCircles=[];

/* ---------- autopilota (solo per prove / prove di percorso) ---------- */
function autopilot(dt){
  const gp=G.gps;if(!gp||!gp.path)return;
  const look=clamp(Math.abs(G.v)*.8+9,10,38),pt=pathAhead(look),p2=pathAhead(look+22);if(!pt)return;
  const want=Math.atan2(pt.y-G.y,pt.x-G.x),err=angNorm(want-G.th);
  keys.a=err<-.04;keys.d=err>.04;
  const lim=(G.sf&&G.sf.limit)||50;let tv=lim/3.6*.95;
  if(p2){const a1=Math.atan2(pt.y-G.y,pt.x-G.x),a2=Math.atan2(p2.y-pt.y,p2.x-pt.x),turn=Math.abs(angNorm(a2-a1));if(turn>.35)tv=Math.min(tv,9);if(turn>.8)tv=Math.min(tv,5.5);}
  if(Math.abs(err)>.5)tv=Math.min(tv,5);
  if(pt.rem!==undefined&&pt.rem<50)tv=Math.min(tv,4);
  keys.w=G.v<tv;keys.s=G.v>tv+1.5;
}
