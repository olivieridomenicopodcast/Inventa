'use strict';
/* RIMINI 3 GIORNI · Marketers Village: dove inizia la giornata, con la navetta per il Palacongressi.
   Luogo inventato per il gioco (descrizione dell'utente: dove si ritrovano le persone che devono andare al World).
   Se non piace basta mettere VILLAGE_ON=false: la partita riparte dall'Ingresso A come prima. */
const VILLAGE_ON=true;
const VG={bus:{x:790,y:768},recep:{x:650,y:262},cafe:{x:232,y:590},board:{x:520,y:612},spawn:{x:650,y:650},shuttle:{x:372,y:842}};

function vBuilding(L,x,y,w,h,col,roof,label,doorX){
  const c=L.c,X=k(x),Y=k(y),W=k(w),H=k(h);
  c.fillStyle='rgba(0,0,0,.25)';c.fillRect(X+3,Y+H-2,W,6);
  c.fillStyle=col;c.fillRect(X,Y+14,W,H-14);
  c.fillStyle='rgba(255,255,255,.1)';c.fillRect(X,Y+14,W,2);
  c.fillStyle=roof;c.fillRect(X-4,Y,W+8,16);c.fillStyle='rgba(255,255,255,.2)';c.fillRect(X-4,Y,W+8,3);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(X-4,Y+13,W+8,3);
  for(let wx=X+14;wx<X+W-20;wx+=26)for(let wy=Y+30;wy<Y+H-34;wy+=32){c.fillStyle='#2a3a5a';c.fillRect(wx,wy,14,18);c.fillStyle='#8fc9ff';c.fillRect(wx+1,wy+1,12,8);c.fillStyle='rgba(255,255,255,.4)';c.fillRect(wx+1,wy+1,4,3);}
  const dx=doorX?k(doorX):X+Math.round(W/2);
  c.fillStyle='#3a2a20';c.fillRect(dx-10,Y+H-28,20,28);c.fillStyle='#e8d6a8';c.fillRect(dx-8,Y+H-26,16,10);c.fillStyle='#ffd24d';c.fillRect(dx+6,Y+H-13,2,2);
  txt(c,label,X+W/2,Y+8,'#fff',8);
  solid(L,X,Y+14,W,H-14-6);
}
/* Offworld: il palco del karaoke e del pigiama party, nel Marketers Village (est della piazza) */
function vOffworld(L){
  const c=L.c,tx=k(990),ty=k(545),tw=150,th=150;
  paintTile(c,tx-50,ty+th+6,tw+110,124,'#2c2150','#3a2a66');
  c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=2;c.strokeRect(tx-49,ty+th+7,tw+108,122);
  paintWood(c,tx,ty+24,tw,th-24,'#2a2038','#35294a');
  c.fillStyle='#ff6a3d';c.fillRect(tx,ty,tw,26);c.fillStyle='#fff';for(let i=0;i<15;i++)c.fillRect(tx+i*10,ty,5,26);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(tx,ty+22,tw,4);
  txt(c,'OFFWORLD',tx+tw/2,ty+38,'#ffd24d',16);c.fillStyle='#0e0b18';c.fillRect(tx+30,ty+52,90,34);c.fillStyle='#ff6a3d';c.fillRect(tx+30,ty+52,90,2);txt(c,'KARAOKE',tx+75,ty+70,'#fff',8);
  desk(L,tx+14,ty+108,40,12,'#161226','DJ');c.fillStyle='#0b0d18';c.fillRect(tx+4,ty+52,8,34);c.fillRect(tx+tw-12,ty+52,8,34);solid(L,tx+28,ty+50,94,38);
  table(L,tx+96,ty+118,8,'#cfc9ba');L.dyn.push({k:'lights',x:tx,y:ty+26,w:tw});
  for(let i=0;i<tw+110;i+=10){c.fillStyle=['#ffd24d','#ff6a3d','#4dd0ff','#b57bff'][(i/10)%4];c.fillRect(tx-50+i,ty+th+2,3,3);}
  L.tent={x:tx,y:ty};
}
function vBus(L,x,y){
  const c=L.c,X=k(x),Y=k(y),W=k(200),H=k(46);
  c.fillStyle='rgba(0,0,0,.28)';c.fillRect(X+2,Y+H-2,W,6);
  c.fillStyle='#ff6a3d';c.fillRect(X,Y,W,H-8);c.fillStyle='#fff';c.fillRect(X,Y+H-22,W,5);
  c.fillStyle='#d8e8ff';for(let i=X+10;i<X+W-40;i+=26){c.fillRect(i,Y+6,18,14);c.fillStyle='rgba(255,255,255,.6)';c.fillRect(i+1,Y+7,5,4);c.fillStyle='#d8e8ff';}
  c.fillStyle='#4a6a8a';c.fillRect(X+W-34,Y+6,28,16);c.fillStyle='#1a1a24';c.fillRect(X+W-4,Y+H-18,4,6);
  txt(c,'NAVETTA · MARKETERS WORLD',X+W/2-12,Y+H-16,'#1a0a04',6);
  c.fillStyle='#14141c';[X+22,X+W-46].forEach(wx=>{c.beginPath();c.arc(wx,Y+H-6,9,0,7);c.fill();c.fillStyle='#8a8f9a';c.beginPath();c.arc(wx,Y+H-6,4,0,7);c.fill();c.fillStyle='#14141c';});
  solid(L,X,Y+2,W,H-8);
}
function buildVillage(){
  const L=layer(WW,WH),c=L.c;
  paintGrass(c,0,0,WW,WH);
  // viali e piazza
  paintStone(c,k(560),k(90),k(180),k(700));paintStone(c,k(90),k(410),k(1130),k(120));paintStone(c,k(300),k(520),k(700),k(250));
  // fontana centrale con logo
  const fx=k(650),fy=k(470);c.fillStyle='#9a9484';c.beginPath();c.arc(fx,fy,k(40),0,7);c.fill();c.fillStyle='#4aa8d8';c.beginPath();c.arc(fx,fy,k(33),0,7);c.fill();c.fillStyle='#8fd4f5';c.beginPath();c.arc(fx-3,fy-3,k(22),0,7);c.fill();c.fillStyle='#ff6a3d';c.fillRect(fx-3,fy-12,6,24);c.fillRect(fx-12,fy-3,24,6);
  solid(L,fx-k(38),fy-k(30),k(76),k(60));
  // edifici
  vBuilding(L,540,80,240,175,'#1f2a50','#ff6a3d','MARKETERS VILLAGE',650);
  vBuilding(L,90,100,330,150,'#2f3a64','#2aa7d8','CASA A',255);
  vBuilding(L,880,100,330,150,'#2f3a64','#6a2a9a','CASA B',1045);
  // bar del village
  const bx=k(130),by=k(480);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(bx+3,by+k(80)-2,k(200),6);c.fillStyle='#f4f1ea';c.fillRect(bx,by,k(200),k(80));c.fillStyle='#ff6a3d';c.fillRect(bx,by,k(200),12);for(let i=0;i<k(200);i+=16)if((i/16)%2===0){c.fillStyle='#fff';c.fillRect(bx+i,by,8,12);}
  txt(c,'BAR DEL VILLAGE',bx+k(100),by+34,'#1a0a04',8);c.fillStyle='#3a2a20';c.fillRect(bx+k(80),by+44,k(40),k(40)-4);solid(L,bx,by+12,k(200),k(66));
  [[170,600],[260,610],[320,590]].forEach(([x,y])=>{table(L,k(x),k(y),9,'#e9e4d8');chair(c,k(x)-14,k(y)-3,'#ff6a3d');chair(c,k(x)+9,k(y)-3,'#2aa7d8');});
  // fermata della navetta e strada
  asphalt(c,0,k(790),WW,k(84));
  const sx=k(690),sy=k(715);c.fillStyle='rgba(0,0,0,.22)';c.fillRect(sx+2,sy+k(60)-2,k(150),5);c.fillStyle='#2a3566';c.fillRect(sx,sy,k(150),10);c.fillStyle='#ff6a3d';c.fillRect(sx,sy,k(150),3);c.fillStyle='#8fc9ff';c.fillRect(sx+4,sy+10,k(142),k(34));c.fillStyle='rgba(255,255,255,.18)';c.fillRect(sx+4,sy+10,k(142),4);
  c.fillStyle='#3a2a20';c.fillRect(sx+10,sy+k(46),k(130),7);txt(c,'FERMATA · NAVETTA',sx+k(75),sy+24,'#0a1a30',7);solid(L,sx,sy,k(150),10);solid(L,sx+10,sy+k(46),k(130),7);
  vBus(L,820,800);
  // bacheca
  const gx=k(500),gy=k(570);c.fillStyle='#3a2a20';c.fillRect(gx,gy,k(40),k(28));c.fillStyle='#e8dcb8';c.fillRect(gx+3,gy+3,k(40)-6,k(28)-6);c.fillStyle='#ff6a3d';c.fillRect(gx+7,gy+7,10,8);c.fillStyle='#2aa7d8';c.fillRect(gx+22,gy+9,10,8);c.fillStyle='#3a2a20';c.fillRect(gx+k(18),gy+k(28),4,10);solid(L,gx,gy,k(40),k(28));
  // alberi, aiuole, panchine, bandiere
  [[60,330],[60,560],[250,360],[430,340],[430,700],[880,340],[1050,340],[1250,330],[1250,560],[300,720],[60,760],[1200,760]].forEach(([x,y])=>tree(c,k(x),k(y),k(14)));
  [[250,300],[900,300],[420,470],[880,470]].forEach(([x,y])=>{c.fillStyle='#e86a8a';for(let i=0;i<5;i++)c.fillRect(k(x)+i*8,k(y)+((i*3)%5),5,5);c.fillStyle='#ffd24d';for(let i=0;i<5;i++)c.fillRect(k(x)+i*8+3,k(y)+8+((i*2)%4),4,4);});
  [[760,600],[420,630]].forEach(([x,y])=>{c.fillStyle='#6a4a2a';c.fillRect(k(x),k(y),k(36),5);c.fillRect(k(x)+2,k(y)+5,3,5);c.fillRect(k(x)+k(36)-5,k(y)+5,3,5);});
  [[100,420],[1180,420]].forEach(([x,y])=>{c.fillStyle='#b6ad9b';c.fillRect(k(x),k(y)-k(40),3,k(40));c.fillStyle='#ff6a3d';c.fillRect(k(x)+3,k(y)-k(40),k(14),k(9));c.fillStyle='#fff';c.fillRect(k(x)+3,k(y)-k(40)+k(9),k(14),3);});
  txt(c,'BENVENUTI AL MARKETERS VILLAGE',k(650),k(560),'#7a7566',8);
  vOffworld(L);
  solid(L,0,0,WW,4);solid(L,0,WH-4,WW,4);solid(L,0,0,4,WH);solid(L,WW-4,0,4,WH);
  return L;
}
/* fermata della navetta di ritorno, fuori dall'Ingresso A (piano terra) */
function drawShuttleStop(L){
  const c=L.c,x=k(VG.shuttle.x),y=k(VG.shuttle.y);
  c.fillStyle='rgba(0,0,0,.22)';c.fillRect(x-k(34),y+k(22),k(70),4);
  c.fillStyle='#b6ad9b';c.fillRect(x-2,y-k(22),4,k(44));
  c.fillStyle='#ff6a3d';c.fillRect(x-k(26),y-k(34),k(52),k(18));c.fillStyle='#fff';c.fillRect(x-k(26),y-k(34),k(52),3);
  txt(c,'NAVETTA',x,y-k(23),'#1a0a04',6);txt(c,'VILLAGE',x,y-k(13),'#1a0a04',6);
  c.fillStyle='#6a4a2a';c.fillRect(x-k(22),y+k(8),k(44),4);solid(L,x-k(22),y+k(6),k(44),7);
}
function villageSpots(I){
  I(VG.bus.x,VG.bus.y,46,'Sali sulla navetta per il Marketers World',()=>busStopTalk());
  I(VG.recep.x,VG.recep.y,40,'Reception del Marketers Village',()=>say(NPC.find(n=>n.id==='recep')||{name:'Reception',role:'Marketers Village',p:{shirt:'#1f2a50',pants:'#232a44',skin:'#e0b085',hair:'#2a1d14',badge:'#ffd24d'}},{t:chPick(Math.random,['Benvenuto al Marketers Village! La navetta per il Palacongressi parte dalla fermata qui davanti.','Buongiorno! Se cerchi la navetta, è alla fermata in basso: ogni quarto d’ora.','Ciao! Colazione al bar, poi navetta. Il World comincia presto.']),c:[{t:'Grazie!',n:null}]}));
  I(VG.cafe.x,VG.cafe.y,34,'Un caffè prima della navetta',coffee);
  {const ev=typeof activeAt==='function'?activeAt(['Village']):null;
   I(1052,725,70,ev?'Offworld · '+(/Pigiama/.test(ev.title)?'pigiama party':'karaoke'):'Offworld · palco',()=>{if(typeof offworld==='function')offworld(ev);},34);}
  I(255,268,36,G.day>=2?'Casa A: concludi il weekend':'Casa A: vai a dormire',()=>askNextDay());
  I(VG.board.x,VG.board.y,30,'Leggi la bacheca del Village',()=>info('Bacheca del Marketers Village','Il Marketers Village è il punto di ritrovo di chi sta per andare al Marketers World. Navetta per il Palacongressi ogni quarto d’ora, la mattina presto. Nelle pause si parla anche del Kalemana Festival e del Marketers Podcast. La sera, dopo l’Offworld, torna qui: puoi chiudere la giornata dalla fermata «Navetta» fuori dall’Ingresso A (dalle 17:00).'));
}
function busStopTalk(){
  const driver=NPC.find(n=>n.id==='driver')||{name:'Autista della navetta',role:'Navetta · Marketers World',p:{shirt:'#2a3566',pants:'#232a44',skin:'#dfae80',hair:'#1a1a20',badge:'#ff6a3d',cap:'#2a3566'}};
  say(driver,{t:chPick(Math.random,['Si parte per il Marketers World? Dieci minuti di viaggio e sei al Palacongressi.','Salta su! Prossima fermata: Palacongressi di Rimini.','Ecco la navetta! Cintura allacciata e telefono in tasca (l’app serve dopo).']),c:[
    {t:'Sì, andiamo!',n:null,act:()=>rideBus(false)},
    {t:'Un minuto: prima un caffè',n:null}]});
}
/* viaggio: andata (Village → Palacongressi) o ritorno (Palacongressi → Village, fine giornata) */
function rideBus(toVillage){
  G.fade=1;A.blip();
  setTimeout(()=>{
    if(toVillage){if(G.sandbox){nextDay();return;}eveningAtVillage();return;}
    G.f=0;G.p.x=k(632);G.p.y=k(885);G.p.dir=1;G.cam.x=G.p.x;G.cam.y=G.p.y;
    if(!G.sandbox)G.min=Math.max(G.min+15,8*60+30);
    if(!G.flags.bus){G.flags.bus=true;A.stamp();}
    toast('In navetta verso il Marketers World… eccoti all’Ingresso A.',3200);
  },250);
}
/* la sera si torna al Village con la navetta: il tempo continua, ci sono l'Offworld e poi si va a dormire */
function eveningAtVillage(late){
  G.f=2;G.p.x=k(1052);G.p.y=k(690);[G.p.x,G.p.y]=freeSpot(2,G.p.x,G.p.y);G.p.dir=0;G.cam.x=G.p.x;G.cam.y=G.p.y;
  G.eveDay=G.day;G.min=Math.max(G.min,22*60);G.fade=1;if(G.min>23*60+29)G.min=23*60+29;
  if(late){toast('⏰ Sono le 22:00: la navetta ti porta al Village… sei arrivato in ritardo!',4200);if(typeof cmLate==='function')cmLate(G.day);}
  else toast('Eccoti al Marketers Village: sono le 22:00 e la festa è cominciata!',3200);
}
function nextDay(){
  if(G.day>=2){endGame();return;}
  if(typeof villageCrowd==='function')villageCrowd(false);G.flags.pjOn=false;
  const prevDay=G.day;G.day++;G.min=8*60;G.f=VILLAGE_ON?2:0;
  if(VILLAGE_ON){G.p.x=k(VG.spawn.x);G.p.y=k(VG.spawn.y);}else{G.p.x=k(632);G.p.y=k(885);}
  G.p.dir=1;G.cam.x=G.p.x;G.cam.y=G.p.y;G.fade=1;
  toast('Notte al Marketers Village. Nuova giornata: '+DAYNAMES[G.day]+' ottobre, di nuovo in navetta.',3800);autoSave();
  {const m=typeof itemsNewDay==='function'?itemsNewDay(prevDay):[];if(m.length)setTimeout(()=>info('Nuova giornata · '+DAYNAMES[G.day],m.join('\n\n')),1200);}
}
function shuttleHome(){
  if(!G.sandbox&&G.min<17*60){info('Navetta per il Village','La navetta serale parte dalle 17:00. Fino ad allora il Marketers World è tutto tuo.');return;}
  const host={name:'Navetta serale',role:'Serata',p:{shirt:'#2a3566',pants:'#232a44',skin:'#dfae80',hair:'#1a1a20',badge:'#ff6a3d',cap:'#2a3566'}};
  if(G.day===0){
    say(host,{t:'Stasera, venerdì, la navetta serale porta al Marketers Meetup al Sunflower (dalle 20:00): bar, tavoli e tante persone con cui parlare. Vuoi andare subito o girare ancora al Palacongressi? Alle 22:00 la navetta ti porta lì in automatico; alle 23:30 si rientra al Village per dormire.',c:[
      {t:'Vado al Marketers Meetup al Sunflower',n:null,act:()=>goSunflower(false)},{t:'Giro ancora al Palacongressi',n:null}]});return;}
  say(host,{t:(G.day>=2?'È l’ultima sera: alle 22:00 all’Offworld, al Marketers Village, c’è il pigiama party finale. ':'Alle 22:00 all’Offworld, al Marketers Village, c’è la serata (karaoke). ')+'Vuoi passare direttamente alla festa o girare liberamente al Palacongressi e prendere la navetta entro le 22? Se fai tardi, alle 22 ti ritrovi al Village… e su Marketers Pro si parlerà del ritardatario!',c:[
    {t:'Passo direttamente alla festa',n:null,act:()=>rideBus(true)},{t:'Giro ancora al Palacongressi',n:null}]});
}
/* venerdì: alle 23:30 la navetta riporta tutti al Village, si va a dormire entro le 23:59 */
function fridayNight(){
  if(G.sandbox)return;
  if(G.min>=23*60+30&&G.f!==2&&G.nightDay!==G.day){G.nightDay=G.day;
    G.fade=1;G.f=2;G.p.x=k(255);G.p.y=k(310);[G.p.x,G.p.y]=freeSpot(2,G.p.x,G.p.y);G.p.dir=0;G.cam.x=G.p.x;G.cam.y=G.p.y;
    toast('Sono le 23:30: la navetta ti riporta al Marketers Village. Vai a dormire a Casa A entro le 23:59!',5200);}
  if(G.min>=23*60+59){toast('È quasi mezzanotte: si dorme.',1800);nextDay();}
}

/* tasto "passa al giorno dopo": chiude la giornata e riparte dal Village (domenica: conclude il weekend) */
function askNextDay(){
  const last=G.day>=2,host={name:last?'Fine del weekend':'Fine giornata',role:'Marketers World',p:{shirt:'#2a3566',pants:'#232a44',skin:'#dfae80',hair:'#1a1a20',badge:'#ff6a3d',cap:'#2a3566'}};
  say(host,{t:last?'Vuoi concludere il tuo Marketers World? Vedrai il riepilogo finale.':(G.f===2?'Vuoi andare a dormire e passare a '+DAYNAMES[G.day+1]+'? Domani si riparte con la navetta.':'Vuoi chiudere la giornata di '+DAYNAMES[G.day]+' e passare a '+DAYNAMES[G.day+1]+'? Salti la serata: tornerai al Marketers Village e domani si riparte con la navetta (per la serata prendi la navetta dalle 17:00).'),c:[
    {t:last?'Sì, concludi':'Sì, passa al giorno dopo',n:null,act:()=>{if(last)endGame();else nextDay();}},
    {t:'No, resto ancora un po’',n:null}]});
}

/* ============================================================ Sunflower: Marketers Meetup del venerdì sera ============================================================ */
const SUN_TABLES=[[300,330],[480,330],[660,330],[300,470],[480,470],[660,470],[300,610],[480,610],[660,610],[900,330],[1040,330],[900,470],[1040,470],[900,610],[1040,610]];
const SUN={door:{x:670,y:800},bar:{x:510,y:170}};
function sunflower(c,x,y,s){c.fillStyle='#2f7a3a';c.fillRect(x-1,y,2,s*1.6);c.fillStyle='#ffd24d';for(let i=0;i<8;i++){const a=i*Math.PI/4;c.fillRect(Math.round(x+Math.cos(a)*s*.9)-2,Math.round(y+Math.sin(a)*s*.9)-2,5,5);}c.fillStyle='#6a3a14';c.fillRect(x-3,y-3,7,7);}
function buildSunflower(){
  const L=layer(WW,WH),c=L.c;
  c.fillStyle='#1a1410';c.fillRect(0,0,WW,WH);
  paintWood(c,k(80),k(70),k(1146),k(760),'#c8955a','#b8854a');
  c.fillStyle='rgba(60,30,10,.55)';c.fillRect(k(80),k(70),k(1146),k(36));
  // luci a festone
  for(let i=0;i<k(1146);i+=14){c.fillStyle=['#ffd24d','#ff6a3d','#fff3b0'][(i/14)%3];c.fillRect(k(80)+i,k(76)+Math.round(Math.sin(i/40)*4)+4,4,4);}
  txt(c,'SUNFLOWER',k(660),k(90),'#ffd24d',14);txt(c,'MARKETERS MEETUP · VENERDÌ SERA',k(660),k(130),'#fff3b0',8);
  // bancone
  desk(L,k(260),k(150),k(520),k(34),'#5a3a1a','BAR');
  for(let i=0;i<9;i++){c.fillStyle='#8a2a2a';c.fillRect(k(290)+i*k(54),k(196),9,7);c.fillStyle='#e8e0c8';c.fillRect(k(290)+i*k(54)+1,k(193),7,3);}
  c.fillStyle='#e8c8a0';for(let i=0;i<7;i++)c.fillRect(k(300)+i*k(66),k(140),8,12);   // bottiglie dietro il bancone
  c.fillStyle='#ffd24d';for(let i=0;i<7;i++)c.fillRect(k(302)+i*k(66),k(143),4,4);
  // DJ
  desk(L,k(930),k(150),k(200),k(34),'#161226','DJ');c.fillStyle='#0b0d18';c.fillRect(k(910),k(140),12,k(50));c.fillRect(k(1150),k(140),12,k(50));solid(L,k(908),k(140),16,k(50));solid(L,k(1148),k(140),16,k(50));
  L.dyn.push({k:'lights',x:k(900),y:k(112),w:k(280)});
  // tavoli rotondi con girasoli
  SUN_TABLES.forEach(([x,y],i)=>{table(L,k(x),k(y),k(20),i%3===0?'#fff3b0':'#f4e6c8');sunflower(c,k(x),k(y)-8,5);});
  // divanetti e piante
  [[130,300],[130,500],[1170,300],[1170,500]].forEach(([x,y])=>{c.fillStyle='#8a3a2a';c.fillRect(k(x)-10,k(y),k(40),k(100));c.fillStyle='#a8503a';c.fillRect(k(x)-10,k(y),6,k(100));solid(L,k(x)-10,k(y),k(40),k(100));});
  [[120,120],[1190,120],[120,790],[1190,790],[200,420],[1100,420]].forEach(([x,y])=>{sunflower(c,k(x),k(y),10);solid(L,k(x)-6,k(y)+2,12,14);});
  // ingresso e navetta
  c.fillStyle='#3a2a20';c.fillRect(k(630),k(812),k(80),k(22));c.fillStyle='#e8d6a8';c.fillRect(k(640),k(814),k(60),k(14));txt(c,'USCITA · NAVETTA',k(670),k(790),'#fff3b0',8);
  // muri
  solid(L,0,0,WW,k(70));solid(L,0,k(834),k(628),WH-k(834));solid(L,k(712),k(834),WW-k(712),WH-k(834));solid(L,0,0,k(80),WH);solid(L,k(1226),0,WW-k(1226),WH);
  return L;
}
function sunNPC(add,pickFrom,mkAtt,idx){
  if(typeof ATT_FIRST==='undefined')return;
  add({id:'barman',kind:'staff',name:'Barman del Sunflower',role:'Bar',f:3,x:k(510),y:k(120),p:{shirt:'#ffd24d',pants:'#232a44',skin:'#dfae80',hair:'#2a1d14',badge:'#ff6a3d'},dir:0});
  const r=mulberry32(hashStr(G.seed+'|sun'));let n=idx;
  // seduti ai tavoli
  SUN_TABLES.forEach(([x,y])=>{const seats=[[x-30,y,3],[x+30,y,2],[x,y-30,0],[x,y+32,1]].sort(()=>r()-.5).slice(0,2+Math.floor(r()*2));
    seats.forEach(s=>{mkAtt(n++,[[s[0],s[1],s[0]+1,s[1]+1,3]]);const q=NPC[NPC.length-1];q.wander=null;q.seated=true;q.x=k(s[0]);q.y=k(s[1]);q.dir=s[2];});});
  // in piedi (bar, centro, pista)
  const ST=[[250,215,790,290,3],[880,230,1190,640,3],[100,260,220,720,3],[240,720,620,800,3],[740,700,1180,790,3]];
  for(let i=0;i<30;i++)mkAtt(n++,ST);
}
function sunSpots(I){
  const open=!!(typeof activeAt==='function'&&activeAt(['Sunflower']))||G.sandbox;
  I(SUN.bar.x,SUN.bar.y+14,40,'Ordina al bar del Sunflower',()=>{const nb=NPC.find(x=>x.id==='barman');if(typeof sunBar==='function')sunBar(nb);});
  I(SUN.door.x,SUN.door.y-10,50,'Esci: navetta del Sunflower',()=>sunExit());
}
function sunBar(n){
  const drinks=[['Uno spritz analcolico','Arancione e frizzante: ora sei ufficialmente al networking.'],['Un caffè lungo','Anche di sera il marketer non dorme: sei di nuovo carico.'],['Una birra artigianale','Fresca e senza fretta: la serata è ancora lunga.'],['Un’acqua tonica con limone','Semplice e sempre giusta.']];
  say(n,{t:'Benvenuto al Sunflower! Cosa ti preparo?',c:[...drinks.map(d=>({t:d[0],n:null,act:()=>{G.flags.coffee++;A.blip();toast(d[1],2600);}})),{t:'Per ora niente, grazie',n:null}]});
}
function sunExit(){
  const host={name:'Navetta del Sunflower',role:'Ritorno',p:{shirt:'#2a3566',pants:'#232a44',skin:'#dfae80',hair:'#1a1a20',badge:'#ff6a3d',cap:'#2a3566'}};
  say(host,{t:'La navetta riparte dal Sunflower. Alle 22:00 al Marketers Village c’è il karaoke. Dove vuoi andare?',c:[
    {t:'Al Marketers Village (karaoke alle 22)',n:null,act:()=>{if(G.min<22*60)G.min=22*60;eveningAtVillage(false);}},
    {t:'Torno al Palacongressi',n:null,act:()=>sunToPalace()},
    {t:'Resto ancora un po’',n:null}]});
}
function sunToPalace(){
  G.fade=1;A.blip();setTimeout(()=>{G.f=0;G.p.x=k(632);G.p.y=k(885);G.p.dir=1;G.cam.x=G.p.x;G.cam.y=G.p.y;G.min+=12;toast('Eccoti di nuovo all’Ingresso A del Palacongressi.',2800);},250);
}
function goSunflower(late){
  G.fade=1;A.blip();setTimeout(()=>{G.f=3;G.p.x=k(SUN.door.x);G.p.y=k(SUN.door.y-60);[G.p.x,G.p.y]=freeSpot(3,G.p.x,G.p.y);G.p.dir=1;G.cam.x=G.p.x;G.cam.y=G.p.y;G.eveDay=G.day;G.min=late?G.min:Math.max(G.min+10,20*60);G.flags.sun=true;A.stamp();
    if(late){toast('Sono le 22:00: la navetta ti porta al Sunflower… sei arrivato in ritardo!',4200);if(typeof cmLate==='function')cmLate(G.day);}else toast('Benvenuto al Marketers Meetup al Sunflower! Bar, tavoli e tante persone con cui parlare.',3800);},250);
}
function sunQuest(){return[{t:'Marketers Meetup al Sunflower',s:'Venerdì sera, 20:00-23:30: navetta dal Palacongressi',ok:!!(G.flags&&G.flags.sun)}];}
