'use strict';
/* CAMION · rendering: terreno a chunk, strade, città, sprite di camion/rimorchi/auto, tile della mappa */
const CHUNK=256,CPX=3; // 256 m per chunk, 3 px per metro
const PAL={[B_SAND]:[222,205,152],[B_PLAIN]:[98,150,74],[B_FOREST]:[60,112,62],[B_DESERT]:[216,178,110],[B_STEPPE]:[164,166,94],[B_ROCK]:[130,126,122],[B_SNOW]:[236,242,249]};
/* campiona terreno su griglia (n+1)x(n+1) con margine 1 per ombreggiatura */
function terrainGrid(W,x0,y0,n,step,chunk){
  const M=n+3,e=new Float32Array(M*M),bio=new Uint8Array(M*M),wf=chunk?new Float32Array(M*M):null;
  for(let j=0;j<M;j++)for(let i=0;i<M;i++){const x=x0+(i-1)*step,y=y0+(j-1)*step,el=W.elev(x,y);e[j*M+i]=el;const b=W.biomeAt(x,y,el);bio[j*M+i]=b;
    if(chunk){let f=el-.3;if(el>.27){const rb=W.riverBand(x,y);f=Math.min(f,(rb-.0075)*14);}if(b!==B_WATER&&f<.003)f=.012;wf[j*M+i]=f;}}
  const img=new ImageData(n+1,n+1),d=img.data,k=22000/step;
  for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){
    const idx=(j+1)*M+i+1,b=bio[idx],x=x0+i*step,y=y0+j*step;
    let r,g,bl;
    if((b===B_WATER||b===B_SAND)&&chunk){const p=PAL[B_PLAIN],v=(vnoise(W.n^5,x/28,y/28)-.5)*26+(vnoise(W.n^6,x/7,y/7)-.5)*10;r=p[0]+v;g=p[1]+v;bl=p[2]+v;}
    else if(b===B_WATER){const t=clamp((.3-e[idx])/.25,0,1);r=lerp(40,14,t);g=lerp(110,52,t);bl=lerp(165,108,t);const sh=(e[idx-M-1]-e[idx+M+1])*k*.2;r+=sh;g+=sh;bl+=sh;}
    else{
      const p=PAL[b],v=(vnoise(W.n^5,x/28,y/28)-.5)*26+(vnoise(W.n^6,x/7,y/7)-.5)*10;
      const sh=clamp((e[idx-M-1]-e[idx+M+1])*k*(b===B_ROCK||b===B_SNOW?1.6:1),-46,46);
      r=p[0]+v+sh;g=p[1]+v+sh;bl=p[2]+v*.8+sh;
    }
    const o=(j*(n+1)+i)*4;d[o]=r;d[o+1]=g;d[o+2]=bl;d[o+3]=255;
  }
  return{img,bio,M,e,wf};
}
function roadsInRect(W,x0,y0,x1,y1){
  const seen=new Set(),out=[];
  for(let cy=Math.round(y0/CELL)-1;cy<=Math.round(y1/CELL)+1;cy++)for(let cx=Math.round(x0/CELL)-1;cx<=Math.round(x1/CELL)+1;cx++)for(const r of W.nearRoads(cx,cy)){if(seen.has(r.id))continue;seen.add(r.id);if(r.x1<x0||r.x0>x1||r.y1<y0||r.y0>y1)continue;out.push(r);}
  return out;
}
function citiesInRect(W,x0,y0,x1,y1){
  const out=[];for(let cy=Math.round(y0/CELL)-1;cy<=Math.round(y1/CELL)+1;cy++)for(let cx=Math.round(x0/CELL)-1;cx<=Math.round(x1/CELL)+1;cx++){const s=W.site(cx,cy);if(s.exists&&s.x+s.r+120>x0&&s.x-s.r-120<x1&&s.y+s.r+120>y0&&s.y-s.r-120<y1)out.push(s);}return out;
}
function drawPrim(ctx,p){
  if(p.k==='p'){ctx.beginPath();const q=p.pts;ctx.moveTo(q[0][0],q[0][1]);for(let i=1;i<q.length;i++)ctx.lineTo(q[i][0],q[i][1]);ctx.closePath();if(p.f){ctx.fillStyle=p.f;ctx.fill();}if(p.s){ctx.strokeStyle=p.s;ctx.lineWidth=p.lw;ctx.stroke();}}
  else if(p.k==='c'){ctx.beginPath();ctx.arc(p.x,p.y,p.rad,0,TAU);if(p.f){ctx.fillStyle=p.f;ctx.fill();}if(p.s){ctx.strokeStyle=p.s;ctx.lineWidth=p.lw;ctx.stroke();}}
  else if(p.k==='l'){ctx.beginPath();ctx.moveTo(p.pts[0][0],p.pts[0][1]);ctx.lineTo(p.pts[1][0],p.pts[1][1]);ctx.strokeStyle=p.col;ctx.lineWidth=p.lw;ctx.setLineDash(p.dash||[]);ctx.stroke();ctx.setLineDash([]);}
  else if(p.k==='t'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.ang);ctx.fillStyle=p.col;ctx.font=`bold ${p.sz}px system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.txt,0,0);ctx.restore();}
}
function drawLayer(ctx,arr,bx0,by0,bx1,by1){for(const p of arr){const b=p.b;if(b[2]<bx0||b[0]>bx1||b[3]<by0||b[1]>by1)continue;drawPrim(ctx,p);}}

/* ---------- landmark ---------- */
function drawLandmark(ctx,lm){
  const r=mulberry32(lm.seed),x=lm.x,y=lm.y;ctx.save();ctx.translate(x,y);
  const sh=(f)=>{ctx.save();ctx.translate(5,6);ctx.fillStyle='rgba(0,0,0,.28)';f();ctx.restore();};
  const k=lm.kind;
  if(k===0){// rovine
    for(let i=0;i<9;i++){const a=r()*TAU,d=r()*16,w=rr(r,3,9),h=rr(r,1.5,3);ctx.save();ctx.translate(Math.cos(a)*d,Math.sin(a)*d);ctx.rotate(r()*3);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-w/2+2,-h/2+2.5,w,h);ctx.fillStyle=hsl(35,10,rr(r,55,72));ctx.fillRect(-w/2,-h/2,w,h);ctx.restore();}
  }else if(k===1||k===4||k===8){// obelisco / statua / torre
    sh(()=>{ctx.fillRect(-2,-2,4,22);});ctx.fillStyle='#9a9a98';ctx.fillRect(-5,-5,10,10);ctx.fillStyle='#c4c2bb';ctx.fillRect(-3,-3,6,6);ctx.fillStyle='#e8e6de';ctx.beginPath();ctx.arc(0,0,k===4?2:1.2,0,TAU);ctx.fill();
  }else if(k===2){// oasi
    ctx.fillStyle='#2f86b8';ctx.beginPath();ctx.ellipse(0,0,15,10,.3,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.ellipse(-3,-2,8,4,.3,0,TAU);ctx.fill();
    for(let i=0;i<7;i++){const a=i/7*TAU+.3,px=Math.cos(a)*17,py=Math.sin(a)*12;ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.arc(px+2,py+3,4,0,TAU);ctx.fill();ctx.fillStyle=hsl(rr(r,100,130),50,32);for(let q=0;q<6;q++){ctx.beginPath();ctx.ellipse(px+Math.cos(q)*2.2,py+Math.sin(q)*2.2,3,1,q,0,TAU);ctx.fill();}}
  }else if(k===3){// relitto
    ctx.rotate(r()*3);sh(()=>{ctx.fillRect(-14,-4,28,8);});ctx.fillStyle='#6b5a4a';ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(-9,-5);ctx.lineTo(12,-4);ctx.lineTo(15,0);ctx.lineTo(12,4);ctx.lineTo(-9,5);ctx.closePath();ctx.fill();ctx.strokeStyle='#3b3028';ctx.lineWidth=1;for(let i=-10;i<12;i+=4){ctx.beginPath();ctx.moveTo(i,-4);ctx.lineTo(i,4);ctx.stroke();}
  }else if(k===5){// faro
    sh(()=>{ctx.beginPath();ctx.arc(0,0,5,0,TAU);ctx.fill();});ctx.fillStyle='#e8e8ec';ctx.beginPath();ctx.arc(0,0,6,0,TAU);ctx.fill();ctx.fillStyle='#c4282d';ctx.beginPath();ctx.arc(0,0,4,0,TAU);ctx.fill();ctx.fillStyle='#ffe58a';ctx.beginPath();ctx.arc(0,0,1.8,0,TAU);ctx.fill();
  }else if(k===6){// cratere
    const g=ctx.createRadialGradient(0,0,2,0,0,22);g.addColorStop(0,'rgba(20,16,12,.8)');g.addColorStop(.7,'rgba(40,30,20,.5)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,22,0,TAU);ctx.fill();ctx.strokeStyle='rgba(120,100,80,.7)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,15,0,TAU);ctx.stroke();
  }else if(k===7){// arco
    for(const s of[-1,1]){sh(()=>{ctx.fillRect(s*10-5,-6,10,12);});ctx.fillStyle=hsl(20,35,45);ctx.fillRect(s*10-5,-6,10,12);ctx.fillStyle=hsl(20,35,58);ctx.fillRect(s*10-4,-5,5,6);}ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-5,-3,10,6);ctx.fillStyle=hsl(20,35,50);ctx.fillRect(-14,-3,28,5);
  }else if(k===9){// camion abbandonato
    ctx.rotate(r()*6);ctx.fillStyle='#6d4a30';ctx.fillRect(-9,-1.3,13,2.6);ctx.fillStyle='#8a5a33';ctx.fillRect(4,-1.3,5,2.6);ctx.fillStyle='#4a4038';ctx.fillRect(-10,-1.1,4,2.2);
  }else if(k===10){// villaggio
    for(let i=0;i<5;i++){const a=i/5*TAU,d=10+r()*6;ctx.save();ctx.translate(Math.cos(a)*d,Math.sin(a)*d);ctx.rotate(r()*3);const w=rr(r,5,8),h=rr(r,4,6);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-w/2+2,-h/2+3,w,h);ctx.fillStyle='#8a8378';ctx.fillRect(-w/2,-h/2,w,h);ctx.fillStyle='#5f5a52';ctx.fillRect(-w/2+1,-h/2+1,w-2,h-2);ctx.restore();}
  }else{// cascata
    ctx.rotate(r()*6);const g=ctx.createLinearGradient(-16,0,16,0);g.addColorStop(0,'#2f86b8');g.addColorStop(.5,'#cfeaf7');g.addColorStop(1,'#2f86b8');ctx.fillStyle=g;ctx.fillRect(-16,-5,32,10);
  }
  ctx.restore();
}
/* ---------- chunk ---------- */
const chunkCache=new Map();
function renderChunk(W,i,j){
  const x0=i*CHUNK,y0=j*CHUNK,x1=x0+CHUNK,y1=y0+CHUNK,S=CPX;
  const cv=document.createElement('canvas');cv.width=cv.height=CHUNK*S;const ctx=cv.getContext('2d');
  const step=4,n=CHUNK/step,tg=terrainGrid(W,x0,y0,n,step,true);
  const tc=document.createElement('canvas');tc.width=tc.height=n+1;tc.getContext('2d').putImageData(tg.img,0,0);
  ctx.imageSmoothingEnabled=true;ctx.drawImage(tc,-step*S/2,-step*S/2,(n+1)*step*S,(n+1)*step*S);
  { // acqua con bordi morbidi: campo scalare interpolato a 2 m/pixel
    const P2=2,m2=CHUNK/P2,wi=new ImageData(m2,m2),dd=wi.data,M0=tg.M;let any=false;
    for(let py=0;py<m2;py++){const gy=(py+.5)*P2/step+1,j0=Math.floor(gy),fy=gy-j0;
      for(let px=0;px<m2;px++){const gx=(px+.5)*P2/step+1,i0=Math.floor(gx),fx=gx-i0,k=j0*M0+i0;
        const f=(tg.wf[k]*(1-fx)+tg.wf[k+1]*fx)*(1-fy)+(tg.wf[k+M0]*(1-fx)+tg.wf[k+M0+1]*fx)*fy;
        const x=x0+(px+.5)*P2,y=y0+(py+.5)*P2,e=(tg.e[k]*(1-fx)+tg.e[k+1]*fx)*(1-fy)+(tg.e[k+M0]*(1-fx)+tg.e[k+M0+1]*fx)*fy,o=(py*m2+px)*4;
        if(f<.0005){any=true;const t=clamp((.3-e)/.22,0,1);dd[o]=lerp(44,14,t);dd[o+1]=lerp(118,56,t);dd[o+2]=lerp(172,112,t);dd[o+3]=Math.round(clamp(-f/.004,0,1)*255);}
        else if(f<.05&&e<.34){const nz=(vnoise(W.n^8,x/14,y/14)-.5)*.004,s2=e+nz-.322+Math.max(0,.012-f)*.0;
          if(s2<0){any=true;const sv=(vnoise(W.n^5,x/28,y/28)-.5)*20;dd[o]=222+sv;dd[o+1]=205+sv;dd[o+2]=152+sv;dd[o+3]=Math.round(clamp(-s2/.0035,0,1)*255);}}
      }}
    if(any){const wc=document.createElement('canvas');wc.width=wc.height=m2;wc.getContext('2d').putImageData(wi,0,0);ctx.drawImage(wc,0,0,CHUNK*S,CHUNK*S);}
  }
  ctx.setTransform(S,0,0,S,-x0*S,-y0*S);
  const roads=roadsInRect(W,x0-30,y0-30,x1+30,y1+30),cities=citiesInRect(W,x0,y0,x1,y1);
  const inRoadNear=(x,y,d)=>{for(const r of roads){if(x<r.x0-d||x>r.x1+d||y<r.y0-d||y>r.y1+d)continue;const p=r.pts;for(let a=0;a<p.length-1;a++){const ax=p[a][0],ay=p[a][1],vx=p[a+1][0]-ax,vy=p[a+1][1]-ay;let t=((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy);t=t<0?0:t>1?1:t;const dd=Math.hypot(x-ax-vx*t,y-ay-vy*t);if(dd<d+r.width/2)return true;}}return false;};
  const inCity=(x,y,m)=>{for(const s of cities)if(Math.hypot(x-s.x,y-s.y)<s.r+m)return true;return false;};
  /* vegetazione */
  const M=tg.M,bioAt=(x,y)=>{const a=clamp(Math.round((x-x0)/step),-1,n+1),b=clamp(Math.round((y-y0)/step),-1,n+1);return tg.bio[(b+1)*M+a+1];};
  for(let gj=Math.floor((y0-8)/10);gj<=Math.floor((y1+8)/10);gj++)for(let gi=Math.floor((x0-8)/10);gi<=Math.floor((x1+8)/10);gi++){
    const rg=mulberry32(Math.floor(ih(W.n^0x7ee,gi,gj)*4294967296));
    const x=gi*10+rg()*10,y=gj*10+rg()*10,b=bioAt(x,y),q=rg();let dens=0;
    switch(b){case B_FOREST:dens=.8;break;case B_PLAIN:dens=.07;break;case B_STEPPE:dens=.05;break;case B_DESERT:dens=.035;break;case B_SNOW:dens=.28;break;case B_ROCK:dens=.14;break;case B_SAND:dens=.01;break;}
    if(q>dens)continue;
    if(inRoadNear(x,y,5)||inCity(x,y,14))continue;
    const rad=b===B_FOREST?rr(rg,2.6,4.6):b===B_ROCK?rr(rg,1.5,3.6):rr(rg,1.4,3.2);
    ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.arc(x+rad*.5,y+rad*.7,rad,0,TAU);ctx.fill();
    if(b===B_ROCK||(b===B_DESERT&&rg()<.5)){ctx.fillStyle=hsl(rr(rg,20,40),8,rr(rg,38,58));ctx.beginPath();ctx.arc(x,y,rad*.8,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.arc(x-rad*.25,y-rad*.25,rad*.4,0,TAU);ctx.fill();}
    else if(b===B_DESERT){ctx.fillStyle='#4f7d44';ctx.fillRect(x-.5,y-2,1,4);ctx.fillRect(x-2,y-.5,4,1);}
    else if(b===B_SNOW){ctx.fillStyle='#2d5a47';ctx.beginPath();ctx.moveTo(x,y-rad*1.2);ctx.lineTo(x+rad,y+rad*.8);ctx.lineTo(x-rad,y+rad*.8);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.moveTo(x,y-rad*1.2);ctx.lineTo(x+rad*.5,y);ctx.lineTo(x-rad*.5,y);ctx.closePath();ctx.fill();}
    else{const hu=b===B_FOREST?rr(rg,95,140):b===B_STEPPE?rr(rg,60,80):rr(rg,85,125);ctx.fillStyle=hsl(hu,rr(rg,35,55),b===B_FOREST?rr(rg,20,30):rr(rg,28,40));ctx.beginPath();ctx.arc(x,y,rad,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(x-rad*.3,y-rad*.3,rad*.5,0,TAU);ctx.fill();}
  }
  /* landmark */
  for(let bj=Math.floor(j/2)-1;bj<=Math.floor(j/2)+1;bj++)for(let bi=Math.floor(i/2)-1;bi<=Math.floor(i/2)+1;bi++){const lm=W.landmarkIn(bi,bj);if(lm&&lm.x>x0-45&&lm.x<x1+45&&lm.y>y0-45&&lm.y<y1+45)drawLandmark(ctx,lm);}
  /* città: suolo */
  const Cs=cities.map(s=>W.city(s));
  for(const C of Cs)drawLayer(ctx,C.prims.ground,x0-5,y0-5,x1+5,y1+5);
  /* strade */
  ctx.lineCap='round';ctx.lineJoin='round';
  const paths=[];
  for(const r of roads){const p=r.pts;let a=0;while(a<p.length-1){ // spezzo in tratti ponte/terra
      const mid=(i)=>W.isWater((p[i][0]+p[i+1][0])/2,(p[i][1]+p[i+1][1])/2);
      if(Math.max(p[a][0],p[a+1][0])<x0-20||Math.min(p[a][0],p[a+1][0])>x1+20||Math.max(p[a][1],p[a+1][1])<y0-20||Math.min(p[a][1],p[a+1][1])>y1+20){a++;continue;}
      const br=mid(a);let b=a+1;while(b<p.length-1&&mid(b)===br)b++;paths.push({r,a,b,br});a=b;}}
  const stroke=(pa,lw,col,dash)=>{ctx.beginPath();const p=pa.r.pts;ctx.moveTo(p[pa.a][0],p[pa.a][1]);for(let k=pa.a+1;k<=pa.b;k++)ctx.lineTo(p[k][0],p[k][1]);ctx.lineWidth=lw;ctx.strokeStyle=col;ctx.setLineDash(dash||[]);ctx.stroke();ctx.setLineDash([]);};
  for(const pa of paths){if(pa.br){ctx.lineCap='butt';stroke(pa,pa.r.width+4.5,'rgba(0,0,0,.28)');stroke(pa,pa.r.width+3.2,'#b9bcc0');ctx.lineCap='round';}}
  for(const pa of paths){const k=pa.r.kind;stroke(pa,pa.r.width+(k==='sterrata'?1.4:2.2),k==='sterrata'?'rgba(80,55,30,.55)':'#26282d');}
  for(const pa of paths){const k=pa.r.kind;stroke(pa,pa.r.width,k==='sterrata'?'#a98a62':k==='autostrada'?'#40434a':'#464950');}
  for(const pa of paths){const k=pa.r.kind;
    if(k==='sterrata'){for(const o of[-1.3,1.3]){ctx.save();ctx.translate(0,0);stroke(pa,.8,'rgba(70,48,28,.45)');ctx.restore();break;}}
    else{stroke(pa,k==='autostrada'?.5:.45,'rgba(255,255,255,.75)',[6,9]);
      if(k==='autostrada'){const p=pa.r.pts;for(const sd of[-1,1]){ctx.beginPath();for(let q=pa.a;q<=pa.b;q++){const dx=p[Math.min(q+1,p.length-1)][0]-p[Math.max(q-1,0)][0],dy=p[Math.min(q+1,p.length-1)][1]-p[Math.max(q-1,0)][1],l=Math.hypot(dx,dy)||1;const ox=-dy/l*sd*(pa.r.width/2-.9),oy=dx/l*sd*(pa.r.width/2-.9);q===pa.a?ctx.moveTo(p[q][0]+ox,p[q][1]+oy):ctx.lineTo(p[q][0]+ox,p[q][1]+oy);}ctx.lineWidth=.4;ctx.strokeStyle='rgba(255,255,255,.8)';ctx.stroke();}}}
    if(pa.br){const p=pa.r.pts;for(const sd of[-1,1]){ctx.beginPath();for(let q=pa.a;q<=pa.b;q++){const dx=p[Math.min(q+1,p.length-1)][0]-p[Math.max(q-1,0)][0],dy=p[Math.min(q+1,p.length-1)][1]-p[Math.max(q-1,0)][1],l=Math.hypot(dx,dy)||1;const ox=-dy/l*sd*(pa.r.width/2+.9),oy=dx/l*sd*(pa.r.width/2+.9);q===pa.a?ctx.moveTo(p[q][0]+ox,p[q][1]+oy):ctx.lineTo(p[q][0]+ox,p[q][1]+oy);}ctx.lineWidth=.9;ctx.strokeStyle='#d8dadd';ctx.setLineDash([]);ctx.stroke();}}
  }
  /* confine della regione */
  const BORDER=(CORE+.5)*CELL;
  for(const pa of paths){const p=pa.r.pts;for(let q=pa.a;q<pa.b;q++){for(const ax of[0,1]){const v0=p[q][ax],v1=p[q+1][ax];for(const bd of[-BORDER,BORDER]){if((v0-bd)*(v1-bd)<0){const t=(bd-v0)/(v1-v0),gx=p[q][0]+(p[q+1][0]-p[q][0])*t,gy=p[q][1]+(p[q+1][1]-p[q][1])*t;
        if(gx>x0-20&&gx<x1+20&&gy>y0-20&&gy<y1+20){const dx=p[q+1][0]-p[q][0],dy=p[q+1][1]-p[q][1],ang=Math.atan2(dy,dx);ctx.save();ctx.translate(gx,gy);ctx.rotate(ang+Math.PI/2);
          ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-pa.r.width/2-3,2,pa.r.width+6,4);
          for(let k=0;k<8;k++){ctx.fillStyle=k%2?'#fff':'#d6332b';ctx.fillRect(-pa.r.width/2-3+k*(pa.r.width+6)/8,-1.5,(pa.r.width+6)/8,3);}
          ctx.fillStyle='#3a3d44';ctx.fillRect(-pa.r.width/2-4.5,-3,1.6,6);ctx.fillRect(pa.r.width/2+2.9,-3,1.6,6);ctx.restore();}}}}}}
  /* città: decorazioni, ombre, edifici */
  for(const C of Cs){drawLayer(ctx,C.prims.deco,x0-5,y0-5,x1+5,y1+5);}
  for(const C of Cs){drawLayer(ctx,C.prims.shadow,x0-60,y0-60,x1+60,y1+60);}
  for(const C of Cs){drawLayer(ctx,C.prims.bld,x0-20,y0-20,x1+20,y1+20);}
  ctx.globalAlpha=.55;for(const C of Cs)drawLayer(ctx,C.prims.top,x0-20,y0-20,x1+20,y1+20);ctx.globalAlpha=1;
  ctx.setTransform(1,0,0,1,0,0);
  return cv;
}
function getChunk(W,i,j){
  const k=i+','+j;let c=chunkCache.get(k);
  if(c){c.t=performance.now();return c.cv;}
  const cv=renderChunk(W,i,j);chunkCache.set(k,{cv,t:performance.now()});
  if(chunkCache.size>44){let ok=null,ot=1e18;for(const [kk,v] of chunkCache)if(v.t<ot){ot=v.t;ok=kk;}chunkCache.delete(ok);}
  return cv;
}
function peekChunk(i,j){const c=chunkCache.get(i+','+j);if(c)c.t=performance.now();return c?c.cv:null;}

/* ---------- sprite camion ---------- */
const SPR=12;
const sprCache=new Map();
function sprite(key,w,h,ox,oy,fn){let s=sprCache.get(key);if(s)return s;
  const cv=document.createElement('canvas');cv.width=Math.ceil(w*SPR);cv.height=Math.ceil(h*SPR);const c=cv.getContext('2d');c.translate(ox*SPR,oy*SPR);c.scale(SPR,SPR);fn(c);
  s={cv,ox:ox*SPR,oy:oy*SPR};sprCache.set(key,s);if(sprCache.size>80){sprCache.delete(sprCache.keys().next().value);}return s;}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}
function wheel(c,x,y,len){c.fillStyle='#14161a';rrect(c,x-len/2,y-.22,len,.44,.1);c.fill();c.fillStyle='#4a4e57';c.fillRect(x-len*.28,y-.1,len*.56,.2);}
function truckSprite(T){
  const m=T.model,key='T'+m.id+'|'+T.hue+'|'+T.accent+'|'+Math.round(T.dmg*5);
  return sprite(key,9.4,3.6,2.4,1.8,c=>{
    const paint=hsl(T.hue,52,46),paintL=hsl(T.hue,55,60),paintD=hsl(T.hue,50,32),acc=hsl(T.accent,70,52),conv=m.cab==='conv';
    // ruote
    wheel(c,3.95,1.18,1.1);wheel(c,3.95,-1.18,1.1);wheel(c,0,1.18,1.1);wheel(c,0,-1.18,1.1);if(m.axles==='6x4'){wheel(c,-1.35,1.18,1.1);wheel(c,-1.35,-1.18,1.1);}
    // telaio
    c.fillStyle='#26292f';c.fillRect(-1.7,-.85,7,1.7);c.fillStyle='#3b3f48';c.beginPath();c.arc(0,0,.62,0,TAU);c.fill();c.fillStyle='#16181c';c.beginPath();c.arc(0,0,.3,0,TAU);c.fill();
    // serbatoio/laterali
    c.fillStyle='#8a909a';rrect(c,.9,.9,2,.55,.15);c.fill();rrect(c,.9,-1.45,2,.55,.15);c.fill();
    // cabina
    const cx0=conv?1.55:2.2,cl=conv?2.3:2.75;
    c.fillStyle='rgba(0,0,0,.28)';rrect(c,cx0+.12,-1.22,cl,2.5,.35);c.fill();
    c.fillStyle=paint;rrect(c,cx0,-1.27,cl,2.54,.38);c.fill();
    if(conv){c.fillStyle=paint;rrect(c,cx0+cl-.1,-.98,1.85,1.96,.28);c.fill();c.fillStyle=paintL;rrect(c,cx0+cl+.1,-.78,1.4,.5,.2);c.fill();c.fillStyle='rgba(0,0,0,.18)';rrect(c,cx0+cl+.1,.1,1.45,.65,.2);c.fill();
      c.fillStyle='#202226';rrect(c,cx0+cl+1.6,-.8,.14,1.6,.05);c.fill();c.fillStyle=acc;c.fillRect(cx0+cl+1.62,-.28,.1,.56);}
    // tetto
    const rx=cx0+.25,rl=cl-.62;
    const g=c.createLinearGradient(0,-1.1,0,1.1);g.addColorStop(0,paintL);g.addColorStop(.5,paint);g.addColorStop(1,paintD);c.fillStyle=g;rrect(c,rx,-1.08,rl,2.16,.3);c.fill();
    c.fillStyle=acc;c.fillRect(rx+.1,-.42,rl-.2,.14);c.fillRect(rx+.1,.28,rl-.2,.14);
    c.fillStyle='rgba(255,255,255,.35)';rrect(c,rx+.35,-.7,.9,1.4,.15);c.fill();
    // parabrezza
    const wx=conv?cx0+cl-.62:cx0+cl-.42;
    c.fillStyle='#2b3b4e';rrect(c,wx,-1.1,.52,2.2,.12);c.fill();c.fillStyle='rgba(180,220,255,.35)';c.fillRect(wx+.06,-1.0,.14,2.0);
    // specchietti
    c.fillStyle='#16181c';c.fillRect(wx-.1,1.28,.3,.12);c.fillRect(wx-.1,-1.4,.3,.12);c.fillRect(wx+.02,1.2,.1,.2);c.fillRect(wx+.02,-1.4,.1,.2);
    // fari + griglia
    const fx=conv?cx0+cl+1.55:cx0+cl-.08;
    c.fillStyle='#fff6c4';c.fillRect(fx-.12,.72,.22,.4);c.fillRect(fx-.12,-1.12,.22,.4);
    if(!conv){c.fillStyle='#1a1c20';c.fillRect(fx-.08,-.55,.14,1.1);c.fillStyle=acc;c.fillRect(fx-.06,-.14,.1,.28);}
    // scarichi
    c.fillStyle='#b8bec8';c.beginPath();c.arc(cx0-.15,1.05,.13,0,TAU);c.fill();c.beginPath();c.arc(cx0-.15,-1.05,.13,0,TAU);c.fill();
    // danni
    if(T.dmg>.3){c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=.06;c.beginPath();c.moveTo(cx0+cl,-.6);c.lineTo(cx0+cl-.5,-.2);c.lineTo(cx0+cl-.3,.3);c.stroke();}
  });
}
const CARCOL=['#c0392b','#2980b9','#27ae60','#f1c40f','#ecf0f1','#2c3e50','#8e44ad','#e67e22','#7f8c8d','#16a085'];
function trailerSprite(tr,cargoId,hue){
  const key='R'+tr+'|'+cargoId+'|'+hue;
  return sprite(key,16.5,3.6,12.6,1.8,c=>{
    // ruote
    for(const ax of[-9.35,-10.65,-11.95+1.3])wheel(c,ax,1.18,1.1),wheel(c,ax,-1.18,1.1);
    c.fillStyle='#22252b';c.fillRect(-11.7,-.9,12.6,1.8);
    c.fillStyle='#3b3f48';c.fillRect(-.8,-1.0,1.8,2);// piastra
    c.fillStyle='#14161a';c.fillRect(-2.4,-.9,.25,.5);c.fillRect(-2.4,.4,.25,.5);
    const body=(x0,x1,col,w)=>{c.fillStyle='rgba(0,0,0,.26)';rrect(c,x0+.12,-w+.12,x1-x0,w*2,.18);c.fill();c.fillStyle=col;rrect(c,x0,-w,x1-x0,w*2,.18);c.fill();};
    const L=-11.9,F=1.7;
    if(tr==='furgone'||tr==='frigo'){
      const col=tr==='frigo'?'#eef1f4':hue===null?'#d9dce1':hsl(hue,12,86);
      body(L,F,col,1.28);
      c.strokeStyle='rgba(0,0,0,.09)';c.lineWidth=.05;for(let x=L+.7;x<F-.3;x+=.7){c.beginPath();c.moveTo(x,-1.2);c.lineTo(x,1.2);c.stroke();}
      c.fillStyle='rgba(255,255,255,.35)';c.fillRect(L+.2,-1.1,F-L-.4,.45);
      c.fillStyle='rgba(0,0,0,.12)';c.fillRect(L+.2,.7,F-L-.4,.4);
      const sc=hue===null?'#8a909a':hsl(hue,65,48);c.fillStyle=sc;c.fillRect(L+.4,-.28,F-L-.8,.56);
      if(tr==='frigo'){c.fillStyle='#4b5560';rrect(c,.7,-.85,.8,1.7,.1);c.fill();c.fillStyle='#202428';for(let k=0;k<4;k++)c.fillRect(.85,-.7+k*.38,.5,.12);c.fillStyle='#4aa3ff';c.fillRect(L+.4,-.28,F-L-.8,.18);}
      c.fillStyle='rgba(0,0,0,.25)';c.fillRect(L,-1.28,.14,2.56);
    }else if(tr==='cisterna'){
      const col=cargoId==='latte'?'#f3f1e8':cargoId==='chimici'?'#e7d14a':cargoId==='carburante'?'#b9bec7':cargoId==='cemento'?'#c8c2b8':cargoId==='vino'?'#9a3d58':cargoId==='olio'?'#b3a548':'#c5cbd3';
      c.fillStyle='rgba(0,0,0,.26)';rrect(c,L+.1,-1.1,F-L-.8,2.4,1);c.fill();
      const g=c.createLinearGradient(0,-1.2,0,1.2);g.addColorStop(0,'rgba(255,255,255,.7)');g.addColorStop(.25,col);g.addColorStop(.8,'rgba(0,0,0,.25)');g.addColorStop(1,'rgba(0,0,0,.4)');
      c.fillStyle=col;rrect(c,L,-1.2,F-L-.9,2.4,1.1);c.fill();c.fillStyle=g;rrect(c,L,-1.2,F-L-.9,2.4,1.1);c.fill();
      c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=.07;for(let x=L+1.6;x<F-1.2;x+=2.4){c.beginPath();c.moveTo(x,-1.15);c.lineTo(x,1.15);c.stroke();}
      c.fillStyle='#3a3f47';for(const x of[-9,-5.5,-2]){c.beginPath();c.arc(x,0,.38,0,TAU);c.fill();c.fillStyle='#8f97a3';c.beginPath();c.arc(x,0,.22,0,TAU);c.fill();c.fillStyle='#3a3f47';}
      const hz=CARGO_BY[cargoId]&&CARGO_BY[cargoId].hz;if(hz){c.fillStyle='#ff8a00';c.fillRect(-7.2,-1.15,.9,2.3);c.fillStyle='#111';c.beginPath();c.moveTo(-6.75,-.4);c.lineTo(-6.3,0);c.lineTo(-6.75,.4);c.lineTo(-7.2,0);c.closePath();c.fill();}
      else{c.fillStyle=hue===null?'#506':hsl(hue,60,45);c.fillRect(-6,-1.15,.5,2.3);}
    }else if(tr==='pianale'){
      c.fillStyle='rgba(0,0,0,.25)';c.fillRect(L+.15,-1.15,F-L,2.5);c.fillStyle='#5b4a3a';c.fillRect(L,-1.28,F-L,2.56);c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=.05;for(let y=-1.1;y<1.2;y+=.42){c.beginPath();c.moveTo(L,y);c.lineTo(F,y);c.stroke();}
      c.fillStyle='#3a3f47';c.fillRect(L,-1.28,.2,2.56);c.fillRect(F-.2,-1.28,.2,2.56);
      if(cargoId==='travi'){for(let k=0;k<7;k++){const y=-1.0+k*.33;c.fillStyle='rgba(0,0,0,.3)';c.fillRect(-10.8+.1,y+.1,11.4,.27);c.fillStyle=k%2?'#8b929c':'#a2a9b3';c.fillRect(-10.8,y,11.4,.28);}c.fillStyle='#d33';c.fillRect(-10.8,-1,.15,2.2);}
      else if(cargoId==='legname'){for(let k=0;k<7;k++){const y=-1.05+k*.34;c.fillStyle='rgba(0,0,0,.3)';c.fillRect(-11.5+.1,y+.1,12.8,.3);c.fillStyle=hsl(28+k*3,45,38+(k%2)*8);c.fillRect(-11.5,y,12.8,.32);c.fillStyle='#d9b68a';c.beginPath();c.arc(-11.5,y+.16,.15,0,TAU);c.fill();}c.strokeStyle='#e6c34a';c.lineWidth=.1;for(const x of[-9,-4,.5]){c.beginPath();c.moveTo(x,-1.2);c.lineTo(x,1.2);c.stroke();}}
      else if(cargoId==='bobine'){for(const x of[-9.2,-5.6,-2.0]){c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.arc(x+.15,.15,1.0,0,TAU);c.fill();c.fillStyle='#7b828d';c.beginPath();c.arc(x,0,1.0,0,TAU);c.fill();c.fillStyle='#a8b0bb';c.beginPath();c.arc(x,0,.7,0,TAU);c.fill();c.fillStyle='#3a3f47';c.beginPath();c.arc(x,0,.32,0,TAU);c.fill();}}
      else if(cargoId==='macchinari'){const cols=['#e8a317','#d9822b','#c9c9cf'];[-9.2,-5,-1.2].forEach((x,k)=>{c.fillStyle='rgba(0,0,0,.3)';rrect(c,x-1.7+.15,-1+.15,3.4,2.1,.2);c.fill();c.fillStyle=cols[k];rrect(c,x-1.7,-1,3.4,2.1,.2);c.fill();c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x-1.2,-.5,2.4,1.1);c.fillStyle='#222';c.beginPath();c.arc(x+.4,.05,.35,0,TAU);c.fill();});}
      else if(cargoId==='prefabbricati'){for(let k=0;k<3;k++){c.fillStyle='rgba(0,0,0,.3)';c.fillRect(-11.1+k*.1,-1.0+k*.1+.1,12.3,2.0);c.fillStyle=hsl(40,6,60+k*5);c.fillRect(-11.1+k*.15,-1.0+k*.12,12.3,2.0);c.strokeStyle='rgba(0,0,0,.2)';c.lineWidth=.05;c.strokeRect(-11.1+k*.15,-1.0+k*.12,12.3,2.0);}}
      else if(cargoId==='turbine'){c.fillStyle='rgba(0,0,0,.25)';c.fillRect(-14.5+.2,-.3+.3,17,.9);for(const[dy,w] of[[-.7,.55],[0,.6],[.7,.55]]){c.fillStyle='#f4f6f8';c.beginPath();c.moveTo(-14.4,dy);c.lineTo(-11,dy-w);c.lineTo(1.2,dy-w*.35);c.lineTo(1.2,dy+w*.35);c.lineTo(-11,dy+w);c.closePath();c.fill();c.strokeStyle='rgba(0,0,0,.22)';c.lineWidth=.04;c.stroke();}c.fillStyle='#d33';c.fillRect(-14.4,-.9,.5,1.8);}
    }else if(tr==='ribaltabile'){
      c.fillStyle='rgba(0,0,0,.28)';rrect(c,-11.35,-1.1,12.4,2.5,.2);c.fill();c.fillStyle='#c8872e';rrect(c,-11.5,-1.25,12.6,2.5,.2);c.fill();c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=.07;for(let x=-10.7;x<.9;x+=.9){c.beginPath();c.moveTo(x,-1.2);c.lineTo(x,1.2);c.stroke();}
      const mat={ghiaia:['#8d8d90','#a9a9ac'],sabbia:['#d7bf86','#e9d7a2'],carbone:['#202023','#3a3a40'],minerale:['#7a4a38','#9a6048'],grano:['#d4a73a','#ecc455']}[cargoId];
      if(mat){c.fillStyle=mat[0];rrect(c,-11.1,-1.0,11.6,2.0,.7);c.fill();c.fillStyle=mat[1];rrect(c,-10.2,-.6,9.4,1.2,.5);c.fill();for(let k=0;k<30;k++){c.fillStyle=k%2?mat[0]:mat[1];c.beginPath();c.arc(-10.6+((k*37)%100)/9,((k*53)%100)/50-1,.12,0,TAU);c.fill();}}
      else{c.fillStyle='rgba(0,0,0,.25)';rrect(c,-11.1,-1.0,11.6,2.0,.3);c.fill();}
      c.fillStyle='#8a5a1c';c.fillRect(-11.6,-1.25,.25,2.5);
    }else if(tr==='bisarca'){
      c.fillStyle='#6a7078';c.fillRect(L,-1.28,F-L,2.56);c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=.07;for(let x=L;x<F;x+=1.0){c.beginPath();c.moveTo(x,-1.25);c.lineTo(x,1.25);c.stroke();}
      const n=cargoId==='trattori'?3:4,len=cargoId==='trattori'?3.4:4.1;
      for(let k=0;k<n;k++){const x=1.3-k*(len+.35)-.2,col=CARCOL[(k*3+(hue||0))%CARCOL.length];c.fillStyle='rgba(0,0,0,.3)';rrect(c,x-len+.12,-.88+.12,len,1.76,.4);c.fill();c.fillStyle=col;rrect(c,x-len,-.88,len,1.76,.4);c.fill();c.fillStyle='rgba(20,30,45,.85)';rrect(c,x-len*.72,-.68,len*.34,1.36,.18);c.fill();rrect(c,x-len*.28,-.68,len*.2,1.36,.18);c.fill();c.fillStyle='rgba(255,255,255,.3)';c.fillRect(x-len*.34,-.8,len*.3,.4);}
    }else if(tr==='container'){
      const col=hsl(hue===null?210:hue,55,hue===null?42:46);
      c.fillStyle='rgba(0,0,0,.3)';rrect(c,-11.45+.15,-1.2+.15,12.4,2.5,.1);c.fill();c.fillStyle=col;rrect(c,-11.45,-1.2,12.4,2.5,.1);c.fill();
      c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=.05;for(let x=-11.3;x<.9;x+=.36){c.beginPath();c.moveTo(x,-1.15);c.lineTo(x,1.15);c.stroke();}
      c.fillStyle='rgba(255,255,255,.2)';c.fillRect(-11.4,-1.15,12.3,.45);c.fillStyle='rgba(255,255,255,.85)';c.fillRect(-7,-.3,4,.6);c.fillStyle=col;c.fillRect(-6.8,-.15,3.6,.3);c.fillStyle='rgba(0,0,0,.35)';c.fillRect(-11.45,-1.2,.2,2.5);
    }
  });
}
function carSprite(hue,kind){
  return sprite('C'+kind+hue,6,3,3,1.5,c=>{
    if(kind==='truck'){c.fillStyle='rgba(0,0,0,.28)';rrect(c,-2.9,-1.1,6,2.4,.2);c.fill();c.fillStyle='#d9dce1';rrect(c,-3,-1.2,4.4,2.4,.15);c.fill();c.fillStyle=hsl(hue,50,45);rrect(c,1.5,-1.15,1.4,2.3,.25);c.fill();c.fillStyle='#2b3b4e';c.fillRect(2.5,-1,.35,2);return;}
    const len=kind==='van'?4.9:4.2,w=1.85;c.fillStyle='rgba(0,0,0,.3)';rrect(c,-len/2+.15,-w/2+.15,len,w,.45);c.fill();
    c.fillStyle=hsl(hue,kind==='van'?10:60,kind==='van'?85:48);rrect(c,-len/2,-w/2,len,w,.45);c.fill();
    c.fillStyle='rgba(20,30,45,.88)';rrect(c,-len*.12,-w/2+.2,len*.32,w-.4,.2);c.fill();rrect(c,-len*.44,-w/2+.22,len*.2,w-.44,.2);c.fill();
    c.fillStyle=hsl(hue,50,60);rrect(c,-len*.34,-w/2+.12,len*.52,w-.24,.3);c.fill();
    c.fillStyle='rgba(20,30,45,.88)';c.fillRect(len*.18,-w/2+.2,.32,w-.4);
    c.fillStyle='#fff6c4';c.fillRect(len/2-.18,-w/2+.12,.2,.3);c.fillRect(len/2-.18,w/2-.42,.2,.3);c.fillStyle='#c22';c.fillRect(-len/2,-w/2+.12,.14,.3);c.fillRect(-len/2,w/2-.42,.14,.3);
  });
}
/* ---------- tile della mappa (cella intera a bassa risoluzione) ---------- */
const mapTiles=new Map(),MT=20; // metri per pixel
function mapTile(W,cx,cy){
  const k=cx+','+cy;let t=mapTiles.get(k);if(t)return t;
  const n=Math.round(CELL/MT),x0=cx*CELL-CELL/2,y0=cy*CELL-CELL/2,tg=terrainGrid(W,x0,y0,n-1,MT);
  const cv=document.createElement('canvas');cv.width=cv.height=n;cv.getContext('2d').putImageData(new ImageData(tg.img.data,n,n),0,0);
  mapTiles.set(k,cv);return cv;
}
