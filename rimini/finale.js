'use strict';
/* RIMINI 3 GIORNI · festa finale di domenica nella Sala della Piazza: palloncini, coriandoli e fuochi pirotecnici da interno
   (fontane di scintille ai lati del palco e piccoli scoppi colorati). Parte alla fine dell'ultimo speech del Main Stage di domenica. */
const FIN_DUR=48;                                   // secondi reali di festa
const FIN_HALL0=[440,380,830,650],FIN_JETS0=[[462,430],[838,430],[585,410],[717,410]];   // sala della Piazza (coordinate pianta)
let FIN_HALL=FIN_HALL0,FIN_JETS=FIN_JETS0;
const FIN_COL=['#ff6a3d','#ffd24d','#4dd0ff','#b57bff','#6bc46d','#e86a8a','#ffffff'];
function finaleTime(){const l=PROGRAMMA.filter(e=>e.d===2&&e.kind==='talk'&&/Main Stage/.test(e.room));return Math.max(...l.map(e=>e.e));}
function finaleCheck(e){if(!G||G.flags.fin||G.fin)return;if(e&&e.d===2&&e.kind==='talk'&&/Main Stage/.test(e.room)&&e.e>=finaleTime())startFinale(false);}
function finaleTick(){if(!G||G.flags.fin||G.fin||G.day!==2||G.sandbox)return;if(G.f===2){if(G.min>=finaleTime())G.flags.fin=true;return;}if(G.min>=finaleTime()&&!G.watching&&!G.react&&!DL&&!uiOpen())startFinale(true);}
function startFinale(tele){
  FIN_HALL=FIN_HALL0;FIN_JETS=FIN_JETS0;
  G.flags.fin=true;G.fin={t:0,f:0,dur:FIN_DUR,sp:[],ba:[],co:[],nb:.5,nc:0};
  if(tele||G.f!==0){G.fade=1;G.f=0;[G.p.x,G.p.y]=freeSpot(0,k(651),k(540));G.cam.x=G.p.x;G.cam.y=G.p.y;}
  /* la sala si riempie: i partecipanti corrono alla festa */
  let i=0;for(const n of NPC){if(n.kind!=='att'||i>=46)continue;i++;n.f=0;const r=[FIN_HALL[0]+10,FIN_HALL[1]+80,FIN_HALL[2]-10,FIN_HALL[3]];n.wander={x0:k(r[0]),y0:k(r[1]),x1:k(r[2]),y1:k(r[3])};n.x=n.wander.x0+Math.random()*(n.wander.x1-n.wander.x0);n.y=n.wander.y0+Math.random()*(n.wander.y1-n.wander.y0);[n.x,n.y]=freeSpot(0,n.x,n.y);}
  for(let j=0;j<34;j++)G.fin.ba.push(newBalloon(true));
  const b=document.createElement('div');b.id='finB';b.innerHTML='<b>GRAZIE, MARKETERS WORLD!</b><span>🎉 festa finale 🎉</span>';document.body.appendChild(b);
  A.stamp();setTimeout(()=>A.stamp(),300);toast('Ultimo speech finito: festa finale nella Sala della Piazza! 🎉',4200);
}
function newBalloon(init){const x0=k(FIN_HALL[0]),x1=k(FIN_HALL[2]),y0=k(FIN_HALL[1]),y1=k(FIN_HALL[3]);return{x:x0+Math.random()*(x1-x0),y:init?y0+Math.random()*(y1-y0):y1+10,vy:-(10+Math.random()*16),ph:Math.random()*6.28,c:FIN_COL[Math.floor(Math.random()*FIN_COL.length)]};}
function finaleStep(dt){
  const F=G.fin;if(!F)return;F.t+=dt;
  const x0=k(FIN_HALL[0]),x1=k(FIN_HALL[2]),y0=k(FIN_HALL[1]),y1=k(FIN_HALL[3]),end=F.t>F.dur-4;
  for(const b of F.ba){b.y+=b.vy*dt;b.x+=Math.sin(G.t*1.4+b.ph)*6*dt;if(b.y<y0-30){if(end)b.dead=true;else Object.assign(b,newBalloon(false));}}
  F.ba=F.ba.filter(b=>!b.dead);
  if(!end){F.nc+=dt*70;while(F.nc>=1){F.nc--;F.co.push({x:x0+Math.random()*(x1-x0),y:y0-10,vx:(Math.random()-.5)*14,vy:26+Math.random()*34,c:FIN_COL[Math.floor(Math.random()*FIN_COL.length)],l:5+Math.random()*3});}}
  for(const c of F.co){c.x+=c.vx*dt+Math.sin(G.t*3+c.y)*8*dt;c.y+=c.vy*dt;c.l-=dt;}F.co=F.co.filter(c=>c.l>0&&c.y<y1+20);
  if(!end&&F.t>1.2){for(const j of FIN_JETS)for(let i=0;i<3;i++)F.sp.push({x:k(j[0])+(Math.random()-.5)*4,y:k(j[1]),vx:(Math.random()-.5)*34,vy:-(90+Math.random()*80),l:.7+Math.random()*.7,c:Math.random()<.6?'#ffe9a8':'#ffd24d',g:150});}
  F.nb-=dt;
  if(!end&&F.nb<=0){F.nb=1.6+Math.random()*1.4;const cx=x0+Math.random()*(x1-x0),cy=y0+Math.random()*(y1-y0)*.35+k(20),col=FIN_COL[Math.floor(Math.random()*FIN_COL.length)];
    for(let i=0;i<46;i++){const a=Math.random()*6.28,s=30+Math.random()*70;F.sp.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.9+Math.random()*.8,c:Math.random()<.7?col:'#ffffff',g:70});}
    A.tone(180+Math.random()*120,.18,'sawtooth',.05,60);for(let i=0;i<5;i++)setTimeout(()=>A.tone(1200+Math.random()*1800,.03,'square',.02),60+i*40);}
  for(const s of F.sp){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=s.g*dt;s.l-=dt;}F.sp=F.sp.filter(s=>s.l>0);
  if(F.t>F.dur){const e=document.getElementById('finB');if(e)e.remove();G.fin=null;if(F.endMsg!==null)toast(F.endMsg||'Che festa! La serata continua: ci vediamo al Village.',3600);}
}
function drawFinale(c){
  const F=G.fin;if(!F)return;
  for(const co of F.co){c.fillStyle=co.c;c.fillRect(Math.round(co.x),Math.round(co.y),2,2);}
  for(const b of F.ba){const x=Math.round(b.x),y=Math.round(b.y);c.fillStyle='rgba(255,255,255,.5)';c.fillRect(x,y+9,1,12+Math.round(Math.sin(G.t*2+b.ph)*2));c.fillStyle=b.c;c.fillRect(x-4,y-4,9,10);c.fillRect(x-3,y-6,7,2);c.fillRect(x-2,y+6,5,1);c.fillStyle='rgba(255,255,255,.55)';c.fillRect(x-3,y-3,2,3);}
  for(const j of FIN_JETS){if(F.t>1.2&&F.t<F.dur-4){c.fillStyle='rgba(255,220,140,.35)';c.fillRect(k(j[0])-4,k(j[1])-6,8,6);c.fillStyle='#fff';c.fillRect(k(j[0])-1,k(j[1])-3,3,3);}}
  for(const s of F.sp){c.globalAlpha=Math.max(0,Math.min(1,s.l*1.4));c.fillStyle=s.c;c.fillRect(Math.round(s.x),Math.round(s.y),2,2);}c.globalAlpha=1;
}

/* fuochi e palloncini nella piazza del Marketers Village (brindisi e cerimonia dello stendardo) */
function startPartyFx(dur,endMsg){
  if(G.fin)return;
  FIN_HALL=[330,470,1090,790];FIN_JETS=[[1010,640],[1120,640],[760,610],[900,610]];
  G.fin={t:0,f:2,dur:dur,endMsg:endMsg===undefined?null:endMsg,sp:[],ba:[],co:[],nb:.5,nc:0};
  for(let j=0;j<26;j++)G.fin.ba.push(newBalloon(true));
  A.stamp();setTimeout(()=>A.stamp(),300);
}
/* ---------- stendardo piantato al pigiama party: fuochi, titoli di coda e fine della partita ---------- */
function plantBanner(){
  const bp={x:k(1052),y:k(690)};G.bannerPos=bp;G.dest=null;G.flags.banner=true;wearItem('banner',false);
  G.f=2;G.p.x=bp.x+30;G.p.y=bp.y+40;[G.p.x,G.p.y]=freeSpot(2,G.p.x,G.p.y);G.p.dir=0;G.cam.x=bp.x;G.cam.y=bp.y+40;
  A.stamp();setTimeout(()=>A.stamp(),350);setTimeout(()=>A.stamp(),700);
  toast('Stendardo piantato!',2600);startPartyFx(8);
  setTimeout(()=>{const host=(typeof offHost==='function')?offHost('Pigiama party finale'):{name:'Host Offworld',role:'Pigiama party',p:NPC.find(n=>n.id==='dj').p};
    say(host,{t:'Lo stendardo sventola e tutti sono qui davanti a te. Foto di gruppo con lo stendardo prima dei titoli di coda?',c:[
      {t:'Scatta il selfie (si salva sul dispositivo)',n:null,act:()=>bannerSelfie(startCredits)},
      {t:'No, vado ai titoli di coda',n:null,act:()=>setTimeout(startCredits,300)}]});},5200);
}
/* lo stendardo piantato resta bene in vista davanti al palco Offworld */
function drawPlantedBanner(c){
  if(!G||!G.flags||!G.flags.banner||G.f!==2)return;const bp=G.bannerPos||{x:k(1052),y:k(690)},x=Math.round(bp.x),y=Math.round(bp.y);
  const w=Math.round(Math.sin(G.t*3)*2);
  c.fillStyle='rgba(255,210,77,.12)';c.beginPath();c.arc(x,y-30,46,0,7);c.fill();
  c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(x,y+3,14,5,0,0,7);c.fill();c.fillStyle='#8a6a3a';c.beginPath();c.ellipse(x,y+1,11,4,0,0,7);c.fill();
  c.fillStyle='#6a4a2a';c.fillRect(x-2,y-76,4,78);c.fillStyle='#d8b04a';c.fillRect(x-4,y-80,8,5);c.fillRect(x-1,y-84,2,5);
  const fx=x+2,fy=y-74;c.fillStyle='#0b0b10';c.fillRect(fx,fy,44,36+w);c.fillStyle='#d8b04a';c.fillRect(fx,fy,44,2);c.fillRect(fx,fy+34+w,44,2);
  if(typeof logoPx==='function')logoPx(c,fx+11,fy+7,2);
}
function startCredits(){
  let el=document.getElementById('cred');if(el)el.remove();
  el=document.createElement('div');el.id='cred';
  const job=(typeof ME==='function'&&ME().job)||'marketer';
  el.innerHTML='<div class="crin" id="credIn"><canvas id="credLogo" width="110" height="100"></canvas><h1>RIMINI 3 GIORNI</h1><p class="cs">Il tuo Marketers World</p>'+
   '<p><b>'+esc(pname())+'</b><br>'+esc(job)+'</p><p class="cs">Uno stendardo piantato<br>al pigiama party del Village</p>'+
   '<p class="cs">Il tuo weekend</p><p>'+recapText()+'</p><p class="cs">Un gioco di</p><p><b>Olivieri Domenico</b></p><p class="cs">Realizzato con</p><p><b>Claude Code</b></p>'+
   '<p class="cs">Programma</p><p>titoli, speaker, sale e orari<br>dal programma dell’app</p>'+
   '<p class="cs">Inventati per il gioco</p><p>slide, partecipanti,<br>dialoghi e community</p>'+
   '<p class="cs">Grazie a</p><p>tutti i marketer,<br>veri e immaginari</p>'+
   '<p class="cs">Fan project non ufficiale<br>just for fun, privato</p><h1 style="margin-top:80px">FINE</h1></div><button id="credSkip">Salta ›</button>';
  document.body.appendChild(el);
  const lc=document.getElementById('credLogo').getContext('2d');lc.imageSmoothingEnabled=false;logoPx(lc,0,0,10);
  const done=()=>{if(!document.getElementById('cred'))return;el.remove();endGame();};
  document.getElementById('credIn').addEventListener('animationend',done);
  document.getElementById('credSkip').onclick=done;
}

function recapText(){
  try{const p=progress(),lv=cmLevelInfo(cmMyPts(cmT())),n=Object.keys(G.items||{}).filter(i=>i!=='banner').length;
    return p.done+' obiettivi su '+p.tot+'<br>'+G.contacts.length+' contatti · '+n+' oggetti nascosti<br>Livello '+lv.l+' su Marketers Pro: '+lv.name;}catch(e){return '';}
}
