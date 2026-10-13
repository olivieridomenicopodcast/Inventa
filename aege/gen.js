'use strict';
/* AEGE · utilità, nomi palindromi e generazione della mappa */
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
function hashStr(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const rngFor=(seed,tag)=>mulberry32(hashStr(seed+'|'+tag));
const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1)),rr=(r,a,b)=>a+(b-a)*r(),pick=(r,a)=>a[Math.floor(r()*a.length)];
function shuffle(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const newSeed=()=>{let s='';const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';for(let i=0;i<5;i++)s+=a[Math.floor(Math.random()*a.length)];return s;};
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
const $=s=>document.querySelector(s);
const fmt=n=>Math.round(n).toLocaleString('it-IT');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- nomi palindromi: «MarraM», iniziale e finale maiuscole ---------- */
const CONS='bcdfglmnprstvz',VOW='aeiou';
function palindrome(r,minLen,maxLen){
  const len=ri(r,minLen,maxLen),half=len>>1,odd=len&1;
  let h='',v=r()<.45;
  for(let i=0;i<half;i++){h+=v?pick(r,VOW):pick(r,CONS);v=!v;if(r()<.08)v=!v;}
  const mid=odd?(r()<.6?pick(r,VOW):pick(r,CONS)):'';
  const s=h+mid+[...h].reverse().join('');
  return s.length<2?s.toUpperCase():s[0].toUpperCase()+s.slice(1,-1)+s[s.length-1].toUpperCase();
}
const isPal=s=>{const t=s.toLowerCase();return t===[...t].reverse().join('');};
function nameMaker(r){const used=new Set();return(a,b)=>{for(let k=0;k<200;k++){const n=palindrome(r,a,b);if(!used.has(n)){used.add(n);return n;}}return palindrome(r,a+1,b+2);};}
const PLAYER_NAME='Fratesi';

/* ---------- tipi di raccolta ---------- */
const KINDS={
  carta:{n:'Carta',col:'#2f6fd0',lid:'#1f4fa0',ic:'📰',d:'Bidoni blu: giornali, cartone, imballaggi di carta.'},
  plastica:{n:'Plastica',col:'#f2c400',lid:'#c89c00',ic:'🧴',d:'Bidoni gialli: bottiglie, flaconi, vaschette.'},
  organico:{n:'Frazione organica',col:'#7a4a27',lid:'#5a3419',ic:'🍌',d:'Bidoni marroni: scarti di cucina e cibo.'},
  indiff:{n:'Non riciclabile',col:'#8a8f98',lid:'#5f646c',ic:'🗑️',d:'Bidoni grigi: tutto ciò che non si ricicla.'},
  vetro:{n:'Vetro',col:'#2f9e4f',lid:'#1f7a39',ic:'🍾',d:'Bidoni verdi: bottiglie e barattoli di vetro.'},
  ramaglie:{n:'Ramaglie',col:'#3d8a3d',lid:'#7a4a27',ic:'🌿',d:'Bidoni verde e marrone: sfalci e potature.',two:true}
};
const KIND_KEYS=Object.keys(KINDS);

/* ---------- mappa ---------- */
const WW=1760,WH=1280,CITY_W=1330;
function genMap(seed,kind){
  const r=rngFor(seed,'map'),nm=nameMaker(rngFor(seed,'names'));
  const M={seed,kind,W:WW,H:WH,cityName:nm(5,9),roads:[],blocks:[],buildings:[],bins:[],cars:[],solids:[],labels:[],parks:[]};
  // griglia stradale
  const xs=[46],ys=[46];while(xs[xs.length-1]<CITY_W-150)xs.push(xs[xs.length-1]+ri(r,76,112));while(ys[ys.length-1]<WH-150)ys.push(ys[ys.length-1]+ri(r,76,112));
  xs[xs.length-1]=Math.min(xs[xs.length-1],CITY_W-30);ys[ys.length-1]=Math.min(ys[ys.length-1],WH-46);
  const wv=xs.map((_,i)=>i%4===0?14:9),wh=ys.map((_,i)=>i%4===0?14:9);
  xs.forEach((x,i)=>M.roads.push({v:true,c:x,w:wv[i],a:ys[0]-wh[0]/2,b:ys[ys.length-1]+wh[wh.length-1]/2,name:nm(4,8),main:i%4===0}));
  ys.forEach((y,j)=>M.roads.push({v:false,c:y,w:wh[j],a:xs[0]-wv[0]/2,b:xs[xs.length-1]+wv[wv.length-1]/2,name:nm(4,8),main:j%4===0}));
  M.xs=xs;M.ys=ys;M.wv=wv;M.wh=wh;
  // autostrada verso il centro di raccolta
  const hj=Math.floor(ys.length/2),hy=ys[hj];
  const cx0=1500,cx1=1712,cy0=hy-70,cy1=hy+70;
  M.hwy={y:hy,a:xs[xs.length-1],b:cx0,w:12,name:nm(5,8)};
  M.center={name:nm(6,10),x0:cx0,x1:cx1,y0:cy0,y1:cy1,gate:{x:cx0,y:hy,h:14},bays:{},yard:{x0:cx0+4,x1:cx1-4,y0:cy0+4,y1:cy1-4}};
  const bw=29,gap=3;KIND_KEYS.forEach((k,i)=>{M.center.bays[k]={x:cx0+10+i*(bw+gap)+bw/2+4,y:cy0+14,w:bw,h:18,dock:{x:cx0+10+i*(bw+gap)+bw/2+4,y:cy0+37}};});
  M.center.office={x0:cx0+20,y0:cy1-34,x1:cx0+84,y1:cy1-10,name:nm(5,8)};
  M.center.scale={x0:cx0+110,y0:cy1-30,x1:cx0+170,y1:cy1-22};
  M.start={x:cx0+40,y:hy,ang:Math.PI};
  // blocchi
  const ccx=CITY_W/2,ccy=WH/2,maxd=Math.hypot(CITY_W/2,WH/2);
  const SW=3.2;let bid=0;
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){
    const x0=xs[i]+wv[i]/2,x1=xs[i+1]-wv[i+1]/2,y0=ys[j]+wh[j]/2,y1=ys[j+1]-wh[j+1]/2;
    const d=Math.hypot((x0+x1)/2-ccx,(y0+y1)/2-ccy)/maxd;
    M.blocks.push({id:bid++,x0,y0,x1,y1,lx0:x0+SW,ly0:y0+SW,lx1:x1-SW,ly1:y1-SW,d,zone:d<.3?'centro':d<.62?'medio':'periferia',kind:null,i,j});
  }
  // centri commerciali e parchi
  const cand=M.blocks.filter(b=>b.zone!=='periferia'&&b.x1-b.x0>=66&&b.y1-b.y0>=54);
  shuffle(r,cand).slice(0,3).forEach(b=>b.kind='mall');
  shuffle(r,M.blocks.filter(b=>b.zone==='periferia'&&!b.kind)).slice(0,3).forEach(b=>{b.kind='park';M.parks.push(b);});
  // edifici e bidoni
  const bins=M.bins,names={shop:nm,cond:nm};
  const wTarget=.5;
  let binId=0;
  const roof=()=>ri(r,0,7);
  const kindFor=(allowRam)=>{if(r()<wTarget&&(kind!=='ramaglie'||allowRam))return kind;const o=KIND_KEYS.filter(k=>k!==kind&&(allowRam||k!=='ramaglie'));return pick(r,o);};
  const addBins=(b,side,n,big,allowRam,bl)=>{
    // i bidoni stanno sul marciapiede, a filo strada
    const sp=big?3.0:1.9;
    for(let k=0;k<n;k++){
      const off=(k-(n-1)/2)*sp+rr(r,-.25,.25);let x,y,ang;
      if(side==='n'){x=clamp((b.x0+b.x1)/2+off,bl.x0+2,bl.x1-2);y=bl.y0+1.7;ang=-Math.PI/2;}
      else if(side==='s'){x=clamp((b.x0+b.x1)/2+off,bl.x0+2,bl.x1-2);y=bl.y1-1.7;ang=Math.PI/2;}
      else if(side==='w'){y=clamp((b.y0+b.y1)/2+off,bl.y0+2,bl.y1-2);x=bl.x0+1.7;ang=Math.PI;}
      else{y=clamp((b.y0+b.y1)/2+off,bl.y0+2,bl.y1-2);x=bl.x1-1.7;ang=0;}
      const type=kindFor(allowRam);
      const vol=big?(b.type==='mall'?2400:1100):(b.type==='shop'?360:(type==='ramaglie'?240:120));
      bins.push({id:binId++,type,x,y,ang,big,vol,fill:rr(r,.3,1),done:false,bld:b.id,anim:0});
    }
  };
  const sideOf={0:'n',1:'e',2:'s',3:'w'};
  let bldId=0;
  const mkB=(o)=>{const b=Object.assign({id:bldId++,roof:roof(),name:null},o);M.buildings.push(b);M.solids.push({x0:b.x0,y0:b.y0,x1:b.x1,y1:b.y1,k:'b'});return b;};
  for(const bl of M.blocks){
    const {lx0,ly0,lx1,ly1}=bl;
    if(bl.kind==='park'){continue;}
    if(bl.kind==='mall'){
      const w=lx1-lx0,h=ly1-ly0;
      // edificio grande nella metà nord, parcheggio a sud, area di carico a est
      const mb=mkB({type:'mall',x0:lx0+6,y0:ly0+6,x1:lx1-6,y1:ly0+6+h*.52,floors:2,name:nm(5,9)});
      bl.park={x0:lx0+6,y0:mb.y1+3,x1:lx1-6,y1:ly1-4};
      // bidoni sul lato sud verso il parcheggio e laterali sulla strada
      addBins({x0:lx0+14,x1:lx1-14,y0:mb.y0,y1:ly1},'s',2,true,false,bl);
      addBins({x0:lx0,x1:lx1,y0:ly0,y1:ly1},'n',2,true,false,bl);
      addBins({x0:lx0,x1:lx1,y0:ly0+10,y1:ly1-30},'e',2,true,false,bl);
      bl.mall=mb;
      // le auto del parcheggio sono decorazione (non solide)
      continue;
    }
    const z=bl.zone,depth=z==='periferia'?22:z==='medio'?17:13;
    // quattro lati: 0 n, 1 e, 2 s, 3 w
    for(let s=0;s<4;s++){
      const side=sideOf[s];
      let a,b2,fixed;
      if(side==='n'||side==='s'){a=lx0+depth;b2=lx1-depth;}else{a=ly0+depth;b2=ly1-depth;}
      let cur=a;
      while(cur<b2-8){
        let type,wd,dd;
        if(z==='periferia'){type='house';wd=ri(r,17,26);dd=9;}
        else if(z==='medio'){type=r()<.55?'cond':'house';wd=type==='cond'?ri(r,26,38):ri(r,17,24);dd=type==='cond'?15:9;}
        else{type=r()<.62?'shop':'cond';wd=type==='shop'?ri(r,13,18):ri(r,28,38);dd=type==='shop'?12:14;}
        if(cur+wd>b2+2)wd=b2-cur;if(wd<10)break;
        const cw=type==='house'?10:wd-(type==='cond'?2:1),cdd=type==='house'?9:dd;
        const setback=type==='house'?5:type==='cond'?2:0.5;
        let x0,y0,x1,y1,c=cur+wd/2;
        if(side==='n'){x0=c-cw/2;x1=c+cw/2;y0=ly0+setback;y1=y0+cdd;}
        else if(side==='s'){x0=c-cw/2;x1=c+cw/2;y1=ly1-setback;y0=y1-cdd;}
        else if(side==='w'){y0=c-cw/2;y1=c+cw/2;x0=lx0+setback;x1=x0+cdd;}
        else{y0=c-cw/2;y1=c+cw/2;x1=lx1-setback;x0=x1-cdd;}
        const bb=mkB({type,x0,y0,x1,y1,side,floors:type==='house'?ri(r,1,2):type==='cond'?ri(r,4,8):1,name:type==='house'?null:nm(4,8)});
        const nb=type==='house'?ri(r,1,3):type==='cond'?ri(r,3,5):ri(r,1,2);
        addBins(bb,side,nb,type==='cond',type==='house',bl);
        cur+=wd+(type==='house'?ri(r,0,3):0);
      }
    }
    // interno del blocco centrale: grande condominio se c'è spazio
    if(z!=='periferia'){
      const ix0=lx0+depth+4,iy0=ly0+depth+4,ix1=lx1-depth-4,iy1=ly1-depth-4;
      if(ix1-ix0>=22&&iy1-iy0>=18){mkB({type:'cond',x0:ix0,y0:iy0,x1:ix1,y1:iy1,side:null,floors:ri(r,6,10),name:nm(4,8),inner:true});}
    }
  }
  // diradamento: ~70 bidoni della raccolta scelta e altrettanti "distrattori" sparsi per la mappa
  {
    const nT=ri(r,64,80),T=shuffle(r,bins.filter(b=>b.type===kind)).slice(0,nT);
    const O=shuffle(r,bins.filter(b=>b.type!==kind)).slice(0,ri(r,70,95));
    const keep=new Set([...T,...O]);
    const kept=bins.filter(b=>keep.has(b));bins.length=0;kept.forEach((b,i)=>{b.id=i;bins.push(b);});
  }
  // alberi
  M.trees=[];
  for(const bl of M.blocks){
    const inb=M.buildings.filter(b=>b.x1>bl.x0&&b.x0<bl.x1&&b.y1>bl.y0&&b.y0<bl.y1);
    const n=bl.kind==='park'?ri(r,26,44):bl.zone==='periferia'?ri(r,4,9):bl.zone==='medio'?ri(r,2,5):bl.kind==='mall'?0:ri(r,0,2);
    for(let k=0;k<n;k++){
      const x=rr(r,bl.lx0+2,bl.lx1-2),y=rr(r,bl.ly0+2,bl.ly1-2),rad=rr(r,1.4,2.6);
      if(inb.some(b=>x>b.x0-rad&&x<b.x1+rad&&y>b.y0-rad&&y<b.y1+rad))continue;
      if(bins.some(b=>Math.hypot(b.x-x,b.y-y)<rad+1.5))continue;
      M.trees.push({x,y,r:rad,c:ri(r,0,2)});
    }
  }
  M.fields=[];
  for(let k=0;k<7;k++){const x=rr(r,CITY_W+50,WW-260),y=rr(r,60,WH-200);const w=rr(r,80,150),h=rr(r,50,100);if(x+w>M.center.x0-20&&y+h>M.center.y0-40&&y<M.center.y1+40)continue;if(y<M.hwy.y+14&&y+h>M.hwy.y-14)continue;M.fields.push({x,y,w:Math.min(w,WW-x-10),h,c:ri(r,0,2)});}
  for(let k=0;k<150;k++){const x=rr(r,CITY_W+40,WW-20),y=rr(r,20,WH-20);if(x>M.center.x0-10&&y>M.center.y0-10&&y<M.center.y1+10)continue;if(Math.abs(y-M.hwy.y)<12)continue;M.trees.push({x,y,r:rr(r,1.6,3),c:ri(r,0,2)});}
  // auto parcheggiate sui lati delle strade principali
  const carCol=['#c0392b','#2980b9','#27ae60','#f1c40f','#ecf0f1','#2c3e50','#8e44ad','#e67e22','#7f8c8d','#16a085','#d35400'];
  const nearBin=(x,y)=>bins.some(b=>Math.hypot(b.x-x,b.y-y)<5);
  for(const rd of M.roads){
    if(!rd.main&&r()<.7)continue;
    const n=Math.floor((rd.b-rd.a)/22);
    for(let k=0;k<n;k++){
      if(r()>.28)continue;
      const t=rd.a+10+k*22+rr(r,-3,3),side=r()<.5?-1:1,off=side*(rd.w/2-1.1);
      let x,y,w,h;if(rd.v){x=rd.c+off;y=t;w=1.9;h=4.4;}else{x=t;y=rd.c+off;w=4.4;h=1.9;}
      if(nearBin(x,y)||isIntersection(M,x,y,rd))continue;
      M.cars.push({x,y,w,h,col:pick(r,carCol)});M.solids.push({x0:x-w/2,y0:y-h/2,x1:x+w/2,y1:y+h/2,k:'c'});
    }
  }
  // edifici del centro di raccolta come solidi + recinzione
  const C=M.center,fence=1.0;
  const fs=(x0,y0,x1,y1)=>M.solids.push({x0,y0,x1,y1,k:'f'});
  fs(C.x0,C.y0,C.x1,C.y0+fence);fs(C.x0,C.y1-fence,C.x1,C.y1);fs(C.x1-fence,C.y0,C.x1,C.y1);
  fs(C.x0,C.y0,C.x0+fence,C.gate.y-C.gate.h/2);fs(C.x0,C.gate.y+C.gate.h/2,C.x0+fence,C.y1);
  for(const k of KIND_KEYS){const b=C.bays[k];fs(b.x-b.w/2,b.y-b.h/2,b.x+b.w/2,b.y+b.h/2);}
  fs(C.office.x0,C.office.y0,C.office.x1,C.office.y1);
  // confini del mondo
  fs(-20,-20,WW+20,0);fs(-20,WH,WW+20,WH+20);fs(-20,0,0,WH);fs(WW,0,WW+20,WH);
  // indice spaziale
  M.grid=new Map();const G=48;M.G=G;
  M.solids.forEach((s,i)=>{for(let gy=Math.floor(s.y0/G);gy<=Math.floor(s.y1/G);gy++)for(let gx=Math.floor(s.x0/G);gx<=Math.floor(s.x1/G);gx++){const k=gx+','+gy;let a=M.grid.get(k);if(!a)M.grid.set(k,a=[]);a.push(s);}});
  M.targets=bins.filter(b=>b.type===kind);
  M.totalTargetVol=M.targets.reduce((s,b)=>s+b.vol*b.fill,0);
  M.cap=Math.max(1500,Math.ceil(M.totalTargetVol/2.7/100)*100);
  M.zone=(x,y)=>{if(x>CITY_W+30)return 'fuori';return 'città';};
  return M;
}
function isIntersection(M,x,y,rd){for(const o of M.roads){if(o.v===rd.v)continue;const d=Math.abs((o.v?x:y)-o.c);if(d<o.w/2+3)return true;}return false;}
function solidsNear(M,x,y,rad){const out=[],seen=new Set(),G=M.G;for(let gy=Math.floor((y-rad)/G);gy<=Math.floor((y+rad)/G);gy++)for(let gx=Math.floor((x-rad)/G);gx<=Math.floor((x+rad)/G);gx++){const a=M.grid.get(gx+','+gy);if(a)for(const s of a)if(!seen.has(s)){seen.add(s);out.push(s);}}return out;}
