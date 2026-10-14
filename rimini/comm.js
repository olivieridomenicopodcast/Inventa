'use strict';
/* RIMINI 3 GIORNI · "Marketers Pro" (community nell'app, tutta finta e generata dal gioco).
   Post e commenti sono procedurali e deterministici dal seme; le persone che incontri davvero nel gioco ti riconoscono. */

const CM_ABSENT=[
 'Beati voi che siete al #MW26! Io quest’anno non ce l’ho fatta a venire. Raccontatemi tutto.',
 'Guardo le storie da Rimini e mi mangio le mani. Il prossimo anno ci sono, promesso.',
 'Chi è al Marketers World? Fatemi sapere cosa vi porta a casa oggi, io seguo da lontano.',
 'Quest’anno niente Rimini per me: lavoro e scadenze. Beati voi!',
 'Se qualcuno prende appunti dei workshop, io offro un caffè virtuale 🙏',
 'Non ce l’ho fatta a venire al #MW26. Qualcuno mi racconta com’è l’Offworld?',
 'Invidia pura per chi è al Palacongressi oggi. Fate un saluto da parte mia!',
 'Dalla scrivania non è la stessa cosa. Beati voi che siete a Rimini! #MW26'];
const CM_PRE=[
 'Domani si parte: Rimini, Palacongressi, #MW26. Zaino pronto e batteria del telefono carica.',
 'Ultime ore prima del Marketers World. Chi c’è? Scrivetemi, ci incontriamo.',
 'Ho già salvato tre workshop nell’app. Il resto lo decido sul momento. #MW26',
 'Viaggio verso Rimini: playlist, caffè e un taccuino ancora vuoto.',
 'Quest’anno porto con me biglietti da visita veri. Sì, esistono ancora.',
 'Primo anno al Marketers World: ansia e curiosità in parti uguali. #MW26'];
const CM_EVENT=[
 'Giorno {n} al Marketers World: i piedi chiedono pietà ma la testa è piena. #MW26',
 'Il Palacongressi pieno di gente che parla di lavoro con gli occhi che brillano. Energia pazzesca.',
 'Caffè, networking e un’altra chiacchierata che mi ha dato una dritta. Che bella gente. #MW26',
 'Silent Stage con le cuffie: strana, ma funziona. Consigliata.',
 'Appena finito «{title}»: tre spunti da riguardare con calma. #MW26',
 '«{title}» è stato più utile di quanto pensassi. Appunti salvati.',
 'Ho sbagliato sala due volte, ma ho conosciuto gente per strada. Il Palacongressi è un labirinto simpatico.',
 'Il Main Stage pieno è un colpo d’occhio. Pelle d’oca. #MW26',
 'Consiglio da primo giorno: scegliete i workshop nell’app, le sale si riempiono in fretta.',
 'Una coda lunghissima per il firmacopie: segno che i libri servono ancora.',
 'Scale mobili, ascensori e il mio senso dell’orientamento: oggi hanno vinto le scale mobili.'];
const CM_EVE0=['Stasera Offworld al Village: karaoke e zero vergogna. #MW26','Giornata piena, serata ancora più piena. Ci vediamo al Village! #Offworld'];
const CM_LAST=['Ultimo giorno: nostalgia già prima di salutarci. #MW26','Ultimi saluti, ultimi contatti scambiati. Grazie a chi ha reso questi giorni speciali.','Tornerò a casa con la testa piena di idee e il telefono pieno di nuovi contatti.'];
const CM_Q=[
 'Che strumento AI usate ogni giorno nel lavoro? Io sto provando a ridurre i passaggi manuali.',
 'Freelance o agenzia nel 2026? Voi come la vedete?',
 'Quante volte a settimana postate su LinkedIn? Io sono fermo a una e mi sento in colpa.',
 'Podcast in video o solo audio? Mi serve un parere onesto.',
 'Qual è la cosa più utile che avete imparato quest’anno? Io: documentare tutto.',
 'Newsletter o social: se dovete scegliere un canale solo, quale?',
 'Voi i report ai clienti come li fate? Slide, dashboard o vocale?'];
const CM_GEN=['Concordo!','Bella osservazione, grazie per averla condivisa.','Interessante, ci pensavo proprio oggi.','Io la penso un po’ diversamente, ma il punto è valido.','Salvato, lo provo la prossima settimana.','Questa è oro 🙌','Lo giro al mio team.','Top. Aggiungo: misurate sempre i risultati.','Ci vediamo al prossimo Marketers!','Grazie per averlo scritto, mi ci ritrovo molto.','Ottimo spunto per il mio lavoro.','Complimenti, continua così!'];
const CM_ANS=['Io uso un paio di strumenti e un controllo umano a fine giornata.','Dipende da cosa vuoi ottenere, ma io partirei dal più semplice.','Ci ho appena provato: funziona meglio con regole chiare.','Una volta a settimana, ma fatta bene.','Per me meglio un solo canale e farlo benissimo.','Prova entrambe e guarda i numeri dopo un mese.'];
const CM_REACT_ABS=['Beati voi che siete lì!','Quanto mi piacerebbe esserci, il prossimo anno ci sono.','Fatemi sapere com’è, io seguo da lontano.','Invidia pura, godetevela!'];
const CM_REACT_ATT=['Ci vediamo domani in sala!','Io ero lì, bellissima sessione.','Ci incontriamo all’Area networking?','Anch’io ho preso appunti, te li giro.'];
const CM_WARM=['Che bello averti incontrato al #MW26, {me}!','Mi ha fatto davvero piacere conoscerti di persona.','Ci siamo conosciuti oggi: bella chiacchierata, ci sentiamo!','È stato un piacere incontrarti, {me}!','Ricordo bene la chiacchierata di oggi: teniamoci in contatto 🙌','{me}! Ci siamo visti proprio oggi. Grazie ancora per il confronto.'];
const CM_METPOST=['Oggi ho conosciuto {me} al #MW26, {job}: bellissima chiacchierata. Ne riparliamo presto!','Tra le persone più interessanti incontrate oggi: {me}. Segnatevi il nome. #MW26','Una chiacchierata con {me} ({job}) mi ha dato idee nuove. Il Marketers World serve a questo.'];
const CM_COMPOSE=['Sono a Rimini per il #MW26: chi c’è?','Che energia al Palacongressi! #MW26','Primo workshop fatto: spunti a pioggia.','Consiglio del giorno: scrivete tutto nel taccuino.','Cerco qualcuno con cui parlare di {job} all’Area networking.'];

const cmT=()=>G.day*1440+Math.floor(G.min);
function cmInit(){return{liked:{},posts:[],cm:{},metT:{},seenT:0,notifT:0,pid:0};}
function cmEnsure(){if(!G.comm)G.comm=cmInit();return G.comm;}
function cmMetNote(name){cmEnsure().metT[name]=cmT();}
function cmRel(a,T){const d=T-a;if(d<1)return 'adesso';if(d<60)return Math.floor(d)+' min fa';if(d<1440)return Math.floor(d/60)+' h fa';const g=Math.floor(d/1440);return g===1?'ieri':g+' g fa';}
const cmPick=(r,a)=>a[Math.floor(r()*a.length)];

/* membri della community (finti) */
function cmMembers(){
  if(G._cmM&&G._cmM.k===G.seed)return G._cmM.v;
  const r=mulberry32(hashStr(G.seed+'|members')),used=new Set(),out=[];
  for(let i=0;i<30;i++){let nm;do{nm=cmPick(r,ATT_FIRST)+' '+cmPick(r,ATT_LAST);}while(used.has(nm));used.add(nm);
    const jb=cmPick(r,JOBS);out.push({id:'m'+i,name:nm,job:jb[0],fam:jb[1],city:cmPick(r,ATT_CITY),absent:r()<.3,pal:{shirt:['#c9a24a','#3da5d9','#6bc46d','#b57bff','#e86a8a','#f0f0f5','#ff6a3d'][i%7]}});}
  G._cmM={k:G.seed,v:out};return out;
}
/* post programmati nei tre giorni (e il giorno prima) */
function cmPool(){
  if(G._cmP&&G._cmP.k===G.seed+'|'+PLAYER.job)return G._cmP.v;
  const r=mulberry32(hashStr(G.seed+'|pool')),M=cmMembers(),out=[],N=46,start=-1500,end=2*1440+1400;
  const titles=[0,1,2].map(d=>PROGRAMMA.filter(e=>e.d===d&&(e.kind==='ws'||e.kind==='talk')&&e.title.length<70));
  for(let i=0;i<N;i++){
    const at=Math.round(start+(end-start)*(i+r()*.8)/N),m=M[Math.floor(r()*M.length)],day=Math.max(0,Math.floor(at/1440)),mn=((at%1440)+1440)%1440;
    let text,kind='ev',q=false;
    if(m.absent&&r()<.75){text=cmPick(r,CM_ABSENT);kind='abs';}
    else if(at<525){text=cmPick(r,CM_PRE);kind='pre';}
    else{
      const x=r();
      if(x<.2){q=true;kind='q';text=cmPick(r,CM_Q);}
      else if(x<.4){kind='tip';const f=JOBFAM[m.fam];text='Consiglio da '+m.job.toLowerCase()+': '+cmPick(r,TIPS[cmPick(r,f.tip)]);}
      else{
        const pool=day===2&&mn>900?CM_LAST:day===0&&mn>1080?CM_EVE0:CM_EVENT;
        const e=titles[day][Math.floor(r()*titles[day].length)];
        text=cmPick(r,pool).replace('{n}',day+1).replace('{title}',e?e.title:'un workshop');
      }
    }
    out.push({id:'c'+i,at,m,text,kind,q});
  }
  out.sort((a,b)=>a.at-b.at);G._cmP={k:G.seed+'|'+PLAYER.job,v:out};return out;
}
/* persone incontrate davvero nel gioco (kind att) come "membri" riconoscibili */
function cmMetPeople(){
  const C=cmEnsure();return G.contacts.filter(c=>c.kind==='att'&&C.metT[c.name]!=null).map(c=>{const [job,city]=(c.role||'').split(' · '),jb=jobFind(job);
    return{id:'k'+hashStr(c.name),name:c.name,job:job||'Partecipante',fam:jb?jb[1]:'strat',city:city||'',met:true,at:C.metT[c.name],pal:{shirt:['#3da5d9','#6bc46d','#b57bff','#e86a8a','#c9a24a'][hashStr(c.name)%5]}};});
}
const cmFill=(s,extra)=>s.replace('{me}',pname()).replace('{job}',(extra&&extra.job)||ME().job);
/* commenti di un post (del pool o mio): deterministici, ordinati nel tempo */
function cmComments(p,mine){
  const r=mulberry32(hashStr(G.seed+'|cm|'+p.id)),M=cmMembers(),met=mine?cmMetPeople().filter(x=>x.at<=p.at):[],out=[];
  const n=mine?2+Math.floor(r()*3):p.q?2+Math.floor(r()*3):Math.floor(r()*3);
  let t=p.at;const warm=met.slice().sort(()=>r()-.5).slice(0,Math.min(2,met.length));
  for(let i=0;i<n;i++){
    t+=mine?4+Math.floor(r()*28):6+Math.floor(r()*70);
    let who,text,isMet=false;
    if(mine&&warm[i]){who=warm[i];text=cmFill(cmPick(r,CM_WARM));isMet=true;}
    else{who=cmPick(r,M);while(!mine&&who===p.m)who=cmPick(r,M);
      text=who.absent&&r()<.6?cmPick(r,CM_REACT_ABS):p.q&&!mine?cmPick(r,CM_ANS):r()<.25?cmPick(r,CM_REACT_ATT):cmPick(r,CM_GEN);}
    out.push({id:p.id+'_'+i,at:t,who,text,met:isMet});
  }
  return out;
}
/* risposte alle mie commenti */
function cmReplies(){
  const C=cmEnsure(),out=[];
  for(const pid in C.cm)for(const c of C.cm[pid]){const r=mulberry32(hashStr(G.seed+'|rp|'+c.id));if(r()<.25)continue;
    const M=cmMembers(),who=cmPick(r,M);out.push({id:'r'+c.id,pid,at:c.at+8+Math.floor(r()*24),who,text:cmPick(r,CM_GEN.concat(CM_ANS)),to:c.id});}
  return out;
}
/* feed visibile: pool + post degli incontrati + miei */
function cmFeed(T){
  const C=cmEnsure(),items=[];
  for(const p of cmPool())if(p.at<=T)items.push(Object.assign({},p,{mine:false}));
  cmMetPeople().forEach((m,i)=>{const r=mulberry32(hashStr(G.seed+'|mp|'+m.name));if(i>5)return;
    items.push({id:'k_'+m.id,at:m.at+25,m,text:cmFill(cmPick(r,CM_METPOST),{job:ME().job}).replace('{job}',ME().job),kind:'met',q:false,mine:false});});
  const me={id:'me',name:pname(),job:ME().job,fam:ME().fam,pal:{shirt:'#ff6a3d'},me:true};
  for(const p of C.posts)items.push({id:p.id,at:p.at,m:me,text:p.text,kind:'mine',mine:true});
  return items.filter(x=>x.at<=T).sort((a,b)=>b.at-a.at).slice(0,40);
}
function cmView(p,T){
  const C=cmEnsure(),base=p.mine?cmComments(p,true):p.kind==='met'?[]:cmComments(p,false),mine=(C.cm[p.id]||[]).map(c=>({id:c.id,at:c.at,who:{name:pname(),me:true,pal:{shirt:'#ff6a3d'}},text:c.text,me:true}));
  const reps=cmReplies().filter(x=>x.pid===p.id).map(x=>({id:x.id,at:x.at,who:x.who,text:x.text}));
  const all=[...base,...mine,...reps].filter(c=>c.at<=T).sort((a,b)=>a.at-b.at);
  const r=mulberry32(hashStr(G.seed+'|lk|'+p.id)),cap=p.mine?3+Math.floor(r()*6)+cmMetPeople().length*3:4+Math.floor(r()*40);
  const likes=Math.min(cap,Math.floor(Math.max(0,T-p.at)/(p.mine?9:25)*(1+r())))+(C.liked[p.id]?1:0);
  return{comments:all,likes};
}
/* attività sui miei contenuti, per le notifiche */
function cmActivity(T){
  const C=cmEnsure(),out=[];
  for(const p of C.posts)for(const c of cmComments(p,true))if(c.at<=T)out.push({at:c.at,met:c.met});
  for(const x of cmReplies())if(x.at<=T)out.push({at:x.at,met:false});
  return out;
}
const cmUnread=T=>cmActivity(T).filter(a=>a.at>cmEnsure().seenT).length;
const cmHasMetComment=T=>cmActivity(T).some(a=>a.met);
function cmNotify(){
  const C=cmEnsure(),T=cmT();if(!G.flags.app)return;if(T-C.notifT<2)return;
  const n=cmActivity(T).filter(a=>a.at>C.notifT).length;C.notifT=T;
  if(n&&phoneTab!=='comm')toast('Marketers Pro: '+n+(n>1?' nuove interazioni':' nuova interazione')+' con i tuoi contenuti',2800);
}
const cmHL=s=>esc(s).replace(/(#[\wÀ-ÿ]+|@[\wÀ-ÿ]+)/g,'<span class="hl">$1</span>');
let cmOpen={};
function cmCompose(){const r=mulberry32(hashStr(G.seed+'|cmp|'+G.day));return[0,1,2,3,4].sort(()=>r()-.5).slice(0,3).map(i=>cmFill(CM_COMPOSE[i],{job:ME().job.toLowerCase()}));}
function renderComm(B){
  const C=cmEnsure(),T=cmT();C.seenT=T;
  const sug=cmCompose(),feed=cmFeed(T);
  const av=(m)=>`<div class="cav" style="background:${m.pal.shirt}">${esc(m.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div>`;
  B.innerHTML=`<div class="note" style="margin:0 0 8px"><b>Marketers Pro</b> · la community dell’evento. Post e commenti sono generati dal gioco; le persone che incontri qui ti riconoscono.</div>
   <div class="cbox"><textarea id="cmT" maxlength="160" rows="2" placeholder="Cosa stai vivendo al Marketers World?"></textarea><div class="csug">${sug.map((s,i)=>`<button data-sg="${i}">${esc(s.length>34?s.slice(0,32)+'…':s)}</button>`).join('')}</div><div class="crow"><small id="cmN">0/160</small><button class="pb" id="cmP">Pubblica</button></div></div>`+
   (feed.length?feed.map(p=>{const v=cmView(p,T),open=!!cmOpen[p.id],liked=!!C.liked[p.id];
     return `<div class="cp ${p.mine?'mine':''}"><div class="ch">${av(p.m)}<div><b>${esc(p.m.name)}${p.m.me?' (tu)':''}</b><small>${esc(p.m.job||'')} · ${cmRel(p.at,T)}</small></div></div><div class="ct">${cmHL(p.text)}</div><div class="ca"><button data-lk="${p.id}" class="${liked?'on':''}">${liked?'♥':'♡'} ${v.likes}</button><button data-op="${p.id}">💬 ${v.comments.length}</button></div>`+
      (open?`<div class="cc">${v.comments.map(c=>`<div class="cm ${c.me?'me':''}">${av(c.who)}<div><b>${esc(c.who.name)}${c.me?' (tu)':''}</b><small>${cmRel(c.at,T)}</small><div>${cmHL(c.text)}</div></div></div>`).join('')||'<small>Ancora nessun commento.</small>'}<div class="cin"><input data-ci="${p.id}" maxlength="120" placeholder="Scrivi un commento…"><button class="pb" data-cs="${p.id}">Invia</button></div></div>`:'')+'</div>';}).join(''):'<div class="note">Ancora nessun post: la community si sveglia a breve.</div>');
  const ta=$('#cmT');ta.oninput=()=>{$('#cmN').textContent=ta.value.length+'/160';};
  B.querySelectorAll('[data-sg]').forEach(b=>b.onclick=()=>{ta.value=sug[+b.dataset.sg];ta.oninput();});
  $('#cmP').onclick=()=>{const t=ta.value.trim();if(!t){toast('Scrivi qualcosa prima di pubblicare.',1800);return;}C.posts.push({id:'u'+(++C.pid),text:t.slice(0,160),at:cmT()});toast('Post pubblicato su Marketers Pro.',1800);A.stamp();renderPhone();};
  B.querySelectorAll('[data-lk]').forEach(b=>b.onclick=()=>{const id=b.dataset.lk;C.liked[id]=!C.liked[id];A.blip();const y=B.scrollTop;renderPhone();B.scrollTop=y;});
  B.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>{const id=b.dataset.op;cmOpen[id]=!cmOpen[id];const y=B.scrollTop;renderPhone();B.scrollTop=y;});
  B.querySelectorAll('[data-cs]').forEach(b=>b.onclick=()=>{const id=b.dataset.cs,inp=B.querySelector('[data-ci="'+id+'"]'),t=inp.value.trim();if(!t)return;(C.cm[id]=C.cm[id]||[]).push({id:'x'+(++C.pid),text:t,at:cmT()});toast('Commento pubblicato.',1400);const y=B.scrollTop;renderPhone();B.scrollTop=y;});
}
