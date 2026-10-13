'use strict';
/* ECO · generazione della regione: mappa, paesi, edifici, interni, persone, indizi, rivali, negozio */
const MW=88,MH=64;
const TL={GRASS:0,FLOWER:1,PATH:2,WATER:3,SAND:4,TREE:5,ROCK:6,FENCE:7,BUSH:8,ROOF0:10,ROOF1:11,ROOF2:12,ROOF3:13,ROOF4:14,ROOF5:15,WALL:16,WALLW:17,DOOR:18,
  FLOOR:20,STONE:21,RUG:22,WALLI:23,MAT:24,DARK:25,GRAVEL:26,TILE:27,FLOWERB:28};
const SOLID_T=new Set([3,5,6,7,8,10,11,12,13,14,15,16,17,23]);
function vnoise(seed){const ph=hashStr(seed)%1000;const H=(x,y)=>{let h=(x*374761393+y*668265263+ph*2147483647)>>>0;h=(h^(h>>>13))*1274126177>>>0;return((h^(h>>>16))>>>0)/4294967295;};
  return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return lerp(lerp(H(xi,yi),H(xi+1,yi),u),lerp(H(xi,yi+1),H(xi+1,yi+1),u),v);};}
const BLD_NAMES={studio:'Casa e studio',shop:'Elettro-Mix',bar:'Osteria',library:'Biblioteca',house:'Casa',church:'Chiesa',mill:'Mulino',theater:'Teatro',factory:'Fabbrica',lighthouse:'Faro',farm:'Casale',museum:'Museo civico',villa:'Villa',tower:'Torre radio',station:'Stazione meteo',mine:'Miniera',dam:'Diga'};
const BLD_SIZE={studio:[6,5],shop:[6,5],bar:[7,5],library:[7,5],house:[5,4],church:[6,6],mill:[6,5],theater:[7,6],factory:[7,5],lighthouse:[4,7],farm:[6,5],museum:[7,5],villa:[7,6],tower:[4,7],station:[5,4],mine:[6,5],dam:[7,5]};
const SPECIAL=new Set(['mill','theater','factory','lighthouse','farm','museum','villa','tower','station','mine','dam']);

function genWorld(seed,opts){
  const r=rngFor(seed,'world'),noise=vnoise(seed+'|n1'),noise2=vnoise(seed+'|n2');
  const region=placeName(r),W={seed,name:region,mw:MW,mh:MH};
  const tiles=new Uint8Array(MW*MH),aux=new Map();
  // terreno
  const coast=ri(r,0,3); // 0 est,1 ovest,2 nord,3 sud
  const wdist=(x,y)=>coast===0?MW-1-x:coast===1?x:coast===2?y:MH-1-y;
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    const n=noise(x/9,y/9),n2=noise2(x/4,y/4),wd=wdist(x,y)+ (noise(x/5+30,y/5)-.5)*5;
    let t=TL.GRASS;
    if(wd<5)t=TL.WATER;else if(wd<7)t=TL.SAND;
    else if(n>.56&&n2>.3)t=TL.TREE;else if(n2>.8)t=TL.FLOWER;else if(n>.66)t=TL.BUSH;else if(n2>.62&&noise(x/2+50,y/2)>.7)t=TL.TREE;else if(n2<.1)t=TL.ROCK;
    if(x<2||y<2||x>=MW-2||y>=MH-2)t=TL.TREE;
    tiles[y*MW+x]=t;
  }
  // paesi
  const cr=rngFor(seed,'towns');
  const slots=shuffle(cr,[[5,5],[50,5],[5,36],[48,34]]);
  const pickSlots=slots.slice(0,4).map(([x,y])=>[clamp(x+ri(cr,-2,3),4,MW-34),clamp(y+ri(cr,-2,3),4,MH-26)]);
  // evitiamo che il paese cada in acqua: se la costa è est/sud ecc., spostiamo
  const towns=[];
  const TW=32,TH=22;
  pickSlots.forEach(([tx,ty],i)=>{
    // se in acqua, scorri verso l'interno
    for(let k=0;k<20;k++){let bad=false;for(const[px,py]of[[tx,ty],[tx+TW,ty],[tx,ty+TH],[tx+TW,ty+TH]])if(tiles[clamp(py,0,MH-1)*MW+clamp(px,0,MW-1)]===TL.WATER||tiles[clamp(py,0,MH-1)*MW+clamp(px,0,MW-1)]===TL.SAND)bad=true;if(!bad)break;
      if(coast===0)tx-=2;else if(coast===1)tx+=2;else if(coast===2)ty+=2;else ty-=2;tx=clamp(tx,3,MW-TW-3);ty=clamp(ty,3,MH-TH-3);}
    towns.push({id:'t'+i,idx:i,name:placeName(cr),x:tx,y:ty,w:TW,h:TH,buildings:[],hub:i===0});
  });
  const hubId='t0';
  // il paese di casa deve essere il più vicino al centro
  const cx=MW/2,cy=MH/2;towns.sort((a,b)=>Math.hypot(a.x+TW/2-cx,a.y+TH/2-cy)-Math.hypot(b.x+TW/2-cx,b.y+TH/2-cy));
  towns.forEach((t,i)=>{t.id='t'+i;t.idx=i;t.hub=i===0;});
  const kinds=pickKinds(seed);
  towns.slice(1).forEach((t,i)=>{const pl=pick(rngFor(seed,'pl'+i),PLACES[kinds[i]]);t.caseBld=pl.bld;t.caseKind=kinds[i];});
  // piano edifici
  let bid=0;
  const bldPlan=(t)=>{
    const br=rngFor(seed,'bp'+t.id);
    if(t.hub)return['studio','shop','bar','library','house','church'];
    const lib=(t.idx===1||t.idx===2);
    const base=[t.caseBld,'bar','house','house'];if(lib)base.push('library');if(br()<.7)base.push('church');else base.push('house');
    return shuffle(br,base);
  };
  for(const t of towns){
    const plan=bldPlan(t),br=rngFor(seed,'bpos'+t.id);
    // due file: 3 sopra + 3 sotto (slot 10 tile)
    plan.forEach((type,k)=>{
      const[wb,hb]=BLD_SIZE[type]||[5,4];
      const row=k<3?0:1,col=k%3;
      const sx=t.x+1+col*10+ri(br,0,3),sy=row===0?t.y+1:t.y+12;
      const b={id:'b'+(bid++),type,town:t.id,x:sx+Math.max(0,Math.floor((9-wb)/2)),y:sy,w:wb,h:hb,roof:ri(br,0,5),name:BLD_NAMES[type],npcs:[]};
      b.doorX=b.x+Math.floor(b.w/2);b.doorY=b.y+b.h-1;
      t.buildings.push(b);
      if(type===t.caseBld)t.caseBldId=b.id;
      if(type==='bar')b.name='Osteria '+pick(br,['del Gallo','dei Pescatori','Il Cavallino','Da Nando','La Lanterna','Dei Tre Archi']);
      if(type==='shop')b.name='Elettro-Mix';
      if(SPECIAL.has(type))b.name=cap(PLACES[t.caseKind].find(p=>p.bld===type).n);
    });
    // spazio pulito e paesaggio del paese
    for(let y=t.y;y<t.y+t.h;y++)for(let x=t.x;x<t.x+t.w;x++){const o=tiles[y*MW+x];if(o!==TL.WATER&&o!==TL.SAND)tiles[y*MW+x]=(noise2(x,y)>.78)?TL.FLOWER:TL.GRASS;}
    // edifici
    for(const b of t.buildings){
      for(let yy=0;yy<b.h;yy++)for(let xx=0;xx<b.w;xx++){
        const X=b.x+xx,Y=b.y+yy;let id;
        if(yy<b.h-1)id=TL.ROOF0+b.roof;else id=(xx===Math.floor(b.w/2))?TL.DOOR:(xx%2===1?TL.WALLW:TL.WALL);
        tiles[Y*MW+X]=id;
      }
      aux.set(b.doorY*MW+b.doorX,{door:b.id});
    }
    // sentieri: sotto ogni fila
    const pathRows=[t.y+Math.max(...t.buildings.filter((b,k)=>k<3).map(b=>b.h))+0,t.y+12+Math.max(...t.buildings.filter((b,k)=>k>=3).map(b=>b.h),4)+0];
    const rows=new Set();
    for(const b of t.buildings){const py=b.y+b.h;rows.add(py);}
    for(const py of rows)for(let x=t.x;x<t.x+t.w;x++){if(py<MH&&tiles[py*MW+x]!==TL.WATER)tiles[py*MW+x]=TL.PATH;}
    // sentiero verticale centrale
    const vx=t.x+Math.floor(t.w/2);
    for(let y=t.y;y<t.y+t.h;y++){if(tiles[y*MW+vx]===TL.GRASS||tiles[y*MW+vx]===TL.FLOWER)tiles[y*MW+vx]=TL.PATH;}
    for(const b of t.buildings){ // collegamento porta -> sentiero
      for(let y=b.doorY+1;y<=b.doorY+1;y++)tiles[y*MW+b.doorX]=TL.PATH;
    }
    t.cx=vx;t.cy=Math.max(...[...rows])||t.y+8;
    // un pozzo/aiuola e qualche albero decorativo
    const wx=t.x+Math.floor(t.w/2)+2,wy=t.y+Math.floor(t.h/2);
    if(tiles[wy*MW+wx]===TL.GRASS||tiles[wy*MW+wx]===TL.FLOWER)tiles[wy*MW+wx]=TL.ROCK;
  }
  // strade fra paesi (BFS su griglia con costo)
  const roadPath=(ax,ay,bx,by)=>{
    const key=(x,y)=>y*MW+x,dist=new Map([[key(ax,ay),0]]),prev=new Map(),open=[[0,0,ax,ay]];
    const costOf=(i)=>{const t=tiles[i];if(t===TL.WATER||(t>=10&&t<=18))return 99;if(t===TL.TREE)return 4;if(t===TL.PATH)return .3;if(t===TL.ROCK)return 99;if(t===TL.BUSH)return 2;return 1;};
    let found=false;
    while(open.length){
      let bi=0;for(let i=1;i<open.length;i++)if(open[i][0]<open[bi][0])bi=i;
      const[f,gc,x,y]=open.splice(bi,1)[0];if(gc>(dist.get(key(x,y))??1e9)+1e-9)continue;
      if(x===bx&&y===by){found=true;break;}
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<2||ny<2||nx>=MW-2||ny>=MH-2)continue;const c=costOf(key(nx,ny));if(c>=99)continue;const nd=gc+c;if(nd<(dist.get(key(nx,ny))??1e9)){dist.set(key(nx,ny),nd);prev.set(key(nx,ny),key(x,y));open.push([nd+(Math.abs(nx-bx)+Math.abs(ny-by))*.3,nd,nx,ny]);}}
    }
    const out=[];if(!found)return out;let k=key(bx,by);while(k!==undefined&&k!==key(ax,ay)){out.push(k);k=prev.get(k);}out.push(key(ax,ay));return out;
  };
  const link=(a,b)=>{for(const k of roadPath(a.cx,a.cy,b.cx,b.cy)){if(tiles[k]!==TL.WATER&&!(tiles[k]>=10&&tiles[k]<=18))tiles[k]=TL.PATH;}};
  for(let i=1;i<towns.length;i++)link(towns[0],towns[i]);
  link(towns[1],towns[2]);if(towns[3])link(towns[2],towns[3]);
  // sabbia/erba ai bordi dei sentieri: alberi non sui sentieri già gestito. Punti di registrazione ambientale
  W.map={w:MW,h:MH,tiles,aux};W.towns=towns;W.hubId=hubId;
  W.buildings={};towns.forEach(t=>t.buildings.forEach(b=>W.buildings[b.id]=b));
  // casi e persone
  const C=genCases(seed,towns,hubId);W.cases=C.cases;W.items=C.items;W.npcs=C.npcs;W.org=C.org;
  assignWorld(W,seed);
  W.rivals=genRivals(seed,W);
  W.shop=genShop(seed);
  // punto di partenza: davanti al portone dello studio
  const st=W.buildings[towns[0].buildings.find(b=>b.type==='studio').id];W.studioId=st.id;
  W.start={x:st.doorX,y:st.doorY+1};
  W.ambient=genAmbient(W,seed);
  W.interiors={};
  return W;
}
function pickKinds(seed){const r=rngFor(seed,'cases');return shuffle(r,Object.keys(PLACES)).slice(0,3);}

/* ---------- distribuzione di persone e indizi nel mondo ---------- */
function assignWorld(W,seed){
  const ar=rngFor(seed,'assign');
  const libTowns=W.towns.filter(t=>t.buildings.some(b=>b.type==='library')),townOf=id=>W.towns.find(t=>t.id===id);
  const bldIn=(town,type)=>town.buildings.find(b=>b.type===type);
  // persone nei loro edifici
  for(const id in W.npcs){
    const n=W.npcs[id],t=townOf(n.townId);let b=null;
    if(n.role==='archivista'){const lt=libTowns[ri(ar,0,libTowns.length-1)];n.townId=lt.id;b=bldIn(lt,'library');}
    else if(n.role==='anziano')b=bldIn(t,'bar');
    else if(n.role==='insider')b=ar()<.5?bldIn(t,'bar'):t.buildings.filter(x=>x.type==='house')[0]||bldIn(t,'bar');
    else if(n.role==='colpevole')b=t.buildings.filter(x=>x.type==='house'||x.type==='church'||x.type==='shop')[0]||t.buildings[0];
    else if(n.role==='testimone')b=t.buildings.filter(x=>x.type==='house')[ri(ar,0,1)]||bldIn(t,'bar');
    else b=t.buildings.find(x=>x.type==='house')||t.buildings[0];
    if(!b)b=t.buildings[0];
    n.bld=b.id;b.npcs.push(id);
  }
  // gestori fissi
  const addKeeper=(b,role,name)=>{const sex=ar()<.5?'f':'m';const id='n'+Object.keys(W.npcs).length;const n={id,name:personName(ar,sex),sex,trait:pick(ar,TRAIT_KEYS),townId:b.town,role,bld:b.id,case:-1,trust:40,statements:[],chat:[],rumors:[],style:Math.floor(ar()*1e6),age:ri(ar,30,70),keeper:true,topic:'p_'+id};W.npcs[id]=n;b.npcs.push(id);return n;};
  for(const t of W.towns)for(const b of t.buildings){
    if(b.type==='bar')addKeeper(b,'oste');
    if(b.type==='shop')addKeeper(b,'negoziante');
    if(b.type==='library'&&!b.npcs.some(i=>W.npcs[i].role==='archivista'))addKeeper(b,'bibliotecario');
    if(b.type==='church')addKeeper(b,'parroco');
    if(b.type==='studio'){const n=addKeeper(b,'zia');n.name='Zia '+cap(pick(ar,FIRST_F));n.keeper=true;}
  }
  // passanti all'aperto con voci
  W.passers=[];
  const rumorPool=[];W.cases.forEach(c=>(c.rumorPool||[]).forEach(i=>rumorPool.push(i)));
  for(const t of W.towns){
    const np=ri(ar,2,4);
    for(let k=0;k<np;k++){
      const sex=ar()<.5?'f':'m',id='p'+W.passers.length+'_'+t.id;
      const n={id,name:personName(ar,sex),sex,trait:pick(ar,TRAIT_KEYS),townId:t.id,role:'passante',bld:null,case:-1,trust:40,statements:[],chat:[],rumors:[],style:Math.floor(ar()*1e6),age:ri(ar,18,80),topic:'p_'+id,wander:true};
      const rs=shuffle(ar,rumorPool).slice(0,ri(ar,1,2));n.rumors=rs;
      W.npcs[id]=n;W.passers.push(id);
    }
  }
  // oggetti indizio dentro gli edifici del caso
  W.clues={}; // bid -> [clue]
  const addClue=(bid,it,label)=>{(W.clues[bid]=W.clues[bid]||[]).push({id:'cl'+Object.values(W.clues).flat().length,items:[it.id],label,inv:it.invReq||0,sprite:pick(ar,['box','paper','tool','photo','clock']),done:false});};
  W.cases.forEach(cs=>{
    const tw=townOf(cs.town),caseB=W.buildings[tw.caseBldId],houseB=tw.buildings.find(b=>b.type==='house');
    cs.items.forEach(iid=>{
      const it=W.items[iid];
      if(it.where&&it.where.kind==='object'){
        const b=(it.where.hard&&houseB&&ar()<.5)?houseB:caseB;
        const lab={clock:'Un orologio fermo',box:'Una scatola dimenticata',paper:'Dei fogli ingialliti',tool:'Un attrezzo bruciacchiato',photo:'Una vecchia fotografia'};
        addClue(b.id,it,null);
      }else if(it.src.type==='archivio'||it.src.type==='giornale'){
        // si trova in una biblioteca
        const lt=libTowns[ri(ar,0,libTowns.length-1)];it.where={kind:'archive',town:lt.id};
      }
    });
  });
}
function genAmbient(W,seed){
  const r=rngFor(seed,'amb'),out=[];
  const names=['Onde sulla scogliera','Vento tra gli alberi','Campane del mattino','Ruscello nel bosco','Mercato del paese','Grilli di sera'];
  const spots=[];
  for(let y=4;y<MH-4;y++)for(let x=4;x<MW-4;x++){const t=W.map.tiles[y*MW+x];if(t===TL.SAND&&W.map.tiles[(y)*MW+x+1]!==TL.PATH)spots.push([x,y,'sea']);}
  const shuf=shuffle(r,spots);
  const used=[];
  for(const[x,y,k]of shuf){if(used.some(u=>Math.hypot(u[0]-x,u[1]-y)<12))continue;used.push([x,y]);out.push({id:'a'+out.length,x,y,name:names[out.length%names.length],got:false,q:ri(r,40,80)});if(out.length>=3)break;}
  // anche vicino ai paesi: mercato e campane
  W.towns.forEach((t,i)=>{if(out.length<5&&i<2){out.push({id:'a'+out.length,x:t.cx+3,y:t.cy+1,name:i===0?'Campane del paese':'Chiacchiericcio del mercato',got:false,q:ri(r,45,75)});}});
  return out;
}
/* ---------- rivali e negozio ---------- */
function genRivals(seed,W){
  const r=rngFor(seed,'rivals'),out=[];
  const A=['Mistero','Voci','Cronache','Radio','Il podcast di','Frequenze','Echi','Storie'],B=['Mattutino','dal Borgo','Nel Buio','Sotto la Lente','Dimenticate','di Provincia','Senza Filtro','Notturne'];
  const used=new Set();
  while(out.length<9){const n=pick(r,A)+' '+pick(r,B);if(used.has(n))continue;used.add(n);
    out.push({id:'r'+out.length,name:n,host:personName(r,r()<.5?'f':'m'),fans:Math.round(rr(r,400,48000)),score:Math.round(rr(r,35,92)),drift:rr(r,-.5,.5),theory:null,heard:false});}
  // alcuni rivali sviluppano teorie (spesso sbagliate) sui casi
  const caseIdx=shuffle(r,[0,1,2]);
  out.slice(0,3).forEach((rv,i)=>{const cs=W.cases[caseIdx[i]];const lies=cs.items.map(id=>W.items[id]).filter(it=>!it.truth&&it.fact!=='EVENT');const pickIt=lies.length?pick(r,lies):null;rv.theory=pickIt?pickIt.id:null;rv.case=cs.id;});
  return out;
}
function genShop(seed){
  const r=rngFor(seed,'shop'),mul=()=>rr(r,.92,1.12),out=[];
  for(const k of GEAR_KEYS)GEAR[k].forEach((g,i)=>{if(i>0)out.push({kind:'gear',slot:k,tier:i,price:Math.round(g.p*mul()/5)*5});});
  MUSIC.forEach(m=>{if(m.p>0)out.push({kind:'music',id:m.id,price:Math.round(m.p*mul()/5)*5});});
  SFX.forEach(s=>out.push({kind:'sfx',id:s.id,price:Math.round(s.p*mul()/5)*5}));
  return out;
}
/* ---------- interni ---------- */
const INT_SIZE={studio:[12,9],shop:[12,8],bar:[12,9],library:[14,10],house:[10,8],church:[12,10]};
function getInterior(W,bid){
  if(W.interiors[bid])return W.interiors[bid];
  const b=W.buildings[bid],r=rngFor(W.seed,'int'+bid),sp=SPECIAL.has(b.type);
  const[w,h]=sp?[14,10]:(INT_SIZE[b.type]||[10,8]);
  const tiles=new Uint8Array(w*h),ents=[];
  const dark=sp&&(b.type==='mill'||b.type==='theater'||b.type==='factory'||b.type==='mine'||b.type==='dam');
  const floor=b.type==='church'||b.type==='museum'||b.type==='library'?TL.STONE:(dark?TL.DARK:TL.FLOOR);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)tiles[y*w+x]=(y===0||x===0||x===w-1)?TL.WALLI:(y===h-1?TL.WALLI:floor);
  const ex=Math.floor(w/2);tiles[(h-1)*w+ex]=TL.MAT;
  const taken=new Set();taken.add(ex+','+(h-2));taken.add((ex-1)+','+(h-2));taken.add((ex+1)+','+(h-2));
  const put=(kind,x,y,extra)=>{if(x<1||y<1||x>=w-1||y>=h-1)return null;const e=Object.assign({kind,x,y,solid:true},extra||{});ents.push(e);taken.add(x+','+y);return e;};
  const free=()=>{for(let k=0;k<80;k++){const x=ri(r,1,w-2),y=ri(r,2,h-3);if(!taken.has(x+','+y))return[x,y];}return null;};
  const rug=(x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(tiles[y*w+x]===floor)tiles[y*w+x]=TL.RUG;};
  const shelfRow=(y,xs)=>{for(const x of xs)put('shelf',x,y,{act:'book',seed:ri(r,0,9999)});};
  if(b.type==='studio'){
    put('desk',2,2,{act:'pc'});put('pcmon',2,1,{act:null});put('bed',w-3,2,{act:'bed',w:2});put('mic',4,2,{act:'mic'});put('rack',w-3,5,{act:'rack'});put('shelf',6,1,{act:'book',seed:1});put('shelf',7,1,{act:'book',seed:2});put('plant',w-2,h-3,{});
    put('window',9,0,{solid:true});rug(4,4,7,6);put('board',1,4,{act:'board_home'});
  }else if(b.type==='shop'){
    for(let x=3;x<=7;x++)put('counter',x,3,{});shelfRow(1,[2,3,5,6,8,9]);put('crate',w-3,5,{});put('crate',w-3,6,{});put('plant',1,h-3,{});rug(4,5,8,6);
  }else if(b.type==='bar'){
    for(let x=2;x<=7;x++)put('counter',x,2,{});
    put('shelf',2,1,{act:'book',seed:3});put('shelf',3,1,{act:'book',seed:4});put('radio',9,1,{act:'radio'});put('board',w-2,3,{act:'board',w:1});
    for(let i=0;i<3;i++){const tx=2+i*3,ty=5+(i%2);put('table',tx,ty,{});put('chair',tx-1,ty,{solid:false});put('chair',tx+1,ty,{solid:false});}
    rug(3,6,8,7);put('plant',w-2,h-3,{});
  }else if(b.type==='library'){
    shelfRow(1,[1,2,4,5,7,8,10,11,12]);shelfRow(3,[1,2,4,5,8,9]);
    put('terminal',w-3,5,{act:'archive'});put('desk',w-5,3,{});put('table',5,6,{});put('chair',4,6,{solid:false});put('chair',6,6,{solid:false});rug(3,5,8,7);put('plant',w-2,1,{});
  }else if(b.type==='church'){
    put('altar',Math.floor(w/2),1,{w:2});for(let y=3;y<=7;y+=2){put('pew',3,y,{w:3});put('pew',w-6,y,{w:3});}rug(Math.floor(w/2)-1,2,Math.floor(w/2),h-2);put('candle',2,1,{});put('candle',w-3,1,{});
  }else if(b.type==='house'){
    put('bed',w-3,1,{w:2});put('table',3,3,{});put('chair',2,3,{solid:false});put('chair',4,3,{solid:false});put('stove',1,1,{});put('shelf',5,1,{act:'book',seed:ri(r,0,9999)});put('plant',w-2,h-3,{});rug(2,4,6,6);
  }else{ // edificio del caso
    const n=ri(r,6,9);
    for(let i=0;i<n;i++){const p=free();if(!p)break;put(pick(r,['crate','crate','pillar','table','chair']),p[0],p[1],{solid:true});}
    put('window',3,0,{});put('window',w-4,0,{});
  }
  // indizi nell'edificio
  const cl=(W.clues&&W.clues[bid])||[];
  for(const c of cl){const p=free();if(!p)continue;put('clue',p[0],p[1],{clue:c.id,act:'clue',solid:false,sprite:c.sprite});}
  // persone
  const stand=(n,x,y)=>ents.push({kind:'npc',npc:n.id,x,y,dir:'down',solid:true});
  const spots=[];
  if(b.type==='bar'){spots.push([4,1]);}else if(b.type==='shop'){spots.push([5,2]);}else if(b.type==='library'){spots.push([w-5,2]);}else if(b.type==='studio'){spots.push([6,5]);}else if(b.type==='church'){spots.push([Math.floor(w/2),2]);}
  const rest=[];for(let k=0;k<12;k++){const p=free();if(p)rest.push(p);}
  for(const nid of b.npcs){const n=W.npcs[nid];let p=null;
    if(['oste','negoziante','bibliotecario','archivista','parroco'].includes(n.role)&&spots.length)p=spots.shift();
    if(!p&&n.role==='zia')p=spots.shift()||free();
    if(!p)p=rest.shift()||free();
    if(p){stand(n,p[0],p[1]);taken.add(p[0]+','+p[1]);}}
  const I={id:bid,bld:b,w,h,tiles,ents,exit:{x:ex,y:h-1},spawn:{x:ex,y:h-2},name:b.name};
  W.interiors[bid]=I;return I;
}
