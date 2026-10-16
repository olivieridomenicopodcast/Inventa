'use strict';
/* RIMINI 3 GIORNI · Match Mode: profili da scorrere (swipe) come nella Rete dell'app dell'evento.
   Mi piace a un profilo che a sua volta ti ha messo mi piace = match = nuovo contatto. Tutto seminato: stesso seme, stessi profili. */
const MM_SECTORS=['Tecnologia, software e telecomunicazioni','Moda e retail','Food & beverage','Turismo e ospitalità','Editoria e media','Formazione e coaching','Sport e benessere','Immobiliare','Servizi finanziari','Manifattura e design','Salute e cura della persona','Musica e intrattenimento'];
const MM_WORK={creator:'Freelance / Creator indipendente',design:'Freelance / Studio creativo',social:'Dipendente / Agenzia di comunicazione',perf:'Dipendente / Agenzia performance',tech:'Freelance / Consulente / Libero professionista',strat:'Dipendente / Marketing manager',biz:'Imprenditore / Titolare',edu:'Coach / Formatore / Consulente'};
const MM_CO=['Studio','Lab','Media','Consulting','Digital','Factory','Collective','Partners','Agency'];
const MM_OPEN=['Disponibile a collaborare su progetti','Cerco nuove collaborazioni','Aperto a partnership creative','Disponibile per consulenze','Cerco un socio con cui crescere','Offro mentoring a chi comincia'];
const MM_SEEK=['Cerca: un\'idea da fare insieme','Cerca: clienti curiosi','Cerca: una persona con cui confrontarsi','Cerca: un progetto a lungo termine','Cerca: un buon caffè e un buon contatto'];
const MM_BIO={
 creator:['Ho prodotto più di {n} contenuti tra podcast, video e newsletter. Il segreto? Una cosa sola per volta, ma fatta bene.','Racconto storie per chi non ha tempo per annoiarsi: {n} progetti editoriali all\'attivo e nessuna intenzione di fermarmi.','Aiuto professionisti a trovare la loro voce. Ho dato un microfono a più di {n} persone e nessuna si è pentita.'],
 design:['Disegno marchi che si ricordano: {n} brand lanciati, un solo criterio: se non si riconosce in tre secondi, si rifà.','Tra layout e palette ho aiutato {n} aziende a smettere di sembrare tutte uguali.','Credo che il design sia il marketing che non urla. {n} progetti e un cassetto di bozzetti.'],
 social:['Ho gestito community da {n} mila persone senza perdere la pazienza (quasi mai).','Trasformo post in conversazioni: {n} profili avviati da zero, tutti con almeno un commento sincero.','Il mio lavoro è far parlare le persone di ciò che ti rende interessante. Finora {n} brand ringraziano.'],
 perf:['Ho gestito più di {n} milioni di euro di budget advertising. Se non lo misuri, per me non esiste.','Ottimizzo funnel e campagne: {n} test A/B in agenda e una fede incrollabile nei dati.','Cerco il punto in cui un euro speso ne rende tre. Ne ho trovati {n}.'],
 tech:['Ho aiutato più di {n} aziende a portare l\'AI nei loro flussi di lavoro, senza trucchi e senza paroloni.','Automatizzo ciò che ruba tempo: {n} processi snelliti, e un\'ossessione per i prompt fatti bene.','Sviluppo strumenti che parlano la lingua del marketing. {n} progetti in produzione e nessun bug (che io sappia).'],
 strat:['Ho guidato {n} lanci di prodotto con un solo obiettivo: far dire «finalmente» ai clienti.','Metto in fila strategia, budget e persone: {n} piani di marketing e un taccuino pieno di frecce.','Dalla visione al calendario: {n} brand che oggi sanno cosa dire e a chi.'],
 biz:['Ho fondato {n} attività, ne ho chiuse alcune e imparato da tutte. Oggi cerco chi vuole crescere sul serio.','Vendo cose che le persone vogliono comprare: {n} clienti e una regola, mai promettere ciò che non si può mantenere.','Costruisco aziende piccole con ambizioni grandi: {n} anni di mestiere e di errori utili.'],
 edu:['Ho accompagnato più di {n} persone a cambiare mestiere o mindset. Domanda potente: cosa vuoi davvero?','Formo team e freelance: {n} corsi, un solo metodo, tanta pratica.','Aiuto a trasformare passioni in lavoro. {n} percorsi completati e qualche lacrima di gioia.']};
const MM_FAMS=['creator','design','social','perf','tech','strat','biz','edu'];
const MM_TOPIC_FAM={pod:'creator',vid:'creator',cop:'creator',ai:'tech',brand:'social',soc:'social',sale:'biz',eco:'biz',mind:'edu',free:'biz'};
function mmDeck(){
  if(G._mm&&G._mmSeed===G.seed)return G._mm;
  const me=ME(),out=[],used=new Set(),selfName=(typeof PLAYER!=='undefined'&&PLAYER.name)||'';
  const add=o=>{if(!o.name||used.has(o.name)||o.name===selfName)return;used.add(o.name);
    const r=mulberry32(hashStr(G.seed+'|mm|'+o.name));
    if(!o.fam||!MM_FAMS.includes(o.fam))o.fam=MM_FAMS[Math.floor(r()*MM_FAMS.length)];
    const a=aff(me.fam,o.fam);let tr=[];try{tr=jobTraits(o.job||'')||[];}catch(e){}
    o.compat=Math.max(48,Math.min(98,Math.round(44+46*a+tr.filter(t=>(me.traits||[]).includes(t)).length*3+r()*7)));
    o.id='m'+hashStr(o.name);o.r=r;
    const pLike={att:.1+(o.compat-48)/50*.32,friend:.75,family:.3,speaker:.35}[o.kind];
    o.likesMe=r()<pLike;o.at=Math.floor(r()*r()*3*1440);
    o.co=o.co||(o.name.split(' ').slice(-1)[0]+' '+MM_CO[Math.floor(r()*MM_CO.length)]);
    o.open=MM_OPEN[Math.floor(r()*MM_OPEN.length)];o.seek=MM_SEEK[Math.floor(r()*MM_SEEK.length)];
    o.sector=MM_SECTORS[Math.floor(r()*MM_SECTORS.length)];
    if(!o.bio){const T=MM_BIO[o.fam];o.bio=T[Math.floor(r()*T.length)].replace('{n}',String(12+Math.floor(r()*r()*90)));}
    out.push(o);};
  NPC.filter(n=>n.kind==='att'&&!n.friend).forEach(n=>add({name:n.name,job:n.job||(n.role||'').split(' · ')[0],fam:n.fam,city:(n.role||'').split(' · ')[1]||pickFrom(ATT_CITY),p:n.p,gender:n.gender,kind:'att'}));
  NPC.filter(n=>n.friend&&n.friend!=='dom').forEach(n=>add({name:n.name,job:n.job,fam:n.fam,city:'Rimini',p:n.p,gender:n.gender,kind:'friend',co:'Gruppo BMU',bio:'Faccio parte del gruppo del Bar Marketers Unofficial. Cerco chi ha voglia di un buon caffè e di una buona idea.'}));
  NPC.filter(n=>n.kind==='family').forEach(n=>add({name:n.name,job:n.role,fam:'strat',city:'Rimini',p:n.p,gender:n.gender||genderOf(n.name),kind:'family',co:'Marketers',bio:(n.data&&n.data.facts&&n.data.facts[0])||'Fa parte della Marketers Family.'}));
  [...TALKS,...WORKSHOPS].forEach(t=>add({name:t.speaker,job:t.role,fam:MM_TOPIC_FAM[t.topic],city:'Relatore',p:Object.assign({pants:'#232a44',badge:'#ffd24d'},t.pal),gender:genderOf(t.speaker),kind:'speaker',co:'Speaker del Marketers World',bio:'Sul palco con «'+t.title+'». Dopo lo speech mi trovate in sala a parlare con chiunque abbia una domanda.'}));
  out.forEach(o=>{o.ord=o.compat+(o.r()-.5)*12;});out.sort((a,b)=>b.ord-a.ord);
  G._mmSeed=G.seed;return G._mm=out;
}
const mmState=()=>G.mm||(G.mm={s:{},m:{}});
const mmFind=id=>mmDeck().find(c=>c.id===id);
function mmMatchCount(){return Object.keys(mmState().m).length;}
let mmHide=true,mmFlash=null,mmLastMin=-1;
function mmPortrait(p){
  const key=JSON.stringify(p),C=mmPortrait.c||(mmPortrait.c={});if(C[key])return C[key];
  const c=document.createElement('canvas');c.width=96;c.height=64;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  const g=x.createLinearGradient(0,0,0,64);g.addColorStop(0,'#2b4a86');g.addColorStop(.62,'#3a2f6b');g.addColorStop(1,'#1b2240');x.fillStyle=g;x.fillRect(0,0,96,64);
  x.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<5;i++)x.fillRect(8+i*19,0,9,64);
  x.fillStyle='#2a3566';x.fillRect(0,52,96,12);
  x.save();x.scale(2.5,2.5);person(x,19,26,0,0,p);x.restore();
  return C[key]=c.toDataURL();
}
function mmMatch(c,quiet){
  const S=mmState();if(S.m[c.id])return;S.m[c.id]=cmT();mmFlash=c.name;
  addContact({name:c.name,role:c.job+(c.city&&c.city!=='Relatore'?' · '+c.city:''),kind:'match',fam:c.fam,p:c.p,gender:c.gender});
  G.flags.match=(G.flags.match||0)+1;
  if(!quiet){toast('È un match con '+c.name+'! Ora è tra i tuoi contatti.',3600);if(A.fanfare)A.fanfare();}
}
function mmSwipe(c,dir){
  const S=mmState();S.s[c.id]=dir;
  if(dir>0){if(c.likesMe&&c.at<=cmT())mmMatch(c);else{toast('Hai messo mi piace a '+c.name+'. Se ricambia, ti avviso.',2600);A.blip&&A.blip();}}
  else{A.tone&&A.tone(220,.08,'triangle',.05);}
}
/* ogni minuto di gioco: chi ti aveva già messo mi piace può ricambiare quando "vede" il tuo profilo */
function matchTick(){
  if(!G||G.done)return;const m=Math.floor(G.min)+G.day*1440;if(m===mmLastMin)return;mmLastMin=m;
  const S=mmState();for(const id in S.s){if(S.s[id]>0&&!S.m[id]){const c=mmFind(id);if(c&&c.likesMe&&c.at<=cmT())mmMatch(c);}}
}
function matchHtml(){
  const D=mmDeck(),S=mmState(),T=cmT();
  const seen=D.filter(c=>c.at<=T),got=seen.filter(c=>c.likesMe).length,miss=seen.length-got;
  const skipped=D.filter(c=>S.s[c.id]<0).length;
  const left=D.filter(c=>S.s[c.id]===undefined||(!mmHide&&S.s[c.id]<0));
  let h='';
  if(mmFlash){h+=`<div class="mmflash">È un match con <b>${esc(mmFlash)}</b>! L’abbiamo aggiunto ai tuoi contatti.</div>`;mmFlash=null;}
  h+=`<div class="mmh"><span>MATCH MODE</span><label class="mmtg">NASCONDI SALTATI · ${skipped}<input type="checkbox" id="mmhide" ${mmHide?'checked':''}><i></i></label></div>`;
  h+=`<div class="mmst"><span>♥ ${got} ti hanno messo mi piace</span><span>✕ ${miss} ti hanno scartato</span><span>💘 ${mmMatchCount()} match</span></div>`;
  const c=left[0];
  if(!c){h+=`<div class="note">Hai visto tutti i profili per ora. ${skipped&&mmHide?'Togli «Nascondi saltati» per riconsiderare chi hai scartato.':'Altri potrebbero ancora mettere mi piace al tuo profilo: ricontrolla più tardi.'}</div>`;return h;}
  const top=c.compat>=85;
  h+=`<div class="mmcard" id="mmcard" data-id="${c.id}"><div class="mmph"><img src="${mmPortrait(c.p)}" alt=""><div class="mmst1" id="mmY">COLLABORA</div><div class="mmst2" id="mmN">SALTA</div>
    <div class="mmbt"><button class="mmx" id="mmbN" aria-label="Salta">✕</button><button class="mmy" id="mmbY" aria-label="Mi piace">♥</button></div></div>
    <div class="mmrole"><span>${esc((c.job||'').toUpperCase())} · ${esc(c.co.toUpperCase())}</span><em>${top?'TOP MATCH':c.compat+'% COMPATIBILE'}</em></div>
    <div class="mmname">${esc(c.name)}</div><div class="mmop">${esc(c.open)}${c.likesMe&&c.at<=T?'<span class="mmlk">ti ha messo mi piace</span>':''}</div><div class="mmcity">📍 ${esc(c.city||'Rimini')}</div>
    <div class="mmsec">// IN DUE PAROLE</div><p class="mmbio">${esc(c.bio)}</p>
    <div class="mmpro"><div class="mmsec">// PROFILO</div><div>👤 ${esc(MM_WORK[c.fam]||'')}</div><div>🏢 ${esc(c.sector)}</div><div>🔎 ${esc(c.seek.replace('Cerca: ',''))}</div></div></div>
    <div class="mmleft">Profili rimasti: ${left.length}</div>`;
  return h;
}
function matchBind(B){
  const hide=B.querySelector('#mmhide');if(hide)hide.onchange=()=>{mmHide=hide.checked;renderPhone();};
  const card=B.querySelector('#mmcard');if(!card)return;
  const c=mmFind(card.dataset.id),ph=card.querySelector('.mmph');
  const go=dir=>{card.style.transition='transform .25s,opacity .25s';card.style.transform=`translateX(${dir*420}px) rotate(${dir*18}deg)`;card.style.opacity='0';setTimeout(()=>{mmSwipe(c,dir);keepPhone();},230);};
  B.querySelector('#mmbY').onclick=e=>{e.stopPropagation();go(1);};B.querySelector('#mmbN').onclick=e=>{e.stopPropagation();go(-1);};
  let sx=null,dx=0;const Y=B.querySelector('#mmY'),N=B.querySelector('#mmN');
  ph.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;sx=e.clientX;dx=0;ph.setPointerCapture(e.pointerId);card.style.transition='none';});
  ph.addEventListener('pointermove',e=>{if(sx==null)return;dx=e.clientX-sx;card.style.transform=`translateX(${dx}px) rotate(${dx/18}deg)`;Y.style.opacity=Math.max(0,Math.min(1,dx/90));N.style.opacity=Math.max(0,Math.min(1,-dx/90));});
  const end=()=>{if(sx==null)return;sx=null;if(Math.abs(dx)>90)go(dx>0?1:-1);else{card.style.transition='transform .2s';card.style.transform='';Y.style.opacity=N.style.opacity=0;}};
  ph.addEventListener('pointerup',end);ph.addEventListener('pointercancel',end);
}
