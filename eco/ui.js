'use strict';
/* ECO · interazioni, interviste, archivio, taccuino, negozio, menu */
const modalEl=$('#modal');let uiKind=null;
const uiOpen=()=>!!uiKind;
function openUI(html,kind,cls){uiKind=kind;busy++;modalEl.classList.remove('hide');modalEl.innerHTML=`<div class="box ${cls||''}">${html}</div>`;modalEl.onclick=e=>{if(e.target===modalEl)closeUI();};}
function closeUI(){if(!uiKind)return;uiKind=null;busy=Math.max(0,busy-1);modalEl.classList.add('hide');modalEl.innerHTML='';modalEl.onclick=null;modalEl._handler=null;}
function setUI(html){const b=modalEl.querySelector('.box');if(b)b.innerHTML=html;}
function delegate(fn){modalEl._handler=fn;modalEl.onclick=e=>{if(e.target===modalEl){closeUI();return;}const b=e.target.closest('[data-a]');if(b&&!b.disabled)fn(b.dataset.a,b.dataset,b);};}
const stars=(n,tot=5)=>'★'.repeat(n)+'<span class="dim">'+'★'.repeat(tot-n)+'</span>';
const trustOf=n=>G.trust[n.id]??n.trust;
const patienceOf=n=>{const p=G.patience[n.id];return p===undefined?3+Math.floor(skillLvl('int')/3):p;};
const iconSrc={npc:'🗣️',archivio:'📁',giornale:'📰',oggetto:'🔎',voce:'📻',rumor:'💬',documento:'📄',tape:'📼'};

/* ---------- interazione col mondo ---------- */
async function interact(){
  if(busy||!G)return;
  const e=interactTarget();if(!e)return;
  if(e.kind==='npc'){npcLook(e);await talkTo(W.npcs[e.npc]);}
  else if(e.kind==='amb')await recordAmbient(e);
  else if(e.kind==='clue')await examineClue(e);
  else if(e.act==='book')await readBook(e);
  else if(e.act==='board')await readBoard(e);
  else if(e.act==='board_home')openNotebook('bacheca');
  else if(e.act==='archive')openArchive();
  else if(e.act==='radio')await listenRadio();
  else if(e.act==='pc')openPC();
  else if(e.act==='mic')openNarration();
  else if(e.act==='bed')await sleepFlow();
  else if(e.act==='rack')openGearView();
}
const CHAT={
  loquace:['Ah, un volto nuovo! Ci si annoia, qui, quindi parlo volentieri.','Ne ho di storie da raccontare… ma servono pazienza e un buon caffè.'],
  timido:['Oh… salve. Non sono molto bravo con le parole.','Scusi, sto solo… passando.'],
  orgoglioso:['Qui conosco tutti, e tutti conoscono me.','Una volta questo paese contava qualcosa, sa?'],
  nervoso:['Eh? Oh, è lei. Mi ha spaventato.','Vado di fretta, ma… dica pure.'],
  sospettoso:['E lei chi sarebbe, di preciso?','Domande, domande… sempre domande.'],
  stanco:['Eh, una volta correvo. Adesso mi siedo.','La memoria va e viene, giovanotto.']};
async function talkTo(n){
  const first=!G.flags['met_'+n.id];G.flags['met_'+n.id]=1;
  const who=n.name;
  if(n.role==='zia'&&!G.flags.intro){await prologue(n);return;}
  const greet=pick(Math.random,CHAT[n.trait]);
  if(first)await say(who,greet);
  const opts=[{t:'Fare due chiacchiere'}];
  if(n.statements.length)opts.push({t:'🎙️ Intervistarlo',sub:`Pazienza: ${patienceOf(n)}`});
  if(n.role==='negoziante')opts.push({t:'🛒 Vedere il negozio'});
  if(n.role==='zia')opts.push({t:'☕ Chiedere un consiglio'});
  opts.push({t:'Lasciar perdere'});
  const c=await choose(first?'Che vuoi fare?':`${who}: "Sì?"`,opts,who);
  const label=opts[c].t;
  if(label.startsWith('Fare'))await smallTalk(n);
  else if(label.startsWith('🎙️'))openInterview(n);
  else if(label.startsWith('🛒'))openShop();
  else if(label.startsWith('☕'))await tips();
}
async function smallTalk(n){
  const done=G.flags['chat_'+n.id+'_'+G.day];
  if(done){await say(n.name,'Ne abbiamo già parlato oggi… torna domani.');return;}
  G.flags['chat_'+n.id+'_'+G.day]=1;
  G.trust[n.id]=clamp(trustOf(n)+4+Math.floor(skillLvl('car')/2),0,100);addXp('car',4);
  const lines=[pick(Math.random,CHAT[n.trait])];
  if(n.role==='oste')lines.push('Qui al bancone sento di tutto. Ma di solito fingo di non aver sentito.');
  if(n.role==='bibliotecario'||n.role==='archivista')lines.push('Se cerca documenti, il terminale è lì. Basta sapere cosa cercare: un nome, un luogo, un anno.');
  if(n.role==='parroco')lines.push('Il paese ha le sue storie. Alcune si raccontano a bassa voce.');
  const GIFT={parroco:['panel',1,'Ti regala delle coperte pesanti per la tua stanza: «Il silenzio, figliolo, si costruisce.»'],bibliotecario:['phones',1,'Ti presta un paio di cuffie chiuse dimenticate in un cassetto della biblioteca.'],oste:['rec',1,'Ti dà un vecchio registratore portatile lasciato da un cliente: «Fanne buon uso.»'],negoziante:['mic',1,'Ti offre un microfono USB rimasto in magazzino: «Per un cliente fedele.»']};
  const gf=GIFT[n.role];
  if(gf&&trustOf(n)>=70&&G.gear[gf[0]]<gf[1]&&!G.flags['gift_'+n.id]){G.flags['gift_'+n.id]=1;G.gear[gf[0]]=gf[1];lines.push('…'+gf[2]);setTimeout(()=>{sfx.ok();toast('🎁 Nuova attrezzatura: '+GEAR[gf[0]][gf[1]].n,3400);},300);}
  const fresh=(n.rumors||[]).filter(i=>!G.items[i]);
  for(const l of lines)await say(n.name,l);
  if(fresh.length){const it=itemOf(fresh[0]);noteItem(it.id,'rumor');
    await say(n.name,'…a proposito, sapevi che si dice questo? «'+lowerFirst(it.text)+'»');
    toast('📝 Nuovo appunto (voce di paese)',2200);}
  else if(!n.statements.length&&n.role==='passante')await say(n.name,pick(Math.random,['Il tempo cambia in fretta, da queste parti.','Se vuoi sapere le cose, chiedi all\'osteria.','Al faro, dicono, di notte si sentono strane cose.']));
}
const lowerFirst=s=>s?s[0].toLowerCase()+s.slice(1):s;
async function tips(){
  await say('Zia','Se non sai da dove cominciare: parla con le persone, guarda le bacheche nei bar, cerca negli archivi della biblioteca. E ricorda: due fonti che si smentiscono… una delle due mente.');
  await say('Zia','Poi torna a casa, registra, monta la puntata e pubblicala. Il resto lo dice il pubblico.');
}
async function prologue(n){
  G.flags.intro=true;
  await say('Zia','Buongiorno, giornalista! Anche oggi il tuo podcast ha tre ascoltatori. E uno sono io.');
  await say('Zia','Ieri è arrivata una cassetta anonima, senza mittente. Dentro c\'erano tre storie che in zona nessuno racconta più volentieri.');
  for(const c of W.cases)await say('Cassetta',`«${c.title}.»`);
  const old=W.npcs[W.cases[0].O];
  await say('Zia',`Se vuoi un podcast che conti qualcosa, comincia dall'osteria del paese: ${old.name} sa tutto di tutti. Il resto del mondo è lì fuori. Io resto qui a pregare per i tuoi livelli audio.`);
  toast('📓 Premi N per il Taccuino, M per la mappa',3600);
}
async function readBook(e){
  const t=W.towns.find(t=>t.buildings.some(b=>b.id===G.where));const r=mulberry32((e.seed||1)+hashStr(G.where));
  const L=['«Storia di '+(t?t.name:'questo posto')+'»: fondata da pescatori e contadini nel '+ri(r,1500,1790)+', crebbe attorno alla piazza e al suo pozzo.','Un vecchio atlante: i nomi dei luoghi cambiano, ma i sentieri restano.','Un romanzo con la copertina strappata. Nel margine, a matita: «non fidarti delle versioni ufficiali».','Un registro di parrocchia: nascite, matrimoni, qualche dissenso scritto a margine.','Un quaderno di ricette. Una pagina è macchiata di olio e di sospetti.','Un annuario: foto in bianco e nero di una squadra di calcio e di un taglio di nastro.'];
  await say('',pick(r,L));
  if(!G.books[G.where+e.x+','+e.y]){G.books[G.where+e.x+','+e.y]=1;addXp('inv',1);}
}
async function readBoard(e){
  const key=G.where+':'+e.x+','+e.y;const t=W.towns.find(t=>t.buildings.some(b=>b.id===G.where));
  if(G.boards[key]){await say('','Gli stessi avvisi di sempre. Orari delle corriere, un gatto smarrito, un\'asta.');return;}
  G.boards[key]=1;
  // rivela un nome utile
  const pool=[];for(const c of W.cases){for(const id of c.cast){const n=W.npcs[id];if(n.townId===(t&&t.id)&&!G.topics[n.topic])pool.push(n);}}
  const pick_=pool.length?pool[0]:null;
  if(pick_){G.topics[pick_.topic]=true;await say('','Tra gli avvisi, un annuncio firmato da «'+pick_.name+'». Lo annoti tra le persone da conoscere.');toast('👤 Nuovo nome: '+pick_.name,2400);}
  else await say('','Avvisi di mercato, un volantino sbiadito e una pubblicità di un lucidatore di scarpe.');
  addXp('inv',2);
}
async function listenRadio(){
  const r=mulberry32(hashStr(W.seed+G.day+G.where));
  const rv=pick(r,W.rivals);
  await say('Radio',`«…e ora ${rv.name}, il podcast di ${rv.host}, ${fmt(G.rivals[rv.id].fans)} ascoltatori.»`);
  const pool=[];W.cases.forEach(c=>(c.rumorPool||[]).forEach(i=>{if(!G.items[i])pool.push(i);}));
  if(pool.length&&r()<.6){const it=itemOf(pick(r,pool));noteItem(it.id,'rumor');await say('Radio','…e si dice in giro che: «'+lowerFirst(it.text)+'»');toast('📝 Nuovo appunto (radio)',2200);}
}
async function examineClue(e){
  const cl=Object.values(W.clues).flat().find(c=>c.id===e.clue);if(!cl)return;
  if(G.clues[cl.id]){await say('','Hai già esaminato tutto qui.');return;}
  const it=itemOf(cl.items[0]),inv=skillLvl('inv');
  if(inv<(it.invReq||0)){await say('','C\'è qualcosa che non ti torna, ma non riesci a capire cosa. (Serve Investigazione '+it.invReq+')');return;}
  G.clues[cl.id]=1;noteItem(it.id,'clue');addXp('inv',10+it.imp*8);
  const where=W.buildings[G.where];
  await say('','Esamini con calma. '+(it.fact==='HOW'?'Sul posto trovi un dettaglio rivelatore.':it.fact==='WHEN'?'C\'è una data, chiara e inequivocabile.':'Frugando, trovi qualcosa di importante.'));
  await say('Appunto',it.text);
  toast('📝 Nuova informazione (osservazione)',2200);
}
async function recordAmbient(e){
  const a=W.ambient.find(q=>q.id===e.amb);if(!a)return;
  if(G.ambGot[a.id]){await say('','Hai già registrato qui.');return;}
  const q=Math.round(clamp(GEAR.rec[G.gear.rec].q*.8+a.q*.3+skillLvl('aud')*3,10,97));
  G.ambGot[a.id]=1;
  const clip=newClip({type:'ambiente',title:a.name,q,dur:.5,lvl:-22+ri(Math.random,-3,3),src:'campo'});
  addXp('aud',8);await say('','Alzi il registratore. Per un minuto non fiati: «'+a.name+'». Qualità: '+q+'%.');
  toast('🎧 Nuova clip ambiente',2200);
}
async function sleepFlow(){
  const c=await choose('Vuoi dormire? Passerà un giorno: le persone si riposeranno, gli ascolti cresceranno e arriveranno i commenti.',[{t:'🛌 Dormi'},{t:'Non ancora'}]);
  if(c!==0)return;
  const oldFans=G.fans,oldMoney=G.money;
  busy++;fadeDir=1;fadeCb=()=>{sleep();placePlayer(P.x,P.y,P.dir);};
  await new Promise(r=>setTimeout(r,900));busy=Math.max(0,busy-1);
  const newC=G.eps.filter(e=>e.newComments).length;
  await say('',`Giorno ${G.day}. Ascoltatori: ${fmt(G.fans)} (${G.fans>=oldFans?'+':''}${G.fans-oldFans}). Soldi: € ${fmt(G.money)} (${G.money>=oldMoney?'+':''}${fmt(G.money-oldMoney)}).${newC?' Ci sono nuovi commenti sul tuo host!':''}`);
  saveGame(true);
}
/* ---------- intervista ---------- */
const FACT_LBL={EVENT:'La storia',WHEN:'Quando',HOW:'Come',WITNESS:'Testimonianza',WHO:'Chi',WHY:'Perché',COVER:'Insabbiamento',AFTER:'Dopo',META:'Il filo nascosto'};
function statementAvail(n,st){const cs=W.cases[st.case];if(!cs)return false;if(!G.topics[cs.topicIds.case])return false;if(st.fact==='META'&&!G.topics.org)return false;return true;}
function gateCheck(n,st,evidId){
  const g=st.gate,t=trustOf(n);
  if(g.free)return{ok:true};
  if(g.evid){const e=evidId&&itemOf(evidId);if(e&&e.truth&&e.case===st.case&&g.evid.facts.includes(e.fact))return{ok:true,evid:true};if(t>=g.evid.trust)return{ok:true};return{ok:false,reason:'Non si fida abbastanza. Serve una prova solida (vera) o più fiducia.'};}
  if(g.trust!==undefined)return t>=g.trust?{ok:true}:{ok:false,reason:'Non si fida ancora di te.'};
  return{ok:true};
}
let IV=null;
function openInterview(n){
  IV={n,tone:'gentile',evid:'',log:''};
  G.flags['int_'+n.id]=1;
  renderInterview();delegateInterview();
}
function renderInterview(msg){
  const n=IV.n,P_=patienceOf(n),T=trustOf(n);
  const tr=TRAITS[n.trait];
  const known=G.flags['readtrait_'+n.id];
  const qs=n.statements.filter(s=>statementAvail(n,s));
  const heldEv=heldItems().filter(i=>i.truth!==undefined);
  let h=`<button class="x" data-a="close">✕</button><h2>🎙️ ${esc(n.name)}</h2><div class="sub">${esc(roleName(n)||'')} ${known?`· carattere: ${n.trait}`:''}</div>
  <div class="meters"><span>Fiducia <i><b style="width:${T}%"></b></i></span><span>Pazienza ${'●'.repeat(P_)}${'<span class="dim">○</span>'.repeat(Math.max(0,3+Math.floor(skillLvl('int')/3)-P_))}</span><span class="dim">${GEAR.rec[G.gear.rec].n}</span></div>
  <div class="tones"><b>Approccio:</b> ${['gentile','diretto','incalzante'].map(t=>`<button class="chip ${IV.tone===t?'on':''}" data-a="tone" data-t="${t}">${cap(t)}</button>`).join('')}</div>
  <div class="evid"><label>Mostra una prova:</label><select id="evSel"><option value="">— nessuna —</option>${heldEv.map(i=>`<option value="${i.id}" ${IV.evid===i.id?'selected':''}>${esc(i.text.slice(0,70))}…</option>`).join('')}</select></div>
  <div class="resp">${msg||'<span class="dim">Scegli una domanda. L\'approccio giusto dipende dal carattere della persona: osserva come reagisce.</span>'}</div>`;
  if(!qs.length)h+='<div class="sub">Non hai ancora motivo di fargli domande. Scopri di più sulle storie della regione.</div>';
  for(const st of qs){
    const have=G.items[st.item],gate=gateCheck(n,st,IV.evid);
    h+=`<button class="opt ${have?'done':''}" data-a="ask" data-st="${st.id}" ${P_<=0||have?'disabled':''}>${esc(st.q.replace('{org}',W.org))}<small>${have?'✓ già registrata':(gate.ok?(st.tough?'Domanda difficile':''):'🔒 '+gate.reason)}</small></button>`;
  }
  h+=`<div class="acts"><button class="mb gh" data-a="close">Termina l'intervista</button></div>`;
  setUI(h);
}
function delegateInterview(){
  openUI('','intervista','interview');renderInterview();
  const sel=()=>{const s=modalEl.querySelector('#evSel');if(s)s.onchange=()=>{IV.evid=s.value;renderInterview();bind();};};
  const bind=()=>{sel();delegate(async(a,d)=>{
    if(a==='close'){closeUI();return;}
    if(a==='tone'){IV.tone=d.t;renderInterview();bind();return;}
    if(a==='ask'){await doAsk(IV.n.statements.find(s=>s.id===d.st));bind();}
  });};bind();
}
async function doAsk(st){
  const n=IV.n,tone=IV.tone,tr=TRAITS[n.trait],it=itemOf(st.item);
  G.patience[n.id]=patienceOf(n)-1;
  const gate=gateCheck(n,st,IV.evid);
  let p=.48+(st.gate.free?.2:0)+.045*skillLvl('int')+.035*skillLvl('car')+(trustOf(n)-50)/180+(st.tough?-.17:0);
  let toneTxt='';
  if(tone===tr.likes){p+=.18;toneTxt='L\'approccio gli piace.';G.flags['readtrait_'+n.id]=G.flags['readtrait_'+n.id]||false;}
  else if(tone===tr.hates){p-=.22;toneTxt='L\'approccio lo irrita.';}
  if(tone==='incalzante'&&gate.evid)p+=.12;
  G.stats.interviews++;
  let msg='';
  if(!gate.ok){
    G.trust[n.id]=clamp(trustOf(n)-3,0,100);
    msg=`<b>${esc(n.name)}:</b> «${pick(Math.random,['Non ne parlo.','Non è il momento.','Perché dovrei dirle una cosa del genere?'])}» <span class="dim">${gate.reason}</span>`;
  }else if(Math.random()<clamp(p,.06,.97)){
    // successo: clip registrata
    const q=fieldQuality(G.where);
    const clip=newClip({type:'voce',title:n.name+': '+(FACT_LBL[st.fact]||''),item:it.id,who:n.name,q,dur:it.dur,src:'intervista'});
    noteItem(it.id,'npc',{clip:clip.id});G.items[it.id].clip=clip.id;
    G.trust[n.id]=clamp(trustOf(n)+5+(tone===tr.likes?3:0),0,100);
    addXp('int',10+it.imp*8);addXp('car',3);addXp('aud',3);
    const text=(it.tq?it.tq:lowerFirst(it.text));
    msg=`<b>${esc(n.name)}:</b> «${esc(tr.pre)}${esc(text)}»<br><span class="good">🎙️ Clip registrata · qualità ${q}%</span> ${toneTxt?`<span class="dim">${toneTxt}</span>`:''}${gate.evid?'<span class="good"> La prova l\'ha convinto/a.</span>':''}`;
    toast('🎙️ Nuova clip + appunto',2000);sfx.clip();
    if(!G.flags['readtrait_'+n.id]&&Math.random()<.6)G.flags['readtrait_'+n.id]=true;
  }else{
    G.trust[n.id]=clamp(trustOf(n)-5,0,100);
    msg=`<b>${esc(n.name)}:</b> «${pick(Math.random,['Non mi va di parlarne, adesso.','Meglio cambiare argomento.','Mi dispiace, oggi non ho voglia di ricordare.'])}» <span class="dim">${toneTxt||'Non si è aperto/a. Prova con un approccio diverso o più tardi.'}</span>`;
    addXp('int',2);
  }
  renderInterview(msg);
  if(patienceOf(n)<=0)setTimeout(()=>{const r=modalEl.querySelector('.resp');if(r)r.innerHTML+='<br><span class="dim">È stanco/a di domande per oggi. Torna domani.</span>';},50);
}
/* ---------- archivio ---------- */
let ARC={topic:null};
function openArchive(){
  const bid=G.where,b=W.buildings[bid],town=W.towns.find(t=>t.id===b.town);
  ARC={town,topic:null};openUI('','archive');renderArchive();delegate(archAct);
}
function archAct(a,d){
  if(a==='close'){closeUI();return;}
  if(a==='topic'){ARC.topic=d.t;renderArchive();return;}
  if(a==='read'){const it=itemOf(d.i);if(skillLvl('inv')<it.invReq){toast('Serve Investigazione '+it.invReq);return;}if(noteItem(it.id,'archive')){addXp('inv',8+it.imp*8);toast('📝 Documento aggiunto al taccuino',2200);}renderArchive();}
}
function renderArchive(){
  const topics=Object.keys(G.topics).filter(t=>G.topics[t]&&topicName(t)&&!topicName(t).startsWith('p_')&&t!=='org'||(t==='org'&&G.topics.org)).filter(t=>G.topics[t]);
  let h=`<button class="x" data-a="close">✕</button><h2>📁 Archivio · ${esc(ARC.town.name)}</h2><div class="sub">Cerca per nome, luogo o anno che conosci. Gli archivi di altri paesi conservano altri documenti.</div><div class="chips">`;
  if(!topics.length)h+='<span class="dim">Non conosci ancora nomi, luoghi o anni da cercare.</span>';
  for(const t of topics)h+=`<button class="chip ${ARC.topic===t?'on':''}" data-a="topic" data-t="${t}">${esc(topicName(t))}</button>`;
  h+='</div>';
  if(ARC.topic){
    const res=Object.values(W.items).filter(i=>i.where&&i.where.kind==='archive'&&(i.keys||[]).includes(ARC.topic));
    h+=`<h3>Risultati per «${esc(topicName(ARC.topic))}»</h3>`;
    if(!res.length)h+='<div class="sub">Nessun documento.</div>';
    for(const it of res){
      const here=it.where.town===ARC.town.id,held=!!G.items[it.id],ok=skillLvl('inv')>=it.invReq;
      if(held)h+=`<div class="card held"><div class="ct">${iconSrc[it.src.type]||'📄'} ${esc(it.src.name)}</div><div>${esc(it.text)}</div><div class="dim">Già nel taccuino</div></div>`;
      else if(here)h+=`<div class="card"><div class="ct">${iconSrc[it.src.type]||'📄'} ${esc(it.src.name)}</div>${ok?`<button class="mb" data-a="read" data-i="${it.id}">Leggi e annota</button>`:`<div class="dim">Documento complesso: serve Investigazione ${it.invReq}.</div>`}</div>`;
      else{const t2=W.towns.find(t=>t.id===it.where.town);h+=`<div class="card"><div class="ct">${iconSrc[it.src.type]||'📄'} ${esc(it.src.name)}</div><div class="dim">Conservato presso la biblioteca di ${esc(t2.name)}.</div></div>`;}
    }
  }
  setUI(h);
}
/* ---------- taccuino ---------- */
let NB={tab:'obiettivi',case:0};
function openNotebook(tab){NB.tab=tab||NB.tab;if(!uiKind)openUI('','nb','nb');renderNotebook();delegate(nbAct);}
function nbAct(a,d){
  if(a==='close'){closeUI();return;}
  if(a==='tab'){NB.tab=d.t;renderNotebook();}else if(a==='case'){NB.case=+d.c;renderNotebook();}
}
function itemCard(it){
  const hasClip=G.items[it.id].clip,cor=corrob(it),conf=conflicts(it);
  const st=clamp(it.stars+(((hashStr(it.id)%3)-1)),1,5);
  return `<div class="card ${conf.length?'conf':''}"><div class="ct">${iconSrc[it.src.type]||'📄'} ${esc(it.src.name)} <span class="stars">${stars(st)}</span></div><div class="tx">${esc(it.text)}</div>
   <div class="meta">${hasClip?'🎙️ clip registrata':'📝 solo appunto'} · ${cor>0?`<span class="good">confermata da ${cor} font${cor>1?'i indipendenti':'e indipendente'}</span>`:'<span class="dim">nessuna conferma</span>'}${conf.length?` · <span class="bad">⚡ contraddetta da ${conf.length} informazion${conf.length>1?'i':'e'}</span>`:''}</div></div>`;
}
function renderNotebook(){
  const tabs=[['obiettivi','🎯 Cosa fare'],['appunti','📝 Appunti'],['bacheca','📌 Bacheca'],['persone','👤 Persone'],['clip','🎧 Clip']];
  let h=`<button class="x" data-a="close">✕</button><div class="tabs">${tabs.map(t=>`<button class="tab ${NB.tab===t[0]?'on':''}" data-a="tab" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>`;
  const caseTabs=`<div class="chips">${W.cases.map((c,i)=>G.topics[c.topicIds.case]?`<button class="chip ${NB.case===i?'on':''}" data-a="case" data-c="${i}">${esc(c.title)}</button>`:'').join('')}</div>`;
  if(NB.tab==='obiettivi'){
    const held=heldItems(),noclip=held.filter(i=>!G.items[i.id].clip).length;
    const hints=[];
    if(!G.flags.intro)hints.push('Entra in casa e parla con tua zia.');
    if(held.length<4)hints.push('Esplora i paesi, parla con le persone e intervistale (E davanti a loro → "Intervistarlo"). L\'osteria è un buon posto.');
    const hubTown=W.towns[0];const unseen=W.towns.filter(t=>!G.seenTowns[t.id]).length;
    if(unseen&&held.length>=2)hints.push(`Ci sono ${unseen} paesi che non hai ancora visitato: segui le strade fuori dal paese.`);
    if(noclip>0)hints.push(`Hai ${noclip} appunt${noclip>1?'i':'o'} da registrare: usa il microfono nello studio per narrarli e farli diventare clip.`);
    if(G.clips.length>=3&&!G.eps.length)hints.push('Hai abbastanza materiale: al computer dello studio apri il Montaggio e costruisci la tua prima puntata.');
    if(G.eps.some(e=>e.newComments))hints.push('Hai nuovi commenti sull\'host: leggili, contengono piste da seguire.');
    if(G.eps.length&&!G.eps.some(e=>e.commentDay<=G.day))hints.push('Dormi nel tuo letto per far passare il giorno e ricevere gli ascolti e i commenti.');
    if(G.money>=150&&G.gear.mic===0)hints.push('Hai dei soldi: all\'Elettro-Mix puoi comprare un microfono migliore.');
    const confl=heldItems().filter(i=>conflicts(i).length).length;
    if(confl)hints.push('Hai informazioni che si contraddicono: nella Bacheca confrontale. Le fonti indipendenti che concordano sono più affidabili di una sola fonte, anche se "ufficiale".');
    for(const c of W.cases){if(!G.topics[c.topicIds.case])continue;const have=new Set(c.items.filter(i=>G.items[i]).map(i=>itemOf(i).fact));const miss=['WHO','WHY','COVER'].filter(f=>!have.has(f));if(have.size>=3&&miss.length)hints.push(`«${c.title}»: non sai ancora ${miss.map(f=>({WHO:'chi',WHY:'perché',COVER:'chi ha coperto'}[f])).join(', ')}.`);}
    if(finalAvailable())hints.push('Hai gli indizi per la puntata finale: al montaggio compare la scheda «La Verità».');
    if(!hints.length)hints.push('Continua a indagare: ogni persona, luogo e documento può nascondere un pezzo di storia.');
    h+='<div class="sub">Suggerimenti in base a ciò che hai fatto finora.</div>'+hints.map(t=>`<div class="card">${t}</div>`).join('');
    h+=`<h3>Le tre storie</h3>`+W.cases.map(c=>{const n=new Set(c.items.filter(i=>G.items[i]).map(i=>itemOf(i).fact)).size;return `<div class="card"><div class="ct">${esc(c.title)}</div><div class="meta">${n} fatti su 9 raccolti${G.seenTowns[c.town]?' · luogo: '+esc(W.towns.find(t=>t.id===c.town).name):' · luogo ancora sconosciuto'}</div><div class="bar"><i style="width:${n/9*100}%"></i></div></div>`;}).join('');
  }else if(NB.tab==='appunti'||NB.tab==='bacheca'){
    h+=caseTabs;const cs=W.cases[NB.case];
    if(!G.topics[cs.topicIds.case]){h+='<div class="sub">Nessuna storia selezionata.</div>';}
    else if(NB.tab==='appunti'){
      const mine=cs.items.filter(i=>G.items[i]).map(i=>itemOf(i));
      h+=`<div class="sub">${mine.length} informazioni raccolte su «${esc(cs.title)}». Le stelle indicano quanto la fonte sembra affidabile, non quanto sia vera.</div>`;
      for(const f of FACTS){const arr=mine.filter(i=>i.fact===f);if(!arr.length)continue;h+=`<h3>${FACT_LBL[f]}</h3>`+arr.map(itemCard).join('');}
      if(!mine.length)h+='<div class="sub">Ancora niente. Parla con le persone, esamina i luoghi, consulta gli archivi.</div>';
    }else{
      h+=`<div class="sub">Il caso, un fatto per volta. ⚡ = versioni in conflitto: capire quale è vera è il tuo lavoro.</div><div class="board">`;
      for(const f of FACTS){
        const arr=cs.items.filter(i=>G.items[i]).map(i=>itemOf(i)).filter(i=>i.fact===f);
        const variants={};arr.forEach(i=>{(variants[i.variant]=variants[i.variant]||[]).push(i);});
        const nv=Object.keys(variants).length;
        h+=`<div class="brow ${nv>1?'conf':''}"><div class="bf">${FACT_LBL[f]} ${nv>1?'⚡':''}</div><div class="bv">`;
        if(!nv)h+='<span class="dim">? da scoprire</span>';
        for(const v in variants){const its=variants[v],org=new Set(its.map(i=>i.origin));h+=`<div class="var"><div>${esc(its[0].text)}</div><div class="meta">${its.length} informazion${its.length>1?'i':'e'} · ${org.size} font${org.size>1?'i originali diverse':'e originale'}${its.some(i=>G.items[i.id].clip)?' · 🎙️':''}</div></div>`;}
        h+='</div></div>';
      }
      h+='</div>';
    }
  }else if(NB.tab==='persone'){
    const ts=Object.keys(G.topics).filter(t=>G.topics[t]&&t.startsWith('p_'));
    h+='<div class="sub">Le persone di cui hai sentito parlare o che hai incontrato.</div>';
    const known=new Set(ts);Object.values(W.npcs).forEach(n=>{if(G.flags['met_'+n.id])known.add(n.topic);});
    for(const t of known){const n=W.npcs['n'+t.slice(3)]||W.npcs[t.slice(2)];if(!n)continue;const town=W.towns.find(x=>x.id===n.townId);
      h+=`<div class="card"><div class="ct">${esc(n.name)} <span class="dim">${esc(roleName(n)||'')}</span></div><div class="meta">${G.flags['met_'+n.id]?`Incontrato · fiducia ${trustOf(n)}%`:'Sai solo il nome'}${G.seenTowns[n.townId]?' · vive a '+esc(town.name):''}${G.flags['readtrait_'+n.id]?' · carattere: '+n.trait:''}</div></div>`;}
    if(!known.size)h+='<div class="sub">Nessuna persona per ora.</div>';
  }else{
    h+=`<div class="sub">Il tuo archivio audio: ${G.clips.length} clip. La qualità dipende da attrezzatura, luogo e competenza.</div>`;
    for(const c of G.clips)h+=`<div class="card"><div class="ct">${c.type==='voce'?'🗣️':c.type==='narr'?'📖':c.type==='ambiente'?'🌊':'🎵'} ${esc(c.title)}</div><div class="meta">qualità ${c.q}% · ${(c.dur).toFixed(1)} min · livello ${c.lvl} dB</div></div>`;
    if(!G.clips.length)h+='<div class="sub">Nessuna clip. Intervista qualcuno o registra una narrazione dal microfono dello studio.</div>';
  }
  setUI(h);
}
/* ---------- mappa ---------- */
function openMapUI(){
  if(busy)return;
  let h=`<button class="x" data-a="close">✕</button><h2>🗺️ Mappa di ${esc(W.name)}</h2><canvas id="mapc" width="${MW*5}" height="${MH*5}" style="width:100%;border-radius:12px;image-rendering:pixelated;background:#101624"></canvas><div class="sub">Sei qui: ◉. I paesi non ancora visitati sono sconosciuti.</div>`;
  openUI(h,'map','wide');delegate(a=>{if(a==='close')closeUI();});
  const c=$('#mapc').getContext('2d'),S=5,col={0:'#5d9c4b',1:'#6ab05a',2:'#cfae72',3:'#3f7fc0',4:'#ecd9a0',5:'#2f7a3a',6:'#8a8f98',7:'#8b6a43',8:'#3d8a44'};
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=W.map.tiles[y*MW+x];const seen=W.towns.some(tt=>G.seenTowns[tt.id]&&x>=tt.x-2&&x<tt.x+tt.w+2&&y>=tt.y-2&&y<tt.y+tt.h+2);
    c.fillStyle=t>=10&&t<=18?(seen?'#b5523b':'#6a5a58'):(t===TL.PATH?col[2]:col[t]||'#5d9c4b');c.fillRect(x*S,y*S,S,S);if(!seen&&t!==TL.WATER&&t!==TL.SAND&&t!==TL.PATH){c.fillStyle='rgba(8,10,20,.35)';c.fillRect(x*S,y*S,S,S);}}
  c.font='bold 13px system-ui';c.textAlign='center';
  for(const t of W.towns){const x=(t.x+t.w/2)*S,y=(t.y-1)*S;c.fillStyle='rgba(8,10,20,.85)';const lab=G.seenTowns[t.id]?t.name:'???';c.fillRect(x-c.measureText(lab).width/2-4,y-12,c.measureText(lab).width+8,16);c.fillStyle='#ffd23d';c.fillText(lab,x,y);}
  if(G.where==='out'){c.fillStyle='#ff4d6a';c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc((P.x+.5)*S,(P.y+.5)*S,5,0,TAU);c.fill();c.stroke();}
}
/* ---------- negozio ---------- */
function openShop(){
  renderShop();delegate((a,d)=>{
    if(a==='close'){closeUI();return;}
    if(a==='buy'){const o=W.shop[+d.i];if(G.money<o.price){toast('Soldi insufficienti');return;}
      if(o.kind==='gear'){if(G.gear[o.slot]>=o.tier){toast('Hai già qualcosa di meglio');return;}G.gear[o.slot]=o.tier;}else if(o.kind==='music'){if(G.music.includes(o.id))return;G.music.push(o.id);}else{if(G.sfx.includes(o.id))return;G.sfx.push(o.id);}
      G.money-=o.price;sfx.coin();toast('Acquistato!',1800);renderShop();hudNow();}
  });
}
function renderShop(){
  if(!uiKind)openUI('','shop','shop');
  let h=`<button class="x" data-a="close">✕</button><h2>🛒 Elettro-Mix</h2><div class="sub">Hai € ${fmt(G.money)}. Ogni pezzo cambia davvero il tuo lavoro: qualità, tracce, rumore.</div>`;
  const item=(o,i)=>{
    let name,desc,own=false;
    if(o.kind==='gear'){const g=GEAR[o.slot][o.tier];name=GEAR_LBL[o.slot]+': '+g.n;desc=g.d;own=G.gear[o.slot]>=o.tier;if(G.gear[o.slot]<o.tier-1)desc='(serve prima il livello precedente) '+desc;}
    else if(o.kind==='music'){const m=MUSIC.find(x=>x.id===o.id);name='🎵 '+m.n;desc='Musica · '+m.mood;own=G.music.includes(o.id);}
    else{const s=SFX.find(x=>x.id===o.id);name='🔊 '+s.n;desc='Effetto sonoro';own=G.sfx.includes(o.id);}
    const lock=o.kind==='gear'&&G.gear[o.slot]<o.tier-1;
    return `<div class="row"><div><div class="t">${esc(name)}</div><div class="dim">${esc(desc)}</div></div><div class="pr">€ ${fmt(o.price)}</div><button class="mb" data-a="buy" data-i="${i}" ${own||lock||G.money<o.price?'disabled':''}>${own?'Già tuo':'Compra'}</button></div>`;};
  h+='<h3>Attrezzatura</h3>'+W.shop.map((o,i)=>o.kind==='gear'?item(o,i):'').join('')+'<h3>Musica ed effetti</h3>'+W.shop.map((o,i)=>o.kind!=='gear'?item(o,i):'').join('');
  setUI(h);
}
function openGearView(){
  let h=`<button class="x" data-a="close">✕</button><h2>🎛️ Il tuo studio</h2><div class="sub">Qualità in studio: ${Math.round(studioQuality())}%</div>`;
  for(const k of GEAR_KEYS){const g=GEAR[k][G.gear[k]];h+=`<div class="row"><div><div class="t">${GEAR_LBL[k]}: ${esc(g.n)}</div><div class="dim">${esc(g.d||'')}</div></div></div>`;}
  openUI(h,'gear');delegate(a=>{if(a==='close')closeUI();});
}
/* ---------- menu e competenze ---------- */
function openMenu(){
  if(busy||uiKind)return;
  let h=`<button class="x" data-a="close">✕</button><h2>Menu</h2><div class="kv"><div>Giorno<b>${G.day}</b></div><div>Soldi<b>€ ${fmt(G.money)}</b></div><div>Ascoltatori<b>${fmt(G.fans)}</b></div><div>Puntate<b>${G.eps.length}</b></div></div>
  <h3>Competenze</h3>${SKILLS.map(s=>{const l=skillLvl(s.id),xp=G.xp[s.id]||0,a=skXpTot(l),b=skXpTot(l+1);return `<div class="row"><div><div class="t">${s.ic} ${s.n} <span class="lv">Lv ${l}</span></div><div class="dim">${s.d}</div><div class="bar"><i style="width:${l>=10?100:Math.round((xp-a)/(b-a)*100)}%"></i></div></div></div>`;}).join('')}
  <div class="acts"><button class="mb" data-a="nb">📓 Taccuino</button><button class="mb" data-a="map">🗺️ Mappa</button><button class="mb gh" data-a="gear">🎛️ Studio</button><button class="mb gh" data-a="help">❓ Guida</button><button class="mb gh" data-a="save">💾 Salva</button><button class="mb gh" data-a="quit">Esci al titolo</button></div>`;
  openUI(h,'menu');delegate((a)=>{
    if(a==='close')closeUI();else if(a==='save'){saveGame();}
    else if(a==='help'){closeUI();openHelp();}
    else if(a==='nb'){closeUI();openNotebook();}else if(a==='map'){closeUI();openMapUI();}else if(a==='gear'){closeUI();openGearView();}
    else if(a==='quit'){saveGame(true);location.reload();}
  });
}
function hudNow(){updateHud();}
function updateHud(){
  if(!G)return;
  $('#hDay').textContent='Giorno '+G.day;$('#hMoney').textContent='€ '+fmt(G.money);$('#hFans').textContent=fmt(G.fans);
  const t=G.where==='out'?(W.towns.find(t=>t.id===G.curTown&&P.x>=t.x&&P.x<t.x+t.w&&P.y>=t.y&&P.y<t.y+t.h)||{name:'In campagna'}).name:W.buildings[G.where].name;$('#hPlace').textContent=t;
}

function openHelp(){
  openUI(`<button class="x" data-a="close">✕</button><h2>❓ Come si gioca</h2>
  <h3>Il ciclo</h3><div class="card">Esplora → trova informazioni → confrontale → intervista persone → registra → monta la puntata → pubblica → leggi i commenti → indaga ancora.</div>
  <h3>Trovare informazioni</h3><div class="card">• <b>Persone</b>: premi E davanti a loro. «Fare due chiacchiere» dà voci e fiducia; «Intervistarlo» registra una clip (scegli l'approccio giusto per il carattere).<br>• <b>Prove</b>: esamina gli oggetti negli edifici dei misteri (serve Investigazione).<br>• <b>Archivi</b>: il terminale della biblioteca cerca per nome, luogo o anno che già conosci.<br>• <b>Bacheche</b> e <b>radio</b> dei bar: nomi e voci.</div>
  <h3>Vero o falso?</h3><div class="card">Nessuno ti dice cosa è vero. Se due informazioni si contraddicono (⚡), conta quante <b>fonti originali indipendenti</b> dicono la stessa cosa: una sola fonte "ufficiale" può mentire. Se una persona non si fida, mostrale una prova vera.</div>
  <h3>Lo studio</h3><div class="card">• <b>Microfono</b>: trasforma un appunto in una clip narrata, o registra introduzione e conclusione.<br>• <b>Computer</b>: Montaggio (ordine, volumi, musica) e Host (pubblica, classifiche, commenti).<br>• <b>Letto</b>: passa il giorno; arrivano ascolti e commenti.<br>• Compra attrezzatura all'<b>Elettro-Mix</b>: qualità, tracce, rumore.</div>
  <h3>Una buona puntata</h3><div class="card">Una storia sola · un gancio all'inizio · contesto → indizi → svolta → conclusione · volumi omogenei attorno a −16 dB · niente fonti dubbie spacciate per vere. I commenti ti diranno dove hai sbagliato.</div>`,'help');
  delegate(a=>{if(a==='close')closeUI();});
}
