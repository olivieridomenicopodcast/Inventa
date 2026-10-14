'use strict';
/* RIMINI 3 GIORNI · eventi e sistemi extra: domande dal pubblico negli speech, sale piene e code per i workshop esauriti,
   favori dei partecipanti (con punto esclamativo e freccia), epilogo personalizzato, esporta/importa salvataggi. */

/* ---------- domande dal pubblico (ultima slide di speech e workshop) ---------- */
const QA_GEN=[
 ['Qual è l’errore più comune che vedi fare?','Voler fare tutto subito. Meglio un passo piccolo, misurato e ripetuto, che dieci passi grandi e confusi.'],
 ['Da dove parto se ho poco tempo?','Da una sola azione che puoi fare entro domani. Il resto, spesso, si chiarisce mentre la fai.'],
 ['Come si resta costanti quando i risultati tardano?','Fissa data e ora, riduci l’obiettivo alla dimensione di una settimana e festeggia le piccole cose. La costanza è un’abitudine, non una dote.']];
const QA={
 'AI':[['Come uso l’AI senza perdere il mio stile?','Scrivi tu il primo e l’ultimo passaggio e usa l’AI nel mezzo: così lo stile resta tuo e il tempo lo guadagni.'],['Quale compito delego per primo all’AI?','Quello più ripetitivo e meno creativo: report, bozze, riassunti. Controlla sempre il risultato prima di usarlo.']],
 'Growth & Advertising':[['Quanto budget serve per iniziare con le ads?','Poco, ma da testare con metodo: parti con una cifra che puoi perdere, cambia una variabile alla volta e guarda i dati.'],['Meglio tanti canali o uno solo?','Uno solo fatto bene. Quando funziona e lo capisci, ne aggiungi un secondo.']],
 'Business':[['Come capisco se la mia idea vale la pena?','Parlando con dieci possibili clienti prima di costruire qualsiasi cosa. Se nessuno è disposto a pagare, ti sei risparmiato mesi.'],['Quando è il momento di assumere?','Quando sei tu il collo di bottiglia e hai già i processi scritti: assumere sul caos moltiplica il caos.']],
 'Brand & Comunicazione':[['Come mi distinguo in un mercato pieno di copie?','Con una promessa precisa e coerente. Non serve essere diversi su tutto, basta esserlo su una cosa che conta per chi ti sceglie.'],['Quanto conta il tono di voce?','Moltissimo: è la prima cosa che ricorda chi legge. Scrivilo in tre aggettivi e usalo sempre.']],
 'Social & Creator':[['Quanto spesso devo pubblicare?','Quanto riesci a mantenere per sei mesi. Meglio due post a settimana fatti bene che sette fatti male.'],['Come cresce una community?','Dando valore prima di chiedere qualcosa, rispondendo a tutti all’inizio e creando occasioni per parlarsi fra loro.']],
 'Economics':[['Come separo i soldi personali da quelli dell’attività?','Con due conti distinti e uno stipendio fisso che ti paghi da solo. Le tasse mettile da parte ogni mese, subito.'],['Quanto devo tenere da parte?','Almeno tre-sei mesi di spese fisse. Ti permette di scegliere i clienti invece di subirli.']],
 'Mindset & Lifestyle':[['Come gestisco l’ansia da prestazione?','Dividendo il compito in pezzi piccoli e respirando prima di cominciare. L’ansia cala quando passi all’azione.'],['Come evito il burnout?','Con confini chiari: orari, pause vere e almeno un’attività che non si possa monetizzare.']]};
function qaSlide(e,c){
  const tags=e.tags&&e.tags.length?e.tags:['Business'],pool=[];tags.forEach(t=>(QA[t]||[]).forEach(x=>pool.push(x)));QA_GEN.forEach(x=>pool.push(x));
  const r=mulberry32(hashStr(G.seed+'|qa|'+e.id)),pick=[];const bag=pool.slice();while(pick.length<3&&bag.length)pick.push(bag.splice(Math.floor(r()*bag.length),1)[0]);
  return{qa:true,q:'Domande dal pubblico: il relatore ha tempo per tre domande. Alzi la mano?',c:[...pick.map(x=>({t:x[0],r:'Risposta: '+x[1],good:true})),{t:'Resto in ascolto',r:'Ascolti con attenzione le domande degli altri: a volte è il modo migliore per imparare.',good:false}]};
}
function qaAdd(c,e){if(!c||c.qaAdded)return c;c.slides=[...c.slides,qaSlide(e,c)];c.qaAdded=true;return c;}

/* ---------- workshop esauriti: lista d'attesa e coda davanti alla sala ---------- */
function queueRoom(e){
  G.wait=G.wait||new Set();
  const host={name:'Ingresso · '+e.room,role:'Sala piena',p:{shirt:'#ff6a3d',pants:'#232a44',skin:'#e0b085',hair:'#2a1d14',badge:'#fff'}};
  const early=Math.max(0,e.start-G.min),late=Math.max(0,G.min-e.start),w=G.wait.has(e.id);
  const ahead=3+Math.floor(mulberry32(hashStr(G.seed+'|qa|'+e.id))()*9);
  const p=Math.max(.05,Math.min(.95,.25+(w?.4:0)+Math.min(.3,early/60)-Math.min(.3,late/40)));
  say(host,{t:'«'+(e.title.length>60?e.title.slice(0,58)+'…':e.title)+'» è esaurito. Davanti a te ci sono circa '+ahead+' persone in coda. '+(w?'Sei in lista d’attesa: hai la precedenza se si libera un posto.':'Mettendoti in lista d’attesa dal telefono (scheda Programma) hai più possibilità.')+(early>10?' Sei arrivato in anticipo: ottimo posto in fila.':late>5?' La sessione è già iniziata: i posti liberi sono pochissimi.':''),c:[
    {t:'Mi metto in coda (attendo 10 minuti)',n:null,act:()=>{G.min+=10;const r=mulberry32(hashStr(G.seed+'|qr|'+e.id+'|'+(w?1:0)+'|'+ahead))();
      if(r<p){toast('Si è liberato un posto: entri!',2600);A.stamp();startTheatre(e);}else toast('Niente da fare: i posti sono finiti. Prova con un’altra sessione.',3400);}},
    {t:'Vedo altre sessioni',n:null}]});
}

/* ---------- favori dei partecipanti ---------- */
const SQ_ZONES=[[420,640,520,705,0],[740,640,830,705,0],[430,200,860,236,0],[300,420,395,620,0],[160,640,390,700,0],[420,780,860,860,0],[420,560,830,680,1],[400,120,860,200,1],[330,300,470,720,0],[600,640,700,740,0]];
const SQ_ZN=['atrio sud-ovest','atrio sud-est','atrio nord, tra gli stand','corridoio ovest','zona bistrot','fuori dall’Ingresso A','primo piano, parte centrale','primo piano, lato nord','corridoio ovest, verso le Silent Stage','atrio, vicino alle scale mobili'];
const SQ_OBJ=['badge','telefono','portafoglio','taccuino','borraccia'];
function sqPlan(){
  if(G._sq&&G._sq.k===G.seed)return G._sq.v;
  const r=mulberry32(hashStr(G.seed+'|sq')),att=NPC.filter(n=>n.kind==='att'&&n.f===0&&!n.friend).sort(()=>r()-.5),out=[];
  for(let d=0;d<3;d++){const T=['coffee','lost','intro'].sort(()=>r()-.5).slice(0,2);
    T.forEach((type,i)=>{const g=att.pop(),t=type==='intro'?att.pop():null,zi=Math.floor(r()*SQ_ZONES.length),z=SQ_ZONES[zi];
      out.push({id:'sq'+d+i,day:d,type,giver:g.id,target:t?t.id:null,obj:SQ_OBJ[Math.floor(r()*SQ_OBJ.length)],zi,rx:r(),ry:r(),z});});}
  G._sq={k:G.seed,v:out};return out;
}
const sqNpc=id=>NPC.find(n=>n.id===id);
function sqState(q){G.sqd=G.sqd||{};const s=G.sqd[q.id]||(G.sqd[q.id]={s:'offer'});if(s.s!=='done'&&q.day<G.day&&!G.sandbox)s.s='lost';return s;}
function sqToday(){return sqPlan().filter(q=>q.day===G.day);}
function sqActive(){return sqPlan().find(q=>sqState(q).s==='active')||null;}
function sqItemPos(q){
  if(q._p)return q._p;const z=q.z,x=k(z[0])+q.rx*(k(z[2])-k(z[0])),y=k(z[1])+q.ry*(k(z[3])-k(z[1])),f=z[4],[fx,fy]=FL[f]?freeSpot(f,x,y):[x,y];return q._p={f,x:fx,y:fy};
}
const sqFirst=n=>(n.name||'').split(' ')[0];
function sqOffer(q,g){
  const first=sqFirst(g),t=q.target?sqNpc(q.target):null;
  const txt=q.type==='coffee'?'Ho una sessione fra poco e non ho ancora preso un caffè. Mi porti un espresso dal bar? Ti aspetto qui, o quasi.':
    q.type==='lost'?'Ho perso il mio '+q.obj+' da qualche parte, forse '+SQ_ZN[q.zi]+'. Se lo trovi mi salvi la giornata! Ti segno la direzione.':
    'Vedi '+(t?t.name:'quella persona')+'? Fa '+((t&&t.job)||'il mio stesso lavoro')+': sono mesi che vorrei conoscerl'+(t&&t.gender==='f'?'a':'o')+'. Mi fai da tramite? Digli che lo saluto io.';
  say(g,{t:txt,c:[{t:'Volentieri!',n:null,act:()=>{sqState(q).s='active';A.stamp();toast('Favore accettato: segui la freccia gialla.',3000);}},{t:'Non ora',n:null}]});
}
function sqDone(q,g){
  const s=sqState(q);s.s='done';G.flags.fav=(G.flags.fav||0)+1;addContact(g);A.stamp();if(A.fanfare)setTimeout(()=>A.fanfare(),300);
  toast('Favore completato! '+sqFirst(g)+' ti ringrazia (+35 punti).',3600);
}
function sqTalk(n){
  const plan=sqPlan();
  for(const q of plan){
    const s=sqState(q),g=sqNpc(q.giver);
    if(q.day!==G.day&&!G.sandbox)continue;
    if(q.giver===n.id){
      if(s.s==='offer'){if(sqActive()){say(n,{t:'Ho visto che stai aiutando qualcun altro: finisci prima quel favore, io posso aspettare.',c:[{t:'Ok',n:null}]});return true;}sqOffer(q,n);return true;}
      if(s.s==='active'){
        const ready=q.type==='intro'?s.met:s.has;
        if(ready){say(n,{t:q.type==='coffee'?'Il mio caffè! Sei un angelo, grazie.':q.type==='lost'?'Il mio '+q.obj+'! Non ci speravo più, grazie mille.':'Allora l’hai salutat'+(sqNpc(q.target).gender==='f'?'a':'o')+'? Fantastico, grazie per il tramite.',c:[{t:'Di niente!',n:null,act:()=>sqDone(q,g)}]});return true;}
        say(n,{t:q.type==='coffee'?'Il caffè lo trovi al bar: segui la freccia gialla.':q.type==='lost'?'Il '+q.obj+' dovrebbe essere '+SQ_ZN[q.zi]+': la freccia ti porta lì.':'Digli che lo saluto io: la freccia ti porta da lui.',c:[{t:'Vado!',n:null}]});return true;
      }
    }
    if(q.target===n.id&&s.s==='active'&&!s.met){
      const first=sqFirst(g);say(n,{t:'Ah, '+g.name+' mi ha parlato di te! Salutamelo tu, grazie del tramite.',c:[{t:'Riferirò!',n:null,act:()=>{s.met=true;A.stamp();toast('Messaggio consegnato: torna da '+first+'.',2800);}}]});return true;
    }
  }
  return false;
}
function sqCoffee(){const q=sqActive();if(q&&q.type==='coffee'){const s=sqState(q);if(!s.has){s.has=true;toast('Hai preso un caffè anche per '+sqFirst(sqNpc(q.giver))+': portaglielo!',3200);}}}
if(typeof coffee==='function'){const _cf=coffee;coffee=function(){_cf();sqCoffee();};}
function sqSpots(f,I){
  const q=sqActive();if(!q||q.type!=='lost')return;const s=sqState(q);if(s.has)return;const p=sqItemPos(q);if(p.f!==f)return;
  I(p.x/K,p.y/K,18,'Raccogli: '+q.obj+' di '+sqFirst(sqNpc(q.giver)),()=>{s.has=true;A.stamp();toast('Trovato! Riporta il '+q.obj+' a '+sqFirst(sqNpc(q.giver))+'.',3200);});
}
function sqDrawWorld(c){
  const q=sqActive();if(!q||q.type!=='lost')return;const s=sqState(q);if(s.has)return;const p=sqItemPos(q);if(p.f!==G.f)return;
  const b=Math.round(Math.sin(G.t*3)*1.5),x=Math.round(p.x),y=Math.round(p.y)+b;
  c.fillStyle='rgba(255,210,77,.22)';c.beginPath();c.arc(x,y,12,0,7);c.fill();c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x-5,y+4,10,2);
  c.fillStyle='#e8e0c8';c.fillRect(x-5,y-4,10,8);c.fillStyle='#ff6a3d';c.fillRect(x-5,y-4,10,2);c.fillStyle='#fff';c.fillRect(x-2,y,4,2);
}
/* bersaglio corrente del favore attivo: {f,x,y,lab} */
function sqTarget(){
  const q=sqActive();if(!q)return null;const s=sqState(q),g=sqNpc(q.giver),T=n=>({f:n.f,x:n.x,y:n.y,lab:n.name});
  if(q.type==='coffee'){if(!s.has){const bars=[[457,308],[815,308]].map(b=>({f:0,x:k(b[0]),y:k(b[1]),lab:'Bar'}));return G.f===0?bars.sort((a,b)=>Math.hypot(a.x-G.p.x,a.y-G.p.y)-Math.hypot(b.x-G.p.x,b.y-G.p.y))[0]:bars[0];}return T(g);}
  if(q.type==='lost'){if(!s.has){const p=sqItemPos(q);return{f:p.f,x:p.x,y:p.y,lab:q.obj};}return T(g);}
  return s.met?T(g):T(sqNpc(q.target));
}
function sqDraw(){
  if(!G||!G.flags||G.watching||G.react)return;
  const vc=G.vc||G.cam;
  const mark=(n,ch,col)=>{if(n.f!==G.f)return;const sx=W/2+(n.x-vc.x)*Z,sy=H/2+(n.y-vc.y)*Z-40*Z;if(sx<-20||sx>W+20||sy<-20||sy>H+20)return;
    const b=Math.sin(G.t*5+n.x)*3;ctx.save();ctx.translate(sx,sy+b);ctx.fillStyle=col;ctx.strokeStyle='rgba(0,0,0,.75)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,10*Math.max(1,Z*.45),0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='#1a0a04';ctx.font='900 '+Math.round(14*Math.max(1,Z*.45))+'px "Space Grotesk",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ch,0,1);ctx.restore();};
  for(const q of sqToday()){const s=sqState(q),g=sqNpc(q.giver);if(!g)continue;
    if(s.s==='offer')mark(g,'!','#ffd24d');
    else if(s.s==='active'&&(q.type==='intro'?s.met:s.has))mark(g,'?','#4dd0ff');}
  const a=sqActive();if(a){const t=sqTarget();if(t){
    let tx=t.x,ty=t.y,lab=t.lab;if(t.f!==G.f){const v=viaFloor({f:t.f});tx=v.x;ty=v.y;lab=v.lab+' → '+t.lab;}
    const g=sqNpc(a.giver),dist=Math.hypot(tx-G.p.x,ty-G.p.y),ang=Math.atan2(ty-G.p.y,tx-G.p.x),sx=W/2+(G.p.x-vc.x)*Z,sy=H/2+(G.p.y-vc.y)*Z,r=Math.min(W,H)*.18;
    if(dist>k(40)||t.f!==G.f){
      ctx.save();ctx.translate(sx+Math.cos(ang)*r,sy+Math.sin(ang)*r);ctx.rotate(ang);ctx.fillStyle='#7ad37a';ctx.strokeStyle='rgba(0,0,0,.7)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-9,10);ctx.lineTo(-4,0);ctx.lineTo(-9,-10);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
      ctx.save();ctx.font='700 12px "Space Grotesk",sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.strokeStyle='rgba(0,0,0,.75)';ctx.lineWidth=4;const txt='Favore per '+sqFirst(g)+': '+lab+' · ~'+Math.round(dist/K*.19)+' m',lx=sx+Math.cos(ang)*(r+30),ly=sy+Math.sin(ang)*(r+30)-34;ctx.strokeText(txt,lx,ly);ctx.fillText(txt,lx,ly);ctx.restore();}
    if(t.f===G.f){const bx=W/2+(tx-vc.x)*Z,by=H/2+(ty-vc.y)*Z;if(bx>0&&bx<W&&by>0&&by<H){ctx.fillStyle='#7ad37a';ctx.beginPath();ctx.arc(bx,by-30*Z*.9-Math.sin(G.t*5)*3,6,0,7);ctx.fill();ctx.strokeStyle='#000';ctx.stroke();}}}}
}
function sqCard(){
  const a=sqActive();
  if(a){const g=sqNpc(a.giver),s=sqState(a),t=a.type==='coffee'?(s.has?'porta il caffè a '+g.name:'prendi un caffè al bar per '+g.name):a.type==='lost'?(s.has?'riporta il '+a.obj+' a '+g.name:'cerca il '+a.obj+' di '+g.name+' ('+SQ_ZN[a.zi]+')'):(s.met?'torna da '+g.name:'saluta '+sqNpc(a.target).name+' da parte di '+g.name);
    return '<div class="bn" style="cursor:default">Favore in corso: <b>'+esc(t)+'</b> (segui la freccia verde)</div>';}
  const open=sqToday().filter(q=>sqState(q).s==='offer').length;
  return open?'<div class="bn" style="cursor:default">Oggi ci sono <b>'+open+'</b> partecipanti che hanno bisogno di una mano: cerca il punto esclamativo giallo sopra la testa.</div>':'';
}
function sqQuests(){const n=(G.flags&&G.flags.fav)||0;return[{t:'Aiuta due partecipanti',s:'Cerca il punto esclamativo giallo sopra la testa di chi ha bisogno ('+Math.min(2,n)+'/2)',ok:n>=2}];}

/* ---------- epilogo personalizzato ---------- */
function epilogueHtml(){
  const F=G.flags,C=cmEnsure(),me=pname(),L=[];
  const cons=G.contacts.filter(c=>c.kind==='att'||c.kind==='friend'||c.kind==='fam');
  const pe=cons.map(c=>G.people.find(p=>p.name===c.name)).filter(Boolean).sort((a,b)=>b.compat-a.compat)[0];
  if(pe)L.push('<b>'+esc(pe.name)+'</b> ('+esc(pe.job)+') ti scrive: «Ciao '+esc(me)+', è stato un piacere conoscerti a Rimini. Che ne dici di sentirci la settimana prossima?»');
  else if(cons.length)L.push('<b>'+esc(cons[cons.length-1].name)+'</b> ti scrive: «Ciao '+esc(me)+', bello esserci incontrati a Rimini. Restiamo in contatto!»');
  else L.push('Nessuno ha il tuo numero: la prossima volta scambia qualche contatto, il networking si fa anche così.');
  L.push(F.offer?'La talent scout ti ha scritto: la proposta di collaborazione ti aspetta lunedì mattina.':'Nessuna proposta di collaborazione, questa volta: ma i contatti buoni, di solito, arrivano con calma.');
  try{const lv=cmLevelInfo(cmMyPts(cmT()));L.push(lv.l>=5?'Su Marketers Pro ti riconoscono: livello '+lv.l+', «'+lv.name+'».':lv.l>=3?'Su Marketers Pro sei diventat'+(PLAYER.gender==='f'?'a':'o')+' «'+lv.name+'»: la strada è giusta.':'Su Marketers Pro sei ancora un «'+lv.name+'»: scrivi qualcosa, la community risponde.');}catch(e){}
  if((F.fav||0)>=1)L.push('Qualcuno ricorda ancora il tuo aiuto a Rimini: '+F.fav+(F.fav>1?' favori fatti':' favore fatto')+' contano più di un biglietto da visita.');
  if((C.noshow||[]).length)L.push('Su una chat c’è ancora chi ricorda il meeting a cui non ti sei presentat'+(PLAYER.gender==='f'?'a':'o')+'. Il networking vive di puntualità.');
  if((C.late||[]).length)L.push('Il ritardo alla serata del Village è diventato una storia da raccontare al prossimo evento.');
  if((F.kn||0)>0)L.push('Il video del tuo karaoke all’Offworld gira ancora nel gruppo (con '+(F.ks||0)+' stelle all’attivo).');
  if(F.banner)L.push('Lo stendardo del Marketers World è ancora piantato al Village, e sembra salutarti.');
  const sc=(typeof scoreNow==='function')?scoreNow():0;
  const t=sc>=1400?'Leggenda del Marketers World':sc>=900?'Networker affermato':sc>=450?'Partecipante attivo':'Turista di Rimini';
  return '<div class="scbox epi"><div class="sct">EPILOGO</div><div class="scn" style="font-size:14px;line-height:1.5">'+esc(t)+'</div>'+L.map(x=>'<p>'+x+'</p>').join('')+'<p class="scs">Lunedì, di nuovo al lavoro: ma con la testa ancora a Rimini.</p></div>';
}

/* ---------- esporta / importa i salvataggi come file ---------- */
function exportSaves(){
  const data={type:'rimini-saves',v:1,at:Date.now(),saves:getSaves(),best:lsGet('rimini.best',null),runs:lsGet('rimini.runs',[])};
  const b=new Blob([JSON.stringify(data)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download='rimini-salvataggi-'+new Date().toISOString().replace(/[-:T]/g,'').slice(0,12)+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},400);
  return data.saves.length;
}
function importSavesText(txt){
  let d;try{d=JSON.parse(txt);}catch(e){return{ok:false,msg:'Il file non è valido.'};}
  if(!d||d.type!=='rimini-saves'||!Array.isArray(d.saves))return{ok:false,msg:'Questo file non è un salvataggio di Rimini 3 giorni.'};
  const cur=getSaves(),map=new Map(cur.map(x=>[x.id,x]));let n=0;
  for(const s of d.saves){if(!s||!s.id||!s.st||!s.st.seed)continue;const o=map.get(s.id);if(!o||(s.ts||0)>(o.ts||0)){map.set(s.id,s);n++;}}
  const all=[...map.values()].sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,15);putSaves(all);
  if(d.best&&d.best.score>((lsGet('rimini.best',null)||{}).score||0))lsSet('rimini.best',d.best);
  if(Array.isArray(d.runs)){const runs=lsGet('rimini.runs',[]),ids=new Set(runs.map(r=>r.id));d.runs.forEach(r=>{if(r&&!ids.has(r.id))runs.push(r);});lsSet('rimini.runs',runs.sort((a,b)=>(b.at||0)-(a.at||0)).slice(0,8));}
  return{ok:true,msg:'Importati '+n+' salvataggi.',n};
}
function importSavesFile(file,done){
  const r=new FileReader();r.onload=()=>done(importSavesText(String(r.result||'')));r.onerror=()=>done({ok:false,msg:'Impossibile leggere il file.'});r.readAsText(file);
}
