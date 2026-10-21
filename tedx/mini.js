'use strict';
/* TEDx PESARO · minigiochi: quiz, controllo biglietti, cue dei 18 minuti, corsa, voto, fumetto + convincere gli speaker */
function openMini(html,api){MINI=Object.assign({act:null,esc:null,iv:null},api||{});$('#miniB').innerHTML=html;$('#mini').classList.remove('hide');}
function closeMini(){if(MINI&&MINI.iv)clearInterval(MINI.iv);MINI=null;$('#mini').classList.add('hide');$('#miniB').innerHTML='';}
const shuffle=(a,r)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor((r||Math.random)()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

/* ---------- quiz a risposta multipla ---------- */
function quizMini(title,qs,done,opts){opts=opts||{};const list=shuffle(qs).slice(0,opts.n||qs.length);let i=0,ok=0,lock=false;
  const show=()=>{const q=list[i];openMini(`<h2>${esc(title)}</h2><div class="bar"><i style="width:${i/list.length*100}%"></i></div><p class="q">${esc(q.q)}</p>${q.o.map((o,k)=>`<button class="opt" data-k="${k}">${k+1}. ${esc(o)}</button>`).join('')}<div id="qx"></div>`,{act:null,esc:null});
    lock=false;$('#miniB').querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(lock)return;lock=true;const k=+b.dataset.k,good=k===q.a;if(good)ok++;b.classList.add(good?'ok':'bad');if(!good)$('#miniB').querySelector(`.opt[data-k="${q.a}"]`).classList.add('ok');good?A.ok():A.bad();
      $('#qx').innerHTML=(q.e?`<p style="color:var(--dim);margin:8px 0">${esc(q.e)}</p>`:'')+`<div class="row"><button class="btn" id="qn">${i+1<list.length?'Avanti':'Fine'}</button></div>`;MINI.act=()=>$('#qn').click();$('#qn').onclick=()=>{i++;if(i<list.length)show();else{closeMini();done(ok,list.length);}};});};
  show();}

/* ---------- controllo biglietti all'ingresso ---------- */
const FN=['Giulia','Marco','Chiara','Luca','Sara','Matteo','Elena','Davide','Martina','Andrea','Federica','Paolo','Sofia','Nicola','Elisa','Alberto','Francesca','Simone'],LN=['Rossi','Ferrari','Bianchi','Romano','Gallo','Conti','Marini','Greco','Bruno','Costa','Fabbri','Serra','Neri','Bellini','Galli'];
function ticketsMini(cfg,done){const r=mulberry32(hashStr('tk|'+(cfg.seed||'x')));const n=cfg.n||10,items=[];
  const BAD=['Il biglietto è per un altro evento','Il nome non è nella lista','Biglietto già scansionato alle 14:52','La data sul biglietto è sbagliata'];
  for(let i=0;i<n;i++){const bad=r()<.3;items.push({name:FN[Math.floor(r()*FN.length)]+' '+LN[Math.floor(r()*LN.length)],type:['Platea','Tribuna','Consigliere','Platea'][Math.floor(r()*4)],bad,why:BAD[Math.floor(r()*BAD.length)]});}
  let i=0,score=0,t=0,fb='',lock=false;const LIM=7;
  const render=()=>{const it=items[i];$('#miniB').innerHTML=`<h2>${esc(cfg.title||'Accoglienza')}</h2><p style="color:var(--dim)">Fai entrare chi ha il biglietto in regola, ferma chi non lo è. ${i+1}/${n} · corretti ${score}</p><div class="bar"><i id="tb" style="width:100%"></i></div><div class="tk"><small>TEDx Pesaro · ${cfg.year||''} · ${it.type}</small><b>${esc(it.name)}</b><small>${it.bad?esc(it.why):'Codice QR valido · nome in lista'}</small></div><div class="row"><button class="btn" id="tkY">1. Fai entrare</button><button class="btn ghost" id="tkN">2. Ferma e controlla</button></div><p id="tkf" style="min-height:22px;color:var(--ac2)">${esc(fb)}</p>`;
    $('#tkY').onclick=()=>pick(true);$('#tkN').onclick=()=>pick(false);};
  const pick=(enter)=>{if(lock)return;const it=items[i];const good=enter===!it.bad;if(good){score++;A.ok();fb='Giusto.';}else{A.bad();fb=it.bad?'Hai fatto entrare un biglietto non valido.':'Il biglietto era in regola: la persona aspettava.';}next();};
  const next=()=>{i++;t=0;if(i>=n){clearInterval(MINI.iv);$('#miniB').innerHTML=`<h2>Accoglienza completata</h2><p class="q">Biglietti controllati bene: ${score} su ${n}.</p><div class="row"><button class="btn" id="tkD">Continua</button></div>`;MINI.act=()=>$('#tkD').click();$('#tkD').onclick=()=>{closeMini();done(score,n);};return;}render();};
  openMini('',{act:null});render();MINI.act=null;
  const kk=e=>{if(!MINI)return removeEventListener('keydown',kk);if(e.key==='1')pick(true);else if(e.key==='2')pick(false);};addEventListener('keydown',kk);
  MINI.iv=setInterval(()=>{t+=.1;const b=$('#tb');if(b)b.style.width=Math.max(0,100-t/LIM*100)+'%';if(t>=LIM){fb='Troppa coda: la persona ha aspettato troppo.';A.bad();next();}},100);}

/* ---------- cue dei 18 minuti (stage manager) ---------- */
function cueMini(cfg,done){const DUR=20,M=[{at:15/18*DUR,t:'3 minuti',c:'#4dff9a'},{at:17/18*DUR,t:'1 minuto',c:'#ffd24d'},{at:DUR*.995,t:'STOP',c:'#ff5d5d'}];let t=0,res=[null,null,null],msg='';
  openMini(`<h2>Backstage · il timer dei 18 minuti</h2><p>${esc(cfg.intro||'Lo speaker è sul palco. Mostra i segnali nel momento giusto: a 15 minuti, a 17 e allo scadere dei 18.')}</p><canvas id="cuc" width="320" height="100" style="width:100%;image-rendering:pixelated;background:#0b0b10;border-radius:10px"></canvas><p id="cum" style="min-height:22px;color:var(--ac2)"></p><div class="row"><button class="btn" id="cuB">SEGNALE (Spazio)</button></div>`,{});
  const c=$('#cuc').getContext('2d');
  const press=()=>{if(t>DUR+1)return;let bi=-1,bd=9;M.forEach((m,i)=>{if(res[i]===null){const d=Math.abs(t-m.at);if(d<bd){bd=d;bi=i;}}});if(bi<0||bd>2.4){msg='Troppo presto o a vuoto.';A.bad();return;}const p=bd<.5?3:bd<1.1?2:1;res[bi]=p;msg=['','Un po\' in ritardo/anticipo: lo speaker se ne accorge.','Buono.','Perfetto, tempo da orologio.'][p];A.tone(500+p*150,.1,'triangle',.06);};
  $('#cuB').onclick=press;MINI.act=press;
  MINI.iv=setInterval(()=>{t+=.05;c.fillStyle='#0b0b10';c.fillRect(0,0,320,100);c.fillStyle='#2d2d40';c.fillRect(10,48,300,6);M.forEach((m,i)=>{const x=10+m.at/DUR*300;c.fillStyle=res[i]!==null?'#888':m.c;c.fillRect(x-2,38,4,26);c.fillStyle='#fff';c.font='8px '+PIX;c.textAlign='center';c.fillText(m.t,x,32);if(res[i]!==null){c.fillStyle='#fff';c.fillText('★'.repeat(res[i]),x,80);}});
    const px=10+Math.min(t,DUR)/DUR*300;c.fillStyle='#e62b1e';c.fillRect(px-1,22,3,56);c.fillStyle='#ffd24d';const mm=Math.floor(Math.min(t,DUR)/DUR*18),ss=Math.floor((Math.min(t,DUR)/DUR*18-mm)*60);c.font='12px '+PIX;c.textAlign='left';c.fillText(String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0'),10,96);
    const pp=$('#cum');if(pp)pp.textContent=msg;
    if(t>DUR+1.2){clearInterval(MINI.iv);const s=res.reduce((a,b)=>a+(b||0),0);openMini(`<h2>Talk finito in tempo</h2><p class="q">${esc(cfg.out||'Applauso in sala.')} Punteggio cue: ${s}/9.</p><div class="row"><button class="btn" id="cuD">Continua</button></div>`,{act:()=>$('#cuD').click()});$('#cuD').onclick=()=>{closeMini();done(s,9);};}},50);}

/* ---------- corsa (XRun) ---------- */
function runMini(cfg,done){const SECS=cfg.secs||14;let d=0,t=0,fin=false;
  openMini(`<h2>${esc(cfg.title||'XRun')}</h2><p>${esc(cfg.intro||'Premi Spazio o tocca il pulsante a ritmo veloce per arrivare al traguardo prima dello scadere.')}</p><div class="bar" style="height:22px"><i id="rd" style="width:0%"></i></div><p id="rt" style="color:var(--dim)"></p><div class="row"><button class="btn" id="rB" style="width:100%;padding:22px">CORRI</button></div>`,{});
  const hit=()=>{if(fin)return;d=Math.min(100,d+5.5);A.step();};$('#rB').onpointerdown=e=>{e.preventDefault();hit();};MINI.act=hit;
  MINI.iv=setInterval(()=>{t+=.1;d=Math.max(0,d-1.9*.1*10*.5);$('#rd').style.width=d+'%';$('#rt').textContent='Tempo '+Math.max(0,(SECS-t)).toFixed(1)+' s';
    if(d>=100||t>=SECS){fin=true;clearInterval(MINI.iv);const win=d>=100;const stars=win?(t<SECS*.6?3:t<SECS*.85?2:1):0;openMini(`<h2>${win?'Traguardo!':'Quasi…'}</h2><p class="q">${win?'Hai tagliato il traguardo in '+t.toFixed(1)+' secondi.':'Ti sei fermato a '+Math.round(d)+'% del percorso. Va bene lo stesso: l\'importante è partecipare.'}</p><div class="row"><button class="btn" id="rD">Continua</button></div>`,{act:()=>$('#rD').click()});$('#rD').onclick=()=>{closeMini();done(stars);};}},100);}

/* ---------- voto dei Consiglieri (swipe) ---------- */
function voteMini(cands,done){let i=0;const liked=[];
  const show=()=>{if(i>=cands.length){const pick=liked.slice(0,3);openMini(`<h2>Il palco 2027 comincia da qui</h2><p class="q">Le idee che hai votato:</p>${liked.length?liked.map(c=>`<div class="card">${faceImg(palOf(c.n),'')}<div><b>${esc(c.n)}</b><small>${esc(c.j)} · «${esc(c.i)}»</small></div></div>`).join(''):'<p>Nessun voto: va bene, anche scegliere di non scegliere è una scelta.</p>'}<div class="row"><button class="btn" id="vD">Continua</button></div>`,{act:()=>$('#vD').click()});$('#vD').onclick=()=>{closeMini();done(liked);};return;}
    const c=cands[i];openMini(`<h2>Voto dei Consiglieri</h2><p style="color:var(--dim)">Autocandidatura ${i+1}/${cands.length} (candidati inventati)</p><div class="card" style="flex-direction:column;text-align:center;padding:16px">${faceImg(palOf(c.n),'')}<b style="font-size:19px">${esc(c.n)}</b><small>${esc(c.j)}</small><p class="q" style="margin:8px 0 0">«${esc(c.i)}»</p></div><div class="row" style="justify-content:center"><button class="btn ghost" id="vN">✕ Non ora</button><button class="btn" id="vY">♥ La voto</button></div>`,{act:null});
    const go=y=>{if(y){liked.push(c);A.ok();}else A.blip();i++;show();};$('#vY').onclick=()=>go(true);$('#vN').onclick=()=>go(false);MINI.act=()=>go(true);};
  show();}

/* ---------- fumetto in tre vignette ---------- */
function comicMini(done){const pick=[];let i=0;
  const show=()=>{if(i>=COMIC_Q.length){const parts=pick;const line='Una storia in tre vignette: '+parts[0].toLowerCase()+' che '+parts[1]+' e alla fine '+parts[2]+'.';openMini(`<h2>Il tuo fumetto</h2><div style="display:flex;gap:6px">${pick.map((p,k)=>`<div class="tk" style="flex:1;border-style:solid;min-height:90px"><small>Vignetta ${k+1}</small><b style="font-size:13px">${esc(p)}</b></div>`).join('')}</div><p class="q">${esc(line.replace('Una storia in tre vignette: u','Una storia in tre vignette: U'))}</p><div class="row"><button class="btn" id="cD">Continua</button></div>`,{act:()=>$('#cD').click()});$('#cD').onclick=()=>{closeMini();done(pick);};return;}
    const q=COMIC_Q[i];openMini(`<h2>Dall’idea al fumetto</h2><p class="q">${esc(q.t)}</p>${q.o.map((o,k)=>`<button class="opt" data-k="${k}">${k+1}. ${esc(o[0])}</button>`).join('')}`,{act:null});
    $('#miniB').querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const o=q.o[+b.dataset.k];pick.push(i===0?o[0]:o[1]);A.blip();i++;show();});};
  show();}

/* ---------- convincere uno speaker ---------- */
const PTRAIT={
 entusiasta:{open:'Che bella proposta! Un TEDx a Pesaro... mi incuriosisce, dimmi tutto.',obj:'Mi piace! Ma poi cosa devo preparare, esattamente?',opts:[['Un talk sotto i 18 minuti, una sola idea: ti seguiamo noi nella preparazione.',2],['Una presentazione con tantissime slide e dati.',0],['Decidi tu: noi non c’entriamo.',0]]},
 pratico:{open:'Mi interessa, ma prima vorrei capire come funziona la cosa.',obj:'Quanto tempo mi porta via? E la logistica?',opts:[['Ti mandiamo un calendario chiaro: prove, tecnica, arrivo, tutto pianificato.',2],['Non ti preoccupare, si vedrà.',0],['Ci sono diverse riunioni, ma ne vale la pena.',1]]},
 riflessivo:{open:'Ci devo pensare. Per me un talk è una cosa seria: non voglio dire cose a caso.',obj:'Non so se la mia idea sia adatta a un palco...',opts:[['Ti ascoltiamo e la modelliamo insieme, senza snaturarla.',2],['Basta che sia famosa.',0],['Se hai dubbi, lasciamo stare.',0]]},
 impegnato:{open:'Un TEDx... bella cosa. Ma sono molto preso in questo periodo.',obj:'Ho l’agenda piena fino a primavera...',opts:[['Capiamo: ti proponiamo prove brevi e a distanza, adatte ai tuoi tempi.',2],['Allora non fa niente...',0],['È un onore: devi trovare il tempo.',0]]}};
const POPT=[['Ti racconto cos’è TEDx Pesaro e perché la tua idea merita il palco.',{entusiasta:2,pratico:1,riflessivo:1,impegnato:1},'Ti spiego il progetto: un’associazione di volontari, un evento senza scopo di lucro, una sola idea per talk.'],
 ['Con il tuo nome porteremo un sacco di pubblico.',{entusiasta:1,pratico:0,riflessivo:0,impegnato:0},'Il nome è importante, ma ci interessa l’idea.'],
 ['Raccontami l’idea: ti aiuto a limarla.',{entusiasta:1,pratico:1,riflessivo:2,impegnato:1},'Mi piacerebbe sentire la tua idea, prima di tutto.'],
 ['Ti offriamo un compenso per venire.',{entusiasta:-1,pratico:-1,riflessivo:-1,impegnato:-1},'Aspetta: ricordo che nei TEDx gli speaker non vengono pagati. Non è questo il punto.']];
function persuade(npc,trait,onDone){
  const T=PTRAIT[trait]||PTRAIT.entusiasta;let score=0,tries=0;
  const start=()=>{score=0;const open={t:T.open,nx:r1()};say(npc,open,null);};
  const r1=()=>({t:'Come la imposti?',c:POPT.map(o=>({t:o[0],act:()=>{score+=o[1][trait]||0;},n:{t:o[2],nx:()=>r2()}}))});
  const r2=()=>({t:T.obj,nx:()=>({t:'Come rispondi?',c:T.opts.map(o=>({t:o[0],act:()=>{score+=o[1];},n:{t:o[1]>=2?'Va bene, mi hai convinto.':o[1]===1?'Mmm... forse, sì.':'Non mi convince.',nx:()=>fin()}}))})});
  const fin=()=>{if(score>=3){return{t:'Va bene: ci sto. Mandatemi i dettagli e cominciamo a lavorare al talk!',c:[{t:'Grazie! A presto.',n:null,act:()=>onDone(true)}]};}
    tries++;return{t:'Grazie del tempo, ma ora non me la sento. Riparliamone con calma.',c:[{t:'Riprovo con un altro approccio',n:null,act:()=>start()},{t:'Rinuncio per ora (la squadra se ne occupa)',n:null,act:()=>onDone(false)}]};};
  const open0={t:T.open,nx:r1()};say(npc,open0);}
