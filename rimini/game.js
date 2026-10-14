'use strict';
const BUILD=101;
(function(){const el=document.getElementById('bld');if(el){const hb=+el.dataset.b;el.textContent='build '+BUILD+(hb!==BUILD?' (pagina '+hb+')':'');}})();
/* RIMINI 3 GIORNI · giochino 2D dentro il Palacongressi (fan project non ufficiale) */
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
function hashStr(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const hsh=(x,y)=>{let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cv=$('#cv'),ctx=cv.getContext('2d');
const MOB=matchMedia('(pointer:coarse)').matches||innerWidth<700;if(MOB)document.body.classList.add('mob');
let W=0,H=0,DPR=1;
function resize(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  const want=MOB?Math.min(W/250,H/380):Math.min(W/520,H/320);let bi=0;ZL.forEach((z,i)=>{if(Math.abs(z-want)<Math.abs(ZL[bi]-want))bi=i;});zBase=bi;applyZoom();}
const ZL=[1,1.5,2,2.5,3,4,5];let zBase=2,zOff=0;let Z=2;
function applyZoom(){Z=ZL[clamp(zBase+zOff,0,ZL.length-1)];}
function zoomStep(d){zOff=clamp(zBase+zOff+d,0,ZL.length-1)-zBase;applyZoom();}
resize();
addEventListener('resize',resize);
const PIX='"Press Start 2P",monospace';
const K=1.2,k=v=>Math.round(v*K);
const WW=k(1306),WH=k(900);

/* ============================================================ audio */
const A={ac:null,on:true,init(){if(this.ac)return;try{this.ac=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}},
  tone(f,d,t,g,f2){if(!this.ac||!this.on)return;const c=this.ac,n=c.currentTime,o=c.createOscillator(),v=c.createGain();o.type=t||'square';o.frequency.setValueAtTime(f,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);v.gain.setValueAtTime(g||.04,n);v.gain.exponentialRampToValueAtTime(.0008,n+d);o.connect(v);v.connect(c.destination);o.start(n);o.stop(n+d+.02);},
  blip(){this.tone(660,.07,'square',.03,990);},stamp(){this.tone(523,.12,'triangle',.07);setTimeout(()=>this.tone(784,.18,'triangle',.07),110);setTimeout(()=>this.tone(1047,.25,'triangle',.07),230);},
  step(){this.tone(90+Math.random()*30,.04,'triangle',.02);}};

/* ============================================================ sprite persona (pixel art) */
function person(c,x,y,dir,step,p){
  x=Math.round(x);y=Math.round(y);
  const f=step>0?(Math.floor(step*2)%2):0,moving=step>0,bob=moving&&f?1:0;
  c.fillStyle='rgba(0,0,0,.28)';c.fillRect(x-5,y-1,11,3);
  const pants=p.pants||'#2b3350',shoe=p.shoe||'#f2f2f5';
  // gambe
  c.fillStyle=pants;
  const l1=moving?(f?1:0):0,l2=moving?(f?0:1):0;
  c.fillRect(x-4,y-7,4,7-l1);c.fillRect(x,y-7,4,7-l2);
  c.fillStyle=shoe;c.fillRect(x-4,y-1-l1,4,1);c.fillRect(x,y-1-l2,4,1);
  if(p.skirt){c.fillStyle=pants;c.fillRect(x-5,y-8,10,4);}
  // busto
  c.fillStyle=p.shirt;c.fillRect(x-5,y-14-bob,10,8);
  c.fillStyle='rgba(255,255,255,.14)';c.fillRect(x-5,y-14-bob,10,1);
  c.fillStyle='rgba(0,0,0,.16)';c.fillRect(x-5,y-8-bob,10,2);
  // braccia
  const sw=moving?(f?1:-1):0;
  c.fillStyle=p.shirt;c.fillRect(x-7,y-13-bob+(sw>0?1:0),2,6);c.fillRect(x+5,y-13-bob+(sw<0?1:0),2,6);
  c.fillStyle=p.skin;c.fillRect(x-7,y-7-bob+(sw>0?1:0),2,2);c.fillRect(x+5,y-7-bob+(sw<0?1:0),2,2);
  // lanyard e badge
  if(dir!==1){c.fillStyle='#d8d8de';c.fillRect(x-1,y-14-bob,2,3);c.fillStyle='#fff';c.fillRect(x-2,y-11-bob,4,4);c.fillStyle=p.badge||'#ff6a3d';c.fillRect(x-2,y-11-bob,4,1);}
  // testa
  c.fillStyle=p.skin;c.fillRect(x-4,y-22-bob,8,8);
  // capelli
  c.fillStyle=p.hair;
  if(p.bald){c.fillStyle='rgba(255,255,255,.22)';c.fillRect(x-2,y-22-bob,3,1);}
  else if(dir===1){c.fillRect(x-5,y-23-bob,10,p.long?15:9);}
  else{c.fillRect(x-5,y-23-bob,10,3);c.fillRect(x-5,y-21-bob,2,3);c.fillRect(x+3,y-21-bob,2,3);if(p.long){c.fillRect(x-5,y-21-bob,2,7);c.fillRect(x+3,y-21-bob,2,7);}}
  // occhi
  c.fillStyle='#1b1b24';
  if(dir===0){c.fillRect(x-2,y-18-bob,1,2);c.fillRect(x+1,y-18-bob,1,2);c.fillStyle='rgba(200,80,80,.5)';c.fillRect(x-1,y-15-bob,2,1);}
  else if(dir===2)c.fillRect(x-3,y-18-bob,1,2);else if(dir===3)c.fillRect(x+2,y-18-bob,1,2);
  // cuffie (Niky)
  if(p.phones){c.fillStyle='#1b1d28';c.fillRect(x-5,y-24-bob,10,1);c.fillRect(x-5,y-23-bob,1,5);c.fillRect(x+4,y-23-bob,1,5);c.fillStyle=p.badge||'#ff6a3d';c.fillRect(x-6,y-20-bob,2,4);c.fillRect(x+4,y-20-bob,2,4);}
  if(p.cap){c.fillStyle=p.cap;c.fillRect(x-5,y-24-bob,10,3);if(dir===0)c.fillRect(x-5,y-22-bob,10,1);}
  if(p.gear&&typeof drawGear==='function')drawGear(c,x,y,dir,bob,p.gear);
}
const SHIRTS=['#ff7a3d','#3da5d9','#6bc46d','#b57bff','#e86a8a','#ffd24d','#d6403a','#2a4a8a','#2aa8a0','#f0f0f5','#23232c','#8a90a0','#b6d84a','#ff8f7a','#8a5a3a','#8a2a4a','#7ac8f0','#8fe0c0'],HAIRC=['#2a1d14','#6a4a2a','#c9a24a','#1a1a20','#8a3a2a','#d9d2c4','#0d0d10','#e8d070','#b0401c','#9a9aa4','#2a6aa8','#c04aa0','#2a8a5a','#ff8a2a'],SKINC=['#f0c8a0','#e8b98a','#c98e62','#a8734c','#fbdcc0','#8a5a38','#6b4226','#52321d','#3d2415','#2b190f'];
let SANDBOX=lsGet('rimini.mode','timed')==='sandbox';
let PLAYER=Object.assign({name:'Ospite',gender:'m',si:0,hi:0,ki:1,job:''},lsGet('rimini.player',{}));
let _me=null;const ME=()=>{const j=PLAYER.job||'';if(!_me||_me.src!==j)_me=Object.assign({src:j},jobProfile(j));return _me;};
function playerLook(){const f=PLAYER.gender==='f',hs=PLAYER.hs||(f?'long':'short');const pj=!!(G&&G.flags&&G.flags.pjOn);return{shirt:pj?'#9fc4ff':SHIRTS[PLAYER.si%SHIRTS.length],pants:pj?'#7aa6ee':f?'#3a3f66':'#26304f',cap:pj?'#ff8fb0':undefined,skin:SKINC[PLAYER.ki%SKINC.length],hair:HAIRC[PLAYER.hi%HAIRC.length],long:hs==='long',bald:hs==='bald',skirt:f,phones:true,badge:'#4dd0ff',shoe:'#fff',gear:(G&&typeof wornGear==='function')?wornGear():''};}
const NIKY=new Proxy({},{get:(_,k)=>playerLook()[k]});
const pname=()=>(PLAYER.name||'Ospite').trim()||'Ospite';
function lsGet(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
const _faceC={};
function faceURL(p){const key=[p.shirt,p.skin,p.hair,p.long?1:0,p.bald?1:0,p.skirt?1:0,p.cap||'',p.gear||'',p.pants||'',p.phones?1:0].join('|');if(_faceC[key])return _faceC[key];const c=document.createElement('canvas');c.width=c.height=30;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#1b2240';x.fillRect(0,0,30,30);x.fillStyle='#2a3566';x.fillRect(0,25,30,5);x.save();x.scale(2.5,2.5);person(x,6,24,0,0,p);x.restore();return _faceC[key]=c.toDataURL();}
function facePal(name,gender){const r=mulberry32(hashStr('face|'+name)),s=FPAL[Math.floor(r()*FPAL.length)];return{shirt:s[0],pants:s[1],skin:SKINS[Math.floor(r()*SKINS.length)],hair:HAIRS[Math.floor(r()*HAIRS.length)],long:gender==='f',skirt:gender==='f'&&r()<.3,badge:'#ff6a3d'};}
const faceImg=(p,cls)=>`<img class="${cls||'cav'}" src="${faceURL(p)}" alt="">`;
function portrait(canvas,p){const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,28,28);c.fillStyle='#1b2240';c.fillRect(0,0,28,28);c.fillStyle='#2a3566';c.fillRect(0,18,28,10);person(c,14,37,0,0,p);}

/* ============================================================ costruzione dei piani */
function layer(w,h){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;return{cv,c,solids:[],inter:[],labels:[],dyn:[]};}
function txt(c,s,x,y,col,size,al){c.font=(size||8)+'px '+PIX;c.fillStyle=col||'#fff';c.textAlign=al||'center';c.textBaseline='middle';c.fillText(s,x,y);}
function paintCarpet(c,x,y,w,h,a,b){c.fillStyle=a;c.fillRect(x,y,w,h);c.fillStyle=b;for(let j=0;j<h;j+=2)for(let i=0;i<w;i+=2)if(hsh(x+i,y+j)<.2)c.fillRect(x+i,y+j,1,1);}
function paintWood(c,x,y,w,h,a,b){c.fillStyle=a;c.fillRect(x,y,w,h);for(let j=0;j<h;j+=6){c.fillStyle=b;c.fillRect(x,y+j,w,1);const off=(j*7)%23;for(let i=off;i<w;i+=23)c.fillRect(x+i,y+j,1,6);}}
function paintTile(c,x,y,w,h,a,b){for(let j=0;j<h;j+=10)for(let i=0;i<w;i+=10){c.fillStyle=((i+j)/10)%2?a:b;c.fillRect(x+i,y+j,Math.min(10,w-i),Math.min(10,h-j));}}
function paintGrass(c,x,y,w,h){c.fillStyle='#69a357';c.fillRect(x,y,w,h);for(let j=0;j<h;j+=2)for(let i=0;i<w;i+=2){const r=hsh(x+i,y+j);if(r<.16){c.fillStyle='#5b9650';c.fillRect(x+i,y+j,1,1);}else if(r>.93){c.fillStyle='#7fb866';c.fillRect(x+i,y+j,1,1);}}}
function paintStone(c,x,y,w,h){paintTile(c,x,y,w,h,'#d3ccbb','#cbc4b2');}
function wallH(L,x,y,w){if(w<=0)return;const c=L.c;c.fillStyle='#f1ece1';c.fillRect(x,y,w,6);c.fillStyle='#fff';c.fillRect(x,y,w,1);c.fillStyle='#b6ad9b';c.fillRect(x,y+4,w,2);L.solids.push({x,y,w,h:6});}
function wallV(L,x,y,h){if(h<=0)return;const c=L.c;c.fillStyle='#e6dfd1';c.fillRect(x,y,6,h);c.fillStyle='#fff';c.fillRect(x,y,1,h);c.fillStyle='#b6ad9b';c.fillRect(x+5,y,1,h);L.solids.push({x,y,w:6,h});}
function segs(a,b,doors){let out=[[a,b]];for(const d of doors){const n=[];for(const s of out){if(d[1]<=s[0]||d[0]>=s[1])n.push(s);else{if(d[0]>s[0])n.push([s[0],d[0]]);if(d[1]<s[1])n.push([d[1],s[1]]);}}out=n;}return out;}
function room(L,x,y,w,h,paint,doors){
  paint(L.c,x,y,w,h);doors=doors||[];const dn=doors.filter(d=>d.s==='n').map(d=>[d.a,d.b]),ds=doors.filter(d=>d.s==='s').map(d=>[d.a,d.b]),dw=doors.filter(d=>d.s==='w').map(d=>[d.a,d.b]),de=doors.filter(d=>d.s==='e').map(d=>[d.a,d.b]);
  segs(x,x+w,dn).forEach(s=>wallH(L,s[0],y,s[1]-s[0]));segs(x,x+w,ds).forEach(s=>wallH(L,s[0],y+h-6,s[1]-s[0]));
  segs(y+6,y+h-6,dw).forEach(s=>wallV(L,x,s[0],s[1]-s[0]));segs(y+6,y+h-6,de).forEach(s=>wallV(L,x+w-6,s[0],s[1]-s[0]));
}
function solid(L,x,y,w,h){L.solids.push({x,y,w,h});}
function shadow(c,x,y,w,h){c.fillStyle='rgba(0,0,0,.22)';c.fillRect(x+2,y+h-2,w,4);}
function chair(c,x,y,col){c.fillStyle=col;c.fillRect(x,y,5,5);c.fillStyle='rgba(255,255,255,.22)';c.fillRect(x,y,5,1);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x,y+4,5,1);}
function plant(L,x,y){const c=L.c;c.fillStyle='rgba(0,0,0,.22)';c.fillRect(x-4,y,10,3);c.fillStyle='#7a4a2a';c.fillRect(x-3,y-4,7,5);c.fillStyle='#2f7a3a';c.fillRect(x-5,y-12,11,9);c.fillStyle='#46a050';c.fillRect(x-3,y-14,7,7);c.fillStyle='#6ccf6a';c.fillRect(x-1,y-13,2,2);solid(L,x-4,y-4,9,5);}
function tree(c,x,y,r){c.fillStyle='rgba(0,0,0,.2)';c.fillRect(x-r,y+r-2,r*2+2,4);c.fillStyle='#6b4a2a';c.fillRect(x-1,y,3,r);c.fillStyle='#3b7a3a';c.beginPath();c.arc(x,y-1,r,0,7);c.fill();c.fillStyle='#4f9a47';c.beginPath();c.arc(x-1,y-3,r*.6,0,7);c.fill();}
function desk(L,x,y,w,h,col,label){const c=L.c;c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x+2,y+h-1,w,4);c.fillStyle=col;c.fillRect(x,y,w,h);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(x,y,w,2);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x,y+h-3,w,3);if(label)txt(c,label,x+w/2,y+h/2,'#fff',8);solid(L,x,y,w,h-1);}
function table(L,x,y,r,col){const c=L.c;c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(x+1,y+r-1,r,r*.5,0,0,7);c.fill();c.fillStyle=col||'#e9e4d8';c.beginPath();c.arc(x,y,r,0,7);c.fill();c.fillStyle='rgba(255,255,255,.4)';c.beginPath();c.arc(x-1,y-1,r*.7,0,7);c.fill();for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;chair(c,Math.round(x+Math.cos(a)*(r+4))-2,Math.round(y+Math.sin(a)*(r+4))-2,'#4a5aa8');}solid(L,x-r,y-r+2,r*2,r*2-3);}
function stage(L,x,y,w,h,txtMain){const c=L.c;c.fillStyle='#14172a';c.fillRect(x,y,w,h);c.fillStyle='#2a2f52';c.fillRect(x,y+h-3,w,3);
  const g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#6a2a9a');g.addColorStop(.5,'#ff6a3d');g.addColorStop(1,'#2aa7d8');c.fillStyle=g;c.fillRect(x+3,y+2,w-6,Math.min(20,h-10));
  c.fillStyle='rgba(255,255,255,.15)';for(let i=x+3;i<x+w-3;i+=4)c.fillRect(i,y+2,1,Math.min(20,h-10));
  if(txtMain)txt(c,txtMain,x+w/2,y+12,'#fff',8);
  c.fillStyle='#0b0d18';c.fillRect(x-6,y+4,5,h-6);c.fillRect(x+w+1,y+4,5,h-6);solid(L,x-6,y,w+12,h);}
function booth(L,x,y,w,h,col,label){const c=L.c;c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x+2,y+h-2,w,4);c.fillStyle='#f4f1ea';c.fillRect(x,y,w,h);c.fillStyle=col;c.fillRect(x,y,w,7);c.fillRect(x,y+h-7,w,7);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(x,y,w,1);txt(c,label,x+w/2,y+11,'#222',8);c.fillStyle='#d9d3c6';c.fillRect(x+4,y+15,w-8,6);solid(L,x,y,w,h-1);}

const RK=(L,x,y,w,h,paint,doors)=>room(L,k(x),k(y),k(w),k(h),paint,(doors||[]).map(d=>({s:d.s,a:k(d.a),b:k(d.b)})));
const P_=(x,y)=>[k(x),k(y)];
function asphalt(c,x,y,w,h,vert){c.fillStyle='#3a3f4a';c.fillRect(x,y,w,h);c.fillStyle='#565c68';if(vert){c.fillRect(x,y,2,h);c.fillRect(x+w-2,y,2,h);}else{c.fillRect(x,y,w,2);c.fillRect(x,y+h-2,w,2);}
  c.fillStyle='#e6e2c8';if(vert){for(let i=0;i<h;i+=22)c.fillRect(x+w/2-1,y+i,2,12);}else{for(let i=0;i<w;i+=22)c.fillRect(x+i,y+h/2-1,12,2);}}
function pillars(c,x0,y0,x1,y1,st){c.fillStyle='#9a9484';for(let y=y0;y<=y1;y+=st)for(let x=x0;x<=x1;x+=st)c.fillRect(x,y,3,3);}
function labelSign(L,x,y,txtS,col){const c=L.c;txt(c,txtS,x,y,col||'#665c4a',8);}
function buildGround(){
  const L=layer(WW,WH),c=L.c;
  paintGrass(c,0,0,WW,WH);
  paintStone(c,k(290),k(80),k(730),k(810));
  // strade: via Monte Titano (nord) e via della Fiera (ovest)
  asphalt(c,0,k(18),WW,k(48));asphalt(c,k(18),0,k(64),WH,true);
  // parcheggio est
  c.fillStyle='#4a4f5a';c.fillRect(k(1010),k(110),k(150),k(420));c.fillStyle='rgba(255,255,255,.5)';for(let y=k(120);y<k(520);y+=14){c.fillRect(k(1015),y,k(60),1);c.fillRect(k(1095),y,k(60),1);}txt(c,'PARCHEGGIO',k(1085),k(100),'#c0c4d0',8);
  // prato sud con alberi e vialetto
  paintGrass(c,k(660),k(730),k(350),k(150));paintGrass(c,k(290),k(740),k(200),k(140));
  // fontana a nord-ovest
  c.fillStyle='#b8b0a0';c.beginPath();c.arc(k(400),k(150),k(42),0,7);c.fill();c.fillStyle='#7cc0e8';c.beginPath();c.arc(k(400),k(150),k(36),0,7);c.fill();c.fillStyle='#cfeaff';c.beginPath();c.arc(k(400),k(150),k(8),0,7);c.fill();solid(L,k(400)-k(40),k(150)-k(40),k(80),k(80));
  // ---------- edificio
  const WOOD=(c,x,y,w,h)=>paintWood(c,x,y,w,h,'#dcc7a4','#cfb893'),CARP=(a,b)=>(c,x,y,w,h)=>paintCarpet(c,x,y,w,h,a,b);
  // nucleo con atrio (concourse)
  RK(L,395,190,490,525,WOOD,[{s:'n',a:555,b:720},{s:'s',a:560,b:705},{s:'e',a:420,b:480},{s:'e',a:240,b:290},{s:'e',a:640,b:690},{s:'w',a:240,b:290},{s:'w',a:385,b:700}]);
  // ala ovest (negozi e bistrot)
  RK(L,150,375,245,330,CARP('#cfd6df','#c7ced8'),[{s:'e',a:385,b:700},{s:'n',a:200,b:250}]);
  // blocchi sale
  RK(L,300,170,95,165,CARP('#3a2f55','#443963'),[{s:'e',a:240,b:290},{s:'s',a:230,b:260}]);
  RK(L,300,335,95,35,CARP('#2a4a5a','#33596b'),[{s:'n',a:230,b:260}]);
  RK(L,885,150,70,215,CARP('#3a2f55','#443963'),[{s:'w',a:240,b:290}]);
  RK(L,885,515,70,45,paintTileW,[{s:'w',a:530,b:550}]);
  RK(L,885,560,70,45,CARP('#1f5560','#276470'),[{s:'w',a:570,b:595}]);
  RK(L,885,605,70,110,CARP('#3a2f55','#443963'),[{s:'w',a:640,b:690}]);
  // negozi e bistrot
  [385,445,505,565].forEach((y,i)=>{RK(L,150,y,95,55,(c,x,yy,w,h)=>paintTile(c,x,yy,w,h,'#e9e4d8','#dfd9cb'),[{s:'e',a:y+18,b:y+40}]);
    const c2=L.c;c2.fillStyle=['#d94a3d','#3d8fd9','#e0a82e','#4ca868'][i];c2.fillRect(k(150)+4,k(y)+4,k(95)-8,5);txt(c2,'NEGOZIO '+(i+1),k(150)+k(95)/2,k(y)+k(28),'#555',8);});
  RK(L,150,630,245,75,(c,x,y,w,h)=>paintWood(c,x,y,w,h,'#a98a62','#97794f'),[{s:'n',a:250,b:330},{s:'e',a:650,b:690}]);
  // sala della piazza
  RK(L,470,240,362,350,CARP('#2b3358','#323c66'),[{s:'n',a:600,b:700},{s:'s',a:510,b:580},{s:'s',a:640,b:700},{s:'w',a:380,b:450},{s:'e',a:380,b:450}]);
  stage(L,k(520),k(250),k(262),k(46),'MARKETERS WORLD');
  for(let r=0;r<20;r++){const yy=k(330)+r*13;for(let i=0;i<14;i++){chair(c,k(480)+i*11,yy,'#9a2a3a');chair(c,k(672)+i*11,yy,'#9a2a3a');}}
  txt(c,'SIEDITI E PARTECIPA',k(651),k(318),'#ffd24d',8);
  c.fillStyle='rgba(255,255,255,.1)';c.fillRect(k(640),k(318),k(30),k(262));
  txt(c,'SALA DELLA PIAZZA',k(651),k(312),'#c9d0ff',8);
  desk(L,k(790),k(420),24,18,'#3a3a46','CAM');
  // pilastri e arredi dell'atrio
  pillars(c,k(420),k(215),k(870),k(700),k(60));
  txt(c,'TEMPIO',k(348),k(250)-10,'#bfb2e8',8);txt(c,'BREAKOUT',k(348),k(352),'#9fd9e4',8);txt(c,'CASTELLO',k(920),k(300)-8,'#bfb2e8',8);txt(c,'ARCO',k(920),k(650)-6,'#bfb2e8',8);
  txt(c,'BISTROT',k(300),k(652),'#fff',8);
  for(let i=0;i<4;i++){table(L,k(180+i*55),k(690),7,'#e9e4d8');}
  // sale: file di sedie
  const rowsOf=(x,y,w,h,col)=>{for(let yy=y;yy<y+h;yy+=12)for(let xx=x;xx<x+w;xx+=10)chair(c,xx,yy,col);};
  rowsOf(k(310),k(190),k(70),k(40),'#7a62b8');stage(L,k(305),k(172),k(88),k(14),'');
  rowsOf(k(892),k(172),k(56),k(40),'#7a62b8');rowsOf(k(892),k(620),k(56),k(36),'#7a62b8');
  // Silent Stage 1-4: quattro postazioni con le cuffie lungo il corridoio ovest
  [1,2,3,4].forEach(n=>{const r=ROOMS['Silent Stage '+n],x=k(r.x)-k(21),y=k(r.y)-k(25),w=k(42),h=k(46);
    c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x+2,y+3,w,h);c.fillStyle='#1d3a4a';c.fillRect(x,y,w,h);c.fillStyle='#2f8f9f';c.fillRect(x,y,w,3);c.fillRect(x,y+h-3,w,3);
    c.fillStyle='#0f2430';for(let i=0;i<4;i++)c.fillRect(x+6+i*((w-16)/3|0),y+h-14,6,8);
    c.strokeStyle='#8fe0f0';c.lineWidth=1;for(let i=0;i<4;i++){const hx=x+9+i*((w-16)/3|0);c.beginPath();c.arc(hx,y+h-16,3,Math.PI,0);c.stroke();}
    txt(c,'SILENT',x+w/2,y+11,'#e8fbff',8);txt(c,'STAGE '+n,x+w/2,y+22,'#ffd24d',8);});
  txt(c,'MAIN STAGE',k(651),k(332),'#ffd24d',8);
  // bar temporanei
  desk(L,k(446),k(255),22,k(40),'#7a3a8a','BAR');desk(L,k(804),k(255),22,k(40),'#7a3a8a','BAR');
  // wc / guardaroba
  txt(c,'WC',k(920),k(540),'#665c4a',8);txt(c,'GUARDAROBA',k(920),k(585),'#9fe8f4',8);
  // ingresso A: portico ad arco e rotonda
  c.fillStyle='rgba(120,110,95,.55)';c.beginPath();c.arc(k(632),k(715),k(125),0,Math.PI);c.fill();c.fillStyle='#d3ccbb';c.beginPath();c.arc(k(632),k(715),k(112),0,Math.PI);c.fill();
  for(let a=0.05;a<Math.PI;a+=.18){c.fillStyle='#f1ece1';c.fillRect(Math.round(k(632)+Math.cos(a)*k(120)),Math.round(k(715)+Math.sin(a)*k(120)),3,3);}
  c.fillStyle='#2f9a6a';c.beginPath();c.arc(k(632),k(695),k(40),0,7);c.fill();c.fillStyle='#d3ccbb';c.beginPath();c.arc(k(632),k(695),k(34),0,7);c.fill();txt(c,'ACCESSO',k(632),k(690),'#444',8);txt(c,'PARCHEGGI',k(632),k(700),'#444',8);solid(L,k(632)-k(36),k(695)-k(36),k(72),k(72));
  txt(c,'INGRESSO A',k(632),k(768),'#fff',8);txt(c,'INGRESSO B',k(180),k(345),'#fff',8);txt(c,'INGRESSO C',k(920),k(450)+22,'#fff',8);
  // reception e blocchi sud
  desk(L,k(530),k(640),k(22),k(30),'#ff6a3d','RECEP.');desk(L,k(715),k(640),k(22),k(30),'#ff6a3d','RECEP.');
  c.fillStyle='#8a8f9a';c.fillRect(k(445),k(640),k(75),k(65));c.fillRect(k(715)+k(30),k(640),k(75),k(65));txt(c,'ASCENSORI',k(482),k(672),'#fff',8);solid(L,k(445),k(640),k(75),k(65));solid(L,k(745),k(640),k(75),k(65));
  // scale mobili
  c.fillStyle='#3a8a7a';c.fillRect(k(585),k(598),k(90),k(24));c.fillStyle='#2a6a5a';for(let i=0;i<9;i++)c.fillRect(k(585)+i*k(10),k(598),2,k(24));txt(c,'SCALE MOBILI ▲',k(630),k(632),'#2a6a5a',8);
  c.fillStyle='#3a8a7a';c.fillRect(k(400),k(395),k(18),k(50));c.fillRect(k(866),k(395),k(18),k(50));
  // stand nell'atrio nord
  STANDS.forEach(s=>booth(L,k(s.x)-26,k(s.y)-18,52,34,s.color,s.short));
  txt(c,'AREA EXPO',k(650),k(198),'#8892a8',8);
  plant(L,k(430),k(210));plant(L,k(850),k(210));plant(L,k(430),k(620));plant(L,k(850),k(620));plant(L,k(856),k(520));
  // gazebo accrediti e assistenza app (fuori dall'ingresso A)
  const gz=(x,y,lab,col)=>{c.fillStyle='rgba(0,0,0,.2)';c.fillRect(x-36,y+4,76,16);c.fillStyle=col;c.fillRect(x-40,y-8,80,5);c.fillStyle='#fff';for(let i=0;i<8;i++)c.fillRect(x-40+i*10,y-8,5,5);desk(L,x-30,y+4,60,10,'#2b3358',lab);solid(L,x-40,y-8,4,26);solid(L,x+36,y-8,4,26);};
  gz(k(520),k(805),'ACCREDITI','#ff6a3d');gz(k(745),k(805),'INFO APP','#4dd0ff');
  // striscione
  c.fillStyle='#14172a';c.fillRect(k(580),k(850),k(104),22);c.fillStyle='#ff6a3d';c.fillRect(k(580),k(850),k(104),2);txt(c,'MARKETERS WORLD',k(632),k(858),'#fff',8);txt(c,'16-18 OTT 2026',k(632),k(867),'#8fd8ff',8);solid(L,k(578),k(850),3,22);solid(L,k(684),k(850),3,22);
  // alberi
  [[330,820],[460,860],[560,780],[700,780],[820,860],[940,850],[300,110],[980,120],[300,700],[1000,610]].forEach(([x,y],i)=>tree(c,k(x),k(y),8+(i%2)));
  // yoga sul prato sud
  for(let q=0;q<4;q++){const cols=['#e86a8a','#4ab8e0','#7ad37a','#ffd24d'];c.fillStyle=cols[q];c.fillRect(k(780)+q*18,k(800),12,28);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(k(780)+q*18,k(800),12,2);}
  txt(c,'YOGA',k(810),k(790),'#e8f7e0',8);
  solid(L,0,0,WW,4);solid(L,0,WH-4,WW,4);solid(L,0,0,4,WH);solid(L,WW-4,0,4,WH);
  return L;
}
function paintTileW(c,x,y,w,h){paintTile(c,x,y,w,h,'#e0e6ec','#d4dbe3');}
function buildFirst(){
  const L=layer(WW,WH),c=L.c;
  c.fillStyle='#090b16';c.fillRect(0,0,WW,WH);
  const WOOD=(c,x,y,w,h)=>paintWood(c,x,y,w,h,'#d8c3a0','#cbb48f'),CARP=(a,b)=>(c,x,y,w,h)=>paintCarpet(c,x,y,w,h,a,b);
  RK(L,395,90,490,625,WOOD,[{s:'w',a:100,b:700},{s:'e',a:340,b:690},{s:'s',a:560,b:705}]);
  // vuoto sopra la Sala della Piazza (con parapetto)
  c.fillStyle='#05060c';c.fillRect(k(470),k(130),k(362),k(420));c.fillStyle='rgba(255,255,255,.12)';for(let y=k(130);y<k(550);y+=6)c.fillRect(k(470),y,k(362),1);
  c.fillStyle='#c9c2b2';c.fillRect(k(466),k(126),k(370),3);c.fillRect(k(466),k(548),k(370),3);c.fillRect(k(466),k(126),3,k(424));c.fillRect(k(833),k(126),3,k(424));solid(L,k(464),k(124),k(374),k(6));solid(L,k(464),k(548),k(374),k(6));solid(L,k(464),k(124),6,k(430));solid(L,k(832),k(124),6,k(430));
  txt(c,'VUOTO SULLA SALA DELLA PIAZZA',k(651),k(340),'#6a7090',8);
  paintWood(c,k(150),k(375),k(245),k(330),'#d8c3a0','#cbb48f');
  // colonna di sale ovest
  const W5=['SALA DELLA VECCHIA PESCHERIA','SALA DEL FARO','SALA DELLA MARINA','SALA DEL PARCO','SALA DEL BORGO'];
  W5.forEach((nm,i)=>{const y=100+i*72;RK(L,305,y,90,66,CARP('#3a2f55','#443963'),[{s:'e',a:y+22,b:y+44}]);txt(c,nm.replace(/^SALA (DELLA|DELL’|DEL|DEI|DELLO) ?/,''),k(350),k(y)+k(33),'#bfb2e8',8);});
  // ala ovest: sale lungo il corridoio
  const WW5=['SALA DELL’OROLOGIO','SALA DELLO SQUERO','SALA DEI BASTIONI','SALA DEL LAVATOIO','SALA DELLA FONTANA'];
  WW5.forEach((nm,i)=>{const y=385+i*64;RK(L,150,y,95,i===4?72:58,CARP(i===4?'#5a3a2a':'#3a2f55',i===4?'#6a4a3a':'#443963'),[{s:'e',a:y+16,b:y+40}]);txt(c,i===4?'STAMPA':nm.replace(/^SALA (DELLA|DELL’|DEL|DEI|DELLO) ?/,''),k(197),k(y)+k(28),'#bfb2e8',8);});
  // sale est
  [[330,'SALA DEL PONTE'],[440,'SALA DEL PORTO']].forEach(([y,nm])=>{RK(L,885,y,70,80,CARP('#3a2f55','#443963'),[{s:'w',a:y+25,b:y+55}]);txt(c,nm.replace(/^SALA DEL /,''),k(920),k(y)+k(40),'#bfb2e8',8);});
  RK(L,885,565,70,100,CARP('#14254a','#1a2f5e'),[{s:'w',a:590,b:640}]);for(let r=0;r<6;r++)for(let i=0;i<5;i++)chair(c,k(892)+i*10,k(575)+r*14,'#2b6aa8');txt(c,'ARENGO',k(920),k(560),'#9fb8ff',8);
  // galleria e anfiteatro
  c.fillStyle='#0b0d18';c.fillRect(k(505),k(690),k(270),k(165));
  const cx=k(635),cy=k(728);
  c.fillStyle='#14172a';c.beginPath();c.arc(cx,cy,k(50),0,7);c.fill();c.fillStyle='#ff6a3d';c.beginPath();c.arc(cx,cy,k(48),0,7);c.stroke();c.fillStyle='#2a2f52';c.beginPath();c.arc(cx,cy,k(44),0,7);c.fill();txt(c,'PALCO',cx,cy,'#fff',8);
  for(let rad=k(58);rad<=k(122);rad+=11){const da=10/rad;for(let a=Math.PI*.04;a<=Math.PI*.96;a+=da){const x=Math.round(cx+Math.cos(a)*rad),y=Math.round(cy+Math.sin(a)*rad);if(y>cy-4)chair(c,x-2,y-2,'#2b6aa8');}}
  desk(L,k(665),k(628),k(70),k(30),'#3a3a46','CAMERINI');
  txt(c,'SALA DELL’ANFITEATRO',cx,k(855),'#c9d0ff',8);txt(c,'SEDUTE FISSE',cx,k(868),'#9fb8ff',8);
  // scale mobili in discesa e ascensori
  c.fillStyle='#3a8a7a';c.fillRect(k(585),k(598),k(90),k(24));txt(c,'SCALE MOBILI ▼',k(630),k(632),'#2a6a5a',8);
  c.fillStyle='#8a8f9a';c.fillRect(k(445),k(640),k(75),k(40));txt(c,'ASCENSORI',k(482),k(655),'#fff',8);solid(L,k(445),k(640),k(75),k(40));
  plant(L,k(430),k(560));plant(L,k(856),k(300));
  solid(L,0,0,WW,4);solid(L,0,WH-4,WW,4);solid(L,0,0,4,WH);solid(L,WW-4,0,4,WH);
  return L;
}

/* ============================================================ stato */
let FL=[null,null,null],G=null,NPC=[],mode='title';
const keys={};let touch={x:0,y:0};
const FLAGS0={app:false,accred:false,ws:0,talk:0,anfi:false,stands:{},yoga:false,off:0,dario:false,luca:false,selfie:false,coffee:0,sign:false,react:0,party:false,kara:false,quiz:0,meet:0,jobTalk:0,hot:0,offer:false,bus:false,fin:false,pets:0,glasses:0,friends:0,pjOn:false,pjp:false,banner:false,kn:0,ks:0,pjg:0,qa:0,fav:0,early:0,sun:false};
function fmt(min){const h=Math.floor(min/60),m=Math.floor(min%60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');}
const rng=mulberry32(hashStr('rimini'+Math.floor(Date.now()/86400000)));
const RNG=()=>(G&&G.rng)?G.rng():Math.random();
function pickFrom(a){return a[Math.floor(RNG()*a.length)];}
const newSeed=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let t='';for(let i=0;i<5;i++)t+=a[Math.floor(Math.random()*a.length)];return t;};
let SEED=lsGet('rimini.seed',null)||newSeed();

function newGame(seed){
  G={seed:seed||SEED,rng:mulberry32(hashStr((seed||SEED)+'|run')),day:0,min:VILLAGE_ON?8*60+15:8*60+45,f:VILLAGE_ON?2:0,p:VILLAGE_ON?{x:k(VG.spawn.x),y:k(VG.spawn.y),dir:0,step:0}:{x:k(632),y:k(893),dir:1,step:0},flags:JSON.parse(JSON.stringify(FLAGS0)),contacts:[],tips:[],log:[],booked:new Set(),saved:new Set(),seen:new Set(),comm:cmInit(),album:[],qd:{},qq:[],sandbox:SANDBOX,meets:[],people:genPeople(seed||SEED),done:false,cam:VILLAGE_ON?{x:k(VG.spawn.x),y:k(VG.spawn.y)}:{x:k(632),y:k(860)},fade:0,watching:null,t:0,met:{}};
  FL[0]=buildGround();drawShuttleStop(FL[0]);FL[1]=buildFirst();FL[2]=VILLAGE_ON?buildVillage():null;FL[3]=typeof buildSunflower==='function'?buildSunflower():null;buildNPC();
}
const FPAL=[['#c9a24a','#2a3566'],['#3da5d9','#2b3350'],['#6bc46d','#3a3a4a'],['#b57bff','#2a2a44'],['#ffd24d','#3a3350'],['#e86a8a','#2b3350'],['#f0f0f5','#303850'],['#3b3b46','#242a40'],['#d6403a','#2b3350'],['#2a4a8a','#3a3a4a'],['#2aa8a0','#2a3566'],['#ff8f7a','#303850'],['#8a5a3a','#242a40'],['#b6d84a','#2b3350'],['#7ac8f0','#3a3350'],['#8a2a4a','#2a2a44']];
const HAIRS=['#2a1d14','#4a3322','#7a5a2a','#1a1a20','#8a3a2a','#c9a24a','#d9d2c4','#0d0d10','#b0401c','#9a9aa4'],SKINS=['#e8b98a','#dfae80','#c98e62','#f0c8a0','#a8734c','#fbdcc0','#8a5a38','#6b4226','#52321d','#3d2415'];
function randPal(){const s=pickFrom(FPAL);return{shirt:s[0],pants:s[1],skin:pickFrom(SKINS),hair:pickFrom(HAIRS),long:RNG()<.35,bald:RNG()<.05,badge:pickFrom(['#ff6a3d','#4dd0ff','#7ad37a','#ffd24d']),cap:RNG()<.12?pickFrom(['#2a3566','#8a2a2a']):null};}
function buildNPC(){
  NPC=[];
  const add=o=>{o.dir=o.dir??0;o.step=0;o.vx=0;o.vy=0;o.t=RNG()*3;NPC.push(o);return o;};
  FAMILY.forEach(f=>add({id:f.id,kind:'family',name:f.name,role:f.role,f:f.where.f,x:k(f.where.x),y:k(f.where.y),p:{shirt:f.shirt,pants:'#232a44',skin:f.skin,hair:f.hair,badge:'#ffd24d'},data:f}));
  SPEAKERS.forEach(s=>add({id:'sp_'+s.name,kind:'speaker',name:s.name,role:'Speaker annunciata/o (da verificare col programma)',f:s.where.f,x:k(s.where.x),y:k(s.where.y),p:randPal(),dir:2}));
  add({id:'accred',kind:'staff',name:'Staff accrediti',role:'Ritiro badge',f:0,x:k(520),y:k(805)+2,p:{shirt:'#ff6a3d',pants:'#232a44',skin:'#e8b98a',hair:'#3a2a1c',badge:'#fff'},dir:0});
  add({id:'info',kind:'staff',name:'Assistenza app',role:'Info point',f:0,x:k(745),y:k(805)+2,p:{shirt:'#2f3552',pants:'#232a44',skin:'#dfae80',hair:'#1a1a20',badge:'#4dd0ff'},dir:0});
  {const sc0=add({id:'scout',kind:'staff',name:pickFrom(ATT_FIRST)+' '+pickFrom(ATT_LAST),role:'Talent scout',f:-1,x:k(262),y:k(668),p:{shirt:'#1ea0e8',pants:'#232a44',skin:'#e8b98a',hair:'#2a1f18',badge:'#ffd24d'},dir:0});sc0.gender=genderOf(sc0.name);sc0.p.long=sc0.gender==='f';}
  add({id:'yoga',kind:'staff',name:'Insegnante di yoga',role:'Sessione sul prato',f:0,x:k(810),y:k(780),p:{shirt:'#7ad37a',pants:'#e8e8f0',skin:'#e0b085',hair:'#4a3322',badge:'#7ad37a',long:true},dir:0});
  add({id:'dj',kind:'staff',name:'Host Offworld',role:'Karaoke e DJ set',f:2,x:k(990)+75,y:k(545)+96,p:{shirt:'#161226',pants:'#232a44',skin:'#e8b98a',hair:'#c9a24a',badge:'#ff6a3d',cap:'#ff6a3d'},dir:0});
  // partecipanti inventati che girano: numero, aspetto e zone cambiano a ogni seme
  const ZONES=[[420,640,520,705,0],[740,640,830,705,0],[430,200,860,236,0],[300,420,395,620,0],[160,640,390,700,0],[960,560,1180,820,0],[420,780,860,860,0],[420,560,830,680,1],[420,560,830,680,1],[330,300,470,720,0],[600,640,700,740,0],[880,470,950,530,0],[420,780,860,860,0],[740,640,830,705,0],[960,560,1180,820,0],[330,300,470,720,0],[300,280,420,620,1],[860,300,1000,560,1],[420,560,830,680,1]];
  const nAtt=46+Math.floor(RNG()*16),usedN=new Set();
  const mkAtt=(i,zones)=>{const r=pickFrom(zones);let fn,ln;do{fn=pickFrom(ATT_FIRST);ln=pickFrom(ATT_LAST);}while(usedN.has(fn+ln));usedN.add(fn+ln);const x0=k(r[0]),y0=k(r[1]),x1=k(r[2]),y1=k(r[3]);add({id:'att'+i,kind:'att',name:fn+' '+ln,role:'',f:r[4],x:x0+RNG()*(x1-x0),y:y0+RNG()*(y1-y0),p:randPal(),wander:{x0,y0,x1,y1},first:fn,job:null});const q=NPC[NPC.length-1],jb=pickFrom(JOBS);q.gender=genderOf(fn);q.p.long=q.gender==='f';if(q.gender==='f')q.p.bald=false;q.p.skirt=q.gender==='f'&&RNG()<.4;q.job=jb[0];q.fam=jb[1];q.role=jb[0]+' · '+pickFrom(ATT_CITY);if(FL[q.f]){[q.x,q.y]=freeSpot(q.f,q.x,q.y);}};
  for(let i=0;i<nAtt;i++)mkAtt(i,ZONES);
  if(VILLAGE_ON){
    add({id:'recep',kind:'staff',name:'Reception del Village',role:'Marketers Village',f:2,x:k(650),y:k(284),p:{shirt:'#1f2a50',pants:'#232a44',skin:'#e0b085',hair:'#2a1d14',badge:'#ffd24d'},dir:0});
    add({id:'driver',kind:'staff',name:'Autista della navetta',role:'Navetta · Marketers World',f:2,x:k(868),y:k(776),p:{shirt:'#2a3566',pants:'#232a44',skin:'#dfae80',hair:'#1a1a20',badge:'#ff6a3d',cap:'#2a3566'},dir:2});
    const VZ=[[300,540,900,740,2],[700,700,1000,780,2],[140,590,420,700,2],[100,300,380,460,2],[920,300,1200,460,2],[430,520,880,700,2]];
    for(let i=0;i<24;i++)mkAtt(nAtt+i,VZ);
  }
  if(typeof sunNPC==='function')sunNPC(add,pickFrom,mkAtt,nAtt+24);
  if(typeof extrasNPC==='function')extrasNPC(add,pickFrom);
}

/* ============================================================ movimento e collisioni */
function hits(L,x,y,gate){const b={x:x-4,y:y-4,w:8,h:5};
  for(const s of L.solids)if(b.x<s.x+s.w&&b.x+b.w>s.x&&b.y<s.y+s.h&&b.y+b.h>s.y)return true;
  if(!G.flags.accred&&L===FL[0]&&b.x<k(705)&&b.x+b.w>k(560)&&b.y<k(722)&&b.y+b.h>k(704))return true;
  return false;}
function moveBody(e,dx,dy,L){const nx=e.x+dx;if(!hits(L,nx,e.y))e.x=nx;const ny=e.y+dy;if(!hits(L,e.x,ny))e.y=ny;e.x=clamp(e.x,6,WW-6);e.y=clamp(e.y,8,WH-6);}
function updateNPC(dt){
  for(const n of NPC){
    if(n.f!==G.f)continue;
    if(n.wander){n.t-=dt;if(n.t<=0){n.t=1.5+Math.random()*3.5;if(Math.random()<.4){n.vx=n.vy=0;}else{const a=Math.random()*6.28;n.vx=Math.cos(a)*16;n.vy=Math.sin(a)*16;}}
      const o={x:n.x,y:n.y};moveBody(n,n.vx*dt,n.vy*dt,FL[n.f]);
      if(n.x<n.wander.x0||n.x>n.wander.x1)n.vx*=-1;if(n.y<n.wander.y0||n.y>n.wander.y1)n.vy*=-1;
      n.x=clamp(n.x,n.wander.x0,n.wander.x1);n.y=clamp(n.y,n.wander.y0,n.wander.y1);
      const mv=Math.hypot(n.x-o.x,n.y-o.y)>.01;if(mv){n.step+=dt*4;n.dir=Math.abs(n.vx)>Math.abs(n.vy)?(n.vx<0?2:3):(n.vy<0?1:0);}else n.step=0;}
  }
}

/* ============================================================ interazioni */
const SMIN=e=>e.start,pad2=n=>String(n).padStart(2,'0'),hm=m=>pad2(Math.floor(m/60))+':'+pad2(Math.floor(m%60));
function activeAt(rooms,day){
  const d=day==null?G.day:day;
  return PROGRAMMA.find(e=>e.d===d&&rooms.includes(e.room)&&e.kind!=='lounge'&&G.min>=e.start-5&&G.min<e.e)||null;
}
function nextAt(rooms){return PROGRAMMA.find(e=>e.d===G.day&&rooms.includes(e.room)&&e.kind!=='lounge'&&e.start>G.min)||null;}
/* prossimo impegno della TUA agenda (prenotati, salvati, meeting); niente sessioni già seguite */
function nextAgenda(){
  const L=[...G.booked,...G.saved].map(id=>BYID[id]).filter(e=>e&&e.kind!=='lounge'&&!G.seen.has(e.id));
  G.meets.forEach(m=>L.push({d:m.day,start:m.start,e:m.start+30,title:'Meeting con '+G.people.find(p=>p.id===m.pid).name,room:'Area networking'}));
  const up=L.filter(e=>e.d>G.day||(e.d===G.day&&e.e>G.min)).sort((a,b)=>a.d-b.d||a.start-b.start);
  return up[0]||null;
}
function nextEvent(){return PROGRAMMA.find(e=>e.d===G.day&&e.kind!=='lounge'&&e.start>G.min)||null;}
function overlaps(a,b){return a.d===b.d&&a.start<b.e&&b.start<a.e;}
function conflictWith(s){return [...G.booked].some(id=>id!==s.id&&overlaps(BYID[id],s))||G.meets.some(m=>overlaps({d:m.day,start:m.start,e:m.start+30},s));}
function genPeople(seed){
  const r=mulberry32(hashStr(seed+'|people')),used=new Set(),me=ME(),raw=[];
  const tagHi=['Lavora in un campo molto vicino al tuo','Potrebbe collaborare con te','Cerca proprio qualcuno come te'],tagMid=['Potrebbe trovare utile quello che fai','Vuole confrontarsi sul tuo settore','Offre la sua esperienza'],tagLo=['Un punto di vista diverso dal tuo','Può aprirti un mondo nuovo','Cerca collaborazioni'];
  for(let i=0;i<14;i++){let nm;do{nm=ATT_FIRST[Math.floor(r()*ATT_FIRST.length)]+' '+ATT_LAST[Math.floor(r()*ATT_LAST.length)];}while(used.has(nm));used.add(nm);
    const jb=JOBS[Math.floor(r()*JOBS.length)],a=aff(me.fam,jb[1]),tr=jobTraits(jb[0]),ov=tr.filter(t=>me.traits.includes(t)).length;
    const compat=Math.max(48,Math.min(98,Math.round(44+46*a+ov*3+r()*7)));
    raw.push({name:nm,job:jb[0],fam:jb[1],city:ATT_CITY[Math.floor(r()*ATT_CITY.length)],compat,tr,a,tag:pickBy(r,a>=.75?tagHi:a>=.62?tagMid:tagLo)});}
  raw.forEach(o=>{o.gender=genderOf(o.name);});raw.sort((x,y)=>y.compat-x.compat);
  return raw.map((o,i)=>Object.assign(o,{id:'p'+i,pal:{skirt:o.gender==='f'&&i%2===0,shirt:['#c9a24a','#3da5d9','#6bc46d','#b57bff','#e86a8a','#f0f0f5'][i%6],pants:'#2b3350',skin:SKINS[i%SKINS.length],hair:HAIRS[i%HAIRS.length],long:o.gender==='f',badge:'#ff6a3d'}}));
}
function pickBy(r,a){return a[Math.floor(r()*a.length)];}
function interactables(){
  const out=[],f=G.f,I=(x,y,r,label,fn,bonus)=>out.push({x:k(x),y:k(y),r:k(r),label,fn,bonus:bonus||0});
  const seen=new Set();
  const roomSpot=(names,x,y,r,title)=>{
    const e=activeAt(names),nx=nextAt(names);
    I(x,y,r,e?title+' · adesso: '+(e.title.length>30?e.title.slice(0,29)+'…':e.title):title+(nx?': prossima alle '+nx.t:': nessuna sessione ora'),()=>openRoom(names,title));
  };
  if(f===0){
    STANDS.forEach(s=>I(s.x,s.y+30,20,'Guarda lo stand «'+s.label+'»',()=>standTalk(s)));
    roomSpot(['Main stage silent','Sala della Piazza','Main Stage'],651,470,50,'Palco principale');
    {const px=G.p.x/K,py=G.p.y/K,inS=py>=325&&py<=575&&((px>=478&&px<=633)||(px>=670&&px<=825));
     if(inS){const MS=['Main stage silent','Sala della Piazza','Main Stage'],e=activeAt(MS),nx=nextAt(MS);
      out.push({x:G.p.x,y:G.p.y,r:k(30),label:e?'🪑 Siediti e partecipa: «'+(e.title.length>26?e.title.slice(0,25)+'…':e.title)+'»':'🪑 Posti a sedere'+(nx?' · prossima alle '+nx.t:' · nessuna sessione ora'),fn:()=>{if(e&&!G.sandbox)enterSession(e);else openRoom(MS,'Palco principale');}});}}
    ['Silent Stage 1','Silent Stage 2','Silent Stage 3','Silent Stage 4'].forEach(n=>roomSpot([n],ROOMS[n].x,ROOMS[n].y,24,n));
    roomSpot(['Sala Castello'],920,255,40,'Sala Castello');
    I(457,308,18,'Un caffè al bar',coffee);I(815,308,18,'Un caffè al bar',coffee);
    I(745,780,20,'Programma e info nell’app',()=>{if(!G.flags.app)say(NPC.find(n=>n.id==='info'),nodeInfo());else openPhone('home');});
    I(630,610,40,'Sali al primo piano (scale mobili)',()=>goFloor(1,k(630),k(590)));
        I(810,810,46,'Una sessione di yoga',()=>say(NPC.find(n=>n.id==='yoga'),nodeYoga()));
    const mt=G.meets.find(m=>m.day===G.day&&G.min>=m.start-10&&Math.floor(G.min)<m.start+11);
    I(225,694,30,mt?'Meeting con '+G.people.find(p=>p.id===mt.pid).name:'Area networking',()=>mt?meetNow(mt):info('Area networking','Qui ti incontri con chi hai contattato dall’app (scheda Networking). Nessun meeting adesso. Se un meeting è fissato, presentati entro 10 minuti dall’orario: dopo ti danno buca e c’è chi si lamenta su Marketers Pro.'));
    I(312,658,26,'Pausa al Bistrot',rest);
    I(651,305,36,'Leggi il cartello della sala',()=>info('Sala della Piazza',FACTS.piazza));
    I(632,770,40,'Leggi l’ingresso',()=>info(EVENT.name+' '+EVENT.year,EVENT.dates+'. '+EVENT.place+'. '+FACTS.palazzo));
    I(180,356,30,'Ingresso B',()=>info('Ingresso B','Dall’Ingresso B si arriva al lato ovest, verso i negozi e il Bistrot.'));
    I(VG.shuttle.x,VG.shuttle.y,34,'Navetta per il Marketers Village (fine giornata)',shuttleHome);
    I(918,460,30,'Ingresso C',()=>info('Ingresso C','L’Ingresso C è sul lato est, verso il parcheggio.'));
  }else if(f===1){
    I(630,610,40,'Scendi al piano terra (scale mobili)',()=>goFloor(0,k(630),k(640)));
    I(635,775,70,'Sala dell’Anfiteatro',()=>info('Sala dell’Anfiteatro',FACTS.anfi+' Qui oggi non ci sono sessioni: gli speech sono in Sala della Piazza, al piano terra.'));
    ['Sala della Marina','Sala del Parco','Sala del Borgo','Sala by CANVA','Sala Finance by FINECO','Sala by Active Powered','Sala Real Estate by Building Production'].forEach(n=>roomSpot([n],ROOMS[n].x,ROOMS[n].y,30,n.replace('Sala Real Estate by Building Production','Sala Real Estate')));
    I(770,578,35,'Guarda il vuoto sulla Piazza',()=>info('Il vuoto','Da qui si vede dall’alto la Sala della Piazza: è un unico grande spazio a doppia altezza.'));
  }
  if(f===2&&VILLAGE_ON)villageSpots(I);
  if(f===3&&typeof sunSpots==='function')sunSpots(I);
  if(typeof itemSpots==='function')itemSpots(f,I);
  if(typeof sqSpots==='function')sqSpots(f,I);
  for(const n of NPC)if(n.f===f)out.push({x:n.x,y:n.y,r:22,npc:n,label:'Parla con '+n.name,fn:()=>talkTo(n)});
  return out;
}
function nearest(){
  const p=G.p;let best=null,bd=1e9;
  for(const o of interactables()){let d=Math.hypot(o.x-p.x,o.y-p.y);if(d>=o.r)continue;d-=o.npc?(o.npc.kind==='att'?0:10):4+(o.bonus||0);if(d<bd){bd=d;best=o;}}
  return best;
}

/* ============================================================ dialoghi */
const dlg=$('#dlg');let DL=null;
function say(npc,node){
  /* selfie possibile con chiunque (se c'è posto tra le 4 scelte) */
  if(typeof selfie==='function'&&npc&&npc.name&&npc.x!=null&&npc.kind!=='pet'&&node&&Array.isArray(node.c)&&node.c.length<4&&!node.c.some(c=>/selfie/i.test(c.t))){
    const last=node.c[node.c.length-1],sf={t:'📸 Facciamo un selfie?',n:null,act:()=>selfie(npc)};
    if(last&&last.n===null&&!last.act)node.c.splice(node.c.length-1,0,sf);else node.c.push(sf);
  }
  DL={npc,node};showDlg();}
function showDlg(){
  const {npc,node}=DL;dlg.classList.remove('hide');dlg.style.pointerEvents='none';clearTimeout(showDlg.t);showDlg.t=setTimeout(()=>{dlg.style.pointerEvents='';},380);
  $('#dN').textContent=npc.name;$('#dR').textContent=npc.role||'';$('#dT').textContent=typeof node.t==='function'?node.t():node.t;
  portrait($('#por'),npc.p||NIKY);
  const ch=$('#dC');ch.innerHTML='';
  const cs=node.c&&node.c.length?node.c:[{t:'Ok',n:null}];
  cs.forEach((c,i)=>{const b=document.createElement('button');b.textContent=(i+1)+'. '+c.t;b.onclick=()=>pickChoice(c);ch.appendChild(b);});
  const f=ch.querySelector('button');if(f)setTimeout(()=>f.focus({preventScroll:true}),30);
  A.blip();
}
function pickChoice(c){
  if(c.act)c.act();
  if(c.n){DL.node=typeof c.n==='function'?c.n():c.n;showDlg();}else closeDlg();
}
function closeDlg(){DL=null;dlg.classList.add('hide');}
function info(title,t){say({name:title,role:'Informazioni',p:{shirt:'#2f3552',pants:'#232a44',skin:'#dfae80',hair:'#1a1a20',badge:'#4dd0ff'}},{t:t});}
function personFor(c){
  let pe=G.people.find(x=>x.name===c.name);if(pe)return pe;
  const [job,city]=(c.role||'').split(' · '),jb=jobFind(job),fam=c.fam||(jb?jb[1]:'strat'),gender=c.gender||genderOf(c.name),me=ME(),r=mulberry32(hashStr('xp|'+c.name)),a=aff(me.fam,fam),tr=jobTraits(job||'Partecipante');
  const compat=Math.max(48,Math.min(98,Math.round(44+46*a+tr.filter(t=>me.traits.includes(t)).length*3+r()*7)));
  pe={id:'x'+hashStr(c.name),name:c.name,job:job||'Partecipante',fam,city:city||'Rimini',compat,tag:'Vi siete già conosciuti: un meeting per approfondire',pal:c.p||facePal(c.name,gender),gender,tr,a};
  G.people.push(pe);(G.xpeople=G.xpeople||[]).push(pe);return pe;
}
function addContact(n){if(G.contacts.some(c=>c.name===n.name))return false;if(n.kind==='att')cmMetNote(n.name);G.contacts.push({fam:n.fam||null,at:cmT(),place:(typeof albumPlace==='function'?albumPlace():''),name:n.name,role:n.role,kind:n.kind,p:n.p?Object.assign({},n.p):null,gender:n.gender||null});A.stamp();toast('Nuovo contatto: '+n.name);return true;}
function talkTo(n){
  if(typeof sqTalk==='function'&&sqTalk(n))return;
  if(n.kind==='pet'&&typeof petTalk==='function'){petTalk(n);return;}
  if(n.friend&&typeof friendTalk==='function'){friendTalk(n);return;}
  if(n.kind==='family'){
    const d=n.data;
    if(n.id==='dario'&&n.sg){firmacopie(activeAt(['Stand Urlico Hoepli']));return;}
    if(typeof trophyFound==='function')trophyFound(n);
    if(n.id==='dario')G.flags.dario=true;if(n.id==='luca')G.flags.luca=true;
    const greet=pickFrom(['Ciao! Benvenuto al Marketers World!','Ehi, che bello vederti qui!','Buon evento! Divertiti e fai tante conoscenze.']);
    say(n,{t:greet,c:[{t:'Chi sei?',n:{t:d.facts[0]+(d.facts[1]?' '+d.facts[1]:''),c:[{t:'Parlami dell’evento',n:factNode(n)},{t:'Ciao!',n:null}]}},{t:'Parlami dell’evento',n:factNode(n)},{t:'Ciao!',n:null,act:()=>addContact(n)}]});
  }else if(n.kind==='speaker'){
    say(n,{t:'Ciao! Tra gli speaker annunciati per il 2026 compare il mio nome. Per orari e sale guarda il programma nell’app.',c:[{t:'Ciao e buon lavoro!',n:null,act:()=>addContact(n)}]});
  }else if(n.id==='accred')say(n,nodeAccred());
  else if(n.id==='info')say(n,nodeInfo());
  else if(n.id==='yoga')say(n,nodeYoga());
  else if(n.id==='scout')say(n,nodeScout());
  else if(n.id==='denise'&&typeof deniseTalk==='function')deniseTalk(n);
  else if(n.id==='recep'||n.id==='driver')say(n,{t:chPick(Math.random,n.id==='recep'?['Benvenuto al Marketers Village! La navetta per il Palacongressi è alla fermata qui davanti.','Buongiorno! Colazione al bar, poi navetta: il World comincia presto.','Se hai dimenticato qualcosa in camera, hai ancora qualche minuto prima della navetta.']:['Prossima partenza tra poco! Sali quando vuoi.','Dieci minuti di viaggio e sei al Palacongressi.','Mi raccomando: l’app serve dopo, in navetta si chiacchiera.']),c:[{t:'Grazie!',n:null}]});
  else if(n.id==='dj'&&typeof offworldTalk==='function')offworldTalk(n);
  else if(n.id==='dj')say(n,{t:'Benvenuto all’Offworld! '+FACTS.off+' Passa la sera: si canta.',c:[{t:'Ci vediamo stasera!',n:null}]});
  else attendee(n);
}
function factNode(n){const pool=[FACTS.nato,FACTS.rimini,FACTS.fri,FACTS.wk,FACTS.app,FACTS.off,FACTS.num,FACTS.palazzo];return{t:pickFrom(pool),c:[{t:'Interessante!',n:null,act:()=>addContact(n)}]};}
function nodeAccred(){
  const F=G.flags;
  if(F.accred)return{t:'Hai già il badge: entra pure al Palacongressi dal varco principale. Buon evento!',c:[{t:'Grazie!',n:null}]};
  if(!F.app)return{t:'Benvenuto! Per ritirare il badge serve il QR del biglietto, che sta nell’app: l’accesso avviene con l’email del biglietto e un codice a 6 cifre. Passa dall’assistenza app qui accanto, poi torna da me.',c:[{t:'Vado all’assistenza app',n:null},{t:'Ho già l’app!',n:{t:'Bene, ma devi fare l’accesso: parla con l’assistenza app qui vicino.',c:[{t:'Ok',n:null}]}}]};
  return{t:'Perfetto, vedo il QR. Ecco il tuo badge: «'+pname()+'». Il varco si apre!',c:[{t:'Grazie!',n:null,act:()=>{F.accred=true;A.stamp();toast('Accredito ritirato! Il varco è aperto.',3000);}}]};
}
function nodeInfo(){
  const F=G.flags;
  if(!F.app)return{t:'Ciao! Qui ti aiuto con l’app ufficiale: si accede con l’email del biglietto e un codice a 6 cifre, il QR sta dentro. Dentro trovi workshop, programma e networking.',c:[{t:'Fai l’accesso',n:{t:'Fatto! Ora hai il QR e il programma sul telefono: apri l’app con P o con il pulsante 📱.',c:[{t:'Grazie!',n:null,act:()=>{F.app=true;A.stamp();toast('App attivata! Apri il telefono con P.',3000);}}]}},{t:'Più tardi',n:null}]};
  return{t:'L’app ti mostra il programma, i workshop prenotati e le persone con cui fare networking. Ogni persona che incontri finisce nei tuoi contatti.',c:[{t:'Apri l’app',n:null,act:()=>openPhone('prog')},{t:'Ok',n:null}]};
}
function nodeYoga(){
  return{t:'Ciao! Ogni tanto tra una sessione e l’altra ci si ferma a respirare. Vuoi provare tre respiri profondi?',c:[{t:'Sì, respiriamo',n:{t:'Inspira… espira… Meglio! Ti senti più leggero. Se ti piace respirare così, c’è anche il Kalemana Festival: yoga in spiaggia.',c:[{t:'Grazie',n:null,act:()=>{if(!G.flags.yoga){G.flags.yoga=true;A.stamp();toast('Yoga fatto!');}}}]}},{t:'Magari dopo',n:null}]};
}
const tipFor=fam=>pickFrom(TIPS[pickFrom((JOBFAM[fam]||JOBFAM.strat).tip)]);
/* risposte coerenti con il mestiere del personaggio: cambiano in base all'affinità con la famiglia di chi hai davanti */
function jobChoices(n,onMet,withTrait){
  const me=ME(),nf=JOBFAM[n.fam||'strat'],a=aff(me.fam,n.fam||'strat'),hi=a>=.75,mid=a>=.62,tr=me.traits[hashStr('t|'+n.id)%me.traits.length],r=chRng(n,'j');
  const meet=()=>{G.flags.jobTalk++;if(a>=.7)G.flags.hot++;onMet();};
  const reply=chReply(n,a,nf.lato,me.job),bye=chPick(r,CH_BYE_OK),yes=chPick(r,CH_CONTACT);
  const ch=[
    {t:'Sono '+pname()+', '+me.job,n:{t:reply+'Scambiamoci i contatti?',c:[
      {t:yes,n:null,act:meet},
      {t:'Ti spiego cosa faccio',n:{t:'Ti ascolto!',c:[{t:JOBFAM[me.fam].pitch,n:{t:hi?'Bellissimo, è proprio quello che cerco: '+nf.cerca+'. '+bye:'Chiarissimo, grazie! Io cerco '+nf.cerca+'. '+bye,c:[{t:'Contatti!',n:null,act:meet}]}}]}},
      {t:'Dopo',n:null}]}}];
  if(withTrait)ch.push({t:'('+TRAITS[tr].n+') '+TRAITS[tr].q,n:{t:'Bella domanda, '+pname()+'! Io sto cercando '+nf.cerca+'. '+(mid?'Direi che ci capiamo.':'Siamo diversi, ma proprio per questo può funzionare.'),c:[{t:'Scambiamoci i contatti',n:null,act:meet},{t:'Dopo',n:null}]}});
  return ch;
}
function topicChoice(n,t,onMet){
  const first=n.name.split(' ')[0],tip=t.tip?tipFor(n.fam||'strat'):'',txt=chAnswer(n,t,tip);
  if(t.tip)return{t:gxf(t.q,PLAYER.gender,PLAYER.gender),n:{t:txt,c:[{t:'Lo segno!',n:null,act:()=>{onMet();addTip(tip,'consiglio di '+first);}}]}};
  return{t:gxf(t.q,PLAYER.gender,PLAYER.gender),n:{t:txt,c:[{t:'Scambiamoci i contatti',n:null,act:onMet},{t:'Grazie, interessante!',n:null}]}};
}
function attendee(n){
  const met=G.met[n.id];
  if(met)return say(n,{t:chMet(n),c:[{t:'Certo!',n:null}]});
  const r=chRng(n,'o'),onMet=()=>{G.met[n.id]=1;addContact(n);},tp=chTopics(n,2),useTrait=r()<.5;
  say(n,{t:chGreet(n),c:[
    ...jobChoices(n,onMet,useTrait),
    ...(useTrait?[]:[topicChoice(n,tp[0],onMet)]),
    {t:chPick(r,CH_BYE),n:null}
  ]});
}
function nodeScout(){
  const F=G.flags,me=ME(),n=NPC.find(x=>x.id==='scout');
  if(F.offer)return{t:'Ci sentiamo dopo l’evento per i dettagli, '+pname()+'. È stato un piacere!',c:[{t:'A presto!',n:null}]};
  if(G.contacts.length>=3&&F.hot>=1)return{t:'Ciao '+pname()+'! Ho sentito parlare di te in giro. '+JOBFAM[me.fam].scout,c:[
    {t:'Mi interessa!',n:{t:'Perfetto! Ti scrivo dopo l’evento con i dettagli. Segnati il mio nome: '+n.name+'.',c:[{t:'A presto!',n:null,act:()=>{F.offer=true;addContact(n);A.stamp();toast('Proposta di collaborazione ricevuta!',3500);}}]}},
    {t:'Ci devo pensare',n:{t:'Certo, io sono qui anche domani. Pensaci.',c:[{t:'Ok',n:null}]}}]};
  return{t:'Ciao! Sono '+n.name+', talent scout. Cerco persone in gamba nel tuo campo ('+me.job+'). Prima gira un po’: serve fare rete con qualcuno vicino al tuo mestiere. Contatti '+G.contacts.length+'/3, incontri affini '+F.hot+'/1.',c:[{t:'Ricevuto, torno dopo',n:null}]};
}
function standTalk(s){
  const first=!G.flags.stands[s.id];G.flags.stands[s.id]=1;
  if(s.id==='pro'){const e=activeAt(['MK PRO con Ilaria Foresti']);if(e){enterSession(e);return;}}
  if(s.id==='tool'){const e=activeAt(['Game Quiz','Gamification']);if(e){quiz(e);return;}}
  if(s.id==='mkt'){const e=activeAt(['Stand Urlico Hoepli']);if(e){firmacopie(e);return;}}
  info(s.label,s.info+(first?' (visitato!)':''));if(first){A.stamp();}
}
function firmacopie(e){
  const dario=e&&/Vignali/.test(e.sp||'');
  const d=dario?NPC.find(n=>n.id==='dario'):{name:(e&&e.sp)||'Autore',role:'Firmacopie · Stand Urlico Hoepli',p:{shirt:'#3a4a8a',pants:'#232a44',skin:'#dfae80',hair:'#2a2420',badge:'#ffd24d'}};
  const book=e?e.title.replace(/^.*? - /,''):'«Il tao del business. L’arte di ribellarsi all’ordinario»';
  say(d,{t:'Ciao! Vuoi che ti firmi il libro? '+book,c:[{t:'Sì, grazie! Per '+pname(),n:{t:'Fatto! Un abbraccio e buon Marketers World.',c:[{t:'Grazie!',n:null,act:()=>{G.flags.sign=true;if(e)G.seen.add(e.id);if(dario){G.flags.dario=true;addContact(d);}A.stamp();toast('Libro firmato!');}}]}},{t:'Passo dopo',n:null}]});
}
function quiz(e){
  const qs=[
   {q:'In che città si tiene l’evento?',o:['Rimini','Milano','Bologna'],a:0},
   {q:'Quali giorni dura l’evento?',o:['16–18 ottobre','2–4 maggio','16–18 novembre'],a:0},
   {q:'Come si accede all’app ufficiale?',o:['Con l’email del biglietto e un codice a 6 cifre','Con un abbonamento','Con il numero di telefono'],a:0}];
  let i=0,ok=0;
  const step=()=>{if(i>=qs.length){G.flags.quiz++;G.seen.add(e.id);G.min=Math.max(G.min,e.e);A.stamp();return say({name:'Game Quiz',role:e.title,p:NPC.find(n=>n.id==='info').p},{t:'Quiz concluso: '+ok+'/3 risposte esatte!',c:[{t:'Ok',n:null}]});}
    const q=qs[i++];say({name:'Game Quiz',role:e.title,p:NPC.find(n=>n.id==='info').p},{t:q.q,c:q.o.map((t,j)=>({t,n:null,act:()=>{if(j===q.a){ok++;toast('Esatto!',900);}else toast('Non proprio…',900);setTimeout(step,200);}}))});};
  step();
}
function coffee(){G.flags.coffee++;toast(pickFrom(['Un caffè al volo: ora sei carico.','Il caffè del Palacongressi: fa il suo dovere.','Doppio espresso: pronto per il prossimo speech!']));A.blip();}
function rest(){G.min+=15;toast('Ti siedi 15 minuti sul divano a controllare l’app.');}
function addTip(t,src){if(!G.tips.some(x=>x.t===t))G.tips.push({t,src,at:cmT()});}
function freeSpot(f,x,y){if(!hits(FL[f],x,y))return[x,y];for(let r=4;r<k(120);r+=4)for(let a=0;a<16;a++){const nx=x+Math.cos(a*Math.PI/8)*r,ny=y+Math.sin(a*Math.PI/8)*r;if(!hits(FL[f],nx,ny))return[nx,ny];}return[x,y];}
function goFloor(f,x,y){G.fade=1;setTimeout(()=>{G.f=f;[G.p.x,G.p.y]=freeSpot(f,x,y);if(f===1)G.flags.anfi=true;A.blip();},120);}
function roomSched(names,day){return PROGRAMMA.filter(e=>e.d===day&&names.includes(e.room)&&e.kind!=='lounge').sort((a,b)=>a.start-b.start);}
function openRoomSandbox(names,title){
  let day=G.day;const box=$('#roomB');
  const draw=()=>{const L=roomSched(names,day);
    box.innerHTML=`<h2>${esc(title)}</h2><div class="small" style="color:#9fb0d8;font-size:12px;margin-bottom:8px">Modalità sandbox: puoi entrare in qualsiasi sessione, a qualsiasi ora.</div><div class="chips2" style="display:flex;gap:6px;margin-bottom:10px">${DAYNAMES.map((n,i)=>`<button data-d="${i}" class="chips3b ${day===i?'on':''}">${n}</button>`).join('')}</div>`+
    (L.length?L.map((x,i)=>`<div class="sv"><div class="i"><b>${esc(x.title)}</b><small>${hm(x.start)}–${hm(x.e%1440)}${x.sp?' · '+esc(x.sp.split(',')[0]):''}</small></div><button class="go" data-e="${i}">Entra</button></div>`).join(''):'<div style="color:#9fb0d8;font-size:13px;margin-bottom:10px">Nessuna sessione in questa sala quel giorno.</div>')+'<div style="margin-top:10px"><button class="btn ghost" id="roomX">Chiudi</button></div>';
    box.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{day=+b.dataset.d;draw();});
    box.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{const e=L[+b.dataset.e];$('#roomm').classList.add('hide');last=performance.now();enterSession(e);});
    $('#roomX').onclick=()=>{$('#roomm').classList.add('hide');last=performance.now();};};
  draw();$('#roomm').classList.remove('hide');
}
function openRoom(names,title){
  if(G.sandbox){openRoomSandbox(names,title);return;}
  const e=activeAt(names),nx=nextAt(names),today=roomSched(names,G.day);
  const host={name:title,role:'Sala · programma',p:{shirt:'#2f3552',pants:'#232a44',skin:'#dfae80',hair:'#1a1a20',badge:'#4dd0ff'}};
  const ln=x=>hm(x.start)+'–'+hm(x.e%1440)+'  '+(x.title.length>44?x.title.slice(0,43)+'…':x.title)+(x.sp?' ('+x.sp.split(',')[0]+')':'');
  const sched={t:today.length?'Programma di oggi in questa sala:\n'+today.map(x=>(x===e?'▶ ':'   ')+ln(x)).join('\n'):'Oggi in questa sala non ci sono sessioni.',c:[{t:'Indietro',n:()=>main()}]};
  const main=()=>({t:e?'Adesso in sala: «'+e.title+'»\n'+hm(e.start)+'–'+hm(e.e%1440)+(e.sp?' · '+e.sp:''):(nx?'Nessuna sessione in corso. La prossima: «'+nx.title+'» alle '+nx.t+'.':'Per oggi non ci sono altre sessioni in questa sala.'),
    c:[e?{t:'Entra ora',n:null,act:()=>enterSession(e)}:null,{t:'Vedi il programma di oggi',n:sched},{t:'Esci',n:null}].filter(Boolean)});
  say(host,main());
}
function enterSession(e){
  if(e.kind==='sign'){firmacopie(e);return;}
  if(e.kind==='game'){quiz(e);return;}
  if(e.kind==='party'){partySilent(e);return;}
  if(e.kind==='react'){startReact(e);return;}
  if(e.kind==='karaoke'){karaoke(e);return;}
  if(e.kind==='meetup'){if(G.f===3){info('Marketers Meetup','Sei già al Sunflower: bar, tavoli e persone con cui parlare.');}else info('Marketers Meetup','Il Marketers Meetup è al Sunflower, venerdì dalle 20:00 alle 22:00. Prendi la navetta serale dal Palacongressi (fermata «Navetta» fuori dall’Ingresso A, dalle 19:30).');return;}
  if(!G.flags.accred){info('Varco','Serve il badge per entrare in sala.');return;}
  if(e.kind==='ws'){
    if(!G.booked.has(e.id)){
      if(!G.sandbox&&typeof wsEntry==='function'){wsEntry(e);return;}
      toast('Non l’avevi prenotato, ma entri lo stesso.',2200);
    }
  }
  startTheatre(e);
}
function partySilent(e){
  say({name:'Host Yoga Silent Party',role:'Main stage silent',p:NPC.find(n=>n.id==='yoga').p},{t:'Cuffie sulle orecchie, silenzio fuori e musica dentro: balliamo tutti insieme sul Main stage silent!',c:[{t:'Si balla!',n:{t:'Che energia! Ti senti più leggero.',c:[{t:'Fantastico',n:null,act:()=>{G.flags.party=true;G.flags.yoga=true;G.seen.add(e.id);G.min=Math.max(G.min,e.e);A.stamp();toast('Yoga Silent Party vissuta!');}}]}},{t:'Magari dopo',n:null}]});
}
/* ----- teatro: si guarda davvero lo speech ----- */
const stg=$('#stg');let stCv=null;
function startTheatre(e){
  const c=typeof qaAdd==='function'?qaAdd(makeContent(e),e):makeContent(e),where=e.kind==='talk'?'main':'work';
  G.watching={c,e,where,label:e.room,i:0,typed:0,idle:0,taken:{},ex:null,good:0,applause:0,t:0,notes:0,done:false};
  closeDlg();stg.classList.remove('hide');renderSlide();A.blip();
}
function slideOf(){const w=G.watching;return w.c.slides[w.i];}
function sayText(){const w=G.watching,sl=slideOf();if(Array.isArray(sl))return sl[2];return w.ex&&w.ex.picked!=null?sl.c[w.ex.picked].r:'Esercizio: '+sl.q;}
function renderSlide(){
  const w=G.watching,sl=slideOf();w.idle=0;if(!Array.isArray(sl)){if(!w.ex||w.exI!==w.i){w.ex={picked:null};w.exI=w.i;w.typed=0;}}else{w.ex=null;if(w.slideT!==w.i){w.typed=0;}}w.slideT=w.i;
  $('#sN').textContent=w.c.speaker;$('#sR').textContent=w.c.role+' · «'+w.c.title+'»';
  const ch=$('#sC');ch.innerHTML='';
  const add=(t,fn,dis)=>{const b=document.createElement('button');b.textContent=t;if(dis)b.disabled=true;b.onclick=fn;ch.appendChild(b);return b;};
  const last=w.i>=w.c.slides.length-1;
  if(w.ex&&w.ex.picked==null){sl.c.forEach((c,k)=>add((k+1)+'. '+c.t,()=>pickEx(k)));}
  else{add(last?'Applaudi e chiudi':'Avanti ▶',advance);
    if(Array.isArray(sl))add(w.taken[w.i]?'✓ Segnato':'📝 Segna l’appunto',takeNote,!!w.taken[w.i]);}
  add('Esci dalla sala',()=>leaveTheatre(false));
  setT($('#sT'),'st','');
}
function pickEx(k){const w=G.watching,sl=slideOf();w.ex.picked=k;w.typed=0;const c=sl.c[k];if(c.good){w.good++;addTip(c.r,w.c.title);w.notes++;if(sl.qa)G.flags.qa=(G.flags.qa||0)+1;A.stamp();}else A.blip();w.typed=0;renderSlide();}
function takeNote(){const w=G.watching,sl=slideOf();if(!Array.isArray(sl)||w.taken[w.i])return;w.taken[w.i]=1;addTip(sl[3],w.c.title);w.notes++;A.stamp();toast('Appunto segnato: «'+sl[3]+'». Lo rivedi in 📱 Rete › I miei appunti',3200);renderSlide();}
function advance(){
  const w=G.watching;if(!w)return;
  const full=sayText();
  if(w.typed<full.length){w.typed=full.length;return;}
  if(w.ex&&w.ex.picked==null)return;
  if(w.i>=w.c.slides.length-1){w.done=true;w.applause=2.4;$('#sC').innerHTML='';{const ww=w;setTimeout(()=>{if(G&&G.watching===ww)leaveTheatre(true);},2400);}A.stamp();return;}
  w.i++;renderSlide();
}
function leaveTheatre(complete){
  const w=G.watching;if(!w)return;G.watching=null;stg.classList.add('hide');
  if(!G.sandbox)G.min=complete?Math.max(G.min,w.e.e):G.min+15;
  if(complete&&typeof finaleCheck==='function')setTimeout(()=>finaleCheck(w.e),200);
  if(complete){G.seen.add(w.e.id);if(w.where==='work'){G.flags.ws++;const n=NPC.filter(x=>x.kind==='att'&&!G.met[x.id])[0];if(n){G.met[n.id]=1;addContact(n);}}else G.flags.talk++;
    toast((w.where==='work'?'Sessione':'Speech')+' conclusa: '+w.notes+' appunti nel taccuino'+(w.good?', esercizio riuscito!':'.'),4200);}
  else{G.flags.early=(G.flags.early||0)+1;toast('Sei uscito prima della fine: -15 punti.',2800);}
}
function updateTheatre(dt){
  const w=G.watching;w.t+=dt;if(w.applause>0)w.applause-=dt;
  const full=w.done?'':sayText();
  if(w.typed<full.length)w.typed+=dt*46;else if(!w.done){w.idle+=dt;if(w.idle>9&&!(w.ex&&w.ex.picked==null))advance();}
  setT($('#sT'),'st',w.done?'Grazie a tutti! (applausi)':full.slice(0,Math.floor(w.typed)));
}
const SH=['#2a1d14','#4a3322','#7a5a2a','#1a1a20','#8a3a2a','#c9a24a','#d9d2c4'],SK=['#e8b98a','#dfae80','#c98e62','#f0c8a0'],SC_=['#3a4a8a','#8a3a4a','#3a7a5a','#6a4a8a','#aa7a3a','#3a6a8a','#555a6e'];
function drawTheatre(){
  const w=G.watching,t=G.t;
  if(!stCv){stCv=document.createElement('canvas');stCv.width=320;stCv.height=180;}
  const c=stCv.getContext('2d');c.imageSmoothingEnabled=false;
  const main=w.where==='main';
  c.fillStyle='#090b18';c.fillRect(0,0,320,180);
  c.fillStyle='#151830';c.fillRect(0,0,320,9);for(let k=0;k<9;k++){c.fillStyle=['#ff6a3d','#4dd0ff','#ffd24d'][k%3];c.fillRect(14+k*36,5,5,3);}
  // fasci
  for(let k=0;k<4;k++){const x=40+k*80,fl=.05+.04*Math.sin(t*1.3+k*1.7);c.fillStyle='rgba('+(k%2?'120,200,255':'255,150,90')+','+fl.toFixed(3)+')';c.beginPath();c.moveTo(x-3,8);c.lineTo(x+3,8);c.lineTo(x+40*(k%2?1:-1)+24,130);c.lineTo(x-26+(k%2?-30:30),130);c.fill();}
  // schermo LED
  c.fillStyle='#05060d';c.fillRect(54,10,212,100);const g=c.createLinearGradient(60,0,260,0);g.addColorStop(0,'#1b2a5a');g.addColorStop(.6,'#3a1b5a');g.addColorStop(1,'#5a2a3a');c.fillStyle=g;c.fillRect(58,14,204,92);
  c.fillStyle='rgba(255,255,255,.05)';for(let y=14;y<106;y+=3)c.fillRect(58,y,204,1);
  // palco
  c.fillStyle='#171a30';c.fillRect(0,110,320,22);c.fillStyle='#2d3360';c.fillRect(0,130,320,3);c.fillStyle='#ff6a3d';c.fillRect(0,132,320,1);
  c.fillStyle='#0b0d18';c.fillRect(10,40,10,80);c.fillRect(300,40,10,80);
  // relatore
  const sx=Math.round(160+Math.sin(t*.35)*48),mv=Math.cos(t*.35)*Math.abs(Math.sin(t*.7))>.35;
  c.fillStyle='rgba(255,240,200,.08)';c.beginPath();c.moveTo(sx-6,10);c.lineTo(sx+6,10);c.lineTo(sx+30,128);c.lineTo(sx-30,128);c.fill();
  c.save();c.translate(sx,128);c.scale(2,2);person(c,0,0,mv?(Math.cos(t*.35)>0?3:2):0,mv?t*2:0,Object.assign({badge:'#ffd24d'},w.c.pal));
  // microfono ad archetto
  c.fillStyle='#111';c.fillRect(-2,-19,1,3);c.fillRect(-3,-16,3,1);c.restore();
  // pubblico
  const rows=[138,148,159,171];
  for(let r=0;r<4;r++){const sz=1+r*.12,n=Math.floor(320/(11*sz))+1;for(let i=0;i<n;i++){const x=Math.round(i*11*sz+(r%2)*5),y=rows[r];const hv=(i*31+r*17)%97/97;
      const bob=w.applause>0?Math.round(Math.sin(t*14+i)*1.5):0;
      c.fillStyle=SC_[(i*7+r*3)%SC_.length];c.fillRect(x-5*sz,y+4*sz+bob,10*sz,7*sz);
      c.fillStyle=SH[(i*5+r)%SH.length];c.fillRect(x-3*sz,y-1+bob,7*sz,7*sz);c.fillStyle='rgba(0,0,0,.2)';c.fillRect(x-3*sz,y+4*sz+bob,7*sz,1);
      if(hv<.07&&Math.sin(t*3+i)>0){c.fillStyle='#d8f0ff';c.fillRect(x+3*sz,y-6+bob,3,4);}
      if(w.applause>0&&hv>.8){c.fillStyle='#fff';c.fillRect(x-1,y-5+bob+Math.round(Math.sin(t*20+i)),2,2);}}}
  // giocatore di spalle in prima fila
  const nx=34,ny=171;const PL=playerLook();c.fillStyle=PL.shirt;c.fillRect(nx-6,ny+4,12,8);c.fillStyle=PL.hair;c.fillRect(nx-4,ny-2,9,PL.long?12:8);c.fillStyle='#1b1d28';c.fillRect(nx-5,ny-3,11,1);c.fillStyle='#4dd0ff';c.fillRect(nx-6,ny,2,4);c.fillRect(nx+5,ny,2,4);c.fillStyle='#fff';c.fillRect(nx+8,ny+5,6,5);c.fillStyle='#ccd';c.fillRect(nx+9,ny+6,4,1);
  c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,172,320,8);
  // composizione
  const barH=MOB?Math.max(250,H*.36):210;
  const zs=Math.min(W/320,(H-barH)/180),w0=320*zs,x0=(W-w0)/2,y0=H>W?Math.max(70,H-barH-180*zs-8):Math.max(6,(H-barH-180*zs)/2);
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#05060d';ctx.fillRect(0,0,W,H);ctx.imageSmoothingEnabled=false;ctx.drawImage(stCv,x0,y0,w0,180*zs);
  // testo della slide
  const sl=slideOf(),lx=x0+60*zs,ly=y0+16*zs,lw=198*zs,lh=88*zs;
  ctx.save();ctx.beginPath();ctx.rect(lx,ly,lw,lh);ctx.clip();ctx.textBaseline='top';ctx.textAlign='left';
  const wrap=(txt,font,maxw,lineH,x,y,col)=>{ctx.font=font;ctx.fillStyle=col;const words=txt.split(' ');let line='',yy=y;for(const wd of words){const tst=line?line+' '+wd:wd;if(ctx.measureText(tst).width>maxw&&line){ctx.fillText(line,x,yy);yy+=lineH;line=wd;}else line=tst;}ctx.fillText(line,x,yy);return yy+lineH;};
  const pad=8*zs;
  if(Array.isArray(sl)){let y=wrap(sl[0],'400 '+Math.round(zs*4.8)+'px "Press Start 2P",monospace',lw-2*pad,zs*7.4,lx+pad,ly+pad,'#fff');y+=zs*3;for(const b of sl[1])y=wrap('▸ '+b,'500 '+Math.round(zs*5)+'px "Space Grotesk",sans-serif',lw-2*pad,zs*7,lx+pad,y,'#ffd9a8');
    ctx.font='400 '+Math.round(zs*3.4)+'px "Press Start 2P",monospace';ctx.fillStyle='rgba(255,255,255,.45)';ctx.textAlign='right';ctx.fillText((w.i+1)+'/'+w.c.slides.length,lx+lw-pad,ly+lh-pad-zs*3);}
  else{ctx.font='400 '+Math.round(zs*3.6)+'px "Press Start 2P",monospace';ctx.fillStyle='#ffd24d';ctx.fillText(sl.qa?'DOMANDE DAL PUBBLICO':'ESERCIZIO',lx+pad,ly+pad);wrap(sl.q,'700 '+Math.round(zs*5.6)+'px "Space Grotesk",sans-serif',lw-2*pad,zs*8,lx+pad,ly+pad+zs*9,'#fff');}
  ctx.restore();
  ctx.font='400 '+Math.max(8,Math.round(zs*3))+'px "Press Start 2P",monospace';ctx.fillStyle='rgba(255,255,255,.55)';ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(w.label.toUpperCase(),x0+8,y0+8);
}
function karaoke(e){
  if(typeof offworld==='function'){offworld(e);return;}
  if(e&&/Pigiama/.test(e.title)){say({name:'Host del Village',role:'Pigiama party finale',p:NPC.find(n=>n.id==='dj').p},{t:'L’ultima notte al Village: tutti in pigiama con la Family! Aperto a tutti i partecipanti.',c:[...(G.items&&G.items.banner&&!G.flags.banner?[{t:'🚩 Pianta lo stendardo del Marketers World',n:{t:'Lo pianti in mezzo al prato. Il vento lo apre e il logo si vede da lontano: tutti applaudono. È il finale giusto per questi tre giorni.',c:[{t:'Evviva!',n:null,act:plantBanner}]}}]:[]),{t:'Mi unisco al pigiama party!',n:{t:'Si balla, si ride e si chiude in bellezza i tre giorni.',c:[{t:'Che serata!',n:null,act:kDone}]}},{t:'Dopo',n:null}]});return;}
  if(G.min<22*60){info('Village','La sera al Village, dalle 22:00, «Palco - zona ristorante». Microfono libero.');return;}
  say({name:'Host del Village',role:'Karaoke',p:NPC.find(n=>n.id==='dj').p},{t:'Aperto a tutti i partecipanti del World. Il microfono è libero: che canzone scegli?',c:[
    {t:'Un classico italiano',n:{t:'La sala canta con te. Standing ovation!',c:[{t:'Inchino',n:null,act:kDone}]}},
    {t:'Una hit degli anni 2000',n:{t:'Dopo due stonature il pubblico ti salva cantando il ritornello. Che serata!',c:[{t:'Inchino',n:null,act:kDone}]}},
    {t:'Passo il microfono',n:null}]});
}
function kDone(){G.flags.kara=true;G.flags.off++;G.min+=50;A.stamp();toast('Karaoke al Village vissuto!');}
function meetNow(m){
  const pe=G.people.find(x=>x.id===m.pid),n={id:pe.id,name:pe.name,role:pe.job+' · '+pe.city,p:pe.pal,kind:'att',job:pe.job,fam:pe.fam,gender:pe.gender};
  const tip=tipFor(pe.fam),tp=chTopics(n,1)[0],r=chRng(n,'mn');
  say(n,{t:chPick(r,['Ciao '+pname()+'! Che bello incontrarti di persona. Allora, di cosa ti occupi?','Eccoti, '+pname()+'! Puntualissimo. Sediamoci un attimo: raccontami di te.','Piacere di vederti dal vivo! Parliamo un po’ di lavoro?','Ciao '+pname()+'! Ho aspettato questo incontro da quando ci siamo scritti.']),c:[
    ...jobChoices(n,()=>doneMeet(m,n),true),
    topicChoice(n,tp,()=>doneMeet(m,n)),
    {t:'Scusa, devo scappare',n:null}]});
}
function doneMeet(m,n){G.meets=G.meets.filter(x=>x!==m);G.flags.meet++;addContact(n);G.min+=30;A.stamp();}

/* ============================================================ riattivazione: micro rhythm game */
const POSES=['Montagna','Guerriero','Albero','Respiro','Cobra','Guerriero','Albero','Montagna'];
function startReact(e){
  const r=mulberry32(hashStr(G.seed+'|react'+e.id)),notes=[],beat=.625,lead=2.2;
  for(let i=0;i<14;i++)notes.push({t:lead+i*beat,lane:Math.floor(r()*3),res:null,fl:0});
  G.react={e,t:0,notes,beat,fall:1.6,hits:0,perfect:0,miss:0,done:false,end:lead+14*beat+1.4,fx:[],combo:0};
  closeDlg();A.blip();
}
function startRhythm(cfg){
  const r=mulberry32(hashStr(G.seed+'|rh'+cfg.kind+(cfg.seed||''))),notes=[],lead=2.2,beat=cfg.beat;
  for(let i=0;i<cfg.n;i++)notes.push({t:lead+i*beat,lane:Math.floor(r()*3),res:null,fl:0});
  G.react={cfg,e:null,t:0,notes,beat,fall:cfg.fall||1.6,hits:0,perfect:0,miss:0,done:false,end:lead+cfg.n*beat+1.4,fx:[],combo:0,lead};
  closeDlg();A.blip();
}
function reactHit(lane){
  const R=G.react;if(!R||R.done)return;
  let best=null,bd=.3;for(const n of R.notes){if(n.res||n.lane!==lane)continue;const d=Math.abs(n.t-R.t);if(d<bd){bd=d;best=n;}}
  R.lastLane=lane;R.lastT=R.t;
  if(!best){R.combo=0;return;}
  best.res=bd<.1?'perfect':'good';best.fl=.4;R.hits++;R.combo++;if(bd<.1)R.perfect++;A.tone(520+lane*160,.12,'triangle',.08,700+lane*160);
}
function updateReact(dt){
  const R=G.react;R.t+=dt;
  for(const n of R.notes)if(!n.res&&R.t>n.t+.3){n.res='miss';R.miss++;R.combo=0;}
  for(const n of R.notes)if(n.fl>0)n.fl-=dt;
  if(!R.done&&R.t>R.end&&R.cfg){R.done=true;G.react=null;R.cfg.onDone(R);return;}
  if(!R.done&&R.t>R.end){
    R.done=true;const sc=R.hits/R.notes.length;
    G.flags.react++;G.seen.add(R.e.id);G.min=Math.max(G.min,R.e.e);A.stamp();
    const msg=sc>=.85?'Ti senti rinato!':sc>=.5?'Più leggero di prima.':'Almeno hai respirato.';
    G.react=null;
    say({name:'Jo Dunica',role:'Riattivazione · Main Stage',p:NPC.find(n=>n.id==='yoga').p},{t:'Riattivazione finita: '+R.hits+'/'+R.notes.length+' respiri a tempo ('+R.perfect+' perfetti). '+msg,c:[{t:'Grazie!',n:null,act:()=>{addTip('Una pausa di respiro a metà giornata aiuta a seguire meglio gli speech.','Riattivazione');}}]});
  }
}
function drawReact(){
  const R=G.react,t=G.t;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a1040');g.addColorStop(1,'#05060d');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // host
  const hs=Math.max(3,Math.floor(Math.min(W,H)/110)),bi=Math.max(0,Math.floor((R.t-1)/R.beat)),pose=POSES[bi%POSES.length];
  if(R.cfg)R.cfg.scene(R,hs);else{
  ctx.save();ctx.translate(W/2,H*.3);ctx.scale(hs,hs);ctx.imageSmoothingEnabled=false;
  person(ctx,0,10,0,0,{shirt:'#7ad37a',pants:'#e8e8f0',skin:'#e0b085',hair:'#4a3322',long:true,badge:'#7ad37a'});
  ctx.strokeStyle='#7ad37a';ctx.lineWidth=2;ctx.lineCap='round';const up=Math.floor(R.t/R.beat)%2;
  ctx.beginPath();ctx.moveTo(-5,-9);ctx.lineTo(-9,up?-20:-4);ctx.moveTo(5,-9);ctx.lineTo(9,up?-20:-4);ctx.stroke();ctx.restore();
  ctx.font='700 '+Math.round(Math.min(W,520)/20)+'px "Press Start 2P",monospace';ctx.fillStyle='#ffd24d';ctx.textAlign='center';ctx.fillText(pose.toUpperCase(),W/2,H*.3+hs*16);
  ctx.font='600 '+Math.round(Math.min(W,520)/26)+'px "Space Grotesk",sans-serif';ctx.fillStyle='#bcd';ctx.fillText('Riattivazione con Jo Dunica · respira a tempo',W/2,H*.08);}
  // corsie
  const lw=Math.min(W/3.2,150),x0=W/2-lw*1.5,top=H*.42,hit=H*.86;
  const cols=['#4dd0ff','#ff6a3d','#7ad37a'],keys=['A / ←','S / ↓','D / →'];
  for(let l=0;l<3;l++){ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(x0+l*lw+4,top,lw-8,hit-top+30);
    ctx.strokeStyle=cols[l];ctx.lineWidth=3;ctx.beginPath();ctx.arc(x0+l*lw+lw/2,hit,lw*.28,0,7);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='600 12px "Space Grotesk",sans-serif';ctx.fillText(keys[l],x0+l*lw+lw/2,hit+lw*.28+18);
    if(R.lastLane===l&&R.t-R.lastT<.15){ctx.fillStyle=cols[l]+'66';ctx.beginPath();ctx.arc(x0+l*lw+lw/2,hit,lw*.3,0,7);ctx.fill();}}
  for(const n of R.notes){const d=(n.t-R.t)/R.fall;if(d>1.05||d<-.2)continue;const y=hit-d*(hit-top);const x=x0+n.lane*lw+lw/2;
    if(n.res==='miss'){ctx.globalAlpha=.3;}
    if(n.res&&n.res!=='miss'){ctx.fillStyle=cols[n.lane];ctx.globalAlpha=Math.max(0,n.fl/.4);ctx.beginPath();ctx.arc(x,hit,lw*.28*(1.8-n.fl),0,7);ctx.fill();ctx.globalAlpha=1;continue;}
    ctx.fillStyle=cols[n.lane];ctx.beginPath();ctx.arc(x,y,lw*.2,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.arc(x-lw*.05,y-lw*.05,lw*.07,0,7);ctx.fill();ctx.globalAlpha=1;}
  ctx.fillStyle='#fff';ctx.font='700 '+Math.round(Math.min(W,520)/24)+'px "Space Grotesk",sans-serif';ctx.textAlign='center';
  ctx.fillText((R.cfg&&R.cfg.label||'A tempo')+': '+R.hits+'/'+R.notes.length+(R.combo>2?'   ×'+R.combo:''),W/2,H*.96);
  if(R.t<1.8){ctx.fillStyle='rgba(255,255,255,'+Math.min(1,(1.8-R.t))+')';ctx.fillText(R.cfg?R.cfg.hint:'Premi A S D (o tocca le tre corsie) quando il respiro arriva al cerchio',W/2,H*.38);}
}

/* ============================================================ passaporto e telefono */
function quests(){
  const F=G.flags,nst=Object.keys(F.stands).length;
  return[
    ...(VILLAGE_ON?[{t:'Sali sulla navetta per il Marketers World',s:'Dal Marketers Village, alla fermata in basso',ok:F.bus}]:[]),
    {t:'Attiva l’app dell’evento (nel gioco)',s:'Fuori dall’Ingresso A, a destra',ok:F.app},
    {t:'Ritira l’accredito',s:'Fuori dall’Ingresso A, a sinistra',ok:F.accred},
    {t:'Segui un workshop del venerdì',s:'Prenotalo nell’app e vai nella sala giusta',ok:F.ws>=1},
    {t:'Segui 2 speech dal palco',s:'Sabato o domenica, Sala della Piazza ('+F.talk+'/2)',ok:F.talk>=2},
    {t:'Fai un meeting dall’app',s:'Scheda Networking, poi Area networking ('+F.meet+'/1)',ok:F.meet>=1},
    {t:'Fai rete nel tuo settore',s:'Incontra 3 persone vicine al tuo mestiere ('+Math.min(3,F.hot)+'/3)',ok:F.hot>=3},
    {t:'Ricevi una proposta di collaborazione',s:'Dalla talent scout, da sabato vicino all’Area networking',ok:F.offer},
    {t:'Scrivi un post su Marketers Pro',s:'Pulsante Marketers Pro o scheda dell’app',ok:cmEnsure().posts.length>=1},
    {t:'Fatti riconoscere dalla community',s:'Pubblica un post: chi hai incontrato di persona può commentarlo',ok:cmHasMetComment(cmT())},
    ...(typeof extrasNPC==='function'?[
      {t:(F.pets||0)>=2?'Saluta CatGPT e Alpachino':'???? ?????? ?? ?????????',s:(F.pets||0)>=2?'Il gatto grigio e l’alpaca girano per la mappa':'Obiettivo segreto',ok:(F.pets||0)>=2},
      ...(typeof itemQuests==='function'?itemQuests():[]),
      ...(typeof sqQuests==='function'?sqQuests():[]),
      ...(typeof trophyQuest==='function'?trophyQuest():[]),
      {t:(F.friends||0)>=5?'Incontra gli amici del gruppo':'?????? ?? ?????? ???????',s:(F.friends||0)>=5?'Persone sparse tra Palacongressi e Village':'Obiettivo segreto',ok:(F.friends||0)>=5}]:[]),
    {t:'Scambia 5 contatti',s:'Parla con le persone ('+G.contacts.length+'/5)',ok:G.contacts.length>=5},
    {t:'Visita 3 stand',s:'Atrio nord ('+nst+'/3)',ok:nst>=3},
    {t:'Incontra Dario e Luca',s:'Girano per il Palacongressi: cercali (puntino dorato sopra la testa)',ok:F.dario&&F.luca},
    {t:'Fatti firmare un libro',s:'Stand Urlico Hoepli (ven 16:00 Dario Vignali)',ok:F.sign},
    {t:'Fai la Riattivazione',s:'Micro sessione di yoga sul Main Stage, sabato e domenica',ok:F.react>0},
    {t:'Yoga Silent Party',s:'Main stage silent, venerdì 18:15',ok:F.party},
    ...(typeof sunQuest==='function'?sunQuest():[]),
    {t:'Karaoke all’Offworld',s:'Al Marketers Village, dalle 22:00 (canta una canzone)',ok:F.kara},
    {t:'Pigiama party finale',s:'Domenica dalle 22:00, al Marketers Village',ok:!!F.pjp},
    {t:'Gioca a un Game Quiz',s:'Stand nell’atrio, venerdì',ok:F.quiz>=1},
    {t:'Scatta una foto ricordo',s:'Pulsante 📷 o tasto F',ok:F.selfie}
  ];
}
function progress(){const q=quests();return{done:q.filter(x=>x.ok).length,tot:q.length};}
let phoneTab='home',progDay=null,progMine=false,progFor=false,progHide=true,progScroll=false,netTab='rec',netOpen=null;
function openPhone(tab){if(tab==='prog'){progDay=G.day;progScroll=true;}$('#phT').style.display='';$('#phH').textContent='MW26 · APP';$('#phone').classList.remove('solo');if(!G.flags.app){toast('L’app dell’evento (nel gioco) si attiva all’Assistenza app, fuori dall’Ingresso A.');return;}phoneTab=tab||phoneTab;$('#phone').classList.remove('hide');renderPhone();}
function openPro(){if(!G)return;phoneTab='comm';cmPerson=null;$('#phone').classList.remove('hide');$('#phone').classList.toggle('solo',!G.flags.app);$('#phT').style.display=G.flags.app?'':'none';$('#phH').textContent='MARKETERS PRO';renderPhone();}
function closePhone(){$('#phone').classList.add('hide');}
const TAGC={'AI':'#8a5cf0','Business':'#1ea0e8','Growth & Advertising':'#2a5af0','Brand & Comunicazione':'#5a4adf','Social & Creator':'#e08a20','Economics':'#0f9a6a','Mindset & Lifestyle':'#e03a3a'};
const forMe=e=>(e.tags||[]).some(t=>JOBFAM[ME().fam].tags.includes(t));
const tagH=t=>`<span class="tg"><i style="background:${TAGC[t]||'#888'}"></i>${esc(t)}</span>`;
const EXTRAROOM={'Area networking':{f:0,x:225,y:694}};
function roomPos(r){return (typeof ROOMS!=='undefined'&&ROOMS[r])||EXTRAROOM[r]||null;}
function goBtn(room){const r=roomPos(room);return r?`<button class="pb ghost" data-dst="${esc(room)}">★ Portami qui</button>`:'';}
function sessCard(e){
  const past=x=>!G.sandbox&&(x.d<G.day||(x.d===G.day&&x.e<=G.min));
  const booked=G.booked.has(e.id),saved=G.saved.has(e.id),conf=!booked&&e.kind==='ws'&&conflictWith(e);
  let btn='';
  if(G.seen.has(e.id))btn='<button class="pb ok" disabled>Concluso ✓ · seguito</button>';
  else if(e.kind==='ws'){btn=booked&&past(e)?'<button class="pb occ" disabled>Concluso</button>':booked?`<button class="pb ok" data-bk="${e.id}">Prenotato ✓</button>`:past(e)?'<button class="pb occ" disabled>Concluso</button>':conf?'<button class="pb occ" disabled>Slot occupato</button>':`<button class="pb" data-bk="${e.id}">Prenota</button>`;}
  else if(e.kind==='lounge'){btn='';}
  else if(past(e))btn='<button class="pb occ" disabled>Concluso</button>';
  else btn=`<button class="pb ghost" data-sv="${e.id}">${saved?'✓ In agenda':'Salva in agenda'}</button>`;
  const kt={mk:'INGRESSO LIBERO, SENZA PRENOTAZIONE',free:'INGRESSO LIBERO, SENZA PRENOTAZIONE',game:'GAME QUIZ',sign:'FIRMACOPIE',party:'PARTY',karaoke:'VILLAGE',meetup:'MEETUP · SUNFLOWER',react:'RIATTIVAZIONE · MINI GIOCO',talk:e.invented?'SPEECH · INVENTATO':'SPEECH'}[e.kind]||'';
  return `<div class="sc ${booked?'mine':''}" data-past="${past(e)?1:0}"><div class="tm">${hm(e.start)}–${hm(e.e%1440)}${kt?` <span class="kt">${kt}</span>`:''}</div><div class="tt">${e.kind==='sign'?'Firmacopie con '+esc(e.sp):esc(e.title)}</div>${e.kind==='sign'?'<div class="rm">📖 '+esc(e.title.replace(/^.*? - /,''))+'</div>':''}<div class="rm">📍 ${esc(e.room)}</div>${e.sp?`<div class="sp">${esc(e.sp)}<small>${esc(e.role||'')}</small>${typeof spkNote==='function'?spkNote(e.sp):''}</div>`:''}<div class="tags">${forMe(e)?'<span class="tg me">★ Per te</span>':''}${(e.tags||[]).map(tagH).join('')}</div>${btn}${goBtn(e.room)}</div>`;
}
function meetOptions(){
  const out=[];
  for(let d=G.day;d<=2&&out.length<8;d++)for(let t=9*60+30;t<=18*60+30&&out.length<8;t+=30){
    if(d===G.day&&t<G.min+25)continue;
    const probe={d,start:t,e:t+30};
    if([...G.booked].some(id=>overlaps(BYID[id],probe)))continue;
    if(G.meets.some(m=>m.day===d&&m.start===t))continue;
    out.push({d,t});}
  return out;
}
function askMeeting(pid){
  const pe=G.people.find(x=>x.id===pid),ops=meetOptions();
  const B=$('#phB');
  B.innerHTML=`<div class="back" id="bk">‹ Indietro</div><h3 class="h3">Meeting con ${esc(pe.name)}</h3><div class="note" style="margin:0 0 10px">${esc(pe.job)} · ${esc(pe.city)} · compatibilità ${pe.compat}%</div><div class="note" style="margin:0 0 8px">Scegli un orario libero (le tue sessioni prenotate sono escluse). Luogo: Area networking.</div>`+(ops.length?ops.map((o,i)=>`<button class="opt2" data-o="${i}"><b>${DAYNAMES[o.d]} · ${hm(o.t)}</b><span>Area networking, 30 minuti</span></button>`).join(''):'<div class="note">Nessun orario libero.</div>');
  $('#bk').onclick=renderPhone;
  B.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const o=ops[+b.dataset.o];if(Math.random()<.18+ (1-pe.compat/100)*.25){toast(pe.name+' non è disponibile in quell’orario. Prova un’altra fascia.',2800);return;}
    G.meets.push({pid,day:o.d,start:o.t});toast(pe.name+' ha accettato: '+DAYNAMES[o.d]+' '+hm(o.t)+', Area networking.',3200);A.stamp();phoneTab='agenda';renderPhone();});
}
function personCard(pe,big){return `<div class="pcard ${big?'':'sm'}"><div class="av">${faceImg(pe.pal,'avi')}</div><div class="pi"><b>${esc(pe.name)}</b><small>${esc(pe.job)} · ${esc(pe.city)}</small><em>${esc(pe.tag)}</em><span class="tm2">${pe.compat}% compatibile</span></div><button class="pb" data-mt="${pe.id}">Meeting</button></div>`;}
function keepPhone(){const y=$('#phB').scrollTop;renderPhone();$('#phB').scrollTop=y;}
function renderPhone(){
  phClock();
  const T=[['home','Home','⌂'],['prog','Programma','▦'],['agenda','Agenda','✓'],['net','Rete','☺'],['comm','Marketers Pro','🌐']];
  const tb=([k,n,i])=>`<button data-k="${k}" class="${phoneTab===k?'on':''}"><span>${i}</span>${n}</button>`;$('#phT').innerHTML=T.slice(0,2).map(tb).join('')+'<button class="qrb" id="qrb">▣</button>'+T.slice(2).map(tb).join('');{const u=cmUnread(cmT()),cb=document.querySelector('#phT [data-k=comm]');if(cb&&u&&phoneTab!=='comm')cb.insertAdjacentHTML('beforeend','<i class="bdg">'+u+'</i>');}
  document.querySelectorAll('#phT [data-k]').forEach(b=>b.onclick=()=>{if(b.dataset.k==='prog'&&phoneTab!=='prog'){progDay=G.day;progScroll=true;}phoneTab=b.dataset.k;if(typeof cmPerson!=='undefined'&&b.dataset.k==='comm')cmPerson=null;renderPhone();});
  $('#qrb').onclick=()=>showQR();
  const B=$('#phB');B.scrollTop=0;
  const bind=()=>{
    B.querySelectorAll('[data-bk]').forEach(b=>b.onclick=()=>{const id=+b.dataset.bk;if(!G.sandbox&&!G.booked.has(id)&&(BYID[id].d<G.day||(BYID[id].d===G.day&&BYID[id].e<=G.min))){toast('Questa sessione è già finita.');return;}if(G.booked.has(id)){G.booked.delete(id);toast('Prenotazione annullata.');}else{G.booked.add(id);toast('Posto prenotato!');A.blip();}keepPhone();});
    B.querySelectorAll('[data-dst]').forEach(b=>b.onclick=()=>{const n=b.dataset.dst,r=roomPos(n);if(!r)return;G.dest={n,f:r.f,x:k(r.x),y:k(r.y)};closePhone();toast('Destinazione: '+n,2200);});
    B.querySelectorAll('[data-gw]').forEach(b=>b.onclick=()=>{toggleWear(b.dataset.gw);renderPhone();});
    B.querySelectorAll('[data-sv]').forEach(b=>b.onclick=()=>{const id=+b.dataset.sv;if(G.saved.has(id))G.saved.delete(id);else G.saved.add(id);keepPhone();});
    B.querySelectorAll('[data-mt]').forEach(b=>b.onclick=()=>askMeeting(b.dataset.mt));
    B.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const [t,d]=b.dataset.go.split(':');if(t==='prog'){progScroll=true;progDay=(d!=null&&d!=='')?+d:G.day;phoneTab='prog';renderPhone();return;}if(t==='notes'){phoneTab='net';netTab='tips';netOpen=null;renderPhone();return;}phoneTab=t;if(d!=null&&d!=='')progDay=+d;renderPhone();});
  };
  if(phoneTab==='home'){
    const nw=[...G.booked].filter(id=>BYID[id].kind==='ws'&&!G.seen.has(id)&&(BYID[id].d>G.day||(BYID[id].d===G.day&&BYID[id].e>G.min))).length,p=progress();
    const ag=[...G.booked,...G.saved].map(id=>BYID[id]).filter(e=>e.d>G.day||(e.d===G.day&&e.e>G.min)).sort((a,b)=>a.d-b.d||a.start-b.start).slice(0,3);
    B.innerHTML=`<div class="hero"><canvas id="heroc" width="400" height="190"></canvas><div class="ht"><small>👋 ${G.min<12*60?'Buongiorno':G.min<18*60?'Buon pomeriggio':'Buonasera'}</small><h2>${PLAYER.gender==='f'?'Bentornata':'Bentornato'},<br><em>${esc(pname())}.</em></h2><small style="opacity:.85">${esc(ME().job)}</small></div><div class="hb"><span>● ${['VEN','SAB','DOM'][G.day]} ${hm(Math.floor(G.min))}</span><span>16·17·18 OTT</span><span>PALACONGRESSI</span></div></div>
     ${typeof scoreCard==='function'?scoreCard():''}${typeof sqCard==='function'?sqCard():''}
     <div class="bn" data-go="prog:${G.day}">${nw?`🎟 Hai ancora <b>${nw}</b> workshop prenotat${nw>1?'i':'o'}. Scegline altri nel programma →`:'🎟 Nessun workshop in programma. Prenotane uno dal programma di venerdì →'}</div>
     <div class="sec">// ESPLORA IL MW26</div><div class="tiles"><button data-go="prog:">▦<b>Programma</b></button><button data-go="comm">🌐<b>Marketers Pro</b></button><button data-go="speak">🎙<b>Speaker</b></button><button data-go="ann">📣<b>Annunci</b></button><button data-go="az">🏢<b>Aziende</b></button><button data-go="off">🎉<b>OffWorld</b></button><button data-go="notes">📝<b>Appunti (${G.tips.length})</b></button><button data-go="nlog">🔔<b>Notifiche (${(G.nlog||[]).length})</b></button><button data-go="trophy">🏆<b>Trofei (${typeof trophyCount==='function'?trophyCount()+'/'+trophyTotal():'0'})</b></button><button data-go="pass">🏅<b>Obiettivi ${p.done}/${p.tot}</b></button></div>
     <div class="sec">// IN AGENDA <a data-go="agenda">Tutta l’agenda →</a></div>${ag.length?ag.map(e=>`<div class="ai"><div class="ad"><small>${['VEN','SAB','DOM'][e.d]}</small><b>${hm(e.start)}</b></div><div><small class="kk">${e.kind==='ws'?'WORKSHOP':e.kind==='talk'?'SPEECH':'EVENTO'}</small><b>${esc(e.title.length>60?e.title.slice(0,58)+'…':e.title)}</b><small>${esc(e.room)}</small></div></div>`).join(''):'<div class="note">Niente in agenda. Prenota un workshop dal Programma.</div>'}
     <div class="sec">// PERSONE DA CONOSCERE <a data-go="net">Vedile tutte →</a></div><div class="hs">${G.people.slice(0,5).map(pe=>personCard(pe)).join('')}</div>
     ${typeof glassesRow==='function'?glassesRow():''}
     <div class="sec">// ULTIMO ANNUNCIO</div><div class="ann"><small>13 OTT · 18:00</small><b>Benvenuti a Rimini!</b><span>Ritira il badge fuori dall’Ingresso A e attiva l’app dell’evento all’Assistenza: dentro trovi programma, workshop e networking.</span></div>
     <div class="spread"><b>Fai sapere che ci sarai</b><span>La tua card per le storie e LinkedIn, pronta in un tocco.</span><button id="card">Crea la tua card</button></div>
     <button class="btn ghost" id="nextDayBtn" style="width:100%;margin:10px 0">${G.day>=2?'🏁 Concludi il weekend':'🌙 Passa a '+['Sabato','Domenica'][G.day]}</button>
     <div class="note">Realizzato da Olivieri Domenico usando Claude Code. Progetto just for fun, privato: non è divulgato altrove, se non dentro l’ambiente Marketers. Fan project non ufficiale. Programma (titoli, speaker, sale e orari) dal programma dell’app; contenuti delle slide e partecipanti inventati.</div>`;
    const hc=$('#heroc').getContext('2d');hc.imageSmoothingEnabled=false;hc.drawImage(FL[0].cv,k(470),k(600),k(330),k(160),0,0,400,190);hc.fillStyle='rgba(10,16,50,.55)';hc.fillRect(0,0,400,190);
    $('#card').onclick=()=>{closePhone();photo();};
    $('#nextDayBtn').onclick=()=>{closePhone();askNextDay();};
    bind();
  }else if(phoneTab==='prog'){
    if(progDay==null)progDay=G.day;
    const pastE=x=>!G.sandbox&&(x.d<G.day||(x.d===G.day&&x.e<=G.min));
    const list=PROGRAMMA.filter(e=>e.d===progDay&&e.kind!=='lounge'&&(!progHide||!pastE(e))&&(!progMine||G.booked.has(e.id)||G.saved.has(e.id))&&(!progFor||forMe(e)));
    B.innerHTML=`<div class="chips2">${DAYNAMES.map((n,i)=>`<button data-d="${i}" class="${progDay===i?'on':''}">${n}</button>`).join('')}<button id="mine" class="${progMine?'on':''}">I miei</button><button id="forme" class="${progFor?'on':''}">★ Per te</button><button id="hidep" class="${progHide?'on':''}">Nascondi svolti</button></div>`+'<div class="note" style="margin:0 0 8px">Titoli, speaker, sale e orari vengono dal programma dell’app; i contenuti delle slide sono inventati per il gioco.</div>'+(list.length?list.map(sessCard).join(''):'<div class="note">'+(progHide?'Niente da mostrare: le sessioni di questo giorno sono già concluse (tocca «Nascondi svolti» per rivederle).':'Niente da mostrare.')+'</div>');
    B.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{progDay=+b.dataset.d;renderPhone();});$('#mine').onclick=()=>{progMine=!progMine;renderPhone();};$('#forme').onclick=()=>{progFor=!progFor;renderPhone();};$('#hidep').onclick=()=>{progHide=!progHide;progScroll=true;renderPhone();};bind();
    if(progScroll){progScroll=false;const f=B.querySelector('.sc[data-past="0"]');if(f&&!progHide)setTimeout(()=>{B.scrollTop=Math.max(0,f.offsetTop-90);},30);}
  }else if(phoneTab==='agenda'){
    const items=[...G.booked,...G.saved].map(id=>BYID[id]);
    const ms=G.meets.map(m=>({d:m.day,start:m.start,e:m.start+30,title:'Meeting con '+G.people.find(p=>p.id===m.pid).name,room:'Area networking',kind:'meet',tags:[],sp:'',role:''}));
    const all=[...items,...ms].sort((a,b)=>a.d-b.d||a.start-b.start);
    B.innerHTML=all.length?all.map(e=>e.kind==='meet'?`<div class="sc mine"><div class="tm">${DAYNAMES[e.d]} · ${hm(e.start)} <span class="kt">NETWORKING</span></div><div class="tt">${esc(e.title)}</div><div class="rm">📍 ${esc(e.room)}</div>${goBtn(e.room)}</div>`:`<div class="sc ${G.booked.has(e.id)&&!G.seen.has(e.id)?'mine':''}"><div class="tm">${DAYNAMES[e.d]} · ${hm(e.start)}–${hm(e.e%1440)}${G.seen.has(e.id)?' <span class="kt">CONCLUSO ✓</span>':''}</div><div class="tt">${esc(e.title)}</div><div class="rm">📍 ${esc(e.room)}</div>${goBtn(e.room)}</div>`).join(''):'<div class="note">La tua agenda è vuota. Prenota un workshop dal Programma o proponi un meeting dal Networking.</div>';bind();
  }else if(phoneTab==='net'){
    const nc=G.contacts.length,nt=G.tips.length;
    const tabs=`<div class="cfil"><button data-nv="rec" class="${netTab==='rec'?'on':''}">Consigliati</button><button data-nv="con" class="${netTab==='con'?'on':''}">👥 I miei contatti (${nc})</button><button data-nv="tips" class="${netTab==='tips'?'on':''}">📝 I miei appunti (${nt})</button></div>`;
    const when=at=>at==null?'—':DAYNAMES[Math.min(2,Math.floor(at/1440))]+' '+hm(((at%1440)+1440)%1440);
    let body='';
    if(netTab==='rec')body=`<div class="note" style="margin:0 0 10px">Persone consigliate per te in base al tuo mestiere («${esc(ME().job)}») e a cosa cerchi: più la percentuale è alta, più siete vicini. Proponi un meeting: se accetta, vi vedete all’Area networking all’orario scelto. Persone inventate.</div>`+G.people.filter(pe=>!(G.xpeople||[]).includes(pe)).map(pe=>personCard(pe,true)).join('');
    else if(netTab==='con')body=nc?`<div class="note" style="margin:0 0 10px">Le persone con cui hai scambiato i contatti in questa partita. Tocca un contatto per i dettagli.</div>`+G.contacts.map((c,i)=>({c,i})).reverse().map(({c,i})=>{
      const at=c.at!=null?c.at:(G.comm&&G.comm.metT&&G.comm.metT[c.name]),open=netOpen===i,pe=G.people.find(x=>x.name===c.name);
      return `<div class="pcard ct ${open?'open':''}"><button class="ctb" data-ct="${i}">${faceImg(c.p||facePal(c.name,c.gender||genderOf(c.name)),'avi2')}<div class="pi"><b>${esc(c.name)}</b><small>${esc(c.role||'')}</small><em>Incontrat${(c.gender||genderOf(c.name))==='f'?'a':'o'}: ${when(at)}${c.place?' · '+esc(c.place):''}</em></div></button>`+`<div class="ctd">${open?`<div class="note" style="margin:6px 0">${esc(c.name)} ti ha lasciato il contatto${c.place?' vicino a «'+esc(c.place)+'»':''}. Su Marketers Pro puoi vedere se ha commentato i tuoi post.</div>`:''}<div class="crow2"><button class="pb" data-mtc="${i}">Proponi un meeting</button><button class="pb ghost" data-cgo="${i}">Vedi su Marketers Pro</button></div></div></div>`;}).join(''):'<div class="note">Ancora nessun contatto. Parla con le persone che incontri e scegli “Scambiamoci i contatti”.</div>';
    else body=nt?`<div class="note" style="margin:0 0 10px">I consigli e gli appunti che hai raccolto in questa partita.</div>`+G.tips.slice().reverse().map(t=>`<div class="pg"><b>«${esc(t.t)}»</b><br><small style="color:var(--dim)">${esc(t.src||'')}${t.at!=null?' · '+when(t.at):''}</small></div>`).join(''):'<div class="note">Ancora nessun appunto. Prendi appunti durante gli speech (“Segna l’appunto”) o chiedi consigli a chi incontri.</div>';
    B.innerHTML=tabs+body;
    B.querySelectorAll('[data-nv]').forEach(b=>b.onclick=()=>{netTab=b.dataset.nv;netOpen=null;renderPhone();});
    B.querySelectorAll('[data-mtc]').forEach(b=>b.onclick=()=>askMeeting(personFor(G.contacts[+b.dataset.mtc]).id));
    B.querySelectorAll('[data-cgo]').forEach(b=>b.onclick=()=>cmShowPerson(G.contacts[+b.dataset.cgo].name));
    B.querySelectorAll('[data-ct]').forEach(b=>b.onclick=()=>{const i=+b.dataset.ct;netOpen=netOpen===i?null:i;const y=B.scrollTop;renderPhone();B.scrollTop=y;});
    bind();
  }else if(phoneTab==='comm'){
    renderComm(B);
  }else if(phoneTab==='speak'){
    const seen=new Map();PROGRAMMA.filter(e=>e.sp&&e.kind!=='lounge'&&!/arrivo/i.test(e.title)||/Bacchi/.test(e.sp||'')).forEach(e=>{if(e.sp&&!seen.has(e.sp))seen.set(e.sp,e);});
    B.innerHTML=`<div class="back" data-go="home">‹ Home</div><div class="note" style="margin:0 0 10px">Speaker presenti nel programma (dal programma pubblico), ${seen.size} nomi.</div>`+[...seen.values()].map(e=>`<div class="pg"><b>${esc(e.sp)}</b><br><span style="color:var(--dim)">${esc(e.role||'')}</span><br><small>${DAYNAMES[e.d]} ${hm(e.start)} · ${esc(e.room)}</small>${typeof spkNote==='function'?spkNote(e.sp):''}</div>`).join('');bind();
  }else if(phoneTab==='az'){
    const az=[['Canva','Sala by CANVA'],['FINECO','Sala Finance by FINECO'],['Active Powered','Sala by Active Powered'],['Building Production','Sala Real Estate by Building Production'],['Urlico Hoepli','Stand Urlico Hoepli'],['Marketers PRO','MK PRO con Ilaria Foresti']];
    B.innerHTML=`<div class="back" data-go="home">‹ Home</div>`+az.map(([n,r])=>`<div class="pg"><b>${esc(n)}</b><br><span style="color:var(--dim)">${esc(r)}</span></div>`).join('');bind();
  }else if(phoneTab==='off'){
    const ev=PROGRAMMA.filter(e=>['party','karaoke','sign','game'].includes(e.kind)).sort((a,b)=>a.d-b.d||a.start-b.start);
    B.innerHTML=`<div class="back" data-go="home">‹ Home</div>`+ev.map(sessCard).join('');bind();
  }else if(phoneTab==='trophy'){
    B.innerHTML=typeof trophyHtml==='function'?trophyHtml():'';bind();
  }else if(phoneTab==='nlog'){
    const L=(G.nlog||[]).slice().reverse();
    B.innerHTML=`<div class="back" data-go="home">‹ Home</div><div class="note" style="margin:0 0 10px">Storico delle notifiche di gioco, con l’ora in cui sono arrivate. Quelle di Marketers Pro sono nella scheda Marketers Pro › Notifiche.</div>`+(L.length?L.map(x=>`<div class="pg"><b>${esc(x.t)}</b><br><small style="color:var(--dim)">${['Ven','Sab','Dom'][x.d]||''} ${hm(x.m)}</small></div>`).join(''):'<div class="note">Ancora nessuna notifica.</div>');bind();
  }else if(phoneTab==='ann'){
    B.innerHTML=`<div class="back" data-go="home">‹ Home</div><div class="ann"><small>13 OTT · 18:00</small><b>Benvenuti a Rimini!</b><span>Ritira il badge fuori dall’Ingresso A e attiva l’app dell’evento all’Assistenza.</span></div><div class="ann"><small>10 OTT · 09:00</small><b>Kalemana Experience Festival</b><span>Yoga, workshop creativi e DJ set a Punta Marina di Ravenna: il festival di Yoga Academy e WeAreMarketers per anime libere, ribelli e sognatori.</span></div><div class="ann"><small>11 OTT · 13:37</small><b>Spread the Wor(l)d</b><span>Adesso puoi condividere sui social la tua presenza all’evento.</span></div>`;bind();
  }else if(phoneTab==='pass'){
    const p=progress(),q=quests();
    B.innerHTML=`<div class="back" data-go="home">‹ Home</div>${typeof scoreCard==='function'?scoreCard():''}<div class="ring" style="--p:${Math.round(p.done/p.tot*100)}"><b>${p.done}/${p.tot}</b></div>`+q.map(x=>`<div class="q ${x.ok?'done':''}"><div class="ck">${x.ok?'✓':''}</div><div><b>${esc(x.t)}</b><small>${esc(x.s)}</small></div></div>`).join('')+`<div class="note">Spunti raccolti: ${G.tips.length}</div><div style="margin-top:12px"><button class="btn ghost" id="finish" style="width:100%">Termina i tre giorni</button></div><div style="margin-top:12px"><button class="btn ghost" id="mapb" style="width:100%">Mappa</button></div>`;
    $('#finish').onclick=()=>{closePhone();endGame();};$('#mapb').onclick=()=>{closePhone();openMap();};bind();
  }else{
    B.innerHTML=`<div class="back" data-go="pass">‹ Obiettivi</div><canvas id="mapc" width="410" height="215"></canvas><div class="note">Pianta stilizzata, non in scala. ${esc(FACTS.piazza)}. ${esc(FACTS.anfi)}.</div><div style="margin-top:8px"><button class="btn ghost" id="mf" style="width:100%">${G.f===0?'Mostra il primo piano':'Mostra il piano terra'}</button></div>`;
    drawMap($('#mapc'),G.f);$('#mf').onclick=()=>{drawMap($('#mapc'),G.f===0?1:0,true);};bind();
  }
}
function showQR(){
  const B=$('#phB'),n=21;let g='';const r=mulberry32(hashStr('niky-badge'));
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const f=(x<7&&y<7)||(x>=n-7&&y<7)||(x<7&&y>=n-7);let on=r()<.5;if(f){const lx=x%(n-7)>=0?x:x,ex=(x<7?x:x-(n-7)),ey=(y<7?y:y-(n-7));on=(ex===0||ex===6||ey===0||ey===6||(ex>=2&&ex<=4&&ey>=2&&ey<=4));}
    if(on)g+=`<rect x="${x}" y="${y}" width="1" height="1"/>`;}
  B.innerHTML=`<div class="back" id="bk">‹ Indietro</div><div class="qrc"><svg viewBox="0 0 ${n} ${n}" width="200" height="200" shape-rendering="crispEdges" fill="#111"><rect width="${n}" height="${n}" fill="#fff"/>${g}</svg><b>${esc(pname())}</b><span>${esc(ME().job)}</span><span>Biglietto · Marketers World 2026</span><small>QR decorativo del gioco, non valido.</small></div>`;
  $('#bk').onclick=renderPhone;
}
function drawMap(cvm,f,other){const c=cvm.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#0a0d18';c.fillRect(0,0,cvm.width,cvm.height);c.drawImage(FL[f].cv,0,0,WW,WH,0,0,cvm.width,cvm.width*WH/WW);
  if(f===G.f){const s=cvm.width/WW;c.fillStyle='#fff';c.beginPath();c.arc(G.p.x*s,(G.p.y-6)*s,5,0,7);c.fill();c.fillStyle='#ff6a3d';c.beginPath();c.arc(G.p.x*s,(G.p.y-6)*s,3,0,7);c.fill();}}
$('#bPhone').onclick=()=>openPhone();$('#bComm').onclick=()=>{if($('#phone').classList.contains('hide'))openPro();else closePhone();};$('#phX').onclick=closePhone;
$('#bPhoto').onclick=()=>photo();
$('#bZin').onclick=()=>zoomStep(1);$('#bZout').onclick=()=>zoomStep(-1);$('#clock').onclick=()=>{if(!G||!G.sandbox||G.watching||G.react||DL||uiOpen())return;{const pv=G.day;G.day=(G.day+1)%3;G.min=9*60;toast('Sandbox: '+DAYNAMES[G.day]+' mattina.',1600);const m=typeof itemsNewDay==='function'?itemsNewDay(pv):[];if(m.length)setTimeout(()=>info('Sandbox · '+DAYNAMES[G.day],m.join('\n\n')),700);}};
$('#bSkip').onclick=()=>skipTime();
function skipTime(){if(!G||G.watching||G.react)return;G.min+=G.sandbox?60:15;toast(G.sandbox?'Passa un’ora.':'Passano 15 minuti.',1200);}
addEventListener('wheel',e=>{if(G&&mode==='play'&&!G.watching&&!G.react&&$('#phone').classList.contains('hide')&&$('#end').classList.contains('hide'))zoomStep(e.deltaY<0?1:-1);},{passive:true});
$('#goal').onclick=()=>$('#goal').classList.toggle('open');
$('#bSnd').onclick=()=>{A.on=!A.on;$('#bSnd').textContent=A.on?'🔊':'🔇';};


/* ============================================================ mappa consultabile */
const uiOpen=()=>!$('#phone').classList.contains('hide')||!$('#end').classList.contains('hide')||!$('#mapov').classList.contains('hide')||!$('#savem').classList.contains('hide')||!$('#roomm').classList.contains('hide');
const mapPlaces=()=>{
  const P=[];const add=(n,f,x,y,cat,rooms)=>P.push({n,f,x,y,cat,rooms});
  add('Ingresso A (principale)',0,632,770,'Ingressi');add('Ingresso B',0,180,356,'Ingressi');add('Ingresso C',0,918,460,'Ingressi');
  add('Accrediti (badge)',0,520,805,'Servizi');add('Assistenza app',0,745,805,'Servizi');
  add('Scale mobili (cambia piano)',0,630,610,'Servizi');add('Bistrot',0,312,658,'Servizi');add('Area networking',0,225,694,'Servizi');add('Bar',0,457,308,'Servizi');
  add('Main Stage · Sala della Piazza',0,651,470,'Sale',['Main Stage','Main stage silent','Sala della Piazza']);
  for(let i=1;i<=4;i++)add('Silent Stage '+i,0,ROOMS['Silent Stage '+i].x,ROOMS['Silent Stage '+i].y,'Sale',['Silent Stage '+i]);
  add('Sala Castello',0,920,255,'Sale',['Sala Castello']);
  STANDS.forEach(st=>add(st.label,0,st.x,st.y+30,'Stand',st.id==='pro'?['MK PRO con Ilaria Foresti']:st.id==='mkt'?['Stand Urlico Hoepli']:st.id==='tool'?['Game Quiz','Gamification']:null));
  add('Prato dello yoga',0,810,810,'Fuori');add('Fermata navetta per il Village',0,VG.shuttle.x,VG.shuttle.y,'Servizi');
  if(VILLAGE_ON){add('Offworld · karaoke e party',2,1052,715,'Village',['Village']);add('Fermata della navetta',2,VG.bus.x,VG.bus.y,'Servizi');add('Reception del Village',2,VG.recep.x,VG.recep.y,'Servizi');add('Bar del Village',2,VG.cafe.x,VG.cafe.y,'Servizi');add('Bacheca del Village',2,VG.board.x,VG.board.y,'Servizi');}
  add('Scale mobili (cambia piano)',1,630,610,'Servizi');
  ['Sala della Marina','Sala del Parco','Sala del Borgo','Sala by CANVA','Sala Finance by FINECO','Sala by Active Powered','Sala Real Estate by Building Production'].forEach(n=>add(n,1,ROOMS[n].x,ROOMS[n].y,'Sale',[n]));
  add('Sala dell’Anfiteatro',1,635,775,'Sale');add('Vuoto sulla Piazza (affaccio)',1,770,578,'Servizi');
  return P;
};
const FLN=['Piano terra','Primo piano','Marketers Village','Sunflower'];
let MAPF=0,MAPSEL=null,mapRaf=0,MAPDAY=0,MZ=1,MCX=0,MCY=0;
function mapClamp(cw,ch,sc){const vw=cw/sc,vh=ch/sc;MCX=vw>=WW?WW/2:Math.max(vw/2,Math.min(WW-vw/2,MCX));MCY=vh>=WH?WH/2:Math.max(vh/2,Math.min(WH-vh/2,MCY));}
function mapZoom(f,px,py){const cv=$('#mapcv2');if(!mapT)return;const w=cv.width,h=cv.height;if(px==null){px=w/2;py=h/2;}const wx=(px-mapT.ox)/mapT.sc,wy=(py-mapT.oy)/mapT.sc;MZ=Math.max(1,Math.min(6,MZ*f));const sc=mapT.base*MZ;MCX=wx-(px-w/2)/sc;MCY=wy-(py-h/2)/sc;}
function mapReset(){MZ=1;MCX=WW/2;MCY=WH/2;}
function openMap(){if(!G)return;MAPF=G.f;mapReset();MAPSEL=null;MAPDAY=G.day;$('#mapov').classList.remove('hide');mapList();mapLoop();}
function closeMap(){$('#mapov').classList.add('hide');cancelAnimationFrame(mapRaf);last=performance.now();}
const PDESC={
 'Ingresso A (principale)':'L’ingresso principale, con il portico ad arco. Fuori, a sinistra gli accrediti e a destra l’assistenza app. Dentro: reception, ascensori e scale mobili.',
 'Ingresso B':'Ingresso sul lato ovest: porta ai negozi e al Bistrot.','Ingresso C':'Ingresso sul lato est, verso il parcheggio. Vicino: WC e guardaroba.',
 'Accrediti (badge)':'Qui si ritira il badge: serve prima l’app attivata.','Assistenza app':'Qui si attiva l’app (email del biglietto e codice a 6 cifre).',
 'Scale mobili (cambia piano)':'Collegano il piano terra al primo piano (sale dei workshop e Anfiteatro).','Bistrot':'Area ristoro con tavoli: pausa pranzo e relax.',
 'Area networking':'Qui ti incontri con le persone con cui hai preso un Meeting dall’app.','Bar':'Bar temporaneo nell’atrio: un caffè al volo.',
 'Village (karaoke, party)':'Il Village: la sera karaoke con microfono libero e il pigiama party finale.','Prato dello yoga':'Il prato davanti all’ingresso, con le stuoie dello yoga.',
 'Sala dell’Anfiteatro':'Grande sala con sedute fisse (1.540 posti) e palco circolare. Nel gioco non ci sono sessioni qui.','Vuoto sulla Piazza (affaccio)':'Dal primo piano si vede dall’alto la Sala della Piazza.',
 'Main Stage · Sala della Piazza':'La sala principale (circa 4.700 posti): Main stage silent il venerdì, Main Stage nel weekend. Qui anche Riattivazione e Yoga Silent Party.'};
function mapList(){
  $('#mfl0').className=MAPF===0?'on':'';$('#mfl1').className=MAPF===1?'on':'';$('#mfl2').className=MAPF===2?'on':'';
  const P=mapPlaces(),box=$('#plist');box.innerHTML='';box.scrollTop=0;
  if(MAPSEL){const sel=MAPSEL,isDst=G.dest&&G.dest.n===sel.n&&G.dest.f===sel.f;
    const stand=STANDS.find(x=>x.label===sel.n);
    const wrap=document.createElement('div');
    let h=`<button id="pback" class="pbk">‹ Torna all’elenco</button><div class="pt">${esc(sel.n)}</div><div class="ps">${FLN[sel.f]}${sel.f!==G.f?' · tu sei all’altro piano: ti guido alle scale mobili':''}</div><button id="godst" class="pgo">★ Portami qui</button>${G.dest?'<button id="nodst" class="pno">Togli destinazione</button>':''}`;
    const d=PDESC[sel.n]||(stand?stand.info:'');if(d)h+=`<p class="pd">${esc(d)}</p>`;
    if(sel.rooms){const sc=roomSched(sel.rooms,MAPDAY);
      h+=`<h4>PROGRAMMA DELLA SALA</h4><div class="pdays">${DAYNAMES.map((n,i)=>`<button data-md="${i}" class="${MAPDAY===i?'on':''}">${n.split(' ')[0].slice(0,3)}</button>`).join('')}</div>`+(sc.length?sc.map(x=>{const now=MAPDAY===G.day&&G.min>=x.start&&G.min<x.e;return `<div class="pr ${now?'now':''}"><b>${hm(x.start)}–${hm(x.e%1440)}${now?' ▶ in corso':''}</b>${esc(x.title)}${x.sp?'<small>'+esc(x.sp)+(x.role?' · '+esc(x.role):'')+'</small>':''}</div>`;}).join(''):'<div class="pd">Nessuna sessione in questo giorno.</div>');}
    if(sel.n==='Ingresso A (principale)'||sel.cat==='Stand'&&!sel.rooms){}
    wrap.innerHTML=h;box.appendChild(wrap);
    $('#pback').onclick=()=>{MAPSEL=null;mapList();};
    $('#godst').onclick=()=>{G.dest={n:sel.n,f:sel.f,x:k(sel.x),y:k(sel.y)};toast('Destinazione: '+sel.n,2000);closeMap();};
    const nd=$('#nodst');if(nd)nd.onclick=()=>{G.dest=null;mapList();};
    wrap.querySelectorAll('[data-md]').forEach(b=>b.onclick=()=>{MAPDAY=+b.dataset.md;const y=box.scrollTop;mapList();box.scrollTop=y;});
    return;}
  const cats=['Ingressi','Sale','Stand','Servizi','Fuori'];
  const hint=document.createElement('div');hint.className='pd';hint.textContent='Tocca un posto sulla mappa o nell’elenco per vedere cosa c’è dentro.';box.appendChild(hint);
  cats.forEach(c=>{const L=P.filter(p=>p.cat===c&&p.f===MAPF);if(!L.length)return;const h=document.createElement('h4');h.textContent=c.toUpperCase();box.appendChild(h);
    L.forEach(p=>{const live=p.rooms?activeAt(p.rooms):null;const b=document.createElement('button');b.className=(G.dest&&G.dest.n===p.n&&G.dest.f===p.f?'dst':'');
      b.innerHTML=esc(p.n)+(live?`<small>ora: ${esc(live.title.length>40?live.title.slice(0,38)+'…':live.title)}</small>`:'')+(G.dest&&G.dest.n===p.n&&G.dest.f===p.f?'<small>★ destinazione</small>':'');
      b.onclick=()=>{MAPSEL=p;if(MZ<2.5)MZ=2.5;MCX=k(p.x);MCY=k(p.y);mapList();};box.appendChild(b);});});
}
function mapLoop(){
  const cvm=$('#mapcv2');if($('#mapov').classList.contains('hide'))return;
  const r=cvm.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);const cw=Math.max(200,Math.round(r.width*dpr)),ch=Math.max(160,Math.round(r.height*dpr));
  if(cvm.width!==cw||cvm.height!==ch){cvm.width=cw;cvm.height=ch;}
  const c=cvm.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#090b16';c.fillRect(0,0,cw,ch);
  const base=Math.min(cw/WW,ch/WH),sc=base*MZ;mapClamp(cw,ch,sc);const ox=cw/2-MCX*sc,oy=ch/2-MCY*sc;mapT={sc,ox,oy,dpr,base};
  c.fillStyle='#090b16';c.fillRect(0,0,cw,ch);c.drawImage(FL[MAPF].cv,0,0,WW,WH,ox,oy,WW*sc,WH*sc);
  const t=performance.now()/1000,P=mapPlaces().filter(p=>p.f===MAPF);
  for(const p of P){const x=ox+k(p.x)*sc,y=oy+k(p.y)*sc;c.fillStyle=MAPSEL===p?'#ffd24d':'rgba(255,255,255,.75)';c.strokeStyle='#0c1124';c.lineWidth=2;c.beginPath();c.arc(x,y,(MAPSEL===p?7:4)*dpr,0,7);c.fill();c.stroke();}
  if(MAPSEL&&MAPSEL.f===MAPF){const x=ox+k(MAPSEL.x)*sc,y=oy+k(MAPSEL.y)*sc;c.font='700 '+13*dpr+'px "Space Grotesk",sans-serif';c.textAlign='center';const w=c.measureText(MAPSEL.n).width+14*dpr;c.fillStyle='rgba(12,17,36,.92)';c.fillRect(x-w/2,y-30*dpr,w,20*dpr);c.fillStyle='#ffd24d';c.fillText(MAPSEL.n,x,y-15*dpr);}
  if(G.dest&&G.dest.f===MAPF){const x=ox+G.dest.x*sc,y=oy+G.dest.y*sc;c.fillStyle='#ff6a3d';c.beginPath();c.moveTo(x,y);c.lineTo(x-7*dpr,y-18*dpr);c.lineTo(x+7*dpr,y-18*dpr);c.fill();}
  if(G.f===MAPF){const x=ox+G.p.x*sc,y=oy+(G.p.y-6)*sc,pu=(t*1.6)%1;c.strokeStyle='rgba(255,106,61,'+(1-pu)+')';c.lineWidth=3*dpr;c.beginPath();c.arc(x,y,(8+pu*22)*dpr,0,7);c.stroke();
    c.fillStyle='#fff';c.beginPath();c.arc(x,y,8*dpr,0,7);c.fill();c.fillStyle='#ff6a3d';c.beginPath();c.arc(x,y,5*dpr,0,7);c.fill();
    c.font='700 '+13*dpr+'px "Space Grotesk",sans-serif';c.textAlign='center';const lb='Sei qui · '+pname();const w=c.measureText(lb).width+14*dpr;c.fillStyle='rgba(255,106,61,.95)';c.fillRect(x-w/2,y+12*dpr,w,20*dpr);c.fillStyle='#1a0a04';c.fillText(lb,x,y+27*dpr);}
  else{c.font='700 '+13*dpr+'px "Space Grotesk",sans-serif';c.textAlign='left';c.fillStyle='rgba(255,106,61,.95)';c.fillText('Tu sei: '+FLN[G.f],12*dpr,24*dpr);}
  mapRaf=requestAnimationFrame(mapLoop);
}
let mapT=null;
(function(){const cv=$('#mapcv2'),ptr=new Map();let moved=0,pd=0;
const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*(cv.width/r.width),(e.clientY-r.top)*(cv.height/r.height)];};
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptr.set(e.pointerId,pos(e));moved=0;pd=ptr.size>1?Math.hypot(...[...ptr.values()].reduce((a,v,i)=>i?[a[0]-v[0],a[1]-v[1]]:v,0)):0;});
cv.addEventListener('pointermove',e=>{if(!ptr.has(e.pointerId)||!mapT)return;const o=ptr.get(e.pointerId),n=pos(e);
  if(ptr.size===1){const dx=n[0]-o[0],dy=n[1]-o[1];moved+=Math.abs(dx)+Math.abs(dy);MCX-=dx/mapT.sc;MCY-=dy/mapT.sc;}
  ptr.set(e.pointerId,n);
  if(ptr.size===2){const [a,b]=[...ptr.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);moved+=9;if(pd>0)mapZoom(d/pd,(a[0]+b[0])/2,(a[1]+b[1])/2);pd=d;}});
const up=e=>{if(!ptr.has(e.pointerId))return;const tap=ptr.size===1&&moved<10*mapT.dpr,p=ptr.get(e.pointerId);ptr.delete(e.pointerId);
  if(tap&&e.type==='pointerup'){let best=null,bd=28*mapT.dpr;for(const q of mapPlaces().filter(q=>q.f===MAPF)){const d=Math.hypot(mapT.ox+k(q.x)*mapT.sc-p[0],mapT.oy+k(q.y)*mapT.sc-p[1]);if(d<bd){bd=d;best=q;}}if(best){MAPSEL=best;mapList();}}};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();const q=pos(e);mapZoom(e.deltaY<0?1.2:1/1.2,q[0],q[1]);},{passive:false});
cv.addEventListener('dblclick',e=>{const q=pos(e);mapZoom(1.8,q[0],q[1]);});
$('#mzin').onclick=()=>mapZoom(1.5);$('#mzout').onclick=()=>mapZoom(1/1.5);$('#mzc').onclick=()=>{mapReset();if(G&&G.f===MAPF){MZ=2.5;MCX=G.p.x;MCY=G.p.y;}};})();
$('#mfl0').onclick=()=>{MAPF=0;MAPSEL=null;mapList();};$('#mfl1').onclick=()=>{MAPF=1;MAPSEL=null;mapList();};$('#mfl2').onclick=()=>{MAPF=2;MAPSEL=null;mapList();};$('#mapX').onclick=closeMap;$('#bMap').onclick=openMap;
function viaFloor(d){
  if(G.f===2)return{x:k(VG.bus.x),y:k(VG.bus.y),lab:'Navetta per il Marketers World'};
  if(d.f===2)return{x:k(VG.shuttle.x),y:k(VG.shuttle.y),lab:'Navetta per il Village'};
  if(d.f===3)return{x:k(VG.shuttle.x),y:k(VG.shuttle.y),lab:'Navetta per il Sunflower'};
  return{x:k(630),y:k(610),lab:'Scale mobili ('+(d.f===1?'primo piano':'piano terra')+')'};
}
function drawDest(){
  const d=G.dest;if(!d)return;let tx=d.x,ty=d.y,lab=d.n;
  if(d.f!==G.f){const v=viaFloor(d);tx=v.x;ty=v.y;lab=v.lab+' → '+d.n;}
  const dist=Math.hypot(tx-G.p.x,ty-G.p.y);
  if(dist<k(26)){if(d.f!==G.f){/* arrivato al passaggio */}else{toast('Sei arrivato: '+d.n,2600);G.dest=null;return;}}
  const a=Math.atan2(ty-G.p.y,tx-G.p.x),vc=G.vc||G.cam,sx=W/2+(G.p.x-vc.x)*Z,sy=H/2+(G.p.y-vc.y)*Z,r=Math.min(W,H)*.22;
  ctx.save();ctx.translate(sx+Math.cos(a)*r,sy+Math.sin(a)*r);ctx.rotate(a);ctx.fillStyle='#ffd24d';ctx.strokeStyle='rgba(0,0,0,.7)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-9,10);ctx.lineTo(-4,0);ctx.lineTo(-9,-10);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  ctx.save();ctx.font='700 12px "Space Grotesk",sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.strokeStyle='rgba(0,0,0,.75)';ctx.lineWidth=4;const m=Math.round(dist/K*.19),txt=lab+' · ~'+m+' m';
  const lx=sx+Math.cos(a)*(r+30),ly=sy+Math.sin(a)*(r+30);ctx.strokeText(txt,lx,ly);ctx.fillText(txt,lx,ly);ctx.restore();
  // pallino sul bersaglio se visibile
  if(d.f===G.f){const bx=W/2+(tx-vc.x)*Z,by=H/2+(ty-vc.y)*Z;if(bx>0&&bx<W&&by>0&&by<H){ctx.fillStyle='#ffd24d';ctx.beginPath();ctx.arc(bx,by-18,6,0,7);ctx.fill();ctx.strokeStyle='#000';ctx.stroke();}}
}

/* ============================================================ salvataggi (più slot) */
const SKEY='rimini.saves';
const getSaves=()=>lsGet(SKEY,[]);
function putSaves(a){
  try{localStorage.setItem(SKEY,JSON.stringify(a));return true;}catch(e){
    const b=a.map((x,i)=>i===0?x:Object.assign({},x,{st:Object.assign({},x.st,{album:[]})}));
    try{localStorage.setItem(SKEY,JSON.stringify(b));if(typeof toast==='function')toast('Spazio del browser quasi pieno: le foto restano solo nel salvataggio più recente.',3600);return true;}
    catch(e2){if(typeof toast==='function')toast('Impossibile salvare: spazio del browser pieno. Elimina qualche vecchio salvataggio.',4000);return false;}}
}
function snap(){return{v:1,seed:G.seed,player:PLAYER,day:G.day,min:G.min,f:G.f,p:{x:G.p.x,y:G.p.y,dir:G.p.dir},flags:G.flags,contacts:G.contacts,tips:G.tips,booked:[...G.booked],seen:[...G.seen],xpeople:G.xpeople||[],comm:G.comm,album:G.album||[],items:G.items||{},worn:G.worn||null,wear:G.wear||{},lost:G.lost||{},wait:[...(G.wait||[])],sqd:G.sqd||{},nlog:G.nlog||[],trophies:G.trophies||{},bmu:G.bmu||{},sandbox:!!G.sandbox,saved:[...G.saved],meets:G.meets,met:G.met,dest:G.dest,zOff};}
function restore(st){
  if(st.player){PLAYER=Object.assign(PLAYER,st.player);lsSet('rimini.player',PLAYER);}
  Object.assign(G,{day:st.day,min:st.min,f:st.f,flags:Object.assign({},FLAGS0,st.flags),contacts:st.contacts||[],tips:st.tips||[],booked:new Set(st.booked||[]),sandbox:!!st.sandbox,album:st.album||[],items:st.items||{},worn:st.worn||null,wear:st.wear||null,lost:st.lost||{},wait:new Set(st.wait||[]),sqd:st.sqd||{},nlog:st.nlog||[],trophies:st.trophies||{},bmu:st.bmu||{},seen:new Set(st.seen||[]),comm:Object.assign(cmInit(),st.comm||{}),saved:new Set(st.saved||[]),meets:st.meets||[],met:st.met||{},dest:st.dest||null});
  G.xpeople=(st.xpeople||[]).map(p=>Object.assign({},p));G.people.push(...G.xpeople.filter(p=>!G.people.some(q=>q.id===p.id)));
  G.qd=null;
  if(!st.flags||st.flags.bus===undefined)G.flags.bus=true;
  Object.assign(G.p,st.p);G.cam.x=G.p.x;G.cam.y=G.p.y;zOff=st.zOff||0;applyZoom();
}
const summary=()=>{const p=progress();return ['Ven','Sab','Dom'][G.day]+' '+hm(Math.floor(G.min))+' · '+p.done+'/'+p.tot+' obiettivi · '+G.contacts.length+' contatti · seme '+G.seed;};
function saveTo(id,name){const a=getSaves();const now=Date.now();const ent={id:id||('s'+now),name:name||('Salvataggio '+(a.length+1)),ts:now,sum:summary(),st:snap()};
  const i=a.findIndex(x=>x.id===ent.id);if(i>=0){ent.name=name||a[i].name;a[i]=ent;}else a.unshift(ent);putSaves(a.slice(0,15));return ent;}
function autoSave(){if(!G||mode!=='play'||G.done)return;try{saveTo('auto','Autosalvataggio');}catch(e){}}
let autoT=0;
function toMenu(){autoSave();SEED=G.seed||SEED;G.watching=null;G.react=null;['#stg','#dlg','#prompt','#goal'].forEach(s=>{const e=$(s);if(e)e.classList.add('hide');});
  ['#savem','#roomm','#phone','#mapov','#end'].forEach(s=>$(s).classList.add('hide'));cancelAnimationFrame(mapRaf);DL=null;
  mode='title';$('#hud').classList.add('hide');$('#title').classList.remove('hide');$('#sd').value=SEED;refreshLoadBtn();window.scrollTo(0,0);}
function openSaves(from,msg,flashId){
  const inGame=from!=='title'&&G&&mode==='play';
  const box=$('#saveB'),a=getSaves();
  box.innerHTML=`<h2>${inGame?'SALVA / CARICA':'CARICA PARTITA'}</h2>`+(msg?`<div class="svok" role="status">${esc(msg)}</div>`:'')+(inGame?`<div class="sv"><div class="i"><b>Nuovo salvataggio</b><small>${esc(summary())}</small><input id="svname" class="srch2" placeholder="Nome (facoltativo)" maxlength="30" style="margin-top:6px"></div><button class="go" id="svnew">Salva</button></div>`:'')+(a.length?a.map(e=>`<div class="sv${e.id===flashId?' flash':''}" data-sid="${e.id}"><div class="i"><b>${esc(e.name)}</b><small>${esc(e.sum)} · ${new Date(e.ts).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></div><button class="go" data-ld="${e.id}">Carica</button>${inGame&&e.id!=='auto'?`<button data-ow="${e.id}">Sovrascrivi</button>`:''}<button data-dl="${e.id}">✕</button></div>`).join(''):'<div style="color:#9fb0d8;font-size:13px;margin-bottom:10px">Nessun salvataggio.</div>')+`${inGame?'<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost" id="svnext">'+(G.day>=2?'🏁 Concludi il weekend':'🌙 Passa a '+['Sabato','Domenica'][G.day])+'</button><button class="btn ghost" id="svrs">↻ Ricomincia (stesso seme)</button><button class="btn ghost" id="svmenu">⌂ Menu principale / cambia seme</button></div>':''}<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost" id="svexp">⬇ Esporta in un file</button><button class="btn ghost" id="svimp">⬆ Importa da file</button><input type="file" id="svfile" accept=".json,application/json" style="display:none"></div><div style="margin-top:10px"><button class="btn ghost" id="svx" style="width:100%">Chiudi</button></div><p style="font-size:11px;color:#9fb0d8;margin-top:10px;line-height:1.5">I salvataggi restano su questo dispositivo, nel browser. Il gioco salva da solo ogni due minuti e a ogni nuovo giorno («Autosalvataggio»).</p>`;
  $('#savem').classList.remove('hide');
  $('#svx').onclick=()=>{$('#savem').classList.add('hide');last=performance.now();};
  {const ex=$('#svexp'),im=$('#svimp'),fi=$('#svfile');if(ex)ex.onclick=()=>{const n=exportSaves();toast('Esportati '+n+' salvataggi in un file.',2400);};if(im)im.onclick=()=>fi.click();if(fi)fi.onchange=()=>{const f=fi.files[0];if(!f)return;importSavesFile(f,r=>{if(r.ok){refreshLoadBtn();openSaves(from,'✔ '+r.msg);}else toast(r.msg,3200);});};}
  const nd=$('#svnext');if(nd)nd.onclick=()=>{$('#savem').classList.add('hide');last=performance.now();askNextDay();};
  const rs=$('#svrs');if(rs)rs.onclick=()=>{if(!confirm('Ricominciare da capo con lo stesso seme? I progressi non salvati andranno persi (resta l’autosalvataggio).'))return;autoSave();SEED=G.seed;$('#savem').classList.add('hide');closePhone();startGame();};
  const mn=$('#svmenu');if(mn)mn.onclick=()=>{if(!confirm('Tornare al menu principale? I progressi non salvati andranno persi (resta l’autosalvataggio).'))return;toMenu();};
  const n=$('#svnew');if(n)n.onclick=()=>{const e=saveTo(null,$('#svname').value.trim());A.stamp();openSaves(from,'✔ Partita salvata come «'+e.name+'» ('+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})+')',e.id);};
  box.querySelectorAll('[data-ow]').forEach(b=>b.onclick=()=>{const e=saveTo(b.dataset.ow);A.stamp();openSaves(from,'✔ Salvataggio «'+e.name+'» sovrascritto ('+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})+')',e.id);});
  box.querySelectorAll('[data-dl]').forEach(b=>b.onclick=()=>{putSaves(getSaves().filter(x=>x.id!==b.dataset.dl));openSaves(from);});
  box.querySelectorAll('[data-ld]').forEach(b=>b.onclick=()=>{const e=getSaves().find(x=>x.id===b.dataset.ld);if(!e)return;$('#savem').classList.add('hide');closePhone();$('#end').classList.add('hide');startGame(e.st);});
}
$('#bSave').onclick=()=>openSaves();
function refreshLoadBtn(){const b=$('#loadb');if(b)b.style.display=getSaves().length?'':'none';}
refreshLoadBtn();

/* ============================================================ foto, fine, toast */
function toast(t,ms){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),ms||2400);}
function selfie(n){
  const vc=G.vc||G.cam,sc=DPR*Z,mx=(G.p.x+n.x)/2,my=(G.p.y+n.y)/2-12,half=Math.max(56,Math.hypot(G.p.x-n.x,G.p.y-n.y)*.9+30);
  const cx=(W/2+(mx-vc.x)*Z)*DPR,cy=(H/2+(my-vc.y)*Z)*DPR,w=2*half*sc,h=1.5*half*sc;
  const c=document.createElement('canvas');c.width=360;c.height=270;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#0a0d18';g.fillRect(0,0,360,270);
  g.drawImage(cv,cx-w/2,cy-h/2,w,h,0,0,360,270);
  g.fillStyle='rgba(8,10,20,.78)';g.fillRect(0,236,360,34);g.fillStyle='#fff';g.font='700 14px "Space Grotesk",sans-serif';g.textAlign='left';g.fillText('Selfie con '+n.name,10,258);g.textAlign='right';g.fillStyle='#ff6a3d';g.fillText('Rimini · '+DAYNAMES[G.day],350,258);
  G.flags.selfie=true;albumAdd(c,'Selfie con '+n.name);A.stamp();toast('Selfie con '+n.name+'! Lo trovi nell’Album di Marketers Pro.',3200);
}
function photo(){
  const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;const g=c.getContext('2d');g.drawImage(cv,0,0);
  const portrait=c.width<c.height,bh=Math.round(c.height*(portrait?.075:.09)),fs=Math.min(Math.round(bh*.38),Math.round(c.width/(portrait?30:60)));
  g.fillStyle='rgba(8,10,20,.8)';g.fillRect(0,c.height-bh,c.width,bh);g.font='700 '+fs+'px "Space Grotesk",sans-serif';g.fillStyle='#fff';g.textAlign='left';
  const m=Math.round(fs*.8);
  if(portrait){g.fillText(pname()+' · Rimini '+DAYNAMES[G.day]+' ottobre 2026',m,c.height-bh*.58);g.fillStyle='#ff6a3d';g.fillText('Realizzato da Olivieri Domenico con Claude Code',m,c.height-bh*.2);}
  else{g.fillText(pname()+' · Rimini '+DAYNAMES[G.day]+' ottobre 2026',m,c.height-bh*.4);g.textAlign='right';g.fillStyle='#ff6a3d';g.fillText('Realizzato da Olivieri Domenico con Claude Code · Inventa',c.width-m,c.height-bh*.4);}
  c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='rimini-foto-ricordo-'+new Date().toISOString().replace(/[-:T]/g,'').slice(0,14)+'.png';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},400);});
  if(!G.flags.selfie){G.flags.selfie=true;A.stamp();}albumAdd(c,'Foto ricordo');toast('Foto ricordo scattata! La trovi nell’Album di Marketers Pro.',3000);
}
function endGame(){
  if(G.done)return;G.done=true;if(G.flags)G.flags.pjOn=false;if(typeof villageCrowd==='function')villageCrowd(false);const p=progress(),F=G.flags;
  const title=p.done>=p.tot?'Partecipante leggendario':p.done>=8?'Networker del Palacongressi':p.done>=5?'Partecipante attivo':'Turista di Rimini';
  $('#endB').innerHTML=`<h2>${esc(title)}</h2><div class="small" style="color:var(--dim);font-size:13px;line-height:1.55;margin-bottom:6px">Tre giorni a Rimini come <b style="color:var(--ink)">${esc(ME().job)}</b>: hai completato <b style="color:var(--ink)">${p.done}</b> obiettivi su ${p.tot}.</div>${typeof scoreEndHtml==='function'?scoreEndHtml():''}${typeof epilogueHtml==='function'?epilogueHtml():''}<div class="small" style="color:var(--dim);font-size:13px;line-height:1.55;margin-bottom:8px">${F.offer?'<b style="color:var(--ink)">Hai ricevuto una proposta di collaborazione.</b> ':''}${esc(JOBFAM[ME().fam].epi)}</div>
   <div class="kv"><div>Contatti<b>${G.contacts.length}</b></div><div>Workshop<b>${F.ws}</b></div><div>Speech<b>${F.talk}</b></div><div>Stand<b>${Object.keys(F.stands).length}</b></div><div>Spunti<b>${G.tips.length}</b></div><div>Offworld<b>${F.off}</b></div></div>
   <div class="row2"><button class="btn" id="eAgain">Rigioca</button><button class="btn ghost" id="eBack">Torna al gioco</button><button class="btn ghost" id="eMenu">Menu principale</button></div>
   <p class="disc" style="font-size:11px;color:var(--dim);margin-top:12px">Realizzato da Olivieri Domenico usando Claude Code. Progetto just for fun, privato: non è divulgato altrove, se non dentro l’ambiente Marketers. Fan project non ufficiale, senza legami con l’organizzazione del Marketers World.</p>`;
  $('#end').classList.remove('hide');
  $('#eAgain').onclick=()=>{$('#end').classList.add('hide');startGame();};
  $('#eMenu').onclick=toMenu;
  $('#eBack').onclick=()=>{$('#end').classList.add('hide');G.done=false;};
}

/* ============================================================ ciclo */
function startGame(st){goalFor='';if(st&&st.player){PLAYER=Object.assign(PLAYER,st.player);}const sd=st&&st.seed?st.seed:SEED;newGame(sd);if(st)restore(st);mode='play';$('#title').classList.add('hide');$('#hud').classList.remove('hide');A.init();
  if(!st){openHow();}else toast('Partita caricata.',1800);last=performance.now();}
let last=performance.now();
function update(dt){
  G.t+=dt;
  if(G.fade>0)G.fade=Math.max(0,G.fade-dt*4);
  if(G.watching){updateTheatre(dt);return;}
  if(G.react){updateReact(dt);return;}
  if(!DL&&!G.react&&!uiOpen()){
    // orologio: 1 minuto di gioco ogni 4 secondi reali
    if(!G.sandbox&&!G.fin)G.min+=dt/4;autoT+=dt;if(autoT>120){autoT=0;autoSave();}
    if(G.min>=23*60+30){if(G.day>=2){endGame();G.min=23*60+29;}else nextDay();}
    let dx=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0)+touch.x,dy=(keys.ArrowDown||keys.KeyS?1:0)-(keys.ArrowUp||keys.KeyW?1:0)+touch.y;
    const m=Math.hypot(dx,dy);const p=G.p;
    if(m>.15){dx/=Math.max(1,m);dy/=Math.max(1,m);const sp=(keys.ShiftLeft?108:78)*dt;moveBody(p,dx*sp,dy*sp,FL[G.f]);p.step+=dt*(keys.ShiftLeft?7.5:5.3);p.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?2:3):(dy<0?1:0);if(Math.floor(p.step*2)!==Math.floor((p.step-dt*4)*2))A.step();}else p.step=0;
  }
  {const d=NPC.find(n=>n.id==='dario'),sg=!!(activeAt(['Stand Urlico Hoepli'])&&/Vignali/.test(activeAt(['Stand Urlico Hoepli']).sp));if(d){if(sg){d.f=0;d.x=k(800);d.y=k(272);d.dir=0;d.wander=null;}else if(d.sg){if(typeof famPlaceOne==='function')famPlaceOne(d);else{d.x=k(d.data.where.x);d.y=k(d.data.where.y);}}d.sg=sg;}}
  if(!G.sandbox&&G.meets.length){const gone=G.meets.filter(m=>(m.day<G.day)||(m.day===G.day&&Math.floor(G.min)>=m.start+11));if(gone.length){G.meets=G.meets.filter(m=>!gone.includes(m));gone.forEach(m=>{if(typeof cmNoShow==='function')cmNoShow(m);});}}
  updateNPC(dt);if(typeof petRoam==='function')petRoam(dt);
  if(typeof finaleStep==='function'){finaleStep(dt);finaleTick();}
  if(typeof villageTick==='function')villageTick(dt);
  if(typeof famTick==='function')famTick();
  // fine giornata di sala: si possono scoprire i luoghi
  const cam=G.cam,vw=W/Z,vh=H/Z,p=G.p;
  cam.x=lerp(cam.x,p.x,Math.min(1,dt*6));cam.y=lerp(cam.y,p.y-10+(MOB?vh*.2:0),Math.min(1,dt*6));
}
function draw(){
  if(G.watching){drawTheatre();return;}
  if(G.react){drawReact();return;}
  const L=FL[G.f],vw=W/Z,vh=H/Z,cam=G.cam;
  let cx=vw>=WW?WW/2:clamp(cam.x,vw/2,WW-vw/2),cy=vh>=WH?WH/2:clamp(cam.y,vh/2,WH-vh/2+(MOB?vh*.22:0));
  cx=Math.round(cx*Z)/Z;cy=Math.round(cy*Z)/Z;G.vc={x:cx,y:cy};
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#0a0d18';ctx.fillRect(0,0,W,H);
  ctx.imageSmoothingEnabled=false;
  ctx.setTransform(DPR*Z,0,0,DPR*Z,Math.round((W/2-cx*Z)*DPR),Math.round((H/2-cy*Z)*DPR));
  ctx.drawImage(L.cv,0,0);
  // luci della tenda
  for(const d of L.dyn){if(d.k==='lights'){for(let i=0;i<d.w;i+=8){ctx.fillStyle=((Math.floor(G.t*3)+i/8)%3)===0?'#ffd24d':((Math.floor(G.t*3)+i/8)%3)===1?'#ff6a3d':'#4dd0ff';ctx.fillRect(d.x+i+2,d.y+1,2,2);}}}
  // varco: porte a vetri chiuse finché non hai il badge
  if(G.f===0)drawGate();
  if(typeof drawItems==='function')drawItems(ctx);
  if(typeof sqDrawWorld==='function')sqDrawWorld(ctx);
  if(typeof drawPlantedBanner==='function')drawPlantedBanner(ctx);
  // entità ordinate per y
  const list=NPC.filter(n=>n.f===G.f).map(n=>({y:n.y,n}));list.push({y:G.p.y,me:true});list.sort((a,b)=>a.y-b.y);
  const near=nearest();
  for(const it of list){
    if(it.me)person(ctx,G.p.x,G.p.y,G.p.dir,G.p.step,NIKY);
    else{const n=it.n;if(n.pet)drawPet(ctx,n);else if(n.seated){ctx.save();ctx.beginPath();ctx.rect(Math.round(n.x)-14,Math.round(n.y)-44,28,34);ctx.clip();person(ctx,n.x,n.y,n.dir,0,n.p);ctx.restore();}else person(ctx,n.x,n.y,n.dir,n.step,n.p);
      if(n.kind==='family'){const b=Math.sin(G.t*4+n.x)>0?0:1;ctx.fillStyle='#ffd24d';ctx.fillRect(Math.round(n.x)-1,Math.round(n.y)-31+b,3,3);}
      if(near&&near.npc===n){txt(ctx,n.name,Math.round(n.x),Math.round(n.y)-34,'#fff',5);}}
  }
  if(near){ctx.fillStyle='#ff6a3d';const bb=Math.round(Math.sin(G.t*6)*1.5);ctx.fillRect(Math.round(near.x)-1,Math.round(near.y)-40+bb-(near.npc?0:12),3,3);}
  if(G.fin&&G.f===(G.fin.f||0)&&typeof drawFinale==='function')drawFinale(ctx);
  // sera
  const hr=G.min/60;let ta=0;if(hr>=18)ta=clamp((hr-18)/3,0,1)*.45;
  if(ta>0&&G.f===0){ctx.fillStyle='rgba(12,20,70,'+ta.toFixed(3)+')';ctx.fillRect(0,0,WW,WH);}
  // UI
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(G.dest)drawDest();
  if(typeof sqDraw==='function')sqDraw();
  if(G.fade>0){ctx.fillStyle='rgba(5,6,13,'+G.fade+')';ctx.fillRect(0,0,W,H);}
}
const HOW=[["L’obiettivo", "<p>La partita comincia al <b>Marketers Village</b>: sali sulla <b>navetta</b> dalla fermata in basso per arrivare al Palacongressi. A fine giornata (dalle 17:00) puoi tornare al Village dalla fermata «Navetta» fuori dall’Ingresso A: la sera al Village c’è l’<b>Offworld</b> (karaoke e party dalle 22:00), poi si va a dormire e il giorno dopo si riparte da lì.</p><div class=\"stp\"><i>1</i><div><b>Attiva l’app dell’evento</b><span>È una finta app, <b>dentro il gioco</b>: non devi scaricare né installare nulla. Fuori dall’Ingresso A vai dall’<b>Assistenza app</b> (a destra): il personaggio fa l’accesso e così ottiene il QR del biglietto.</span></div></div><div class=\"stp\"><i>2</i><div><b>Mostra il QR</b><span>Dallo <b>Staff accrediti</b> (a sinistra) mostri il QR e ritiri il badge: solo così si apre il varco.</span></div></div><div class=\"stp\"><i>3</i><div><b>Entra e vivi l’evento</b><span>Workshop del venerdì, speech di sabato e domenica, stand, networking, party e karaoke. Gli obiettivi stanno nel telefono (scheda Obiettivi).</span></div></div><p>Il riquadro <b>OBIETTIVO</b> in alto a sinistra e la freccia arancione ti guidano nei primi passi.</p><p>Tutto ciò che fai dà <b>punti</b> (speech seguiti, persone conosciute, meeting, oggetti, minigiochi…): a fine partita vedi il tuo punteggio e il <b>record personale</b>. Non c’è un massimo: rigioca per battere te stesso.</p>"], ["Muoversi e interagire", "<h3>COMPUTER</h3><div class=\"kb\"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o frecce</span><span>muoverti</span><span><kbd>E</kbd> o <kbd>Spazio</kbd></span><span>parlare, entrare, usare ciò che hai davanti</span><span><kbd>E</kbd> / <kbd>1</kbd>…<kbd>4</kbd></span><span>andare avanti nei dialoghi / scegliere la risposta con quel numero</span><span><kbd>Esc</kbd></span><span>chiudere menu e finestre</span></div><h3>SMARTPHONE</h3><div class=\"kb\"><span>Stick a sinistra</span><span>muoverti</span><span>Pulsante <kbd>E</kbd></span><span>interagire</span><span>Tocco su risposte</span><span>scegliere nei dialoghi</span></div><p>Quando vicino a qualcuno o qualcosa compare un suggerimento: premi <b>E</b> (o il pulsante) per usarlo.</p>"], ["Tempo, zoom e pulsanti", "<p>Il tempo scorre da solo: <b>1 minuto di gioco ogni 4 secondi</b>, dalle 8:45 alle 23:30. Si ferma quando apri telefono, mappa, salvataggi o stai parlando.</p><div class=\"kb\"><span><kbd>T</kbd> o ⏩</span><span>salta 15 minuti</span><span><kbd>+</kbd> <kbd>−</kbd> o rotellina</span><span>zoom del gioco (anche i pulsanti ± in alto a destra)</span><span><kbd>M</kbd> o 🗺</span><span>mappa</span><span><kbd>P</kbd> o 📱</span><span>telefono / app</span><span><kbd>G</kbd> o 💾</span><span>salva e carica</span><span><kbd>F</kbd> o 📷</span><span>foto ricordo</span><span>🔊</span><span>audio on/off</span></div><p>Sullo smartphone i pulsanti sono in alto a destra. Il riquadro in alto a sinistra mostra giorno, ora e la prossima sessione.</p>"], ["Il telefono (app)", "<p>Si apre con 📱 o <b>P</b>, ma solo dopo aver fatto l’accesso all’Assistenza. In basso trovi le schede (<b>Marketers Pro</b> è la community dell’evento: scrivi post brevi, metti like e commenta; chi hai incontrato davvero nel gioco ti riconosce. Nell’<b>Album</b> trovi le foto e i selfie di questa partita. Il pulsante <b>🌐 Marketers Pro</b> sullo schermo (o il tasto <b>C</b>) la apre subito, anche senza l’app):</p><div class=\"kb\"><span><b>Home</b></span><span>riassunto, agenda e persone da conoscere; da qui anche Speaker, Annunci, Aziende, Offworld, Obiettivi</span><span><b>Programma</b></span><span>tutte le sessioni per giorno (Ven/Sab/Dom); “I miei” filtra le tue</span><span><b>Agenda</b></span><span>prenotazioni, sessioni salvate e meeting</span><span><b>Rete (Networking)</b></span><span>persone consigliate: proponi un meeting e scegli l’orario</span><span><b>▣ (centro)</b></span><span>il tuo QR del biglietto</span></div><p>Nel Programma tocca <b>Prenota</b> per i workshop (non si prenota se l’orario è passato o si sovrappone a un altro), <b>Salva in agenda</b> per il resto, e <b>★ Portami qui</b> per far comparire la freccia verso la sala.</p>"], ["La mappa", "<p>Con 🗺 o <b>M</b>. Si cambia piano con i due pulsanti in alto; <b>Tu sei qui</b> è il punto arancione.</p><div class=\"kb\"><span>Pizzico / rotellina / doppio tocco</span><span>zoom</span><span>Trascina</span><span>sposta la mappa</span><span><kbd>+</kbd> <kbd>−</kbd> <kbd>◎</kbd></span><span>zoom e “centra su di me”</span><span>Tocca un punto o una voce dell’elenco</span><span>scheda del luogo con descrizione e programma della sala (per giorno)</span></div><p>Nella scheda usa <b>★ Portami qui</b>: una freccia arancione sul gioco indica la strada, anche tra i due piani (passa dalle scale mobili).</p>"], ["Sale, workshop e speech", "<p>Avvicinati a una sala e premi <b>E</b>: si apre una finestra con la sessione in corso, la prossima e il programma di oggi. Scegli tu se <b>Entrare ora</b>.</p><p>Dentro vedi gli speech come slide: <b>E / Spazio / tocco</b> per avanzare, <b>N</b> per prendere appunti, <b>1 2 3</b> (o tocco) per rispondere all’esercizio, <b>Esc</b> per uscire.</p><p>Le sessioni iniziano all’ora indicata: puoi arrivare cinque minuti prima. I workshop del venerdì vanno prenotati dall’app. Le Silent Stage (cuffie) stanno a sinistra, vicino al Main Stage.</p>"], ["Persone e minigiochi", "<p>Il <b>mestiere</b> che scegli nel menu iniziale cambia le tue risposte nei dialoghi, la compatibilità con le persone nel Networking, le sessioni segnate “★ Per te” e la trama: dal sabato una <b>talent scout</b> vicino all’Area networking ti fa una proposta, se hai fatto rete con persone affini.</p><p>Parla con chi incontri: ogni persona può finire nei tuoi contatti. Dall’app proponi un <b>meeting</b> e presentati all’<b>Area networking</b> all’ora scelta.</p><p><b>Riattivazione</b> (micro yoga sul Main Stage): minigioco di ritmo, premi <b>A S D</b> quando il respiro arriva al cerchio; sullo smartphone tocca le tre corsie.</p><p>Poi: firmacopie allo stand Hoepli, Game Quiz, Silent Party e karaoke al Village la sera. Qualche sorpresa è nascosta nel programma.</p>"], ["Salvataggi e partita", "<p>Con 💾 o <b>G</b> salvi in uno dei tuoi slot (fino a 15) e puoi caricare o cancellare le partite. C’è anche un salvataggio automatico ogni due minuti.</p><p>Nel menu iniziale puoi <b>salvare il profilo</b> (nome, aspetto e mansione) e ricaricarlo in un attimo, o copiare un <b>codice</b> per usarlo su un altro dispositivo.</p><p>Il <b>seme</b> nel menu iniziale decide chi incontri: stesso seme, stesse persone; con il dado 🎲 ne generi uno nuovo.</p><p>Titoli, speaker, sale e orari delle sessioni vengono dal programma dell’app (venerdì, sabato e domenica). Sono inventati i contenuti delle slide, le persone che incontri e i titoli ancora “in arrivo”. Buon divertimento!</p>"]];
let howI=0;
function howShow(){const [t,b]=HOW[howI];$('#howT').textContent=t;$('#howN').textContent=(howI+1)+'/'+HOW.length;$('#howB').innerHTML=b;$('#howB').parentNode.scrollTop=0;$('#howD').innerHTML=HOW.map((_,i)=>'<i class="'+(i===howI?'on':'')+'"></i>').join('');$('#howP').style.visibility=howI?'visible':'hidden';$('#howNx').textContent=howI===HOW.length-1?'Ho capito':'Avanti ›';}
function openHow(){howI=0;howShow();$('#howm').classList.remove('hide');}
$('#howP').onclick=()=>{if(howI>0){howI--;howShow();}};$('#howNx').onclick=()=>{if(howI<HOW.length-1){howI++;howShow();}else $('#howm').classList.add('hide');};
let goalFor='';
function goal(){const F=G.flags,el=$('#goal');let t='',key='';
  if(VILLAGE_ON&&!F.bus){key='bus';t='Sei al <u>Marketers Village</u>: vai alla fermata in basso e sali sulla navetta per il Marketers World.';}
  else if(!F.app){key='app';t='Vai all’<u>Assistenza app</u> (a destra, fuori dall’Ingresso A) e attiva l’app (nel gioco, non devi installare niente): ti serve per avere il QR.';}
  else if(!F.accred){key='acc';t='Hai l’app! Ora vai dallo <u>Staff accrediti</u> (a sinistra) e mostra il QR per ritirare il badge.';}
  if(!t){el.classList.add('hide');return;}
  el.classList.remove('hide');const s='<span class="gi">🎯</span><span class="gt">'+t+'</span>';if(el.dataset.k!==key){el.dataset.k=key;el.innerHTML=s;}
  if(goalFor!==key){goalFor=key;if(key==='bus'){if(!G.dest||G.dest.auto)G.dest={n:'Fermata della navetta',f:2,x:k(VG.bus.x),y:k(VG.bus.y),auto:1};}else{const n=NPC.find(x=>x.id===(key==='app'?'info':'accred'));if(n&&(!G.dest||G.dest.auto))G.dest={n:n.name,f:0,x:n.x,y:n.y,auto:1};}}
}
function drawGate(){
  const x0=k(560),x1=k(705),y0=k(704),y1=k(722),w=x1-x0,h=y1-y0,ok=!!G.flags.accred,c=ctx;
  const pw=Math.floor((w-12)/4);                      // 4 pannelli
  c.fillStyle='#2a3358';c.fillRect(x0,y0-2,w,3);c.fillRect(x0,y1-1,w,3);   // telaio
  c.fillStyle='#161c34';c.fillRect(x0,y0,6,h);c.fillRect(x1-6,y0,6,h);
  for(let i=0;i<4;i++){
    let px=x0+6+i*pw;
    if(ok){px+=(i<2?-1:1)*(pw*.8);}                   // aperte: i pannelli scorrono ai lati
    const gx=Math.max(x0+6,Math.min(x1-6-pw,px));
    c.fillStyle='#5aa9c8';c.fillRect(gx,y0,pw,h);c.fillStyle='rgba(255,255,255,.18)';c.fillRect(gx+2,y0+1,3,h-2);c.fillRect(gx+7,y0+1,1,h-2);
    c.fillStyle='#e9efff';c.fillRect(gx,y0,pw,1);c.fillRect(gx,y1-1,pw,1);c.fillRect(gx,y0,1,h);c.fillRect(gx+pw-1,y0,1,h);
  }
  if(!ok){                                            // chiuse: maniglie e barra di blocco rossa
    c.fillStyle='#fff';c.fillRect(x0+6+2*pw-3,y0+5,2,h-10);c.fillRect(x0+6+2*pw+1,y0+5,2,h-10);
    c.fillStyle='#ff4d5a';c.fillRect(x0+6,y0+Math.floor(h/2)-1,w-12,2);
    const t=(Math.floor(G.t*2)%2)?'#ff4d5a':'#a02a35';c.fillStyle=t;c.fillRect(x0+w/2-2,y0-6,5,4);
    c.fillStyle='#0c1124';c.fillRect(x0+w/2-34,y0-20,68,12);c.fillStyle='#ff4d5a';c.font='700 7px "Press Start 2P",monospace';c.textAlign='center';c.fillText('CHIUSO',x0+w/2,y0-11);
  }else{c.fillStyle='#4dff9a';c.fillRect(x0+w/2-2,y0-6,5,4);}
}
/* notifica a schermo quando un obiettivo viene completato (in coda, una alla volta) */
function questWatch(){
  const q=quests();
  if(!G.qd){G.qd={};q.forEach((x,i)=>{if(x.ok)G.qd[i]=1;});G.qq=[];return;}   // partita caricata: nessuna notifica per ciò che era già fatto
  q.forEach((x,i)=>{if(x.ok&&!G.qd[i]){G.qd[i]=1;(G.qq=G.qq||[]).push(x.t);}});
  const t=$('#toast');
  if(G.qq&&G.qq.length&&!t.classList.contains('show')&&!DL&&!G.watching&&!G.react){const n=G.qq.shift();A.stamp();toast('🎯 Obiettivo completato: '+n,3600);}
}
function phClock(){document.body.classList.toggle('phone-open',!$('#phone').classList.contains('hide'));const el=$('#phClk');if(el&&G)setT(el,'pk',['VEN','SAB','DOM'][G.day]+' '+hm(Math.floor(G.min))+(G.sandbox?' · SBX':''));}
function hud(){document.body.classList.toggle('rhythm',!!(G&&G.react));phClock();goal();if(G.flags&&mode==='play'){questWatch();if(typeof cmLevelWatch==='function')cmLevelWatch();}{const u=G.flags.app?cmUnread(cmT()):0,bc=$('#bCommN');if(bc){const v=u?String(u):'';if(bc.textContent!==v)bc.textContent=v;bc.style.display=u?'':'none';}}if(G.flags.app)cmNotify();const sc=NPC.find(x=>x.id==='scout');if(sc)sc.f=G.day>=1?0:-1;
  const hr=fmt(G.min);const dn=['VEN','SAB','DOM'][G.day];
  setT($('#ck'),'ck',dn+' '+hr+(G.sandbox?' · SANDBOX':''));
  const nx=nextAgenda(),p=progress();
  setT($('#ckS'),'cs',(nx?(nx.d===G.day?(nx.start<=G.min?'Adesso: ':'Prossimo '+hm(nx.start)+': '):DAYNAMES[nx.d].slice(0,3)+' '+hm(nx.start)+': ')+(nx.title.length>34?nx.title.slice(0,32)+'…':nx.title):'Agenda vuota: scegli nel Programma')+' · '+p.done+'/'+p.tot+' obiettivi'+(typeof scoreNow==='function'?' · '+scoreNow()+' pt':''));
  if(MOB){const hide=!!(DL||G.watching||G.react);$('#pad').style.display=hide?'none':'';$('#act').style.display=hide?'none':'';}
  const n=DL||G.watching||G.react?null:nearest();const pr=$('#prompt');
  if(n){const h=`<kbd>${MOB?'●':'E'}</kbd>${esc(n.label)}`;if(cacheP!==h){cacheP=h;pr.innerHTML=h;}pr.classList.remove('hide');}else{pr.classList.add('hide');cacheP='';}
}
let cacheP='';const cT={};function setT(el,k,v){if(cT[k]!==v){cT[k]=v;el.textContent=v;}}
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(mode!=='play'||!G){drawTitle(now/1000);return;}
  update(dt);draw();hud();
}
requestAnimationFrame(frame);

/* ============================================================ input */
function act(){
  if(mode!=='play'||!G)return;
  if(DL){const f=$('#dC button');if(f)f.click();return;}
  if(G.watching||G.react||uiOpen())return;
  const n=nearest();if(n){A.init();n.fn();}
}
addEventListener('keydown',e=>{
  if(mode!=='play'){return;}
  if(e.target&&(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.target.isContentEditable))return;
  if(G&&G.react){const L={KeyA:0,ArrowLeft:0,KeyS:1,ArrowDown:1,KeyD:2,ArrowRight:2}[e.code];if(L!=null){e.preventDefault();reactHit(L);}return;}
  if(G&&G.watching){const w=G.watching;if(e.code==='Space'||e.code==='KeyE'||e.code==='Enter'){e.preventDefault();if(!e.repeat)advance();}else if(e.code==='KeyN')takeNote();else if(e.code==='Escape')leaveTheatre(false);else if(/^Digit[1-3]$/.test(e.code)&&w.ex&&w.ex.picked==null)pickEx(+e.code.slice(5)-1);return;}
  keys[e.code]=1;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if(e.code==='KeyE'||e.code==='Space'||e.code==='Enter'){if(DL&&e.code==='Enter')return;if(!e.repeat)act();}
  else if(/^Digit[1-4]$/.test(e.code)&&DL){const b=document.querySelectorAll('#dC button')[+e.code.slice(5)-1];if(b)b.click();}
  else if(e.code==='KeyC'){if($('#phone').classList.contains('hide'))openPro();else closePhone();}
  else if(e.code==='KeyP'){if($('#phone').classList.contains('hide'))openPhone();else closePhone();}
  else if(e.code==='KeyF')photo();
  else if(e.code==='Equal'||e.code==='NumpadAdd'||e.key==='+')zoomStep(1);
  else if(e.code==='Minus'||e.code==='NumpadSubtract'||e.key==='-')zoomStep(-1);
  else if(e.code==='KeyT')skipTime();
  else if(e.code==='KeyM'){if($('#mapov').classList.contains('hide'))openMap();else closeMap();}
  else if(e.code==='KeyG'){if($('#savem').classList.contains('hide'))openSaves();else{$('#savem').classList.add('hide');last=performance.now();}}
  else if(e.code==='Escape'){if(!$('#mapov').classList.contains('hide'))closeMap();else if(!$('#roomm').classList.contains('hide'))$('#roomm').classList.add('hide');else if(!$('#savem').classList.contains('hide'))$('#savem').classList.add('hide');else if(!$('#phone').classList.contains('hide'))closePhone();else if(DL)closeDlg();}
});
addEventListener('keyup',e=>{keys[e.code]=0;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=0;});
// stick
const pad=$('#pad'),padi=$('#padi');let padId=null;
function padMove(e){const r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=(e.clientX-cx)/(r.width/2),dy=(e.clientY-cy)/(r.height/2);const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}touch.x=Math.abs(dx)>.18?dx:0;touch.y=Math.abs(dy)>.18?dy:0;padi.style.transform=`translate(${dx*38}px,${dy*38}px)`;}
pad.addEventListener('pointerdown',e=>{padId=e.pointerId;pad.setPointerCapture(e.pointerId);padMove(e);});
pad.addEventListener('pointermove',e=>{if(e.pointerId===padId)padMove(e);});
const padEnd=e=>{if(e.pointerId===padId){padId=null;touch.x=touch.y=0;padi.style.transform='';}};
pad.addEventListener('pointerup',padEnd);pad.addEventListener('pointercancel',padEnd);
cv.addEventListener('pointerdown',e=>{if(G&&G.react){reactHit(Math.min(2,Math.floor(e.clientX/(W/3))));}});
$('#act').addEventListener('pointerdown',e=>{e.preventDefault();act();});
$('#prompt').addEventListener('pointerdown',e=>{e.preventDefault();act();});
const getProfiles=()=>lsGet('rimini.profiles',[]);
let jobAll=false;
function jobUI(){
  const inp=$('#pjob');if(document.activeElement!==inp)inp.value=PLAYER.job||'';
  const q=inp.value,box=$('#jobl');box.innerHTML='';
  const pick=j=>{PLAYER.job=j[0];lsSet('rimini.player',PLAYER);inp.value=j[0];jobAll=false;jobUI();};
  if(jobAll&&!q.trim()){
    Object.keys(JOBFAM).forEach(f=>{const h=document.createElement('div');h.className='jh';h.textContent=JOBFAM[f].n;box.appendChild(h);
      JOBS.filter(j=>j[1]===f).forEach(j=>{const b=document.createElement('button');b.textContent=j[0];b.onmousedown=e=>e.preventDefault();b.onclick=()=>pick(j);box.appendChild(b);});});
    const c=document.createElement('button');c.className='alt';c.textContent='▴ Chiudi elenco';c.onclick=()=>{jobAll=false;jobUI();};box.appendChild(c);
  }else{
  const sug=jobSuggest(q);
  sug.forEach(j=>{const b=document.createElement('button');b.textContent=j[0];b.onmousedown=e=>e.preventDefault();b.onclick=()=>{PLAYER.job=j[0];lsSet('rimini.player',PLAYER);inp.value=j[0];jobUI();};box.appendChild(b);});
  const alt=document.createElement('button');alt.className='alt';alt.textContent=q.trim()&&!jobFind(q)?'Altro: «'+q.trim()+'»':'Altro (scrivo la mia)';alt.onmousedown=e=>e.preventDefault();alt.onclick=()=>{inp.focus();};box.appendChild(alt);
  if(!q.trim()){const all=document.createElement('button');all.className='alt';all.textContent='📂 Sfoglia tutte le mansioni ('+JOBS.length+')';all.onclick=()=>{jobAll=true;jobUI();};box.appendChild(all);}
  }
  const pr=jobProfile(q);
  $('#jobsum').innerHTML=q.trim()?(pr.listed?'':'<b>Altro</b>: non è in lista, ti assegno uno stile in base alle parole. ')+'<b>Stile:</b> '+esc(pr.famN)+' · <b>Tratti:</b> '+pr.traits.map(t=>TRAITS[t].n).join(', ')+'. Cambia come parli, chi ti consiglia l’app e cosa ti propone la trama.':'Scegli un suggerimento o scrivi la tua mansione: cambia come parli, chi ti consiglia l’app e cosa ti propone la trama.';
}
function profList(){
  const L=getProfiles(),box=$('#prl');box.innerHTML='';
  L.forEach(pf=>{const d=document.createElement('div');d.className='pri';const b=document.createElement('button');b.textContent=(pf.name||'Senza nome')+' · '+pf.job;b.onclick=()=>{Object.assign(PLAYER,{name:pf.name,gender:pf.gender,si:pf.si,hi:pf.hi,ki:pf.ki,job:pf.job});lsSet('rimini.player',PLAYER);buildCreator();toast('Profilo caricato: '+(pf.name||pf.job),1600);};
    const x=document.createElement('button');x.textContent='✕';x.onclick=()=>{lsSet('rimini.profiles',getProfiles().filter(o=>o.id!==pf.id));profList();};d.appendChild(b);d.appendChild(x);box.appendChild(d);});
}
function profCode(){const pf={name:PLAYER.name,gender:PLAYER.gender,si:PLAYER.si,hi:PLAYER.hi,ki:PLAYER.ki,hs:PLAYER.hs||'',job:PLAYER.job};return 'RIM1:'+btoa(unescape(encodeURIComponent(JSON.stringify(pf))));}
function profFromCode(s){try{s=(s||'').trim();if(!s.startsWith('RIM1:'))return null;const o=JSON.parse(decodeURIComponent(escape(atob(s.slice(5)))));if(typeof o!=='object'||!o)return null;return{name:String(o.name||'').slice(0,16),gender:o.gender==='f'?'f':'m',si:+o.si||0,hi:+o.hi||0,ki:+o.ki||0,hs:['short','long','bald'].includes(o.hs)?o.hs:'',job:jobNorm(o.job).slice(0,40)};}catch(e){return null;}}
function buildCreator(){
  const nm=$('#pname');nm.value=PLAYER.name==='Ospite'?'':PLAYER.name;
  nm.oninput=()=>{PLAYER.name=nm.value;lsSet('rimini.player',PLAYER);};
  const jb=$('#pjob');jb.oninput=()=>{PLAYER.job=jobNorm(jb.value);lsSet('rimini.player',PLAYER);jobUI();};jb.onfocus=()=>jb.select&&0;
  const sw=(id,arr,key)=>{const el=$(id);el.innerHTML='';arr.forEach((c,i)=>{const b=document.createElement('button');b.style.background=c;b.className=PLAYER[key]%arr.length===i?'on':'';b.onclick=()=>{PLAYER[key]=i;lsSet('rimini.player',PLAYER);buildCreator();};el.appendChild(b);});};
  sw('#cs',SHIRTS,'si');sw('#ch',HAIRC,'hi');sw('#cskin',SKINC,'ki');
  {const cur=PLAYER.hs||(PLAYER.gender==='f'?'long':'short');document.querySelectorAll('#chs button').forEach(b=>{b.className=b.dataset.hs===cur?'on':'';b.onclick=()=>{PLAYER.hs=b.dataset.hs;lsSet('rimini.player',PLAYER);buildCreator();};});const chw=$('#ch');if(chw)chw.style.opacity=cur==='bald'?.35:1;}
  document.querySelectorAll('#cg button').forEach(b=>{b.className=b.dataset.g===PLAYER.gender?'on':'';b.onclick=()=>{PLAYER.gender=b.dataset.g;lsSet('rimini.player',PLAYER);buildCreator();};});
  const setMode=m=>{SANDBOX=m==='sandbox';lsSet('rimini.mode',m);$('#mdT').className='chips3b'+(SANDBOX?'':' on');$('#mdS').className='chips3b'+(SANDBOX?' on':'');
    $('#mdNote').innerHTML=SANDBOX?'<b>Sandbox libera:</b> il tempo è fermo e puoi entrare in qualsiasi speech o workshop, in qualsiasi giorno. Non è come il gioco è stato pensato: la modalità <b>a tempo</b> è la più bella e divertente perché simula davvero l’evento.':'<b>A tempo (consigliata):</b> la giornata scorre dalle 8:45 alle 23:30, le sessioni hanno orari e sale veri, i workshop si prenotano. È l’esperienza completa.';};
  $('#mdT').onclick=()=>setMode('timed');$('#mdS').onclick=()=>setMode('sandbox');setMode(SANDBOX?'sandbox':'timed');
  jobUI();profList();
  $('#prSave').onclick=()=>{const L=getProfiles().filter(o=>!(o.name===PLAYER.name&&o.job===PLAYER.job));L.unshift({id:'pf'+Date.now(),name:PLAYER.name==='Ospite'?'':PLAYER.name,gender:PLAYER.gender,si:PLAYER.si,hi:PLAYER.hi,ki:PLAYER.ki,hs:PLAYER.hs||'',job:PLAYER.job||jobProfile('').job});lsSet('rimini.profiles',L.slice(0,10));profList();toast('Profilo salvato.',1500);};
  $('#prCopy').onclick=()=>{const c=profCode();(navigator.clipboard?navigator.clipboard.writeText(c).then(()=>toast('Codice profilo copiato. Incollalo su un altro dispositivo.',2600),()=>prompt('Copia questo codice:',c)):Promise.reject()).catch(()=>prompt('Copia questo codice:',c));};
  $('#prPaste').onclick=()=>{const s=prompt('Incolla il codice profilo (inizia con RIM1:)');if(s==null)return;const o=profFromCode(s);if(!o){toast('Codice non valido.',2200);return;}Object.assign(PLAYER,o);lsSet('rimini.player',PLAYER);buildCreator();toast('Profilo caricato.',1600);};
}
buildCreator();
$('#sd').value=SEED;$('#sd').oninput=e=>{SEED=(e.target.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10)||SEED;lsSet('rimini.seed',SEED);};$('#sdd').onclick=()=>{SEED=newSeed();$('#sd').value=SEED;lsSet('rimini.seed',SEED);};
$('#go').onclick=()=>{if(SANDBOX&&!confirm('Hai scelto la SANDBOX: non è come il gioco è stato pensato.\n\nTi consiglio prima la modalità A TEMPO, che simula davvero l’evento (orari, sale, prenotazioni) ed è molto più divertente.\n\nPremi OK per giocare comunque in sandbox, Annulla per tornare a scegliere.'))return;const v=($('#sd').value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10);SEED=v||newSeed();lsSet('rimini.seed',SEED);PLAYER.name=($('#pname').value||'').trim()||'Ospite';lsSet('rimini.player',PLAYER);startGame();};
$('#loadb').onclick=()=>openSaves('title');
$('#how').onclick=openHow;

/* ============================================================ titolo */
function drawTitle(t){
  const c=$('#tcv').getContext('2d');c.imageSmoothingEnabled=false;
  c.fillStyle='#161d3a';c.fillRect(0,0,260,170);c.fillStyle='#2a3566';c.fillRect(0,118,260,52);
  c.fillStyle='#ff6a3d';c.fillRect(0,0,260,3);
  // palco
  const g=c.createLinearGradient(30,0,230,0);g.addColorStop(0,'#6a2a9a');g.addColorStop(.5,'#ff6a3d');g.addColorStop(1,'#2aa7d8');c.fillStyle=g;c.fillRect(30,14,200,50);
  c.font='8px '+PIX;c.textAlign='center';c.fillStyle='#fff';c.fillText('MARKETERS WORLD',130,36);c.font='6px '+PIX;c.fillStyle='#d8f0ff';c.fillText('RIMINI · 16-18 OTT',130,52);
  for(let r=0;r<2;r++)for(let i=0;i<20;i++){c.fillStyle='#9a2a3a';c.fillRect(24+i*10,128+r*14,5,5);}
  const bob=Math.floor(t*2)%2;person(c,90+Math.sin(t)*30,112,3,bob?1:0,NIKY);
  person(c,170,112,0,0,{shirt:'#1d2b4a',pants:'#232a44',skin:'#e8b98a',hair:'#3a2a1c',badge:'#ffd24d'});
  person(c,196,112,0,0,{shirt:'#3b3b3b',pants:'#232a44',skin:'#e6b48c',hair:'#2a2118',badge:'#ffd24d'});
}
window.__rim={get G(){return G;},startGame,get FL(){return FL;},act,nearest,enterSession,talkTo,endGame,quests,progress,keys,get NPC(){return NPC;},PROGRAMMA};
