'use strict';
/* CAMION · interfaccia, rendering di scena, menu, mappa, avvio */
const cv=$('#cv'),ctx=cv.getContext('2d'),mini=$('#mini'),mctx=mini.getContext('2d');
let VW=0,VH=0,DPR=1,last=0,mapOpen=false,modalKind=null,started=false;
const cam={x:0,y:0,z:3};
const MOB=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;
if(MOB){document.body.classList.add('mob');$('#touch').classList.remove('hide');}
const IND_IC={miniera:'⛏️',cava:'🪨',segheria:'🪵',fattoria:'🌾',caseificio:'🧀',alimentare:'🥫',birrificio:'🍺',cantina:'🍷',frantoio:'🫒',acciaieria:'🏭',raffineria:'🛢️',chimica:'🧪',cementificio:'🏗️',prefab:'🧱',mobilificio:'🛋️',elettronica:'📟',auto:'🚗',officina:'⚙️',tessile:'👕',tipografia:'📚',farmaceutica:'💊',centrale:'⚡',cantiere:'🚧',ipermercato:'🛒',concessionaria:'🚘',ospedale:'🏥',porto:'⚓',logistica:'📦',emporio:'🏪'};
const KIND_COL={gas:'#ff5a4d',garage:'#ff9a4d',dealer:'#4dd0ff',company:'#ffc83d'};
const KIND_IC={gas:'⛽',garage:'🔧',dealer:'🚚'};
function resize(){DPR=Math.min(devicePixelRatio||1,2);VW=innerWidth;VH=innerHeight;cv.width=Math.round(VW*DPR);cv.height=Math.round(VH*DPR);cv.style.width=VW+'px';cv.style.height=VH+'px';mini.width=mini.height=Math.round((MOB?120:176)*DPR);if(mapOpen)drawMap();}
addEventListener('resize',resize);resize();
const tankMax=T=>T.model.tank*(1+.15*T.up.tank);

/* ---------- input ---------- */
addEventListener('keydown',e=>{
  if(!started)return;
  const k=e.key.length===1?e.key.toLowerCase():e.key;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
  if(e.target&&e.target.tagName==='INPUT'){if(e.key==='Escape'&&modalKind)closeModal();return;}
  if(e.repeat&&['m','e','c','l','n','Escape'].includes(k))return;
  keys[k]=true;audioInit();
  if(k==='Escape'){if(mapOpen)closeMap();else if(modalKind)closeModal();else openPause();}
  else if(k==='m'){mapOpen?closeMap():openMap();}
  else if(k==='e')interact();
  else if(k==='f'){modalKind==='dir'?closeModal():openDirectory();}
  else if(k==='c'){toggleCruise();}
  else if(k==='l'){G.lights=!G.lights;toast(G.lights?'Luci accese':'Luci spente',900);}
  else if(k==='h')horn();
  else if(k==='n'){if(G.job){setGps(destTarget(G.job));toast('Navigatore sul carico',1200);}else if(G.gps){G.gps=null;toast('Navigatore spento',1200);}}
});
addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
function toggleCruise(){if(G.cruise>0){G.cruise=0;toast('Cruise control off',900);}else if(G.v>4){G.cruise=G.v;toast('Cruise control '+Math.round(G.v*3.6)+' km/h',1200);}else toast('Vai più veloce di 15 km/h per il cruise control',1500);}
function bindHold(id,key){const b=$(id);const on=e=>{e.preventDefault();touch[key]=1;b.classList.add('on');audioInit();};const off=e=>{e.preventDefault();touch[key]=0;b.classList.remove('on');};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);}
bindHold('#tL','l');bindHold('#tR','r');bindHold('#tG','gas');bindHold('#tB','brk');
$('#tE').addEventListener('pointerdown',e=>{e.preventDefault();audioInit();interact();});
$('#tM').addEventListener('pointerdown',e=>{e.preventDefault();mapOpen?closeMap():openMap();});
$('#tC').addEventListener('pointerdown',e=>{e.preventDefault();toggleCruise();});
$('#tP').addEventListener('pointerdown',e=>{e.preventDefault();openPause();});
$('#bMap').onclick=()=>mapOpen?closeMap():openMap();
$('#bMenu').onclick=()=>openPause();
$('#prompt').addEventListener('pointerdown',e=>{e.preventDefault();interact();});

/* ---------- interazione ---------- */
function interact(){
  if(modalKind){closeModal();return;}
  if(mapOpen||!G)return;
  const o=currentPoi();if(!o){toast('Nessun luogo qui vicino',900);return;}
  if(Math.abs(G.v)>4){toast('Rallenta per fermarti qui',1200);return;}
  const k=o.p.kind;
  G.visited[o.s.id]=1;
  if(k==='company')openCompany(o);else if(k==='gas')openGas(o);else if(k==='garage')openGarage(o);else if(k==='dealer')openDealer(o);
}
let modalAt=0;
function openModal(html,kind,cls){if(modalKind!==kind)modalAt=performance.now();modalKind=kind;const m=$('#modal');m.innerHTML='<div class="box'+(cls?' '+cls:'')+'">'+html+'</div>';m.classList.remove('hide');G.menu=kind;}
function closeModal(){modalKind=null;$('#modal').classList.add('hide');G.menu=null;G.menuData=null;}
$('#modal').addEventListener('pointerdown',e=>{if(e.target.id==='modal')closeModal();});
$('#modal').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled||performance.now()-modalAt<380)return;act(b.dataset.a,b.dataset);});
const money=n=>'€ '+fmt(n);
function cargoTags(cg,j){let t='';if(cg.hz)t+='<span class="tag w">ADR</span>';if(cg.hv)t+='<span class="tag w">Pesante</span>';if(cg.fr>=.6)t+='<span class="tag b">Fragile</span>';if(j&&j.frontier)t+='<span class="tag g">Frontiera</span>';t+=`<span class="tag">${TRAILERS[cg.tr]}</span>`;return t;}
function mmss(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}

function openCompany(o){
  const{p,s}=o,comp=p.comp,ind=comp.ind;
  let h=`<button class="x" data-a="close">✕</button><h2>${IND_IC[ind.id]||'🏢'} ${comp.name}</h2><div class="sub">${ind.n} · ${s.name}</div>`;
  const job=G.job;
  if(job&&job.toComp===comp.id){
    const e=jobEarn(job),cg=CARGO_BY[job.cargo];
    h+=`<h3>Consegna</h3><div class="row"><div class="ic">${cg.ic}</div><div><div class="t">${cg.n} · ${job.tons} t</div><div class="d">Danni al carico: ${Math.round(job.dmg*100)}% · ${e.late>0?'<b style="color:#ff7a6d">in ritardo di '+mmss(e.late)+'</b>':'in tempo: '+mmss(job.deadline-G.t)+' di margine'}${e.bonus?' · bonus puntualità':''}</div></div><div class="pay">${money(e.pay)}<div style="font-size:10px;color:var(--dim);font-weight:400">+${e.xp} XP</div></div></div><button class="mb" data-a="deliver" style="width:100%;margin-bottom:6px">Consegna il carico</button>`;
  }
  const tags=[];
  if(ind.in.length)tags.push('<span class="tag b">Riceve: '+ind.in.map(x=>CARGO_BY[x].ic+' '+CARGO_BY[x].n).join(', ')+'</span>');
  if(ind.out.length)tags.push('<span class="tag g">Produce: '+ind.out.map(x=>CARGO_BY[x].ic+' '+CARGO_BY[x].n).join(', ')+'</span>');
  h+=`<div style="margin:10px 0 2px;line-height:2">${tags.join(' ')}</div>`;
  G.menuData={jobs:{}};
  if(ind.out.length){
    const jobs=W.jobsFor(s,comp,G.day).filter(j=>!G.taken[j.id]);
    h+=`<h3>Carichi disponibili · giorno ${G.day+1}</h3>`;
    if(!jobs.length)h+='<div class="sub">Oggi non ci sono più carichi qui. Torna domani!</div>';
    for(let j of jobs){
      const cap=G.truck.model.cap,part=j.tons>cap;
      if(part)j=Object.assign({},j,{tons:cap,pay:Math.round(j.pay*cap/j.tons/5)*5,part:true});
      G.menuData.jobs[j.id]=j;const cg=CARGO_BY[j.cargo],ds=W._site.get(j.to),dc=W.companiesOf(ds).find(c=>c.id===j.toComp);
      let why=null;if(G.job)why='Hai già un incarico';else if(G.level<cg.lvl)why='Livello '+cg.lvl;else if(j.tons>G.truck.model.cap)why='Max '+G.truck.model.cap+' t';
      h+=`<div class="row"><div class="ic">${cg.ic}</div><div><div class="t">${cg.n} · ${j.tons} t ${j.part?'<span class="tag g">Carico ridotto</span>':''}${cargoTags(cg,j)}</div><div class="d">→ ${dc.name}, ${ds.name} · ${(j.dist/1000).toFixed(1)} km · tempo ${mmss(j.secs)}${why?` · <b style="color:#ff9a4d">${why}</b>`:''}</div></div><div class="pay">${money(j.pay)}</div><button class="mb" data-a="take" data-id="${j.id}" ${why?'disabled':''}>Accetta</button></div>`;
    }
  }else h+='<div class="sub" style="margin-top:12px">Questa azienda non spedisce merci: accetta solo consegne.</div>';
  if(job&&!(job.toComp===comp.id))h+=`<h3>Incarico in corso</h3><div class="sub">${CARGO_BY[job.cargo].ic} ${CARGO_BY[job.cargo].n} per ${W._site.get(job.to).name}</div><button class="mb gh" data-a="cancel">Annulla incarico (penale 10%)</button>`;
  openModal(h,'company');
}
function openGas(o){
  const s=o.s,T=G.truck,tm=tankMax(T),need=tm-T.fuel;
  const h=`<button class="x" data-a="close">✕</button><h2>⛽ Distributore · ${s.name}</h2><div class="sub">Gasolio € ${s.fuel.toFixed(2)} / litro</div>
  <div class="kv"><div>Serbatoio<b>${Math.round(T.fuel)} / ${Math.round(tm)} L</b></div><div>Autonomia<b>~${Math.round(T.fuel/(FUEL_K*.012*T.model.eff*1.1))} km</b></div><div>Cassa<b>${money(G.money)}</b></div></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="mb" data-a="fuel" data-n="50" ${need<1?'disabled':''}>+50 L · ${money(50*s.fuel)}</button><button class="mb" data-a="fuel" data-n="150" ${need<1?'disabled':''}>+150 L · ${money(150*s.fuel)}</button><button class="mb" data-a="fuel" data-n="9999" ${need<1?'disabled':''}>Pieno · ${money(need*s.fuel)}</button></div>`;
  openModal(h,'gas');G.menuData={s};
}
function repairCost(T){return Math.round(T.dmg*T.model.price*.08/10)*10;}
function upCost(T,k){const l=T.up[k];return l>=3?0:Math.round(T.model.price*[.05,.04,.035,.045][['eng','tank','tyre','aero'].indexOf(k)]*(l+1)/50)*50;}
function openGarage(o){
  const T=G.truck,s=o.s,rc=repairCost(T);
  const ups=[['eng','🔥','Potenziamento motore','+8% potenza'],['tank','🛢️','Serbatoio maggiorato','+15% capacità'],['tyre','🛞','Pneumatici sportivi','+6% aderenza'],['aero','🌬️','Deflettori aerodinamici','−6% resistenza']];
  const sel=G.menuData&&G.menuData.sel||{hue:T.hue,accent:T.accent};
  const sw=(arr,key)=>'<div class="sw">'+arr.map(hu=>`<button data-a="pick" data-k="${key}" data-v="${hu}" class="${sel[key]===hu?'on':''}" style="background:hsl(${hu},${key==='hue'?52:70}%,${key==='hue'?46:52}%)"></button>`).join('')+'</div>';
  const hues=[0,18,36,52,90,140,170,195,215,240,275,310,335];
  let h=`<button class="x" data-a="close">✕</button><h2>🔧 Officina · ${s.name}</h2><div class="sub">${T.model.bn} ${T.model.name}</div>
  <div class="kv"><div>Danni<b>${Math.round(T.dmg*100)}%</b></div><div>Km percorsi<b>${fmt(T.odo/1000*1)} km</b></div><div>Cassa<b>${money(G.money)}</b></div></div>
  <h3>Riparazioni</h3><div class="row"><div class="ic">🛠️</div><div><div class="t">Riparazione completa</div><div class="d">Ripristina motore e carrozzeria.</div></div><div class="pay">${money(rc)}</div><button class="mb" data-a="repair" ${rc<=0?'disabled':''}>Ripara</button></div>
  <h3>Potenziamenti</h3>`;
  for(const [k,ic,n,d] of ups){const l=T.up[k],c=upCost(T,k);h+=`<div class="row"><div class="ic">${ic}</div><div><div class="t">${n} <span class="tag">liv ${l}/3</span></div><div class="d">${d} per livello</div></div><div class="pay">${l>=3?'MAX':money(c)}</div><button class="mb" data-a="upg" data-k="${k}" ${l>=3?'disabled':''}>Installa</button></div>`;}
  h+=`<h3>Verniciatura</h3><div class="sub">Colore base</div>${sw(hues,'hue')}<div class="sub">Colore accento</div>${sw(hues,'accent')}<button class="mb" data-a="paint">Verniciare · € 400</button>`;
  openModal(h,'garage');G.menuData={s,sel};
}
function tradeIn(T){return Math.round(T.model.price*(1-T.dmg*.6)*.5/100)*100;}
function specBar(l,v,max,txt){return `<div class="spec">${l}<i><b style="width:${clamp(v/max*100,4,100)}%"></b></i><span>${txt}</span></div>`;}
function openDealer(o){
  const s=o.s,week=Math.floor(G.day/7),stock=W.dealerStock(s,week).filter(x=>!G.sold[s.id+x.id+week]),T=G.truck,ti=tradeIn(T);
  const mx={hp:700,cap:48,tank:950,sp:112};
  let h=`<button class="x" data-a="close">✕</button><h2>🚚 Concessionaria · ${s.name}</h2><div class="sub">Il tuo camion vale ${money(ti)} come permuta · Cassa ${money(G.money)}</div><div class="grid2" style="margin-top:12px">`;
  stock.forEach((c,i)=>{const m=c.model,b=W.brands[m.brand],net=c.price-ti,conf=G.menuData&&G.menuData.conf===i;
    h+=`<div class="tcard"><canvas data-prev="${i}" width="300" height="120"></canvas><div class="nm">${m.name}</div><div class="br">${b.name} · ${m.axles} ${c.used?'<span class="tag w">usato · '+fmt(c.odo/1000)+' mila km</span>':'<span class="tag g">nuovo</span>'}</div>
    ${specBar('Potenza',m.hp,mx.hp,m.hp+' cv')}${specBar('Portata',m.cap,mx.cap,m.cap+' t')}${specBar('Serbatoio',m.tank,mx.tank,m.tank+' L')}${specBar('Velocità',m.topKmh,mx.sp,m.topKmh+' km/h')}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><div><div style="font-family:var(--disp);font-weight:700">${money(c.price)}</div><div style="font-size:10px;color:var(--dim)">con permuta ${money(Math.max(0,net))}</div></div><button class="mb ${conf?'rd':''}" data-a="buy" data-i="${i}" ${G.money<net?'disabled':''}>${conf?'Conferma':'Compra'}</button></div></div>`;});
  if(!stock.length)h+='<div class="sub">Nessun camion disponibile questa settimana.</div>';
  h+='</div>';
  openModal(h,'dealer');G.menuData={s,stock,week,conf:G.menuData&&G.menuData.conf};
  document.querySelectorAll('canvas[data-prev]').forEach(c=>{const t=stock[+c.dataset.prev];previewTruck(c,t);});
}
function previewTruck(c,t){
  const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);
  const s=truckSprite({model:t.model,hue:t.hue,accent:t.accent,dmg:t.dmg}),tr=trailerSprite('furgone',null,null);
  g.save();g.translate(c.width*.7,c.height/2);g.scale(1.15,1.15);g.drawImage(tr.cv,-tr.ox,-tr.oy);g.drawImage(s.cv,-s.ox,-s.oy);g.restore();
}
function openPause(){
  if(!G||!started)return;
  const T=G.truck,m=T.model;
  const h=`<button class="x" data-a="close">✕</button><h2>Pausa</h2><div class="sub">Seme ${G.seed} · giorno ${G.day+1} · ${fmtClock()}</div>
  <div class="kv"><div>Cassa<b>${money(G.money)}</b></div><div>Livello<b>${G.level}</b></div><div>Consegne<b>${G.done}</b></div><div>Distanza<b>${fmt(G.km/1000)} km</b></div></div>
  <h3>Il tuo camion</h3><div class="row"><div class="ic">🚛</div><div><div class="t">${m.bn} ${m.name}</div><div class="d">${m.hp} cv · ${m.cap} t · serbatoio ${Math.round(tankMax(T))} L · ${m.axles} · danni ${Math.round(T.dmg*100)}% · mod: motore ${T.up.eng}, serbatoio ${T.up.tank}, gomme ${T.up.tyre}, aero ${T.up.aero}</div></div><div></div></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="mb" data-a="close">Riprendi</button><button class="mb gh" data-a="save">Salva</button><button class="mb gh" data-a="map">Mappa</button><button class="mb gh" data-a="info">Info sul mondo</button><button class="mb gh" data-a="help">Comandi</button><button class="mb gh" data-a="snd">Suono: ${AU.on?'on':'off'}</button><a class="mb gh" href="index.html" style="text-decoration:none">← Hub</a></div>
  <h3>Emergenze</h3><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="mb gh" data-a="tow">Soccorso su strada · € 300</button><button class="mb gh" data-a="fuelrescue">Soccorso carburante</button>${G.job?'<button class="mb gh" data-a="cancel">Annulla incarico</button>':''}<button class="mb rd" data-a="quit">Esci al titolo</button></div>`;
  openModal(h,'pause');
}
function openInfo(){
  const st=W.stats();let h=`<button class="x" data-a="close">✕</button><h2>Il mondo ${G.seed}</h2><div class="sub">Regione di ${W.region} · tutto generato dal seme</div>
  <div class="kv"><div>Città e avamposti<b>${st.cities}+∞</b></div><div>Aziende<b>${st.comps}</b></div><div>Strade<b>${st.roads} km</b></div><div>Concessionarie<b>${st.dealers}</b></div><div>Officine<b>${st.garages}</b></div><div>Marchi<b>${st.brands}</b></div><div>Modelli camion<b>${st.models}</b></div><div>Tipi di carico<b>${st.cargoAll}</b></div></div>
  <h3>Marchi del mondo</h3>`;
  for(const b of W.brands){const ms=W.models.filter(m=>m.brand===b.id);h+=`<div class="row"><div class="ic" style="color:hsl(${b.hue},60%,55%)">⬤</div><div><div class="t">${b.name}</div><div class="d">${ms.length} modelli · ${Math.min(...ms.map(m=>m.hp))}–${Math.max(...ms.map(m=>m.hp))} cv · cabina ${b.cab==='cab'?'avanzata':'a muso lungo'}</div></div><div></div></div>`;}
  h+=`<h3>Oltre il confine</h3><div class="sub">Fuori dalla regione le <b>Terre Libere</b> proseguono all'infinito: avamposti con pompe e officina, rovine e relitti da scoprire. Scoperte fatte: ${G.stats.disc}.</div>`;
  openModal(h,'info');
}
function openHelp(){
  openModal(`<button class="x" data-a="close">✕</button><h2>Comandi</h2><table class="help" style="margin-top:12px"><tr><td><kbd>W</kbd> <kbd>↑</kbd></td><td>accelera</td></tr><tr><td><kbd>S</kbd> <kbd>↓</kbd></td><td>frena · da fermo, retromarcia</td></tr><tr><td><kbd>A</kbd> <kbd>D</kbd> <kbd>←</kbd> <kbd>→</kbd></td><td>sterza (attento al rimorchio!)</td></tr><tr><td><kbd>Spazio</kbd></td><td>freno a mano</td></tr><tr><td><kbd>E</kbd></td><td>interagisci quando sei fermo su un cerchio colorato: aziende (gialli), pompe (rossi), officine (arancio), concessionarie (azzurri)</td></tr><tr><td><kbd>C</kbd></td><td>cruise control</td></tr><tr><td><kbd>M</kbd></td><td>mappa: clicca una città per vedere le sue aziende e impostare il GPS</td></tr><tr><td><kbd>N</kbd></td><td>navigatore sulla destinazione del carico</td></tr><tr><td><kbd>L</kbd> <kbd>H</kbd></td><td>luci · clacson</td></tr><tr><td><kbd>Esc</kbd></td><td>menu</td></tr></table><div class="sub" style="margin-top:12px">Consigli: rispetta i limiti in città (autovelox), la merce fragile soffre agli urti, e fai rifornimento prima di partire verso le Terre Libere.</div>`,'help');
}
function act(a,d){
  const T=G.truck;
  if(a==='close'){closeModal();}
  else if(a==='take'){const j=G.menuData.jobs[d.id];const err=acceptJob(j);if(err){toast(err);return;}closeModal();toast('Incarico accettato! Il navigatore ti guida alla destinazione',3200);}
  else if(a==='deliver'){const r=deliverJob();if(r)showResult(r);}
  else if(a==='cancel'){const f=cancelJob();toast('Incarico annullato (penale € '+f+')');closeModal();}
  else if(a==='fuel'){const s=G.menuData.s,tm=tankMax(T);let L=Math.min(+d.n,tm-T.fuel,G.money/s.fuel);L=Math.floor(L*10)/10;if(L<=0){toast('Soldi insufficienti');return;}T.fuel+=L;const c=Math.round(L*s.fuel);G.money-=c;G.stats.spent+=c;blip(300,.12,'triangle',.1);openGas({s});}
  else if(a==='repair'){const c=repairCost(T);if(G.money<c){toast('Soldi insufficienti');return;}G.money-=c;G.stats.spent+=c;T.dmg=0;toast('Camion riparato');blip(500,.15,'triangle',.12);openGarage({s:G.menuData.s});}
  else if(a==='upg'){const c=upCost(T,d.k);if(G.money<c){toast('Soldi insufficienti');return;}G.money-=c;G.stats.spent+=c;T.up[d.k]++;if(d.k==='tank')T.fuel+=T.model.tank*.15*(T.fuel/tankMax(T)>.5?0:0);toast('Installato!');blip(600,.2,'triangle',.12);openGarage({s:G.menuData.s});}
  else if(a==='pick'){const md=G.menuData;md.sel[d.k]=+d.v;openGarage({s:md.s});}
  else if(a==='paint'){if(G.money<400){toast('Soldi insufficienti');return;}G.money-=400;G.stats.spent+=400;const sel=G.menuData.sel;T.hue=sel.hue;T.accent=sel.accent;sprCache.clear();toast('Nuova vernice!');openGarage({s:G.menuData.s});}
  else if(a==='buy'){
    const md=G.menuData,i=+d.i,c=md.stock[i],net=c.price-tradeIn(T);
    if(md.conf!==i){md.conf=i;openDealer({s:md.s});return;}
    if(G.money<net){toast('Soldi insufficienti');return;}
    G.money-=net;G.stats.spent+=net;G.sold[md.s.id+c.id+md.week]=1;
    G.truck={model:c.model,hue:c.hue,accent:c.accent,dmg:c.dmg,fuel:c.model.tank*.6,up:{eng:0,tank:0,tyre:0,aero:0},odo:c.odo};sprCache.clear();
    if(G.job&&G.job.tons>c.model.cap)toast('Attenzione: il nuovo camion non regge il carico attuale!',3200);else toast('Hai comprato '+c.model.bn+' '+c.model.name+'!',2600);
    chime();saveGame(true);closeModal();
  }
  else if(a==='save'){saveGame();}
  else if(a==='map'){closeModal();openMap();}
  else if(a==='info')openInfo();
  else if(a==='help')openHelp();
  else if(a==='snd'){AU.on=!AU.on;if(!AU.on&&AU.g)AU.g.gain.value=0;openPause();}
  else if(a==='tow'){closeModal();tow('Soccorso richiesto.');}
  else if(a==='fuelrescue'){closeModal();rescueFuel();}
  else if(a==='quit'){saveGame(true);closeModal();location.reload();}
  else if(a==='resclose'){closeModal();}
  else if(a==='dirgps'){gpsToCompany(d.c,d.s);closeModal();}
}
function showResult(r){
  const cg=CARGO_BY[r.job.cargo];
  openModal(`<button class="x" data-a="close">✕</button><h2>✅ Consegna completata</h2><div class="sub">${cg.ic} ${cg.n} · ${r.job.tons} t · ${(r.job.dist/1000).toFixed(1)} km</div>
  <div class="kv"><div>Paga base<b>${money(r.job.pay)}</b></div><div>Danni al carico<b>${r.dmgPen>0?'−'+Math.round(r.dmgPen*100)+'%':'nessuno'}</b></div><div>Ritardo<b>${r.latePen>0?'−'+Math.round(r.latePen*100)+'%':'in tempo'}</b></div><div>Bonus<b>${r.bonus?'+8%':'—'}</b></div></div>
  <div style="font-family:var(--disp);font-size:30px;font-weight:900;color:#4dff9a;margin:10px 0">${money(r.pay)} <span style="font-size:14px;color:var(--ac)">+${r.xp} XP</span></div>${r.up?`<div class="row"><div class="ic">⭐</div><div><div class="t">Livello ${r.level}!</div><div class="d">Nuovi carichi sbloccati: ${CARGO.filter(c=>c.lvl===r.level).map(c=>c.ic+' '+c.n).join(', ')||'prossimamente…'}</div></div><div></div></div>`:''}
  <button class="mb" data-a="close">Continua</button>`,'result');
}


/* ---------- elenco aziende / ricerca ---------- */
let dirQ='',dirF='all';
function allCompanies(){
  const out=[];
  for(let j=-CORE-1;j<=CORE+1;j++)for(let i=-CORE-1;i<=CORE+1;i++){
    if(!isKnown(i,j))continue;const s=W.site(i,j);if(!s.exists)continue;
    for(const c of W.companiesOf(s))out.push({c,s});
  }
  for(const k in G.explored){const[i,j]=k.split(',').map(Number);if(Math.abs(i)<=CORE+1&&Math.abs(j)<=CORE+1)continue;const s=W.site(i,j);if(s.exists)for(const c of W.companiesOf(s))out.push({c,s});}
  return out;
}
function openDirectory(){
  if(!G)return;if(mapOpen)closeMap();
  const keep=modalKind==='dir';
  const h=`<button class="x" data-a="close">✕</button><h2>🔎 Cerca aziende</h2><div class="sub">Trova un'azienda o un tipo di carico e imposta il navigatore.</div>
  <input id="dirIn" class="srch" placeholder="Nome azienda, città, carico (es. legname)…" value="${dirQ.replace(/"/g,'&quot;')}" autocomplete="off" spellcheck="false">
  <div class="chips" id="dirChips"><button data-f="all">Tutte</button><button data-f="out">Che producono</button><button data-f="in">Che ricevono</button><button data-f="job">Con il mio carico</button></div><div id="dirRes"></div>`;
  if(!keep)openModal(h,'dir');
  const inp=document.querySelector('#dirIn');
  inp.oninput=()=>{dirQ=inp.value;dirRender();};
  document.querySelectorAll('#dirChips button').forEach(b=>b.onclick=()=>{dirF=b.dataset.f;dirRender();});
  dirRender();if(!MOB)inp.focus();
}
function dirRender(){
  document.querySelectorAll('#dirChips button').forEach(b=>b.classList.toggle('on',b.dataset.f===dirF));
  const q=dirQ.trim().toLowerCase(),list=allCompanies();
  const res=list.filter(({c,s})=>{
    if(dirF==='out'&&!c.ind.out.length)return false;if(dirF==='in'&&!c.ind.in.length)return false;
    if(dirF==='job'&&!(G.job&&c.ind.in.includes(G.job.cargo)))return false;
    if(!q)return true;
    const txt=(c.name+' '+s.name+' '+c.ind.n+' '+c.ind.out.concat(c.ind.in).map(x=>CARGO_BY[x].n).join(' ')).toLowerCase();
    return q.split(/\s+/).every(w=>txt.includes(w));
  }).map(o=>(o.d=Math.hypot(o.s.x-G.x,o.s.y-G.y),o)).sort((a,b)=>a.d-b.d).slice(0,40);
  let h='';
  for(const{c,s,d} of res){
    h+=`<div class="row"><div class="ic">${IND_IC[c.ind.id]||'🏢'}</div><div><div class="t">${c.name}</div><div class="d">${c.ind.n} · ${s.name} · ${(d/1000).toFixed(1)} km${c.ind.out.length?'<br>Produce: '+c.ind.out.map(x=>CARGO_BY[x].n).join(', '):''}${c.ind.in.length?'<br>Riceve: '+c.ind.in.slice(0,5).map(x=>CARGO_BY[x].n).join(', ')+(c.ind.in.length>5?'…':''):''}</div></div><div></div><button class="mb" data-a="dirgps" data-c="${c.id}" data-s="${s.id}">GPS</button></div>`;
  }
  document.querySelector('#dirRes').innerHTML=h||'<div class="sub">Nessuna azienda trovata.</div>';
}
function gpsToCompany(cid,sid){
  const s=W._site.get(sid),C=W.city(s),p=C.pois.find(q=>q.kind==='company'&&q.comp.id===cid);if(!p)return;
  setGps({x:p.x,y:p.y,label:p.comp.name+' · '+s.name,site:s.id});toast('Navigatore verso '+p.comp.name,2200);
}
$('#bFind').onclick=()=>openDirectory();
$('#tF').addEventListener('pointerdown',e=>{e.preventDefault();openDirectory();});

/* ---------- mappa a schermo intero ---------- */
const mapcv=$('#mapcv'),mc=mapcv.getContext('2d'),mv={x:0,y:0,z:.06,sel:null};
function openMap(){if(!G||mapOpen)return;if(modalKind)closeModal();mapOpen=true;$('#mapov').classList.remove('hide');mv.x=G.x;mv.y=G.y;mv.z=.055;mv.sel=null;
  $('#maplegend').innerHTML='<b style="color:var(--ink)">Mappa</b> · trascina per spostarti · rotella per lo zoom · tocca una città<br><span style="color:#ffc83d">●</span> città · <span style="color:#ff9a4d">◆</span> avamposto · <span style="color:#4dd0ff">━</span> navigatore · ⭐ scoperte';
  sideMap();drawMap();}
function closeMap(){mapOpen=false;$('#mapov').classList.add('hide');}
$('#mapclose').onclick=closeMap;
function mapToWorld(px,py){return[mv.x+(px*DPR-mapcv.width/2)/(mv.z*DPR),mv.y+(py*DPR-mapcv.height/2)/(mv.z*DPR)];}
function isKnown(cx,cy){return Math.abs(cx)<=CORE+1&&Math.abs(cy)<=CORE+1&&(Math.abs(cx)<=CORE&&Math.abs(cy)<=CORE)||G.explored[cx+','+cy];}
function drawMap(){
  if(!mapOpen)return;
  const w=mapcv.width=Math.round(innerWidth*DPR),h=mapcv.height=Math.round(innerHeight*DPR),z=mv.z*DPR;
  mc.setTransform(1,0,0,1,0,0);mc.fillStyle='#070b14';mc.fillRect(0,0,w,h);
  mc.setTransform(z,0,0,z,w/2-mv.x*z,h/2-mv.y*z);
  const hw=w/2/z,hh=h/2/z,c0=Math.round((mv.x-hw)/CELL)-1,c1=Math.round((mv.x+hw)/CELL)+1,r0=Math.round((mv.y-hh)/CELL)-1,r1=Math.round((mv.y+hh)/CELL)+1;
  mc.imageSmoothingEnabled=true;
  const cells=(c1-c0+1)*(r1-r0+1);
  if(cells>300){mc.setTransform(1,0,0,1,0,0);mc.fillStyle='#fff';mc.font='16px system-ui';mc.fillText('Zoom troppo ampio',30,80);return;}
  for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++){
    const kn=isKnown(cx,cy);
    if(kn)mc.drawImage(mapTile(W,cx,cy),cx*CELL-CELL/2,cy*CELL-CELL/2,CELL+1,CELL+1);
    else{mc.fillStyle='#0b101c';mc.fillRect(cx*CELL-CELL/2,cy*CELL-CELL/2,CELL+1,CELL+1);}
  }
  // confine regione
  const B=(CORE+.5)*CELL;mc.setLineDash([14/z,10/z]);mc.strokeStyle='rgba(255,90,77,.8)';mc.lineWidth=2/z;mc.strokeRect(-B,-B,2*B,2*B);mc.setLineDash([]);
  mc.fillStyle='rgba(255,90,77,.9)';mc.font=`${13/z}px system-ui`;mc.fillText('CONFINE · Terre Libere oltre',-B+30/z,-B-10/z);
  // strade
  const seen=new Set();mc.lineJoin='round';mc.lineCap='round';
  for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++){for(const r of W.nearRoads(cx,cy)){if(seen.has(r.id))continue;seen.add(r.id);
    if(!(isKnown(r.a.cx,r.a.cy)||isKnown(r.b.cx,r.b.cy)))continue;
    mc.beginPath();mc.moveTo(r.pts[0][0],r.pts[0][1]);for(const p of r.pts)mc.lineTo(p[0],p[1]);
    mc.strokeStyle=r.kind==='autostrada'?'#ffb23d':r.kind==='strada'?'#f2f2f2':'#b08a5a';mc.lineWidth=Math.max(r.kind==='sterrata'?1.2:1.8,(r.kind==='autostrada'?5:3.2)*(z*.5))/z;mc.stroke();}}
  // GPS
  if(G.gps&&G.gps.path){mc.beginPath();G.gps.path.forEach((p,i)=>i?mc.lineTo(p[0],p[1]):mc.moveTo(p[0],p[1]));mc.strokeStyle='rgba(77,208,255,.95)';mc.lineWidth=3.5/z;mc.setLineDash([10/z,7/z]);mc.stroke();mc.setLineDash([]);}
  // città
  mc.textAlign='center';
  for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++){const s=W.site(cx,cy);if(!s.exists||!isKnown(cx,cy))continue;
    const rr_=Math.max(5/z,s.r*.9);
    if(s.size){mc.fillStyle='rgba(255,200,61,.22)';mc.strokeStyle='#ffc83d';mc.lineWidth=2/z;mc.beginPath();mc.arc(s.x,s.y,rr_,0,TAU);mc.fill();mc.stroke();mc.fillStyle='#ffc83d';mc.beginPath();mc.arc(s.x,s.y,3/z+s.size*1.2/z,0,TAU);mc.fill();}
    else{mc.fillStyle='#ff9a4d';mc.save();mc.translate(s.x,s.y);mc.rotate(Math.PI/4);mc.fillRect(-4/z,-4/z,8/z,8/z);mc.restore();}
    if(mv.sel===s.id){mc.strokeStyle='#fff';mc.lineWidth=2.5/z;mc.beginPath();mc.arc(s.x,s.y,rr_+8/z,0,TAU);mc.stroke();}
    if(G.visited[s.id]){mc.fillStyle='#4dff9a';mc.beginPath();mc.arc(s.x+rr_*.8,s.y-rr_*.8,3/z,0,TAU);mc.fill();}
    if(z>.03||s.size>=2){mc.fillStyle='#fff';mc.strokeStyle='rgba(0,0,0,.8)';mc.lineWidth=3/z;mc.font=`600 ${(s.size?12:10.5)/z}px system-ui`;mc.strokeText(s.name,s.x,s.y+rr_+13/z);mc.fillText(s.name,s.x,s.y+rr_+13/z);}
  }
  // scoperte
  mc.font=`${14/z}px system-ui`;
  for(const id in G.disc){const m=/^L(-?\d+),(-?\d+)$/.exec(id);if(!m)continue;const lm=W.landmarkIn(+m[1],+m[2]);if(lm){mc.fillStyle='#ffe58a';mc.fillText('⭐',lm.x,lm.y);if(z>.08){mc.fillStyle='#fff';mc.font=`${10/z}px system-ui`;mc.fillText(lm.name,lm.x,lm.y+14/z);mc.font=`${14/z}px system-ui`;}}}
  // destinazione
  if(G.gps){mc.fillStyle='#4dd0ff';mc.beginPath();mc.arc(G.gps.target.x,G.gps.target.y,6/z,0,TAU);mc.fill();mc.strokeStyle='#fff';mc.lineWidth=2/z;mc.stroke();}
  // camion
  mc.save();mc.translate(G.x,G.y);mc.rotate(G.th);mc.fillStyle='#ff4d6a';mc.strokeStyle='#fff';mc.lineWidth=2/z;mc.beginPath();mc.moveTo(11/z,0);mc.lineTo(-8/z,6/z);mc.lineTo(-4/z,0);mc.lineTo(-8/z,-6/z);mc.closePath();mc.fill();mc.stroke();mc.restore();
}
function sideMap(){
  const side=$('#mapside');
  if(!mv.sel){side.innerHTML=`<button class="mb" data-m="find" style="width:100%;margin-bottom:12px">🔎 Cerca aziende</button><h2>Regione di ${W.region}</h2><div style="color:var(--dim);line-height:1.6;margin-top:6px">Tocca una città o un avamposto per vedere servizi e aziende e impostare il navigatore.<br><br>Fuori dal confine rosso si estendono le <b style="color:var(--ink)">Terre Libere</b>: la mappa continua all'infinito e si svela man mano che la esplori.</div><div class="kv" style="margin-top:14px"><div>Celle esplorate<b>${Object.keys(G.explored).length}</b></div><div>Scoperte<b>${G.stats.disc}</b></div></div>${G.gps?'<button class="mb gh" data-m="nogps">Spegni navigatore</button>':''}`;return;}
  const s=W._site.get(mv.sel),comps=W.companiesOf(s),d=Math.hypot(s.x-G.x,s.y-G.y);
  let h=`<h2>${s.name}</h2><div style="color:var(--dim);margin-bottom:8px">${s.size?['','Piccola città','Città','Grande città'][s.size]:'Avamposto'} · ${fmt(s.pop)} abitanti · ${BIOME_N[s.biome]}${s.coast?' · costa':''}<br>${(d/1000).toFixed(1)} km da te</div>
  <div style="margin:6px 0">${s.services.gas?'<span class="tag w">⛽ € '+s.fuel.toFixed(2)+'</span>':''}${s.services.garage?'<span class="tag w">🔧 officina</span>':''}${s.services.dealer?'<span class="tag b">🚚 concessionaria</span>':''}</div>
  <div style="display:flex;gap:6px;margin:10px 0"><button class="mb" data-m="gps">Imposta GPS</button><button class="mb gh" data-m="center">Centra</button></div><h3 style="font-family:var(--disp);font-size:11px;letter-spacing:.16em;color:var(--ac);text-transform:uppercase;margin:10px 0 6px">Aziende</h3>`;
  for(const c of comps){h+=`<div class="row" style="grid-template-columns:auto 1fr auto;padding:8px 10px"><div class="ic" style="font-size:20px;width:30px">${IND_IC[c.ind.id]||'🏢'}</div><div><div class="t" style="font-size:13px">${c.name}</div><div class="d">${c.ind.out.length?'Produce '+c.ind.out.map(x=>CARGO_BY[x].n).join(', '):''}${c.ind.out.length&&c.ind.in.length?' · ':''}${c.ind.in.length?'Riceve '+c.ind.in.slice(0,4).map(x=>CARGO_BY[x].n).join(', ')+(c.ind.in.length>4?'…':''):''}</div></div><button class="mb" style="padding:7px 11px" data-m="cgps" data-c="${c.id}" data-s="${s.id}">GPS</button></div>`;}
  side.innerHTML=h;
}
$('#mapside').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;const s=mv.sel&&W._site.get(mv.sel);
  if(b.dataset.m==='gps'&&s){setGps({x:s.x,y:s.y,label:s.name,site:s.id});toast('Navigatore verso '+s.name);closeMap();}
  else if(b.dataset.m==='center'&&s){mv.x=s.x;mv.y=s.y;mv.z=.12;drawMap();}
  else if(b.dataset.m==='find'){openDirectory();}
  else if(b.dataset.m==='cgps'){gpsToCompany(b.dataset.c,b.dataset.s);closeMap();}
  else if(b.dataset.m==='nogps'){G.gps=null;sideMap();drawMap();}});
let mdrag=null,mmoved=0;
mapcv.addEventListener('pointerdown',e=>{mdrag={x:e.clientX,y:e.clientY};mmoved=0;mapcv.setPointerCapture(e.pointerId);mapcv.style.cursor='grabbing';});
mapcv.addEventListener('pointermove',e=>{if(!mdrag)return;const dx=e.clientX-mdrag.x,dy=e.clientY-mdrag.y;mmoved+=Math.abs(dx)+Math.abs(dy);mv.x-=dx/mv.z;mv.y-=dy/mv.z;mdrag={x:e.clientX,y:e.clientY};drawMap();});
mapcv.addEventListener('pointerup',e=>{mapcv.style.cursor='grab';if(mdrag&&mmoved<6){const[wx,wy]=mapToWorld(e.clientX,e.clientY);let best=null,bd=1e18;const cx=Math.round(wx/CELL),cy=Math.round(wy/CELL);
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const s=W.site(cx+i,cy+j);if(!s.exists||!isKnown(cx+i,cy+j))continue;const d=Math.hypot(s.x-wx,s.y-wy);if(d<bd&&d*mv.z<Math.max(22,s.r*mv.z+8)){bd=d;best=s;}}
  mv.sel=best?best.id:null;sideMap();drawMap();}mdrag=null;});
mapcv.addEventListener('wheel',e=>{e.preventDefault();const[wx,wy]=mapToWorld(e.clientX,e.clientY);mv.z=clamp(mv.z*(e.deltaY<0?1.2:1/1.2),.012,.6);mv.x=wx-(e.clientX*DPR-mapcv.width/2)/(mv.z*DPR);mv.y=wy-(e.clientY*DPR-mapcv.height/2)/(mv.z*DPR);drawMap();},{passive:false});
let pinch=null;
mapcv.addEventListener('touchmove',e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch){mv.z=clamp(mv.z*d/pinch,.012,.6);drawMap();}pinch=d;e.preventDefault();}},{passive:false});
mapcv.addEventListener('touchend',()=>pinch=null);
setInterval(()=>{if(mapOpen)drawMap();},700);

/* ---------- scena ---------- */
function drawSpr(s,x,y,ang){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(1/SPR,1/SPR);ctx.drawImage(s.cv,-s.ox,-s.oy);ctx.restore();}
const rainP=Array.from({length:130},()=>[Math.random(),Math.random(),.6+Math.random()*.8]);
function render(dt){
  const T=G.truck,spd=Math.abs(G.v);
  const zb=lerp(4.5,2.7,clamp(spd/24,0,1))*clamp(Math.min(VW,VH*1.55)/1150,.62,1.3);
  cam.z+=(zb-cam.z)*Math.min(1,dt*2.2);
  const lx=G.x+Math.cos(G.th)*G.v*.7,ly=G.y+Math.sin(G.th)*G.v*.7;
  if(Math.hypot(lx-cam.x,ly-cam.y)>400){cam.x=lx;cam.y=ly;}else{cam.x+=(lx-cam.x)*Math.min(1,dt*5);cam.y+=(ly-cam.y)*Math.min(1,dt*5);}
  const z=cam.z*DPR,cw=cv.width,ch=cv.height;
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#1a2a22';ctx.fillRect(0,0,cw,ch);
  ctx.setTransform(z,0,0,z,cw/2-cam.x*z,ch/2-cam.y*z);
  const hw=cw/2/z+16,hh=ch/2/z+16,x0=cam.x-hw,x1=cam.x+hw,y0=cam.y-hh,y1=cam.y+hh;
  const need=[];
  const i0=Math.floor(x0/CHUNK),i1=Math.floor(x1/CHUNK),j0=Math.floor(y0/CHUNK),j1=Math.floor(y1/CHUNK);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const c=peekChunk(i,j);if(c)ctx.drawImage(c,i*CHUNK,j*CHUNK,CHUNK+.5,CHUNK+.5);else{ctx.fillStyle='#2d4231';ctx.fillRect(i*CHUNK,j*CHUNK,CHUNK,CHUNK);need.push([i,j,0]);}}
  for(let j=j0-2;j<=j1+2;j++)for(let i=i0-2;i<=i1+2;i++){if(i>=i0&&i<=i1&&j>=j0&&j<=j1)continue;if(!peekChunk(i,j))need.push([i,j,1]);}
  if(need.length){const cx=cam.x/CHUNK-.5,cy=cam.y/CHUNK-.5,ax=Math.cos(G.th)*G.v,ay=Math.sin(G.th)*G.v;
    need.sort((a,b)=>(a[2]*1000+Math.hypot(a[0]-cx,a[1]-cy)-((a[0]-cx)*ax+(a[1]-cy)*ay)*.02)-(b[2]*1000+Math.hypot(b[0]-cx,b[1]-cy)-((b[0]-cx)*ax+(b[1]-cy)*ay)*.02));
    const t0=performance.now();let n=0;while(n<need.length&&(n===0||performance.now()-t0<9)&&n<(need[0][2]?1:4)){getChunk(W,need[n][0],need[n][1]);n++;}}
  // percorso GPS
  if(G.gps&&G.gps.path){const p=G.gps.path;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();let st=false;for(let i=0;i<p.length;i++){const a=p[i];if(Math.abs(a[0]-cam.x)>hw*3&&Math.abs(a[1]-cam.y)>hh*3){st=false;continue;}if(!st){ctx.moveTo(a[0],a[1]);st=true;}else ctx.lineTo(a[0],a[1]);}
    ctx.strokeStyle='rgba(40,170,255,.55)';ctx.lineWidth=3.4;ctx.stroke();ctx.strokeStyle='rgba(180,235,255,.8)';ctx.lineWidth=.6;ctx.setLineDash([3,4]);ctx.stroke();ctx.setLineDash([]);}
  // luci della notte sotto i veicoli: niente. Veicoli:
  for(const c of traffic){const p=carPose(c);if(p.x<x0-10||p.x>x1+10||p.y<y0-10||p.y>y1+10)continue;drawSpr(carSprite(c.hue,c.kind),p.x,p.y,p.ang);}
  drawSpr(trailerSprite(G.trailer.type,G.trailer.cargo,G.trailer.hue),G.x,G.y,G.phi);
  drawSpr(truckSprite(T),G.x,G.y,G.th);
  // luci freno
  if(G.brkOn){ctx.fillStyle='rgba(255,40,30,.95)';const cp=Math.cos(G.phi),sp=Math.sin(G.phi);for(const s of[-1,1]){ctx.beginPath();ctx.arc(G.x-cp*11.7-sp*s*1.0,G.y-sp*11.7+cp*s*1.0,.35,0,TAU);ctx.fill();}}
  // cartelli POI
  drawPois();
  // meteo / nebbia
  ctx.setTransform(1,0,0,1,0,0);
  if(weather.fog>.02){const g=ctx.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*.12,cw/2,ch/2,Math.max(cw,ch)*.6);g.addColorStop(0,`rgba(190,200,210,${weather.fog*.18})`);g.addColorStop(1,`rgba(190,200,210,${weather.fog*.7})`);ctx.fillStyle=g;ctx.fillRect(0,0,cw,ch);}
  if(weather.rain>.03||weather.snow>.03){const sn=weather.snow>weather.rain;ctx.strokeStyle=sn?'rgba(255,255,255,.8)':'rgba(190,210,240,.5)';ctx.fillStyle='rgba(255,255,255,.85)';ctx.lineWidth=DPR;
    const nn=Math.floor(rainP.length*Math.max(weather.rain,weather.snow));
    if(!sn)ctx.beginPath();
    for(let i=0;i<nn;i++){const q=rainP[i];q[1]+=dt*(sn?.12:1.6)*q[2];q[0]+=dt*(sn?.02*Math.sin(G.t+i):-.12);if(q[1]>1){q[1]-=1;q[0]=Math.random();}if(q[0]<0)q[0]+=1;
      const x=q[0]*cw,y=q[1]*ch;if(sn){ctx.beginPath();ctx.arc(x,y,1.6*DPR*q[2],0,TAU);ctx.fill();}else{ctx.moveTo(x,y);ctx.lineTo(x-3*DPR,y+16*DPR*q[2]);}}
    if(!sn)ctx.stroke();ctx.fillStyle='rgba(20,28,40,'+(weather.rain*.14)+')';ctx.fillRect(0,0,cw,ch);}
  // notte
  const n=weather.night;
  if(n>.02){ctx.globalCompositeOperation='multiply';ctx.fillStyle=`rgb(${Math.round(255-n*192)},${Math.round(255-n*172)},${Math.round(255-n*100)})`;ctx.fillRect(0,0,cw,ch);ctx.globalCompositeOperation='source-over';
    ctx.setTransform(z,0,0,z,cw/2-cam.x*z,ch/2-cam.y*z);ctx.globalCompositeOperation='lighter';
    // lampioni
    for(let jj=Math.round(y0/CELL)-1;jj<=Math.round(y1/CELL)+1;jj++)for(let ii=Math.round(x0/CELL)-1;ii<=Math.round(x1/CELL)+1;ii++){const s=W.site(ii,jj);if(!s.exists||s.x+s.r<x0||s.x-s.r>x1||s.y+s.r<y0||s.y-s.r>y1)continue;const C=W.city(s);
      for(const l of C.lamps){if(l[0]<x0-20||l[0]>x1+20||l[1]<y0-20||l[1]>y1+20)continue;const g=ctx.createRadialGradient(l[0],l[1],0,l[0],l[1],22);g.addColorStop(0,`rgba(255,214,140,${.55*n})`);g.addColorStop(1,'rgba(255,214,140,0)');ctx.fillStyle=g;ctx.fillRect(l[0]-22,l[1]-22,44,44);}}
    if(G.lights)headlight(G.x+Math.cos(G.th)*5.4,G.y+Math.sin(G.th)*5.4,G.th,70,n);
    for(const c of traffic){const p=carPose(c);if(p.x<x0-30||p.x>x1+30||p.y<y0-30||p.y>y1+30)continue;headlight(p.x+Math.cos(p.ang)*2.2,p.y+Math.sin(p.ang)*2.2,p.ang,34,n*.8);}
    ctx.globalCompositeOperation='source-over';ctx.setTransform(1,0,0,1,0,0);}
  // vignetta lieve
  const vg=ctx.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*.45,cw/2,ch/2,Math.max(cw,ch)*.78);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.28)');ctx.fillStyle=vg;ctx.fillRect(0,0,cw,ch);
  drawMini();
}
function headlight(x,y,a,len,n){
  ctx.save();ctx.translate(x,y);ctx.rotate(a);const g=ctx.createRadialGradient(0,0,1,0,0,len);g.addColorStop(0,`rgba(255,240,200,${.8*n})`);g.addColorStop(.5,`rgba(255,235,190,${.28*n})`);g.addColorStop(1,'rgba(255,235,190,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,len,-.38,.38);ctx.closePath();ctx.fill();ctx.restore();
}
let poiT=0;
function drawPois(){
  poiT+=.03;const cx=Math.round(cam.x/CELL),cy=Math.round(cam.y/CELL),pulse=.5+.5*Math.sin(poiT*3);
  const vw=cv.width/2/(cam.z*DPR)+40,vh=cv.height/2/(cam.z*DPR)+40;
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const s=W.site(cx+i,cy+j);if(!s.exists)continue;if(Math.abs(s.x-cam.x)>s.r+vw||Math.abs(s.y-cam.y)>s.r+vh)continue;
    const C=W.city(s);
    for(const p of C.pois){if(Math.abs(p.x-cam.x)>vw||Math.abs(p.y-cam.y)>vh)continue;
      const isDest=G.job&&p.kind==='company'&&p.comp.id===G.job.toComp;
      const col=isDest?'#4dff9a':KIND_COL[p.kind],near=Math.hypot(p.x-G.x,p.y-G.y)<p.r;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r*(1+.04*pulse),0,TAU);ctx.fillStyle=col+(near?'55':'22');ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=near?1.1:.7;ctx.setLineDash([3,2.5]);ctx.stroke();ctx.setLineDash([]);
      const ic=p.kind==='company'?(IND_IC[p.comp.ind.id]||'🏢'):KIND_IC[p.kind];ctx.font='8px system-ui';ctx.fillStyle='#fff';ctx.fillText(ic,p.x,p.y+.4);
      if(isDest){ctx.font='bold 8px system-ui';ctx.fillText('▼',p.x,p.y-p.r-6+Math.sin(poiT*4)*1.5);}
      if(Math.hypot(p.x-G.x,p.y-G.y)<110||isDest){ctx.font='bold 3.6px system-ui';ctx.lineWidth=1;ctx.strokeStyle='rgba(0,0,0,.85)';ctx.strokeText(p.name,p.x,p.y+p.r+4.5);ctx.fillStyle='#fff';ctx.fillText(p.name,p.x,p.y+p.r+4.5);}
    }}
  // scoperte non ancora fatte
  const bi=Math.floor(cam.x/512),bj=Math.floor(cam.y/512);
  for(let j=bj-1;j<=bj+1;j++)for(let i=bi-1;i<=bi+1;i++){const lm=W.landmarkIn(i,j);if(!lm||G.disc[lm.id])continue;if(Math.abs(lm.x-cam.x)>vw+20||Math.abs(lm.y-cam.y)>vh+20)continue;
    ctx.font='7px system-ui';ctx.globalAlpha=.55+.45*pulse;ctx.fillStyle='#ffe58a';ctx.fillText('✦',lm.x,lm.y-18-pulse*2);ctx.globalAlpha=1;}
}
function drawMini(){
  const S=mini.width,R=520,k=S/(2*R);
  mctx.setTransform(1,0,0,1,0,0);mctx.fillStyle='#14202a';mctx.fillRect(0,0,S,S);
  mctx.save();mctx.beginPath();mctx.arc(S/2,S/2,S/2,0,TAU);mctx.clip();
  mctx.setTransform(k,0,0,k,S/2-G.x*k,S/2-G.y*k);
  for(let j=Math.floor((G.y-R)/CHUNK);j<=Math.floor((G.y+R)/CHUNK);j++)for(let i=Math.floor((G.x-R)/CHUNK);i<=Math.floor((G.x+R)/CHUNK);i++){const c=peekChunk(i,j);if(c)mctx.drawImage(c,i*CHUNK,j*CHUNK,CHUNK+.5,CHUNK+.5);}
  if(G.gps&&G.gps.path){mctx.beginPath();G.gps.path.forEach((p,i)=>i?mctx.lineTo(p[0],p[1]):mctx.moveTo(p[0],p[1]));mctx.strokeStyle='rgba(40,200,255,.95)';mctx.lineWidth=7/k/ (S/176);mctx.lineJoin='round';mctx.stroke();}
  const cx=Math.round(G.x/CELL),cy=Math.round(G.y/CELL);
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const s=W.site(cx+i,cy+j);if(!s.exists)continue;const C=W.city(s);for(const p of C.pois){if(Math.abs(p.x-G.x)>R||Math.abs(p.y-G.y)>R)continue;const isDest=G.job&&p.kind==='company'&&p.comp.id===G.job.toComp;mctx.fillStyle=isDest?'#4dff9a':KIND_COL[p.kind];mctx.beginPath();mctx.arc(p.x,p.y,(isDest?10:6)/k/(S/176),0,TAU);mctx.fill();if(isDest){mctx.strokeStyle='#fff';mctx.lineWidth=2/k/(S/176);mctx.stroke();}}}
  mctx.restore();
  mctx.setTransform(1,0,0,1,0,0);mctx.save();mctx.translate(S/2,S/2);mctx.rotate(G.th);const u=S/176;mctx.fillStyle='#ff4d6a';mctx.strokeStyle='#fff';mctx.lineWidth=1.6*u;mctx.beginPath();mctx.moveTo(8*u,0);mctx.lineTo(-6*u,5*u);mctx.lineTo(-3*u,0);mctx.lineTo(-6*u,-5*u);mctx.closePath();mctx.fill();mctx.stroke();mctx.restore();
  mctx.fillStyle='#fff';mctx.font=`bold ${11*(S/176)}px system-ui`;mctx.textAlign='center';mctx.fillText('N',S/2,13*(S/176));
}

/* ---------- HUD ---------- */
let hudT=0;
function updateHud(dt){
  const T=G.truck,j=G.job,kmh=Math.abs(G.v)*3.6;
  $('#hMoney').textContent=fmt(G.money);$('#hLvl').textContent=G.level;$('#hXp').style.width=clamp((G.xp-xpAt(G.level))/(xpAt(G.level+1)-xpAt(G.level))*100,0,100)+'%';
  $('#hClock').textContent=fmtClock()+' · g'+(G.day+1);
  const wi=weather.snow>.25?'❄️':weather.rain>.3?'🌧️':weather.fog>.4?'🌫️':weather.night>.5?'🌙':'☀️';$('#hWx').textContent=wi;
  $('#spd').firstChild.nodeValue=Math.round(kmh);
  $('#gFuel').style.width=clamp(T.fuel/tankMax(T)*100,0,100)+'%';$('#gFuel').style.background=T.fuel/tankMax(T)<.15?'#ff5a4d':'';
  $('#gDmg').style.width=clamp(T.dmg*100,0,100)+'%';
  const lim=G.sf&&G.sf.limit;$('#lim').textContent=lim||'–';$('#lim').classList.toggle('none',!lim);
  $('#cc').textContent=G.cruise>0?'cruise '+Math.round(G.cruise*3.6):'cruise · C';$('#cc').classList.toggle('on',G.cruise>0);
  const zone=zoneName();if(zone!==$('#hZone').textContent)$('#hZone').textContent=zone;
  // incarico
  const jc=$('#jobc');
  if(j){const cg=CARGO_BY[j.cargo],left=j.deadline-G.t,rem=G.gps&&G.gps.path?pathAhead(0):null;jc.classList.remove('hide');jc.classList.toggle('late',left<0);
    const ds=W._site.get(j.to);jc.innerHTML=`<div class="t">${cg.ic} ${cg.n} · ${j.tons} t</div>${j.fromName} → <b>${W.companiesOf(ds).find(c=>c.id===j.toComp).name}</b>, ${ds.name}<br><span style="color:var(--dim)">${rem?(rem.rem/1000).toFixed(1)+' km · ':''}${left>=0?mmss(left):'<b style="color:#ff7a6d">in ritardo '+mmss(-left)+'</b>'} · ${money(j.pay)}</span><div class="bar"><i style="width:${clamp(left/j.secs*100,0,100)}%"></i></div>`;}
  else jc.classList.add('hide');
  // gps
  const gp=$('#gps');
  if(G.gps&&G.gps.path){const ahead=pathAhead(40);gp.classList.remove('hide');if(ahead){const a=Math.atan2(ahead.y-G.y,ahead.x-G.x),c=$('#gpsA').getContext('2d');c.clearRect(0,0,60,60);c.save();c.translate(30,30);c.rotate(a);c.fillStyle='#4dd0ff';c.beginPath();c.moveTo(22,0);c.lineTo(-14,14);c.lineTo(-6,0);c.lineTo(-14,-14);c.closePath();c.fill();c.restore();
      $('#gpsT').textContent=G.gps.target.label;$('#gpsD').textContent=(ahead.rem/1000).toFixed(1)+' km'+(G.job?' · '+(G.job.deadline-G.t>=0?mmss(G.job.deadline-G.t):'in ritardo'):'')+(ahead.off>60?' · ricalcolo…':'');}}
  else gp.classList.add('hide');
  // prompt
  const pr=$('#prompt'),o=currentPoi();
  if(o&&!modalKind&&!mapOpen){const p=o.p;const dest=G.job&&p.kind==='company'&&p.comp.id===G.job.toComp;
    const txt=p.kind==='company'?(dest?'Consegna: ':'Carichi: ')+p.name:p.kind==='gas'?'Fai rifornimento':p.kind==='garage'?'Officina e potenziamenti':'Concessionaria camion';
    pr.innerHTML=`<kbd>E</kbd>${Math.abs(G.v)>4?'Rallenta · ':''}${txt}`;pr.classList.remove('hide');}
  else if(!modalKind&&G.sf&&G.sf.k==='water'){pr.textContent='💧 Sei in acqua!';pr.classList.remove('hide');}
  else pr.classList.add('hide');
}
function zoneName(){
  const s=W.siteNear(G.x,G.y,0);
  if(s&&Math.hypot(G.x-s.x,G.y-s.y)<s.r)return (s.size?'🏙️ ':'⛺ ')+s.name;
  return W.isCore(G.x,G.y)?'Regione di '+W.region:'🧭 Terre Libere';
}

/* ---------- ciclo principale ---------- */
let wasWild=false,autoT=0,zoneT=0;
function frame(ts){
  requestAnimationFrame(frame);
  const now=ts/1000;let dt=Math.min(.05,now-last);last=now;if(dt<=0)return;
  if(!G||!started)return;
  const paused=G.menu||mapOpen||document.hidden;
  if(!paused){
    if(window.__autopilot)autopilot(dt);
    let rem=dt,o=null;while(rem>1e-5){const h=Math.min(rem,1/60);o=step(h);rem-=h;}
    G.brkOn=o&&o.brk>0;
    playerCircles=circlesNow();
    updateWeather(dt);updateTraffic(dt);planPath(false);
    markExplored();
    const lm=checkDiscoveries();if(lm){toast('✦ Scoperta: '+lm.name+' · € '+lm.reward+' · +'+lm.xp+' XP',4200);}
    zoneT-=dt;if(zoneT<=0){zoneT=.5;const w=!W.isCore(G.x,G.y);if(w!==wasWild){wasWild=w;toast(w?'🧭 Terre Libere: la mappa è infinita. Esplora, ma tieni d\'occhio il carburante!':'Sei rientrato nella Regione di '+W.region,w?4600:2600);}}
    audioUpdate(G.rpm||800,Math.max(0,o?o.thr:0),G.v);
    autoT+=dt;if(autoT>30){autoT=0;saveGame(true);}
    if(G.fuelLow===undefined)G.fuelLow=false;const fl=G.truck.fuel/tankMax(G.truck)<.12;if(fl&&!G.fuelLow)toast('⛽ Riserva di carburante!',3000);G.fuelLow=fl;
  }
  render(dt);
  hudT-=dt;if(hudT<=0||true){updateHud(dt);}
}

/* ---------- schermata iniziale ---------- */
const seedIn=$('#seedIn');
const rndSeed=()=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return s;};
let statT=0,statW=null;
function refreshStart(){
  const seed=seedIn.value.toUpperCase().replace(/[^A-Z0-9]/g,'');
  clearTimeout(statT);statT=setTimeout(()=>{if(seed.length<2)return;const w=new World(seed),st=w.stats();statW=w;
    $('#wstat').innerHTML=`<div><b>${st.cities}+∞</b>città</div><div><b>${st.comps}</b>aziende</div><div><b>${st.roads} km</b>di strade</div><div><b>${st.models}</b>camion · ${st.brands} marchi</div><div><b>${st.cargoAll}</b>tipi di carico</div><div><b>${st.dealers}</b>concessionarie</div>`;},120);
  let has=false;try{has=!!localStorage.getItem(saveKey(seed));}catch(e){}
  $('#goCont').disabled=!has;$('#goCont').style.opacity=has?1:.4;
}
function renderSaves(){
  const l=listSaves();$('#saves').innerHTML=l.length?'<label>Salvataggi</label>'+l.map(s=>`<div class="srow" data-seed="${s.seed}"><b style="font-family:var(--disp);letter-spacing:.14em">${s.seed}</b><span style="color:var(--dim)">Lv ${s.level} · giorno ${s.day+1} · € ${fmt(s.money)}</span></div>`).join(''):'';
}
$('#seedDice').onclick=()=>{seedIn.value=rndSeed();refreshStart();};
seedIn.addEventListener('input',refreshStart);
seedIn.addEventListener('keydown',e=>{if(e.key==='Enter')$('#goNew').click();});
$('#saves').addEventListener('click',e=>{const r=e.target.closest('[data-seed]');if(r){seedIn.value=r.dataset.seed;beginGame(true);}});
$('#goNew').onclick=()=>beginGame(false);
$('#goCont').onclick=()=>beginGame(true);
function beginGame(cont){
  audioInit();
  let seed=seedIn.value.toUpperCase().replace(/[^A-Z0-9]/g,'');if(seed.length<2){seed=rndSeed();}
  if(cont){if(!loadGame(seed)){toast('Nessun salvataggio per questo seme');return;}}else newGame(seed);
  $('#start').classList.add('hide');$('#hud').classList.remove('hide');started=true;
  cam.x=G.x;cam.y=G.y;wasWild=!W.isCore(G.x,G.y);
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)getChunk(W,Math.floor(G.x/CHUNK)+i,Math.floor(G.y/CHUNK)+j);
  if(!cont){setTimeout(()=>toast('Vai a un cerchio giallo e premi E per prendere un carico!',5200),500);}
  history.replaceState(null,'','#'+seed);
  last=performance.now()/1000;
}
(function init(){
  let s=location.hash.replace('#','').toUpperCase();if(!/^[A-Z0-9]{2,8}$/.test(s)){try{s=localStorage.getItem('camion.last')||'';}catch(e){}}
  seedIn.value=s||rndSeed();refreshStart();renderSaves();requestAnimationFrame(frame);
})();
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G&&started)saveGame(true);});

/* hook per i test */
window.__ct={autopilot,updateTraffic,updateWeather,circlesNow,sim(sec){let n=0;const h=1/30;while(n*h<sec){if(window.__autopilot)autopilot(h);const o=step(h);G.brkOn=o.brk>0;playerCircles=circlesNow();updateWeather(h);updateTraffic(h);planPath(false);markExplored();checkDiscoveries();n++;if(G.menu)break;}return n*h;},get G(){return G;},get W(){return W;},step,render,newGame,beginGame,saveGame,loadGame,act,acceptJob,deliverJob,jobEarn,setGps,planPath,pathAhead,currentPoi,nearbyPois,surfaceAt,traffic:()=>traffic,weather,cam,openCompany,openGas,openGarage,openDealer,openMap,drawMap,openPause,openInfo,tow,rescueFuel,getChunk,chunkCache,destTarget,interact,tankMax,updateHud};
