'use strict';
/* CAMION · layout procedurale di città e avamposti: emette primitive disegnabili + solidi + punti di interesse */
const hsl=(h,s,l,a)=>a===undefined?`hsl(${Math.round(h)},${Math.round(s)}%,${Math.round(l)}%)`:`hsl(${Math.round(h)},${Math.round(s)}%,${Math.round(l)}%,${a})`;
const WALL_PAL={
  [B_DESERT]:{h:[28,42],s:[30,45],l:[62,76],rh:[8,18]},[B_SNOW]:{h:[200,230],s:[8,20],l:[72,88],rh:[205,225]},
  [B_FOREST]:{h:[22,40],s:[20,35],l:[52,68],rh:[0,12]},[B_PLAIN]:{h:[20,50],s:[12,34],l:[66,84],rh:[5,16]},
  [B_STEPPE]:{h:[30,50],s:[25,40],l:[58,74],rh:[10,22]},[B_ROCK]:{h:[200,230],s:[5,15],l:[55,70],rh:[210,230]},[B_SAND]:{h:[30,48],s:[20,40],l:[70,86],rh:[190,210]}};
World.prototype.city=function(s){
  let C=this._city.get(s.id);if(C)return C;
  const W=this,r=mulberry32(hashStr('ct'+s.id)^this.n);
  const size=s.size;
  C={site:s,x:s.x,y:s.y,r:s.r,size,theta:r()*Math.PI/2,sp:[0,62,72,84][size],sw:[0,13,14,15][size],prims:{ground:[],deco:[],shadow:[],bld:[],top:[]},solids:[],pois:[],lamps:[],blocks:[],grid:new Map(),stats:{bld:0}};
  this._city.set(s.id,C);
  const P=C.prims,th=C.theta,cs=Math.cos(th),sn=Math.sin(th),pal=WALL_PAL[s.biome]||WALL_PAL[B_PLAIN];
  C.bounds=[s.x-s.r-90,s.y-s.r-90,s.x+s.r+90,s.y+s.r+90];
  const toW=(u,v)=>[s.x+u*cs-v*sn,s.y+u*sn+v*cs];
  /* strade vicine, per evitare di costruire sopra */
  const segs=[];
  for(const rd of this.nearRoads(s.cx,s.cy)){
    if(rd.x1<C.bounds[0]||rd.x0>C.bounds[2]||rd.y1<C.bounds[1]||rd.y0>C.bounds[3])continue;
    for(let i=0;i<rd.pts.length-1;i++){const a=rd.pts[i],b=rd.pts[i+1];if(Math.max(a[0],b[0])<C.bounds[0]||Math.min(a[0],b[0])>C.bounds[2]||Math.max(a[1],b[1])<C.bounds[1]||Math.min(a[1],b[1])>C.bounds[3])continue;segs.push([a[0],a[1],b[0],b[1],rd.width/2]);}
  }
  const dRoad=(x,y)=>{let m=1e9;for(const q of segs){const vx=q[2]-q[0],vy=q[3]-q[1];let t=((x-q[0])*vx+(y-q[1])*vy)/(vx*vx+vy*vy);t=t<0?0:t>1?1:t;const d=Math.hypot(x-q[0]-vx*t,y-q[1]-vy*t)-q[4];if(d<m)m=d;}return m;};
  C.dRoad=dRoad;
  /* primitive */
  const bb=pts=>{let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const p of pts){if(p[0]<a)a=p[0];if(p[0]>c)c=p[0];if(p[1]<b)b=p[1];if(p[1]>d)d=p[1];}return[a,b,c,d];};
  const poly=(L,pts,f,st,lw)=>P[L].push({k:'p',pts,f,s:st,lw:lw||1,b:bb(pts)});
  const rectPts=(cx,cy,hw,hh,ang)=>{const c=Math.cos(ang),n=Math.sin(ang);return[[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]].map(([a,b])=>[cx+a*c-b*n,cy+a*n+b*c]);};
  const rect=(L,cx,cy,hw,hh,ang,f,st,lw)=>poly(L,rectPts(cx,cy,hw,hh,ang),f,st,lw);
  const circ=(L,x,y,rad,f,st,lw)=>P[L].push({k:'c',x,y,rad,f,s:st,lw:lw||1,b:[x-rad,y-rad,x+rad,y+rad]});
  const line=(L,pts,col,lw,dash)=>P[L].push({k:'l',pts,col,lw,dash,b:bb(pts)});
  const text=(L,x,y,txt,ang,sz,col)=>P[L].push({k:'t',x,y,txt,ang,sz,col,b:[x-sz*4,y-sz*4,x+sz*4,y+sz*4]});
  const solid=(cx,cy,hw,hh,ang)=>{const o={x:cx,y:cy,hw,hh,c:Math.cos(ang),s:Math.sin(ang),b:[cx-hw-hh,cy-hw-hh,cx+hw+hh,cy+hw+hh]};C.solids.push(o);
    const g=40,i0=Math.floor(o.b[0]/g),i1=Math.floor(o.b[2]/g),j0=Math.floor(o.b[1]/g),j1=Math.floor(o.b[3]/g);
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=i+','+j;let a=C.grid.get(k);if(!a)C.grid.set(k,a=[]);a.push(o);}};
  /* edificio 2.5D: base + facce + tetto spostato */
  const ROOFS=[[10,45,44],[8,50,38],[215,10,40],[25,30,36],[150,22,36],[40,28,60],[200,25,45],[350,40,40]];
  const roofCol=()=>{const q=pick(r,ROOFS);return hsl(q[0]+rr(r,-6,6),q[1],q[2]+rr(r,-5,6));};
  const wallCol=()=>hsl(rr(r,pal.h[0],pal.h[1]),rr(r,pal.s[0],pal.s[1]),rr(r,pal.l[0],pal.l[1]));
  const building=(cx,cy,hw,hh,ang,h,wall,roof,sol)=>{
    const F=rectPts(cx,cy,hw,hh,ang),d=Math.min(9,h*.2),R=F.map(p=>[p[0]-d,p[1]-d*.9]);
    poly('shadow',F.map(p=>[p[0]+h*.5,p[1]+h*.62]),'rgba(0,0,0,.30)');
    poly('bld',F,wall,'rgba(0,0,0,.35)',.6);
    for(let i=0;i<4;i++){const j=(i+1)%4;const q=[F[i],F[j],R[j],R[i]];const nx=F[j][1]-F[i][1],ny=-(F[j][0]-F[i][0]);const lit=(nx*-.7+ny*-.7)>0;poly('bld',q,lit?'rgba(255,255,255,.18)':'rgba(0,0,0,.28)');}
    poly('bld',R,roof,'rgba(0,0,0,.4)',.6);
    if(sol!==false)solid(cx,cy,hw,hh,ang);
    C.stats.bld++;return R;
  };
  const roofDetails=(cx,cy,hw,hh,ang,h)=>{const d=Math.min(9,h*.2);if(hw<5||hh<5)return;const c=Math.cos(ang),n=Math.sin(ang);
    const nn=1+Math.floor(r()*3);for(let k=0;k<nn;k++){const a=(r()*1.4-.7)*hw,b=(r()*1.4-.7)*hh,x=cx+a*c-b*n-d,y=cy+a*n+b*c-d*.9;rect('bld',x,y,Math.min(2.2,hw*.2),Math.min(2.2,hh*.2),ang,'rgba(60,64,72,.85)','rgba(0,0,0,.4)',.5);}};
  const rd=(L,i)=>L[i];
  /* ---------- AVAMPOSTO ---------- */
  if(!size){
    const R0=s.r,ground=hsl(rr(r,28,40),rr(r,20,40),rr(r,48,60));
    circ('ground',s.x,s.y,R0*1.05,ground);
    circ('ground',s.x,s.y,R0*.75,'rgba(255,255,255,.07)');
    const comp=this.companiesOf(s)[0],occ=[];
    const free=(x,y,rad)=>{if(Math.hypot(x-s.x,y-s.y)>R0*.92||dRoad(x,y)<rad*.7+4)return false;for(const o of occ)if(Math.hypot(x-o[0],y-o[1])<rad+o[2])return false;return true;};
    const spot=(rad,n)=>{for(let k=0;k<(n||60);k++){const a=r()*TAU,d=rr(r,10,R0*.75),x=s.x+Math.cos(a)*d,y=s.y+Math.sin(a)*d;if(free(x,y,rad)){occ.push([x,y,rad]);return[x,y];}}return null;};
    const around=(x,y,rad,dist)=>{const a0=r()*TAU;for(let k=0;k<12;k++){const a=a0+k*Math.PI/6,px=x+Math.cos(a)*dist,py=y+Math.sin(a)*dist;if(free(px,py,rad)){occ.push([px,py,rad]);return[px,py];}}return null;};
    const em=spot(24,80)||[s.x,s.y];if(!occ.length)occ.push([em[0],em[1],24]);
    const eang=rr(r,0,TAU);
    building(em[0],em[1],16,11,eang,6,hsl(comp.hue,30,60),hsl(comp.hue,40,38));
    text('bld',em[0]-3,em[1]-3,comp.name,eang,5,'#fff');
    const dp=around(em[0],em[1],10,30)||[em[0]+Math.cos(eang+1.57)*30,em[1]+Math.sin(eang+1.57)*30];
    C.pois.push({kind:'company',x:dp[0],y:dp[1],r:15,comp,name:comp.name});occ.push([dp[0],dp[1],10],[em[0],em[1],20]);
    rect('deco',dp[0],dp[1],6,8,eang,'rgba(255,200,40,.5)','rgba(255,220,60,.9)',.8);
    const pp=spot(16)||around(em[0],em[1],14,50)||[em[0]+45,em[1]];
    rect('bld',pp[0],pp[1],7,4,0,'#d33','#600',.8);rect('top',pp[0],pp[1],9,6,0,'rgba(220,60,40,.9)','rgba(80,0,0,.7)',1);
    C.pois.push({kind:'gas',x:pp[0],y:pp[1]+10,r:14,name:'Distributore'});occ.push([pp[0],pp[1]+10,10]);
    const gp=spot(18,60)||around(em[0],em[1],16,60)||[em[0]-60,em[1]];
    building(gp[0],gp[1],9,6,0,5,'#707882','#4d555f');
    const gq=around(gp[0],gp[1],8,22)||[gp[0],gp[1]+22];occ.push([gq[0],gq[1],8],[gp[0],gp[1],12]);C.pois.push({kind:'garage',x:gq[0],y:gq[1],r:13,name:'Officina da campo'});
    const nh=3+Math.floor(r()*3);
    for(let k=0;k<nh;k++){const q=spot(8,30);if(q)building(q[0],q[1],rr(r,3,5),rr(r,3,4.5),rr(r,0,TAU),4,wallCol(),roofCol());}
    const tk=spot(8,30);if(tk){circ('shadow',tk[0]+3,tk[1]+4,5,'rgba(0,0,0,.3)');circ('bld',tk[0],tk[1],5,'#8c96a3','#444',.8);circ('bld',tk[0]-1,tk[1]-1,3.2,'#aab4c0');solid(tk[0],tk[1],4.2,4.2,0);}
    for(let k=0;k<6;k++){const a=r()*TAU,d=rr(r,30,R0);C.lamps.push([s.x+Math.cos(a)*d,s.y+Math.sin(a)*d]);}
    return C;
  }
  /* ---------- CITTÀ ---------- */
  const sp=C.sp,sw=C.sw,N=Math.ceil(s.r/sp)+1,half=sp/2-sw/2;
  const blocks=[],byIJ=new Map();
  for(let i=-N;i<N;i++)for(let j=-N;j<N;j++){
    const u=(i+.5)*sp,v=(j+.5)*sp,d=Math.hypot(u,v),ang=Math.atan2(v,u),lim=s.r*(.86+.24*vnoise(this.n^3,Math.cos(ang)*2+7,Math.sin(ang)*2+7));
    if(d>lim)continue;
    const [x,y]=toW(u,v),dr=dRoad(x,y);
    const b={i,j,u,v,x,y,d:d/s.r,dr,role:null};blocks.push(b);byIJ.set(i+','+j,b);
  }
  C.blocks=blocks;
  const roadFree=b=>b.dr>half*1.45+3;
  /* assegna ruoli speciali ai blocchi periferici/liberi */
  const comps=this.companiesOf(s),need=[];
  if(s.services.dealer)need.push({t:'dealer'});if(s.services.garage)need.push({t:'garage'});
  need.push({t:'gas'});if(size>=2)need.push({t:'gas'});
  for(const c of comps)need.push({t:'company',comp:c});
  // blocchi extra appena fuori dal bordo, usati solo come ultima spiaggia per i lotti speciali
  const extras=[];
  for(let i=-N-1;i<N+1;i++)for(let j=-N-1;j<N+1;j++){if(byIJ.has(i+','+j))continue;const u=(i+.5)*sp,v=(j+.5)*sp,d=Math.hypot(u,v);if(d>s.r*1.5)continue;const [x,y]=toW(u,v),dr=dRoad(x,y);if(dr<half*1.45+3)continue;if(!blocks.some(b=>Math.abs(b.i-i)<=1&&Math.abs(b.j-j)<=1))continue;extras.push({i,j,u,v,x,y,d:d/s.r,dr,role:null,extra:true});}
  const cand=blocks.filter(b=>roadFree(b)&&b.d>.3);
  for(let k=cand.length-1;k>0;k--){const j=Math.floor(r()*(k+1));[cand[k],cand[j]]=[cand[j],cand[k]];}
  cand.sort((a,b)=>(a.d>.55?0:1)+r()*.6-((b.d>.55?0:1)+r()*.6));
  const taken=[];
  for(const nd of need){
    let best=null;
    for(const b of cand){if(b.role)continue;if(taken.some(t=>Math.abs(t.i-b.i)<=1&&Math.abs(t.j-b.j)<=1&&r()<.8))continue;best=b;break;}
    if(!best)best=cand.find(b=>!b.role);
    if(!best)best=blocks.find(b=>!b.role&&roadFree(b));
    if(!best)best=blocks.find(b=>!b.role&&b.dr>half+2);
    if(!best){best=extras.find(b=>!b.role);if(best){blocks.push(best);byIJ.set(best.i+','+best.j,best);}}
    if(best){best.role=nd.t;best.need=nd;taken.push(best);}
  }
  /* strade */
  const iMin=new Map(),jMin=new Map();
  for(const b of blocks){
    for(const k of [b.i,b.i+1]){const e=iMin.get(k)||[1e9,-1e9];e[0]=Math.min(e[0],b.v-sp/2);e[1]=Math.max(e[1],b.v+sp/2);iMin.set(k,e);}
    for(const k of [b.j,b.j+1]){const e=jMin.get(k)||[1e9,-1e9];e[0]=Math.min(e[0],b.u-sp/2);e[1]=Math.max(e[1],b.u+sp/2);jMin.set(k,e);}
  }
  const asphalt='#3a3d44';
  for(const [k,e] of iMin){const u=k*sp,av=k%4===0,hw=av?sw*.62:sw/2,[cx,cy]=toW(u,(e[0]+e[1])/2);rect('ground',cx,cy,(e[1]-e[0])/2,hw,th+Math.PI/2,asphalt);
    line('deco',[toW(u,e[0]),toW(u,e[1])],av?'rgba(255,205,60,.75)':'rgba(255,255,255,.55)',av?.7:.5,av?null:[5,7]);}
  for(const [k,e] of jMin){const v=k*sp,av=k%4===0,hw=av?sw*.62:sw/2,[cx,cy]=toW((e[0]+e[1])/2,v);rect('ground',cx,cy,(e[1]-e[0])/2,hw,th,asphalt);
    line('deco',[toW(e[0],v),toW(e[1],v)],av?'rgba(255,205,60,.75)':'rgba(255,255,255,.55)',av?.7:.5,av?null:[5,7]);}
  /* lampioni agli incroci */
  for(const [ki,ei] of iMin)for(const [kj,ej] of jMin){const u=ki*sp,v=kj*sp;if(((ki+kj)&1)||v<ei[0]||v>ei[1]||u<ej[0]||u>ej[1])continue;const [x,y]=toW(u+sw*.6,v+sw*.6);C.lamps.push([x,y]);}
  /* blocchi */
  const pave='#8e9097',greenP=hsl(100,35,38);
  const blockCtx=(b)=>({c:(du,dv)=>toW(b.u+du,b.v+dv)});
  for(const b of blocks){
    const [cx,cy]=[b.x,b.y];
    rect('ground',cx,cy,half,half,th,pave);
    if(b.role){ buildLot(b);continue; }
    const rnd=r();
    if(b.d<.18&&rnd<.18||(b.d>=.18&&rnd<.1)){ // parco
      rect('ground',cx,cy,half-3,half-3,th,greenP);
      if(b.d<.18){circ('ground',cx,cy,9,'#7fb9d6','#cfd7dc',2);circ('ground',cx,cy,3,'#e6f2f8');}
      const nt=b.d<.18?6:12;for(let k=0;k<nt;k++){const a=rr(r,-1,1)*(half-6),c=rr(r,-1,1)*(half-6),[tx,ty]=toW(b.u+a,b.v+c);if(Math.hypot(a,c)<12&&b.d<.18)continue;if(dRoad(tx,ty)<5)continue;circ('shadow',tx+2,ty+2.5,rr(r,3,4.5),'rgba(0,0,0,.25)');circ('deco',tx,ty,rr(r,3,4.5),hsl(rr(r,85,130),rr(r,35,50),rr(r,26,38)));}
      continue;
    }
    const dense=b.d<.3,mixed=b.d<.58,bld0=C.stats.bld;
    const nx=dense?1+(r()<.4?1:0):mixed?2:3,ny=dense?1+(r()<.4?1:0):mixed?2:3,h0=half-2.6;
    for(let a=0;a<nx;a++)for(let c=0;c<ny;c++){
      if(!dense&&!mixed&&r()<.12)continue;
      const cw=h0*2/nx,ch=h0*2/ny,lu=b.u-h0+cw*(a+.5),lv=b.v-h0+ch*(c+.5),gap=dense?1.4:mixed?2:3.4;
      const hw=cw/2-gap,hh=ch/2-gap*(r()<.5?1:1.6);if(hw<2.4||hh<2.4)continue;
      const [wx,wy]=toW(lu,lv);if(dRoad(wx,wy)<Math.hypot(hw,hh)+2)continue;
      const H=dense?rr(r,30,70):mixed?rr(r,12,32):rr(r,4,10);
      const wall=dense?hsl(rr(r,195,225),rr(r,10,25),rr(r,45,70)):wallCol();
      const roof=dense?hsl(rr(r,200,225),rr(r,8,20),rr(r,38,60)):roofCol();
      building(wx,wy,hw,hh,th,H,wall,roof);roofDetails(wx,wy,hw,hh,th,H);
      if(!dense&&!mixed&&r()<.6){const gx=wx+Math.cos(th)*(hw+1.2)*(r()<.5?-1:1),gy=wy+Math.sin(th)*(hw+1.2);circ('deco',gx+Math.cos(th+1.57)*hh*.8,gy+Math.sin(th+1.57)*hh*.8,2.2,hsl(rr(r,90,130),40,32));}
    }
    if(C.stats.bld===bld0){rect('ground',cx,cy,half-3,half-3,th,greenP);for(let k=0;k<8;k++){const [tx,ty]=toW(b.u+rr(r,-1,1)*(half-6),b.v+rr(r,-1,1)*(half-6));if(dRoad(tx,ty)<6)continue;circ('shadow',tx+2,ty+2.5,3.6,'rgba(0,0,0,.25)');circ('deco',tx,ty,3.6,hsl(rr(r,85,130),45,32));}}
  }
  /* ----- lotti speciali ----- */
  function buildLot(b){
    const nd=b.need,face=Math.floor(r()*4),dx=[1,0,-1,0][face],dy=[0,1,0,-1][face]; // direzione dock in locale
    const c=toW(b.u,b.v),cx=c[0],cy=c[1];
    const dockL=[b.u+dx*half*.48,b.v+dy*half*.48],dock=toW(dockL[0],dockL[1]);
    const backL=[b.u-dx*half*.42,b.v-dy*half*.42],back=toW(backL[0],backL[1]);
    const along=dx!==0; // il lato lungo dell'edificio è perpendicolare a d
    const bw=along?half*.42:half*.88,bh=along?half*.88:half*.42; // semi-estensioni locali (u,v)
    if(nd.t==='company'){
      const comp=nd.comp,look=comp.ind.look;
      rect('ground',cx,cy,half-1.5,half-1.5,th,look==='yard'?hsl(30,12,48):'#9c9fa6');
      const wall=hsl(comp.hue,26,62),roof=hsl(comp.hue,34,40);
      if(look==='factory'||look==='shed'||look==='store'){
        const hh=look==='shed'?.3:.4;
        const R=building(back[0],back[1],(along?half*hh:half*.8),(along?half*.8:half*hh),th,look==='store'?8:14,wall,roof);
        const dd=Math.min(9,(look==='store'?8:14)*.2);
        if(look==='factory'){
          const ch=toW(backL[0]+(along?0:half*.5),backL[1]+(along?half*.5:0));circ('shadow',ch[0]+10,ch[1]+13,3,'rgba(0,0,0,.28)');circ('bld',ch[0]-5,ch[1]-5,3.2,'#6d6f76','#222',.8);circ('bld',ch[0]-5,ch[1]-5,1.6,'#222');}
        if(look==='store'){// parcheggio
          for(let k=-4;k<=4;k++){const p=toW(b.u+dx*half*.2+(along?0:k*7),b.v+dy*half*.2+(along?k*7:0));rect('deco',p[0],p[1],.25,half*.2,th+(along?0:0),'rgba(255,255,255,.55)');}}
        text('bld',R[0][0]*.5+R[2][0]*.5,R[0][1]*.5+R[2][1]*.5,comp.name,th+(along?Math.PI/2:0),look==='store'?7:6,'rgba(255,255,255,.92)');
        if(look==='shed'){const sx=toW(backL[0]+(along?0:half*.6),backL[1]+(along?half*.6:0));circ('shadow',sx[0]+5,sx[1]+6,5,'rgba(0,0,0,.3)');circ('bld',sx[0],sx[1],5,'#c9ccd1','#555',.8);circ('bld',sx[0]-1.5,sx[1]-1.5,3.4,'#e5e8ec');solid(sx[0],sx[1],4.4,4.4,0);}
      }else if(look==='tanks'){
        const nt=3+Math.floor(r()*2);
        for(let k=0;k<nt;k++){const t=(k+.5)/nt*2-1,p=toW(backL[0]+(along?0:t*half*.7),backL[1]+(along?t*half*.7:0)),rad=Math.min(9,half*.2);
          circ('shadow',p[0]+rad*.7,p[1]+rad*.9,rad,'rgba(0,0,0,.28)');circ('bld',p[0],p[1],rad,'#b9bfc7','#555',.8);circ('bld',p[0]-rad*.15,p[1]-rad*.15,rad*.78,'#d9dde2');circ('bld',p[0]-rad*.15,p[1]-rad*.15,rad*.25,'#7b828b');solid(p[0],p[1],rad*.9,rad*.9,0);}
        const o=toW(b.u+dx*half*.05+(along?0:half*.55),b.v+dy*half*.05+(along?half*.55:0));building(o[0],o[1],6,5,th,5,wall,roof);
        text('deco',back[0],back[1]+14,comp.name,th,5,'rgba(255,255,255,.9)');
      }else if(look==='yard'||look==='port'){
        const nrow=look==='port'?4:2;
        for(let k=0;k<nrow*2;k++){
          const t=(k%nrow+.5)/nrow*2-1,t2=Math.floor(k/nrow)*.45-.15,p=toW(backL[0]+(along?t2*half*.3:t*half*.7),backL[1]+(along?t*half*.7:t2*half*.3));
          if(look==='port'){const hu=(comp.hue+k*47)%360;const R=building(p[0],p[1],along?4.2:7.5,along?7.5:4.2,th,5,hsl(hu,45,45),hsl(hu,50,52));roofDetails(p[0],p[1],8,8,th,5);}
          else{const rad=rr(r,6,9),col=comp.ind.id==='miniera'?(k%2?'#2b2b2e':'#8a5a3b'):comp.ind.id==='cava'?(k%2?'#c9b283':'#9a9a9a'):'#8d8a82';
            circ('shadow',p[0]+rad*.5,p[1]+rad*.6,rad,'rgba(0,0,0,.28)');circ('bld',p[0],p[1],rad,col,'rgba(0,0,0,.35)',.8);circ('bld',p[0]-rad*.2,p[1]-rad*.2,rad*.55,'rgba(255,255,255,.13)');solid(p[0],p[1],rad*.85,rad*.85,0);}
        }
        const o=toW(b.u+(along?0:-half*.55)+dx*half*.1,b.v+(along?-half*.55:0)+dy*half*.1);building(o[0],o[1],5,4,th,4,wall,roof);
        text('deco',dock[0]+dx*-14*Math.cos(th),dock[1]-14,comp.name,th,5,'rgba(255,255,255,.9)');
      }
      // piazzola di carico
      rect('deco',dock[0],dock[1],along?7:10,along?10:7,th,'rgba(255,200,40,.28)','rgba(255,220,60,.9)',.9);
      C.pois.push({kind:'company',x:dock[0],y:dock[1],r:16,comp,name:comp.name,blk:{i:b.i,j:b.j,u:b.u,v:b.v,dx,dy}});
    }else if(nd.t==='gas'){
      rect('ground',cx,cy,half-1.5,half-1.5,th,'#7d7f86');
      const sh=toW(backL[0]+(along?0:-half*.4),backL[1]+(along?-half*.4:0));building(sh[0],sh[1],6.5,4.5,th,5,'#e9e9ee','#c4282d');
      const cc=toW(b.u+dx*half*.1,b.v+dy*half*.1);
      for(let k=-1;k<=1;k++){const p=toW(b.u+dx*half*.1+(along?0:k*6),b.v+dy*half*.1+(along?k*6:0));rect('bld',p[0],p[1],1.0,2.4,th,'#d63a2f','#400',.6);}
      rect('top',cc[0],cc[1],along?10:14,along?14:10,th,'rgba(235,235,240,.88)','rgba(190,40,40,.9)',1.6);
      rect('shadow',cc[0]+6,cc[1]+8,along?10:14,along?14:10,th,'rgba(0,0,0,.2)');
      C.pois.push({kind:'gas',x:cc[0],y:cc[1],r:15,name:'Distributore '+s.name,blk:{i:b.i,j:b.j,u:b.u,v:b.v,dx,dy}});
    }else if(nd.t==='garage'){
      rect('ground',cx,cy,half-1.5,half-1.5,th,'#82848b');
      const R=building(back[0],back[1],(along?half*.32:half*.8),(along?half*.8:half*.32),th,9,'#737b86','#4b525c');
      text('bld',(R[0][0]+R[2][0])/2,(R[0][1]+R[2][1])/2,'OFFICINA',th+(along?Math.PI/2:0),7,'#ffcf4a');
      const p=toW(b.u+dx*half*.25,b.v+dy*half*.25);rect('deco',p[0],p[1],8,8,th,'rgba(255,200,40,.3)','#ffd23d',.9);
      C.pois.push({kind:'garage',x:p[0],y:p[1],r:15,name:'Officina '+s.name,blk:{i:b.i,j:b.j,u:b.u,v:b.v,dx,dy}});
    }else if(nd.t==='dealer'){
      rect('ground',cx,cy,half-1.5,half-1.5,th,'#a7aab2');
      const R=building(back[0],back[1],(along?half*.3:half*.8),(along?half*.8:half*.3),th,9,'#b8d3e6','#6fa3c9');
      text('bld',(R[0][0]+R[2][0])/2,(R[0][1]+R[2][1])/2,'CONCESSIONARIA',th+(along?Math.PI/2:0),6,'#fff');
      for(let k=-1;k<=1;k++){const p=toW(b.u+dx*half*.12+(along?0:k*11),b.v+dy*half*.12+(along?k*11:0));const hu=(W.n+k*80+b.i*30+360000)%360;
        rect('shadow',p[0]+2,p[1]+3,2.4,6,th+(along?0:Math.PI/2)*0+Math.PI/2*(along?1:0),'rgba(0,0,0,.28)');
        rect('bld',p[0],p[1],6,2.5,th+(along?Math.PI/2:0),hsl(hu,55,45),'#222',.6);rect('bld',p[0],p[1],2.2,2.2,th+(along?Math.PI/2:0),'rgba(255,255,255,.35)');solid(p[0],p[1],6,2.6,th+(along?Math.PI/2:0));}
      const p=toW(b.u+dx*half*.5,b.v+dy*half*.5);rect('deco',p[0],p[1],9,6,th,'rgba(80,200,255,.28)','#5fd0ff',.9);
      C.pois.push({kind:'dealer',x:p[0],y:p[1],r:15,name:'Concessionaria '+s.name,blk:{i:b.i,j:b.j,u:b.u,v:b.v,dx,dy}});
    }
    // alberi lungo il perimetro
    for(const [a,c2] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const p=toW(b.u+a*(half-2),b.v+c2*(half-2));if(Math.hypot(p[0]-dock[0],p[1]-dock[1])<18)continue;circ('deco',p[0],p[1],2.6,hsl(110,35,30));}
  }
  C.blocks.forEach(b=>{b.dr=undefined;});
  return C;
};
/* solidi vicini a un punto (per collisioni) */
World.prototype.solidsIn=function(x,y,rad){
  const s=this.siteNear(x,y,rad+10);if(!s)return[];
  const C=this.city(s),g=40,out=[],seen=new Set();
  for(let j=Math.floor((y-rad)/g);j<=Math.floor((y+rad)/g);j++)for(let i=Math.floor((x-rad)/g);i<=Math.floor((x+rad)/g);i++){const a=C.grid.get(i+','+j);if(a)for(const o of a)if(!seen.has(o)){seen.add(o);out.push(o);}}
  return out;
};
