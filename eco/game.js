'use strict';
/* ECO · stato di gioco, movimento, mondo, conoscenze e salvataggi */
let W=null,G=null;
const cv=$('#cv'),ctx=cv.getContext('2d');
const MOB=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;
const DIRV={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const keysDown=new Set();let ts=48,VW=0,VH=0,DPR=1;
const MOVE_MS=150;
let busy=0; // >0: input bloccato da UI

/* ---------- competenze ---------- */
function skillLvl(id){const xp=G.xp[id]||0;let l=0;while(xp>=skXpTot(l+1)&&l<10)l++;return l;}
const skXpTot=l=>{let s=0;for(let i=0;i<l;i++)s+=skXp(i);return s;};
function addXp(id,n){
  const m=1+.1*(GEAR.deco[G.gear.deco].b||0);const before=skillLvl(id);G.xp[id]=(G.xp[id]||0)+Math.round(n*m);
  const after=skillLvl(id);if(after>before)sfx.ok();if(after>before)toast(`${SKILLS.find(s=>s.id===id).ic} ${SKILLS.find(s=>s.id===id).n} al livello ${after}!`,2600);
}
/* ---------- nuova partita ---------- */
function newGame(seed){
  seed=String(seed||newSeed()).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)||newSeed();
  W=genWorld(seed);
  G={seed,day:1,money:300,fans:3,xp:{inv:0,int:0,car:0,aud:0,mon:0,nar:0},gear:{mic:0,iface:0,pc:0,phones:0,panel:0,rec:0,deco:0},music:['m0'],sfx:[],
    where:'out',x:W.start.x,y:W.start.y,dir:'down',items:{},topics:{},clips:[],eps:[],comments:[],trust:{},patience:{},clues:{},ambGot:{},arcRead:{},boards:{},books:{},
    nextClip:1,nextEp:1,rivals:{},flags:{},stats:{eps:0,interviews:0,earned:0,steps:0},best:0,seenTowns:{t0:1},ending:false,leads:[]};
  W.rivals.forEach(r=>G.rivals[r.id]={fans:r.fans,score:r.score,heard:false});
  // la zia ti dà un indizio: le tre leggende
  for(const c of W.cases){G.topics[c.topicIds.case]=true;}
  G.topics.org=false;
  G.flags.intro=false;
  return G;
}
/* ---------- salvataggio ---------- */
const saveKey=s=>'eco.save.'+s;
function saveGame(silent){
  if(!G)return;
  const d=Object.assign({},G);delete d.W;
  try{localStorage.setItem(saveKey(G.seed),JSON.stringify({v:1,when:Date.now(),G:d}));localStorage.setItem('eco.last',G.seed);if(!silent)toast('Partita salvata');}catch(e){if(!silent)toast('Impossibile salvare');}
}
function loadGame(seed){
  const o=lsGet(saveKey(seed),null);if(!o||!o.G)return false;
  W=genWorld(seed);G=o.G;G.seed=seed;
  for(const k of ['items','topics','clips','eps','comments','trust','patience','clues','ambGot','arcRead','boards','books','rivals','flags','seenTowns'])if(!G[k])G[k]=Array.isArray(G[k])?[]:{};
  return true;
}
const listSaves=()=>{const o=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('eco.save.')){const d=JSON.parse(localStorage.getItem(k));o.push({seed:k.slice(9),day:d.G.day,money:d.G.money,eps:d.G.eps.length,when:d.when});}}}catch(e){}return o.sort((a,b)=>b.when-a.when);};

/* ---------- conoscenze ---------- */
const itemOf=id=>W.items[id];
function hasItem(id){return !!G.items[id];}
function noteItem(id,how,extra){
  if(G.items[id])return false;
  const it=itemOf(id);G.items[id]=Object.assign({day:G.day,how,narrated:false,clip:null},extra||{});
  for(const t of it.reveals||[])G.topics[t]=true;
  for(const t of it.keys||[]){}
  addXp('inv',3+it.imp*5);
  if(it.fact==='EVENT'){const cs=W.cases[it.case];if(cs&&!G.seenTowns[cs.town]){G.seenTowns[cs.town]=1;const t=W.towns.find(t=>t.id===cs.town);toast('📍 Nuovo luogo sulla mappa: '+t.name,3000);}}
  return true;
}
function topicName(t){
  for(const c of W.cases)if(c.topicNames[t])return c.topicNames[t];
  const n=W.npcs[t&&t.startsWith('p_')?t.slice(2):''];if(n)return n.name;
  return t;
}
const heldItems=()=>Object.keys(G.items).map(id=>itemOf(id));
/* corroborazione: altre fonti originali indipendenti che dicono la stessa cosa */
function corrob(it){
  const origins=new Set();for(const o of heldItems()){if(o.id!==it.id&&o.claim===it.claim&&o.origin!==it.origin)origins.add(o.origin);}return origins.size;
}
function conflicts(it){return heldItems().filter(o=>o.case===it.case&&o.fact===it.fact&&o.variant!==it.variant);}
/* ---------- qualità audio ---------- */
function noiseOf(where){const t=where&&W.buildings[where]?W.buildings[where].type:'out';return {out:14,bar:22,house:6,library:3,studio:G?Math.max(0,10-GEAR.panel[G.gear.panel].r/4):6,shop:10,church:4}[t]??8;}
function fieldQuality(where){
  const base=GEAR.rec[G.gear.rec].q,noise=noiseOf(where);
  return Math.round(clamp(base+skillLvl('aud')*3.5-noise*(1-GEAR.rec[G.gear.rec].q/160)+(Math.random()*8-4),8,98));
}
function studioQuality(){
  const mic=GEAR.mic[G.gear.mic].q,ifc=GEAR.iface[G.gear.iface].q||0,pan=GEAR.panel[G.gear.panel].r;
  return clamp(mic*.7+ifc*.8+pan*.25+skillLvl('aud')*3,8,99);
}
function newClip(o){
  const id='c'+(G.nextClip++),AUD=skillLvl('aud');
  const clip=Object.assign({id,day:G.day,gain:0,lvl:Math.round(-16+(Math.random()-.5)*2*(11-AUD*.7)),norm:false,q:50,type:'voce',dur:.6,title:''},o);
  G.clips.push(clip);return clip;
}
/* ---------- ciclo del giorno ---------- */
function sleep(){
  G.day++;G.patience={};
  // classifica dei rivali
  for(const rv of W.rivals){const s=G.rivals[rv.id];s.score=clamp(s.score+rv.drift*(Math.random()*2-1)*2.2,25,98);s.fans=Math.max(100,Math.round(s.fans*(1+(s.score-60)/2000+Math.random()*.01)));}
  // ascolti accumulati degli episodi recenti
  for(const e of G.eps){if(e.growth>0){const add=Math.round(e.final*.5/3*(.8+Math.random()*.4));e.listens+=add;G.fans+=Math.round(add*.08);e.growth=Math.max(0,e.growth-1);const pay=Math.round(add*e.cpm/1000);G.money+=pay;G.stats.earned+=pay;e.income+=pay;}}
  // commenti del giorno
  for(const e of G.eps)if(e.pendingComments&&e.pendingComments.length&&e.commentDay<=G.day){e.comments=(e.comments||[]).concat(e.pendingComments);e.pendingComments=[];e.newComments=true;G.comments.push(e.id);}
  saveGame(true);
}
/* ---------- struttura mappa ---------- */
function curMap(){
  if(G.where==='out')return{w:W.map.w,h:W.map.h,tiles:W.map.tiles,ents:W.outEnts,out:true};
  return getInterior(W,G.where);
}
function buildOutEnts(){
  W.outEnts=[];
  // passanti
  for(const id of W.passers){const n=W.npcs[id],t=W.towns.find(t=>t.id===n.townId);
    const r=rngFor(W.seed,'ps'+id);let x,y,k=0;do{x=t.x+ri(r,2,t.w-3);y=t.y+ri(r,2,t.h-3);k++;}while(k<60&&W.map.tiles[y*MW+x]!==TL.PATH);
    W.outEnts.push({kind:'npc',npc:id,x,y,hx:x,hy:y,dir:'down',solid:true,wander:true,wt:rr(r,1,4),fx:x,fy:y,mt:1});}
  // punti di registrazione ambientale
  for(const a of W.ambient)W.outEnts.push({kind:'amb',amb:a.id,x:a.x,y:a.y,solid:false});
  // cartello all'ingresso dei paesi
  for(const t of W.towns)W.outEnts.push({kind:'sign',town:t.id,x:t.cx-1,y:t.y+t.h-1,solid:false,hidden:true});
}
const solidAt=(map,x,y)=>{
  if(x<0||y<0||x>=map.w||y>=map.h)return true;
  const t=map.tiles[y*map.w+x];if(SOLID_T.has(t))return true;
  for(const e of map.ents||[])if(e.solid&&e.x===x&&e.y===y)return true;
  return false;
};
const entAt=(map,x,y)=>(map.ents||[]).find(e=>e.x===x&&e.y===y&&!e.hidden);
/* ---------- movimento ---------- */
const P={x:0,y:0,fx:0,fy:0,mt:1,dir:'down',walk:0,moving:false};
function placePlayer(x,y,dir){P.x=x;P.y=y;P.fx=x;P.fy=y;P.mt=1;P.dir=dir||P.dir;G.x=x;G.y=y;G.dir=P.dir;}
function tryMove(dir){
  if(P.mt<1)return false;
  P.dir=dir;const[dx,dy]=DIRV[dir],nx=P.x+dx,ny=P.y+dy,map=curMap();
  // porta d'ingresso
  if(map.out){
    const a=W.map.aux.get(ny*MW+nx);
    if(a&&a.door&&W.map.tiles[ny*MW+nx]===TL.DOOR){enterBuilding(a.door);return true;}
  }else if(ny===map.exit.y&&nx===map.exit.x){leaveBuilding();return true;}
  if(solidAt(map,nx,ny))return false;
  P.fx=P.x;P.fy=P.y;P.x=nx;P.y=ny;P.mt=0;G.x=nx;G.y=ny;G.dir=dir;G.stats.steps++;
  return true;
}
let fadeA=0,fadeDir=0,fadeCb=null;
function fade(cb){fadeDir=1;fadeCb=cb;busy++;}
function enterBuilding(bid){
  sfx.door();fade(()=>{G.where=bid;const I=getInterior(W,bid);placePlayer(I.spawn.x,I.spawn.y,'up');G.flags['visited_'+bid]=1;
    const b=W.buildings[bid];if(b&&!G.seenTowns[b.town]){G.seenTowns[b.town]=1;}});
}
function leaveBuilding(){
  const bid=G.where,b=W.buildings[bid];
  fade(()=>{G.where='out';placePlayer(b.doorX,b.doorY+1,'down');});
}
function facing(){const[dx,dy]=DIRV[P.dir];return{x:P.x+dx,y:P.y+dy};}
function interactTarget(){
  const map=curMap(),f=facing(),[dx,dy]=DIRV[P.dir];
  let e=entAt(map,f.x,f.y);
  if(e&&(e.kind==='counter'||e.kind==='desk'||e.kind==='table')){const n=(map.ents||[]).find(q=>q.kind==='npc'&&q.x===f.x+dx&&q.y===f.y+dy);if(n)return n;}
  return e||null;
}
function npcLook(e){const dx=P.x-e.x,dy=P.y-e.y;e.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');}

/* ---------- aggiornamento ---------- */
function update(dt){
  if(!G)return;
  const map=curMap();
  // fade
  if(fadeDir){fadeA+=fadeDir*dt*4.5;if(fadeA>=1){fadeA=1;fadeDir=-1;if(fadeCb){fadeCb();fadeCb=null;}}else if(fadeA<=0){fadeA=0;fadeDir=0;busy=Math.max(0,busy-1);}}
  // movimento
  if(P.mt<1){P.mt=Math.min(1,P.mt+dt*1000/MOVE_MS);P.walk+=dt*8;}
  else{P.walk=0;
    if(!busy){
      const order=['up','down','left','right'],ks={up:['ArrowUp','w','W'],down:['ArrowDown','s','S'],left:['ArrowLeft','a','A'],right:['ArrowRight','d','D']};
      for(const d of order){if(ks[d].some(k=>keysDown.has(k))||dpad[d]){if(tryMove(d))break;}}
    }}
  // passanti
  if(map.out)for(const e of map.ents){
    if(e.wander){if(e.mt<1)e.mt=Math.min(1,e.mt+dt*1000/260);else{e.wt-=dt;if(e.wt<=0&&!busy){e.wt=rr(Math.random,1.5,4);const d=pick(Math.random,['up','down','left','right']),[dx,dy]=DIRV[d],nx=e.x+dx,ny=e.y+dy;e.dir=d;
      if(Math.abs(nx-e.hx)<=3&&Math.abs(ny-e.hy)<=3&&!solidAt(map,nx,ny)&&!(nx===P.x&&ny===P.y)&&!(W.map.tiles[ny*MW+nx]!==TL.PATH&&W.map.tiles[ny*MW+nx]!==TL.GRASS&&W.map.tiles[ny*MW+nx]!==TL.FLOWER)){e.fx=e.x;e.fy=e.y;e.x=nx;e.y=ny;e.mt=0;}}}}
  }
  // cartelli dei paesi
  if(map.out&&!busy){for(const t of W.towns){if(P.x>=t.x&&P.x<t.x+t.w&&P.y>=t.y&&P.y<t.y+t.h){if(G.curTown!==t.id){G.curTown=t.id;if(!G.seenTowns[t.id]){G.seenTowns[t.id]=1;}showBanner(t.name);}}}}
  hudT-=dt;if(hudT<=0){hudT=.25;updateHud();}
}
let hudT=0,bannerT=0;
function showBanner(txt){const b=$('#banner');b.textContent=txt;b.classList.add('on');clearTimeout(bannerT);bannerT=setTimeout(()=>b.classList.remove('on'),2400);}
const dpad={up:0,down:0,left:0,right:0};

/* ---------- disegno ---------- */
function resize(){
  DPR=Math.min(devicePixelRatio||1,2);const W_=innerWidth,H_=innerHeight;
  ts=clamp(Math.round(Math.min(W_/(MOB?9:22),H_/(MOB?14:14))/4)*4,32,56);
  VW=W_;VH=H_;cv.width=Math.round(W_*DPR);cv.height=Math.round(H_*DPR);cv.style.width=W_+'px';cv.style.height=H_+'px';
}
addEventListener('resize',resize);
const camera={x:0,y:0};
function render(now){
  const c=ctx;c.setTransform(DPR,0,0,DPR,0,0);c.imageSmoothingEnabled=false;
  c.fillStyle='#0b0d18';c.fillRect(0,0,VW,VH);
  if(!G)return;
  const map=curMap(),T=ts,t=now/1000;
  const px_=lerp(P.fx,P.x,P.mt)*T,py_=lerp(P.fy,P.y,P.mt)*T;
  let cx=px_+T/2-VW/2,cy=py_+T/2-VH/2+(MOB?T*1.2:0);
  const mw=map.w*T,mh=map.h*T;
  cx=mw<=VW?-(VW-mw)/2:clamp(cx,0,mw-VW);cy=mh<=VH?-(VH-mh)/2:clamp(cy,0,mh-VH);
  camera.x=cx;camera.y=cy;
  const x0=Math.max(0,Math.floor(cx/T)),x1=Math.min(map.w-1,Math.ceil((cx+VW)/T)),y0=Math.max(0,Math.floor(cy/T)),y1=Math.min(map.h-1,Math.ceil((cy+VH)/T));
  const wv=Math.floor(t*1.6)%2;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const id=map.tiles[y*map.w+x];let v=Math.floor(hx(x,y,3)*4);if(id===TL.WATER)v=(v+wv)%2+ ((x+y)%2)*2;
    c.drawImage(tileCanvas(id,v),Math.round(x*T-cx),Math.round(y*T-cy),T,T);
  }
  // oggetti + personaggi ordinati
  const list=[];
  for(const e of map.ents||[]){if(e.hidden)continue;if(e.x<x0-2||e.x>x1+2||e.y<y0-2||e.y>y1+2)continue;list.push(e);}
  list.push({kind:'player',x:P.x,y:P.y,sortY:py_/T});
  list.sort((a,b)=>(a.sortY??(a.kind==='npc'&&a.mt<1?lerp(a.fy,a.y,a.mt):a.y))-(b.sortY??(b.kind==='npc'&&b.mt<1?lerp(b.fy,b.y,b.mt):b.y)));
  for(const e of list)drawEnt(c,e,cx,cy,T,t,map);
  if(map.out){c.font='bold 11px "Space Grotesk",system-ui';c.textAlign='center';for(const b of Object.values(W.buildings)){const bx=(b.x+b.w/2)*T-cx,by=(b.y)*T-cy;if(bx<-100||bx>VW+100||by<-40||by>VH+40)continue;if(Math.hypot(b.doorX-P.x,b.doorY-P.y)>14)continue;const lab=b.name;const w=c.measureText(lab).width+12;c.fillStyle='rgba(8,10,22,.78)';c.fillRect(bx-w/2,by+T*.3,w,17);c.fillStyle='#fff';c.fillText(lab,bx,by+T*.3+12);}}
  // suggerimento di interazione
  if(!busy){const tg=interactTarget();if(tg&&tg.kind!=='sign'){const lab=entLabel(tg);if(lab){c.font='bold 12px "Space Grotesk",system-ui';c.textAlign='center';const x=tg.x*T-cx+T/2,y=tg.y*T-cy-8;const w=c.measureText(lab).width+14;c.fillStyle='rgba(8,10,22,.85)';c.fillRect(x-w/2,y-16,w,18);c.fillStyle='#ffd23d';c.fillText(lab,x,y-3);}}}
  if(G.where===W.studioId){ // l'arredo dello studio cresce con gli acquisti
    const I=map,T2=T;
    if(G.gear.panel>=1){for(let i=0;i<I.w-2;i+=2){const x=(1+i)*T2-cx,y=T2*.1-cy;c.fillStyle=G.gear.panel>=3?'#2e3b52':G.gear.panel>=2?'#3a4a64':'#8a6a4a';c.fillRect(x+3,y+3,T2*2-6,T2*.8);c.fillStyle='rgba(255,255,255,.12)';for(let k=0;k<4;k++)c.fillRect(x+6+k*T2*.45,y+8,3,T2*.5);}}
    if(G.gear.deco>=1){c.fillStyle='#e8d9a0';c.fillRect(T2*8.2-cx,T2*.2-cy,T2*.8,T2*.6);c.fillStyle='#c0463a';c.fillRect(T2*8.35-cx,T2*.3-cy,T2*.5,T2*.4);const gl=c.createRadialGradient(T2*3-cx,T2*1.6-cy,2,T2*3-cx,T2*1.6-cy,T2*2.2);gl.addColorStop(0,'rgba(255,200,120,.35)');gl.addColorStop(1,'rgba(255,200,120,0)');c.fillStyle=gl;c.fillRect(T2*.5-cx,T2*.2-cy,T2*5,T2*4);}
    if(G.gear.deco>=2){c.fillStyle='#3a6aa8';c.fillRect(T2*1.2-cx,T2*.2-cy,T2*.9,T2*.7);c.fillStyle='#ffd23d';c.fillRect(T2*1.4-cx,T2*.35-cy,T2*.5,T2*.12);}
  }
  // fade
  if(fadeA>0){c.fillStyle=`rgba(5,6,13,${fadeA})`;c.fillRect(0,0,VW,VH);}
}
function entLabel(e){
  if(e.kind==='npc'){const n=W.npcs[e.npc];return n?(n.role==='passante'?n.name:n.name+(G.flags['met_'+n.id]?' · '+roleName(n):'')):null;}
  const A={pc:'Computer',mic:'Microfono',bed:'Letto',rack:'Attrezzatura',book:'Scaffale',board:'Bacheca',board_home:'Bacheca delle indagini',archive:'Archivio',radio:'Radio',clue:'Esamina',amb:'Registra l\'ambiente'};
  return e.kind==='clue'?(e.done?null:'Esamina'):e.kind==='amb'?'Registra l\'ambiente':A[e.act]||null;
}
const roleName=n=>({colpevole:'',sospettato:'',testimone:'',insider:'',anziano:'anziano',archivista:'archivista',oste:'oste',negoziante:'negoziante',bibliotecario:'bibliotecario',parroco:'parroco',zia:'zia',passante:''}[n.role]||'');
function drawEnt(c,e,cx,cy,T,t,map){
  if(e.kind==='player'){const f=P.mt<1?1+Math.floor(P.walk)%2:0,s=charFrame(null,P.dir,f,{look:1});c.drawImage(s,Math.round(px_(P.fx,P.x)-cx),Math.round(py_(P.fy,P.y)-cy-T*.25),T,T*20/16);return;}
  if(e.kind==='npc'){const n=W.npcs[e.npc];if(!n)return;const mt=e.mt??1,x=lerp(e.fx??e.x,e.x,mt),y=lerp(e.fy??e.y,e.y,mt),f=mt<1?1+Math.floor(t*8)%2:0;
    const s=charFrame(n,e.dir||'down',f,null);c.drawImage(s,Math.round(x*T-cx),Math.round(y*T-cy-T*.25),T,T*20/16);
    const talk=n.statements&&n.statements.some(st=>statementAvail(n,st)&&!G.items[st.item])||(n.rumors&&n.rumors.some(r=>!G.items[r]));
    if(n.role!=='passante'&&talk&&!G.flags['met_'+n.id]){c.fillStyle='#ffd23d';c.font='bold 14px system-ui';c.textAlign='center';c.fillText('!',x*T-cx+T/2,y*T-cy-T*.3+Math.sin(t*5)*2);}
    return;}
  if(e.kind==='amb'){const a=W.ambient.find(q=>q.id===e.amb);if(a&&G.ambGot[a.id])return;const x=e.x*T-cx,y=e.y*T-cy;c.strokeStyle='rgba(255,210,61,.9)';c.lineWidth=2;for(let i=0;i<3;i++){c.globalAlpha=.8-((t*1.2+i*.33)%1)*.8;c.beginPath();c.arc(x+T/2,y+T/2,T*.2+((t*1.2+i*.33)%1)*T*.5,0,TAU);c.stroke();}c.globalAlpha=1;c.fillStyle='#ffd23d';c.font=`${T*.5}px system-ui`;c.textAlign='center';c.fillText('🎙',x+T/2,y+T*.7);return;}
  if(e.kind==='sign')return;
  const spr=objSprite(e.kind,Object.assign({},e,{done:e.kind==='clue'?clueDone(e):false}),G.gear);
  const w=e.w||1;
  if(e.kind==='bed'||e.kind==='table'&&w>1){}
  c.drawImage(spr,Math.round(e.x*T-cx),Math.round(e.y*T-cy),T,T);
  if(e.kind==='bed'&&e.w===2)c.drawImage(spr,Math.round((e.x+1)*T-cx),Math.round(e.y*T-cy),T,T);
}
const px_=(a,b)=>lerp(a,b,P.mt)*ts,py_=(a,b)=>lerp(a,b,P.mt)*ts;
const clueDone=e=>!!G.clues[e.clue];
/* le tessere come 'pcmon' ecc. non disegnano nulla: ok */

/* ---------- finestra di dialogo ---------- */
const dlg=$('#dlg');let dlgRes=null,dlgType=0;
function say(name,text,opts){
  return new Promise(res=>{busy++;dlgRes=res;dlg.classList.remove('hide');
    dlg.innerHTML=`<div class="dn">${name?esc(name):''}</div><div class="dt"></div><div class="dh">${MOB?'tocca':'E / Spazio'} ▾</div>`;
    const el=dlg.querySelector('.dt');let i=0;const full=text;clearInterval(dlgType);
    dlgType=setInterval(()=>{i+=2;el.textContent=full.slice(0,i);if(i>=full.length){clearInterval(dlgType);dlgType=0;}},16);
    dlg._full=full;dlg._el=el;
  });
}
function dlgAdvance(){
  if(!dlgRes)return false;sfx.click();
  if(dlgType){clearInterval(dlgType);dlgType=0;dlg._el.textContent=dlg._full;return true;}
  const r=dlgRes;dlgRes=null;dlg.classList.add('hide');busy=Math.max(0,busy-1);r();return true;
}
dlg.addEventListener('pointerdown',e=>{e.preventDefault();dlgAdvance();});
async function sayAll(name,lines){for(const l of lines)await say(name,l);}
function choose(prompt,options,name){
  return new Promise(res=>{
    const m=$('#modal');busy++;
    m.classList.remove('hide');
    m.innerHTML=`<div class="box small"><div class="sub">${name?esc(name)+' · ':''}</div><div style="font-size:15px;margin-bottom:12px;line-height:1.5">${esc(prompt)}</div>${options.map((o,i)=>`<button class="opt" data-i="${i}" ${o.dis?'disabled':''}><span class="dim">${i+1}.</span> ${esc(o.t)}${o.sub?`<small>${esc(o.sub)}</small>`:''}</button>`).join('')}</div>`;
    const done=i=>{m.classList.add('hide');m.innerHTML='';m.onclick=null;removeEventListener('keydown',kd);busy=Math.max(0,busy-1);res(i);};
    const kd=e=>{const n=parseInt(e.key,10);if(n>=1&&n<=options.length&&!options[n-1].dis){e.preventDefault();done(n-1);}};
    addEventListener('keydown',kd);
    m.onclick=e=>{const b=e.target.closest('.opt');if(!b||b.disabled)return;done(+b.dataset.i);};
  });
}
function closeModalNow(){const m=$('#modal');m.classList.add('hide');m.innerHTML='';m.onclick=null;}
/* ---------- input ---------- */
addEventListener('keydown',e=>{
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT'))return;
  if(!G||$('#title').classList.contains('on'))return;
  keysDown.add(e.key);
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
  if(e.repeat)return;
  if(dlgRes&&(e.key==='e'||e.key==='E'||e.key===' '||e.key==='Enter'||e.key==='z'||e.key==='Z')){dlgAdvance();return;}
  if(e.key==='Escape'){if(uiOpen())closeUI();else if(!busy)openMenu();return;}
  if(busy)return;
  if(e.key==='e'||e.key==='E'||e.key===' '||e.key==='Enter'||e.key==='z'||e.key==='Z')interact();
  else if(e.key==='n'||e.key==='N'||e.key==='Tab'){e.preventDefault();openNotebook();}
  else if(e.key==='m'||e.key==='M')openMapUI();
});
addEventListener('keyup',e=>keysDown.delete(e.key));
addEventListener('blur',()=>keysDown.clear());
/* ---------- ciclo principale ---------- */
let last=0;
function frame(t){requestAnimationFrame(frame);const dt=Math.min(.05,(t-last)/1000);last=t;if(!G)return;if(!uiPaused())update(dt);render(t);}
function uiPaused(){return false;}
