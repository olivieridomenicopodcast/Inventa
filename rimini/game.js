'use strict';
/* RIMINI 3 GIORNI · giochino 2D dentro il Palacongressi (fan project non ufficiale) */
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
function hashStr(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const hsh=(x,y)=>{let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cv=$('#cv'),ctx=cv.getContext('2d');
const MOB=matchMedia('(pointer:coarse)').matches||innerWidth<700;if(MOB)document.body.classList.add('mob');
let W=0,H=0,DPR=1,Z=3;
function resize(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  Z=clamp(Math.round(Math.min(W/400,H/240)),2,5);if(MOB)Z=clamp(Math.round(Math.min(W/130,H/200)),2,4);}
addEventListener('resize',resize);resize();
const PIX='"Press Start 2P",monospace';
const WW=820,WH=440;

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
  if(dir===1){c.fillRect(x-5,y-23-bob,10,9);}
  else{c.fillRect(x-5,y-23-bob,10,3);c.fillRect(x-5,y-21-bob,2,3);c.fillRect(x+3,y-21-bob,2,3);if(p.long){c.fillRect(x-5,y-21-bob,2,7);c.fillRect(x+3,y-21-bob,2,7);}}
  // occhi
  c.fillStyle='#1b1b24';
  if(dir===0){c.fillRect(x-2,y-18-bob,1,2);c.fillRect(x+1,y-18-bob,1,2);c.fillStyle='rgba(200,80,80,.5)';c.fillRect(x-1,y-15-bob,2,1);}
  else if(dir===2)c.fillRect(x-3,y-18-bob,1,2);else if(dir===3)c.fillRect(x+2,y-18-bob,1,2);
  // cuffie (Niky)
  if(p.phones){c.fillStyle='#1b1d28';c.fillRect(x-5,y-24-bob,10,1);c.fillRect(x-5,y-23-bob,1,5);c.fillRect(x+4,y-23-bob,1,5);c.fillStyle=p.badge||'#ff6a3d';c.fillRect(x-6,y-20-bob,2,4);c.fillRect(x+4,y-20-bob,2,4);}
  if(p.cap){c.fillStyle=p.cap;c.fillRect(x-5,y-24-bob,10,3);if(dir===0)c.fillRect(x-5,y-22-bob,10,1);}
}
const NIKY={shirt:'#ff7a3d',pants:'#26304f',skin:'#e8b98a',hair:'#3a2a1c',phones:true,badge:'#4dd0ff',shoe:'#fff'};
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

function buildGround(){
  const L=layer(WW,WH),c=L.c;
  paintGrass(c,0,0,WW,WH);
  // piazzale e strada
  paintStone(c,0,372,WW,28);c.fillStyle='#3a3f4a';c.fillRect(0,400,WW,40);c.fillStyle='#e6e2c8';for(let i=0;i<WW;i+=22)c.fillRect(i,419,12,2);c.fillStyle='#565c68';c.fillRect(0,400,WW,2);
  // marciapiede e ombra edificio
  c.fillStyle='rgba(0,0,0,.18)';c.fillRect(24,372,600,6);
  paintStone(c,624,372,196,28);
  // sale
  room(L,20,20,170,352,(c,x,y,w,h)=>paintTile(c,x,y,w,h,'#cdd5df','#c3ccd8'),[{s:'e',a:280,b:306}]);
  room(L,190,20,260,230,(c,x,y,w,h)=>paintCarpet(c,x,y,w,h,'#2b3358','#323c66'),[{s:'s',a:300,b:350}]);
  room(L,190,250,260,122,(c,x,y,w,h)=>paintWood(c,x,y,w,h,'#dcc7a4','#cfb893'),[{s:'n',a:300,b:350},{s:'w',a:280,b:306},{s:'e',a:290,b:320},{s:'s',a:300,b:340}]);
  paintCarpet(c,450,20,20,180,'#59607a','#626a86');wallH(L,450,20,26);
  [20,80,140].forEach((y,i)=>room(L,470,y,150,60,(c,x,y,w,h)=>paintCarpet(c,x,y,w,h,'#3a2f55','#443963'),[{s:'w',a:y+22,b:y+44}]));
  room(L,450,200,170,172,(c,x,y,w,h)=>paintCarpet(c,x,y,w,h,'#1f5560','#276470'),[{s:'w',a:290,b:320},{s:'e',a:290,b:320},{s:'n',a:450,b:470}]);
  // ---------- sala della piazza (palco principale)
  stage(L,214,26,212,48,'MARKETERS WORLD');
  for(let r=0;r<7;r++){const yy=104+r*19;for(let i=0;i<10;i++){chair(c,208+i*10,yy,'#9a2a3a');chair(c,346+i*7.4|0,yy,'#9a2a3a');}}
  solid(L,206,100,102,138);solid(L,344,100,78,138);
  c.fillStyle='rgba(255,255,255,.12)';c.fillRect(308,96,36,150);
  desk(L,420,168,22,18,'#3a3a46','CAM');c.fillStyle='#111';c.fillRect(428,160,6,8);c.fillStyle='#ccc';c.fillRect(430,158,2,3);
  txt(c,'SALA DELLA PIAZZA',326,90,'#c9d0ff',8);
  // ---------- foyer
  desk(L,402,258,40,16,'#8a5a32','BAR');c.fillStyle='#e8e3d6';for(let i=0;i<4;i++){c.fillRect(406+i*9,278,5,5);}
  plant(L,214,262);plant(L,436,356);plant(L,240,262);
  // scale
  c.fillStyle='#b8ae9a';for(let i=0;i<5;i++)c.fillRect(198,332+i*6,34,4);c.fillStyle='#8a806e';for(let i=0;i<5;i++)c.fillRect(198,336+i*6,34,1);solid(L,196,326,40,2);
  txt(c,'SCALE',216,322,'#665c4a',8);
  desk(L,328,296,44,16,'#2f3552','INFO APP');
  // ---------- expo
  STANDS.forEach(s=>booth(L,s.x-26,s.y-16,52,32,s.color,s.short));
  txt(c,'AREA EXPO',104,38,'#8892a8',8);
  plant(L,36,356);plant(L,170,356);plant(L,170,40);
  // ---------- workshop
  [20,80,140].forEach((y,i)=>{const c2=L.c;stage(L,578,y+10,36,26,'');for(let r=0;r<3;r++)for(let k=0;k<5;k++)chair(c2,490+k*10,y+12+r*14,'#7a62b8');txt(c2,'WORKSHOP '+(i+1),545,y+54,'#bfb2e8',8);});
  // ---------- lounge
  table(L,490,236,9,'#e9e4d8');table(L,540,236,9);table(L,590,236,9);table(L,500,330,9);table(L,590,330,9);
  desk(L,556,356,50,10,'#6a4a2a','CAFFÈ');plant(L,470,360);plant(L,606,212);
  txt(c,'NETWORKING',535,214,'#9fd9e4',8);
  // ---------- esterno: gazebo accrediti
  c.fillStyle='rgba(0,0,0,.2)';c.fillRect(206,380,76,16);c.fillStyle='#ff6a3d';c.fillRect(204,372,80,5);c.fillStyle='#fff';for(let i=0;i<8;i++)c.fillRect(204+i*10,372,5,5);
  desk(L,214,384,60,10,'#2b3358','ACCREDITI');
  solid(L,200,372,4,22);solid(L,284,372,4,22);
  // striscione
  c.fillStyle='#14172a';c.fillRect(372,376,140,22);c.fillStyle='#ff6a3d';c.fillRect(372,376,140,2);txt(c,'MARKETERS WORLD',442,384,'#fff',8);txt(c,'16-18 OTT 2026',442,393,'#8fd8ff',8);solid(L,370,376,3,22);solid(L,512,376,3,22);
  [60,120,560,600,700,760].forEach((x,i)=>{tree(c,x,386+(i%2)*3,8);});
  // ---------- prato est: yoga e tenda Offworld
  for(let k=0;k<4;k++){const cols=['#e86a8a','#4ab8e0','#7ad37a','#ffd24d'];c.fillStyle=cols[k];c.fillRect(648+k*18,92,12,28);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(648+k*18,92,12,2);}
  txt(c,'YOGA',672,76,'#e8f7e0',8);
  c.fillStyle='#d9d3c6';c.fillRect(642,140,120,2);
  // tenda offworld
  const tx=650,ty=196,tw=150,th=160;paintWood(c,tx,ty+24,tw,th-24,'#2a2038','#35294a');
  c.fillStyle='#ff6a3d';c.fillRect(tx,ty,tw,26);c.fillStyle='#fff';for(let i=0;i<15;i++)c.fillRect(tx+i*10,ty,5,26);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(tx,ty+22,tw,4);
  txt(c,'OFFWORLD',tx+tw/2,ty+38,'#ffd24d',16);
  c.fillStyle='#0e0b18';c.fillRect(tx+30,ty+52,90,34);c.fillStyle='#ff6a3d';c.fillRect(tx+30,ty+52,90,2);txt(c,'KARAOKE',tx+75,ty+70,'#fff',8);
  desk(L,tx+14,ty+110,40,12,'#161226','DJ');c.fillStyle='#0b0d18';c.fillRect(tx+4,ty+52,8,34);c.fillRect(tx+tw-12,ty+52,8,34);
  solid(L,tx+28,ty+50,94,38);
  table(L,tx+96,ty+120,8,'#cfc9ba');table(L,tx+122,ty+142,7,'#cfc9ba');
  L.dyn.push({k:'lights',x:tx,y:ty+26,w:tw});
  // muretto est
  solid(L,WW-4,0,4,WH);solid(L,0,0,4,WH);solid(L,0,WH-4,WW,4);solid(L,0,0,WW,4);
  solid(L,620,0,200,20);solid(L,624,194,4,0);
  // alberi est
  tree(c,700,50,9);tree(c,760,60,9);tree(c,640,180,8);tree(c,790,190,8);tree(c,720,370,8);
  return L;
}
function buildFirst(){
  const L=layer(WW,WH),c=L.c;
  c.fillStyle='#0a0d18';c.fillRect(0,0,WW,WH);
  room(L,130,30,400,300,(c,x,y,w,h)=>paintCarpet(c,x,y,w,h,'#2a2347','#322a55'),[{s:'s',a:300,b:360}]);
  room(L,130,330,400,70,(c,x,y,w,h)=>paintWood(c,x,y,w,h,'#dcc7a4','#cfb893'),[{s:'n',a:300,b:360}]);
  stage(L,270,40,120,40,'MARKETERS WORLD');
  // anfiteatro: file di sedute ad arco
  const cx=330,cy=70;
  for(let rad=44;rad<=116;rad+=11){const da=10/(rad*1.6);for(let a=Math.PI*.1;a<=Math.PI*.9;a+=da){const x=Math.round(cx+Math.cos(a)*rad*1.6),y=Math.round(cy+Math.sin(a)*rad*2.05);if(x>146&&x<512&&y<318)chair(c,x-2,y-2,'#2b6aa8');}}
  txt(c,'SALA DELL’ANFITEATRO',330,94,'#c9d0ff',8);
  // balcone e scale
  c.fillStyle='#b8ae9a';for(let i=0;i<5;i++)c.fillRect(138,340+i*6,34,4);txt(c,'SCALE',156,386,'#665c4a',8);
  plant(L,200,350);plant(L,480,350);table(L,300,368,8);table(L,380,368,8);
  c.fillStyle='rgba(255,255,255,.1)';c.fillRect(136,334,388,2);
  solid(L,0,0,WW,4);solid(L,0,WH-4,WW,4);solid(L,0,0,4,WH);solid(L,WW-4,0,4,WH);
  return L;
}

/* ============================================================ stato */
let FL=[null,null],G=null,NPC=[],mode='title';
const keys={};let touch={x:0,y:0};
const FLAGS0={app:false,accred:false,ws:0,talk:0,anfi:false,stands:{},yoga:false,off:0,dario:false,luca:false,selfie:false,coffee:0};
function fmt(min){const h=Math.floor(min/60),m=Math.floor(min%60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');}
const rng=mulberry32(hashStr('rimini'+Math.floor(Date.now()/86400000)));
function pickFrom(a){return a[Math.floor(Math.random()*a.length)];}

function newGame(){
  G={day:0,min:8*60+45,f:0,p:{x:330,y:392,dir:3,step:0},flags:JSON.parse(JSON.stringify(FLAGS0)),contacts:[],tips:[],log:[],done:false,cam:{x:330,y:240},fade:0,watching:null,t:0,met:{}};
  FL[0]=buildGround();FL[1]=buildFirst();buildNPC();
}
const FPAL=[['#c9a24a','#2a3566'],['#3da5d9','#2b3350'],['#6bc46d','#3a3a4a'],['#b57bff','#2a2a44'],['#ffd24d','#3a3350'],['#e86a8a','#2b3350'],['#f0f0f5','#303850'],['#3b3b46','#242a40']];
const HAIRS=['#2a1d14','#4a3322','#7a5a2a','#1a1a20','#8a3a2a','#c9a24a','#d9d2c4'],SKINS=['#e8b98a','#dfae80','#c98e62','#f0c8a0','#a8734c'];
function randPal(){const s=pickFrom(FPAL);return{shirt:s[0],pants:s[1],skin:pickFrom(SKINS),hair:pickFrom(HAIRS),long:Math.random()<.35,badge:pickFrom(['#ff6a3d','#4dd0ff','#7ad37a','#ffd24d']),cap:Math.random()<.12?pickFrom(['#2a3566','#8a2a2a']):null};}
function buildNPC(){
  NPC=[];
  const add=o=>{o.dir=o.dir??0;o.step=0;o.vx=0;o.vy=0;o.t=Math.random()*3;NPC.push(o);return o;};
  FAMILY.forEach(f=>add({id:f.id,kind:'family',name:f.name,role:f.role,f:f.where.f,x:f.where.x,y:f.where.y,p:{shirt:f.shirt,pants:'#232a44',skin:f.skin,hair:f.hair,badge:'#ffd24d'},data:f}));
  SPEAKERS.forEach(s=>add({id:'sp_'+s.name,kind:'speaker',name:s.name,role:'Speaker annunciata/o (da verificare col programma)',f:s.where.f,x:s.where.x,y:s.where.y,p:randPal(),dir:2}));
  add({id:'accred',kind:'staff',name:'Staff accrediti',role:'Ritiro badge',f:0,x:244,y:379,p:{shirt:'#ff6a3d',pants:'#232a44',skin:'#e8b98a',hair:'#3a2a1c',badge:'#fff'},dir:0});
  add({id:'info',kind:'staff',name:'Assistenza app',role:'Info point',f:0,x:350,y:290,p:{shirt:'#2f3552',pants:'#232a44',skin:'#dfae80',hair:'#1a1a20',badge:'#4dd0ff'},dir:0});
  add({id:'yoga',kind:'staff',name:'Insegnante di yoga',role:'Sessione sul prato',f:0,x:672,y:84,p:{shirt:'#7ad37a',pants:'#e8e8f0',skin:'#e0b085',hair:'#4a3322',badge:'#7ad37a',long:true},dir:0});
  add({id:'dj',kind:'staff',name:'Host Offworld',role:'Karaoke e DJ set',f:0,x:726,y:262,p:{shirt:'#161226',pants:'#232a44',skin:'#e8b98a',hair:'#c9a24a',badge:'#ff6a3d',cap:'#ff6a3d'},dir:0});
  // partecipanti inventati che girano
  const R=[[210,262,430,360,0],[466,214,610,360,0],[470,214,610,360,0],[30,300,176,360,0],[30,300,176,360,0],[140,340,520,396,1],[146,300,520,336,1],[300,380,366,396,0],[330,296,420,360,0]];
  R.forEach((r,i)=>{const fn=pickFrom(ATT_FIRST),ln=pickFrom(ATT_LAST);add({id:'att'+i,kind:'att',name:fn+' '+ln,role:pickFrom(ATT_JOBS)+' · '+pickFrom(ATT_CITY),f:r[4],x:r[0]+Math.random()*(r[2]-r[0]),y:r[1]+Math.random()*(r[3]-r[1]),p:randPal(),wander:{x0:r[0],y0:r[1],x1:r[2],y1:r[3]},first:fn,job:null});});
}

/* ============================================================ movimento e collisioni */
function hits(L,x,y,gate){const b={x:x-4,y:y-4,w:8,h:5};
  for(const s of L.solids)if(b.x<s.x+s.w&&b.x+b.w>s.x&&b.y<s.y+s.h&&b.y+b.h>s.y)return true;
  if(!G.flags.accred&&G.f===0&&b.x<340&&b.x+b.w>300&&b.y<378&&b.y+b.h>366)return true;
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
function sessionNow(where){
  const m=G.min;
  for(const e of PROGRAMMA){if(e.d!==G.day||e.w!==where)continue;const [h,mm]=e.t.split(':').map(Number),s=h*60+mm;if(m>=s&&m<s+70)return e;}
  return null;
}
function nextEvent(){
  const list=PROGRAMMA.filter(e=>e.d===G.day&&(+e.t.slice(0,2)*60+ +e.t.slice(3))>G.min);
  return list[0]||null;
}
function interactables(){
  const out=[],f=G.f;
  if(f===0){
    // stand
    STANDS.forEach(s=>out.push({x:s.x,y:s.y+22,r:20,label:'Guarda lo stand «'+s.label+'»',fn:()=>standTalk(s)}));
    // sale
    out.push({x:326,y:170,r:24,label:'Siediti e guarda lo speech',fn:()=>watch('main')});
    [20,80,140].forEach((y,i)=>out.push({x:520,y:y+28,r:26,label:'Segui il workshop '+(i+1),fn:()=>watch('work')}));
    out.push({x:420,y:290,r:20,label:'Un caffè al bar',fn:coffee});
    out.push({x:350,y:314,r:20,label:'Programma e info nell’app',fn:()=>{if(!G.flags.app)say(NPC.find(n=>n.id==='info'),nodeInfo());else openPhone('prog');}});
    out.push({x:216,y:336,r:18,label:'Sali al primo piano',fn:()=>goFloor(1,156,376)});
    out.push({x:700,y:300,r:34,label:'Offworld: entra in pista',fn:offworld});
    out.push({x:672,y:120,r:30,label:'Una sessione di yoga',fn:()=>say(NPC.find(n=>n.id==='yoga'),nodeYoga())});
    out.push({x:470,y:354,r:18,label:'Pausa sul divano',fn:rest});
    // pannelli informativi
    out.push({x:326,y:98,r:22,label:'Leggi il cartello della sala',fn:()=>info('Sala della Piazza',FACTS.piazza)});
    out.push({x:330,y:384,r:16,label:'Leggi l’ingresso',fn:()=>info(EVENT.name+' '+EVENT.year,EVENT.dates+'. '+EVENT.place+'. '+FACTS.palazzo)});
  }else{
    out.push({x:156,y:372,r:18,label:'Scendi al piano terra',fn:()=>goFloor(0,216,342)});
    out.push({x:330,y:104,r:30,label:'Leggi il cartello della sala',fn:()=>info('Sala dell’Anfiteatro',FACTS.anfi)});
    out.push({x:330,y:200,r:50,label:'Siediti e guarda lo spettacolo',fn:()=>{if(!sessionNow('main')){info('Anfiteatro','Qui non c’è nessuna sessione adesso. Controlla il programma nell’app.');}else watch('anfi');}});
  }
  for(const n of NPC)if(n.f===f)out.push({x:n.x,y:n.y,r:22,npc:n,label:'Parla con '+n.name,fn:()=>talkTo(n)});
  return out;
}
function nearest(){
  const p=G.p;let best=null,bd=1e9;
  for(const o of interactables()){let d=Math.hypot(o.x-p.x,o.y-p.y);if(d>=o.r)continue;d-=o.npc?(o.npc.kind==='att'?0:10):4;if(d<bd){bd=d;best=o;}}
  return best;
}

/* ============================================================ dialoghi */
const dlg=$('#dlg');let DL=null;
function say(npc,node){DL={npc,node};showDlg();}
function showDlg(){
  const {npc,node}=DL;dlg.classList.remove('hide');
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
function addContact(n){if(G.contacts.some(c=>c.name===n.name))return false;G.contacts.push({name:n.name,role:n.role,kind:n.kind});A.stamp();toast('Nuovo contatto: '+n.name);return true;}
function talkTo(n){
  if(n.kind==='family'){
    const d=n.data;
    if(n.id==='dario')G.flags.dario=true;if(n.id==='luca')G.flags.luca=true;
    const greet=pickFrom(['Ciao! Benvenuto al Marketers World!','Ehi, che bello vederti qui!','Buon evento! Divertiti e fai tante conoscenze.']);
    say(n,{t:greet,c:[{t:'Chi sei?',n:{t:d.facts[0]+(d.facts[1]?' '+d.facts[1]:''),c:[{t:'Parlami dell’evento',n:factNode(n)},{t:'Ciao!',n:null}]}},{t:'Parlami dell’evento',n:factNode(n)},{t:'Ciao!',n:null,act:()=>addContact(n)}]});
  }else if(n.kind==='speaker'){
    say(n,{t:'Ciao! Tra gli speaker annunciati per il 2026 compare il mio nome. Per orari e sale guarda il programma nell’app.',c:[{t:'Ciao e buon lavoro!',n:null,act:()=>addContact(n)}]});
  }else if(n.id==='accred')say(n,nodeAccred());
  else if(n.id==='info')say(n,nodeInfo());
  else if(n.id==='yoga')say(n,nodeYoga());
  else if(n.id==='dj')say(n,{t:'Benvenuto all’Offworld! '+FACTS.off+' Passa la sera: si canta.',c:[{t:'Ci vediamo stasera!',n:null}]});
  else attendee(n);
}
function factNode(n){const pool=[FACTS.nato,FACTS.rimini,FACTS.fri,FACTS.wk,FACTS.app,FACTS.off,FACTS.num,FACTS.palazzo];return{t:pickFrom(pool),c:[{t:'Interessante!',n:null,act:()=>addContact(n)}]};}
function nodeAccred(){
  const F=G.flags;
  if(F.accred)return{t:'Hai già il badge: entra pure al Palacongressi dal varco principale. Buon evento!',c:[{t:'Grazie!',n:null}]};
  if(!F.app)return{t:'Benvenuto! Per ritirare il badge serve il QR del biglietto, che sta nell’app: l’accesso avviene con l’email del biglietto e un codice a 6 cifre. Passa dall’assistenza app qui accanto, poi torna da me.',c:[{t:'Vado all’assistenza app',n:null},{t:'Ho già l’app!',n:{t:'Bene, ma devi fare l’accesso: parla con l’assistenza app qui vicino.',c:[{t:'Ok',n:null}]}}]};
  return{t:'Perfetto, vedo il QR. Ecco il tuo badge: «Niky · Podcast coach». Il varco si apre!',c:[{t:'Grazie!',n:null,act:()=>{F.accred=true;A.stamp();toast('Accredito ritirato! Il varco è aperto.',3000);}}]};
}
function nodeInfo(){
  const F=G.flags;
  if(!F.app)return{t:'Ciao! Qui ti aiuto con l’app ufficiale: si accede con l’email del biglietto e un codice a 6 cifre, il QR sta dentro. Dentro trovi workshop, programma e networking.',c:[{t:'Fai l’accesso',n:{t:'Fatto! Ora hai il QR e il programma sul telefono: apri l’app con P o con il pulsante 📱.',c:[{t:'Grazie!',n:null,act:()=>{F.app=true;A.stamp();toast('App attivata! Apri il telefono con P.',3000);}}]}},{t:'Più tardi',n:null}]};
  return{t:'L’app ti mostra il programma, i workshop prenotati e le persone con cui fare networking. Ogni persona che incontri finisce nei tuoi contatti.',c:[{t:'Apri l’app',n:null,act:()=>openPhone('prog')},{t:'Ok',n:null}]};
}
function nodeYoga(){
  return{t:'Ciao! Ogni tanto tra una sessione e l’altra ci si ferma a respirare. Vuoi provare tre respiri profondi?',c:[{t:'Sì, respiriamo',n:{t:'Inspira… espira… Meglio! Ti senti più leggero.',c:[{t:'Grazie',n:null,act:()=>{if(!G.flags.yoga){G.flags.yoga=true;A.stamp();toast('Yoga fatto!');}}}]}},{t:'Magari dopo',n:null}]};
}
function attendee(n){
  const first=n.name.split(' ')[0],met=G.met[n.id];
  if(met)return say(n,{t:'Ci siamo già presentati! Ci sentiamo dopo l’evento, ok?',c:[{t:'Certo!',n:null}]});
  const tip=pickFrom(TIPS[pickFrom(TIPKEYS)]);
  say(n,{t:'Ciao! Sono '+first+', '+n.role.replace(' · ',' di ')+'. Tu?',c:[
    {t:'Sono Niky, faccio il podcast coach',n:{t:'Che bello! Io sto cercando proprio di capire come migliorare la mia comunicazione. Scambiamoci i contatti?',c:[{t:'Volentieri',n:null,act:()=>{G.met[n.id]=1;addContact(n);}},{t:'Dopo',n:null}]}},
    {t:'Che workshop consigli?',n:{t:'Il consiglio che mi porto a casa: «'+tip+'»',c:[{t:'Lo segno!',n:null,act:()=>{G.met[n.id]=1;addContact(n);addTip(tip,'consiglio di '+first);}}]}},
    {t:'Ciao, devo scappare!',n:null}
  ]});
}
function standTalk(s){
  const first=!G.flags.stands[s.id];G.flags.stands[s.id]=1;
  info(s.label,s.info+(first?' (visitato!)':''));if(first){A.stamp();}
}
function coffee(){G.flags.coffee++;toast(pickFrom(['Un caffè al volo: ora sei carico.','Il caffè del Palacongressi: fa il suo dovere.','Doppio espresso: pronto per il prossimo speech!']));A.blip();}
function rest(){G.min+=15;toast('Ti siedi 15 minuti sul divano a controllare l’app.');}
function addTip(t,src){if(!G.tips.some(x=>x.t===t))G.tips.push({t,src});}
function goFloor(f,x,y){G.fade=1;setTimeout(()=>{G.f=f;G.p.x=x;G.p.y=y;if(f===1)G.flags.anfi=true;A.blip();},120);}
function watch(where){
  const e=sessionNow(where==='anfi'?'main':where);
  if(!e){const nx=nextEvent();info(where==='work'?'Workshop':'Palco principale',G.day===0&&where==='main'?'Il venerdì il palco è chiuso: oggi workshop. '+FACTS.fri:G.day>0&&where==='work'?'I workshop sono il venerdì. Oggi si va in Sala della Piazza per gli speech.':'Ora non c’è una sessione.'+(nx?' La prossima: '+nx.t+', '+nx.e+'.':' Per oggi è finita.'));return;}
  if(!G.flags.accred){return;}
  G.watching={e,t:0,dur:4.5,where};closeDlg();
}
function finishWatch(){
  const w=G.watching;G.watching=null;G.min+=60;
  const tip=pickFrom(TIPS[pickFrom(TIPKEYS)]);addTip(tip,w.e.e+' '+DAYNAMES[G.day]);
  if(w.where==='work'){G.flags.ws++;toast('Workshop concluso. Spunto: «'+tip+'»',4200);
    const n=NPC.filter(x=>x.kind==='att'&&!G.met[x.id])[0];if(n){G.met[n.id]=1;addContact(n);}}
  else{G.flags.talk++;toast('Speech concluso. Spunto: «'+tip+'»',4200);}
  A.stamp();
}
function offworld(){
  if(G.min<20*60+30){info('Offworld','Qui la sera: '+FACTS.off+' Si inizia verso le 20:30.');return;}
  say({name:'Host Offworld',role:'Karaoke',p:NPC.find(n=>n.id==='dj').p},{t:'Il microfono è tuo! Che canzone scegli?',c:[
    {t:'Un classico italiano',n:{t:'La sala canta con te. Standing ovation!',c:[{t:'Inchino',n:null,act:offDone}]}},
    {t:'Una hit degli anni 2000',n:{t:'Dopo due stonature il pubblico ti salva cantando il ritornello. Che serata!',c:[{t:'Inchino',n:null,act:offDone}]}},
    {t:'Passo il microfono',n:null}]});
}
function offDone(){G.flags.off++;G.min+=50;A.stamp();toast('Offworld vissuto!');}

/* ============================================================ passaporto e telefono */
function quests(){
  const F=G.flags,nst=Object.keys(F.stands).length;
  return[
    {t:'Scarica l’app e accedi',s:'Assistenza app, fuori dall’ingresso',ok:F.app},
    {t:'Ritira l’accredito',s:'Gazebo accrediti',ok:F.accred},
    {t:'Segui un workshop',s:'Venerdì, nelle sale a est',ok:F.ws>=1},
    {t:'Segui 2 speech dal palco',s:'Sabato o domenica, Sala della Piazza ('+F.talk+'/2)',ok:F.talk>=2},
    {t:'Visita l’Anfiteatro',s:'Primo piano, dalle scale nel foyer',ok:F.anfi},
    {t:'Scambia 5 contatti',s:'Parla con i partecipanti ('+G.contacts.length+'/5)',ok:G.contacts.length>=5},
    {t:'Visita 3 stand',s:'Area expo ('+nst+'/3)',ok:nst>=3},
    {t:'Incontra Dario e Luca',s:'Vicino al palco principale',ok:F.dario&&F.luca},
    {t:'Fai una pausa di yoga',s:'Sul prato a est',ok:F.yoga},
    {t:'Vivi l’Offworld',s:'Tenda a est, dopo le 20:30',ok:F.off>=1},
    {t:'Scatta una foto ricordo',s:'Pulsante 📷 o tasto F',ok:F.selfie}
  ];
}
function progress(){const q=quests();return{done:q.filter(x=>x.ok).length,tot:q.length};}
let phoneTab='pass';
function openPhone(tab){if(!G.flags.app){toast('Prima serve l’app: vai all’assistenza fuori dall’ingresso.');return;}phoneTab=tab||phoneTab;$('#phone').classList.remove('hide');renderPhone();}
function closePhone(){$('#phone').classList.add('hide');}
function renderPhone(){
  const T=[['pass','Passaporto'],['prog','Programma'],['cont','Contatti'],['map','Mappa']];
  $('#phT').innerHTML=T.map(([k,n])=>`<button data-k="${k}" class="${phoneTab===k?'on':''}">${n}</button>`).join('');
  document.querySelectorAll('#phT button').forEach(b=>b.onclick=()=>{phoneTab=b.dataset.k;renderPhone();});
  const B=$('#phB');
  if(phoneTab==='pass'){const p=progress(),q=quests();
    B.innerHTML=`<div class="ring" style="--p:${Math.round(p.done/p.tot*100)}"><b>${p.done}/${p.tot}</b></div>`+q.map(x=>`<div class="q ${x.ok?'done':''}"><div class="ck">${x.ok?'✓':''}</div><div><b>${esc(x.t)}</b><small>${esc(x.s)}</small></div></div>`).join('')+`<div class="note">Tips raccolti: ${G.tips.length}</div><div style="margin-top:12px"><button class="btn ghost" id="finish" style="width:100%">Termina i tre giorni</button></div>`;
    $('#finish').onclick=()=>{closePhone();endGame();};
  }else if(phoneTab==='prog'){
    const cur=PROGRAMMA.filter(e=>e.d===G.day);
    B.innerHTML=`<div class="note" style="margin:0 0 10px">${esc(DAYNAMES[G.day])} · ${esc(EVENT.hours)}.<br>Gli orari sono indicativi: il programma ufficiale può essere diverso.</div>`+cur.map(e=>{const s=+e.t.slice(0,2)*60+ +e.t.slice(3);return `<div class="pg ${G.min>=s&&G.min<s+70?'now':''}"><b>${e.t}</b> · ${esc(e.e)}</div>`;}).join('')+`<div class="note"><b>Speaker annunciati per il 2026 (da verificare):</b> ${SPEAKERS.map(s=>esc(s.name)).join(', ')}.</div><div class="note">Fonti: ${esc(EVENT.src)}.</div>`;
  }else if(phoneTab==='cont'){
    B.innerHTML=G.contacts.length?G.contacts.map(c=>`<div class="pg"><b>${esc(c.name)}</b><br><span style="color:var(--dim)">${esc(c.role)}</span></div>`).join(''):'<div class="note">Ancora nessun contatto. Parla con le persone che incontri.</div>';
  }else{
    B.innerHTML=`<canvas id="mapc" width="410" height="215"></canvas><div class="note">Pianta stilizzata, non in scala. ${esc(FACTS.piazza)}. ${esc(FACTS.anfi)}.</div><div style="margin-top:8px"><button class="btn ghost" id="mf" style="width:100%">${G.f===0?'Mostra il primo piano':'Mostra il piano terra'}</button></div>`;
    drawMap($('#mapc'),G.f);$('#mf').onclick=()=>{drawMap($('#mapc'),G.f===0?1:0,true);};
  }
}
function drawMap(cvm,f,other){const c=cvm.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#0a0d18';c.fillRect(0,0,cvm.width,cvm.height);c.drawImage(FL[f].cv,0,0,WW,WH,0,0,cvm.width,cvm.width*WH/WW);
  if(f===G.f){const s=cvm.width/WW;c.fillStyle='#fff';c.beginPath();c.arc(G.p.x*s,(G.p.y-6)*s,5,0,7);c.fill();c.fillStyle='#ff6a3d';c.beginPath();c.arc(G.p.x*s,(G.p.y-6)*s,3,0,7);c.fill();}}
$('#bPhone').onclick=()=>openPhone();$('#phX').onclick=closePhone;
$('#bPhoto').onclick=()=>photo();
$('#bSnd').onclick=()=>{A.on=!A.on;$('#bSnd').textContent=A.on?'🔊':'🔇';};

/* ============================================================ foto, fine, toast */
function toast(t,ms){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),ms||2400);}
function photo(){
  const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;const g=c.getContext('2d');g.drawImage(cv,0,0);
  g.fillStyle='rgba(8,10,20,.8)';const bh=Math.round(c.height*.09);g.fillRect(0,c.height-bh,c.width,bh);g.fillStyle='#fff';g.font='700 '+Math.round(bh*.38)+'px "Space Grotesk",sans-serif';g.textAlign='left';g.fillText('Niky · Rimini '+DAYNAMES[G.day]+' ottobre 2026',Math.round(bh*.4),c.height-bh*.4);
  g.textAlign='right';g.fillStyle='#ff6a3d';g.fillText('Fan project · Inventa',c.width-bh*.4,c.height-bh*.4);
  c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='rimini-foto-ricordo.png';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},400);});
  if(!G.flags.selfie){G.flags.selfie=true;A.stamp();}toast('Foto ricordo scattata!');
}
function endGame(){
  if(G.done)return;G.done=true;const p=progress(),F=G.flags;
  const title=p.done>=p.tot?'Partecipante leggendario':p.done>=8?'Networker del Palacongressi':p.done>=5?'Partecipante attivo':'Turista di Rimini';
  $('#endB').innerHTML=`<h2>${esc(title)}</h2><div class="small" style="color:var(--dim);font-size:13px;line-height:1.55;margin-bottom:6px">Tre giorni a Rimini: hai completato <b style="color:var(--ink)">${p.done}</b> obiettivi su ${p.tot}.</div>
   <div class="kv"><div>Contatti<b>${G.contacts.length}</b></div><div>Workshop<b>${F.ws}</b></div><div>Speech<b>${F.talk}</b></div><div>Stand<b>${Object.keys(F.stands).length}</b></div><div>Spunti<b>${G.tips.length}</b></div><div>Offworld<b>${F.off}</b></div></div>
   <div class="row2"><button class="btn" id="eAgain">Rigioca</button><button class="btn ghost" id="eBack">Torna al gioco</button></div>
   <p class="disc" style="font-size:11px;color:var(--dim);margin-top:12px">Fan project non ufficiale, senza legami con l’organizzazione del Marketers World.</p>`;
  $('#end').classList.remove('hide');
  $('#eAgain').onclick=()=>{$('#end').classList.add('hide');startGame();};
  $('#eBack').onclick=()=>{$('#end').classList.add('hide');G.done=false;};
}

/* ============================================================ ciclo */
function startGame(){newGame();mode='play';$('#title').classList.add('hide');$('#hud').classList.remove('hide');A.init();
  toast('Venerdì mattina a Rimini. Vai al gazebo accrediti e ritira il tuo badge!',4200);last=performance.now();}
let last=performance.now();
function update(dt){
  G.t+=dt;
  if(G.fade>0)G.fade=Math.max(0,G.fade-dt*4);
  if(G.watching){G.watching.t+=dt;if(G.watching.t>=G.watching.dur)finishWatch();return;}
  if(!DL&&$('#phone').classList.contains('hide')&&$('#end').classList.contains('hide')){
    // orologio: 1 secondo reale = 2 minuti di gioco
    G.min+=dt*2;
    if(G.min>=23*60+30){G.fade=1;if(G.day>=2){endGame();G.min=23*60+29;}else{G.day++;G.min=8*60+45;G.f=0;G.p.x=330;G.p.y=392;toast('Notte a Rimini: nuova giornata, '+DAYNAMES[G.day]+' ottobre.',3500);}}
    let dx=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0)+touch.x,dy=(keys.ArrowDown||keys.KeyS?1:0)-(keys.ArrowUp||keys.KeyW?1:0)+touch.y;
    const m=Math.hypot(dx,dy);const p=G.p;
    if(m>.15){dx/=Math.max(1,m);dy/=Math.max(1,m);const sp=(keys.ShiftLeft?85:62)*dt;moveBody(p,dx*sp,dy*sp,FL[G.f]);p.step+=dt*(keys.ShiftLeft?6:4.2);p.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?2:3):(dy<0?1:0);if(Math.floor(p.step*2)!==Math.floor((p.step-dt*4)*2))A.step();}else p.step=0;
  }
  updateNPC(dt);
  // fine giornata di sala: si possono scoprire i luoghi
  const cam=G.cam,vw=W/Z,vh=H/Z,p=G.p;
  cam.x=lerp(cam.x,p.x,Math.min(1,dt*6));cam.y=lerp(cam.y,p.y-10+(MOB?vh*.2:0),Math.min(1,dt*6));
}
function draw(){
  const L=FL[G.f],vw=W/Z,vh=H/Z,cam=G.cam;
  let cx=vw>=WW?WW/2:clamp(cam.x,vw/2,WW-vw/2),cy=vh>=WH?WH/2:clamp(cam.y,vh/2,WH-vh/2+(MOB?vh*.22:0));
  cx=Math.round(cx*Z)/Z;cy=Math.round(cy*Z)/Z;
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#0a0d18';ctx.fillRect(0,0,W,H);
  ctx.imageSmoothingEnabled=false;
  ctx.setTransform(DPR*Z,0,0,DPR*Z,Math.round((W/2-cx*Z)*DPR),Math.round((H/2-cy*Z)*DPR));
  ctx.drawImage(L.cv,0,0);
  // luci della tenda
  for(const d of L.dyn){if(d.k==='lights'){for(let i=0;i<d.w;i+=8){ctx.fillStyle=((Math.floor(G.t*3)+i/8)%3)===0?'#ffd24d':((Math.floor(G.t*3)+i/8)%3)===1?'#ff6a3d':'#4dd0ff';ctx.fillRect(d.x+i+2,d.y+1,2,2);}}}
  // varco
  if(G.f===0){ctx.fillStyle=G.flags.accred?'#4dff9a':'#ff4d5a';ctx.fillRect(300,368,3,6);ctx.fillRect(337,368,3,6);if(!G.flags.accred){ctx.fillStyle='rgba(255,77,90,.5)';ctx.fillRect(303,370,34,2);}}
  // entità ordinate per y
  const list=NPC.filter(n=>n.f===G.f).map(n=>({y:n.y,n}));list.push({y:G.p.y,me:true});list.sort((a,b)=>a.y-b.y);
  const near=nearest();
  for(const it of list){
    if(it.me)person(ctx,G.p.x,G.p.y,G.p.dir,G.p.step,NIKY);
    else{const n=it.n;person(ctx,n.x,n.y,n.dir,n.step,n.p);
      if(n.kind==='family'){const b=Math.sin(G.t*4+n.x)>0?0:1;ctx.fillStyle='#ffd24d';ctx.fillRect(Math.round(n.x)-1,Math.round(n.y)-31+b,3,3);}
      if(near&&near.npc===n){txt(ctx,n.name,Math.round(n.x),Math.round(n.y)-34,'#fff',5);}}
  }
  if(near){ctx.fillStyle='#ff6a3d';const bb=Math.round(Math.sin(G.t*6)*1.5);ctx.fillRect(Math.round(near.x)-1,Math.round(near.y)-40+bb-(near.npc?0:12),3,3);}
  // sera
  const hr=G.min/60;let ta=0;if(hr>=18)ta=clamp((hr-18)/3,0,1)*.45;
  if(ta>0&&G.f===0){ctx.fillStyle='rgba(12,20,70,'+ta.toFixed(3)+')';ctx.fillRect(0,0,WW,WH);}
  // UI
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(G.fade>0){ctx.fillStyle='rgba(5,6,13,'+G.fade+')';ctx.fillRect(0,0,W,H);}
  if(G.watching){const w=G.watching,k=w.t/w.dur;ctx.fillStyle='rgba(5,6,13,.78)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='700 '+Math.round(Math.min(W,600)/22)+'px "Space Grotesk",sans-serif';ctx.textAlign='center';ctx.fillText(w.where==='work'?'Workshop in corso…':'Speech in corso…',W/2,H/2-30);ctx.font='400 '+Math.round(Math.min(W,600)/32)+'px "Space Grotesk",sans-serif';ctx.fillStyle='#9fb0d8';ctx.fillText(w.e.e,W/2,H/2);ctx.fillStyle='rgba(255,255,255,.15)';ctx.fillRect(W/2-120,H/2+26,240,8);ctx.fillStyle='#ff6a3d';ctx.fillRect(W/2-120,H/2+26,240*k,8);}
}
function hud(){
  const hr=fmt(G.min);const dn=['VEN','SAB','DOM'][G.day];
  setT($('#ck'),'ck',dn+' '+hr);
  const nx=nextEvent(),p=progress();
  setT($('#ckS'),'cs',(nx?'Prossimo '+nx.t+': '+nx.e:'Giornata finita')+' · '+p.done+'/'+p.tot+' obiettivi');
  if(MOB){const hide=!!(DL||G.watching);$('#pad').style.display=hide?'none':'';$('#act').style.display=hide?'none':'';}
  const n=DL||G.watching?null:nearest();const pr=$('#prompt');
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
  if(G.watching||!$('#phone').classList.contains('hide'))return;
  const n=nearest();if(n){A.init();n.fn();}
}
addEventListener('keydown',e=>{
  if(mode!=='play'){return;}
  keys[e.code]=1;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if(e.code==='KeyE'||e.code==='Space'||e.code==='Enter'){if(DL&&e.code==='Enter')return;if(!e.repeat)act();}
  else if(/^Digit[1-4]$/.test(e.code)&&DL){const b=document.querySelectorAll('#dC button')[+e.code.slice(5)-1];if(b)b.click();}
  else if(e.code==='KeyP'){if($('#phone').classList.contains('hide'))openPhone();else closePhone();}
  else if(e.code==='KeyF')photo();
  else if(e.code==='Escape'){if(!$('#phone').classList.contains('hide'))closePhone();else if(DL)closeDlg();}
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
$('#act').addEventListener('pointerdown',e=>{e.preventDefault();act();});
$('#go').onclick=startGame;
$('#how').onclick=()=>toast('Obiettivi: app → accredito → workshop (ven) → speech (sab/dom) → contatti → stand → Offworld.',5000);

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
window.__rim={get G(){return G;},startGame,get FL(){return FL;},act,nearest,watch,talkTo,endGame,quests,progress,keys,get NPC(){return NPC;},PROGRAMMA};
