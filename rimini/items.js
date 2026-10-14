'use strict';
/* RIMINI 3 GIORNI · oggetti nascosti e indossabili (cappellino, spilla, sacca, stendardo): due al giorno circa, a caso dal seme;
   lo stendardo è sempre di domenica. Gli oggetti non trovati entro il giorno dopo vanno persi. */
const ITEMS={
 cap:{n:'Cappellino Marketers',desc:'Il logo sulla fronte: sei ufficialmente di casa.',slot:'head'},
 pin:{n:'Spilla Marketers',desc:'Piccola, nera, con la M: sul petto fa sempre la sua figura.',slot:'chest'},
 bag:{n:'Sacca con cordellini',desc:'La sacca dei marketer: al posto dello zaino, logo incluso.',slot:'back'},
 banner:{n:'Stendardo del Marketers World',desc:'Un vero stendardo: portalo al pigiama party e piantalo!',slot:'carry'}};
function itemDays(){
  if(!G.itemDays){const r=mulberry32(hashStr(G.seed+'|itemdays')),L=Object.keys(ITEMS).filter(i=>i!=='banner'),n=L.length;
    for(let i=L.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[L[i],L[j]]=[L[j],L[i]];}
    const c0=Math.ceil(n/3),c1=Math.ceil((n-c0)/2);
    G.itemDays={banner:2};L.forEach((id,i)=>{G.itemDays[id]=i<c0?0:i<c0+c1?1:2;});}
  return G.itemDays;
}
const itemsOfDay=d=>Object.keys(ITEMS).filter(id=>itemDays()[id]===d);
const itemFound=d=>itemsOfDay(d).filter(id=>G.items&&G.items[id]).length;
/* posizioni casuali (dal seme) in zone diverse del Palacongressi, mai al Marketers Village */
const EX_ZONES=[[420,640,520,705,0],[740,640,830,705,0],[430,200,860,236,0],[300,420,395,620,0],[160,640,390,700,0],[960,560,1180,820,0],[420,780,860,860,0],[420,560,830,680,1],[400,120,860,200,1],[330,300,470,720,0],[600,640,700,740,0],[880,470,950,530,0]];
const EX_ZN=['atrio sud-ovest, verso i varchi','atrio sud-est','atrio nord, tra gli stand','corridoio ovest','zona bistrot','all’esterno, lato Village','fuori dall’Ingresso A','primo piano, parte centrale','primo piano, lato nord','corridoio ovest, verso le Silent Stage','atrio, vicino alle scale mobili','atrio est'];
function itemPos(id){
  if(!G.itemPos){G.itemPos={};const used={};
    for(const i of Object.keys(ITEMS)){
      const d=itemDays()[i],r=mulberry32(hashStr(G.seed+'|item|'+i));let z,g=0,fx,fy,f,t=0;
      const bad=(f,x,y)=>f===1&&x>=k(462)&&x<=k(840)&&y>=k(122)&&y<=k(556);   /* il vuoto sulla Sala della Piazza non è raggiungibile */
      do{do{z=EX_ZONES[Math.floor(r()*EX_ZONES.length)];}while((used[d]||[]).includes(z)&&g++<40);
        const x=k(z[0])+r()*(k(z[2])-k(z[0])),y=k(z[1])+r()*(k(z[3])-k(z[1]));f=z[4];[fx,fy]=FL[f]?freeSpot(f,x,y):[x,y];}while(bad(f,fx,fy)&&t++<30);
      (used[d]=used[d]||[]).push(z);
      G.itemPos[i]={f,x:fx,y:fy,z:EX_ZONES.indexOf(z)};}}
  return G.itemPos[id];
}
const itemActive=id=>!(G.items&&G.items[id])&&!(G.lost&&G.lost[id])&&itemDays()[id]===G.day;
function itemSpots(f,I){
  for(const id in ITEMS){if(!itemActive(id))continue;const p=itemPos(id);if(p.f!==f)continue;I(p.x/K,p.y/K,18,'Raccogli: '+ITEMS[id].n,()=>pickItem(id));}
}
function pickItem(id){
  const it=ITEMS[id];G.items=G.items||{};G.items[id]=true;wearItem(id,true);G.flags.glasses=Object.keys(G.items).length;A.stamp();
  const d=itemDays()[id],n=itemFound(d);
  toast('Trovato: '+it.n+'! '+it.desc+(id==='banner'?'':' (lo indossi: cambia dal telefono, Home)'),4200);
  if(id==='banner'&&!G.flags.banner){setTimeout(()=>toast('Portalo al Village: alle 22:00, davanti al palco Offworld, scegli «Pianta lo stendardo» nel menu del pigiama party.',5200),1800);}
  if(n>=2)setTimeout(()=>toast('Trovati tutti e due gli oggetti nascosti di '+DAYNAMES[d].toLowerCase()+'! ✨',3200),900);
}
function wearItem(id,on){
  if(!G.wear){G.wear={};if(G.worn)G.wear[G.worn]=1;}
  if(on){for(const o in ITEMS)if(ITEMS[o].slot===ITEMS[id].slot)delete G.wear[o];G.wear[id]=1;}else delete G.wear[id];
}
function toggleWear(id){if(!G.items||!G.items[id])return;if(!G.wear){G.wear={};if(G.worn)G.wear[G.worn]=1;}wearItem(id,!G.wear[id]);}
function wornGear(){if(!G||!G.items)return '';if(!G.wear){G.wear={};if(G.worn)G.wear[G.worn]=1;}return Object.keys(ITEMS).filter(id=>G.items[id]&&G.wear[id]).join(',');}
/* a ogni cambio giorno: gli oggetti non trovati del giorno prima vanno persi; avvisi per i nuovi */
function itemsNewDay(prev){
  const out=[];
  if(!G.sandbox){G.lost=G.lost||{};const miss=itemsOfDay(prev).filter(id=>!(G.items&&G.items[id]));miss.forEach(id=>{G.lost[id]=true;});
    if(miss.length)out.push('Gli oggetti nascosti di '+DAYNAMES[prev].toLowerCase()+' che non hai trovato sono andati persi: '+miss.map(id=>ITEMS[id].n).join(', ')+'.');}
  if(G.day===1)out.push('Oggi ci sono altri due oggetti nascosti nel Palacongressi. Trovali entro stasera!');
  if(G.day===2)out.push('Oggi, oltre ad altri due oggetti nascosti, c’è lo STENDARDO del Marketers World da trovare. Portalo al Village e piantalo alla fine della serata, al pigiama party (dalle 22:00).');
  return out;
}
function itemQuests(){
  const F=G.flags,q=[];
  [0,1,2].forEach(d=>{
    const n=itemFound(d),lost=!!(G.lost&&itemsOfDay(d).some(id=>G.lost[id]));
    const tot=itemsOfDay(d).length;if(tot)q.push({t:'Trova gli oggetti nascosti di '+DAYNAMES[d].toLowerCase()+(tot>1?' ('+n+'/'+tot+')':''),s:n>=tot?'Trovati: '+itemsOfDay(d).map(id=>ITEMS[id].n).join(' e '):lost?'Persi: non li hai trovati entro il giorno dopo ('+n+'/'+tot+')':'Cerca nel Palacongressi ('+n+'/'+tot+')',ok:n>=tot});
  });
  q.push({t:'Pianta lo stendardo al pigiama party',s:F.banner?'Lo stendardo del Marketers World è al suo posto':'Domenica: trovalo e piantalo al Village dopo le 22:00',ok:!!F.banner});
  return q;
}
/* logo Marketers in pixel: quadrato nero, M bianca tagliata da una diagonale */
function logoPx(c,x,y,s){
  const M=['XX.....XX','XXX...XXX','XXXX.XXXX','XX.XXX.XX','XX..X..XX','XX.....XX','XX.....XX','XX.....XX'];
  c.fillStyle='#0b0b10';c.fillRect(x,y,11*s,10*s);c.fillStyle='#fff';
  M.forEach((r,j)=>{for(let i=0;i<9;i++)if(r[i]==='X')c.fillRect(x+(i+1)*s,y+(j+1)*s,s,s);});
  for(let i=0;i<9;i++){const j=Math.round(8.4-i*.95);
    if(s>=3){c.fillStyle='#0b0b10';c.fillRect(x+(i+1)*s,y+(j-1)*s,s,s);c.fillRect(x+(i+1)*s,y+(j+1)*s,s,s);}
    c.fillStyle='#fff';c.fillRect(x+(i+1)*s,y+j*s,s,s);}
}
function drawItemIcon(c,id,x,y){
  if(id==='cyclops'){c.fillStyle='#14141c';c.fillRect(x-7,y-4,14,6);c.fillStyle='#2a6fff';c.fillRect(x-6,y-3,12,3);c.fillStyle='#8fd4ff';c.fillRect(x-5,y-3,5,1);c.fillStyle='#14141c';c.fillRect(x+7,y-3,3,2);c.fillRect(x-10,y-3,3,2);}
  else if(id==='pixel'){c.fillStyle='#0b0b10';c.fillRect(x-8,y-4,7,5);c.fillRect(x+1,y-4,7,5);c.fillRect(x-1,y-4,2,2);c.fillStyle='#fff';c.fillRect(x-7,y-3,1,1);c.fillRect(x-6,y-2,1,1);c.fillRect(x-5,y-1,1,1);c.fillRect(x+2,y-3,1,1);c.fillRect(x+3,y-2,1,1);c.fillRect(x+4,y-1,1,1);}
  else if(id==='cap'){c.fillStyle='#0b0b10';c.fillRect(x-7,y-6,14,7);c.fillRect(x-10,y,11,2);c.fillStyle='#2a2a34';c.fillRect(x-7,y-6,14,1);c.fillStyle='#fff';c.fillRect(x-3,y-4,1,3);c.fillRect(x+1,y-4,1,3);c.fillRect(x-2,y-4,1,1);c.fillRect(x,y-4,1,1);c.fillRect(x-1,y-3,1,1);}
  else if(id==='pin'){c.fillStyle='#d8b04a';c.fillRect(x-6,y-6,12,12);c.fillStyle='#0b0b10';c.fillRect(x-5,y-5,10,10);logoPx(c,x-5,y-5,1);}
  else if(id==='bag'){c.fillStyle='#d8d8de';c.fillRect(x-4,y-10,1,5);c.fillRect(x+3,y-10,1,5);c.fillStyle='#0b0b10';c.fillRect(x-7,y-5,14,12);c.fillStyle='#2a2a34';c.fillRect(x-7,y-5,14,2);logoPx(c,x-5,y-3,1);c.fillStyle='#fff';c.fillRect(x-3,y+4,6,1);}
  else if(id==='banner'){c.fillStyle='#6a4a2a';c.fillRect(x-8,y-16,2,30);c.fillStyle='#d8b04a';c.fillRect(x-9,y-17,4,2);c.fillStyle='#0b0b10';c.fillRect(x-6,y-15,16,18);logoPx(c,x-3,y-12,1);c.fillStyle='#fff';c.fillRect(x-6,y-15,16,1);}
}
function drawItems(c){
  const pl=G.p;
  for(const id in ITEMS){if(!itemActive(id))continue;const p=itemPos(id);if(p.f!==G.f)continue;
    const near=Math.hypot(p.x-pl.x,p.y-pl.y),b=Math.round(Math.sin(G.t*3+p.x)*1.5),x=Math.round(p.x),y=Math.round(p.y)+b;
    if(near<k(190)){const pul=.5+.5*Math.sin(G.t*5);c.fillStyle='rgba(255,210,77,'+(.1+.16*pul)+')';c.beginPath();c.arc(x,y,16+pul*6,0,7);c.fill();
      if(!G.nearSeen)G.nearSeen={};if(!G.nearSeen[id]){G.nearSeen[id]=1;toast('✨ Senti che c’è qualcosa qui vicino…',2600);}}
    c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x-6,y+(id==='banner'?15:5),12,2);
    drawItemIcon(c,id,x,y);
    const s=Math.floor(G.t*4)%3;c.fillStyle='#ffd24d';c.fillRect(x-9+s*7,y-(id==='banner'?19:8)-(s%2),2,2);}
}
function drawGlasses(c,x,y,dir,bob,kind){
  if(dir===1)return;
  if(kind==='cyclops'){c.fillStyle='#14141c';c.fillRect(x-5,y-19-bob,10,3);c.fillStyle='#2a6fff';c.fillRect(x-4,y-18-bob,8,1);c.fillStyle='#8fd4ff';c.fillRect(x-4,y-18-bob,3,1);}
  else{c.fillStyle='#0b0b10';c.fillRect(x-5,y-19-bob,4,3);c.fillRect(x+1,y-19-bob,4,3);c.fillRect(x-1,y-19-bob,2,1);c.fillStyle='#fff';c.fillRect(x-4,y-19-bob,1,1);c.fillRect(x-3,y-18-bob,1,1);c.fillRect(x+2,y-19-bob,1,1);c.fillRect(x+3,y-18-bob,1,1);}
}
/* oggetti indossati dal personaggio (gear = id separati da virgola) */
function drawGear(c,x,y,dir,bob,gear){
  const g=(gear||'').split(',');
  if(g.includes('bag')){
    if(dir===1){c.fillStyle='#0b0b10';c.fillRect(x-5,y-13-bob,10,9);c.fillStyle='#fff';c.fillRect(x-1,y-11-bob,3,1);c.fillRect(x-2,y-10-bob,1,1);c.fillRect(x+2,y-10-bob,1,1);c.fillRect(x-4,y-13-bob,1,2);c.fillRect(x+3,y-13-bob,1,2);}
    else if(dir===0){c.fillStyle='#e8e8ee';c.fillRect(x-4,y-14-bob,1,7);c.fillRect(x+3,y-14-bob,1,7);c.fillStyle='#0b0b10';c.fillRect(x+5,y-10-bob,3,6);}
    else{const bx=dir===2?x+3:x-6;c.fillStyle='#0b0b10';c.fillRect(bx,y-12-bob,3,8);c.fillStyle='#e8e8ee';c.fillRect(dir===2?x+2:x-3,y-13-bob,1,4);}}
  if(g.includes('pin')&&dir!==1){c.fillStyle='#d8b04a';c.fillRect(x+2,y-13-bob,4,4);c.fillStyle='#0b0b10';c.fillRect(x+3,y-12-bob,2,2);c.fillStyle='#fff';c.fillRect(x+3,y-12-bob,1,1);c.fillRect(x+4,y-11-bob,1,1);}
  g.forEach(id=>{if(ITEMS[id]&&ITEMS[id].slot==='face')drawGlasses(c,x,y,dir,bob,id);});
  if(g.includes('cap')){
    c.fillStyle='#0b0b10';c.fillRect(x-5,y-25-bob,10,4);
    if(dir===0){c.fillRect(x-5,y-21-bob,10,1);c.fillRect(x-4,y-20-bob,8,1);c.fillStyle='#fff';c.fillRect(x-2,y-25-bob,1,3);c.fillRect(x+2,y-25-bob,1,3);c.fillRect(x-1,y-25-bob,1,1);c.fillRect(x+1,y-25-bob,1,1);c.fillRect(x,y-24-bob,1,1);}
    else if(dir===2)c.fillRect(x-8,y-22-bob,4,1);else if(dir===3)c.fillRect(x+4,y-22-bob,4,1);
    else{c.fillStyle='#2a2a34';c.fillRect(x-1,y-24-bob,2,2);}}
  if(g.includes('banner')){
    const left=dir===3,px=left?x-9:x+8,fx=left?px-9:px+1,w=Math.round(Math.sin(G.t*4)*1);
    c.fillStyle='#6a4a2a';c.fillRect(px,y-31-bob,1,26);c.fillStyle='#d8b04a';c.fillRect(px-1,y-32-bob,3,2);
    c.fillStyle='#0b0b10';c.fillRect(fx,y-30-bob,9,7+w);c.fillStyle='#fff';c.fillRect(fx+2,y-28-bob,1,3);c.fillRect(fx+6,y-28-bob,1,3);c.fillRect(fx+3,y-28-bob,1,1);c.fillRect(fx+5,y-28-bob,1,1);c.fillRect(fx+4,y-27-bob,1,1);}
}
function glassesRow(){
  const own=Object.keys(G.items||{}),wr=wornGear().split(',');
  const day=G.day,left=itemsOfDay(day).filter(id=>itemActive(id)).length;
  const hint=itemsOfDay(day).filter(id=>itemActive(id)).map(id=>'«'+EX_ZN[itemPos(id).z]+'»').join(' · ');
  const card=`<div class="sec">// OGGETTI NASCOSTI</div><div class="note" style="margin:0 0 8px">${left?`Oggi (${DAYNAMES[day]}) ne restano ${left} da trovare. Indizi: ${hint}.`:'Per oggi hai trovato tutto. 🎒'}</div>`;
  if(!own.length)return card;
  return card+`<div class="chips2">`+own.map(id=>`<button data-gw="${id}" class="${wr.includes(id)?'on':''}">${wr.includes(id)?'✓ ':''}${esc(ITEMS[id].n)}</button>`).join('')+'</div>';
}

