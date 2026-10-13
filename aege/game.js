'use strict';
/* AEGE · motore di gioco, interfaccia, audio */
const cv=$('#cv'),ctx=cv.getContext('2d'),mini=$('#mini'),mctx=mini.getContext('2d');
let W=0,H=0,DPR=1;
const MOB=matchMedia('(pointer:coarse)').matches||innerWidth<700;
if(MOB)document.body.classList.add('mob');
const SHIFT=1200,REACH=5.4,ZOOM0=1;
let M=null,T=null,S=null,baseMap=null,zoomMul=1;
const K={up:0,down:0,left:0,right:0,act:0};
const cam={x:0,y:0,sc:8};
function resize(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);}
addEventListener('resize',resize);resize();

/* ---------- audio ---------- */
const A={ac:null,on:true,eng:null,
  init(){if(this.ac)return;try{const ac=this.ac=new(window.AudioContext||window.webkitAudioContext)();
    const m=this.master=ac.createGain();m.gain.value=.5;m.connect(ac.destination);
    const nb=ac.createBuffer(1,ac.sampleRate,ac.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.noise=nb;
    const o1=ac.createOscillator(),o2=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain();
    o1.type='sawtooth';o2.type='square';f.type='lowpass';f.frequency.value=300;g.gain.value=0;
    o1.connect(f);o2.connect(f);f.connect(g);g.connect(m);o1.start();o2.start();this.eng={o1,o2,f,g};
  }catch(e){this.ac=null;}},
  engine(v,thr){if(!this.ac||!this.eng)return;const t=this.ac.currentTime,e=this.eng,a=Math.abs(v);
    const fr=clamp(30+a*3.4+thr*7,20,120);e.o1.frequency.setTargetAtTime(fr,t,.08);e.o2.frequency.setTargetAtTime(fr*.5,t,.08);
    e.f.frequency.setTargetAtTime(clamp(240+a*30+thr*160,100,1200),t,.1);e.g.gain.setTargetAtTime(this.on?clamp(.05+a*.004+thr*.03,0,.16):0,t,.1);},
  burst(dur,fc,q,gain,type,sweep){if(!this.ac||!this.on)return;const ac=this.ac,t=ac.currentTime,s=ac.createBufferSource();s.buffer=this.noise;
    const f=ac.createBiquadFilter();f.type=type||'bandpass';f.frequency.setValueAtTime(fc,t);if(sweep)f.frequency.exponentialRampToValueAtTime(clamp(sweep,40,8000),t+dur);f.Q.value=q;
    const g=ac.createGain();g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0005,t+dur);s.connect(f);f.connect(g);g.connect(this.master);s.start(t,Math.random()*.5,dur);},
  tone(fr,dur,type,gain,fr2){if(!this.ac||!this.on)return;const ac=this.ac,t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.setValueAtTime(fr,t);if(fr2)o.frequency.exponentialRampToValueAtTime(fr2,t+dur);
    g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+.02);},
  hiss(){this.burst(.45,5200,.8,.16,'highpass');},
  lift(){this.tone(90,.6,'sawtooth',.06,140);},
  grind(){this.tone(52,.7,'sawtooth',.1,40);this.burst(.7,600,1,.12,'lowpass',200);},
  thud(){this.tone(110,.25,'sine',.35,45);this.burst(.2,900,.7,.25,'lowpass',200);},
  beep(){this.tone(1000,.18,'square',.05);},
  horn(){this.tone(330,.5,'square',.09);this.tone(415,.5,'square',.09);},
  rumble(d){this.burst(d,260,.7,.28,'lowpass',90);this.tone(60,d,'sawtooth',.06,38);},
  ding(){this.tone(880,.15,'triangle',.12);setTimeout(()=>this.tone(1318,.25,'triangle',.12),110);},
  mute(on){this.on=on;if(this.eng)this.eng.g.gain.value=0;}
};

/* ---------- utilità di gioco ---------- */
const toastEl=$('#toast');let toastT=0;
function toast(t,ms){toastEl.textContent=t;toastEl.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove('show'),ms||2200);}
const dirOf=a=>({x:Math.cos(a),y:Math.sin(a)});
function rearPt(){return{x:T.x-Math.cos(T.ang)*4.9,y:T.y-Math.sin(T.ang)*4.9};}
function surf(x,y){
  if(x>M.center.x0-2&&x<M.center.x1&&y>M.center.y0&&y<M.center.y1)return 1;
  if(Math.abs(y-M.hwy.y)<M.hwy.w/2&&x>M.hwy.a-6&&x<M.hwy.b+6)return 1;
  for(const rd of M.roads){if(rd.v){if(Math.abs(x-rd.c)<rd.w/2+.3&&y>rd.a&&y<rd.b)return 1;}else if(Math.abs(y-rd.c)<rd.w/2+.3&&x>rd.a&&x<rd.b)return 1;}
  return x>CITY_W+30?.72:.58;
}
function spawn(x,y,n,col,spd,life){for(let i=0;i<n;i++){const a=Math.random()*TAU,s=Math.random()*(spd||3);S.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:(life||.7)*(.6+Math.random()*.6),max:life||.7,col,r:.18+Math.random()*.3});}}
function floatText(x,y,txt,col){S.fx.push({x,y,vx:0,vy:-2.2,life:1.3,max:1.3,txt,col:col||'#fff'});}

/* ---------- avvio partita ---------- */
function startGame(seed,kind){
  M=genMap(seed,kind);buildMallCars(M);M.bunker={};
  T={x:M.start.x,y:M.start.y,ang:M.start.ang,v:0,steer:0};
  S={seed,kind,time:SHIFT,load:0,cap:M.cap,col:0,total:M.targets.length,delivered:0,deliveredBins:0,hits:0,hitCd:0,work:null,unl:null,gate:0,
     fx:[],hint:true,status:'play',paused:false,t:0,beepT:0,actEdge:false,score:0,pickedL:0,trips:0,startTs:performance.now(),
     drawActors:drawActors,drawFX:drawFX,distTrav:0};
  M.bins.forEach(b=>{b.done=false;b.hide=false;});
  cam.x=T.x;cam.y=T.y;
  baseMap=buildBase(M);trafficInit();
  $('#start').classList.add('hide');$('#hud').classList.remove('hide');if(MOB)$('#touch').classList.remove('hide');
  const KK=KINDS[kind];$('#hDot').style.background=KK.two?'linear-gradient(90deg,#3d8a3d 50%,#7a4a27 50%)':KK.col;$('#hKind').textContent=KK.n;
  $('#gTxt').textContent='0 / '+fmt(S.cap)+' L';
  closeModal();
  A.init();if(A.ac&&A.ac.state==='suspended')A.ac.resume();
  toast('Turno di '+KK.n.toLowerCase()+' a '+M.cityName+'. Buon lavoro, '+PLAYER_NAME+'!',3200);
  last=performance.now();
}


/* ---------- traffico ---------- */
function laneOff(k){const w=k.ax==='v'?M.wv[k.ri]:M.wh[k.ri];return(k.ax==='v'?(k.s>0?-1:1):(k.s>0?1:-1))*w/4;}
function trafficInit(){
  const r=rngFor(S.seed,'traffic'),cars=[],cols=PAL.carCol;
  for(let n=0,tries=0;n<48&&tries<400;tries++){
    const ax=r()<.5?'v':'h',nodes=ax==='v'?M.ys:M.xs,roads=ax==='v'?M.xs:M.ys;
    const ri=ri_(r,0,roads.length-1),s=r()<.5?1:-1,t=rr(r,nodes[0]+8,nodes[nodes.length-1]-8);
    let k=0;if(s>0){k=nodes.findIndex(v=>v>t);}else{for(let i=nodes.length-1;i>=0;i--)if(nodes[i]<t){k=i;break;}}
    if(k<0)continue;
    const c={ax,ri,s,t,k,lat:roads[ri],v:rr(r,5,9),vt:rr(r,6.5,10.5),col:pick(r,cols),ang:0,x:0,y:0,stopT:0,blk:0,ghost:0,brk:false,hornT:0};
    c.lat+=laneOff(c);place(c);c.ang=headOf(c);
    if(Math.hypot(c.x-T.x,c.y-T.y)<40)continue;
    if(cars.some(o=>Math.hypot(o.x-c.x,o.y-c.y)<14))continue;
    cars.push(c);n++;
  }
  S.traffic=cars;
}
const ri_=(r,a,b)=>a+Math.floor(r()*(b-a+1));
function place(c){if(c.ax==='v'){c.x=c.lat;c.y=c.t;}else{c.x=c.t;c.y=c.lat;}}
function headOf(c){return c.ax==='v'?(c.s>0?Math.PI/2:-Math.PI/2):(c.s>0?0:Math.PI);}
function angLerp(a,b,u){let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return a+d*u;}
function trafficStep(dt){
  const cars=S.traffic,nodesOf=c=>c.ax==='v'?M.ys:M.xs,roadsOf=c=>c.ax==='v'?M.xs:M.ys;
  for(const c of cars){
    c.stopT=Math.max(0,c.stopT-dt);c.hornT-=dt;
    // frenata: ostacoli davanti (altre auto, camion)
    const hx=Math.cos(c.ang),hy=Math.sin(c.ang);let stop=false,slow=c.vt;
    const probe=(ox,oy,half,wd,lead,ov)=>{const dx=ox-c.x,dy=oy-c.y,f=dx*hx+dy*hy,l=-dx*hy+dy*hx;
      if(f>0&&f<13+half&&Math.abs(l)<wd){const gap=f-half-2.2;if(gap<4)stop=true;else slow=Math.min(slow,Math.max(0,ov*.9));}};
    for(const o of cars){if(o===c)continue;probe(o.x,o.y,2.2,2.4,0,o.v);}
    probe(T.x,T.y,4.7,3.0,0,Math.abs(T.v));
    if(c.ghost>0){c.ghost-=dt;stop=false;}
    if(stop||c.stopT>0){c.blk+=dt;c.vt2=0;if(c.blk>4.5&&c.ghost<=0){c.ghost=3;c.blk=0;}if(c.blk>2&&c.hornT<=0&&Math.hypot(c.x-T.x,c.y-T.y)<40){c.hornT=3.5;A.tone(430,.25,'square',.035);}}
    else c.blk=Math.max(0,c.blk-dt);
    const target=(stop||c.stopT>0)?0:slow;
    c.brk=target<c.v-.5;
    c.v+=clamp(target-c.v,-14*dt,4*dt);
    // avanzamento e nodi
    c.t+=c.s*c.v*dt;
    const nodes=nodesOf(c);
    if((c.s>0&&c.t>=nodes[c.k])||(c.s<0&&c.t<=nodes[c.k])){
      const roads=roadsOf(c),opts=[];
      if(c.k+c.s>=0&&c.k+c.s<nodes.length){opts.push({st:1},{st:1},{st:1});}
      if(c.ri<roads.length-1)opts.push({turn:1});if(c.ri>0)opts.push({turn:-1});
      const o=opts[Math.floor(Math.random()*opts.length)];
      if(o.st){c.k+=c.s;}
      else{const ax2=c.ax==='v'?'h':'v',oldT=c.t,oldLat=c.lat,oldRi=c.ri;
        c.ax=ax2;c.s=o.turn;c.ri=c.k;c.t=oldLat;c.lat=oldT;c.k=oldRi+c.s;c.v=Math.min(c.v,5.5);}
    }
    c.lat+=(roadsOf(c)[c.ri]+laneOff(c)-c.lat)*Math.min(1,dt*3.5);
    place(c);c.ang=angLerp(c.ang,headOf(c),Math.min(1,dt*6));
  }
}
function trafficSolids(){
  const out=[];for(const c of S.traffic){if(Math.abs(c.x-T.x)>10||Math.abs(c.y-T.y)>10)continue;
    const ca=Math.abs(Math.cos(c.ang)),sa=Math.abs(Math.sin(c.ang)),hw=ca*2.2+sa*.95,hh=sa*2.2+ca*.95;out.push({x0:c.x-hw,y0:c.y-hh,x1:c.x+hw,y1:c.y+hh,car:c});}
  return out;
}

/* ---------- fisica ---------- */
function physics(dt){
  const lock=!!(S.work||S.unl);
  const thr=lock?0:(K.up?1:0)-(K.down?1:0),st=(K.right?1:0)-(K.left?1:0);
  T.steer+=(st-T.steer)*Math.min(1,dt*(st?5:8));
  const fac=surf(T.x,T.y),vmax=17.5*fac,lf=S.load/S.cap;
  let a;
  if(lock)a=-Math.sign(T.v)*Math.min(Math.abs(T.v)/Math.max(dt,1e-3),16);
  else if(thr>0)a=T.v<-.2?13:(5.4-2.2*lf)*(1-clamp(T.v/vmax,0,1));
  else if(thr<0)a=T.v>.3?-13:-3.4*(1-clamp(-T.v/5.5,0,1));
  else a=-Math.sign(T.v)*Math.min(Math.abs(T.v)/Math.max(dt,1e-3),2.4+(1-fac)*9);
  T.v+=a*dt;if(T.v>vmax)T.v=lerp(T.v,vmax,Math.min(1,dt*3));T.v=clamp(T.v,-5.5,18);
  const del=T.steer*.62/(1+Math.abs(T.v)/7);
  T.ang+=T.v/5.6*Math.tan(del)*dt;
  T.x+=Math.cos(T.ang)*T.v*dt;T.y+=Math.sin(T.ang)*T.v*dt;S.distTrav+=Math.abs(T.v)*dt;
  S.braking=lock||(thr<0&&T.v>.3);S.thr=thr;
  collide();
}
function collide(){
  const R=1.32;let worst=0;
  for(let it=0;it<2;it++){
    const ca=Math.cos(T.ang),sa=Math.sin(T.ang),near=solidsNear(M,T.x,T.y,8).concat(trafficSolids());
    for(const off of[-3.5,-1.2,1.2,3.5]){
      const cx=T.x+ca*off,cy=T.y+sa*off;
      for(const s of near){
        const px=clamp(cx,s.x0,s.x1),py=clamp(cy,s.y0,s.y1),dx=cx-px,dy=cy-py,d2=dx*dx+dy*dy;
        if(d2>=R*R)continue;
        let nx,ny,pen;
        if(d2<1e-6){const l=cx-s.x0,rr=s.x1-cx,u=cy-s.y0,dn=s.y1-cy,m=Math.min(l,rr,u,dn);nx=ny=0;if(m===l)nx=-1;else if(m===rr)nx=1;else if(m===u)ny=-1;else ny=1;pen=R+m;}
        else{const d=Math.sqrt(d2);nx=dx/d;ny=dy/d;pen=R-d;}
        T.x+=nx*pen;T.y+=ny*pen;
        const vn=-(T.v*(ca*nx+sa*ny));if(vn>worst)worst=vn;if(s.car){s.car.stopT=1.5;s.car.v=0;}
      }
    }
  }
  if(worst>.8){T.v*=worst>3?.45:.8;
    if(worst>4&&S.hitCd<=0){S.hitCd=1;S.hits++;A.thud();spawn(T.x+Math.cos(T.ang)*3,T.y+Math.sin(T.ang)*3,10,'#d8d2c0',5,.5);toast('Urto! −40 punti',1400);}
  }
}

/* ---------- contesto: cosa può fare ora il giocatore ---------- */
function bayNear(R){
  for(const k of KIND_KEYS){const b=M.center.bays[k],edge=b.y+b.h/2;if(Math.abs(R.x-b.x)<b.w/2-1&&R.y>edge-2&&R.y<edge+9)return{k,b,edge};}
  return null;
}
function context(){
  if(S.work)return{t:'work'};if(S.unl)return{t:'unl'};
  const R=rearPt(),bn=bayNear(R);
  if(bn){
    if(bn.k!==S.kind)return{t:'wrongbay',bn};
    if(S.load<=0)return{t:'empty'};
    const d=dirOf(T.ang);
    if(Math.abs(T.v)>1.6||d.y<.55||Math.abs(R.x-bn.b.x)>bn.b.w/2-3||R.y>bn.edge+5)return{t:'dock',bn};
    return{t:'unload',bn};
  }
  let best=null,bd=REACH;
  for(const b of M.bins){if(b.done)continue;const d=Math.hypot(b.x-R.x,b.y-R.y);if(d<bd){bd=d;best=b;}}
  if(!best)return{t:null};
  if(best.type!==S.kind)return{t:'wrong',bin:best};
  const amt=best.vol*best.fill;
  if(S.load+amt>S.cap+1)return{t:'full',bin:best};
  if(Math.abs(T.v)>2.4)return{t:'stop',bin:best};
  return{t:'pick',bin:best};
}
function act(verbose){
  const c=context();
  if(c.t==='pick'){const big=c.bin.vol>=1000;S.work={bin:c.bin,t:0,dur:big?2.4:1.5,tipped:false,hiss:false};c.bin.hide=false;A.lift();return true;}
  if(c.t==='unload'){const amount=S.load;S.unl={k:c.bn.k,b:c.bn.b,t:0,dur:clamp(2.6+amount/2500,2.6,5.5),amount,start:S.load,edge:c.bn.edge};A.rumble(S.unl.dur);return true;}
  if(verbose){
    if(c.t==='wrong')toast('Quello è un bidone '+KINDS[c.bin.type].n.toLowerCase()+': oggi raccogliamo '+KINDS[S.kind].n.toLowerCase()+'.');
    else if(c.t==='full')toast('Il compattatore è pieno: porta il carico al centro di raccolta.');
    else if(c.t==='stop')toast('Fermati del tutto per svuotare il bidone.');
    else if(c.t==='wrongbay')toast('Bunker sbagliato: scarica nel bunker '+KINDS[S.kind].n.toLowerCase()+'.');
    else if(c.t==='empty')toast('Il cassone è già vuoto.');
    else if(c.t==='dock')toast('Metti il retro del camion davanti al bunker (in retromarcia) e fermati.');
    else toast('Nessun bidone vicino al retro del camion.',1400);
  }
  return false;
}
/* posizioni dell'animazione di raccolta */
function workPose(){
  const w=S.work,p=w.t/w.dur,d=dirOf(T.ang),b=w.bin;
  const loc=(lx,ly)=>({x:T.x+d.x*lx-d.y*ly,y:T.y+d.y*lx+d.x*ly});
  const step=loc(-6.1,.9),tip=loc(-6.5,0),bp={x:b.x,y:b.y};
  const mv=(a,c,u)=>({x:lerp(a.x,c.x,u),y:lerp(a.y,c.y,u)});
  let F,carry=false,bin=null,tilt=0,ang;
  const sm=u=>u*u*(3-2*u);
  if(p<.22){const u=sm(p/.22);F=mv(step,{x:bp.x+(step.x-bp.x)*.12,y:bp.y+(step.y-bp.y)*.12},u);ang=Math.atan2(bp.y-step.y,bp.x-step.x);}
  else if(p<.5){const u=sm((p-.22)/.28);const s0={x:bp.x,y:bp.y};F=mv(s0,{x:tip.x,y:tip.y},u);ang=Math.atan2(tip.y-bp.y,tip.x-bp.x);carry=true;}
  else if(p<.68){F=tip;ang=Math.atan2(tip.y-bp.y,tip.x-bp.x)+0;carry=true;tilt=sm((p-.5)/.18);if(p>.62)tilt=1-(p-.62)/.06*.0+0;}
  else if(p<.9){const u=sm((p-.68)/.22);F=mv(tip,bp,u);ang=Math.atan2(bp.y-tip.y,bp.x-tip.x);carry=true;}
  else{const u=sm((p-.9)/.1);F=mv(bp,step,u);ang=Math.atan2(step.y-bp.y,step.x-bp.x);}
  if(carry){const ux=Math.cos(ang),uy=Math.sin(ang);bin={x:F.x+ux*1.0,y:F.y+uy*1.0,ang:ang,tilt};}
  return{F,ang,carry,bin,p};
}

function updateWork(dt){
  const w=S.work,pb=w.t/w.dur;w.t+=dt;const p=w.t/w.dur;
  if(pb<.5&&p>=.5){A.hiss();spawn(rearPt().x,rearPt().y,12,KINDS[S.kind].two?'#7a8a3a':KINDS[S.kind].col,3.5,.6);}
  if(pb<.56&&p>=.56)A.grind();
  if(!w.tipped&&p>=.62){w.tipped=true;const amt=w.bin.vol*w.bin.fill;S.load+=amt;S.pickedL+=amt;floatText(rearPt().x-1,rearPt().y,'+'+fmt(amt)+' L','#8dfcb0');}
  w.bin.hide=p>.2&&p<.92;
  if(p>=1){w.bin.hide=false;w.bin.done=true;S.col++;S.work=null;A.ding();
    const left=S.total-S.col;if(left===0)toast('Ultimo bidone svuotato! Porta il carico al centro di raccolta.',3200);
    else if(S.load>=S.cap*.92)toast('Compattatore quasi pieno: vai al centro di raccolta.',2600);
  }
}
function updateUnload(dt){
  const u=S.unl;u.t+=dt;const f=clamp(u.t/u.dur,0,1);
  S.gate=Math.min(1,S.gate+dt*3);
  S.load=Math.max(0,u.start*(1-f));
  M.bunker[u.k]=Math.min(1,(M.bunker[u.k]||0)+dt*u.start/Math.max(1,S.cap)/u.dur*.9);
  if(Math.random()<dt*40){const R=rearPt();spawn(R.x-Math.cos(T.ang)*1.4,R.y-Math.sin(T.ang)*1.4,1,KINDS[u.k].two?'#6a8a3a':KINDS[u.k].col,2,.8);}
  if(f>=1){S.delivered+=u.amount;S.trips++;S.unl=null;S.load=0;A.ding();
    toast('Scaricati '+fmt(u.amount)+' L nel bunker '+KINDS[S.kind].n.toLowerCase()+'.',2400);
    if(S.col>=S.total)finish('done');}
}

/* ---------- aggiornamento ---------- */
function update(dt){
  S.t+=dt;S.time-=dt;S.hitCd-=dt;
  if(S.time<=0){S.time=0;finish('time');return;}
  if(!S.work&&!S.unl){if(K.act||S.actEdge){act(S.actEdge);}}
  S.actEdge=false;
  physics(dt);trafficStep(dt);
  if(S.work)updateWork(dt);
  if(S.unl)updateUnload(dt);
  if(!S.unl)S.gate=Math.max(0,S.gate-dt*3);
  for(let i=S.fx.length-1;i>=0;i--){const f=S.fx[i];f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=1-Math.min(1,dt*2);f.vy*=1-Math.min(1,dt*2);if(f.life<=0)S.fx.splice(i,1);}
  if(T.v<-.4){S.beepT-=dt;if(S.beepT<=0){S.beepT=.8;A.beep();}}else S.beepT=0;
  A.engine(T.v,S.thr||0);
  // camera
  const d=dirOf(T.ang),la=T.v*.45;
  cam.x=lerp(cam.x,T.x+d.x*la,Math.min(1,dt*3));cam.y=lerp(cam.y,T.y+d.y*la+(MOB?.14*H/cam.sc:0),Math.min(1,dt*3));
  const portrait=H>W;
  const base=Math.max(H/(portrait?84:64),W/(portrait?46:104));
  cam.sc=lerp(cam.sc,base*zoomMul*(1-.14*Math.min(1,Math.abs(T.v)/17)),Math.min(1,dt*2.5));
}
function remainingTargets(){return M.targets.filter(b=>!b.done);}
function calcScore(done){
  const pts=Math.round(S.delivered/10);
  const bonus=done?600+Math.round(S.time):0;
  return{pts,bonus,pen:S.hits*40,total:Math.max(0,pts+bonus-S.hits*40)};
}
function finish(why){
  if(S.status!=='play')return;S.status='end';
  const sc=calcScore(why==='done'),used=SHIFT-S.time;
  let stars=0;if(why==='done'){stars=1;if(used<SHIFT*.85)stars=2;if(used<SHIFT*.6&&S.hits<=2)stars=3;}
  const pct=Math.round(100*S.delivered/Math.max(1,M.totalTargetVol));
  const key='aege.best.'+S.kind,best=lsGet(key,null);let newBest=false;
  if(!best||sc.total>best.score){lsSet(key,{score:sc.total,stars,seed:S.seed});newBest=true;}
  const mm=Math.floor(used/60),ss=Math.floor(used%60);
  A.mute(A.on);if(A.eng&&A.ac)A.eng.g.gain.setTargetAtTime(0,A.ac.currentTime,.05);
  S.result={sc,stars,pct,why};
  openModal(`<h2>${why==='done'?'Turno completato!':'Turno finito'}</h2>
    <div class="sub">${esc(PLAYER_NAME)} · raccolta ${esc(KINDS[S.kind].n.toLowerCase())} · ${esc(M.cityName)} · seme ${esc(S.seed)}</div>
    <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
    <div class="kv"><div>Bidoni svuotati<b>${S.col} / ${S.total}</b></div><div>Conferito al centro<b>${fmt(S.delivered)} L</b></div><div>Del totale<b>${pct}%</b></div><div>Viaggi al centro<b>${S.trips}</b></div><div>Tempo<b>${mm}:${String(ss).padStart(2,'0')}</b></div><div>Urti<b>${S.hits}</b></div></div>
    <div class="kv"><div>Punti consegna<b>${fmt(sc.pts)}</b></div><div>Bonus turno<b>+${fmt(sc.bonus)}</b></div><div>Penalità urti<b>−${fmt(sc.pen)}</b></div><div>Totale<b style="color:var(--ac)">${fmt(sc.total)}</b></div></div>
    ${newBest?'<div class="sub" style="color:var(--ac)">Nuovo record per questa raccolta!</div>':best?`<div class="sub">Record: ${fmt(best.score)} punti</div>`:''}
    <div class="btns"><button class="mb" id="rAgain">Nuova città</button><button class="mb gh" id="rSame">Stessa città</button><button class="mb gh" id="rMenu">Menu</button></div>`);
  $('#rAgain').onclick=()=>{startGame(newSeed(),S.kind);};
  $('#rSame').onclick=()=>{startGame(S.seed,S.kind);};
  $('#rMenu').onclick=toMenu;
}
function toMenu(){closeModal();$('#hud').classList.add('hide');$('#touch').classList.add('hide');$('#start').classList.remove('hide');S=null;if(A.eng&&A.ac)A.eng.g.gain.setTargetAtTime(0,A.ac.currentTime,.05);buildMenu();}

/* ---------- disegno attori ---------- */
function drawActors(c,t){
  const KK=KINDS[S.kind],W_=S.work,pose=W_?workPose():null;
  const d=dirOf(T.ang);
  drawTruck(c,T,t,{beacon:!!(W_||S.unl),brake:S.braking,rev:T.v<-.3,lights:false,pulse:W_&&pose.p>.5&&pose.p<.7,compact:W_&&pose.p>.56&&pose.p<.72,unload:S.gate,kcol:KK.two?'#3d8a3d':KK.col});
  let F,ang,carry=false,ph=0;
  if(pose){F=pose.F;ang=pose.ang;carry=pose.carry;ph=S.t*10;}
  else{F={x:T.x+d.x*-6.1-d.y*.9,y:T.y+d.y*-6.1+d.x*.9};ang=T.ang;}
  // la barra posteriore (pedana) di Fratesi
  if(!pose){c.save();c.translate(T.x,T.y);c.rotate(T.ang);c.fillStyle='#4b4f57';c.fillRect(-6.5,.2,1.6,1.4);c.restore();}
  drawFratesi(c,F.x,F.y,ang+Math.PI/2*0,ph,carry);
  if(pose&&pose.bin){const b=pose.bin,K=S.work.bin;c.save();c.translate(b.x,b.y);c.rotate(b.tilt*1.2*0);
    const tmp={x:0,y:0,ang:b.ang-Math.PI/2+b.tilt*1.1,big:K.big,vol:K.vol,type:K.type,fill:b.tilt>.5?0:K.fill,done:false,id:0};
    drawBin(c,tmp,t,false);c.restore();}
}
function drawFX(c,t){
  for(const f of S.fx){
    const a=clamp(f.life/f.max,0,1);
    if(f.txt){c.globalAlpha=Math.min(1,a*2);c.font='700 2.1px "Space Grotesk",sans-serif';c.textAlign='center';c.fillStyle=f.col;c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=.35;c.strokeText(f.txt,f.x,f.y);c.fillText(f.txt,f.x,f.y);c.globalAlpha=1;}
    else{c.globalAlpha=a*.85;c.fillStyle=f.col;c.beginPath();c.arc(f.x,f.y,f.r*(1.3-a*.5),0,TAU);c.fill();c.globalAlpha=1;}
  }
}

/* ---------- minimappa ---------- */
const BM_S=.4;
function buildBase(M){
  const cvs=document.createElement('canvas');cvs.width=Math.round(M.W*BM_S);cvs.height=Math.round(M.H*BM_S);const c=cvs.getContext('2d');c.scale(BM_S,BM_S);
  c.fillStyle='#6f9d57';c.fillRect(0,0,M.W,M.H);
  for(const f of M.fields){c.fillStyle=['#a8b567','#8fa457','#b9a15a'][f.c];c.fillRect(f.x,f.y,f.w,f.h);}
  for(const b of M.blocks){c.fillStyle='#c4c7ca';c.fillRect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0);c.fillStyle=b.kind==='park'?'#6bb05a':b.kind==='mall'?'#9ea4a9':b.zone==='periferia'?'#8fc06c':b.zone==='medio'?'#a4c183':'#aeb3b6';c.fillRect(b.lx0,b.ly0,b.lx1-b.lx0,b.ly1-b.ly0);}
  c.fillStyle='#3b4048';for(const rd of M.roads){if(rd.v)c.fillRect(rd.c-rd.w/2,rd.a,rd.w,rd.b-rd.a);else c.fillRect(rd.a,rd.c-rd.w/2,rd.b-rd.a,rd.w);}
  c.fillStyle='#4a505a';c.fillRect(M.hwy.a,M.hwy.y-M.hwy.w/2,M.hwy.b-M.hwy.a,M.hwy.w);
  for(const b of M.buildings){c.fillStyle=b.type==='house'?PAL.roofs[b.roof%PAL.roofs.length]:b.type==='mall'?'#b3b7bd':b.type==='shop'?'#e0d9c3':'#d8d6cf';c.fillRect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0);}
  const C=M.center;c.fillStyle='#7a8086';c.fillRect(C.x0,C.y0,C.x1-C.x0,C.y1-C.y0);c.strokeStyle='#fff';c.lineWidth=3;c.strokeRect(C.x0,C.y0,C.x1-C.x0,C.y1-C.y0);
  return cvs;
}
function drawMarkers(c,w,h,big){
  const sx=w/M.W,sy=h/M.H,k=sx;
  c.drawImage(baseMap,0,0,w,h);
  for(const b of M.targets){if(b.done)continue;const K=KINDS[b.type];c.fillStyle=K.two?'#7a4a27':K.col;c.strokeStyle='#fff';c.lineWidth=big?1.4:1;c.beginPath();c.arc(b.x*sx,b.y*sy,big?4:2.6,0,TAU);c.fill();c.stroke();}
  // centro
  const C=M.center;c.fillStyle='#fff';c.font='bold '+(big?15:11)+'px sans-serif';c.textAlign='center';c.textBaseline='bottom';
  c.fillText('♻ '+(big?'Centro '+C.name:''),(C.x0+C.x1)/2*sx,C.y0*sy-2);
  // camion
  c.save();c.translate(T.x*sx,T.y*sy);c.rotate(T.ang);const r=big?8:6;c.fillStyle='#fff';c.strokeStyle='#111';c.lineWidth=1.5;c.beginPath();c.moveTo(r,0);c.lineTo(-r*.7,r*.7);c.lineTo(-r*.4,0);c.lineTo(-r*.7,-r*.7);c.closePath();c.fill();c.stroke();c.restore();
}

/* ---------- HUD ---------- */
const E={time:$('#hTime'),bins:$('#hBins'),score:$('#hScore'),oT:$('#oT'),oS:$('#oS'),spd:$('#spd'),gTxt:$('#gTxt'),gBar:$('#gBar'),gLoad:$('#gLoad'),prompt:$('#prompt')};
const cache={};
function setT(el,k,v){if(cache[k]!==v){cache[k]=v;el.textContent=v;}}
function updateHUD(){
  const t=Math.ceil(S.time);setT(E.time,'t',Math.floor(t/60)+':'+String(t%60).padStart(2,'0'));
  setT(E.bins,'b',S.col+'/'+S.total);
  setT(E.score,'s',fmt(calcScore(false).total+Math.round(S.pickedL/40)));
  const spd=Math.round(Math.abs(T.v)*3.6);if(cache.spd!==spd){cache.spd=spd;E.spd.innerHTML=spd+'<small>km/h</small>';}
  setT(E.gTxt,'g',fmt(S.load)+' / '+fmt(S.cap)+' L');E.gBar.style.width=Math.min(100,S.load/S.cap*100)+'%';E.gLoad.classList.toggle('full',S.load>=S.cap*.9);
  // obiettivo
  const R=rearPt(),left=S.total-S.col;let tt,ss='';
  if(left>0&&S.load<S.cap*.9){
    let bd=1e9;for(const b of M.targets)if(!b.done){const d=Math.hypot(b.x-T.x,b.y-T.y);if(d<bd)bd=d;}
    tt='Svuota i bidoni '+KINDS[S.kind].n.toLowerCase();ss='Rimasti '+left+' · il più vicino a '+Math.round(bd)+' m';
  }else if(S.load>0){tt=left>0?'Compattatore pieno':'Tutti i bidoni svuotati!';ss='Vai al centro '+M.center.name+' e scarica nel bunker '+KINDS[S.kind].n.toLowerCase();}
  else{tt='Fine turno';}
  setT(E.oT,'o',tt);setT(E.oS,'os',ss);
  // suggerimento contestuale
  const c=context();let p='';
  const kbd=MOB?'♻':'E';
  if(c.t==='pick')p=`<kbd>${kbd}</kbd>Svuota il bidone (${fmt(c.bin.vol*c.bin.fill)} L)`;
  else if(c.t==='stop')p='Fermati per svuotare il bidone';
  else if(c.t==='wrong')p='Bidone '+KINDS[c.bin.type].n.toLowerCase()+': non è la raccolta di oggi';
  else if(c.t==='full')p='Compattatore pieno: vai al centro di raccolta';
  else if(c.t==='unload')p=`<kbd>${kbd}</kbd>Scarica nel bunker ${KINDS[S.kind].n.toLowerCase()}`;
  else if(c.t==='dock')p='Allinea il retro al bunker e fermati';
  else if(c.t==='wrongbay')p='Bunker sbagliato: cerca quello '+KINDS[S.kind].n.toLowerCase();
  else if(c.t==='empty')p='Cassone vuoto';
  if(cache.p!==p){cache.p=p;E.prompt.innerHTML=p;E.prompt.classList.toggle('hide',!p);}
}
function drawGuide(){
  if(!M)return;let tx,ty,label;
  const left=S.total-S.col;
  if(left>0&&S.load<S.cap*.9){let bd=1e9,bb=null;for(const b of M.targets)if(!b.done){const d=Math.hypot(b.x-T.x,b.y-T.y);if(d<bd){bd=d;bb=b;}}if(!bb)return;tx=bb.x;ty=bb.y;}
  else if(S.load>0){const b=M.center.bays[S.kind];tx=b.x;ty=b.y+b.h/2+6;}
  else return;
  const dist=Math.hypot(tx-T.x,ty-T.y);if(dist<22)return;
  const a=Math.atan2(ty-T.y,tx-T.x),sx=W/2+(T.x-cam.x)*cam.sc,sy=H/2+(T.y-cam.y)*cam.sc,r=Math.min(110,Math.min(W,H)*.22);
  ctx.save();ctx.translate(sx+Math.cos(a)*r,sy+Math.sin(a)*r);ctx.rotate(a);
  ctx.globalAlpha=.9;ctx.fillStyle='#fff';ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-8,9);ctx.lineTo(-3,0);ctx.lineTo(-8,-9);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  ctx.save();ctx.font='600 11px "Space Grotesk",sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=3;
  const lx=sx+Math.cos(a)*(r+26),ly=sy+Math.sin(a)*(r+26);ctx.strokeText(Math.round(dist)+' m',lx,ly);ctx.fillText(Math.round(dist)+' m',lx,ly);ctx.restore();
}

/* ---------- modali, mappa, pausa ---------- */
function openModal(h){$('#mbox').innerHTML=h;$('#modal').classList.remove('hide');}
function closeModal(){$('#modal').classList.add('hide');}
function pause(on){
  if(!S||S.status!=='play')return;S.paused=on;
  if(on){openModal(`<h2>Pausa</h2><div class="sub">${esc(PLAYER_NAME)} ha accostato un attimo. ${esc(M.cityName)} · raccolta ${esc(KINDS[S.kind].n.toLowerCase())}.</div><div class="btns"><button class="mb" id="pR">Riprendi</button><button class="mb gh" id="pF">Finisci il turno</button><button class="mb gh" id="pM">Menu</button></div>`);
    $('#pR').onclick=()=>pause(false);$('#pF').onclick=()=>{S.paused=false;finish('quit');};$('#pM').onclick=()=>{S.paused=false;S.status='end';toMenu();};
    if(A.eng&&A.ac)A.eng.g.gain.setTargetAtTime(0,A.ac.currentTime,.05);}
  else{closeModal();last=performance.now();}
}
function showMap(on){
  if(!S)return;const el=$('#mapov');
  if(!on){el.classList.add('hide');if(S.paused&&!S.menuPause){S.paused=false;last=performance.now();}return;}
  S.paused=true;el.classList.remove('hide');
  const cvm=$('#mapcv'),w=Math.min(innerWidth-28,(innerHeight-28)*M.W/M.H),h=w*M.H/M.W;cvm.width=Math.round(w*DPR);cvm.height=Math.round(h*DPR);cvm.style.width=w+'px';cvm.style.height=h+'px';
  const c=cvm.getContext('2d');c.setTransform(DPR,0,0,DPR,0,0);drawMarkers(c,w,h,true);
  // nome città
  c.fillStyle='rgba(0,0,0,.55)';c.fillRect(8,8,Math.min(w-16,260),44);c.fillStyle='#fff';c.font='700 15px sans-serif';c.textAlign='left';c.textBaseline='top';c.fillText(M.cityName,16,13);c.font='12px sans-serif';c.fillStyle='#bcd';c.fillText('Bidoni '+KINDS[S.kind].n.toLowerCase()+' rimasti: '+(S.total-S.col),16,32);
}
$('#mapclose').onclick=()=>showMap(false);

/* ---------- input ---------- */
const KEYMAP={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',KeyE:'act',Space:'act',Enter:'act'};
addEventListener('keydown',e=>{
  if(e.target&&e.target.tagName==='INPUT'){if(e.code==='Enter')$('#go').click();return;}
  const k=KEYMAP[e.code];
  if(k){if(!K[k]&&k==='act')if(S)S.actEdge=true;K[k]=1;if(S&&S.status==='play')e.preventDefault();return;}
  if(!S)return;
  if(e.code==='KeyH'&&S.status==='play')A.horn();
  else if(e.code==='KeyM'){if(!$('#mapov').classList.contains('hide'))showMap(false);else if(S.status==='play'&&!S.paused)showMap(true);}
  else if(e.code==='Escape'){if(!$('#mapov').classList.contains('hide'))showMap(false);else if(S.status==='play')pause(!S.paused);}
  else if(e.code==='Equal'||e.code==='NumpadAdd')zoomMul=clamp(zoomMul*1.12,.6,1.8);
  else if(e.code==='Minus'||e.code==='NumpadSubtract')zoomMul=clamp(zoomMul/1.12,.6,1.8);
});
addEventListener('keyup',e=>{const k=KEYMAP[e.code];if(k)K[k]=0;});
addEventListener('blur',()=>{for(const k in K)K[k]=0;});
addEventListener('wheel',e=>{if(!S||S.status!=='play')return;zoomMul=clamp(zoomMul*(e.deltaY<0?1.08:1/1.08),.6,1.8);},{passive:true});
function bindBtn(id,key){const el=$(id);
  const on=e=>{e.preventDefault();K[key]=1;if(key==='act'&&S)S.actEdge=true;el.classList.add('on');try{el.setPointerCapture(e.pointerId);}catch(_){}};
  const off=e=>{K[key]=0;el.classList.remove('on');};
  el.addEventListener('pointerdown',on);el.addEventListener('pointerup',off);el.addEventListener('pointercancel',off);el.addEventListener('lostpointercapture',off);}
bindBtn('#tL','left');bindBtn('#tR','right');bindBtn('#tG','up');bindBtn('#tB','down');bindBtn('#tA','act');
$('#bMap').onclick=()=>showMap(true);$('#bPause').onclick=()=>pause(true);
$('#bSnd').onclick=()=>{A.on=!A.on;$('#bSnd').textContent=A.on?'🔊':'🔇';if(!A.on&&A.eng&&A.ac)A.eng.g.gain.setTargetAtTime(0,A.ac.currentTime,.05);};
mini.addEventListener('click',()=>{if(S&&S.status==='play')showMap(true);});

/* ---------- menu ---------- */
let chosen=lsGet('aege.kind','carta');if(!KINDS[chosen])chosen='carta';
function buildMenu(){
  const box=$('#kinds');box.innerHTML='';
  for(const k of KIND_KEYS){const K_=KINDS[k],b=document.createElement('button');b.className='kc'+(k===chosen?' on':'')+(K_.two?' two':'');b.style.setProperty('--c',K_.two?'#3d8a3d':K_.col);b.style.setProperty('--l',K_.lid);
    b.innerHTML=`<span class="bn"></span><span><div class="nm">${K_.ic} ${K_.n}</div><div class="ds">${K_.d}</div></span>`;
    b.onclick=()=>{chosen=k;lsSet('aege.kind',k);buildMenu();};box.appendChild(b);}
  const best=lsGet('aege.best.'+chosen,null);
  $('#best').innerHTML=best?`Record ${esc(KINDS[chosen].n.toLowerCase())}: <b style="color:var(--ink)">${fmt(best.score)} punti</b> ${'★'.repeat(best.stars)}${'☆'.repeat(3-best.stars)}`:'Nessun record per questa raccolta: sii il primo!';
}
$('#seedIn').value=lsGet('aege.seed',null)||newSeed();
$('#dice').onclick=()=>{$('#seedIn').value=newSeed();};
$('#go').onclick=()=>{let s=$('#seedIn').value.trim().toUpperCase()||newSeed();$('#seedIn').value=s;lsSet('aege.seed',s);startGame(s,chosen);};
buildMenu();
(function prev(){const c=$('#truckprev'),x=c.getContext('2d');x.fillStyle='#2f343c';x.fillRect(0,0,c.width,c.height);
  x.fillStyle='#e8e6d9';x.setLineDash([16,14]);x.lineWidth=3;x.beginPath();x.moveTo(0,150);x.lineTo(c.width,150);x.stroke();x.setLineDash([]);
  x.save();x.translate(250,100);x.scale(19,19);drawTruck(x,{x:0,y:0,ang:0},0,{kcol:'#2f9e4f'});x.restore();
  x.save();x.translate(60,100);x.scale(19,19);drawBin(x,{x:0,y:0,ang:0,vol:120,type:'carta',fill:.9,done:false,id:0},0,false);x.restore();
  x.save();x.translate(100,50);x.scale(19,19);drawBin(x,{x:0,y:0,ang:0,vol:1100,type:'vetro',fill:.9,done:false,id:0},0,false);x.restore();})();

/* ---------- ciclo ---------- */
let last=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(!S||!M){return;}
  if(S.status==='play'&&!S.paused)update(dt);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.clearRect(0,0,W,H);
  drawScene(ctx,M,S,cam,W,H,performance.now()/1000);
  if(S.status==='play'){drawGuide();updateHUD();}
  // minimappa
  mctx.setTransform(1,0,0,1,0,0);mctx.clearRect(0,0,mini.width,mini.height);
  const mw=mini.width,mh=mini.height;mctx.save();mctx.scale(1,1);drawMarkers(mctx,mw,mh,false);mctx.restore();
}
requestAnimationFrame(frame);
window.__ae={get S(){return S;},get M(){return M;},get T(){return T;},K,startGame,act,context,finish,cam,physics};
