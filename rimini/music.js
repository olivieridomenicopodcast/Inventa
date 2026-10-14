'use strict';
/* RIMINI 3 GIORNI · musica chiptune generativa, diversa per zona (atrio, primo piano, Village, serata, sala) e jingle.
   Il pulsante audio ruota tra: musica + effetti, solo effetti, muto. Volumi bassi per non coprire i dialoghi. */
const MU={mus:true,timer:null,gain:null,step:0,next:0,zone:'',notes:0,
  Z:{
    atrio:{bpm:66,root:55,sc:[0,2,4,7,9],ch:[[0,4,7],[5,9,12],[2,5,9],[7,11,14]],pad:.011,lead:'sine',lg:.012,bass:'sine',hat:false,pat:[0,-1,-1,2,-1,-1,4,-1,-1,2,-1,-1,1,-1,-1,-1]},
    upper:{bpm:70,root:57,sc:[0,3,5,7,10],ch:[[0,3,7],[5,8,12],[3,7,10],[7,10,14]],pad:.011,lead:'sine',lg:.011,bass:'sine',hat:false,pat:[-1,-1,2,-1,-1,-1,0,-1,-1,-1,3,-1,-1,-1,1,-1]},
    village:{bpm:76,root:60,sc:[0,2,4,7,9],ch:[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],pad:.012,lead:'triangle',lg:.014,bass:'sine',hat:false,pat:[0,-1,2,-1,4,-1,3,-1,2,-1,4,-1,1,-1,-1,-1]},
    party:{bpm:124,root:55,sc:[0,3,5,7,10],lead:'square',lg:.013,bass:'sawtooth',hat:true,pat:[0,0,3,0,4,3,2,0],kick:true},
    sun:{bpm:92,root:57,sc:[0,3,5,7,10],ch:[[0,3,7],[5,8,12],[7,10,14],[3,7,10]],pad:.012,lead:'triangle',lg:.012,bass:'triangle',hat:true,pat:[0,-1,2,-1,4,-1,2,-1,3,-1,2,-1,0,-1,-1,-1]},
    hall:{bpm:60,root:52,sc:[0,4,7],ch:[[0,7,12],[0,7,12],[-3,4,9],[-5,2,7]],pad:.01,lead:'sine',lg:.008,bass:'sine',hat:false,pat:[-1,-1,-1,-1,-1,-1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1]},
    yoga:{bpm:50,root:52,sc:[0,2,4,7,9],ch:[[0,7,12],[0,7,12],[-5,2,7],[-5,2,7]],pad:.016,lead:'sine',lg:.014,bass:'sine',hat:false,pat:[-1,-1,-1,-1,2,-1,-1,-1,-1,-1,-1,-1,4,-1,-1,-1]}},
  /* parametri dinamici per i giochi di ritmo: karaoke (per canzone) e ballo/cuscinate */
  KCH:{funnel:{root:60,ch:[[0,4,7],[-3,0,4],[5,9,12],[7,11,14]]},click:{root:57,ch:[[0,3,7],[-4,0,4],[-9,-5,-2],[-2,2,5]]},algo:{root:52,ch:[[0,7,12],[-4,3,8],[-2,5,10],[-1,6,11]]},report:{root:62,ch:[[0,3,7],[-4,0,3],[-9,-5,-2],[-7,-3,0]]}},
  params(zn){
    const R=(typeof G!=='undefined'&&G&&G.react)||null;
    if(zn.startsWith('kar')&&R&&R.cfg){const s=R.cfg.song,K=this.KCH[s.id]||this.KCH.funnel,fast=s.beat<.6;return{bpm:60/s.beat,root:K.root,sc:[0,3,5,7,10],ch:K.ch,pad:.012,lead:'sine',lg:0,bass:s.id==='algo'?'sawtooth':'triangle',hat:fast,pat:[-1],kick:s.id==='algo'||s.id==='click',bm:4,beatBass:true};}
    if(zn.startsWith('dance')&&R&&R.cfg){return{bpm:60/R.cfg.beat,root:55,sc:[0,3,5,7,10],ch:[[0,3,7],[5,8,12],[3,7,10],[7,10,14]],pad:.012,lead:'square',lg:0,bass:'sawtooth',hat:true,pat:[-1],kick:true,bm:4,beatBass:true};}
    return this.Z[zn];},
  zoneNow(){
    if(typeof G==='undefined'||!G||typeof mode==='undefined'||mode!=='play')return '';
    if(G.react){const c=G.react.cfg;return !c?'yoga':c.kind==='kar'?'kar:'+c.song.id:'dance:'+c.kind;}
    if(G.watching)return 'hall';
    if(G.f===2){const ev=(typeof activeAt==='function'&&!G.sandbox)?activeAt(['Village']):null;return ev&&G.min>=22*60-5?'party':'village';}
    if(G.f===3)return 'sun';
    return G.f===1?'upper':'atrio';},
  note(f,t,d,type,g){const ac=A.ac;if(!ac||!this.gain)return;const o=ac.createOscillator(),v=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);v.gain.setValueAtTime(0.0001,t);v.gain.exponentialRampToValueAtTime(g,t+.01);v.gain.exponentialRampToValueAtTime(.0003,t+d);o.connect(v);v.connect(this.gain);o.start(t);o.stop(t+d+.03);this.notes++;},
  hat(t){const ac=A.ac;if(!ac||!this.gain)return;const n=Math.floor(ac.sampleRate*.04),b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=ac.createBufferSource(),v=ac.createGain();s.buffer=b;v.gain.value=.012;s.connect(v);v.connect(this.gain);s.start(t);},
  kick(t){const ac=A.ac;if(!ac||!this.gain)return;const o=ac.createOscillator(),v=ac.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);v.gain.setValueAtTime(.05,t);v.gain.exponentialRampToValueAtTime(.0005,t+.14);o.connect(v);v.connect(this.gain);o.start(t);o.stop(t+.16);},
  tick(){
    const ac=A.ac;if(!ac||!this.mus||!A.on){this.zone='';return;}
    if(ac.state==='suspended'){try{ac.resume();}catch(e){}return;}
    const zn=this.zoneNow();
    if(zn!==this.zone){this.zone=zn;this.step=0;let d=.05;const R=G&&G.react;if(R&&R.cfg&&R.beat)d=((R.lead%R.beat)-(R.t%R.beat)+R.beat)%R.beat+.05;this.next=ac.currentTime+d;}
    const Z=this.params(zn);if(!Z)return;
    const sp=60/Z.bpm/4;
    while(this.next<ac.currentTime+.3){
      const s=this.step,t=this.next,m=n=>440*Math.pow(2,(Z.root+n-69)/12),deg=Z.pat[s%Z.pat.length];
      if(Z.ch){
        const chord=Z.ch[Math.floor(s/16)%Z.ch.length];
        if(s%16===0)chord.forEach(n=>this.note(m(n),t,sp*15.5,'sine',Z.pad));
        if(Z.beatBass){if(s%4===0){this.note(m(chord[0]-12),t,sp*3.4,Z.bass,Z.kick?.03:.024);if(Z.kick)this.kick(t);}}
        else if(s%8===0)this.note(m(chord[0]-12),t,sp*7,Z.bass,.028);
        if(deg>=0&&Z.lg&&s%2===0)this.note(m(Z.sc[deg%Z.sc.length]+12*(Math.floor(s/32)%2)),t,sp*4,Z.lead,Z.lg);
      }else{
        if(s%4===0){const b=[0,0,3,2][Math.floor(s/4)%4];this.note(m(Z.sc[b%Z.sc.length]-12),t,sp*3.6,Z.bass,Z.kick?.03:.026);if(Z.kick)this.kick(t);}
        if(deg>=0&&s%2===0)this.note(m(Z.sc[deg%Z.sc.length]+(Math.floor(s/16)%2?12:0)),t,sp*1.8,Z.lead,Z.lg);
      }
      if(Z.hat&&s%2===1)this.hat(t);
      this.step++;this.next+=sp;
    }
  },
  start(){if(this.timer||!A.ac)return;if(!this.gain){this.gain=A.ac.createGain();this.gain.gain.value=1;this.gain.connect(A.ac.destination);}this.timer=setInterval(()=>{try{this.tick();}catch(e){}},100);}
};
/* jingle di vittoria (livello, record, favore) */
A.fanfare=function(){[523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>this.tone(f,.16,'square',.04),i*90));};
/* il pulsante audio ruota: musica+effetti -> solo effetti -> muto */
(function(){
  const st=lsGet('rimini.snd',0),apply=s=>{A.on=s!==2;MU.mus=s===0;const b=document.getElementById('bSnd');if(b){b.textContent=['🔊','🔉','🔇'][s];b.title=['Audio: musica ed effetti','Audio: solo effetti','Audio: muto'][s];}};
  let cur=typeof st==='number'?st:0;apply(cur);
  const b=document.getElementById('bSnd');
  if(b)b.onclick=()=>{cur=(cur+1)%3;lsSet('rimini.snd',cur);apply(cur);A.init();MU.start();if(cur<2)A.blip();if(typeof toast==='function')toast(['Musica ed effetti attivi','Solo effetti sonori','Audio disattivato'][cur],1400);};
})();
/* parte con la partita (dopo il primo gesto dell'utente, quando A.init crea l'AudioContext) */
(function(){const _i=A.init;A.init=function(){_i.call(this);MU.start();};})();
