'use strict';
/* ECO · computer dello studio: narrazioni, montaggio (DAW), valutazione, pubblicazione, host e classifiche */
const TARGET_DB=-16;
function openPC(){
  let h=`<button class="x" data-a="close">✕</button><h2>💻 Computer</h2><div class="sub">${esc(GEAR.pc[G.gear.pc].n)} · ${GEAR.pc[G.gear.pc].tr} tracce · ${GEAR.pc[G.gear.pc].clips} clip per puntata</div>
  <div class="acts col"><button class="mb" data-a="daw">🎛️ Montaggio della puntata</button><button class="mb" data-a="host">🌐 Host: le tue puntate, classifiche e commenti ${G.eps.some(e=>e.newComments)?'<span class="dot"></span>':''}</button><button class="mb gh" data-a="close">Chiudi</button></div>`;
  openUI(h,'pc');delegate(a=>{if(a==='close')closeUI();else if(a==='daw'){openDAW();}else if(a==='host'){openHost('mie');}});
}
/* ---------- registrare una narrazione ---------- */
let REC=null;
function openNarration(){
  const nar=skillLvl('nar');
  const pend=heldItems().filter(it=>!G.items[it.id].clip);
  let h=`<button class="x" data-a="close">✕</button><h2>🎤 Microfono</h2><div class="sub">Qualità in studio: ${Math.round(studioQuality())}%. Detti a parole tue ciò che hai scoperto: serve per usarlo nelle puntate.</div>`;
  h+='<h3>Narra un\'informazione</h3>';
  if(!pend.length)h+='<div class="sub">Non hai appunti da registrare. (Le interviste sono già clip.)</div>';
  for(const it of pend)h+=`<button class="opt" data-a="narr" data-i="${it.id}">${esc(it.text)}<small>${iconSrc[it.src.type]||''} ${esc(it.src.name)}</small></button>`;
  const cs=W.cases.filter(c=>G.topics[c.topicIds.case]);
  h+='<h3>Introduzioni e conclusioni</h3>';
  for(const c of cs){for(const s of ['intro','outro']){const have=G.clips.some(k=>k.struct===s&&k.case===c.id);h+=`<button class="opt" data-a="struct" data-c="${c.id}" data-s="${s}">${s==='intro'?'Introduzione':'Conclusione'}: ${esc(c.title)}<small>${have?'già registrata (puoi rifarla)':'narrazione di struttura: aiuta il ritmo'}</small></button>`;}}
  openUI(h,'narr','narr');delegate((a,d)=>{
    if(a==='close'){closeUI();return;}
    if(a==='narr')startRec({item:d.i,title:'Narrazione: '+itemOf(d.i).text.slice(0,40)+'…'});
    if(a==='struct')startRec({struct:d.s,case:+d.c,title:(d.s==='intro'?'Introduzione: ':'Conclusione: ')+W.cases[+d.c].title});
    if(a==='rec')stopRec();if(a==='cancel'){openNarration();}
  });
}
function startRec(o){
  const aud=skillLvl('aud'),zw=18+aud*2.2+skillLvl('nar');
  REC={o,pos:0,dir:1,zone:[58-zw/2,58+zw/2],t0:performance.now(),raf:0,done:false};
  setUI(`<button class="x" data-a="cancel">✕</button><h2>🎤 In registrazione</h2><div class="sub">${esc(o.title)}</div>
  <div class="meter"><div class="zone" style="left:${REC.zone[0]}%;width:${REC.zone[1]-REC.zone[0]}%"></div><div class="needle" id="needle"></div></div>
  <div class="sub">Il livello sale e scende con la tua voce. Premi <b>Registra</b> quando l'ago è nella zona verde. (Più Audio e Narrazione = zona più ampia.)</div>
  <div class="acts"><button class="mb big" data-a="rec">⏺ Registra</button></div>`);
  const step=(now)=>{if(!REC||REC.done)return;const t=(now-REC.t0)/1000;REC.pos=50+48*Math.sin(t*2.6)*Math.cos(t*.9);const n=$('#needle');if(n)n.style.left=clamp(REC.pos,0,100)+'%';REC.raf=requestAnimationFrame(step);};
  REC.raf=requestAnimationFrame(step);
  const onk=e=>{if(!REC||REC.done){removeEventListener('keydown',onk);return;}if(e.code==='Space'||e.key==='Enter'){e.preventDefault();stopRec();removeEventListener('keydown',onk);}};addEventListener('keydown',onk);
}
async function stopRec(){
  if(!REC||REC.done)return;REC.done=true;cancelAnimationFrame(REC.raf);
  const pos=REC.pos,center=(REC.zone[0]+REC.zone[1])/2,half=(REC.zone[1]-REC.zone[0])/2;
  const off=Math.abs(pos-center),f=clamp(1-Math.max(0,off-half*.35)/(60),.2,1);
  const o=REC.o;REC=null;
  const nar=skillLvl('nar'),aud=skillLvl('aud');
  const q=Math.round(clamp(studioQuality()*.78+f*20+nar*1.8+aud*1.2,8,99));
  const it=o.item?itemOf(o.item):null;
  const lvl=Math.round(TARGET_DB+(Math.random()-.5)*2*(2+(1-f)*12)-(1-f)*3);
  const clip=newClip({type:'narr',title:o.title,item:o.item||null,struct:o.struct||null,case:o.struct?o.case:(it?it.case:null),q,dur:it?Math.max(.3,it.dur*.6):.5,lvl,src:'studio'});
  if(it)G.items[it.id].clip=clip.id;
  addXp('nar',8+(it?it.imp*6:5));addXp('aud',6);
  closeUI();
  await say('',`Clip registrata: qualità ${q}%, livello ${lvl} dB. ${f>.85?'Presa quasi perfetta.':f>.55?'Buona presa.':'Hai sbagliato il livello: dovrai sistemarlo nel montaggio.'}`);
}
/* ---------- DAW ---------- */
const clipById=id=>G.clips.find(c=>c.id===id);
function levelOf(c){return c.lvl+(c.gain||0);}
function shownLevel(c){const m=GEAR.phones[G.gear.phones].m,h=(hashStr(c.id+':'+(c.gain||0))%1000)/1000;return Math.round((levelOf(c)+(h-.5)*2*m)*10)/10;}
function normalizeClip(c){
  const mon=skillLvl('mon'),err=(((hashStr(c.id)%7)-3)/3)*Math.max(.25,3-mon*.28);
  c.gain=clamp(Math.round((TARGET_DB-c.lvl+err)*10)/10,-15,15);c.norm=true;
}
let D=null;
function draft(){if(!G.draft)G.draft={case:null,seq:[],intro:null,outro:null,amb:null,sfx:[],title:'',sel:null,filter:'voce'};return G.draft;}
function openDAW(){
  D=draft();
  const knownCases=W.cases.filter(c=>G.topics[c.topicIds.case]);
  if(D.case===null||(D.case!=='final'&&!G.topics[W.cases[D.case]?.topicIds.case]))D.case=knownCases[0]?knownCases[0].id:0;
  renderDAW();delegate(dawAct);
  const sl=()=>{};
}
function finalAvailable(){let n=0;for(const c of W.cases)if(c.items.some(i=>itemOf(i).fact==='META'&&itemOf(i).truth&&G.items[i]))n++;return n>=2;}
function dawAct(a,d,el){
  const pc=GEAR.pc[G.gear.pc];
  if(a==='close'){stopPreview();closeUI();return;}
  if(a==='filter'){D.filter=d.f;renderDAW();return;}
  if(a==='case'){D.case=d.c==='final'?'final':+d.c;renderDAW();return;}
  if(a==='add'){if(D.seq.length>=pc.clips){toast('Questo computer regge '+pc.clips+' clip per puntata');return;}D.seq.push({id:d.id});D.sel=D.seq.length-1;renderDAW();return;}
  if(a==='rm'){D.seq.splice(+d.i,1);D.sel=null;renderDAW();return;}
  if(a==='left'){const i=+d.i;if(i>0){[D.seq[i-1],D.seq[i]]=[D.seq[i],D.seq[i-1]];D.sel=i-1;renderDAW();}return;}
  if(a==='right'){const i=+d.i;if(i<D.seq.length-1){[D.seq[i+1],D.seq[i]]=[D.seq[i],D.seq[i+1]];D.sel=i+1;renderDAW();}return;}
  if(a==='sel'){D.sel=+d.i;renderDAW();return;}
  if(a==='norm'){const c=clipById(D.seq[D.sel].id);normalizeClip(c);renderDAW();return;}
  if(a==='gain'){const c=clipById(D.seq[D.sel].id);c.gain=clamp((c.gain||0)+(+d.v),-15,15);c.norm=false;renderDAW();return;}
  if(a==='slot'){const slot=d.s;const cur=D[slot];
    if(slot==='intro'||slot==='outro'){const ids=[null,...G.music];const i=ids.indexOf(cur);D[slot]=ids[(i+1)%ids.length];}
    else if(slot==='amb'){const am=G.clips.filter(c=>c.type==='ambiente');const ids=[null,...am.map(c=>c.id)];const i=ids.indexOf(cur);D.amb=ids[(i+1)%ids.length];}
    else if(slot.startsWith('sfx')){const k=+slot.slice(3),ids=[null,...G.sfx];const i=ids.indexOf(D.sfx[k]||null);D.sfx[k]=ids[(i+1)%ids.length];}
    renderDAW();return;}
  if(a==='preview'){togglePreview();return;}
  if(a==='clear'){G.draft=null;D=draft();renderDAW();return;}
  if(a==='publish'){publishEpisode();return;}
}
function dbBar(c){const L=levelOf(c),dev=Math.abs(L-TARGET_DB);const col=L>-6?'#ff5a4d':dev<=2?'#3ddc6a':dev<=5?'#ffd23d':'#ff8a3d';const r=mulberry32(hashStr(c.id));let b='';for(let i=0;i<22;i++){const h=clamp(((r()*.6+.3)*(L+30)/22)*9,2,26);b+=`<i style="height:${h}px;background:${col}"></i>`;}return `<span class="wf">${b}</span>`;}
function renderDAW(){
  const pc=GEAR.pc[G.gear.pc];
  const caseTabs=W.cases.filter(c=>G.topics[c.topicIds.case]).map(c=>`<button class="chip ${D.case===c.id?'on':''}" data-a="case" data-c="${c.id}">${esc(c.title)}</button>`).join('')+(finalAvailable()?`<button class="chip ${D.case==='final'?'on':''}" data-a="case" data-c="final">⭐ La Verità</button>`:'');
  const libFilter=[['voce','🗣️ Voci'],['narr','📖 Narrazioni'],['ambiente','🌊 Ambiente']];
  const lib=G.clips.filter(c=>c.type===D.filter);
  let h=`<button class="x" data-a="close">✕</button><h2>🎛️ Montaggio</h2><div class="sub">${esc(pc.n)} · ${D.seq.length}/${pc.clips} clip · ${pc.tr} tracce · uno studio ordinato fa gli ascolti.</div><div class="chips">${caseTabs}</div>
  <div class="daw"><div class="lib"><div class="chips">${libFilter.map(f=>`<button class="chip ${D.filter===f[0]?'on':''}" data-a="filter" data-f="${f[0]}">${f[1]}</button>`).join('')}</div>`;
  if(!lib.length)h+='<div class="dim sm">Nessuna clip di questo tipo.</div>';
  for(const c of lib){const used=D.seq.some(s=>s.id===c.id);h+=`<div class="clip ${used?'used':''}"><div><div class="ct">${esc(c.title)}</div><div class="dim sm">q ${c.q}% · ${c.dur.toFixed(1)} min · ${shownLevel(c)} dB</div>${dbBar(c)}</div><button class="mb sm" data-a="add" data-id="${c.id}" ${used?'disabled':''}>＋</button></div>`;}
  h+='</div><div class="tl"><div class="trk"><div class="trkl">Voci</div><div class="blocks">';
  if(!D.seq.length)h+='<div class="dim sm">Aggiungi clip dalla libreria: l\'ordine conta.</div>';
  D.seq.forEach((s,i)=>{const c=clipById(s.id);const it=c.item?itemOf(c.item):null;h+=`<div class="blk ${c.type} ${D.sel===i?'sel':''}" data-a="sel" data-i="${i}" style="min-width:${70+c.dur*40}px"><div class="bt">${i+1}. ${esc(c.struct?(c.struct==='intro'?'Intro':'Outro'):(it?FACT_LBL[it.fact]:c.title)).slice(0,22)}</div>${dbBar(c)}</div>`;});
  h+='</div></div>';
  // musica / ambiente / sfx
  const mn=id=>id?(MUSIC.find(m=>m.id===id)||{}).n:'— nessuna —';
  h+=`<div class="trk"><div class="trkl">Musica</div><div class="blocks"><button class="slot" data-a="slot" data-s="intro">🎵 Sigla: ${esc(mn(D.intro))}</button><button class="slot" data-a="slot" data-s="outro">🎵 Chiusura: ${esc(mn(D.outro))}</button></div></div>`;
  if(pc.tr>=3)h+=`<div class="trk"><div class="trkl">Ambiente</div><div class="blocks"><button class="slot" data-a="slot" data-s="amb">🌊 ${D.amb?esc(clipById(D.amb).title):'— nessuno —'}</button></div></div>`;
  if(pc.tr>=4)h+=`<div class="trk"><div class="trkl">Effetti</div><div class="blocks">${[0,1].map(k=>`<button class="slot" data-a="slot" data-s="sfx${k}">🔊 ${D.sfx[k]?esc(SFX.find(s=>s.id===D.sfx[k]).n):'— nessuno —'}</button>`).join('')}</div></div>`;
  // clip selezionata
  if(D.sel!==null&&D.seq[D.sel]){const c=clipById(D.seq[D.sel].id),sl=shownLevel(c);
    h+=`<div class="selp"><b>${esc(c.title)}</b><div class="dim sm">Livello attuale: <b style="color:${Math.abs(sl-TARGET_DB)<=2?'#3ddc6a':'#ffd23d'}">${sl} dB</b> (obiettivo ${TARGET_DB} dB${GEAR.phones[G.gear.phones].m>1?` · le tue cuffie sono imprecise ±${GEAR.phones[G.gear.phones].m} dB`:''})</div>
    <div class="acts"><button class="mb sm gh" data-a="gain" data-v="-3">−3</button><button class="mb sm gh" data-a="gain" data-v="-1">−1</button><button class="mb sm" data-a="norm">Normalizza</button><button class="mb sm gh" data-a="gain" data-v="1">+1</button><button class="mb sm gh" data-a="gain" data-v="3">+3</button>
    <button class="mb sm gh" data-a="left" data-i="${D.sel}">◀</button><button class="mb sm gh" data-a="right" data-i="${D.sel}">▶</button><button class="mb sm rd" data-a="rm" data-i="${D.sel}">Togli</button></div></div>`;}
  const tot=D.seq.reduce((s,x)=>s+clipById(x.id).dur,0)+(D.intro?.5:0)+(D.outro?.5:0);
  const chk=techCheck();
  h+=`<div class="chk">${chk.map(x=>`<div class="${x.k}">${x.k==='bad'?'⚠️':x.k==='ok'?'✅':'ℹ️'} ${esc(x.t)}</div>`).join('')}</div>
  <div class="foot"><input id="epTitle" class="srch" placeholder="Titolo della puntata" value="${esc(D.title)}"><div class="dim sm">Durata: ${tot.toFixed(1)} min</div><div class="acts"><button class="mb gh" data-a="preview" id="pvBtn">▶ Anteprima</button><button class="mb gh" data-a="clear">Svuota</button><button class="mb" data-a="publish" ${D.seq.length?'':'disabled'}>🚀 Pubblica</button></div></div></div></div>`;
  setUI(h);const ti=$('#epTitle');if(ti)ti.oninput=()=>{D.title=ti.value;};
}
function techCheck(){
  const out=[];if(!D.seq.length)return[{k:'info',t:'La timeline è vuota.'}];
  const cs=D.seq.map(s=>clipById(s.id));
  const off=cs.filter(c=>Math.abs(levelOf(c)-TARGET_DB)>3.5);
  out.push(off.length?{k:'bad',t:`${off.length} clip con volume troppo diverso dal resto: ascolta l'anteprima o normalizza.`}:{k:'ok',t:'Volumi omogenei.'});
  const clipping=cs.filter(c=>levelOf(c)>-6);if(clipping.length)out.push({k:'bad',t:'Qualche clip distorce (livello troppo alto).'});
  const first=cs[0];if(first){const it=first.item?itemOf(first.item):null;if(!first.struct&&(!it||it.imp<.6))out.push({k:'info',t:'Come apri la puntata? Un buon gancio tiene l\'ascoltatore.'});}
  if(!cs.some(c=>c.struct==='intro')&&!cs.some(c=>c.struct==='outro'))out.push({k:'info',t:'Mancano introduzione e conclusione parlate (le registri al microfono).'});
  const items=cs.filter(c=>c.item).map(c=>itemOf(c.item));
  const hasConf=items.some(a=>items.some(b=>b.id!==a.id&&b.case===a.case&&b.fact===a.fact&&b.variant!==a.variant));
  if(hasConf)out.push({k:'info',t:'Hai inserito informazioni che si contraddicono: spiegale bene, o scegli.'});
  const caseSet=new Set(items.map(i=>i.case));if(D.case!=='final'&&caseSet.size>1)out.push({k:'bad',t:'Stai mescolando storie diverse: la puntata perde fuoco.'});
  return out;
}
/* ---------- valutazione ---------- */
function scoreEpisode(Dr){
  const cs=Dr.seq.map(s=>clipById(s.id)),final=Dr.case==='final',mon=skillLvl('mon'),nar=skillLvl('nar'),aud=skillLvl('aud');
  const items=cs.filter(c=>c.item).map((c,i)=>({it:itemOf(c.item),pos:cs.indexOf(c),clip:c}));
  const det={good:[],bad:[],lies:[],conflicts:[],facts:new Set()};
  // --- accuratezza
  const byFact={};items.forEach(x=>{const k=x.it.case+':'+x.it.fact;(byFact[k]=byFact[k]||[]).push(x);});
  let sum=0,usedW=0;
  for(const k in byFact){const arr=byFact[k],f=arr[0].it.fact,w=FACT_IMP[f],hasT=arr.some(x=>x.it.truth),hasL=arr.some(x=>!x.it.truth);usedW+=w;
    if(hasT&&!hasL){sum+=w;det.facts.add(k);}
    else if(!hasT){sum-=w*1.2;det.lies.push(arr.find(x=>!x.it.truth).it);}
    else{const tp=Math.max(...arr.filter(x=>x.it.truth).map(x=>x.pos)),lp=Math.max(...arr.filter(x=>!x.it.truth).map(x=>x.pos));if(tp>lp){sum+=w*.8;det.good.push('debunk');det.facts.add(k);}else{sum+=w*.2;det.conflicts.push(arr[0].it);}}}
  const acc=usedW?clamp(50+50*sum/usedW,0,100):50;
  // --- profondità
  let cov=0,tot=0;const imp=FACT_IMP;
  const caseIds=final?[0,1,2]:[Dr.case];
  for(const ci of caseIds)for(const f of FACTS){if(f==='META'&&!final)continue;tot+=imp[f];const k=ci+':'+f;if(byFact[k]){cov+=byFact[k].some(x=>x.it.truth)?imp[f]:imp[f]*.25;}}
  const depth=tot?clamp(cov/tot*115,0,100):0;
  // --- narrazione
  let n=40;
  const first=cs[0],last=cs[cs.length-1];
  if(first){const it=first.item?itemOf(first.item):null;if(first.struct==='intro')n+=14+nar*1.2;else if(it&&it.imp>=.6)n+=7;else n-=4;}
  if(last&&last.struct==='outro')n+=10;
  const ph={context:0,body:1,twist:2,close:3};const pos=items.map(x=>({p:ph[x.it.phase],i:x.pos}));let conc=0,pairs=0;for(let a=0;a<pos.length;a++)for(let b=a+1;b<pos.length;b++){if(pos[a].p===pos[b].p)continue;pairs++;if(pos[a].p<pos[b].p)conc++;}
  n+=pairs?(conc/pairs-.5)*34:0;
  let run=1,maxRun=1;for(let i=1;i<cs.length;i++){if(cs[i].type===cs[i-1].type){run++;maxRun=Math.max(maxRun,run);}else run=1;}if(maxRun>3)n-=(maxRun-3)*3;else if(cs.length>3)n+=4;
  const dur=cs.reduce((s,c)=>s+c.dur,0)+(Dr.intro?.5:0)+(Dr.outro?.5:0);
  if(dur<4)n-=14;else if(dur<8)n-=6;else if(dur<=30)n+=6;else n-=(dur-30)*.6;
  if(!final){const off=items.filter(x=>x.it.case!==Dr.case).length;if(off)n-=Math.min(24,off*8);}
  if(Dr.intro)n+=4;if(Dr.outro)n+=3;
  if(Dr.amb){n+=4;}if(Dr.sfx.filter(Boolean).length)n+=2+Dr.sfx.filter(Boolean).length;
  const kind=final?null:W.cases[Dr.case].kind,moodFit={incendio:'tensione',scomparsa:'notte',furto:'giallo',segnale:'notte',cedimento:'nostalgia'};
  if(kind&&[Dr.intro,Dr.outro].some(m=>m&&(MUSIC.find(x=>x.id===m)||{}).mood===moodFit[kind]))n+=4;
  n+=mon*1.2+nar*.6;if(det.conflicts.length)n-=det.conflicts.length*6;
  const narr=clamp(n,0,100);
  // --- audio
  const voices=cs.filter(c=>c.type!=='ambiente');
  const aq=voices.length?voices.reduce((s,c)=>s+c.q,0)/voices.length:0;
  let lv=0;for(const c of voices){const dev=Math.abs(levelOf(c)-TARGET_DB);lv+=1-clamp((dev-1.5)/9,0,1);if(levelOf(c)>-6)lv-=.4;}lv=voices.length?Math.max(0,lv/voices.length):0;
  const audio=clamp(aq*.72+lv*26+aud*1,0,100);
  const overall=clamp(acc*.27+narr*.28+audio*.22+depth*.23,0,100);
  return{acc,narr,audio,depth,overall,det,dur,n:cs.length};
}
/* ---------- pubblicazione ---------- */
async function publishEpisode(){
  stopPreview();
  const Dr=D;if(!Dr.seq.length)return;
  const final=Dr.case==='final';
  const S=scoreEpisode(Dr);
  const num=G.nextEp++,title=Dr.title.trim()||('Puntata '+num+': '+(final?'La Verità':W.cases[Dr.case].title));
  const base=Math.max(10,G.fans)*(.5+S.overall/100*1.1)+S.overall*3;
  const listens=Math.round(base*(.9+Math.random()*.25)*(Dr.case==='final'?1.5:1));
  const cpm=.35+S.overall/160;
  const ep={id:'e'+num,num,title,case:Dr.case,day:G.day,scores:{acc:Math.round(S.acc),narr:Math.round(S.narr),audio:Math.round(S.audio),depth:Math.round(S.depth),overall:Math.round(S.overall)},dur:S.dur,listens:Math.round(listens*.5),final:listens,growth:3,cpm:cpm*1000,income:0,comments:[],pendingComments:[],commentDay:G.day+1,likes:Math.round(listens*(.04+S.overall/1500)),n:S.n,items:Dr.seq.map(s=>clipById(s.id).item).filter(Boolean)};
  ep.pendingComments=genComments(ep,S,Dr);
  const pay=Math.round(ep.listens*cpm);ep.income=pay;G.money+=pay;G.stats.earned+=pay;G.fans+=Math.round(ep.listens*.1);G.stats.eps++;
  G.eps.push(ep);addXp('nar',14);addXp('mon',16);addXp('aud',6);addXp('inv',6);
  G.draft=null;
  const ending=final&&S.acc>=80&&S.depth>=70&&S.overall>=70&&!G.ending;
  if(ending)G.ending=true;
  const rank=myRank();
  sfx.pub();let h=`<h2>🚀 Puntata pubblicata</h2><div class="sub">«${esc(title)}»</div><div class="kv"><div>Qualità audio<b>${Math.round(S.audio)}</b></div><div>Narrazione<b>${Math.round(S.narr)}</b></div><div>Profondità<b>${Math.round(S.depth)}</b></div><div>Punteggio<b>${Math.round(S.overall)}</b></div></div>
  <div class="sub">Primi ascolti: <b>${fmt(ep.listens)}</b> · Incasso immediato: <b>€ ${fmt(pay)}</b>. Nei prossimi giorni gli ascolti cresceranno. Domani leggerai i commenti: il pubblico non perdona gli errori… né li nasconde.</div>
  <div class="sub">Accuratezza: <b>${S.acc>=75?'sembra solida':S.acc>=55?'incerta':'preoccupante'}</b> (il pubblico ne saprà di più domani). Posizione in classifica: #${rank}.</div>${ending?'<div class="card held"><div class="ct">⭐ Hai ricostruito la verità.</div><div>Tre storie, un solo filo: tutto torna. La regione di '+esc(W.name)+' ha finalmente una voce che la racconta.</div></div>':''}<div class="acts"><button class="mb" data-a="close">Continua</button></div>`;
  setUI(h);delegate(a=>{if(a==='close'){closeUI();if(ending)endingScreen();}});
  saveGame(true);hudNow();
}
async function endingScreen(){
  await say('Narratore','Hai unito tre misteri in un solo racconto: '+W.cases.map(c=>c.title).join(', ')+'.');
  await say('Narratore',`Il filo era uno solo: ${W.org}. Ora la regione lo sa, e tu hai un podcast che conta.`);
  await say('Zia','Hai superato i tre ascoltatori, tesoro. Ma io resto la tua fan numero uno.');
  toast('Stagione conclusa. Puoi continuare a giocare.',4000);
}
/* ---------- commenti ---------- */
const FANS=['Mario_89','La_Vera','pescatore73','NoraNews','AscoltoTutto','bibliotecaria_','MassimoR','Gigi il Sospettoso','ClaraC','Anonimo','vecchio_radioamatore','lettrice_notturna'];
function genComments(ep,S,Dr){
  const r=Math.random,out=[],u=()=>pick(r,FANS);
  const add=(t,mood)=>out.push({user:u(),text:t,mood,likes:ri(r,0,Math.round(ep.likes/6)+3)});
  const o=S.overall;
  if(o>=75)add('Puntata bellissima: non mi sono mai distratto. Più così!','up');else if(o>=55)add('Bella idea e bel lavoro, ma si può fare ancora meglio.','mid');else add('Interessante, ma mi aspettavo molto di più.','down');
  if(S.audio>=78)add('Audio pulitissimo, sembra una radio vera.','up');else if(S.audio<45)add('L\'audio è faticoso: volumi che saltano e fruscio. Aiuto.','down');
  if(S.narr>=75)add('La costruzione della storia è impeccabile: ogni pezzo al suo posto.','up');else if(S.narr<45)add('Faccio fatica a seguire: manca un filo, o un\'introduzione.','down');
  for(const l of S.det.lies.slice(0,2))if(r()<.75)add(`Attenzione: «${lowerFirst(l.text)}» non mi torna. Ho visto un documento che dice il contrario.`,'down');
  for(const c of S.det.conflicts.slice(0,2))add(`Hai detto due cose opposte su "${FACT_LBL[c.fact].toLowerCase()}". Quale sarebbe vera?`,'mid');
  if(S.det.good.includes('debunk'))add('Mi è piaciuto che tu abbia smontato la versione ufficiale con le prove.','up');
  if(S.det.facts.size>=3&&o>=60)add('Finalmente qualcuno ne parla con serietà. Complimenti.','up');
  // piste: suggerimenti per proseguire
  const cs=Dr.case==='final'?null:W.cases[Dr.case];
  const leadsFrom=(cs?[cs]:W.cases);
  const cand=[];for(const c of leadsFrom)for(const id of c.cast){const n=W.npcs[id];if(!G.flags['met_'+n.id]||!G.topics[n.topic])cand.push(n);}
  if(cand.length&&r()<.9){const n=pick(r,cand);ep._lead=n.topic;add(`Ma avete parlato con ${n.name}? Dicono che sappia più di quanto racconti. ${G.seenTowns[n.townId]?'':'Vive a '+W.towns.find(t=>t.id===n.townId).name+'.'}`,'lead');}
  const libs=W.towns.filter(t=>t.buildings.some(b=>b.type==='library'));
  if(r()<.55&&libs.length){const t=pick(r,libs);add(`Nell'archivio della biblioteca di ${t.name} ci sono carte vecchie che nessuno ha mai letto per intero.`,'lead');ep._lib=t.id;}
  // rivali
  const rv=W.rivals.find(x=>x.case===(cs?cs.id:-1)&&x.theory);if(rv&&r()<.7)add(`${rv.name} sostiene un'altra versione. Fatevi due domande.`,'mid');
  return out.slice(0,8);
}
/* ---------- host ---------- */
let HOST={tab:'mie'};
function myRank(){const my=myScore();const list=W.rivals.map(r=>G.rivals[r.id].score*(1+Math.log10(G.rivals[r.id].fans)/6));const mine=my*(1+Math.log10(Math.max(10,G.fans))/6);return 1+list.filter(x=>x>mine).length;}
function myScore(){const eps=G.eps.slice(-4);if(!eps.length)return 20;return eps.reduce((s,e)=>s+e.scores.overall,0)/eps.length;}
function openHost(tab){
  HOST.tab=tab||HOST.tab;if(!uiKind||uiKind==='pc')openUI('','host','host');renderHost();delegate(hostAct);
}
function hostAct(a,d){
  if(a==='close'){closeUI();return;}
  if(a==='tab'){HOST.tab=d.t;renderHost();return;}
  if(a==='read'){const e=G.eps.find(x=>x.id===d.e);if(e){e.newComments=false;if(e._lead&&!G.topics[e._lead])G.topics[e._lead]=true;if(e._lib&&!G.flags['liblead'+e._lib]){G.flags['liblead'+e._lib]=1;}}renderHost();}
  if(a==='listen'){const rv=W.rivals.find(r=>r.id===d.r);const it=rv&&rv.theory?itemOf(rv.theory):null;if(it&&!G.items[it.id]){noteItem(it.id,'rumor');toast('📝 Ascoltato '+rv.name+': nuovo appunto (teoria)',2600);}else toast('Un episodio come tanti.');G.rivals[d.r].heard=true;renderHost();}
  if(a==='name'){}
}
function renderHost(){
  const rank=myRank();
  const tabs=[['mie','🎙️ Le mie puntate'],['class','🏆 Classifica'],['asc','🎧 Ascolta']];
  let h=`<button class="x" data-a="close">✕</button><h2>🌐 Host · ${esc(podName())}</h2><div class="sub">${fmt(G.fans)} ascoltatori · #${rank} in classifica · € ${fmt(G.stats.earned)} guadagnati</div><div class="tabs">${tabs.map(t=>`<button class="tab ${HOST.tab===t[0]?'on':''}" data-a="tab" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>`;
  if(HOST.tab==='mie'){
    if(!G.eps.length)h+='<div class="sub">Non hai ancora pubblicato nulla. Registra, monta e pubblica la tua prima puntata.</div>';
    for(const e of [...G.eps].reverse()){
      const ready=e.commentDay<=G.day,showAcc=ready;
      h+=`<div class="card"><div class="ct">#${e.num} · ${esc(e.title)} ${e.newComments?'<span class="dot"></span>':''}</div><div class="meta">Giorno ${e.day} · ${fmt(e.listens)} ascolti · 👍 ${fmt(e.likes)} · € ${fmt(e.income)}</div>
      <div class="kv sm"><div>Audio<b>${e.scores.audio}</b></div><div>Narrazione<b>${e.scores.narr}</b></div><div>Profondità<b>${e.scores.depth}</b></div><div>Accuratezza<b>${showAcc?(e.scores.acc>=75?'alta':e.scores.acc>=55?'media':'bassa'):'?'}</b></div></div>`;
      if(!ready)h+='<div class="dim">I commenti arriveranno domani (dormi per passare il giorno).</div>';
      else if(e.comments&&e.comments.length)h+=`<div class="cms">${e.comments.map(c=>`<div class="cm ${c.mood}"><b>${esc(c.user)}</b> ${esc(c.text)} <span class="dim">👍 ${c.likes}</span></div>`).join('')}</div>${e.newComments?`<button class="mb sm" data-a="read" data-e="${e.id}">Segna come letti</button>`:''}`;
      h+='</div>';
    }
  }else if(HOST.tab==='class'){
    const all=W.rivals.map(r=>({n:r.name,h:r.host,f:G.rivals[r.id].fans,s:G.rivals[r.id].score,me:false})).concat([{n:podName(),h:'Tu',f:G.fans,s:myScore(),me:true}]);
    all.forEach(x=>x.v=x.s*(1+Math.log10(Math.max(10,x.f))/6));all.sort((a,b)=>b.v-a.v);
    h+='<div class="sub">Il punteggio mescola qualità recente e pubblico.</div><div class="rank">'+all.slice(0,10).map((x,i)=>`<div class="rk ${x.me?'me':''}"><b>${i+1}</b><div><div class="t">${esc(x.n)}</div><div class="dim sm">${esc(x.h)} · ${fmt(x.f)} ascoltatori</div></div><div class="pr">${Math.round(x.s)}</div></div>`).join('')+'</div>';
    const idx=all.findIndex(x=>x.me);if(idx>=10)h+=`<div class="rk me"><b>${idx+1}</b><div><div class="t">${esc(podName())}</div></div><div class="pr">${Math.round(myScore())}</div></div>`;
  }else{
    h+='<div class="sub">Ascolta cosa dicono gli altri podcast sulla regione. Non tutto ciò che si sente è vero…</div>';
    for(const rv of W.rivals.filter(r=>r.theory)){const heard=G.rivals[rv.id].heard;h+=`<div class="card"><div class="ct">${esc(rv.name)}</div><div class="meta">${esc(rv.host)} · ${fmt(G.rivals[rv.id].fans)} ascoltatori</div>${heard?'<div class="dim">Già ascoltato.</div>':`<button class="mb sm" data-a="listen" data-r="${rv.id}">▶ Ascolta l'ultima puntata</button>`}</div>`;}
  }
  setUI(h);
}
const podName=()=>'Frequenze di '+W.name;
/* ---------- anteprima audio sintetica ---------- */
let PV={ctx:null,on:false,timers:[]};
function stopPreview(){PV.on=false;PV.timers.forEach(clearTimeout);PV.timers=[];if(PV.ctx&&PV.ctx.state==='running')PV.ctx.suspend();const b=$('#pvBtn');if(b)b.textContent='▶ Anteprima';}
function togglePreview(){
  if(PV.on){stopPreview();return;}
  if(!PV.ctx)PV.ctx=new (window.AudioContext||window.webkitAudioContext)();PV.ctx.resume();PV.on=true;const b=$('#pvBtn');if(b)b.textContent='■ Stop';
  const c=PV.ctx;let t=c.currentTime+.1;
  const g=(db)=>Math.pow(10,db/20)*.9;
  const music=(id,at)=>{if(!id)return at;const m=MUSIC.find(x=>x.id===id);const base=[220,261.6,196,246.9][hashStr(id)%4];for(let i=0;i<4;i++){const o=c.createOscillator(),gg=c.createGain();o.type='triangle';o.frequency.value=base*[1,1.25,1.5,2][i];gg.gain.setValueAtTime(0,at+i*.2);gg.gain.linearRampToValueAtTime(.06,at+i*.2+.04);gg.gain.exponentialRampToValueAtTime(.001,at+i*.2+.45);o.connect(gg);gg.connect(c.destination);o.start(at+i*.2);o.stop(at+i*.2+.5);}return at+1;};
  t=music(D.intro,t);
  for(const s of D.seq){const cl=clipById(s.id);const L=levelOf(cl),amp=g(L+10);const dur=Math.min(1.4,.6+cl.dur*.6);
    if(cl.type==='voce'||cl.type==='narr'){const base=cl.type==='narr'?120:(hashStr(cl.title)%2?110:190)+(hashStr(cl.title)%40);const n=Math.floor(dur*5);
      for(let i=0;i<n;i++){const st=t+i*(dur/n),o=c.createOscillator(),f=c.createBiquadFilter(),gg=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(base*(1+.15*Math.sin(i*1.7)),st);f.type='bandpass';f.frequency.value=[500,900,1400,700][i%4];f.Q.value=3;gg.gain.setValueAtTime(0,st);gg.gain.linearRampToValueAtTime(amp*.5,st+.03);gg.gain.exponentialRampToValueAtTime(.001,st+dur/n*.9);o.connect(f);f.connect(gg);gg.connect(c.destination);o.start(st);o.stop(st+dur/n);}
      // fruscio proporzionale ai difetti di qualità
      const nb=c.createBuffer(1,c.sampleRate*dur,c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(100-cl.q)/100*.2;const ns=c.createBufferSource();ns.buffer=nb;const gn=c.createGain();gn.gain.value=amp*.7;ns.connect(gn);gn.connect(c.destination);ns.start(t);}
    t+=dur+.08;}
  music(D.outro,t);
  PV.timers.push(setTimeout(()=>stopPreview(),(t-c.currentTime+1.4)*1000));
}
