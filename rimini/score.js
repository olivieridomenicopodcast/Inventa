'use strict';
/* RIMINI 3 GIORNI · punteggio personale della partita e record: non c'è un massimo, ogni partita (run) dà un punteggio
   calcolato da ciò che fai; il migliore viene ricordato sul dispositivo, così ha senso rigiocare. In sandbox il punteggio
   si vede ma non conta per il record. */
function scoreRun(){
  const F=G.flags,C=cmEnsure(),rows=[];
  const add=(l,n,each,note)=>{if(n)rows.push({l,n,each,pts:n*each,note});};
  const items=Object.keys(G.items||{}),lv=(typeof cmLevelInfo==='function')?cmLevelInfo(cmMyPts(cmT())):{l:1,pt:0};
  const lateDays=new Set((C.late||[]).map(x=>x.day)).size;
  add('Speech seguiti',F.talk||0,60);
  add('Workshop seguiti',F.ws||0,50);
  add('Persone conosciute',G.contacts.length,15);
  add('Meeting fatti',F.meet||0,40);
  add('Persone vicine al tuo mestiere',F.hot||0,10);
  add('Stand visitati',Object.keys(F.stands||{}).length,10);
  add('Appunti presi',G.tips.length,5);
  add('Firmacopie',F.sign?1:0,30);
  add('Riattivazioni',F.react||0,20);
  add('Yoga Silent Party',F.party?1:0,30);
  add('Game quiz',F.quiz||0,20);
  add('Oggetti nascosti trovati',items.filter(i=>i!=='banner').length,40);
  add('Stendardo trovato',items.includes('banner')?1:0,60);
  add('Stendardo piantato',F.banner?1:0,100);
  add('Esibizioni al karaoke',F.kn||0,20);
  add('Stelle del karaoke',F.ks||0,10);
  add('Trofei raccolti',typeof trophyCount==='function'?trophyCount()-((G.trophies||{}).bmu?1:0):0,25);
  add('Tutta la Marketers Family incontrata',typeof trophyGroupDone==='function'&&trophyGroupDone('fam')?1:0,100);
  add('Gruppo BMU al completo',(G.trophies||{}).bmu?1:0,100);
  add('Marketers Meetup al Sunflower',F.sun?1:0,30);
  add('Pigiama party',F.pjp?1:0,40);
  add('Giochi del pigiama party',F.pjg||0,15);
  add('Proposta di collaborazione',F.offer?1:0,50);
  add('Post su Marketers Pro',C.posts.length,8);
  add('Mi piace ricevuti',cmMyPts(cmT()),2);
  add('Livello su Marketers Pro',lv.l-1,20,'Livello '+lv.l);
  add('Foto e selfie',(G.album||[]).length,8);
  add('Obiettivi completati',progress().done,25);
  add('Domande al relatore',F.qa||0,15);
  add('Favori ai partecipanti',F.fav||0,35);
  add('Sessioni lasciate a metà',-(F.early||0),15);
  add('Meeting saltati',-(C.noshow||[]).length,30);
  add('Arrivi in ritardo alla serata',-lateDays,25);
  const total=Math.max(0,rows.reduce((s,r)=>s+r.pts,0));
  return{total,rows};
}
let _scC=null;
function scoreNow(){if(!G)return 0;const t=Math.floor(G.t*2);if(_scC&&_scC.t===t&&_scC.g===G)return _scC.v;let v=0;try{v=scoreRun().total;}catch(e){v=0;}_scC={t,g:G,v};return v;}
const scoreBest=()=>lsGet('rimini.best',null);
/* salva la partita nelle ultime run e aggiorna il record (solo partita a tempo) */
function scoreSave(total){
  if(G.sandbox)return{record:false,prev:(scoreBest()||{}).score||0,valid:false};
  const best=scoreBest(),prev=best?best.score:0;
  if(!G.rid)G.rid=Date.now();
  const runs=lsGet('rimini.runs',[]),i=runs.findIndex(r=>r.id===G.rid),e={id:G.rid,score:total,job:ME().job,seed:G.seed,at:Date.now()};
  if(i>=0)runs[i]=e;else runs.unshift(e);lsSet('rimini.runs',runs.slice(0,8));
  const record=total>prev;if(record)lsSet('rimini.best',{score:total,job:ME().job,seed:G.seed,at:Date.now()});
  return{record,prev,valid:true};
}
function scoreCard(){
  const b=scoreBest();
  return `<div class="bn" style="cursor:default">Punteggio della partita: <b>${scoreNow()}</b>${G.sandbox?' (sandbox: non vale per il record)':b?' · Record: <b>'+b.score+'</b>':''}</div>`;
}
function scoreEndHtml(){
  const S=scoreRun(),r=scoreSave(S.total),runs=lsGet('rimini.runs',[]).slice(0,5);
  const missing=[['Speech seguiti',60],['Workshop seguiti',50],['Meeting fatti',40],['Oggetti nascosti trovati',40],['Persone conosciute',15],['Post su Marketers Pro',8]].filter(m=>!S.rows.some(x=>x.l===m[0])).slice(0,3);
  if(r.record&&A.fanfare)setTimeout(()=>A.fanfare(),400);
  let h=`<div class="scbox"><div class="sct">PUNTEGGIO</div><div class="scn">${S.total}</div>`;
  if(r.valid)h+=r.record?`<div class="scr">Nuovo record personale! (prima: ${r.prev})</div>`:`<div class="scs">Record personale: ${r.prev}${r.prev>S.total?' · te ne mancano '+(r.prev-S.total)+' per superarlo':''}</div>`;
  else h+='<div class="scs">Sandbox: il punteggio non conta per il record. Prova la modalità a tempo!</div>';
  h+='<div class="scl">'+S.rows.map(x=>`<div><span>${esc(x.l)}${Math.abs(x.n)!==1?' × '+Math.abs(x.n):''}${x.note?' ('+esc(x.note)+')':''}</span><b class="${x.pts<0?'neg':''}">${x.pts>0?'+':''}${x.pts}</b></div>`).join('')+'</div>';
  if(missing.length)h+='<div class="scs" style="margin-top:8px">Per il prossimo run: '+missing.map(m=>esc(m[0])+' (+'+m[1]+' ciascuno)').join(', ')+'.</div>';
  if(r.valid&&runs.length>1)h+='<div class="scs" style="margin-top:8px">Ultime partite: '+runs.map(x=>x.score).join(' · ')+'</div>';
  h+='<div class="scs" style="margin-top:8px">Non c’è un massimo: cambia mestiere o seme, incontra altre persone e prova a fare di meglio.</div></div>';
  updateBestLine();return h;
}
function updateBestLine(){const e=document.getElementById('bestLine');if(!e)return;const b=scoreBest();e.textContent=b?'Record personale: '+b.score+' punti':'';}
document.addEventListener('DOMContentLoaded',updateBestLine);updateBestLine();
