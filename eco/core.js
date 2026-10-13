'use strict';
/* ECO · dati e utilità condivise */
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
function hashStr(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const rngFor=(seed,tag)=>mulberry32(hashStr(seed+'|'+tag));
const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1));
const pick=(r,a)=>a[Math.floor(r()*a.length)];
const rr=(r,a,b)=>a+(b-a)*r();
function shuffle(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function wpick(r,items,w){let s=0;for(const x of w)s+=x;let v=r()*s;for(let i=0;i<items.length;i++){v-=w[i];if(v<=0)return items[i];}return items[items.length-1];}
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const newSeed=()=>{let s='';const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';for(let i=0;i<6;i++)s+=a[Math.floor(Math.random()*a.length)];return s;};
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
const $=s=>document.querySelector(s);
const fmt=n=>Math.round(n).toLocaleString('it-IT');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- nomi ---------- */
const FIRST_M=['Aldo','Bruno','Carlo','Dario','Elio','Fabio','Gino','Ivo','Luca','Marco','Nando','Orazio','Piero','Renzo','Sandro','Tullio','Ugo','Valerio','Walter','Enzo','Mario','Tito','Remo','Osvaldo'];
const FIRST_F=['Adele','Bice','Clara','Dora','Elsa','Fosca','Gemma','Irma','Lina','Marta','Nives','Olga','Paola','Rita','Silvia','Tina','Ursula','Vera','Wanda','Ada','Lidia','Nora','Teresa','Viola'];
const SYL=['ba','be','bo','ca','ce','co','da','de','do','fa','fe','fo','ga','ge','go','la','le','lo','ma','me','mo','na','ne','no','pa','pe','po','ra','re','ro','sa','se','so','ta','te','to','va','ve','vo','zan','mar','gal','ber','tor','lan','gen','pon','sar','vin','cor'];
const SUR_END=['ini','etti','elli','ucci','oni','ari','ero','ani','ardi','one','esi','otti','ato','ieri'];
const PLACE_END=['ia','ano','ara','ella','ona','ento','esco','ola','ino','ate','ago','etto','oli','ore','ina'];
function surname(r){return cap(pick(r,SYL)+(r()<.5?pick(r,SYL):'')+pick(r,SUR_END));}
function personName(r,sex){return pick(r,sex==='f'?FIRST_F:FIRST_M)+' '+surname(r);}
function placeName(r){return cap(pick(r,SYL)+(r()<.55?pick(r,SYL):'')+pick(r,PLACE_END));}
const TITLES=['il vecchio','la vecchia'];

/* ---------- competenze ---------- */
const SKILLS=[
 {id:'inv',n:'Investigazione',ic:'🔍',d:'Collega le informazioni, riconosce le incoerenze e apre gli archivi più profondi.'},
 {id:'int',n:'Intervista',ic:'🎙️',d:'Più domande per giorno e più probabilità che l\'ospite si apra.'},
 {id:'car',n:'Carisma',ic:'😎',d:'Le persone si fidano prima di te e ti dicono di più.'},
 {id:'aud',n:'Audio',ic:'🎧',d:'Registrazioni più pulite e livelli che si leggono meglio.'},
 {id:'mon',n:'Montaggio',ic:'🎛️',d:'Normalizzazione più precisa e più punti dalla struttura.'},
 {id:'nar',n:'Narrazione',ic:'📖',d:'Narrazioni più coinvolgenti e ganci più forti.'}];
const skXp=l=>Math.round(14*l*l+16*l);   // xp totale per passare al livello l+1

/* ---------- equipaggiamento ---------- */
const GEAR={
 mic:[{n:'Microfono del telefono',q:18,p:0,d:'Il suono di una stanza dentro un barattolo.'},{n:'Microfono USB economico',q:34,p:120,d:'Meglio di niente, ma capta tutto.'},{n:'Dinamico da palco',q:52,p:340,d:'Robusto, poco rumore di fondo.'},{n:'Condensatore da studio',q:72,p:900,d:'Dettagliato. Vuole una stanza silenziosa.'},{n:'Broadcast professionale',q:90,p:2400,d:'La voce di una radio vera.'}],
 iface:[{n:'Presa jack del PC',g:1,p:0,d:'Un solo ingresso, tanto rumore.'},{n:'Scheda audio a 2 canali',g:2,q:6,p:260,d:'Puoi registrare te e un ospite in studio.'},{n:'Interfaccia a 4 canali',g:4,q:12,p:850,d:'Più ospiti, preamplificatori puliti.'}],
 pc:[{n:'PC vecchissimo',tr:2,clips:5,p:0,d:'2 tracce, 5 clip per puntata.'},{n:'Portatile discreto',tr:3,clips:8,p:300,d:'3 tracce, 8 clip.'},{n:'PC da montaggio',tr:4,clips:12,p:900,d:'4 tracce, 12 clip.'},{n:'Workstation',tr:6,clips:18,p:2600,d:'6 tracce, 18 clip.'}],
 phones:[{n:'Cuffie del telefono',m:4,p:0,d:'I livelli sono quasi un\'ipotesi.'},{n:'Cuffie chiuse',m:2,p:150,d:'Leggi i livelli con ±2 dB.'},{n:'Monitor da studio',m:0.5,p:700,d:'Livelli esatti.'}],
 panel:[{n:'Stanza nuda',r:0,p:0,d:'Eco, traffico, vicini.'},{n:'Coperte e cartoni',r:12,p:90,d:'Il rumore cala un po\'.'},{n:'Pannelli acustici',r:28,p:420,d:'Stanza molto più asciutta.'},{n:'Cabina insonorizzata',r:45,p:1500,d:'Silenzio quasi totale.'}],
 rec:[{n:'Registratore del telefono',q:14,p:0,d:'Per le interviste sul campo.'},{n:'Registratore portatile',q:36,p:280,d:'Microfoni incorporati decenti.'},{n:'Registratore con lavalier',q:58,p:800,d:'Voce chiara anche in strada.'},{n:'Kit da reporter',q:78,p:2100,d:'Paravento, lavalier, doppio canale.'}],
 deco:[{n:'Scrivania spoglia',b:0,p:0,d:''},{n:'Luce calda e poster',b:1,p:160,d:'Ti senti un podcaster: XP +10%.'},{n:'Studio arredato',b:2,p:700,d:'Atmosfera: XP +20%.'},{n:'Studio da sogno',b:3,p:2000,d:'Il tuo regno: XP +30%.'}]
};
const GEAR_KEYS=['mic','iface','pc','phones','panel','rec','deco'];
const GEAR_LBL={mic:'Microfono',iface:'Interfaccia',pc:'Computer',phones:'Cuffie',panel:'Trattamento acustico',rec:'Registratore da campo',deco:'Arredo'};
const MUSIC=[
 {id:'m0',n:'Sigla di prova',p:0,mood:'neutro',dur:.5},{id:'m1',n:'Tema investigativo',p:80,mood:'giallo',dur:.7},{id:'m2',n:'Synth notturno',p:130,mood:'notte',dur:.7},
 {id:'m3',n:'Archi nostalgici',p:160,mood:'nostalgia',dur:.7},{id:'m4',n:'Battito di tensione',p:220,mood:'tensione',dur:.6},{id:'m5',n:'Chitarra di campagna',p:110,mood:'luce',dur:.6}];
const SFX=[{id:'s0',n:'Pagine sfogliate',p:40,dur:.2},{id:'s1',n:'Passi su ghiaia',p:40,dur:.2},{id:'s2',n:'Porta che cigola',p:60,dur:.15},{id:'s3',n:'Telefono antico',p:70,dur:.15},{id:'s4',n:'Pioggia leggera',p:90,dur:.3}];
let toastT=0;
function toast(m,ms){const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),ms||2400);}

/* ---------- suoni dell'interfaccia ---------- */
let AC_=null;
function blip(f,d,type,v,slide){try{if(!AC_)AC_=new (window.AudioContext||window.webkitAudioContext)();if(AC_.state==='suspended')AC_.resume();const t=AC_.currentTime,o=AC_.createOscillator(),g=AC_.createGain();o.type=type||'triangle';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);g.gain.setValueAtTime(v||.08,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC_.destination);o.start(t);o.stop(t+d+.02);}catch(e){}}
const sfx={click:()=>blip(520,.05,'square',.04),ok:()=>{blip(660,.1,'triangle',.08);setTimeout(()=>blip(990,.14,'triangle',.08),90);},clip:()=>{blip(440,.08,'sine',.1);setTimeout(()=>blip(660,.12,'sine',.1),80);},coin:()=>{blip(988,.07,'square',.05);setTimeout(()=>blip(1319,.16,'square',.05),70);},pub:()=>[523,659,784,1047].forEach((f,i)=>setTimeout(()=>blip(f,.22,'triangle',.09),i*110)),bad:()=>blip(180,.2,'sawtooth',.06,.6),door:()=>blip(140,.12,'square',.05,.5)};
