'use strict';
/* RIMINI 3 GIORNI · Offworld al Marketers Village: karaoke (gioco di ritmo con canzoni, pubblico, duetto, post e selfie)
   e pigiama party finale (pigiami, ballo, guerra di cuscini, foto di gruppo, brindisi, cerimonia dello stendardo).
   Le canzoni sono inventate per il gioco, con testi originali. */
const KS=[
 {id:'funnel',n:'Il funnel dei sogni',st:'Classico italiano',beat:.72,len:16,col:'#ffd24d',lyr:['Nel funnel dei sogni ti ho incontrato','tra una landing e un cuore innamorato','conversione, conversione, amore mio','clicca qui e resta con me, addio!']},
 {id:'click',n:'Click click baby',st:'Hit anni 2000',beat:.56,len:22,col:'#ff6ad5',lyr:['Click click baby, tu mi fai girare','il mio CTR non smette di salire','scrolla scrolla, non mi fermare','sei la mia campagna da condividere!']},
 {id:'algo',n:'Algoritmo infernale',st:'Metal',beat:.46,len:28,col:'#ff3d3d',lyr:['L’ALGORITMO CI DIVORA!','Reach a zero, urlo nella notte','ogni post è una battaglia','RESISTI, RESISTI, ENGAGEMENT!']},
 {id:'report',n:'Notte di reportistica',st:'Ballad lenta',beat:.9,len:12,col:'#4dd0ff',lyr:['Notte di reportistica, fogli di calcolo','una pivot soltanto per ritrovarti','nel silenzio dei numeri','resto ancora un po’ con te']}];

const offHost=(role)=>({name:'Host Offworld',role:role||'Offworld · Marketers Village',p:(NPC.find(n=>n.id==='dj')||{}).p||{shirt:'#161226',pants:'#232a44',skin:'#e8b98a',hair:'#c9a24a',badge:'#ff6a3d',cap:'#ff6a3d'}});
const sandboxEv=()=>G.sandbox?PROGRAMMA.find(x=>x.d===G.day&&x.room==='Village'):null;

/* ---------- ingresso: cosa succede all'Offworld ---------- */
function offworld(e){
  e=e||sandboxEv();
  if(!e){
    const nx=nextAt(['Village']);
    say(offHost(),{t:nx?'L’Offworld è il palco del Marketers Village: karaoke, musica e, l’ultima sera, il pigiama party. Prossimo appuntamento: «'+nx.title+'» alle '+nx.t+'.':'Per oggi la serata all’Offworld è finita. Ci vediamo al prossimo appuntamento!',c:[{t:'Ok',n:null}]});
    return;
  }
  if(/Pigiama/.test(e.title))pigiamaParty(e);else karaokeMenu(e);
}
function offworldTalk(){offworld(activeAt(['Village']));}

/* ---------- karaoke ---------- */
function duetPartners(){
  const out=[],seen=new Set();
  const cand=G.contacts.filter(c=>c.kind==='att'||c.kind==='friend'||c.kind==='fam');
  cand.slice(-3).forEach(c=>{if(seen.has(c.name))return;seen.add(c.name);out.push({id:'c'+hashStr(c.name),name:c.name,job:(c.role||'').split(' · ')[0]||'Partecipante',pal:c.p||facePal(c.name,c.gender||'m'),gender:c.gender||'m',contact:true});});
  const r=mulberry32(hashStr(G.seed+'|duet|'+G.day));
  const pool=G.people.slice().sort(()=>r()-.5);
  for(const pe of pool){if(out.length>=3)break;if(seen.has(pe.name))continue;seen.add(pe.name);out.push({id:pe.id,name:pe.name,job:pe.job,fam:pe.fam,city:pe.city,pal:pe.pal,gender:pe.gender,contact:false});}
  return out;
}
function karaokeMenu(e){
  const H=offHost('Karaoke · Offworld');
  const root=()=>({t:'Aperto a tutti i partecipanti del World. Il microfono è libero: cosa facciamo?',c:[
    {t:'🎤 Canto da solo',n:()=>songs(null)},
    {t:'👥 Duetto con qualcuno',n:()=>partners()},
    {t:'👏 Ascolto chi canta',n:()=>listen()},
    {t:'Esco',n:null}]});
  const songs=(pt)=>({t:'Scegli la canzone'+(pt?' del duetto con '+pt.name.split(' ')[0]:'')+'. Più è veloce, più è difficile.',c:[...KS.map(s=>({t:s.n+' · '+s.st,n:null,act:()=>startSong(s,pt,e)})),{t:'Indietro',n:()=>root()}]});
  const partners=()=>({t:'Con chi vuoi cantare?',c:[...duetPartners().map(p=>({t:p.name+' · '+p.job,n:()=>songs(p)})),{t:'Indietro',n:()=>root()}]});
  const LIST=['{n} ({j}) sale sul palco e attacca una ballata sul retargeting: il pubblico non si regge in piedi dal ridere.','{n} ({j}) canta con gli occhi chiusi, come se fosse da solo in doccia. Standing ovation.','{n} ({j}) prova un rap sul funnel di vendita. Qualcuno registra tutto, qualcuno piange.','{n} ({j}) stecca un acuto, se ne accorge, e lo ripete uguale. Il pubblico impazzisce.','{n} ({j}) canta «Il funnel dei sogni» e chiede a tutti di fare il coro.'];
  const listen=()=>{const r=mulberry32(hashStr(G.seed+'|ls|'+G.day+'|'+Math.floor(G.min/20))),pe=G.people[Math.floor(r()*G.people.length)];
    return{t:LIST[Math.floor(r()*LIST.length)].replace('{n}',pe.name).replace('{j}',pe.job),c:[
      {t:'👏 Applaudo',n:null,act:()=>{toast('Applausi! Il microfono passa al prossimo.',1800);A.stamp();}},
      {t:'🙌 Faccio il coro',n:null,act:()=>{toast('Tutti cantano insieme: che serata!',1800);A.stamp();}},
      {t:'Indietro',n:()=>root()}]};};
  say(H,root());
}
function startSong(s,pt,e){
  startRhythm({kind:'kar',seed:s.id+(pt?pt.id:''),n:s.len,beat:s.beat,fall:s.beat<.5?1.3:1.6,song:s,partner:pt,label:'A tempo',
    hint:'Tocca le corsie a tempo con la musica (A S D, oppure tocca lo schermo)',scene:karScene,onDone:R=>karDone(R,s,pt,e)});
}
function crowdMeter(R){const m=Math.max(0,Math.min(1,.45+(R.hits-R.miss*1.3)*.05));R.meter=R.meter==null?.45:R.meter+(m-R.meter)*.1;return R.meter;}
function drawCrowd(R,y,n,pj){
  const m=crowdMeter(R),t=G.t,cols=['#3a4a8a','#8a3a4a','#3a7a5a','#6a4a8a','#aa7a3a','#3a6a8a'],sk=['#e8b98a','#dfae80','#c98e62','#f0c8a0'],pjc=['#9fc4ff','#ffb0c8','#c8ffb0','#ffe08a'];
  const dx=W/n,sz=Math.max(7,Math.min(16,dx*.42));
  for(let i=0;i<n;i++){const x=dx*(i+.5),b=Math.sin(t*(3+m*3)+i*1.7)*(2+m*5),h=sz*1.6;
    ctx.fillStyle=pj?pjc[i%4]:cols[i%6];ctx.fillRect(x-sz*.6,y-h*.4+b,sz*1.2,h*.8);
    ctx.fillStyle=sk[(i*3)%4];ctx.fillRect(x-sz*.45,y-h*.95+b,sz*.9,sz*.9);
    if(m>.5&&i%2===0){ctx.fillStyle=sk[(i*3)%4];ctx.fillRect(x-sz*.9,y-h*1.3+b,sz*.28,sz*.9);ctx.fillRect(x+sz*.62,y-h*1.3+b,sz*.28,sz*.9);}
    if(m>.62&&i%3===0){ctx.fillStyle='#fff8a8';ctx.fillRect(x+sz*.55,y-h*1.45+b,sz*.35,sz*.5);}
  }
}
function karScene(R,hs){
  const s=R.cfg.song,t=R.t,prog=Math.max(0,Math.min(.999,(t-R.lead)/(R.cfg.n*R.beat))),pt=R.cfg.partner;
  // fasci di luce
  for(let i=0;i<5;i++){const x=W*(.1+.2*i)+Math.sin(t*1.3+i)*W*.06;ctx.fillStyle=(i%2?s.col:'#4dd0ff')+'26';ctx.beginPath();ctx.moveTo(W*(.1+.2*i),0);ctx.lineTo(x-W*.09,H*.36);ctx.lineTo(x+W*.09,H*.36);ctx.closePath();ctx.fill();}
  ctx.textAlign='center';
  ctx.font='600 '+Math.round(Math.min(W,520)/26)+'px "Space Grotesk",sans-serif';ctx.fillStyle='#bcd';ctx.fillText('🎤 '+s.n+' · '+s.st+(pt?' · duetto con '+pt.name.split(' ')[0]:''),W/2,H*.045);
  // testo
  const L=s.lyr,i=Math.floor(prog*L.length),fs=Math.round(Math.min(W,520)/17);
  if(t<R.lead-.3){ctx.fillStyle='#ffd24d';ctx.font='700 '+fs+'px "Space Grotesk",sans-serif';ctx.fillText('Pronti…',W/2,H*.1);}
  else{ctx.font='700 '+fs+'px "Space Grotesk",sans-serif';ctx.fillStyle='#fff';ctx.fillText(L[Math.min(i,L.length-1)],W/2,H*.1);ctx.font='600 '+Math.round(fs*.72)+'px "Space Grotesk",sans-serif';ctx.fillStyle='rgba(255,255,255,.4)';if(L[i+1])ctx.fillText(L[i+1],W/2,H*.1+fs*1.1);}
  // palco e cantante
  ctx.fillStyle='#241a38';ctx.fillRect(0,H*.265,W,H*.07);ctx.fillStyle='#ff6a3d';ctx.fillRect(0,H*.265,W,3);
  const bob=Math.sin(t*(Math.PI*2/R.beat))*2;
  ctx.save();ctx.translate(pt?W*.4:W/2,H*.265+bob);ctx.scale(hs,hs);ctx.imageSmoothingEnabled=false;person(ctx,0,0,0,0,playerLook());ctx.fillStyle='#bbb';ctx.fillRect(5,-14,1,6);ctx.fillStyle='#222';ctx.fillRect(4,-16,3,3);ctx.restore();
  if(pt){ctx.save();ctx.translate(W*.6,H*.265-bob);ctx.scale(hs,hs);ctx.imageSmoothingEnabled=false;person(ctx,0,0,0,0,Object.assign({badge:'#ff6a3d',phones:false},pt.pal));ctx.fillStyle='#bbb';ctx.fillRect(-6,-14,1,6);ctx.fillStyle='#222';ctx.fillRect(-7,-16,3,3);ctx.restore();}
  drawCrowd(R,H*.395,Math.max(9,Math.floor(W/40)));
  // misuratore pubblico
  const m=R.meter==null?.45:R.meter,bx=W-18,by=H*.05,bh=H*.22;ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(bx,by,8,bh);ctx.fillStyle=m>.66?'#7ad37a':m>.33?'#ffd24d':'#ff6a3d';ctx.fillRect(bx,by+bh*(1-m),8,bh*m);
  ctx.font='600 9px "Space Grotesk",sans-serif';ctx.fillStyle='#bcd';ctx.textAlign='right';ctx.fillText('PUBBLICO',W-8,by+bh+12);ctx.textAlign='center';
}
function karDone(R,s,pt,e){
  const acc=R.hits/R.notes.length,stars=acc>=.85?3:acc>=.55?2:1,star='⭐'.repeat(stars);
  if(e&&e.id!=null)G.seen.add(e.id);
  G.flags.kara=true;G.flags.off=(G.flags.off||0)+1;G.flags.kn=(G.flags.kn||0)+1;G.flags.ks=(G.flags.ks||0)+stars;G.min=Math.min(G.min+12,23*60+29);A.stamp();
  if(pt&&!pt.contact){addContact({id:pt.id,name:pt.name,role:pt.job+' · '+(pt.city||''),p:pt.pal,kind:'att',job:pt.job,fam:pt.fam,gender:pt.gender});}
  const react=stars===3?'Standing ovation! Il pubblico canta il ritornello con te e i telefoni sono tutti accesi.':stars===2?'Bella esibizione! Applausi e qualcuno chiede il bis.':'Qualche stonatura, ma il pubblico ti salva cantando il ritornello. Coraggio!';
  const duo=pt?' '+pt.name.split(' ')[0]+' ti dà il cinque: «Rifacciamolo!»'+(pt.contact?'':' Vi scambiate i contatti.'):'';
  const H=offHost('Karaoke · Offworld'),dj=NPC.find(n=>n.id==='dj');
  say(H,{t:'«'+s.n+'»: '+R.hits+'/'+R.notes.length+' a tempo ('+R.perfect+' perfetti) '+star+'\n'+react+duo,c:[
    {t:'📸 Selfie sul palco',n:null,act:()=>selfie({name:pt?pt.name.split(' ')[0]+' e il pubblico':'il pubblico dell’Offworld',x:G.p.x+16,y:G.p.y-4})},
    {t:'🌐 Pubblica su Marketers Pro',n:null,act:()=>{const C=cmEnsure();C.posts.push({id:'u'+(++C.pid),text:'Ho cantato «'+s.n+'» all’Offworld'+(pt?' in duetto con '+pt.name.split(' ')[0]:'')+': '+star+' #Offworld #MW26',at:cmT()});A.stamp();toast('Post pubblicato su Marketers Pro.',2000);}},
    {t:'🎤 Ancora!',n:()=>({t:'Il microfono è ancora tuo. Che facciamo?',c:[{t:'Torna al menu',n:null,act:()=>karaokeMenu(e)}]})},
    {t:'Basta così',n:null}]});
}

/* ---------- pigiama party finale (domenica sera) ---------- */
const PJ_COL=['#9fc4ff','#ffb0c8','#c8ffb0','#ffe08a','#d8b8ff'];
function partyScene(R,hs){
  const k2=R.cfg.kind,t=R.t,bob=Math.sin(t*(Math.PI*2/R.beat))*2;ctx.textAlign='center';
  for(let i=0;i<5;i++){const x=W*(.1+.2*i)+Math.sin(t*1.1+i)*W*.05;ctx.fillStyle=PJ_COL[i%5]+'26';ctx.beginPath();ctx.moveTo(W*(.1+.2*i),0);ctx.lineTo(x-W*.09,H*.36);ctx.lineTo(x+W*.09,H*.36);ctx.closePath();ctx.fill();}
  ctx.font='600 '+Math.round(Math.min(W,520)/26)+'px "Space Grotesk",sans-serif';ctx.fillStyle='#bcd';ctx.fillText(k2==='dance'?'💃 Pigiama party · balla a tempo con la Family':'🛏 Pigiama party · guerra di cuscini',W/2,H*.06);
  ctx.fillStyle='#241a38';ctx.fillRect(0,H*.265,W,H*.07);ctx.fillStyle='#b57bff';ctx.fillRect(0,H*.265,W,3);
  const pl=playerLook();
  if(k2==='dance'){
    for(let i=0;i<4;i++){const x=W*(.14+.24*i)+(i>1?W*.08:0),pal={shirt:PJ_COL[i],pants:PJ_COL[(i+2)%5],skin:['#e8b98a','#c98e62','#f0c8a0','#dfae80'][i],hair:['#2a1d14','#8a3a2a','#c9a24a','#1a1a20'][i],long:i%2===0,cap:PJ_COL[(i+1)%5],badge:'#ff6a3d'};
      ctx.save();ctx.translate(x,H*.265+(i%2?bob:-bob));ctx.scale(hs,hs);ctx.imageSmoothingEnabled=false;person(ctx,0,0,0,0,pal);ctx.restore();}
    ctx.save();ctx.translate(W/2,H*.265+bob);ctx.scale(hs,hs);ctx.imageSmoothingEnabled=false;person(ctx,0,0,0,0,pl);ctx.restore();
  }else{
    ctx.save();ctx.translate(W*.2,H*.265);ctx.scale(hs,hs);ctx.imageSmoothingEnabled=false;person(ctx,0,0,3,0,pl);ctx.restore();
    ctx.save();ctx.translate(W*.8,H*.265);ctx.scale(hs,hs);ctx.imageSmoothingEnabled=false;person(ctx,0,0,2,0,{shirt:'#ffb0c8',pants:'#ffb0c8',skin:'#e8b98a',hair:'#2a1d14',long:true,cap:'#9fc4ff',badge:'#ff6a3d'});ctx.restore();
    // cuscini in volo
    for(let i=0;i<5;i++){const ph=((t*1.3+i*.37)%1),x=W*(.25+ph*.5),y=H*.2-Math.sin(ph*Math.PI)*H*.06+i%2*8;ctx.save();ctx.translate(x,y);ctx.rotate(ph*6);ctx.fillStyle='#fff';ctx.fillRect(-9,-5,18,10);ctx.fillStyle='#d8e4ff';ctx.fillRect(-9,3,18,2);ctx.restore();}
  }
  drawCrowd(R,H*.395,Math.max(9,Math.floor(W/40)),true);
  // coriandoli
  for(let i=0;i<26;i++){const x=(i*97+t*20*(1+i%3))%W,y=(i*53+t*60)%(H*.4);ctx.fillStyle=PJ_COL[i%5];ctx.fillRect(x,y,3,3);}
}
function startParty(kind){
  const dance=kind==='dance';
  startRhythm({kind,seed:'pj',n:dance?20:24,beat:dance?.5:.4,fall:dance?1.5:1.3,label:dance?'Passi a tempo':'Cuscinate',hint:dance?'Balla a tempo: A S D, oppure tocca lo schermo':'Schiva e colpi a tempo: A S D, oppure tocca lo schermo',scene:partyScene,onDone:R=>partyDone(R,kind)});
}
function partyDone(R,kind){
  const acc=R.hits/R.notes.length,star=acc>=.85?'⭐⭐⭐':acc>=.55?'⭐⭐':'⭐';
  G.flags.pjp=true;G.min=Math.min(G.min+10,23*60+29);A.stamp();G.flags.pjg=(G.flags.pjg||0)+1;
  const msg=kind==='dance'?(acc>=.85?'La Family fa il trenino dietro di te!':acc>=.55?'Bel ballo! Qualcuno ti chiede la mossa.':'Hai ballato con il cuore: conta quello.'):(acc>=.85?'Piumino ovunque, hai vinto la guerra di cuscini!':acc>=.55?'Cuscinate a pareggio: tutti ridono.':'Hai preso più cuscini di quanti ne hai tirati… ma ti sei divertito.');
  pigiamaParty(null,kind==='dance'?'Ballo: '+R.hits+'/'+R.notes.length+' '+star+'. '+msg:'Cuscinate: '+R.hits+'/'+R.notes.length+' '+star+'. '+msg);
}
function pigiamaParty(e,prefix){
  const H=offHost('Pigiama party finale'),F=G.flags,first=!F.pjp&&!prefix;
  F.pjOn=true;
  if(e&&e.id!=null)G.seen.add(e.id);
  const hasB=!!(G.items&&G.items.banner&&!F.banner);
  const root=()=>({t:(prefix?prefix+'\n\n':'')+(first?'L’ultima notte al Marketers Village: tutti in pigiama con la Family! Aperto a tutti i partecipanti. Che si fa?':'La festa è in pieno corso. Cosa vuoi fare?'),c:[
    {t:'💃 Ballo con la Family',n:null,act:()=>startParty('dance')},
    {t:'🛏 Guerra di cuscini',n:null,act:()=>startParty('pillow')},
    {t:'📸 Foto di gruppo con la Family',n:null,act:()=>{F.pjp=true;selfie({name:'la Family',x:G.p.x+18,y:G.p.y-6});}},
    {t:'🥂 Brindisi di mezzanotte',n:null,act:()=>{F.pjp=true;G.min=Math.min(G.min+10,23*60+29);startPartyFx(9);toast('🥂 Cin cin! Buona notte, Marketers World!',3600);}},
    hasB?{t:'🚩 Pianta lo stendardo del Marketers World',n:()=>ceremony()}:{t:'🌙 Chiudo la serata e vado a dormire',n:()=>bye()},
    {t:'Resto ancora un po’',n:null}]});
  const ceremony=()=>({t:'Tutti si dispongono in cerchio intorno a te. Lo stendardo del Marketers World è alto e pesante: lo pianti in mezzo al prato.',c:[{t:'Tre…',n:{t:'Due…',c:[{t:'Uno…',n:{t:'🎆 Il vento lo apre e il logo si vede da lontano: tutti applaudono! È il finale giusto per questi tre giorni.',c:[{t:'Evviva!',n:null,act:plantBanner}]}}]}}]});
  const bye=()=>({t:'Dopo questo finisce il weekend e vedrai il riepilogo. Vuoi concludere la serata?',c:[{t:'Sì, concludo',n:null,act:()=>{F.pjOn=false;endGame();}},{t:'Resto ancora un po’',n:null}]});
  say(H,root());
}

/* ---------- il Village di sera: pubblico, pigiami, avvisi ---------- */
let _vcOn=false,_vcPj=false;
function villageCrowd(on,pj){
  const ids=NPC.filter(n=>n.kind==='att').slice(0,40);
  if(on){
    ids.forEach((n,i)=>{if(!n.home)n.home={f:n.f,wander:n.wander,x:n.x,y:n.y,p:n.p};
      n.f=2;const x0=k(990)-50,x1=k(990)+k(150)+130,y0=k(545)+k(150)+8,y1=k(790)-8;n.wander={x0,y0,x1,y1};
      n.x=x0+Math.random()*(x1-x0);n.y=y0+Math.random()*(y1-y0);n.vx=n.vy=0;
      n.p=pj?Object.assign({},n.home.p,{shirt:PJ_COL[i%5],pants:PJ_COL[(i+2)%5],cap:i%3===0?PJ_COL[(i+1)%5]:n.home.p.cap}):n.home.p;});
    _vcOn=true;_vcPj=!!pj;
  }else if(_vcOn||NPC.some(n=>n.home)){
    NPC.forEach(n=>{if(!n.home)return;n.f=n.home.f;n.wander=n.home.wander;n.x=n.home.x;n.y=n.home.y;n.p=n.home.p;delete n.home;});
    _vcOn=false;_vcPj=false;
  }
}
function villageTick(){
  if(!G||!G.flags||G.sandbox||G.done||mode!=='play')return;
  const ev=activeAt(['Village']),pj=!!ev&&/Pigiama/.test(ev.title),on=!!ev&&G.min>=22*60-5;
  if(on!==_vcOn||(on&&pj!==_vcPj))villageCrowd(on,pj);
  if(G.flags.pjOn!==pj)G.flags.pjOn=pj;
  /* alle 22 chi è ancora al Palacongressi viene portato al Village: in ritardo */
  if(G.min>=22*60&&G.eveDay!==G.day&&!G.watching&&!G.react&&!DL&&!uiOpen()){if(G.day===0){if(G.f===2||G.f===3)G.eveDay=G.day;else goSunflower(true);}else if(G.f===2)G.eveDay=G.day;else if(G.f===3)eveningAtVillage(false);else eveningAtVillage(true);}
  /* freccia per piantare lo stendardo: solo quando sei al Village, la domenica */
  {const has=G.day===2&&G.items&&G.items.banner&&!G.flags.banner;
   if(has&&G.f===2){if(!G.dest)G.dest={n:'Offworld (pianta lo stendardo)',f:2,x:k(1052),y:k(700),auto:1,ban:1};}
   else if(G.dest&&G.dest.ban)G.dest=null;}
  if(G.day===2&&G.items&&G.items.banner&&!G.flags.banner&&G.min>=23*60&&!G.warnB){G.warnB=true;toast('🚩 La serata sta per finire: pianta lo stendardo al pigiama party!',4200);}
}
