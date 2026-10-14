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
  [[60,330],[60,560],[250,360],[430,340],[430,700],[880,340],[1050,340],[1250,330],[1250,560],[300,720],[1000,700],[1180,700],[60,760],[1200,760]].forEach(([x,y])=>tree(c,k(x),k(y),k(14)));
  [[250,300],[900,300],[420,470],[880,470]].forEach(([x,y])=>{c.fillStyle='#e86a8a';for(let i=0;i<5;i++)c.fillRect(k(x)+i*8,k(y)+((i*3)%5),5,5);c.fillStyle='#ffd24d';for(let i=0;i<5;i++)c.fillRect(k(x)+i*8+3,k(y)+8+((i*2)%4),4,4);});
  [[760,600],[1000,600],[420,630]].forEach(([x,y])=>{c.fillStyle='#6a4a2a';c.fillRect(k(x),k(y),k(36),5);c.fillRect(k(x)+2,k(y)+5,3,5);c.fillRect(k(x)+k(36)-5,k(y)+5,3,5);});
  [[100,420],[1180,420]].forEach(([x,y])=>{c.fillStyle='#b6ad9b';c.fillRect(k(x),k(y)-k(40),3,k(40));c.fillStyle='#ff6a3d';c.fillRect(k(x)+3,k(y)-k(40),k(14),k(9));c.fillStyle='#fff';c.fillRect(k(x)+3,k(y)-k(40)+k(9),k(14),3);});
  txt(c,'BENVENUTI AL MARKETERS VILLAGE',k(650),k(560),'#7a7566',8);
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
    if(toVillage){nextDay();return;}
    G.f=0;G.p.x=k(632);G.p.y=k(885);G.p.dir=1;G.cam.x=G.p.x;G.cam.y=G.p.y;
    if(!G.sandbox)G.min=Math.max(G.min+15,8*60+30);
    if(!G.flags.bus){G.flags.bus=true;A.stamp();}
    toast('In navetta verso il Marketers World… eccoti all’Ingresso A.',3200);
  },250);
}
function nextDay(){
  if(G.day>=2){endGame();return;}
  G.day++;G.min=8*60;G.f=VILLAGE_ON?2:0;
  if(VILLAGE_ON){G.p.x=k(VG.spawn.x);G.p.y=k(VG.spawn.y);}else{G.p.x=k(632);G.p.y=k(885);}
  G.p.dir=1;G.cam.x=G.p.x;G.cam.y=G.p.y;G.fade=1;
  toast('Notte al Marketers Village. Nuova giornata: '+DAYNAMES[G.day]+' ottobre, di nuovo in navetta.',3800);autoSave();
}
function shuttleHome(){
  if(!G.sandbox&&G.min<17*60){info('Navetta per il Village','La navetta serale parte dalle 17:00. Fino ad allora il Marketers World è tutto tuo.');return;}
  const host={name:'Navetta serale',role:'Rientro al Marketers Village',p:{shirt:'#2a3566',pants:'#232a44',skin:'#dfae80',hair:'#1a1a20',badge:'#ff6a3d',cap:'#2a3566'}};
  say(host,{t:G.day>=2?'È l’ultima sera: tornando al Village finisce il tuo Marketers World. Sicuro?':'Vuoi chiudere la giornata e tornare al Marketers Village? Domani si ricomincia con la navetta.',c:[
    {t:G.day>=2?'Sì, concludo il weekend':'Sì, torno al Village',n:null,act:()=>rideBus(true)},{t:'Resto ancora un po’',n:null}]});
}
