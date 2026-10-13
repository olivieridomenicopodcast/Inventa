'use strict';
/* AEGE · rendering vettoriale 2D dall'alto (con culling) */
const PAL={
  grass:'#6f9d57',grass2:['#78a65e','#69974f','#82ab62'],city:'#8d9297',walk:'#c4c7ca',asph:'#3b4048',asph2:'#444a53',line:'#e8e6d9',
  lotH:'#8fc06c',lotM:'#a4c183',lotC:'#aeb3b6',mall:'#9ea4a9',park:'#6bb05a',
  roofs:['#b5523b','#a8453a','#7e5a46','#9b6a4f','#5f6f7a','#8a4a3a','#c0714a','#6b5b55'],
  tree:['#3f7f3a','#4c8c3f','#2f6f3c'],
  carCol:['#c0392b','#2980b9','#27ae60','#f1c40f','#ecf0f1','#2c3e50','#8e44ad','#e67e22','#7f8c8d','#16a085','#d35400']
};
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=clamp(Math.round(r*k),0,255);g=clamp(Math.round(g*k),0,255);b=clamp(Math.round(b*k),0,255);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);}

/* ---- parcheggi dei centri commerciali (decorativi, deterministici) ---- */
function buildMallCars(M){
  const out=[];
  for(const bl of M.blocks){if(!bl.park)continue;const p=bl.park,r=rngFor(M.seed,'mallcars'+bl.id);
    for(let y=p.y0+6;y<p.y1-5;y+=14){for(let x=p.x0+4;x<p.x1-4;x+=4.6){if(r()<.45)out.push({x:x+2.3,y:y,w:2,h:4.3,col:pick(r,PAL.carCol),vert:true,rot:0});}}
  }
  M.mallCars=out;
}

/* ---- sprite: bidone ---- */
function drawBin(c,b,t,hi){
  const K=KINDS[b.type],sz=b.vol>=1000?{w:2.5,h:1.8}:b.vol>=360?{w:1.8,h:1.5}:{w:1.3,h:1.4};
  c.save();c.translate(b.x,b.y);c.rotate(b.ang+Math.PI/2);
  const a=b.done?.55:1;
  if(hi&&!b.done){const p=.5+.5*Math.sin(t*4+b.id);c.globalAlpha=.25+.22*p;c.fillStyle='#fff';c.beginPath();c.arc(0,0,2.9+p*.8,0,TAU);c.fill();c.globalAlpha=.9;c.strokeStyle=K.col;c.lineWidth=.22;c.beginPath();c.arc(0,0,2.5+p*.5,0,TAU);c.stroke();c.globalAlpha=1;}
  c.globalAlpha=a;
  c.fillStyle='rgba(0,0,0,.28)';rrect(c,-sz.w/2+.22,-sz.h/2+.22,sz.w,sz.h,.2);c.fill();
  if(K.two){c.fillStyle='#3d8a3d';rrect(c,-sz.w/2,-sz.h/2,sz.w,sz.h,.2);c.fill();c.fillStyle='#7a4a27';c.fillRect(0,-sz.h/2+.05,sz.w/2-.05,sz.h-.1);c.fillStyle='rgba(255,255,255,.2)';c.fillRect(-sz.w/2+.1,-sz.h/2+.1,sz.w-.2,.18);}
  else{c.fillStyle=K.col;rrect(c,-sz.w/2,-sz.h/2,sz.w,sz.h,.2);c.fill();}
  // coperchio
  c.fillStyle=b.done?'#222':K.lid;rrect(c,-sz.w/2+.1,-sz.h/2+.1,sz.w-.2,sz.h*.5,.14);c.fill();
  if(K.two&&!b.done){c.fillStyle='#7a4a27';c.fillRect(0,-sz.h/2+.1,sz.w/2-.1,sz.h*.5);}
  c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-sz.w/2+.15,-sz.h/2+.12,sz.w-.3,.12);
  if(sz.w>1.5){c.fillStyle='rgba(0,0,0,.35)';c.fillRect(-.05,-sz.h/2+.1,.1,sz.h*.5);}
  if(!b.done&&b.fill>.85){c.fillStyle=b.type==='vetro'?'#bfe8cf':b.type==='carta'?'#e7e0cf':b.type==='plastica'?'#fff3a6':b.type==='organico'?'#9b7a52':b.type==='ramaglie'?'#5fa84a':'#5b5e66';c.beginPath();c.arc(-sz.w*.18,0,.28,0,TAU);c.arc(sz.w*.2,.12,.22,0,TAU);c.fill();}
  c.globalAlpha=1;c.restore();
}

/* ---- sprite: Fratesi (visto dall'alto) ---- */
function drawFratesi(c,x,y,ang,ph,carry){
  c.save();c.translate(x,y);c.rotate(ang);c.scale(1.45,1.45);
  const sw=Math.sin(ph)*.35;
  c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(.15,.15,.55,.85,0,0,TAU);c.fill();
  // gambe
  c.fillStyle='#2d3340';c.fillRect(-.22+sw*.5,-.2,.22,.6);c.fillRect(.02-sw*.5,-.2,.22,.6);
  // braccia
  c.strokeStyle='#ff7a1a';c.lineWidth=.26;c.lineCap='round';
  if(carry){c.beginPath();c.moveTo(-.45,0);c.lineTo(.2,.62);c.moveTo(.45,0);c.lineTo(.2,.62);c.stroke();}
  else{c.beginPath();c.moveTo(-.45,0);c.lineTo(-.5,.5+sw);c.moveTo(.45,0);c.lineTo(.5,.5-sw);c.stroke();}
  // torace con gilet alta visibilità
  c.fillStyle='#ff7a1a';c.beginPath();c.ellipse(0,0,.62,.4,0,0,TAU);c.fill();
  c.fillStyle='#e9f27a';c.fillRect(-.62,-.06,1.24,.12);
  // testa con berretto
  c.fillStyle='#e8b98a';c.beginPath();c.arc(0,.05,.27,0,TAU);c.fill();
  c.fillStyle='#14305a';c.beginPath();c.arc(0,.02,.3,Math.PI*1.05,Math.PI*1.95);c.fill();
  c.restore();
}

/* ---- sprite: camion compattatore bianco a caricamento posteriore ---- */
function drawTruck(c,T,t,opt){
  const k=opt||{};
  c.save();c.translate(T.x,T.y);c.rotate(T.ang);
  const jit=k.compact?(Math.random()-.5)*.07:0;c.translate(0,jit);
  // ombra
  c.fillStyle='rgba(0,0,0,.30)';rrect(c,-4.55+.3,-1.32+.35,9.3,2.64,.5);c.fill();
  // ruote
  c.fillStyle='#14161a';
  for(const wx of[3.1,-1.3,-3.0]){c.fillRect(wx-.62,-1.42,1.24,.42);c.fillRect(wx-.62,1.0,1.24,.42);}
  // telaio
  c.fillStyle='#4a4f57';c.fillRect(-4.3,-.9,8.6,1.8);
  // cassone compattatore
  const bodyG=c.createLinearGradient(0,-1.25,0,1.25);bodyG.addColorStop(0,'#f4f6f8');bodyG.addColorStop(.5,'#ffffff');bodyG.addColorStop(1,'#d9dee3');
  c.fillStyle=bodyG;rrect(c,-4.7,-1.25,5.7,2.5,.35);c.fill();
  c.strokeStyle='rgba(120,130,140,.55)';c.lineWidth=.07;c.stroke();
  // nervature sul cassone
  c.strokeStyle='rgba(150,160,170,.55)';c.lineWidth=.06;
  for(let x=-2.8;x<.9;x+=.62){c.beginPath();c.moveTo(x,-1.2);c.lineTo(x,1.2);c.stroke();}
  // fascia blu + logo
  c.fillStyle=k.kcol||'#2f6fd0';c.fillRect(-2.9,-.28,3.5,.56);
  c.fillStyle='#fff';c.font='bold .5px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('AEGE',-1.15,.03);
  // tramoggia posteriore (vasca di carico)
  c.fillStyle='#cfd5da';rrect(c,-5.0,-1.2,1.9,2.4,.25);c.fill();
  const open=k.hopper||0;
  c.fillStyle='#2b2f34';rrect(c,-4.85,-.95,1.5,1.9,.2);c.fill();
  c.fillStyle=k.pulse?'#586068':'#3a4047';c.fillRect(-4.8,-.9,1.4,1.8);
  if(k.pulse){c.strokeStyle='#9aa4ad';c.lineWidth=.1;const q=((t*5)%1);c.beginPath();c.moveTo(-4.8+q*1.4,-.9);c.lineTo(-4.8+q*1.4,.9);c.stroke();}
  // pettine alzacontenitori
  c.strokeStyle='#d9a400';c.lineWidth=.14;c.beginPath();c.moveTo(-5.1,-.85);c.lineTo(-5.1,.85);c.stroke();
  // strisce di sicurezza
  for(let i=0;i<8;i++){c.fillStyle=i%2?'#111':'#f2c400';c.fillRect(-5.2-.1,-1.2+i*.3,.28,.3);}
  // fanalini
  c.fillStyle=k.brake?'#ff3030':'#a01818';c.fillRect(-5.2,-1.22,.16,.3);c.fillRect(-5.2,.92,.16,.3);
  if(k.rev){c.fillStyle='#fff';c.fillRect(-5.2,-.7,.16,.25);c.fillRect(-5.2,.45,.16,.25);}
  // cabina
  const cg=c.createLinearGradient(0,-1.2,0,1.2);cg.addColorStop(0,'#f8fafb');cg.addColorStop(1,'#d2d8dd');
  c.fillStyle=cg;rrect(c,1.0,-1.22,3.7,2.44,.55);c.fill();
  c.strokeStyle='rgba(120,130,140,.6)';c.lineWidth=.07;c.stroke();
  // tetto + parabrezza
  c.fillStyle='#e8ecef';rrect(c,1.2,-1.0,1.7,2.0,.3);c.fill();
  c.fillStyle='#1f3550';rrect(c,3.05,-1.0,1.0,2.0,.25);c.fill();
  c.fillStyle='rgba(180,220,255,.45)';c.beginPath();c.moveTo(3.15,-.9);c.lineTo(3.55,-.9);c.lineTo(3.25,.9);c.lineTo(3.15,.9);c.fill();
  // cofano e griglia
  c.fillStyle='#dfe4e8';c.fillRect(4.05,-1.0,.55,2.0);
  c.fillStyle='#2e3238';c.fillRect(4.6,-.7,.1,1.4);
  // specchi
  c.fillStyle='#222';c.fillRect(3.0,-1.5,.3,.35);c.fillRect(3.0,1.15,.3,.35);
  // fari
  c.fillStyle=k.lights?'#fff7c0':'#e8e2b8';c.fillRect(4.55,-1.05,.22,.4);c.fillRect(4.55,.65,.22,.4);
  if(k.lights){c.globalAlpha=.16;c.fillStyle='#fff7c0';c.beginPath();c.moveTo(4.7,-1);c.lineTo(15,-5);c.lineTo(15,5);c.lineTo(4.7,1);c.fill();c.globalAlpha=1;}
  // lampeggiante
  const bl=k.beacon?Math.sin(t*14)>0:false;c.fillStyle=bl?'#ffb000':'#7a5a10';c.beginPath();c.arc(2.0,0,.28,0,TAU);c.fill();
  if(bl){c.globalAlpha=.3;c.fillStyle='#ffb000';c.beginPath();c.arc(2.0,0,1.7,0,TAU);c.fill();c.globalAlpha=1;}
  // portellone aperto durante lo scarico
  if(k.unload>0){const u=k.unload;c.save();c.translate(-5.0,0);c.fillStyle='#e6eaee';c.strokeStyle='#8a929a';c.lineWidth=.08;c.fillRect(-u*2.6,-1.15,u*2.6,2.3);c.strokeRect(-u*2.6,-1.15,u*2.6,2.3);c.restore();}
  c.restore();
}

/* ---- centro di raccolta ---- */
function drawCenter(c,M,t){
  const C=M.center;
  c.fillStyle='#8c9298';c.fillRect(C.x0,C.y0,C.x1-C.x0,C.y1-C.y0);
  c.fillStyle='#7a8086';c.fillRect(C.yard.x0,C.yard.y0,C.yard.x1-C.yard.x0,C.yard.y1-C.yard.y0);
  // piazzale: segni di corsia
  c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=.3;c.setLineDash([3,3]);c.beginPath();c.moveTo(C.x0+4,C.gate.y);c.lineTo(C.x1-8,C.gate.y);c.stroke();c.setLineDash([]);
  // bunker
  for(const k of KIND_KEYS){const b=C.bays[k],K=KINDS[k];
    c.fillStyle='rgba(0,0,0,.28)';c.fillRect(b.x-b.w/2+.8,b.y-b.h/2+.8,b.w,b.h);
    c.fillStyle='#9ea4aa';c.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);
    c.fillStyle=K.two?'#3d8a3d':K.col;c.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,3);
    if(K.two){c.fillStyle='#7a4a27';c.fillRect(b.x,b.y-b.h/2,b.w/2,3);}
    c.fillStyle='#2d3238';c.fillRect(b.x-b.w/2+1.5,b.y-b.h/2+4,b.w-3,b.h-5.5);
    // mucchio di materiale
    c.fillStyle=K.two?'#6a8a3a':K.col;c.globalAlpha=.55;
    const lvl=(M.bunker?M.bunker[k]:0)||0;
    c.beginPath();c.ellipse(b.x,b.y+3,(b.w-5)/2*Math.min(1,.25+lvl),(b.h-9)/2*Math.min(1,.25+lvl),0,0,TAU);c.fill();c.globalAlpha=1;
    // linea di scarico
    c.strokeStyle='#f2c400';c.lineWidth=.35;c.setLineDash([1.2,1.2]);c.beginPath();c.moveTo(b.x-b.w/2+1.2,b.y+b.h/2+1.2);c.lineTo(b.x+b.w/2-1.2,b.y+b.h/2+1.2);c.stroke();c.setLineDash([]);
    // punto di sosta
    c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=.25;c.strokeRect(b.x-2.5,b.y+b.h/2+.8,5,10);
    c.fillStyle='rgba(255,255,255,.7)';c.font='bold 1.8px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(KINDS[k].ic,b.x,b.y-b.h/2-1.8);
  }
  // ufficio
  const o=C.office;c.fillStyle='rgba(0,0,0,.28)';c.fillRect(o.x0+.8,o.y0+.8,o.x1-o.x0,o.y1-o.y0);
  c.fillStyle='#d8d4c8';c.fillRect(o.x0,o.y0,o.x1-o.x0,o.y1-o.y0);c.fillStyle='#3c7a8a';c.fillRect(o.x0,o.y0,o.x1-o.x0,2.2);
  c.fillStyle='#9fc4ce';for(let x=o.x0+3;x<o.x1-3;x+=6)c.fillRect(x,o.y0+4,3.2,2.2);
  // pesa
  const s=C.scale;c.fillStyle='#5f666d';c.fillRect(s.x0,s.y0,s.x1-s.x0,s.y1-s.y0);c.strokeStyle='#f2c400';c.lineWidth=.3;c.strokeRect(s.x0+.5,s.y0+.5,s.x1-s.x0-1,s.y1-s.y0-1);
  // recinzione
  c.strokeStyle='#4a5058';c.lineWidth=1;c.strokeRect(C.x0+.5,C.y0+.5,C.x1-C.x0-1,C.y1-C.y0-1);
  c.fillStyle=M.hwy.y?'#6f9d57':'#6f9d57';
  // cancello
  c.fillStyle='#6a7078';c.fillRect(C.x0-.2,C.gate.y-C.gate.h/2-1,1.6,1);c.fillRect(C.x0-.2,C.gate.y+C.gate.h/2,1.6,1);
  c.fillStyle='#d33';c.fillRect(C.x0+.1,C.gate.y-.2,.5,.4);
}

/* ---- scena ---- */
function drawScene(c,M,S,cam,W,H,t){
  const sc=cam.sc,vw=W/sc,vh=H/sc,vx0=cam.x-vw/2,vy0=cam.y-vh/2,vx1=cam.x+vw/2,vy1=cam.y+vh/2;
  const vis=(x0,y0,x1,y1)=>x1>=vx0&&x0<=vx1&&y1>=vy0&&y0<=vy1;
  c.save();c.translate(W/2,H/2);c.scale(sc,sc);c.translate(-cam.x,-cam.y);
  // prato di base
  c.fillStyle=PAL.grass;c.fillRect(vx0-2,vy0-2,vw+4,vh+4);
  // fuori mondo
  c.fillStyle='#1c2a1c';
  if(vx0<0)c.fillRect(vx0-2,vy0-2,-vx0+2,vh+4);if(vx1>M.W)c.fillRect(M.W,vy0-2,vx1-M.W+2,vh+4);if(vy0<0)c.fillRect(vx0-2,vy0-2,vw+4,-vy0+2);if(vy1>M.H)c.fillRect(vx0-2,M.H,vw+4,vy1-M.H+2);
  // campi
  for(const f of M.fields){if(!vis(f.x,f.y,f.x+f.w,f.y+f.h))continue;c.fillStyle=['#a8b567','#8fa457','#b9a15a'][f.c];c.fillRect(f.x,f.y,f.w,f.h);c.strokeStyle='rgba(0,0,0,.12)';c.lineWidth=.4;for(let y=f.y+3;y<f.y+f.h;y+=3.2){c.beginPath();c.moveTo(f.x,y);c.lineTo(f.x+f.w,y);c.stroke();}}
  // blocchi
  for(const b of M.blocks){
    if(!vis(b.x0,b.y0,b.x1,b.y1))continue;
    c.fillStyle=PAL.walk;c.fillRect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0);
    c.fillStyle=b.kind==='park'?PAL.park:b.kind==='mall'?PAL.mall:b.zone==='periferia'?PAL.lotH:b.zone==='medio'?PAL.lotM:PAL.lotC;
    c.fillRect(b.lx0,b.ly0,b.lx1-b.lx0,b.ly1-b.ly0);
    if(b.kind==='park'){c.fillStyle='#d8c9a0';c.fillRect((b.lx0+b.lx1)/2-1.2,b.ly0,2.4,b.ly1-b.ly0);c.fillRect(b.lx0,(b.ly0+b.ly1)/2-1.2,b.lx1-b.lx0,2.4);c.fillStyle='#5aa0d8';c.beginPath();c.arc((b.lx0+b.lx1)/2,(b.ly0+b.ly1)/2,4,0,TAU);c.fill();}
    if(b.kind==='mall'&&b.park){const p=b.park;c.fillStyle='#8b9197';c.fillRect(p.x0,p.y0,p.x1-p.x0,p.y1-p.y0);c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=.18;for(let y=p.y0+6;y<p.y1-5;y+=14){for(let x=p.x0+4;x<=p.x1-4;x+=4.6){c.beginPath();c.moveTo(x,y-4.4);c.lineTo(x,y+4.4);c.stroke();}}}
  }
  // strade
  const road=(rd)=>{
    if(rd.v){if(!vis(rd.c-rd.w/2,rd.a,rd.c+rd.w/2,rd.b))return;c.fillStyle=PAL.asph;c.fillRect(rd.c-rd.w/2,rd.a,rd.w,rd.b-rd.a);}
    else{if(!vis(rd.a,rd.c-rd.w/2,rd.b,rd.c+rd.w/2))return;c.fillStyle=PAL.asph;c.fillRect(rd.a,rd.c-rd.w/2,rd.b-rd.a,rd.w);}
  };
  M.roads.forEach(road);
  for(const rd of M.roads){ // segnaletica centrale
    c.strokeStyle=rd.main?'#f0d44a':'rgba(240,240,230,.7)';c.lineWidth=rd.main?.22:.16;c.setLineDash([2.4,2.4]);c.beginPath();
    if(rd.v){if(rd.c+1<vx0||rd.c-1>vx1)continue;c.moveTo(rd.c,Math.max(rd.a,vy0));c.lineTo(rd.c,Math.min(rd.b,vy1));}
    else{if(rd.c+1<vy0||rd.c-1>vy1)continue;c.moveTo(Math.max(rd.a,vx0),rd.c);c.lineTo(Math.min(rd.b,vx1),rd.c);}
    c.stroke();
  }
  c.setLineDash([]);
  // incroci: copri le linee e disegna strisce pedonali sugli incroci principali
  for(let i=0;i<M.xs.length;i++){const x=M.xs[i];if(x+10<vx0||x-10>vx1)continue;for(let j=0;j<M.ys.length;j++){const y=M.ys[j];if(y+10<vy0||y-10>vy1)continue;c.fillStyle=PAL.asph;c.fillRect(x-M.wv[i]/2,y-M.wh[j]/2,M.wv[i],M.wh[j]);
    if(M.wv[i]>=14||M.wh[j]>=14){c.fillStyle='rgba(255,255,255,.55)';const hw=M.wv[i]/2,hh=M.wh[j]/2;for(let k=-hw+1;k<hw-.5;k+=1.4){c.fillRect(x+k,y-hh-2.4,.7,1.8);c.fillRect(x+k,y+hh+.6,.7,1.8);}for(let k=-hh+1;k<hh-.5;k+=1.4){c.fillRect(x-hw-2.4,y+k,1.8,.7);c.fillRect(x+hw+.6,y+k,1.8,.7);}}}}
  // autostrada
  const hw=M.hwy;if(vis(hw.b,hw.y-hw.w/2,hw.a+4,hw.y+hw.w/2)){c.fillStyle=PAL.asph2;c.fillRect(hw.a,hw.y-hw.w/2,hw.b-hw.a,hw.w);c.strokeStyle='#e9e9e0';c.lineWidth=.25;c.beginPath();c.moveTo(hw.a,hw.y-hw.w/2+.5);c.lineTo(hw.b,hw.y-hw.w/2+.5);c.moveTo(hw.a,hw.y+hw.w/2-.5);c.lineTo(hw.b,hw.y+hw.w/2-.5);c.stroke();c.setLineDash([5,5]);c.beginPath();c.moveTo(hw.a,hw.y);c.lineTo(hw.b,hw.y);c.stroke();c.setLineDash([]);}
  // centro di raccolta
  const C=M.center;if(vis(C.x0-4,C.y0-4,C.x1+4,C.y1+4))drawCenter(c,M,t);
  // ombre e parcheggio
  for(const car of M.mallCars){if(!vis(car.x-3,car.y-3,car.x+3,car.y+3))continue;drawCar(c,car);}
  // alberi (sotto)
  for(const tr of M.trees){if(!vis(tr.x-tr.r,tr.y-tr.r,tr.x+tr.r,tr.y+tr.r))continue;c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.arc(tr.x+.5,tr.y+.6,tr.r,0,TAU);c.fill();c.fillStyle=PAL.tree[tr.c];c.beginPath();c.arc(tr.x,tr.y,tr.r,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.1)';c.beginPath();c.arc(tr.x-tr.r*.25,tr.y-tr.r*.25,tr.r*.55,0,TAU);c.fill();}
  // auto parcheggiate
  for(const car of M.cars){if(!vis(car.x-3,car.y-3,car.x+3,car.y+3))continue;drawCar(c,car);}
  // bidoni
  for(const b of M.bins){if(b.hide)continue;if(b.x<vx0-3||b.x>vx1+3||b.y<vy0-3||b.y>vy1+3)continue;drawBin(c,b,t,b.type===M.kind&&S.hint);}
  // camion + Fratesi
  S.drawActors(c,t);
  // edifici (sopra, tetti)
  const lab=[];
  for(const b of M.buildings){
    if(!vis(b.x0-1,b.y0-1,b.x1+2,b.y1+2))continue;
    drawBuilding(c,b,t);
    if(b.name&&sc>=5)lab.push(b);
  }
  // particelle
  S.drawFX(c,t);
  // nomi sugli edifici
  if(lab.length){c.textAlign='center';c.textBaseline='middle';
    for(const b of lab){const w=b.x1-b.x0,h=b.y1-b.y0;const fs=b.type==='mall'?3.2:b.type==='shop'?1.55:2.0;c.font='600 '+fs+'px "Space Grotesk",sans-serif';
      c.fillStyle='rgba(255,255,255,.92)';c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=.35;
      const cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2;
      if(h>w*1.3&&b.type!=='mall'){c.save();c.translate(cx,cy);c.rotate(-Math.PI/2);c.strokeText(b.name,0,0);c.fillText(b.name,0,0);c.restore();}
      else{c.strokeText(b.name,cx,cy);c.fillText(b.name,cx,cy);}
    }}
  // nomi delle strade
  if(sc>=5){c.font='600 2px "Space Grotesk",sans-serif';c.textAlign='center';c.textBaseline='middle';
    for(const rd of M.roads){c.fillStyle=rd.main?'rgba(255,240,170,.9)':'rgba(255,255,255,.65)';
      if(rd.v){if(rd.c<vx0-4||rd.c>vx1+4)continue;for(let y=rd.a+60;y<rd.b-40;y+=180){if(y<vy0-8||y>vy1+8)continue;c.save();c.translate(rd.c,y);c.rotate(-Math.PI/2);c.fillText(rd.name,0,0);c.restore();}}
      else{if(rd.c<vy0-4||rd.c>vy1+4)continue;for(let x=rd.a+90;x<rd.b-40;x+=180){if(x<vx0-8||x>vx1+8)continue;c.fillText(rd.name,x,rd.c);}}}
    if(vis(hw.b,hw.y-8,hw.a,hw.y+8)){c.fillStyle='rgba(255,255,255,.8)';for(let x=hw.b+40;x<hw.a;x+=140){if(x<vx0||x>vx1)continue;c.fillText(hw.name,x,hw.y+2.2);}}
    if(vis(C.x0,C.y0-8,C.x1,C.y0)){c.font='700 3.4px "Unbounded",sans-serif';c.fillStyle='#fff';c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=.5;c.strokeText('Centro '+C.name,(C.x0+C.x1)/2,C.y0-3.2);c.fillText('Centro '+C.name,(C.x0+C.x1)/2,C.y0-3.2);}
    if(vis(C.office.x0,C.office.y0,C.office.x1,C.office.y1)){c.font='600 1.6px "Space Grotesk",sans-serif';c.fillStyle='#14312c';c.fillText('Uffici '+C.office.name,(C.office.x0+C.office.x1)/2,C.office.y0+1.1);}
  }
  c.restore();
}
function drawCar(c,car){
  c.save();c.translate(car.x,car.y);
  const w=car.w,h=car.h;
  c.fillStyle='rgba(0,0,0,.28)';rrect(c,-w/2+.25,-h/2+.25,w,h,.5);c.fill();
  c.fillStyle=car.col;rrect(c,-w/2,-h/2,w,h,.5);c.fill();
  c.fillStyle='rgba(20,30,45,.75)';
  if(w<h){rrect(c,-w/2+.25,-h*.22,w-.5,h*.36,.25);c.fill();c.fillStyle='rgba(255,255,255,.2)';c.fillRect(-w/2+.3,-h/2+.25,w-.6,.4);}
  else{rrect(c,-w*.22,-h/2+.25,w*.36,h-.5,.25);c.fill();c.fillStyle='rgba(255,255,255,.2)';c.fillRect(-w/2+.25,-h/2+.3,.4,h-.6);}
  c.restore();
}
function drawBuilding(c,b,t){
  const w=b.x1-b.x0,h=b.y1-b.y0;
  c.fillStyle='rgba(0,0,0,.22)';c.fillRect(b.x0+1.0,b.y0+1.0,w,h);
  if(b.type==='house'){
    const col=PAL.roofs[b.roof%PAL.roofs.length];
    c.fillStyle=col;c.fillRect(b.x0,b.y0,w,h);
    c.fillStyle='rgba(0,0,0,.2)';
    if(w>=h){c.fillRect(b.x0,b.y0+h/2,w,h/2);c.fillStyle='rgba(255,255,255,.25)';c.fillRect(b.x0,b.y0+h/2-.12,w,.24);}
    else{c.fillRect(b.x0+w/2,b.y0,w/2,h);c.fillStyle='rgba(255,255,255,.25)';c.fillRect(b.x0+w/2-.12,b.y0,.24,h);}
    c.fillStyle=shade(col,.7);c.fillRect(b.x0+w*.62,b.y0+h*.12,1.0,1.4);
  }else if(b.type==='cond'){
    c.fillStyle='#d8d6cf';c.fillRect(b.x0,b.y0,w,h);
    c.fillStyle='#bdbab2';c.fillRect(b.x0+.7,b.y0+.7,w-1.4,h-1.4);
    c.fillStyle='#e6e4de';c.fillRect(b.x0+1.4,b.y0+1.4,w-2.8,h-2.8);
    c.fillStyle='#9d9a93';for(let i=0;i<Math.min(4,w/9|0);i++)c.fillRect(b.x0+2.2+i*6,b.y0+h-3.8,3,2);
    c.fillStyle='#8f9ea8';c.fillRect(b.x0+w*.6,b.y0+2,3.2,2.4);
    c.strokeStyle='rgba(0,0,0,.16)';c.lineWidth=.12;c.strokeRect(b.x0+1.4,b.y0+1.4,w-2.8,h-2.8);
  }else if(b.type==='shop'){
    const awn=['#d94a3d','#3d8fd9','#e0a82e','#4ca868','#9a58c9'][b.roof%5];
    c.fillStyle='#e7e3d6';c.fillRect(b.x0,b.y0,w,h);
    c.fillStyle=awn;
    const s=b.side;if(s==='n')c.fillRect(b.x0,b.y0-1.1,w,1.1);else if(s==='s')c.fillRect(b.x0,b.y1,w,1.1);else if(s==='w')c.fillRect(b.x0-1.1,b.y0,1.1,h);else if(s==='e')c.fillRect(b.x1,b.y0,1.1,h);
    c.fillStyle='rgba(0,0,0,.12)';c.fillRect(b.x0+.5,b.y0+.5,w-1,h-1);
  }else if(b.type==='mall'){
    c.fillStyle='#d4d6da';c.fillRect(b.x0,b.y0,w,h);
    c.fillStyle='#b3b7bd';c.fillRect(b.x0+1,b.y0+1,w-2,h-2);
    c.fillStyle='#c6cacf';for(let x=b.x0+4;x<b.x1-6;x+=11)c.fillRect(x,b.y0+3,7,h-6);
    c.fillStyle='#8ec4e8';c.globalAlpha=.55;for(let x=b.x0+6;x<b.x1-8;x+=11)c.fillRect(x,b.y0+h/2-3,3,6);c.globalAlpha=1;
    c.fillStyle='#d94a3d';c.fillRect(b.x0,b.y1-1.6,w,1.6);
  }
}
