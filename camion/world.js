'use strict';
/* CAMION · generazione procedurale del mondo (tutto deterministico dal seme) */
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
function hashStr(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function ih(a,b,c){let h=(a|0)^Math.imul(b|0,0x27d4eb2d)^Math.imul(c|0,0x165667b1);h=Math.imul(h^(h>>>15),0x85ebca6b);h=Math.imul(h^(h>>>13),0xc2b2ae35);h^=h>>>16;return(h>>>0)/4294967296;}
function vnoise(seed,x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=ih(seed,xi,yi),b=ih(seed,xi+1,yi),c=ih(seed,xi,yi+1),d=ih(seed,xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fbm(seed,x,y,oct){let s=0,a=.5,f=1,n=0;for(let i=0;i<oct;i++){s+=a*vnoise(seed+i*101,x*f,y*f);n+=a;a*=.5;f*=2.03;}return s/n;}
const pick=(r,a)=>a[Math.floor(r()*a.length)];
const rr=(r,a,b)=>a+(b-a)*r();
const CELL=2600,CORE=3;

/* ---------- nomi ---------- */
const ON=['b','br','c','ca','ch','d','dr','f','fl','g','gr','l','m','mar','n','p','pr','r','s','st','t','tr','v','z','ba','ro','vi','ma','lu','ve','co','pa','se','ti','no'];
const VO=['a','e','i','o','u','a','o','e','ia','ei','io'];
const CO=['','','','','n','r','l','s','t','m'];
const CITY_END=['ia','ano','ara','ella','ona','ento','esco','ola','ino','ate','ago','etto','oli','ara','ore','ento','ate','ino'];
const FAM_END=['o','i','a','is','er','ex','on','ar','um','ex'];
const cap=s=>s[0].toUpperCase()+s.slice(1);
function syl(r){return pick(r,ON)+pick(r,VO)+pick(r,CO);}
function cityName(r){let s=syl(r);if(r()<.55)s+=syl(r);return cap(s.replace(/(.)\1\1/g,'$1$1')+pick(r,CITY_END)).replace(/([aeiou])\1/,'$1');}
function famName(r){return cap(syl(r)+(r()<.5?syl(r):'')+pick(r,FAM_END));}

/* ---------- dati ---------- */
const TRAILERS={furgone:'Furgonato',frigo:'Frigorifero',cisterna:'Cisterna',pianale:'Pianale',ribaltabile:'Ribaltabile',bisarca:'Bisarca',container:'Portacontainer'};
/* t: tonnellate min/max, rate: moltiplicatore paga, lvl: livello richiesto, fr: fragilità */
const CARGO=[
{id:'elettronica',n:'Elettronica',ic:'📟',tr:'furgone',t:[3,14],rate:1.5,lvl:1,fr:.9},
{id:'mobili',n:'Mobili',ic:'🛋️',tr:'furgone',t:[6,16],rate:1.0,lvl:1,fr:.35},
{id:'abbigliamento',n:'Abbigliamento',ic:'👕',tr:'furgone',t:[4,12],rate:.9,lvl:1,fr:.1},
{id:'alimentari',n:'Alimentari',ic:'🥫',tr:'furgone',t:[8,20],rate:.9,lvl:1,fr:.2},
{id:'elettrodomestici',n:'Elettrodomestici',ic:'🧺',tr:'furgone',t:[6,16],rate:1.2,lvl:1,fr:.7},
{id:'giocattoli',n:'Giocattoli',ic:'🧸',tr:'furgone',t:[3,10],rate:1.0,lvl:1,fr:.3},
{id:'libri',n:'Libri e carta',ic:'📚',tr:'furgone',t:[10,20],rate:.8,lvl:1,fr:.1},
{id:'bevande',n:'Bevande',ic:'🍺',tr:'furgone',t:[14,24],rate:.8,lvl:1,fr:.45},
{id:'latticini',n:'Latticini',ic:'🧀',tr:'frigo',t:[8,20],rate:1.1,lvl:1,fr:.4},
{id:'surgelati',n:'Surgelati',ic:'🧊',tr:'frigo',t:[10,22],rate:1.2,lvl:1,fr:.4},
{id:'farmaci',n:'Farmaci',ic:'💊',tr:'frigo',t:[3,10],rate:2.0,lvl:1,fr:.8},
{id:'carne',n:'Carne',ic:'🥩',tr:'frigo',t:[10,22],rate:1.2,lvl:1,fr:.4},
{id:'frutta',n:'Frutta e verdura',ic:'🍎',tr:'frigo',t:[8,20],rate:1.0,lvl:1,fr:.6},
{id:'carburante',n:'Carburante',ic:'⛽',tr:'cisterna',t:[20,30],rate:1.5,lvl:3,fr:.3,hz:1},
{id:'latte',n:'Latte',ic:'🥛',tr:'cisterna',t:[18,28],rate:.9,lvl:1,fr:.3},
{id:'chimici',n:'Prodotti chimici',ic:'🧪',tr:'cisterna',t:[18,28],rate:1.7,lvl:3,fr:.5,hz:1},
{id:'olio',n:'Olio d\'oliva',ic:'🫒',tr:'cisterna',t:[16,24],rate:1.1,lvl:1,fr:.3},
{id:'vino',n:'Vino',ic:'🍷',tr:'cisterna',t:[16,24],rate:1.1,lvl:1,fr:.4},
{id:'cemento',n:'Cemento',ic:'🏗️',tr:'cisterna',t:[24,32],rate:.9,lvl:1,fr:.1},
{id:'travi',n:'Travi d\'acciaio',ic:'🔩',tr:'pianale',t:[18,30],rate:1.1,lvl:2,fr:.1,hv:1},
{id:'legname',n:'Legname',ic:'🪵',tr:'pianale',t:[18,28],rate:.9,lvl:1,fr:.1},
{id:'bobine',n:'Bobine d\'acciaio',ic:'🧲',tr:'pianale',t:[20,32],rate:1.3,lvl:2,fr:.15,hv:1},
{id:'macchinari',n:'Macchinari',ic:'⚙️',tr:'pianale',t:[14,30],rate:1.6,lvl:2,fr:.45,hv:1},
{id:'prefabbricati',n:'Prefabbricati',ic:'🧱',tr:'pianale',t:[18,30],rate:1.0,lvl:1,fr:.25},
{id:'turbine',n:'Pale eoliche',ic:'🌬️',tr:'pianale',t:[24,36],rate:2.2,lvl:2,fr:.4,hv:1},
{id:'ghiaia',n:'Ghiaia',ic:'🪨',tr:'ribaltabile',t:[24,34],rate:.7,lvl:1,fr:0},
{id:'sabbia',n:'Sabbia',ic:'⏳',tr:'ribaltabile',t:[24,34],rate:.7,lvl:1,fr:0},
{id:'carbone',n:'Carbone',ic:'⚫',tr:'ribaltabile',t:[22,32],rate:.8,lvl:1,fr:0},
{id:'minerale',n:'Minerale di ferro',ic:'⛏️',tr:'ribaltabile',t:[24,34],rate:.8,lvl:1,fr:0},
{id:'grano',n:'Grano',ic:'🌾',tr:'ribaltabile',t:[20,30],rate:.8,lvl:1,fr:.05},
{id:'auto',n:'Auto nuove',ic:'🚗',tr:'bisarca',t:[12,22],rate:1.4,lvl:1,fr:.6},
{id:'trattori',n:'Trattori',ic:'🚜',tr:'bisarca',t:[14,24],rate:1.2,lvl:1,fr:.4},
{id:'container',n:'Container',ic:'📦',tr:'container',t:[12,28],rate:1.0,lvl:1,fr:.2}];
const CARGO_BY=Object.fromEntries(CARGO.map(c=>[c.id,c]));
/* industrie: out = cosa producono, in = cosa consumano */
const IND=[
{id:'miniera',n:'Miniera',out:['minerale','carbone'],in:[],pat:['Miniere {S}','{S} Mining','Cave di ferro {S}'],hue:25,look:'yard',bw:{mount:4,desert:1.5}},
{id:'cava',n:'Cava',out:['ghiaia','sabbia'],in:[],pat:['Cava {S}','{S} Inerti','Cave {S}'],hue:40,look:'yard',bw:{mount:2,desert:2.5,coast:1.5}},
{id:'segheria',n:'Segheria',out:['legname'],in:[],pat:['Segheria {S}','{S} Legnami','Boschi {S}'],hue:30,look:'shed',bw:{forest:5,cold:2}},
{id:'fattoria',n:'Fattoria',out:['grano','frutta','latte'],in:[],pat:['Agricola {S}','Fattoria {S}','{S} Agrifood'],hue:95,look:'shed',bw:{plain:4,steppe:2}},
{id:'caseificio',n:'Caseificio',out:['latticini'],in:['latte'],pat:['Caseificio {S}','Latterie {S}'],hue:50,look:'factory',bw:{plain:2,mount:1.5}},
{id:'alimentare',n:'Industria alimentare',out:['carne','surgelati','alimentari'],in:['grano'],pat:['{S} Foods','Alimentari {S}','Conserve {S}'],hue:10,look:'factory',bw:{plain:2}},
{id:'birrificio',n:'Birrificio',out:['bevande'],in:['grano'],pat:['Birrificio {S}','{S} Bevande'],hue:45,look:'factory',bw:{plain:1.5,mount:1.5}},
{id:'cantina',n:'Cantina',out:['vino'],in:['frutta'],pat:['Cantine {S}','Vini {S}'],hue:340,look:'shed',bw:{plain:2,steppe:2,coast:1.5}},
{id:'frantoio',n:'Frantoio',out:['olio'],in:['frutta'],pat:['Frantoio {S}','Oleificio {S}'],hue:75,look:'shed',bw:{steppe:3,coast:2}},
{id:'acciaieria',n:'Acciaieria',out:['travi','bobine'],in:['minerale','carbone'],pat:['Acciaierie {S}','{S} Steel','Siderurgica {S}'],hue:215,look:'factory',bw:{mount:1.5}},
{id:'raffineria',n:'Raffineria',out:['carburante'],in:[],pat:['Raffineria {S}','{S} Petroli','Energie {S}'],hue:0,look:'tanks',bw:{desert:3,coast:3}},
{id:'chimica',n:'Chimica',out:['chimici'],in:['carburante'],pat:['Chimica {S}','{S} Chemicals','Polimeri {S}'],hue:290,look:'tanks',bw:{coast:2}},
{id:'cementificio',n:'Cementificio',out:['cemento'],in:['ghiaia','sabbia'],pat:['Cementi {S}','{S} Calce e Cementi'],hue:200,look:'tanks',bw:{mount:1.5}},
{id:'prefab',n:'Prefabbricati',out:['prefabbricati'],in:['cemento','travi'],pat:['Prefabbricati {S}','{S} Edilizia'],hue:180,look:'yard',bw:{}},
{id:'mobilificio',n:'Mobilificio',out:['mobili'],in:['legname'],pat:['Mobilificio {S}','{S} Design','Arredi {S}'],hue:20,look:'factory',bw:{forest:2}},
{id:'elettronica',n:'Elettronica',out:['elettronica','elettrodomestici'],in:['chimici'],pat:['{S} Electronics','Elettronica {S}','{S} Tech'],hue:195,look:'factory',bw:{}},
{id:'auto',n:'Fabbrica auto',out:['auto','trattori'],in:['bobine','elettronica'],pat:['{S} Motors','Automobili {S}','{S} Auto'],hue:355,look:'factory',bw:{}},
{id:'officina',n:'Officine meccaniche',out:['macchinari','turbine'],in:['bobine','travi'],pat:['Meccanica {S}','{S} Industrie','Officine {S}'],hue:60,look:'factory',bw:{}},
{id:'tessile',n:'Tessile',out:['abbigliamento','giocattoli'],in:['chimici'],pat:['Tessile {S}','{S} Fashion','Filati {S}'],hue:310,look:'factory',bw:{}},
{id:'tipografia',n:'Tipografia',out:['libri'],in:['legname'],pat:['Tipografia {S}','{S} Edizioni'],hue:250,look:'shed',bw:{}},
{id:'farmaceutica',n:'Farmaceutica',out:['farmaci'],in:['chimici'],pat:['Farmaceutici {S}','{S} Pharma','Laboratori {S}'],hue:165,look:'factory',bw:{}},
{id:'centrale',n:'Centrale elettrica',out:[],in:['carbone','carburante','turbine'],pat:['Centrale {S}','{S} Energia'],hue:55,look:'tanks',bw:{desert:1.5,mount:1.5}},
{id:'cantiere',n:'Cantiere edile',out:[],in:['travi','ghiaia','sabbia','cemento','prefabbricati','legname','macchinari'],pat:['Costruzioni {S}','{S} Edilizia','Cantieri {S}'],hue:48,look:'yard',bw:{}},
{id:'ipermercato',n:'Ipermercato',out:[],in:['alimentari','bevande','latticini','carne','surgelati','frutta','vino','olio','libri','giocattoli','abbigliamento','elettrodomestici','mobili','elettronica'],pat:['Ipermercato {S}','{S} Market','Mega {S}'],hue:355,look:'store',bw:{city:5}},
{id:'concessionaria',n:'Concessionaria auto',out:[],in:['auto','trattori'],pat:['{S} Auto Center','Concessionaria {S}'],hue:210,look:'store',bw:{city:2}},
{id:'ospedale',n:'Ospedale',out:[],in:['farmaci'],pat:['Ospedale {S}','Clinica {S}'],hue:175,look:'store',bw:{city:3}},
{id:'porto',n:'Porto commerciale',out:['container'],in:['container','macchinari','turbine','auto'],pat:['Porto di {S}','Terminal {S}','{S} Shipping'],hue:205,look:'port',bw:{coast:8}},
{id:'logistica',n:'Polo logistico',out:['container'],in:['container'],pat:['{S} Logistica','Interporto {S}','{S} Cargo'],hue:150,look:'port',bw:{city:2}},
{id:'emporio',n:'Emporio di frontiera',out:['alimentari','bevande','macchinari','carburante'],in:['alimentari','bevande','macchinari','carburante','elettronica','farmaci','legname','container','abbigliamento','latticini'],pat:['Emporio {S}','Avamposto {S}','Mercato di {S}'],hue:35,look:'shed',bw:{}}];
const IND_BY=Object.fromEntries(IND.map(i=>[i.id,i]));
const BIOME_N=['Acqua','Spiaggia','Pianura','Foresta','Deserto','Steppa','Montagna','Neve'];
const B_WATER=0,B_SAND=1,B_PLAIN=2,B_FOREST=3,B_DESERT=4,B_STEPPE=5,B_ROCK=6,B_SNOW=7;
const LANDMARKS=['Rovine','Obelisco','Oasi','Relitto','Statua','Faro','Cratere','Arco di roccia','Torre','Camion abbandonato','Villaggio fantasma','Cascata'];

class World{
  constructor(seed){
    this.seed=String(seed).toUpperCase();this.n=hashStr(this.seed)|0;
    this._site=new Map();this._road=new Map();this._near=new Map();this._city=new Map();this._cons=new Map();this._comp=new Map();this._route=new Map();this._lm=new Map();
    const r=mulberry32(this.n^0x51ed);
    this.fuelBase=1.34+r()*.32;
    this.cargoMul={};for(const c of CARGO)this.cargoMul[c.id]=.85+r()*.32;
    this.region=cityName(r);
    this.makeCatalog(r);
  }
  /* ---------- terreno ---------- */
  coreMask(x,y){const R=(CORE+.5)*CELL,d=Math.max(Math.abs(x),Math.abs(y));return 1-sstep(R-400,R+1700,d);}
  elev(x,y){let e=fbm(this.n,x/2500,y/2500,5);e=(e-.5)*1.7+.48;const m=fbm(this.n^77,x/3800+5,y/3800,4);e+=Math.max(0,m-.57)*1.1;return e+this.coreMask(x,y)*.1;}
  riverBand(x,y){return Math.abs(fbm(this.n^555,x/2300,y/2300,3)-.5);}
  rawWater(x,y,e){if(e===undefined)e=this.elev(x,y);return e<.3||(e>.27&&this.riverBand(x,y)<.0075);}
  isWater(x,y,e){if(!this.rawWater(x,y,e))return false;const s=this.site(Math.round(x/CELL),Math.round(y/CELL));if(s.exists&&Math.hypot(x-s.x,y-s.y)<s.r+150)return false;return true;}
  temp(x,y,e){return clamp(fbm(this.n^9,x/6500,y/6500,3)*1.25-.12-(e-.5)*.55+(1-this.coreMask(x,y))*0,0,1);}
  moist(x,y){return fbm(this.n^13,x/5200+9,y/5200,3);}
  biomeAt(x,y,e){
    if(e===undefined)e=this.elev(x,y);
    if(this.isWater(x,y,e))return B_WATER;
    if(e<.325)return B_SAND;
    let t=this.temp(x,y,e),m=this.moist(x,y);
    const home=1-sstep(1500,4200,Math.hypot(x,y));
    t=lerp(t,.5,home*.85);m=lerp(m,.52,home*.75);
    if(e>.95||t<.1)return B_SNOW;
    if(e>.8)return B_ROCK;
    if(t>.64&&m<.42)return B_DESERT;
    if(m<.4)return B_STEPPE;
    if(m>.56)return B_FOREST;
    return B_PLAIN;
  }
  /* ---------- insediamenti ---------- */
  site(cx,cy){
    const key=cx+','+cy;let s=this._site.get(key);if(s)return s;
    const core=Math.abs(cx)<=CORE&&Math.abs(cy)<=CORE,ring=Math.max(Math.abs(cx),Math.abs(cy))===CORE+1;
    s={id:key,cx,cy,core,ring,exists:false,x:0,y:0,size:0,r:0};
    this._site.set(key,s);
    const h=k=>ih(this.n^k,cx,cy);
    let want=core||(ring&&h(1)<.9)||(!core&&!ring&&h(2)<.34);
    if(want){
      const jx=(h(3)-.5)*.55*CELL,jy=(h(4)-.5)*.55*CELL;let px=cx*CELL+jx,py=cy*CELL+jy,ok=false;
      for(let k=0;k<26&&!ok;k++){
        const a=k*2.4,d=k<1?0:k*38,x=px+Math.cos(a)*d,y=py+Math.sin(a)*d;
        const e=this.elev(x,y);
        if(!this.rawWater(x,y,e)&&this.rawWater(x+90,y,undefined)===false&&this.rawWater(x,y+90)===false&&e<.8){px=x;py=y;ok=true;}
      }
      if(!ok&&core)ok=true;
      if(ok){
        s.exists=true;s.x=px;s.y=py;
        const q=h(5);
        s.size=core?(cx===0&&cy===0?3:q<.38?1:q<.8?2:3):0;
        s.r=[96,175,265,385][s.size];
        s.kind=s.size?'città':'avamposto';
        const rn=mulberry32(hashStr(key)^this.n);
        s.name=cityName(rn);
        s.nameSeed=rn;
        s.pop=s.size?Math.round([0,6,28,120][s.size]*(0.7+rn()*.6)*100)*10:Math.round(20+rn()*180);
        s.fuel=+(this.fuelBase*(.9+rn()*.2)).toFixed(2);
        s.services={gas:true,garage:s.size>=2||rn()<.5,dealer:s.size===3||(s.size===2&&rn()<.45)||(cx===0&&cy===0)};
        if(!s.size)s.services.dealer=false;
        s.biome=this.biomeAt(s.x,s.y);
        const sq=this.rawWater(s.x+420,s.y)||this.rawWater(s.x-420,s.y)||this.rawWater(s.x,s.y+420)||this.rawWater(s.x,s.y-420);
        s.coast=sq;
      }
    }
    return s;
  }
  siteAt(x,y){return this.site(Math.round(x/CELL),Math.round(y/CELL));}
  sitesAround(cx,cy,R){const o=[];for(let j=-R;j<=R;j++)for(let i=-R;i<=R;i++){const s=this.site(cx+i,cy+j);if(s.exists)o.push(s);}return o;}
  isCore(x,y){return Math.abs(x)<=(CORE+.5)*CELL&&Math.abs(y)<=(CORE+.5)*CELL;}
  /* ---------- aziende ---------- */
  companiesOf(s){
    let c=this._comp.get(s.id);if(c)return c;
    const r=mulberry32(hashStr('co'+s.id)^this.n);c=[];
    if(!s.size){const ind=IND_BY.emporio;c.push({id:s.id+':0',ind,name:ind.pat[Math.floor(r()*ind.pat.length)].replace('{S}',s.name),hue:ind.hue,city:s.id,idx:0});this._comp.set(s.id,c);return c;}
    const K=s.size===1?2+(r()<.5?1:0):s.size===2?3+Math.floor(r()*3):5+Math.floor(r()*3);
    const b=s.biome;const flags={mount:b===B_ROCK||b===B_SNOW,forest:b===B_FOREST,plain:b===B_PLAIN,desert:b===B_DESERT,steppe:b===B_STEPPE,cold:b===B_SNOW,coast:!!s.coast,city:s.size>=2?1:0};
    const used=new Set();
    const w=ind=>{if(ind.id==='emporio')return 0;let x=1;for(const k in ind.bw)if(flags[k])x*=ind.bw[k];if(ind.bw.city&&!flags.city)x*=.2;if(ind.bw.coast&&!flags.coast)x*=.05;if(ind.id==='ipermercato'&&s.size===1)x=.6;if(s.id==='0,0'&&!ind.out.length)x*=.25;return x;};
    const forced=[];if(s.size===3){forced.push('ipermercato');}else if(s.size===2&&r()<.6)forced.push('ipermercato');
    if(s.coast&&s.size>=2&&r()<.7)forced.push('porto');
    for(const f of forced)if(c.length<K){used.add(f);c.push(f);}
    while(c.length<K){
      let tot=0;const ws=IND.map(i=>used.has(i.id)?0:w(i));for(const x of ws)tot+=x;
      let q=r()*tot,pk=IND[0];for(let i=0;i<IND.length;i++){q-=ws[i];if(q<=0){pk=IND[i];break;}}
      used.add(pk.id);c.push(pk.id);
    }
    c=c.map((id,i)=>{const ind=IND_BY[id];return{id:s.id+':'+i,ind,name:pick(r,ind.pat).replace('{S}',famName(r)),hue:(ind.hue+Math.floor(r()*30)-15+360)%360,city:s.id,idx:i};});
    this._comp.set(s.id,c);return c;
  }
  /* ---------- strade ---------- */
  roadBetween(a,b){
    if(!a.exists||!b.exists||a===b)return null;
    const dx=b.cx-a.cx,dy=b.cy-a.cy;if(Math.abs(dx)>1||Math.abs(dy)>1)return null;
    const A=a.id<b.id?a:b,B=a.id<b.id?b:a,key=A.id+'|'+B.id;
    if(this._road.has(key))return this._road.get(key);
    const diag=dx!==0&&dy!==0,h=ih(this.n^0x77,hashStr(key),1);let ex;
    if(a.core&&b.core)ex=diag?h<.5:true;
    else if(a.core||b.core)ex=diag?h<.25:h<.85;
    else ex=diag?h<.15:h<.55;
    if(!ex){this._road.set(key,null);return null;}
    const kind=a.core&&b.core?(a.size+b.size>=4?'autostrada':'strada'):'sterrata';
    const width=kind==='autostrada'?13:kind==='strada'?9.5:6,limit=kind==='autostrada'?90:kind==='strada'?70:45;
    const len=Math.hypot(B.x-A.x,B.y-A.y),N=Math.max(4,Math.ceil(len/45)),nx=-(B.y-A.y)/len,ny=(B.x-A.x)/len;
    const amp=Math.min(380,len*.14),so=ih(this.n,hashStr(key),9)*500,pts=[],cum=[0];
    for(let i=0;i<=N;i++){const t=i/N,w=Math.pow(Math.sin(Math.PI*t),.8),o=(vnoise(this.n^0xaa,t*len/950+so,3.3)-.5)*2*amp*w;pts.push([A.x+(B.x-A.x)*t+nx*o,A.y+(B.y-A.y)*t+ny*o]);}
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    for(let i=0;i<pts.length;i++){if(i)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));x0=Math.min(x0,pts[i][0]);x1=Math.max(x1,pts[i][0]);y0=Math.min(y0,pts[i][1]);y1=Math.max(y1,pts[i][1]);}
    const rd={id:key,a:A,b:B,pts,cum,len:cum[cum.length-1],kind,width,limit,x0:x0-width,y0:y0-width,x1:x1+width,y1:y1+width};
    this._road.set(key,rd);return rd;
  }
  nearRoads(cx,cy){
    const key=cx+','+cy;let l=this._near.get(key);if(l)return l;
    const seen=new Set();l=[];
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
      const s=this.site(cx+i,cy+j);if(!s.exists)continue;
      for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1],[-1,0],[0,-1],[-1,-1],[-1,1]]){
        const t=this.site(s.cx+dx,s.cy+dy);const r=this.roadBetween(s,t);
        if(r&&!seen.has(r.id)){seen.add(r.id);l.push(r);}
      }
    }
    this._near.set(key,l);return l;
  }
  /* distanza dalla strada più vicina */
  roadQuery(x,y,maxd){
    const roads=this.nearRoads(Math.round(x/CELL),Math.round(y/CELL));
    let best=null,bd=maxd===undefined?1e9:maxd*maxd;
    for(const r of roads){
      if(x<r.x0-(maxd||0)||x>r.x1+(maxd||0)||y<r.y0-(maxd||0)||y>r.y1+(maxd||0))continue;
      const p=r.pts;
      for(let i=0;i<p.length-1;i++){
        const ax=p[i][0],ay=p[i][1],bx=p[i+1][0],by=p[i+1][1],vx=bx-ax,vy=by-ay;
        let t=((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy);t=t<0?0:t>1?1:t;
        const px=ax+vx*t,py=ay+vy*t,d=(x-px)*(x-px)+(y-py)*(y-py);
        if(d<bd){bd=d;best={road:r,i,t,d:Math.sqrt(d),px,py,dx:vx,dy:vy};}
      }
    }
    return best;
  }
  /* ---------- percorsi (Dijkstra sulle città) ---------- */
  neighborsOf(s){const o=[];for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1],[-1,0],[0,-1],[-1,-1],[-1,1]]){const t=this.site(s.cx+dx,s.cy+dy),r=this.roadBetween(s,t);if(r)o.push([t,r]);}return o;}
  route(a,b){
    if(a===b)return{sites:[a],roads:[],len:0};
    const key=a.id+'>'+b.id;if(this._route.has(key))return this._route.get(key);
    const dist=new Map([[a.id,0]]),prev=new Map(),open=[a],done=new Set();let found=false;
    const lim=Math.max(7,Math.max(Math.abs(a.cx-b.cx),Math.abs(a.cy-b.cy))+4);
    while(open.length){
      let bi=0;for(let i=1;i<open.length;i++)if(dist.get(open[i].id)<dist.get(open[bi].id))bi=i;
      const u=open.splice(bi,1)[0];if(done.has(u.id))continue;done.add(u.id);
      if(u===b){found=true;break;}
      for(const [v,r] of this.neighborsOf(u)){
        if(Math.abs(v.cx-a.cx)>lim||Math.abs(v.cy-a.cy)>lim)continue;
        const nd=dist.get(u.id)+r.len;if(nd<(dist.has(v.id)?dist.get(v.id):1e18)){dist.set(v.id,nd);prev.set(v.id,[u,r]);open.push(v);}
      }
    }
    let res=null;
    if(found){const sites=[b],roads=[];let c=b;while(c!==a){const [p,r]=prev.get(c.id);sites.unshift(p);roads.unshift(r);c=p;}res={sites,roads,len:dist.get(b.id)};}
    this._route.set(key,res);return res;
  }
  /* ---------- carichi e lavori ---------- */
  consumers(s,cargoId){
    const key=s.id+'#'+cargoId;let l=this._cons.get(key);if(l)return l;l=[];
    for(let R=2;R<=5&&!l.length;R++){
      for(const t of this.sitesAround(s.cx,s.cy,R)){
        if(t===s)continue;const dc=Math.max(Math.abs(t.cx-s.cx),Math.abs(t.cy-s.cy));if(dc<R-1&&R>2)continue;
        const m=this.companiesOf(t).filter(c=>c.ind.in.includes(cargoId));if(!m.length)continue;
        if(!this.route(s,t)&&!((!s.size||!t.size)&&Math.hypot(s.x-t.x,s.y-t.y)<9500))continue;
        for(const c of m)l.push([t,c]);
      }
    }
    this._cons.set(key,l);return l;
  }
  jobsFor(s,comp,day){
    const out=comp.ind.out;if(!out.length)return[];
    const r=mulberry32(hashStr(comp.id+'#'+day)^this.n),cnt=s.size?3+Math.floor(r()*3):3,jobs=[];
    for(let k=0;k<cnt;k++){
      const cg=CARGO_BY[pick(r,out)],cons=this.consumers(s,cg.id);if(!cons.length)continue;
      const [t,dc]=cons[Math.floor(r()*cons.length)],rt=this.route(s,t)||{len:Math.hypot(s.x-t.x,s.y-t.y)*1.15};
      const tons=Math.round(rr(r,cg.t[0],cg.t[1])*2)/2,dist=Math.round(rt.len+260);
      const frontier=(!s.size||!t.size)?1.35:1;
      const pay=Math.round(dist*tons*cg.rate*this.cargoMul[cg.id]*.0135*rr(r,.9,1.2)*frontier/5)*5;
      const secs=Math.round((dist/9.2+110)*rr(r,.95,1.25)/5)*5;
      jobs.push({id:comp.id+'|'+day+'|'+k,from:s.id,fromComp:comp.id,to:t.id,toComp:dc.id,cargo:cg.id,tons,dist,pay,secs,lvl:cg.lvl,frontier:frontier>1});
    }
    return jobs;
  }
  /* ---------- camion ---------- */
  makeCatalog(r){
    const SER=['Aurex','Brontos','Citan','Dromo','Estrel','Forte','Gryph','Hexa','Ionis','Kalos','Lumen','Maxor','Nimbo','Orion','Pyra','Quasar','Rocca','Solis','Tauro','Vega','Zenit','Argo','Bolt','Cobra'];
    const BN=['Mot','Trans','Vec','Lux','Ard','Nor','Vol','Cam','Ant','Tor'],BE=['ra','is','on','ex','ia','ar','um','or','co','ex'];
    this.brands=[];const hues=[];
    for(let i=0;i<5;i++){
      let nm=cap(pick(r,ON.slice(0,24))+pick(r,['a','e','o','i'])+pick(r,['tra','vo','lex','mar','dor','ton','ver','scan','nor','vik']));
      const hue=Math.floor(r()*360);hues.push(hue);
      this.brands.push({id:i,name:nm,hue,cab:r()<.5?'cab':'conv',tp:{hp:rr(r,.92,1.1),price:rr(r,.9,1.15),fuel:rr(r,.9,1.1)},series:SER.splice(Math.floor(r()*SER.length),1)[0],logo:Math.floor(r()*4)});
    }
    this.models=[];
    for(const b of this.brands){
      const nm=7+Math.floor(r()*3);
      for(let k=0;k<nm;k++){
        const t=(k+.3+r()*.4)/nm,hp=Math.round(lerp(255,690,Math.pow(t,1.05))*b.tp.hp/5)*5;
        const m={id:b.id+'-'+k,brand:b.id,bn:b.name,name:b.series+' '+hp,hp,tier:t,cab:b.cab,
          cap:Math.round(lerp(16,46,Math.pow(t,.9))+r()*2),tank:Math.round(lerp(280,900,t)*b.tp.fuel/10)*10,
          mass:Math.round(lerp(6200,9800,t)+r()*400),axles:t>.55?'6x4':'4x2',
          price:Math.round((26000+Math.pow(t,1.5)*165000)*b.tp.price/500)*500,topKmh:Math.round(lerp(86,110,t)+r()*4),
          eff:b.tp.fuel};
        this.models.push(m);
      }
    }
    this.models.sort((a,b)=>a.price-b.price);
  }
  starterTruck(){const m=this.models[0];return{model:m,hue:this.brands[m.brand].hue,accent:(this.brands[m.brand].hue+180)%360,dmg:.14,fuel:m.tank*.7,up:{eng:0,tank:0,tyre:0,aero:0},odo:0};}
  dealerStock(s,week){
    const r=mulberry32(hashStr('dl'+s.id+'w'+week)^this.n),n=5+Math.floor(r()*3),pool=this.models.slice(1),out=[];const used=new Set();
    while(out.length<n&&used.size<pool.length){
      const m=pool[Math.floor(r()*pool.length)];if(used.has(m.id))continue;used.add(m.id);
      const used_=r()<.35,dmg=used_?.15+r()*.3:0;
      const b=this.brands[m.brand],hue=r()<.6?b.hue:Math.floor(r()*360);
      out.push({id:m.id,model:m,hue,accent:(hue+150+Math.floor(r()*60))%360,dmg,used:used_,fuel:m.tank*.4,price:Math.round(m.price*(used_?.55+(1-dmg)*.25:1)*rr(r,.95,1.06)/100)*100,
        up:{eng:0,tank:0,tyre:0,aero:0},odo:used_?Math.round(rr(r,40,400))*1000:0});
    }
    return out.sort((a,b)=>a.price-b.price);
  }
  /* ---------- punti di interesse naturali ---------- */
  landmarkIn(ci,cj){ // 1 al massimo per chunk 512 m
    const key=ci+','+cj;if(this._lm.has(key))return this._lm.get(key);
    let lm=null;const r=mulberry32(ih(this.n,ci*7+3,cj*13+5)*4294967296);
    const x=(ci+.15+r()*.7)*512,y=(cj+.15+r()*.7)*512,core=this.isCore(x,y);
    if(r()<(core?.08:.22)){
      const e=this.elev(x,y);
      if(!this.rawWater(x,y,e)&&!this.siteNear(x,y,420)){const rd=this.roadQuery(x,y,70);if(!rd){lm={id:'L'+key,x,y,kind:Math.floor(r()*LANDMARKS.length),name:'',reward:Math.round(rr(r,250,1200)/10)*10,xp:Math.round(rr(r,30,90)),seed:Math.floor(r()*1e9)};lm.name=LANDMARKS[lm.kind]+' di '+famName(r);}}
    }
    this._lm.set(key,lm);return lm;
  }
  siteNear(x,y,rad){const cx=Math.round(x/CELL),cy=Math.round(y/CELL);for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const s=this.site(cx+i,cy+j);if(s.exists&&Math.hypot(x-s.x,y-s.y)<s.r+rad)return s;}return null;}
  stats(){
    let cities=0,comps=0,docks=0,roads=0,gas=0,dl=0,gar=0;const cg=new Set();
    for(let j=-CORE;j<=CORE;j++)for(let i=-CORE;i<=CORE;i++){const s=this.site(i,j);if(!s.exists)continue;cities++;gas++;if(s.services.dealer)dl++;if(s.services.garage)gar++;for(const c of this.companiesOf(s)){comps++;for(const o of c.ind.out)cg.add(o);}
      for(const [t,r] of this.neighborsOf(s))if(r.a===s)roads+=r.len;}
    return{cities,comps,roads:Math.round(roads/1000),dealers:dl,garages:gar,brands:this.brands.length,models:this.models.length,cargos:cg.size,cargoAll:CARGO.length};
  }
}
