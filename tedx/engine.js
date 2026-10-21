'use strict';
const BUILD=1;
(function(){const el=document.getElementById('bld');if(el){const hb=+el.dataset.b;el.textContent='build '+BUILD+(hb!==BUILD?' (pagina '+hb+')':'');}})();
/* TEDx PESARO · il gioco dei volontari (progetto interno non ufficiale). Motore 2D a mappe, dialoghi e minigiochi. */
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
function hashStr(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function lsGet(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
const cv=$('#cv'),ctx=cv.getContext('2d');
const MOB=matchMedia('(pointer:coarse)').matches||innerWidth<700;if(MOB)document.body.classList.add('mob');
let W=0,H=0,DPR=1,Z=3,zOff=0;
const ZL=[1.5,2,2.5,3,4,5];
function resize(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);const want=MOB?Math.min(W/260,H/340):Math.min(W/420,H/280);let bi=0;ZL.forEach((z,i)=>{if(Math.abs(z-want)<Math.abs(ZL[bi]-want))bi=i;});window._zb=bi;applyZoom();}
function applyZoom(){Z=ZL[clamp((window._zb||0)+zOff,0,ZL.length-1)];}
function zoomStep(d){zOff=clamp((window._zb||0)+zOff+d,0,ZL.length-1)-(window._zb||0);applyZoom();}
addEventListener('resize',resize);
const PIX='"Press Start 2P",monospace';

/* ---------- audio (solo effetti) ---------- */
const A={ac:null,on:true,init(){if(this.ac)return;try{this.ac=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}},
  tone(f,d,t,g,f2){if(!this.ac||!this.on)return;const c=this.ac,n=c.currentTime,o=c.createOscillator(),v=c.createGain();o.type=t||'square';o.frequency.setValueAtTime(f,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);v.gain.setValueAtTime(g||.04,n);v.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(v);v.connect(c.destination);o.start(n);o.stop(n+d+.02);},
  blip(){this.tone(660,.07,'square',.03,990);},ok(){this.tone(523,.1,'triangle',.07);setTimeout(()=>this.tone(784,.15,'triangle',.07),90);},bad(){this.tone(180,.18,'sawtooth',.05,110);},
  stamp(){this.tone(523,.12,'triangle',.07);setTimeout(()=>this.tone(784,.18,'triangle',.07),110);setTimeout(()=>this.tone(1047,.25,'triangle',.07),230);},
  step(){this.tone(90+Math.random()*30,.04,'triangle',.02);},
  fanfare(){[523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>this.tone(f,.16,'square',.04),i*90));}};
let toastT=0;function toast(m,ms){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),ms||2600);}

/* ---------- sprite persona (pixel art, stesso del gioco di Rimini) ---------- */
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
  if(p.gphones){const gl=.55+.35*Math.sin(T*5);c.fillStyle='rgba(61,255,122,'+(.18*gl).toFixed(2)+')';c.fillRect(x-7,y-25-bob,14,10);c.fillStyle='#1b1d28';c.fillRect(x-5,y-24-bob,10,1);c.fillRect(x-5,y-23-bob,1,5);c.fillRect(x+4,y-23-bob,1,5);c.fillStyle='#3dff7a';c.fillRect(x-6,y-21-bob,2,4);c.fillRect(x+4,y-21-bob,2,4);c.fillStyle='#caffdc';c.fillRect(x-6,y-21-bob,1,1);c.fillRect(x+5,y-21-bob,1,1);}
  if(p.phones){c.fillStyle='#1b1d28';c.fillRect(x-5,y-24-bob,10,1);c.fillRect(x-5,y-23-bob,1,5);c.fillRect(x+4,y-23-bob,1,5);c.fillStyle=p.badge||'#ff6a3d';c.fillRect(x-6,y-20-bob,2,4);c.fillRect(x+4,y-20-bob,2,4);}
  if(p.cap){c.fillStyle=p.cap;c.fillRect(x-5,y-24-bob,10,3);if(dir===0)c.fillRect(x-5,y-22-bob,10,1);}
  if(p.gear&&typeof drawGear==='function')drawGear(c,x,y,dir,bob,p.gear);
}
const SHIRTS=['#e62b1e','#3da5d9','#6bc46d','#b57bff','#e86a8a','#ffd24d','#2a4a8a','#2aa8a0','#f0f0f5','#23232c','#8a90a0','#ff8a2a'],HAIRC=['#2a1d14','#6a4a2a','#c9a24a','#1a1a20','#8a3a2a','#d9d2c4','#0d0d10','#e8d070','#b0401c','#9a9aa4'],SKINC=['#f0c8a0','#e8b98a','#c98e62','#a8734c','#fbdcc0','#8a5a3a','#6a4430','#4a2e22'];
const FEM=new Set(['francesca','cecilia','maruska','anna','aurora','sally','tullia','giorgia','vera','gabriella','alessandra','sara','marina','damiana','lucia','claudia','marta','mara','elisa','lorena','elena','giulia','laura','raffaella','silvia','zohra','bernadette','agata','simonetta','stefania','cristiana','michela','luisella','maria','fabiana','federica','jovanka','giada','chiara','sofia','martina','elisabetta','paola','monica','irene','ilaria','valentina']);
const isF=name=>FEM.has(String(name).trim().split(/\s+/)[0].toLowerCase().replace(/[^a-zà-ù]/g,''));
function palOf(name,extra){const r=mulberry32(hashStr('pal|'+name)),f=isF(name);const p={shirt:SHIRTS[Math.floor(r()*SHIRTS.length)],pants:['#232a44','#2b3350','#3a3a4a','#1f1f28'][Math.floor(r()*4)],skin:SKINC[Math.floor(r()*SKINC.length)],hair:HAIRC[Math.floor(r()*HAIRC.length)],long:f&&r()<.8,badge:'#e62b1e'};if(!f&&r()<.07)p.bald=true;if(f&&r()<.3)p.skirt=true;return Object.assign(p,extra||{});}
let PLAYER={name:'Volontario',g:'m',si:0,ki:1,hi:0,hs:'short'};
function playerLook(){return{shirt:SHIRTS[PLAYER.si%SHIRTS.length],pants:'#232a44',skin:SKINC[PLAYER.ki%SKINC.length],hair:HAIRC[PLAYER.hi%HAIRC.length],long:PLAYER.hs==='long',bald:PLAYER.hs==='bald',badge:'#e62b1e',phones:!!PLAYER.phones,gphones:!!PLAYER.gph};}
const gx=(s)=>String(s).replace(/\{([^|}]*)\|([^}]*)\}/g,(m,o,a)=>PLAYER.g==='f'?a:o);
function drawFace(cn,p){const x=cn.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,cn.width,cn.height);x.fillStyle='#1b1b28';x.fillRect(0,0,cn.width,cn.height);x.fillStyle='#2d2d44';x.fillRect(0,cn.height-5,cn.width,5);x.save();x.scale(cn.width/12,cn.width/12);person(x,6,24,0,0,p);x.restore();}
const _faceC={};function faceURL(p){const key=JSON.stringify(p);if(_faceC[key])return _faceC[key];const c=document.createElement('canvas');c.width=c.height=30;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#1b1b28';x.fillRect(0,0,30,30);x.fillStyle='#2d2d44';x.fillRect(0,25,30,5);x.save();x.scale(2.5,2.5);person(x,6,24,0,0,p);x.restore();return _faceC[key]=c.toDataURL();}
const faceImg=(p,cls)=>`<img class="${cls||''}" src="${faceURL(p)}" alt="">`;

/* ---------- mondo: mappe fatte di rettangoli ---------- */
let G=null,MAPS={},CURM=null,NPCS=[],PL={x:0,y:0,dir:0,step:0},CAM={x:0,y:0},T=0;
function shade(hex,d){const n=parseInt(hex.slice(1),16),r=clamp((n>>16)+d,0,255),g=clamp(((n>>8)&255)+d,0,255),b=clamp((n&255)+d,0,255);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);}
function label(c,t,x,y,col,sz){c.font=(sz||7)+'px '+PIX;c.textAlign='center';c.textBaseline='middle';c.fillStyle='rgba(0,0,0,.6)';c.fillText(t,x+1,y+1);c.fillStyle=col||'#fff';c.fillText(t,x,y);}
function drawRect(c,r){
  const {x,y,w,h}=r,col=r.c||'#444',k=r.k||'wall';
  if(k==='floor'||k==='sand'||k==='rug'||k==='road'||k==='grass'){c.fillStyle=col;c.fillRect(x,y,w,h);
    if(k!=='rug'){c.fillStyle='rgba(255,255,255,.05)';for(let yy=y;yy<y+h;yy+=16)for(let xx=x+((yy/16)%2?8:0);xx<x+w;xx+=16)c.fillRect(xx,yy,15,1);}
    if(k==='rug'){c.strokeStyle=shade(col,40);c.lineWidth=1;c.strokeRect(x+2.5,y+2.5,w-5,h-5);}
    if(k==='grass'){c.fillStyle='rgba(0,0,0,.12)';for(let i=0;i<w*h/180;i++){const rx=x+((i*37)%w),ry=y+((i*91)%h);c.fillRect(rx,ry,1,2);}}
  }else if(k==='wall'){c.fillStyle=col;c.fillRect(x,y,w,h);c.fillStyle=shade(col,24);c.fillRect(x,y,w,2);c.fillStyle=shade(col,-24);c.fillRect(x,y+h-2,w,2);}
  else if(k==='bldg'){const rh=Math.min(30,h*.35);c.fillStyle=shade(col,-34);c.fillRect(x,y,w,rh);c.fillStyle=shade(col,-10);c.fillRect(x,y+rh-2,w,2);c.fillStyle=col;c.fillRect(x,y+rh,w,h-rh);
    c.fillStyle=r.win||'#9ed8ff';for(let xx=x+8;xx<x+w-14;xx+=18)for(let yy=y+rh+6;yy<y+h-22;yy+=18){c.fillRect(xx,yy,10,10);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(xx,yy,10,2);c.fillStyle=r.win||'#9ed8ff';}
    c.fillStyle=shade(col,-40);c.fillRect(x,y+h-3,w,3);}
  else if(k==='desk'||k==='table'||k==='counter'){c.fillStyle=shade(col,-30);c.fillRect(x,y+3,w,h-3);c.fillStyle=col;c.fillRect(x,y,w,h-3);c.fillStyle=shade(col,30);c.fillRect(x,y,w,2);}
  else if(k==='seats'){c.fillStyle=col;c.fillRect(x,y,w,h);for(let yy=y+2;yy<y+h-3;yy+=7)for(let xx=x+2;xx<x+w-5;xx+=8){c.fillStyle=shade(col,-26);c.fillRect(xx,yy+3,6,3);c.fillStyle=shade(col,28);c.fillRect(xx,yy,6,4);}}
  else if(k==='stage'){c.fillStyle='#14141f';c.fillRect(x,y,w,h);c.fillStyle='#232338';c.fillRect(x,y+h-10,w,10);c.fillStyle='#e62b1e';c.fillRect(x,y+h-3,w,3);
    if(r.screen){c.fillStyle='#05050a';c.fillRect(x+w*.18,y+4,w*.64,h-22);const g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#2a1020');g.addColorStop(1,'#5a1a1a');c.fillStyle=g;c.fillRect(x+w*.18+3,y+7,w*.64-6,h-28);c.fillStyle='#e62b1e';c.font='900 '+Math.max(8,h*.2)+'px '+PIX;c.textAlign='center';c.textBaseline='middle';c.fillText('TEDx',x+w/2-6,y+h/2-8);}}
  else if(k==='tree'){c.fillStyle='#5a3a22';c.fillRect(x+w/2-2,y+h-8,4,8);c.fillStyle=col||'#2f7a3a';c.beginPath();c.arc(x+w/2,y+h/2-3,Math.min(w,h)/2,0,7);c.fill();c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.arc(x+w/2-3,y+h/2-7,Math.min(w,h)/4,0,7);c.fill();}
  else if(k==='water'){c.fillStyle=col;c.fillRect(x,y,w,h);c.fillStyle='rgba(255,255,255,.18)';for(let yy=y+6;yy<y+h;yy+=10)for(let xx=x+((yy/10)%2?10:0);xx<x+w;xx+=22)c.fillRect(xx,yy,8,1);}
  else if(k==='sphere'){c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(x+w/2,y+h-2,w/2,5,0,0,7);c.fill();const g=c.createRadialGradient(x+w/2-6,y+h/2-8,2,x+w/2,y+h/2,w/2);g.addColorStop(0,'#fff6c8');g.addColorStop(.4,'#e0a52a');g.addColorStop(1,'#7a4a10');c.fillStyle=g;c.beginPath();c.arc(x+w/2,y+h/2-2,w/2-1,0,7);c.fill();}
  else if(k==='car'){c.fillStyle=col;c.fillRect(x,y+6,w,h-6);c.fillStyle=shade(col,-30);c.fillRect(x+8,y,w-16,10);c.fillStyle='#9ed8ff';c.fillRect(x+10,y+2,w-20,6);c.fillStyle='#111';c.fillRect(x+6,y+h-4,10,6);c.fillRect(x+w-16,y+h-4,10,6);}
  else if(k==='curtain'){c.fillStyle='#8a1a14';c.fillRect(x,y,w,h);c.fillStyle='#b4281d';for(let xx=x;xx<x+w;xx+=6)c.fillRect(xx,y,2,h);c.fillStyle='#e62b1e';c.fillRect(x,y,w,2);}
  else if(k==='steps'){c.fillStyle=col;c.fillRect(x,y,w,h);for(let yy=y;yy<y+h;yy+=5){c.fillStyle=shade(col,28);c.fillRect(x,yy,w,1);c.fillStyle=shade(col,-26);c.fillRect(x,yy+2,w,1);}}
  else if(k==='board'){c.fillStyle='#ddd';c.fillRect(x,y,w,h);c.fillStyle='#999';c.fillRect(x,y,w,2);c.fillRect(x,y+h-2,w,2);c.fillStyle='#e62b1e';for(let i=0;i<4;i++)c.fillRect(x+4+i*(w/4),y+6+(i%2)*6,w/6,3);}
  else if(k==='door'){c.fillStyle=col;c.fillRect(x,y,w,h);c.fillStyle='rgba(255,255,255,.35)';for(let xx=x;xx<x+w;xx+=6)c.fillRect(xx,y,3,h);}
  else if(k==='shelf'){c.fillStyle=shade(col,-20);c.fillRect(x,y,w,h);c.fillStyle=col;for(let yy=y+2;yy<y+h-4;yy+=9){c.fillRect(x+2,yy,w-4,5);const cs=['#e62b1e','#ffd24d','#3da5d9','#f0f0f5'];for(let xx=x+3;xx<x+w-6;xx+=6){c.fillStyle=cs[(xx+yy)%4];c.fillRect(xx,yy+1,4,4);}c.fillStyle=col;}}
  else{c.fillStyle=col;c.fillRect(x,y,w,h);}
  if(r.t)label(c,r.t,x+w/2,y+(r.ty??h/2),r.tc||'#fff',r.ts||7);
}
function prepMap(id){const m=MAPS[id];if(!m||m.cache)return m;const cn=document.createElement('canvas');cn.width=m.w;cn.height=m.h;const c=cn.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle=m.bg||'#222';c.fillRect(0,0,m.w,m.h);
  for(const r of m.rects)drawRect(c,r);
  for(const d of m.doors||[]){c.fillStyle='rgba(255,210,77,.22)';c.fillRect(d.x,d.y,d.w,d.h);c.strokeStyle='#ffd24d';c.lineWidth=1;c.setLineDash([3,3]);c.strokeRect(d.x+.5,d.y+.5,d.w-1,d.h-1);c.setLineDash([]);if(d.label)label(c,d.label,d.x+d.w/2,d.y+(d.ly??-6),'#ffd24d',6);}
  m.cache=cn;m.solids=m.rects.filter(r=>r.s);return m;}
function hits(m,x,y){if(x<8||y<8||x>m.w-8||y>m.h-3)return true;const b={x:x-4,y:y-4,w:8,h:5};for(const s of m.solids)if(b.x<s.x+s.w&&b.x+b.w>s.x&&b.y<s.y+s.h&&b.y+b.h>s.y)return true;return false;}
function freeSpot(m,x,y){if(!hits(m,x,y))return[x,y];for(let r=4;r<160;r+=4)for(let a=0;a<16;a++){const nx=x+Math.cos(a*Math.PI/8)*r,ny=y+Math.sin(a*Math.PI/8)*r;if(!hits(m,nx,ny))return[nx,ny];}return[x,y];}
function moveBody(e,dx,dy,m){const nx=e.x+dx;if(!hits(m,nx,e.y))e.x=nx;const ny=e.y+dy;if(!hits(m,e.x,ny))e.y=ny;}

/* ---------- navigazione tra mappe (freccia gialla) ---------- */
function route(from,to){if(from===to)return null;const q=[[from,null]],seen={[from]:1};while(q.length){const [m,first]=q.shift();for(const d of(MAPS[m].doors||[])){if(seen[d.to])continue;seen[d.to]=1;const f=first||d;if(d.to===to)return f;q.push([d.to,f]);}}return null;}

/* ---------- input ---------- */
const keys={};let touch={x:0,y:0},mode='title',actQ=false;
function typing(e){const t=e.target;return t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable);}
addEventListener('keydown',e=>{if(typing(e))return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();keys[k]=true;
  if(k==='e'||k===' '||k==='enter'){if(!e.repeat)actKey();}
  else if(k==='escape')escKey();else if(k==='m'&&mode==='play'&&!DL&&!MINI)openMenu();
  else if(k==='+'||k==='=')zoomStep(1);else if(k==='-')zoomStep(-1);
  else if(/^[1-5]$/.test(k)&&DL)DL.pick(+k-1);});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
const pad=$('#pad'),padi=$('#padi');let padId=null;
function padMove(e){const r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=(e.clientX-cx)/(r.width/2),dy=(e.clientY-cy)/(r.height/2);const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}touch.x=Math.abs(dx)<.15?0:dx;touch.y=Math.abs(dy)<.15?0:dy;padi.style.transform=`translate(${dx*34}px,${dy*34}px)`;}
pad.addEventListener('pointerdown',e=>{padId=e.pointerId;pad.setPointerCapture(e.pointerId);padMove(e);A.init();});
pad.addEventListener('pointermove',e=>{if(e.pointerId===padId)padMove(e);});
const padEnd=e=>{if(e.pointerId===padId){padId=null;touch.x=touch.y=0;padi.style.transform='';}};pad.addEventListener('pointerup',padEnd);pad.addEventListener('pointercancel',padEnd);
$('#act').addEventListener('pointerdown',e=>{e.preventDefault();A.init();actKey();});
$('#prompt').addEventListener('pointerdown',e=>{e.preventDefault();actKey();});
cv.addEventListener('wheel',e=>{if(mode==='play'){e.preventDefault();zoomStep(e.deltaY<0?1:-1);}},{passive:false});
function actKey(){A.init();if(CARD){cardClose();return;}if(DL){DL.act();return;}if(MINI&&MINI.act){MINI.act();return;}if(mode!=='play')return;if(NEAR)NEAR.fn();}
function escKey(){if(CARD)return;if(MENUOPEN){closeMenu();return;}if(MINI&&MINI.esc){MINI.esc();return;}}

/* ---------- dialoghi ---------- */
let DL=null;const dlg=$('#dlg');
function say(npc,node,after){const por=$('#por');DL={npc,node,after,btns:[],act(){if(!this.btns.length)return;if(this.btns.length===1)this.pick(0);},pick(i){const b=this.btns[i];if(b)b.click();}};showDlg();}
function showDlg(){const {npc,node}=DL;if(typeof node==='function'){DL.node=node();return showDlg();}
  if(!node){closeDlg();return;}
  dlg.classList.remove('hide');$('#dN').textContent=gx(npc.name||'');$('#dR').textContent=gx(npc.role||'');drawFace($('#por'),npc.p||palOf(npc.name||'x'));
  $('#dT').textContent=gx(typeof node.t==='function'?node.t():node.t);const box=$('#dC');box.innerHTML='';DL.btns=[];
  const ch=node.c&&node.c.length?node.c:[{t:'Avanti ▸',n:node.nx||null,act:node.go}];
  setTimeout(()=>{if(!DL)return;ch.forEach((c,i)=>{const b=document.createElement('button');b.textContent=(ch.length>1?(i+1)+'. ':'')+gx(typeof c.t==='function'?c.t():c.t);b.onclick=()=>{if(!DL)return;A.blip();if(c.act)c.act();if(c.n===undefined||c.n===null){closeDlg();}else{DL.node=c.n;showDlg();}};box.appendChild(b);DL.btns.push(b);});if(DL.btns[0]&&ch.length>0)DL.btns[0].focus&&0;},ch.length>1?220:60);}
function closeDlg(){const a=DL&&DL.after;DL=null;dlg.classList.add('hide');if(a)a();}
/* costruisce una catena di battute: stringa = testo, {q,c:[[etichetta,risposta,punti]]} = scelta */
function chain(npc,beats,onDone){let good=0,tot=0;const build=i=>{if(i>=beats.length)return null;const b=beats[i];
  if(typeof b==='string')return{t:b,nx:()=>build(i+1)||undefined,go:i+1>=beats.length?()=>{if(onDone)onDone(good,tot);}:undefined};
  if(b.fn){return{t:b.t||'',nx:()=>{b.fn();return build(i+1)||undefined;},go:i+1>=beats.length?()=>{if(onDone)onDone(good,tot);}:undefined};}
  tot++;return{t:b.q,c:b.c.map(o=>({t:o[0],n:{t:o[1],nx:()=>build(i+1)||undefined,go:()=>{if(o[2])good+=o[2];if(i+1>=beats.length&&onDone)onDone(good,tot);}}}))};};
  say(npc,build(0));}

/* ---------- carte a tutto schermo ---------- */
let CARD=null;function cardShow(t,x,cb){CARD={cb};$('#cdT').textContent=t;$('#cdX').textContent=gx(x||'');$('#card').classList.remove('hide');}
function cardClose(){if(!CARD)return;const c=CARD.cb;CARD=null;$('#card').classList.add('hide');if(c)c();}
$('#card').addEventListener('pointerdown',e=>{e.preventDefault();cardClose();});

/* ---------- loop ---------- */
let NEAR=null,MINI=null,MENUOPEN=false,lastT=0;
function loadMap(id,x,y){const m=prepMap(id);CURM=m;G.map=id;PL.x=x;PL.y=y;NPCS=[];if(window.STORY&&STORY.populate)STORY.populate(id);}
function goMap(id,x,y){fade(()=>{loadMap(id,x,y);const f=freeSpot(CURM,x,y);PL.x=f[0];PL.y=f[1];if(window.STORY&&STORY.entered)STORY.entered(id);});}
let fadeA=0,fadeCb=null,fadeDir=0;function fade(cb){fadeCb=cb;fadeDir=1;}
function update(dt){T+=dt;
  if(fadeDir){fadeA+=fadeDir*dt*4;if(fadeDir>0&&fadeA>=1){fadeA=1;fadeDir=-1;if(fadeCb){const f=fadeCb;fadeCb=null;f();}}else if(fadeDir<0&&fadeA<=0){fadeA=0;fadeDir=0;}}
  if(mode!=='play'||!CURM)return;
  const lock=DL||MINI||MENUOPEN||CARD||fadeDir>0;
  let dx=0,dy=0;if(!lock){dx=(keys['d']||keys['arrowright']?1:0)-(keys['a']||keys['arrowleft']?1:0)+touch.x;dy=(keys['s']||keys['arrowdown']?1:0)-(keys['w']||keys['arrowup']?1:0)+touch.y;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}}
  if(dx||dy){const sp=62*dt;moveBody(PL,dx*sp,dy*sp,CURM);PL.step+=dt*4;PL.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?3:2):(dy>0?0:1);if(Math.floor(PL.step*2)%2===0&&!(PL._s))A.step();PL._s=Math.floor(PL.step*2)%2===0;}else PL.step=0;
  for(const n of NPCS){if(n.wander&&!lock){n.t=(n.t||0)-dt;if(n.t<=0){n.t=1+Math.random()*2.5;n.vx=Math.random()<.4?0:(Math.random()*2-1);n.vy=Math.random()<.4?0:(Math.random()*2-1);}
      const sp=18*dt,ox=n.x,oy=n.y;const nx=n.x+(n.vx||0)*sp,ny=n.y+(n.vy||0)*sp;if(!hits(CURM,nx,n.y)&&nx>n.wander.x0&&nx<n.wander.x1)n.x=nx;if(!hits(CURM,n.x,ny)&&ny>n.wander.y0&&ny<n.wander.y1)n.y=ny;
      n.step=(n.x!==ox||n.y!==oy)?(n.step||0)+dt*3:0;if(n.x!==ox||n.y!==oy)n.dir=Math.abs(n.x-ox)>Math.abs(n.y-oy)?(n.x>ox?3:2):(n.y>oy?0:1);}
    else if(!n.wander){n.step=0;if(Math.hypot(n.x-PL.x,n.y-PL.y)<56)n.dir=Math.abs(PL.x-n.x)>Math.abs(PL.y-n.y)?(PL.x>n.x?3:2):(PL.y>n.y?0:1);}}
  for(const d of CURM.doors||[]){if(!lock&&PL.x>d.x&&PL.x<d.x+d.w&&PL.y>d.y&&PL.y<d.y+d.h){if(!d.req||d.req()){const to=d;goMap(d.to,d.tx,d.ty);A.blip();break;}else if(d.deny)toast(d.deny,2400);PL.y+=(d.pushY||0);}}
  // vicino
  NEAR=null;if(!lock){let bd=1e9;const list=(window.STORY&&STORY.interactables?STORY.interactables(CURM.id):[]);for(const o of list){const d=Math.hypot(o.x-PL.x,o.y-PL.y);if(d<o.r&&d<bd){bd=d;NEAR=o;}}}
  const pr=$('#prompt');if(NEAR){pr.classList.remove('hide');pr.innerHTML='<kbd>E</kbd>'+esc(NEAR.label);}else pr.classList.add('hide');
  if(window.STORY&&STORY.tick)STORY.tick(dt);}
function draw(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#0b0b10';ctx.fillRect(0,0,W,H);if(!CURM)return;
  const m=CURM,vw=W/Z,vh=H/Z;let cx=PL.x-vw/2,cy=PL.y-vh/2-6;cx=m.w<=vw?-(vw-m.w)/2:clamp(cx,0,m.w-vw);cy=m.h<=vh?-(vh-m.h)/2:clamp(cy,0,m.h-vh);CAM.x=lerp(CAM.x,cx,.25);CAM.y=lerp(CAM.y,cy,.25);if(Math.abs(CAM.x-cx)<.2)CAM.x=cx;if(Math.abs(CAM.y-cy)<.2)CAM.y=cy;
  ctx.setTransform(DPR*Z,0,0,DPR*Z,-CAM.x*Z*DPR,-CAM.y*Z*DPR);ctx.imageSmoothingEnabled=false;ctx.drawImage(m.cache,0,0);
  const L=[];for(const n of NPCS)L.push({y:n.y,n});L.push({y:PL.y,me:true});L.sort((a,b)=>a.y-b.y);
  for(const o of L){if(o.me){person(ctx,PL.x,PL.y,PL.dir,PL.step,playerLook());label(ctx,gx(PLAYER.name),PL.x,PL.y-30,'#fff',5);}
    else{const n=o.n;person(ctx,n.x,n.y,n.dir||0,n.step||0,n.p);if(n.mark){const b=Math.sin(T*5)>0?0:1;ctx.fillStyle='#ffd24d';ctx.fillRect(Math.round(n.x)-2,Math.round(n.y)-33+b,5,5);ctx.fillStyle='#7a5a00';ctx.fillRect(Math.round(n.x)-1,Math.round(n.y)-32+b,3,3);}if(n.name&&n.show&&Math.hypot(n.x-PL.x,n.y-PL.y)<78)label(ctx,n.name,n.x,n.y-29,'#ffe9a8',5);}}
  if(window.STORY&&STORY.drawWorld)STORY.drawWorld(ctx,m);
  // freccia guida
  if(window.STORY&&STORY.target&&mode==='play'&&!DL&&!MINI){const t=STORY.target();if(t){let tx=t.x,ty=t.y,lab=t.label;if(t.map!==m.id){const d=route(m.id,t.map);if(d){tx=d.x+d.w/2;ty=d.y+d.h/2;lab='→ '+(t.label||'');}else tx=null;}
    if(tx!=null){const dx=tx-PL.x,dy=ty-PL.y,dist=Math.hypot(dx,dy);if(dist>26){const a=Math.atan2(dy,dx),px=PL.x+Math.cos(a)*30,py=PL.y-10+Math.sin(a)*30;ctx.save();ctx.translate(px,py);ctx.rotate(a);ctx.fillStyle='#ffd24d';ctx.strokeStyle='#5a4300';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-4,-6);ctx.lineTo(-1,0);ctx.lineTo(-4,6);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();if(lab)label(ctx,lab.length>34?lab.slice(0,33)+'…':lab,px,py-12,'#ffd24d',5);}
      else{const b=Math.sin(T*6)*2;ctx.fillStyle='#ffd24d';ctx.beginPath();ctx.moveTo(tx,ty-26+b);ctx.lineTo(tx-5,ty-34+b);ctx.lineTo(tx+5,ty-34+b);ctx.fill();}}}}
  ctx.setTransform(DPR,0,0,DPR,0,0);if(fadeA>0){ctx.fillStyle='rgba(0,0,0,'+fadeA+')';ctx.fillRect(0,0,W,H);}}
function frame(ts){const dt=Math.min(.05,(ts-lastT)/1000||0);lastT=ts;update(dt);draw();requestAnimationFrame(frame);}
resize();requestAnimationFrame(frame);
$('#bZin').onclick=()=>zoomStep(1);$('#bZout').onclick=()=>zoomStep(-1);
{const ap=()=>{const on=!!lsGet('tedx.big',false);document.body.classList.toggle('bigck',on);$('#bA').textContent=on?'A−':'A+';};ap();$('#bA').onclick=()=>{lsSet('tedx.big',!lsGet('tedx.big',false));ap();};}
{let s=lsGet('tedx.snd',1);A.on=!!s;$('#bSnd').textContent=A.on?'🔊':'🔇';$('#bSnd').onclick=()=>{A.on=!A.on;lsSet('tedx.snd',A.on?1:0);$('#bSnd').textContent=A.on?'🔊':'🔇';A.init();if(A.on)A.blip();};}
