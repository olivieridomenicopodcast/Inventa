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

/* ---------- cue dei 18 minuti (stage manager): si vede lo speech sul palco e il timer ---------- */
function wrapText(c,txt,x,y,maxW,lh){const w=txt.split(' ');let l='',yy=y;for(const t of w){const test=l?l+' '+t:t;if(c.measureText(test).width>maxW&&l){c.fillText(l,x,yy);l=t;yy+=lh;}else l=test;}if(l)c.fillText(l,x,yy);return yy;}
function stageScene(c,t,dur,o){const SC_=['#3a2a4a','#2a3a5a','#4a2a2a','#2a4a3a','#4a4a2a','#3a3a3a'],SH=['#e8b98a','#c98e62','#f0c8a0','#a8734c'];
  c.imageSmoothingEnabled=false;c.fillStyle='#090b18';c.fillRect(0,0,320,150);
  for(let k=0;k<4;k++){const x=40+k*80,fl=.05+.04*Math.sin(t*1.3+k*1.7);c.fillStyle='rgba('+(k%2?'255,120,120':'255,200,160')+','+fl.toFixed(3)+')';c.beginPath();c.moveTo(x-3,2);c.lineTo(x+3,2);c.lineTo(x+28,96);c.lineTo(x-28,96);c.fill();}
  // schermo
  c.fillStyle='#05060d';c.fillRect(50,4,220,74);const g=c.createLinearGradient(54,0,266,0);g.addColorStop(0,'#2a1020');g.addColorStop(.6,'#4a1a1a');g.addColorStop(1,'#5a2a2a');c.fillStyle=g;c.fillRect(54,8,212,66);
  const n=o.slides.length,si=Math.min(n-1,Math.floor(t/dur*n)),sl=o.slides[si];
  c.fillStyle='#fff';c.textAlign='left';c.textBaseline='top';c.font=(si===0?'7':'6')+'px '+PIX;wrapText(c,sl,62,si===0?24:20,196,10);
  c.fillStyle='#e62b1e';c.font='5px '+PIX;c.fillText('TEDx',62,12);c.textAlign='right';c.fillStyle='#ffd24d';c.fillText((si+1)+'/'+n,258,64);
  // palco
  c.fillStyle='#171a30';c.fillRect(0,78,320,24);c.fillStyle='#2d3360';c.fillRect(0,100,320,3);c.fillStyle='#e62b1e';c.fillRect(0,102,320,1);
  // clock da palco
  const left=Math.max(0,dur-t),mm=Math.floor(left/dur*18),ss=Math.floor((left/dur*18-mm)*60);c.fillStyle='#000';c.fillRect(8,84,56,14);c.fillStyle=left/dur<.17?'#ff5d5d':left/dur<.34?'#ffd24d':'#4dff9a';c.font='8px '+PIX;c.textAlign='center';c.textBaseline='middle';c.fillText(String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0'),36,91);
  // speaker
  const sx=Math.round(170+Math.sin(t*.45)*52),mv=Math.cos(t*.45)*Math.abs(Math.sin(t*.8))>.3;c.save();c.translate(sx,102);c.scale(2,2);person(c,0,0,mv?(Math.cos(t*.45)>0?3:2):0,mv?t*2:0,Object.assign({badge:'#ffd24d'},palOf(o.speaker||'Speaker')));c.fillStyle='#111';c.fillRect(-2,-19,1,3);c.fillRect(-3,-16,3,1);c.restore();
  // segnale al palco
  if(o.flash&&t-o.flash.at<1.4){c.fillStyle=o.flash.c;c.globalAlpha=Math.max(0,1-(t-o.flash.at)/1.4);c.fillRect(120,106,80,10);c.globalAlpha=1;c.fillStyle='#000';c.font='6px '+PIX;c.textAlign='center';c.fillText(o.flash.t,160,111);}
  // pubblico
  const rows=[114,124,134,144];for(let r=0;r<4;r++){const sz=.9+r*.12,cnt=Math.floor(320/(10*sz))+1;for(let i=0;i<cnt;i++){const x=Math.round(i*10*sz+(r%2)*4),y=rows[r];const bob=o.applause?Math.round(Math.sin(t*14+i)*1.5):0;c.fillStyle=SC_[(i*7+r*3)%SC_.length];c.fillRect(x-4*sz,y+3*sz+bob,8*sz,5*sz);c.fillStyle=SH[(i*5+r)%SH.length];c.fillRect(x-3*sz,y-1+bob,6*sz,6*sz);}}
  if(o.applause){c.fillStyle='rgba(255,255,255,.07)';c.fillRect(0,0,320,150);}
}
function cueMini(cfg,done){const DUR=20,M=[{at:15/18*DUR,t:'-3',f:'3 MINUTI',c:'#4dff9a'},{at:17/18*DUR,t:'-1',f:'1 MINUTO',c:'#ffd24d'},{at:DUR*.995,t:'STOP',f:'STOP',c:'#ff5d5d'}];let t=0,res=[null,null,null],msg='';
  const sc={speaker:cfg.speaker||'',slides:cfg.slides||['Il talk','Una sola idea','Un esempio','Cosa portare a casa'],flash:null,applause:false};
  openMini(`<h2>Backstage · il timer dei 18 minuti</h2><p>${esc(cfg.intro||'Lo speaker è sul palco. Mostra i segnali nel momento giusto.')}</p><canvas id="cuc" width="320" height="210" style="width:100%;image-rendering:pixelated;background:#0b0b10;border-radius:10px"></canvas><p id="cum" style="min-height:22px;color:var(--ac2)"></p><div class="row"><button class="btn" id="cuB">SEGNALE (Spazio)</button></div>`,{});
  const c=$('#cuc').getContext('2d');
  const press=()=>{if(t>DUR+1)return;let bi=-1,bd=9;M.forEach((m,i)=>{if(res[i]===null){const d=Math.abs(t-m.at);if(d<bd){bd=d;bi=i;}}});if(bi<0||bd>2.4){msg='Troppo presto o a vuoto.';A.bad();return;}const p=bd<.5?3:bd<1.1?2:1;res[bi]=p;sc.flash={at:t,c:M[bi].c,t:M[bi].f};msg=['','Un po’ in ritardo o in anticipo: lo speaker se ne accorge.','Buono.','Perfetto, tempo da orologio.'][p];A.tone(500+p*150,.1,'triangle',.06);};
  $('#cuB').onclick=press;MINI.act=press;
  MINI.iv=setInterval(()=>{t+=.05;stageScene(c,Math.min(t,DUR),DUR,sc);
    // linea del tempo
    c.fillStyle='#0b0b10';c.fillRect(0,150,320,60);c.fillStyle='#2d2d40';c.fillRect(10,176,300,6);
    M.forEach((m,i)=>{const x=10+m.at/DUR*300;c.fillStyle=res[i]!==null?'#888':m.c;c.fillRect(x-2,166,4,26);c.fillStyle='#fff';c.font='6px '+PIX;c.textAlign='center';c.textBaseline='alphabetic';c.fillText(m.t,x-(i===1?6:i===2?0:0),i===1?160:i===2?154:160);if(res[i]!==null)c.fillText('★'.repeat(res[i]),x,204);});
    const px=10+Math.min(t,DUR)/DUR*300;c.fillStyle='#e62b1e';c.fillRect(px-1,160,3,38);
    const pp=$('#cum');if(pp)pp.textContent=msg;
    if(t>DUR&&!sc.applause){sc.applause=true;A.stamp();}
    if(t>DUR+1.6){clearInterval(MINI.iv);const s=res.reduce((a,b)=>a+(b||0),0);openMini(`<h2>Talk finito in tempo</h2><p class="q">${esc(cfg.out||'Applauso in sala.')} Punteggio cue: ${s}/9.</p><div class="row"><button class="btn" id="cuD">Continua</button></div>`,{act:()=>$('#cuD').click()});$('#cuD').onclick=()=>{closeMini();done(s,9);};}},50);}

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

/* ---------- convincere uno speaker: approcci, obiezioni e domande finali cambiano per ogni persona e per ogni tentativo ---------- */
const PTRAIT={
 entusiasta:{open:['Che bella proposta! Un TEDx a Pesaro... mi incuriosisce, dimmi tutto.','Ah, TEDx! Ne ho sentito parlare benissimo. Racconta.','Interessante! Ho un po’ di idee in testa, ma dimmi prima tu.'],
  obj:[{t:'Mi piace! Ma poi cosa devo preparare, esattamente?',o:[['Un talk sotto i 18 minuti, una sola idea: ti seguiamo noi nella preparazione.',2],['Una presentazione con tantissime slide e dati.',0],['Decidi tu: noi non c’entriamo.',0]]},
       {t:'Però voglio fare qualcosa di mio, non un discorso ingessato.',o:[['Certo: l’importante è una sola idea, raccontata a modo tuo.',2],['Ti scriviamo noi il testo.',0],['Dipende, vediamo se è adatto.',1]]},
       {t:'E se esagero con l’entusiasmo e vado fuori tempo?',o:[['Il timer ti aiuta: segnali a 3 minuti, a 1 minuto e allo stop.',2],['Tranquillo: nessuno ti ferma.',0],['Per questo tagliamo tutto a 10 minuti.',1]]}]},
 pratico:{open:['Mi interessa, ma prima vorrei capire come funziona la cosa.','Ok, dimmi i fatti: cosa, quando, dove.','Pensiamoci in concreto: cosa serve da parte mia?'],
  obj:[{t:'Quanto tempo mi porta via? E la logistica?',o:[['Ti mandiamo un calendario chiaro: prove, tecnica, arrivo, tutto pianificato.',2],['Non ti preoccupare, si vedrà.',0],['Ci sono diverse riunioni, ma ne vale la pena.',1]]},
       {t:'Chi si occupa della parte tecnica, microfoni e slide?',o:[['Un team dedicato: tu porti l’idea, noi prepariamo tutto.',2],['Arrangiati con il tuo computer.',0],['Ne parliamo il giorno stesso.',1]]},
       {t:'E per spostamenti e orari, come funziona?',o:[['Ti indichiamo orari e punto d’incontro, e un volontario ti accompagna.',2],['Vedi tu.',0],['Chiedi agli altri speaker.',1]]}]},
 riflessivo:{open:['Ci devo pensare. Per me un talk è una cosa seria: non voglio dire cose a caso.','Mi piacerebbe, ma ho bisogno di capire il senso di tutto.','Prima di rispondere vorrei sapere che cosa vi aspettate da me.'],
  obj:[{t:'Non so se la mia idea sia adatta a un palco...',o:[['Ti ascoltiamo e la modelliamo insieme, senza snaturarla.',2],['Basta che sia famosa.',0],['Se hai dubbi, lasciamo stare.',0]]},
       {t:'Ho paura di semplificare troppo un tema complesso.',o:[['Una sola idea, anche profonda: la complessità si può raccontare con un esempio.',2],['Non importa, tanto non se ne accorge nessuno.',0],['Dividi il tema in cinque parti.',1]]},
       {t:'Che spazio c’è per le sfumature in 18 minuti?',o:[['Più di quanto sembri: una buona idea ha bisogno di poche parole ben scelte.',2],['Poco: bisogna dire sì o no.',0],['Si fa quel che si può.',1]]}]},
 impegnato:{open:['Un TEDx... bella cosa. Ma sono molto preso in questo periodo.','Interessante, ma ho l’agenda piena: dimmi cosa serve.','Mi fa piacere, davvero. Il problema è il tempo.'],
  obj:[{t:'Ho l’agenda piena fino a primavera...',o:[['Capiamo: ti proponiamo prove brevi e a distanza, adatte ai tuoi tempi.',2],['Allora non fa niente...',0],['È un onore: devi trovare il tempo.',0]]},
       {t:'Non posso mica venire a Pesaro dieci volte.',o:[['Bastano due o tre incontri, il resto lo facciamo online.',2],['Dobbiamo vederci ogni settimana.',0],['Allora lascia perdere.',0]]},
       {t:'Posso limitarmi a venire il giorno stesso?',o:[['Una prova breve prima aiuta, ma ci adattiamo ai tuoi impegni.',2],['No, è obbligatorio essere presenti sempre.',0],['Se proprio non puoi...',1]]}]}};
const POOL1=[
 {t:'Ti racconto cos’è TEDx Pesaro e perché la tua idea merita il palco.',s:{entusiasta:2,pratico:1,riflessivo:1,impegnato:1},r:'Ti spiego il progetto: un’associazione di volontari, un evento senza scopo di lucro, una sola idea per talk.'},
 {t:'Mi piace molto quello che fai{info}: vorremmo che lo raccontassi qui.',s:{entusiasta:2,pratico:1,riflessivo:1,impegnato:1},r:'Ho seguito il tuo lavoro e mi è sembrato adatto al nostro palco.'},
 {t:'Raccontami l’idea: ti aiuto a limarla.',s:{entusiasta:1,pratico:1,riflessivo:2,impegnato:1},r:'Mi piacerebbe sentire la tua idea, prima di tutto.'},
 {t:'Il palco è piccolo ma la comunità è vera: persone che ascoltano davvero.',s:{entusiasta:2,pratico:0,riflessivo:2,impegnato:1},r:'È un pubblico curioso: viene per le idee, non per i nomi.'},
 {t:'Ti garantiamo un percorso di preparazione chiaro, tappa per tappa.',s:{entusiasta:1,pratico:2,riflessivo:1,impegnato:2},r:'Niente improvvisazione: sai cosa succede e quando.'},
 {t:'Una sola idea, meno di 18 minuti: poche parole ben scelte.',s:{entusiasta:1,pratico:2,riflessivo:2,impegnato:1},r:'È la regola dei TEDx: breve, concreto, memorabile.'},
 {t:'Ti offriamo un compenso per venire.',s:{entusiasta:-1,pratico:-1,riflessivo:-1,impegnato:-1},r:'Aspetta: nei TEDx gli speaker non vengono pagati, e non pagano. Non è questo il punto.'},
 {t:'Con il tuo nome porteremo un sacco di pubblico.',s:{entusiasta:1,pratico:0,riflessivo:0,impegnato:0},r:'Il nome è importante, ma ci interessa soprattutto l’idea.'},
 {t:'Dal palco puoi promuovere il tuo libro o la tua attività.',s:{entusiasta:-1,pratico:-1,riflessivo:-1,impegnato:-1},r:'No, un attimo: i TEDx non ammettono promozione commerciale dal palco.'},
 {t:'Dai, non farti pregare: dobbiamo chiudere il programma.',s:{entusiasta:-1,pratico:-1,riflessivo:-1,impegnato:-1},r:'Non mi piace essere messo sotto pressione. Così non ci siamo.'},
 {t:'Gli sponsor possono suggerirti cosa dire.',s:{entusiasta:-1,pratico:-1,riflessivo:-1,impegnato:-1},r:'Mi sembra strano: gli sponsor non dovrebbero decidere i contenuti.'}];
const POOL3=[
 {t:'Dove ci vediamo per le prove?',o:[['Online per le prime, poi una prova in sala.',2],['Il giorno stesso, con calma.',0],['Quando vuoi tu, ma porta le slide pronte.',1]]},
 {t:'E se mi blocco sul palco?',o:[['Hai il timer, un volontario dietro le quinte e nessuna fretta: ti aiutiamo noi.',2],['Non succede.',0],['Improvvisa.',0]]},
 {t:'Posso portare il mio libro o il mio prodotto?',o:[['Si parla dell’idea, non si fa promozione: ma il tuo nome sarà nel programma.',2],['Sì, certo: vendilo.',0],['Chiedilo agli sponsor.',0]]},
 {t:'Il mio talk verrà pubblicato?',o:[['Sì: i video seguono le regole TEDx e vengono pubblicati online.',2],['Forse.',1],['No, resta in sala.',0]]},
 {t:'Posso portare qualcuno con me?',o:[['Certo: ti riserviamo due posti e un volontario per accompagnarti.',2],['No, nessuno.',0],['Solo se paga il biglietto.',1]]}];
function persuade(npc,trait,onDone){
  const T=PTRAIT[trait]||PTRAIT.entusiasta;let score=0,tries=0;
  const seed=()=>mulberry32(hashStr('prs|'+npc.name+'|'+tries));
  const info=SPK_INFO[npc.name]?' come '+SPK_INFO[npc.name]:'';
  const start=()=>{score=0;const r=seed();
    const goods=shuffle(POOL1.filter(o=>Math.max(...Object.values(o.s))>0&&o.s.entusiasta!==undefined&&o.s[trait]>=1),r).slice(0,r()<.5?2:3);
    const bads=shuffle(POOL1.filter(o=>!goods.includes(o)&&(o.s[trait]||0)<=0),r).slice(0,4-goods.length);
    const o1=shuffle([...goods,...bads],r);
    const ob=T.obj[Math.floor(r()*T.obj.length)],o2=shuffle(ob.o,r),q3=POOL3[Math.floor(r()*POOL3.length)],o3=shuffle(q3.o,r);
    const op=T.open[Math.floor(r()*T.open.length)];
    const fin=()=>{const need=4;if(score>=need){return{t:'Va bene: ci sto. Mandatemi i dettagli e cominciamo a lavorare al talk!',c:[{t:'Grazie! A presto.',n:null,act:()=>onDone(true)}]};}
      tries++;return{t:'Grazie del tempo, ma ora non me la sento. Riparliamone con calma.',c:[{t:'Riprovo con un altro approccio',n:null,act:()=>start()},{t:'Rinuncio per ora (la squadra se ne occupa)',n:null,act:()=>onDone(false)}]};};
    const r3={t:q3.t,c:o3.map(o=>({t:o[0],act:()=>{score+=o[1];},n:{t:o[1]>=2?'Perfetto, mi hai convinto.':o[1]===1?'Mmm... forse sì.':'Non mi convince.',nx:()=>fin()}}))};
    const r2={t:ob.t,nx:{t:'Come rispondi?',c:o2.map(o=>({t:o[0],act:()=>{score+=o[1];},n:{t:o[1]>=2?'Va bene, questo mi piace.':o[1]===1?'Mmm... forse.':'Non mi convince.',nx:r3}}))}};
    const r1={t:'Come la imposti?',c:o1.map(o=>({t:o.t.replace('{info}',info),act:()=>{score+=o.s[trait]||0;},n:{t:o.r,nx:r2}}))};
    say(npc,{t:op,nx:r1});};
  start();}
