'use strict';
/* ECO · avvio, schermata del titolo, controlli touch */
const dpadEls={};
function bindDpad(){
  for(const d of ['up','down','left','right']){
    const b=$('#dp_'+d);const on=e=>{e.preventDefault();dpad[d]=1;b.classList.add('on');};const off=e=>{e.preventDefault();dpad[d]=0;b.classList.remove('on');};
    b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);
  }
  $('#btnA').addEventListener('pointerdown',e=>{e.preventDefault();if(dlgRes)dlgAdvance();else interact();});
  $('#btnN').addEventListener('pointerdown',e=>{e.preventDefault();if(!busy)openNotebook();});
  $('#btnM').addEventListener('pointerdown',e=>{e.preventDefault();if(!busy)openMenu();});
  $('#bNb').onclick=()=>{if(!busy)openNotebook();};$('#bMap').onclick=()=>{if(!busy)openMapUI();};$('#bMenu').onclick=()=>{if(!busy)openMenu();};
}
function startWorld(){
  buildOutEnts();placePlayer(G.x,G.y,G.dir||'down');
  $('#title').classList.remove('on');$('#hud').classList.remove('hide');if(MOB)$('#touch').classList.remove('hide');
  history.replaceState(null,'','#'+G.seed);
  if(G.where!=='out')getInterior(W,G.where);
  updateHud();
  if(!G.flags.intro&&!G.flags.tutorial){G.flags.tutorial=1;setTimeout(()=>toast('Entra in casa e parla con tua zia: premi E / Spazio davanti alle persone e agli oggetti.',5200),400);}
}
function titleInit(){
  const seedIn=$('#seed'),ls=lsGet('eco.lastseed','');
  let h=location.hash.slice(1).toUpperCase();if(!/^[A-Z0-9]{2,8}$/.test(h))h=ls||newSeed();
  seedIn.value=h;
  const refresh=()=>{
    const seed=seedIn.value.toUpperCase().replace(/[^A-Z0-9]/g,'');const has=!!lsGet(saveKey(seed),null);
    $('#goCont').disabled=!has;$('#goCont').style.opacity=has?1:.4;
    clearTimeout(refresh.t);refresh.t=setTimeout(()=>{if(seed.length<2)return;const w=genWorld(seed);
      $('#preview').innerHTML=`<b>Regione di ${esc(w.name)}</b><br>${w.towns.length} paesi · ${w.cases.length} misteri · ${Object.keys(w.npcs).length} persone · ${Object.keys(w.items).length} informazioni · ${w.rivals.length} podcast rivali<br><span class="dim">${w.cases.map(c=>esc(c.title)).join(' · ')}</span>`;},150);
  };
  seedIn.addEventListener('input',refresh);refresh();
  $('#dice').onclick=()=>{seedIn.value=newSeed();refresh();};
  $('#goNew').onclick=()=>{const seed=seedIn.value.toUpperCase().replace(/[^A-Z0-9]/g,'')||newSeed();newGame(seed);lsSet('eco.lastseed',seed);startWorld();};
  $('#goCont').onclick=()=>{const seed=seedIn.value.toUpperCase().replace(/[^A-Z0-9]/g,'');if(loadGame(seed)){lsSet('eco.lastseed',seed);startWorld();}};
  const sv=listSaves();$('#saves').innerHTML=sv.length?'<label>Indagini in corso</label>'+sv.map(s=>`<div class="srow" data-s="${s.seed}"><b>${s.seed}</b><span class="dim">giorno ${s.day} · ${s.eps} puntate · € ${fmt(s.money)}</span></div>`).join(''):'';
  $('#saves').onclick=e=>{const r=e.target.closest('.srow');if(r){seedIn.value=r.dataset.s;refresh();$('#goCont').click();}};
}
(function boot(){
  resize();bindDpad();titleInit();requestAnimationFrame(frame);
  window.__eco={get G(){return G;},get W(){return W;},newGame,startWorld,loadGame,saveGame,interact,tryMove,P,curMap,say,noteItem,openDAW,scoreEpisode,publishEpisode,newClip,getInterior,skillLvl,addXp,sleep,openHost,openNotebook,openArchive,enterBuilding,statementAvail,gateCheck,corrob,openShop,openPC,openNarration,normalizeClip,genWorld,studioQuality,fieldQuality,openMenu,openMapUI,patienceOf,trustOf,solidAt,dpad};
})();
