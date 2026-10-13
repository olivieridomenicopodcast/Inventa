'use strict';
/* ECO · grafica procedurale: tile, oggetti, personaggi */
const TS=16;
const hx=(x,y,s)=>{let h=(x*374761393+y*668265263+s*2147483647)>>>0;h=(h^(h>>>13))*1274126177>>>0;return((h^(h>>>16))>>>0)/4294967295;};
function mkc(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return[c,g];}
const ROOFC=[['#b5523b','#8f3e2c','#d06a4f'],['#4a6ea8','#385485','#6a8cc8'],['#5a8f5a','#436c43','#79b079'],['#8a6a4a','#684e34','#a98863'],['#6e7480','#535862','#8d94a1'],['#8a5aa0','#6a4280','#a97cc0']];
const WALLC=['#e4d8bf','#d6c8aa'];
function px(g,c,x,y,w,h){g.fillStyle=c;g.fillRect(x,y,w||1,h||1);}
function speck(g,s,base,cols,n,seed){px(g,base,0,0,TS,TS);for(let i=0;i<n;i++){const x=Math.floor(hx(i,seed,s)*TS),y=Math.floor(hx(i,seed+9,s)*TS);px(g,cols[i%cols.length],x,y);}}
const ATLAS={};
function tileCanvas(id,v){
  const key=id+'_'+v;if(ATLAS[key])return ATLAS[key];
  const[c,g]=mkc(TS,TS);ATLAS[key]=c;
  switch(id){
    case TL.GRASS:speck(g,v,'#5d9c4b',['#6caa57','#4f8a40','#78b862'],14,1);break;
    case TL.FLOWER:speck(g,v,'#5d9c4b',['#6caa57','#4f8a40'],8,2);for(let i=0;i<3;i++){px(g,['#f2d34e','#f08aa8','#fff'][(i+v)%3],2+Math.floor(hx(i,v,7)*11),2+Math.floor(hx(i,v,8)*11),2,2);}break;
    case TL.PATH:speck(g,v,'#cfae72',['#bf9d62','#dcbd86','#a98a55'],16,3);break;
    case TL.GRAVEL:speck(g,v,'#9a9488',['#85806f','#aea8a0','#6f6a5c'],26,3);break;
    case TL.SAND:speck(g,v,'#ecd9a0',['#e0c987','#f4e7bb'],12,4);break;
    case TL.WATER:{px(g,'#3f7fc0',0,0,TS,TS);for(let i=0;i<4;i++){const y=2+i*4,o=(v*3+i*5)%8;px(g,'#6aa4de',o,y,6,1);px(g,'#2f6aa6',o+8,y+2,5,1);}break;}
    case TL.TREE:{speck(g,v,'#5d9c4b',['#4f8a40'],6,5);px(g,'#6b4a2e',7,10,3,6);px(g,'#4b341f',9,10,1,6);const rc=['#2f7a3a','#2a6e34','#347f40'][v%3];g.fillStyle=rc;g.beginPath();g.arc(8,7,6.2,0,TAU);g.fill();g.fillStyle='#3f9a4c';g.beginPath();g.arc(6,5,3.2,0,TAU);g.fill();g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.arc(10,9,3.5,0,TAU);g.fill();break;}
    case TL.ROCK:{speck(g,v,'#5d9c4b',['#4f8a40'],6,6);g.fillStyle='#8a8f98';g.beginPath();g.moveTo(2,13);g.lineTo(4,5);g.lineTo(10,3);g.lineTo(14,8);g.lineTo(13,13);g.closePath();g.fill();g.fillStyle='#a9aeb7';g.fillRect(5,5,4,2);g.fillStyle='#6a6f77';g.fillRect(9,10,4,3);break;}
    case TL.BUSH:{speck(g,v,'#5d9c4b',['#4f8a40'],6,7);g.fillStyle='#3d8a44';g.beginPath();g.arc(8,9,6,0,TAU);g.fill();g.fillStyle='#55a65a';g.beginPath();g.arc(6,7,3,0,TAU);g.fill();px(g,'#e04a4a',10,8,2,2);px(g,'#e04a4a',5,11,2,2);break;}
    case TL.FENCE:{speck(g,v,'#5d9c4b',['#4f8a40'],6,8);px(g,'#8b6a43',0,6,16,2);px(g,'#8b6a43',0,10,16,2);px(g,'#6d5232',2,4,2,10);px(g,'#6d5232',12,4,2,10);break;}
    case TL.WALL:case TL.WALLW:{px(g,WALLC[v%2],0,0,TS,TS);px(g,'rgba(0,0,0,.12)',0,TS-3,TS,3);for(let i=0;i<4;i++)px(g,'rgba(0,0,0,.06)',0,i*4,TS,1);
      if(id===TL.WALLW){px(g,'#5a4636',3,3,10,9);px(g,'#9ed0ee',4,4,8,7);px(g,'#fff',5,5,2,2);px(g,'#5a4636',8,4,1,7);px(g,'#5a4636',4,7,8,1);}break;}
    case TL.DOOR:{px(g,WALLC[0],0,0,TS,TS);px(g,'rgba(0,0,0,.12)',0,TS-3,TS,3);px(g,'#6b4a2e',3,1,10,15);px(g,'#8a6340',4,2,8,13);px(g,'#6b4a2e',7,2,1,13);px(g,'#f2d34e',10,9,2,2);px(g,'#3a2a1a',2,15,12,1);break;}
    case TL.FLOOR:{px(g,'#b98f5f',0,0,TS,TS);for(let i=0;i<4;i++)px(g,'#a47c4e',0,i*4+3,TS,1);for(let i=0;i<5;i++)px(g,'#c9a06c',Math.floor(hx(i,v,3)*14),Math.floor(hx(i,v,4)*14),2,1);px(g,'#a47c4e',(v*5)%14+1,0,1,4);px(g,'#a47c4e',(v*7)%14+1,8,1,4);break;}
    case TL.STONE:{px(g,'#a6a6ad',0,0,TS,TS);px(g,'#8e8e96',0,0,TS,1);px(g,'#8e8e96',0,0,1,TS);px(g,'#8e8e96',8,0,1,8);px(g,'#8e8e96',0,8,TS,1);px(g,'#8e8e96',4,8,1,8);for(let i=0;i<4;i++)px(g,'#b8b8bf',Math.floor(hx(i,v,5)*14),Math.floor(hx(i,v,6)*14),2,1);break;}
    case TL.TILE:{px(g,'#c9d2d8',0,0,TS,TS);px(g,'#aab4bb',0,0,TS,1);px(g,'#aab4bb',0,0,1,TS);break;}
    case TL.DARK:{px(g,'#5b4c43',0,0,TS,TS);for(let i=0;i<10;i++)px(g,['#3f342d','#6d5d52','#2c2420'][i%3],Math.floor(hx(i,v,3)*15),Math.floor(hx(i,v,4)*15),2,1);px(g,'#3f342d',0,(v*5)%12+2,TS,1);break;}
    case TL.RUG:{px(g,'#8f3a4a',0,0,TS,TS);px(g,'#c9a14a',0,0,TS,1);px(g,'#c9a14a',0,TS-1,TS,1);px(g,'#c9a14a',0,0,1,TS);px(g,'#c9a14a',TS-1,0,1,TS);px(g,'#b04a5c',4,4,8,8);px(g,'#c9a14a',7,7,2,2);break;}
    case TL.WALLI:{px(g,'#6a5a58',0,0,TS,TS);px(g,'#7a6866',0,0,TS,5);for(let i=0;i<3;i++){px(g,'#574a48',0,i*5+4,TS,1);}px(g,'#574a48',(v%2)*8+3,0,1,4);px(g,'#3d3332',0,TS-3,TS,3);break;}
    case TL.MAT:{px(g,'#b98f5f',0,0,TS,TS);px(g,'#7a3a3a',2,3,12,10);px(g,'#9a4a4a',3,4,10,8);break;}
    default:{if(id>=10&&id<=15){const[a,b2,c2]=ROOFC[id-10];px(g,a,0,0,TS,TS);for(let y=0;y<TS;y+=4){px(g,b2,0,y+3,TS,1);for(let x=((y/4)%2)*4;x<TS;x+=8)px(g,c2,x,y,1,3);}px(g,'rgba(255,255,255,.12)',0,0,TS,1);}else px(g,'#f0f',0,0,TS,TS);}
  }
  return c;
}
/* ---------- oggetti ---------- */
const OBJC={};
function objSprite(kind,e,gear){
  const key=kind+'|'+(e&&e.sprite||'')+'|'+(e&&e.seed||0)+'|'+(kind==='mic'?gear.mic:kind==='rack'?gear.iface:kind==='desk'||kind==='pcmon'?gear.pc:0)+'|'+(e&&e.done?1:0);
  if(OBJC[key])return OBJC[key];
  const[c,g]=mkc(TS,TS);OBJC[key]=c;
  switch(kind){
    case'shelf':{px(g,'#7a5836',0,0,TS,TS);px(g,'#5c4128',0,7,TS,1);px(g,'#5c4128',0,TS-1,TS,1);const r=mulberry32((e&&e.seed||1)*977);for(let row=0;row<2;row++){let x=1;while(x<14){const w=1+Math.floor(r()*3),h=4+Math.floor(r()*2);px(g,['#a33c3c','#3c6aa3','#4a8f4a','#c9a14a','#7a4a8a','#d9d2c0'][Math.floor(r()*6)],x,row*8+(7-h)-(row?0:0)+ (row?0:0),w,h);x+=w+(r()<.3?1:0);}}break;}
    case'table':{px(g,'#8a6340',1,4,14,9);px(g,'#a47c4e',1,4,14,3);px(g,'#6b4a2e',2,13,2,3);px(g,'#6b4a2e',12,13,2,3);break;}
    case'chair':{px(g,'#8a6340',4,5,8,6);px(g,'#6b4a2e',4,11,2,4);px(g,'#6b4a2e',10,11,2,4);px(g,'#a47c4e',4,4,8,2);break;}
    case'counter':{px(g,'#7a5836',0,3,TS,13);px(g,'#b98f5f',0,3,TS,4);px(g,'#5c4128',0,12,TS,4);break;}
    case'bed':{px(g,'#6b4a2e',0,2,TS,13);px(g,'#e8e8f0',1,3,14,11);px(g,'#6a8fc9',1,8,14,6);px(g,'#fff',2,4,5,3);break;}
    case'desk':{px(g,'#6b4a2e',0,5,TS,11);px(g,'#8a6340',0,5,TS,4);if(gear.pc>=2){px(g,'#222',3,0,10,7);px(g,'#4ac9f2',4,1,8,5);}else{px(g,'#bbb',3,1,9,6);px(g,'#7fc',4,2,7,4);}px(g,'#333',6,9,5,2);break;}
    case'pcmon':{break;}
    case'mic':{px(g,'#2b2f3a',7,6,2,10);px(g,'#2b2f3a',4,15,8,1);const t=gear.mic;px(g,t>=3?'#d4af37':t>=2?'#8a8f98':'#3a3f4a',5,1,6,6);px(g,'rgba(255,255,255,.3)',6,2,2,2);px(g,'#111',6,3,4,1);break;}
    case'rack':{px(g,'#2a2d36',1,1,14,15);for(let i=0;i<4;i++){px(g,'#3a3f4a',2,2+i*3,12,2);px(g,i<=gear.iface+0?'#5aff8a':'#444',3,3+i*3,1,1);px(g,'#ff9a3a',5,3+i*3,1,1);}break;}
    case'board':{px(g,'#6b4a2e',0,1,TS,14);px(g,'#c9a56a',1,2,14,12);px(g,'#fff',3,3,4,5);px(g,'#f6e58a',8,4,4,4);px(g,'#9ad',4,9,5,4);px(g,'#d44',3,3,1,1);break;}
    case'terminal':{px(g,'#3a3f4a',1,4,14,11);px(g,'#9be8ff',2,5,12,6);px(g,'#fff',3,6,5,1);px(g,'#fff',3,8,8,1);px(g,'#222',4,12,8,2);break;}
    case'plant':{px(g,'#a0522d',5,10,6,6);g.fillStyle='#3d8a44';g.beginPath();g.arc(8,7,5,0,TAU);g.fill();g.fillStyle='#55a65a';g.beginPath();g.arc(6,5,2.5,0,TAU);g.fill();break;}
    case'crate':{px(g,'#9a7a4a',1,3,14,13);px(g,'#7a5a32',1,3,14,2);px(g,'#7a5a32',1,9,14,1);px(g,'#7a5a32',7,3,2,13);break;}
    case'pillar':{px(g,'#8e8e96',4,0,8,16);px(g,'#a6a6ad',4,0,3,16);break;}
    case'radio':{px(g,'#6b4a2e',2,5,12,9);px(g,'#d9c07a',4,7,5,5);px(g,'#222',10,7,3,5);px(g,'#fff',3,3,1,3);break;}
    case'stove':{px(g,'#555',1,3,14,13);px(g,'#222',3,5,4,3);px(g,'#222',9,5,4,3);px(g,'#ff6a2a',4,10,3,3);break;}
    case'window':{px(g,'#5a4636',2,2,12,12);px(g,'#9ed0ee',3,3,10,10);px(g,'#fff',4,4,3,3);px(g,'#5a4636',7,3,2,10);break;}
    case'altar':{px(g,'#e8e0c8',0,4,TS,12);px(g,'#c9a14a',0,4,TS,2);px(g,'#a33c3c',5,0,6,4);break;}
    case'pew':{px(g,'#7a5836',0,6,TS,8);px(g,'#5c4128',0,6,TS,2);break;}
    case'candle':{px(g,'#e8e0c8',7,8,2,8);px(g,'#ffb84a',7,5,2,3);break;}
    case'clue':{const s=e&&e.sprite||'box';if(e&&e.done){px(g,'rgba(0,0,0,.2)',3,12,10,3);break;}
      px(g,'rgba(0,0,0,.2)',3,13,10,3);
      if(s==='box'){px(g,'#9a7a4a',3,7,10,7);px(g,'#7a5a32',3,7,10,2);px(g,'#f2d34e',7,10,2,2);}
      else if(s==='paper'){px(g,'#efe6c8',3,8,10,6);px(g,'#d8cfae',4,10,8,1);px(g,'#d8cfae',4,12,6,1);}
      else if(s==='tool'){px(g,'#6a6f77',4,12,8,2);px(g,'#8b5a2b',7,5,2,8);px(g,'#6a6f77',5,4,6,3);}
      else if(s==='photo'){px(g,'#fff',4,6,8,8);px(g,'#7aa7c9',5,7,6,5);px(g,'#4a8a4a',5,10,6,2);}
      else{px(g,'#c9a14a',4,4,8,8);px(g,'#fff',5,5,6,6);px(g,'#222',8,6,1,3);px(g,'#222',8,8,3,1);}
      g.fillStyle='rgba(255,236,120,.55)';const sp=(Date.now()/300)%2;px(g,'rgba(255,240,150,.8)',2+(sp|0)*10,3,1,1);break;}
    case'amb':{px(g,'rgba(255,255,255,.0)',0,0,1,1);break;}
    default:px(g,'#f0f',0,0,TS,TS);
  }
  return c;
}
/* ---------- personaggi ---------- */
const SKIN=['#f3cfa8','#e8b88c','#c98f63','#9c6a43','#6e4529'];
const HAIR=['#2a1f1a','#5a3a22','#9a6a2e','#d9b25a','#8a8a92','#c9c9d0','#7a2a2a','#232a4a'];
const CLOTH=['#c0504a','#3a6aa8','#4f8f4f','#c9a14a','#7a4a8a','#d9d2c0','#3a3f4a','#c9783a','#4a8f8f','#8a5a3a'];
const CHC={};
function charParams(n){
  const s=n.style||0,r=mulberry32(s);
  return{skin:SKIN[Math.floor(r()*5)],hair:HAIR[Math.floor(r()*HAIR.length)],cloth:CLOTH[Math.floor(r()*CLOTH.length)],pants:['#3a3f4a','#4a3a2a','#2f4a6a','#5a5a62'][Math.floor(r()*4)],hs:Math.floor(r()*4),acc:Math.floor(r()*5),sex:n.sex||'m',old:(n.age||30)>62};
}
function charFrame(n,dir,frame,player){
  const key=(player?'P':n.id||n.style)+'|'+dir+'|'+frame+(player?player.look:'');
  if(CHC[key])return CHC[key];
  const[c,g]=mkc(TS,20);CHC[key]=c;
  const P=player?{skin:'#e8b88c',hair:'#3a2a1a',cloth:'#c0463a',pants:'#2f3a52',hs:1,acc:0,sex:'m',old:false}:charParams(n);
  const bob=frame===0?0:1,legA=frame===1?1:0,legB=frame===2?1:0;
  // ombra
  px(g,'rgba(0,0,0,.22)',4,17,8,2);
  // gambe
  px(g,P.pants,5,13+legA*0,2,4-legA);px(g,P.pants,9,13,2,4-legB);px(g,'#222',5,16-legA,2,1);px(g,'#222',9,16-legB,2,1);
  // corpo
  px(g,P.cloth,4,7+bob,8,7);px(g,'rgba(0,0,0,.18)',4,12+bob,8,2);
  if(dir==='left'||dir==='right'){px(g,P.skin,dir==='left'?3:12,8+bob,1,4);}else{px(g,P.skin,3,8+bob,1,4);px(g,P.skin,12,8+bob,1,4);}
  px(g,P.cloth,3,8+bob,1,3);px(g,P.cloth,12,8+bob,1,3);
  // testa
  px(g,P.skin,4,1+bob,8,7);
  // capelli
  const hs=P.hs;
  if(dir==='up'){px(g,P.hair,4,1+bob,8,7);}
  else{
    px(g,P.hair,4,0+bob,8,3);if(hs===0||P.sex==='f'){px(g,P.hair,3,1+bob,1,5);px(g,P.hair,12,1+bob,1,5);}
    if(hs===2){px(g,P.hair,3,0+bob,10,2);}
    if(P.sex==='f'&&hs>0){px(g,P.hair,3,4+bob,2,5);px(g,P.hair,11,4+bob,2,5);}
    if(P.old)px(g,'#cfcfd6',4,0+bob,8,2);
  }
  // viso
  if(dir==='down'){px(g,'#222',5,4+bob,1,2);px(g,'#222',10,4+bob,1,2);px(g,'rgba(200,90,90,.5)',7,6+bob,2,1);}
  else if(dir==='left'){px(g,'#222',5,4+bob,1,2);px(g,P.skin,3,5+bob,1,1);}
  else if(dir==='right'){px(g,'#222',10,4+bob,1,2);px(g,P.skin,12,5+bob,1,1);}
  // accessori
  if(!player){
    if(P.acc===1&&dir!=='up'){px(g,'#222',4,4+bob,8,1);}
    if(P.acc===2){px(g,'#8a6a4a',3,0+bob,10,2);px(g,'#8a6a4a',2,2+bob,12,1);}
    if(P.acc===3&&dir!=='up'){px(g,P.hair,5,7+bob,6,2);}
    if(P.acc===4){px(g,'#d44',4,8+bob,8,1);}
  }else{ // cuffie del podcaster
    px(g,'#2a2a2a',3,2+bob,10,1);px(g,'#2a2a2a',2,3+bob,2,4);px(g,'#2a2a2a',12,3+bob,2,4);px(g,'#ff5a4d',2,4+bob,2,2);px(g,'#ff5a4d',12,4+bob,2,2);
  }
  return c;
}
