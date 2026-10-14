'use strict';
/* RIMINI 3 GIORNI · pacchetto di easter egg e riferimenti personali.
   Contiene: gli amici del gruppo (con le loro mansioni), CatGPT e Alpachino, gli occhiali raccoglibili,
   i riferimenti a Kalemana, Copy Week, Mastermind, Business Genetics, Copy Mastery e Marketers Podcast,
   la presentazione di Andrea Bottoni e lo speech di Paolo Bacchi.
   Tutto vive in questo file: per una versione neutra basta non caricarlo (game.js controlla se le funzioni esistono). */

const BOTTONI_TAG='Andrea Bottoni, il volto più angelico di YouTube Italia.';

/* ---------- amici del gruppo: nome, mansione, famiglia di mestiere ---------- */
const FRIENDS=[
 {id:'dom',name:'Domenico Olivieri',job:'Podcast coach, editor e sound designer',fam:'creator',self:true},
 {id:'luca_l',name:'Luca Lisandrelli',job:'Brand strategist',fam:'strat'},
 {id:'luca_g',name:'Luca Giangregorio',job:'Copywriter',fam:'creator'},
 {id:'nicolo',name:'Nicolò Emmanuello',job:'Copywriter',fam:'creator'},
 {id:'lusi',name:'Lusi',job:'Copywriter',fam:'creator'},
 {id:'gabriele',name:'Gabriele Lucesole',job:'Coach',fam:'edu'},
 {id:'paola',name:'Paola Aceto',job:'Full stack human being',fam:'strat'},
 {id:'patrizia',name:'Patrizia Giampà',job:'Copywriter',fam:'creator'},
 {id:'andrea_d',name:'Andrea Deliu',job:'Copywriter',fam:'creator'},
 {id:'davide',name:'Davide Sorte',job:'Copywriter e storyteller',fam:'creator'},
 {id:'mattia',name:'Mattia',job:'Copywriter',fam:'creator'},
 {id:'erika',name:'Erika Dello Storto',job:'Copywriter e accessibilità',fam:'creator'},
 {id:'leonardo',name:'Leonardo Rapari',job:'Copywriter',fam:'creator'},
 {id:'hafedh',name:'Hafedh',job:'Copywriter',fam:'creator'},
 {id:'carlo',name:'Carlo',job:'Copywriter',fam:'creator'},
 {id:'michael',name:'Michael La Farina',job:'Copywriter',fam:'creator'},
 {id:'linda',name:'Linda Rapari',job:'Pilota di droni',fam:'creator'}];
const FR_GREET={
 Copywriter:['Ehi {first}! Sto cercando la parola giusta da tre ore: tu hai mai litigato con un aggettivo?','Ciao! Se mi vedi fissare il vuoto sto scrivendo un titolo.','Sono qui per i workshop… e per avere una scusa per non rispondere alle mail dei clienti.','Ciao! Ho il taccuino pieno di titoli bocciati. Vuoi vederne uno bruttissimo?'],
 'Copywriter e storyteller':['Ciao! Ogni persona che incontro qui è una storia: tu che storia hai?','Sono {first}: scrivo e racconto. E adesso mi racconti tu qualcosa.'],
 'Copywriter e accessibilità':['Ciao! Se vuoi sapere cosa penso, dammi un testo e te lo rendo leggibile per tutti.','Ricordati: se un testo non lo capisce tutti, non l’ha capito nessuno.'],
 'Brand strategist':['Ciao! Ti faccio una domanda scomoda: in una frase, cosa ricorda la gente di te?','Il brand non è il logo, è quello che dicono di te quando esci dalla stanza. Come stai messo?'],
 Coach:['Ciao! Ti faccio una domanda potente: cosa vuoi davvero da questi tre giorni?','Respira. Siamo al Marketers World: puoi permetterti di rallentare.'],
 'Full stack human being':['Ciao! Faccio un po’ di tutto: sono full stack human being. Di solito mi fermo quando finisce il caffè.','Mi chiedono “tu cosa fai?”. Rispondo: sì.'],
 'Pilota di droni':['Ciao! Se vuoi ti riprendo dall’alto. Il drone è nello zaino (ma qui dentro è vietato, tranquillo).','Dall’alto il Palacongressi sembra un formicaio. E tu sei una formica bellissima.'],
 'Podcast coach, editor e sound designer':[]};
const FR_SPECIAL={gabriele:['Ciao! Domanda potente: stasera facciamo baldoria?','Respira, rilassati… e poi: stasera facciamo baldoria?','Allora, stasera facciamo baldoria? Dimmi di sì.']};
const FR_BYE=['A dopo! Se mi cerchi sono quello con le cuffie.','Ci vediamo in giro!','Teniamoci in contatto, mi raccomando.','Scrivimi su Marketers Pro, rispondo sempre!'];

function extrasNPC(add,pk){
  /* amici: sparsi tra Palacongressi e Village, in ordine dato dal seme */
  const zones=[[420,640,520,705,0],[740,640,830,705,0],[430,200,860,236,0],[300,420,395,620,0],[160,640,390,700,0],[960,560,1180,820,0],[420,780,860,860,0],[420,560,830,680,1],[400,120,860,200,1],[300,540,900,740,2],[140,590,420,700,2],[920,300,1200,460,2]];
  FRIENDS.forEach((f,i)=>{
    const r=pk(zones),x0=k(r[0]),y0=k(r[1]),x1=k(r[2]),y1=k(r[3]);
    const q=add({id:'fr_'+f.id,kind:'att',friend:f.id,name:f.name,role:f.job,f:r[4],x:x0+RNG()*(x1-x0),y:y0+RNG()*(y1-y0),p:randPal(),wander:{x0,y0,x1,y1},first:f.name.split(' ')[0],job:f.job,fam:f.fam});
    q.gender=genderOf(f.name);q.p.long=q.gender==='f';if(q.gender==='f')q.p.bald=false;q.p.skirt=q.gender==='f'&&RNG()<.35;
    if(f.self){q.p=Object.assign(q.p,{phones:true,shirt:'#2a5a8a',hair:'#1a1a20',badge:'#ffd24d'});}
    if(r[4]===1&&r[1]<200){const zz=[420,560,830,680];q.wander={x0:k(zz[0]),y0:k(zz[1]),x1:k(zz[2]),y1:k(zz[3])};q.x=q.wander.x0+RNG()*(q.wander.x1-q.wander.x0);q.y=q.wander.y0+RNG()*(q.wander.y1-q.wander.y0);}
    if(FL[q.f])[q.x,q.y]=freeSpot(q.f,q.x,q.y);
  });
  /* Denise Dellagiacoma davanti allo stand di Yoga Academy */
  {const st=STANDS.find(x=>x.id==='yoga');if(st){const q=add({id:'denise',kind:'staff',name:'Denise Dellagiacoma',role:'Stand Yoga Academy',gender:'f',f:0,x:k(st.x+18),y:k(st.y+46),p:{shirt:'#7ad37a',pants:'#e8e8f0',skin:'#e8b98a',hair:'#4a3322',badge:'#7ad37a',long:true},dir:0});[q.x,q.y]=freeSpot(0,k(st.x+16),k(st.y+34));}}
  /* CatGPT: gatto grigio che gira ovunque. Alpachino: alpaca sul prato */
  add({id:'catgpt',kind:'pet',pet:'cat',name:'CatGPT',role:'Gatto grigio · modello felino',f:0,x:k(430),y:k(700),p:{shirt:'#8e939e',pants:'#6b707c',skin:'#8e939e',hair:'#6b707c',badge:'#6bd16b'},wander:{x0:k(330),y0:k(560),x1:k(860),y1:k(860)},dir:2,roam:0});
  add({id:'alpachino',kind:'pet',pet:'alpaca',name:'Alpachino',role:'Alpaca del Marketers Village',f:VILLAGE_ON?2:0,x:k(760),y:k(640),p:{shirt:'#eadcc0',pants:'#cdb98f',skin:'#f5ecd8',hair:'#cdb98f',badge:'#ffd24d'},wander:{x0:k(330),y0:k(560),x1:k(1000),y1:k(700)},dir:2,roam:0});
}
/* i due animali cambiano zona ogni tanto (se non li vedi), così "girano per la mappa" */
const PET_ZONES={
 catgpt:[[330,560,860,860,0],[420,200,860,236,0],[160,640,390,700,0],[960,560,1180,820,0],[420,560,830,680,1],[300,540,900,740,VILLAGE_ON?2:0],[420,780,860,860,0]],
 alpachino:[[330,560,1000,700,2],[920,300,1200,460,2],[100,300,380,460,2],[430,780,860,860,0],[960,720,1180,830,0],[300,540,900,740,2]]};
function petRoam(dt){
  for(const n of NPC){if(n.kind!=='pet')continue;
    n.roam-=dt;if(n.roam>0)continue;n.roam=25+RNG()*35;
    const far=n.f!==G.f||Math.hypot(n.x-G.p.x,n.y-G.p.y)>k(300);if(!far)continue;
    const z=exPick(PET_ZONES[n.id]||[]);if(!z||(z[4]===2&&!VILLAGE_ON))continue;
    n.f=z[4];n.wander={x0:k(z[0]),y0:k(z[1]),x1:k(z[2]),y1:k(z[3])};n.x=n.wander.x0+RNG()*(n.wander.x1-n.wander.x0);n.y=n.wander.y0+RNG()*(n.wander.y1-n.wander.y0);
    if(FL[n.f])[n.x,n.y]=freeSpot(n.f,n.x,n.y);
  }
}
function exPick(a){return a[Math.floor(Math.random()*a.length)];}

/* ---------- sprite dei due animali ---------- */
function drawPet(c,n){
  const x=Math.round(n.x),y=Math.round(n.y),mv=n.step>0,f=mv?Math.floor(n.step*2)%2:0,t=G.t,side=n.dir===2||n.dir===3,fl=n.dir===2;
  c.fillStyle='rgba(0,0,0,.28)';c.fillRect(x-(n.pet==='cat'?6:9),y-1,n.pet==='cat'?13:19,3);
  if(n.pet==='cat'){
    const G1='#8e939e',G2='#6b707c',W='#cdd0d8';
    if(side){
      const dx=fl?-1:1;                                      // verso: sinistra = -1
      const X=(ox,w)=>fl?x-ox-w+1:x+ox;
      const sit=!mv&&((Math.floor(t/3)+n.x|0)%4===0);
      c.fillStyle=G1;c.fillRect(X(-5,10),y-(sit?8:7),10,sit?7:5);                  // corpo
      c.fillStyle=G2;c.fillRect(X(-3,2),y-(sit?8:7),2,sit?7:5);c.fillRect(X(1,2),y-(sit?8:7),2,sit?7:5); // strisce
      c.fillStyle=W;c.fillRect(X(-4,8),y-3,8,1);                                    // pancia
      c.fillStyle=G1;c.fillRect(X(4,5),y-(sit?13:10),5,5);                          // testa
      c.fillRect(X(4,1),y-(sit?15:12),1,2);c.fillRect(X(8,1),y-(sit?15:12),1,2);   // orecchie
      c.fillStyle='#6bd16b';c.fillRect(X(7,1),y-(sit?11:8)-2,1,1);                 // occhio
      c.fillStyle='#ff9ab0';c.fillRect(X(9,1),y-(sit?10:7)-2,1,1);                 // naso
      c.fillStyle=G1;const tw=Math.round(Math.sin(t*5+n.x)*1);c.fillRect(X(-8,3),y-(sit?9:8)+tw,3,2);c.fillRect(X(-9,1),y-(sit?11:10)+tw,1,3); // coda
      c.fillStyle=G2;if(!sit){c.fillRect(X(-4,2),y-2,2,2-f);c.fillRect(X(2,2),y-2,2,1+f);}
    }else{
      const back=n.dir===1;
      c.fillStyle=G1;c.fillRect(x-3,y-8,7,6);c.fillStyle=G2;c.fillRect(x-1,y-8,3,2);   // corpo
      c.fillStyle=G1;c.fillRect(x-3,y-13,7,6);                                           // testa
      c.fillRect(x-3,y-15,2,2);c.fillRect(x+3,y-15,2,2);                                // orecchie
      if(!back){c.fillStyle='#6bd16b';c.fillRect(x-2,y-11,1,2);c.fillRect(x+2,y-11,1,2);c.fillStyle='#ff9ab0';c.fillRect(x,y-9,1,1);c.fillStyle=W;c.fillRect(x-1,y-8,3,3);}
      c.fillStyle=G2;c.fillRect(x-3,y-3,2,2+f);c.fillRect(x+2,y-3,2,3-f);
      if(back){c.fillStyle=G1;c.fillRect(x+4,y-10+Math.round(Math.sin(t*5)),1,5);}
    }
  }else{                                                      // alpaca
    const CR='#eadcc0',CD='#cdb98f',FC='#f5ecd8';
    if(side){
      const X=(ox,w)=>fl?x-ox-w+1:x+ox;
      c.fillStyle=CR;c.fillRect(X(-8,15),y-12,15,9);c.fillStyle=CD;c.fillRect(X(-8,15),y-5,15,2);
      c.fillStyle=CR;c.fillRect(X(-9,2),y-11,2,6);c.fillRect(X(6,2),y-11,2,5);               // lana
      c.fillStyle=CR;c.fillRect(X(5,4),y-22,4,12);                                        // collo
      c.fillStyle=FC;c.fillRect(X(5,6),y-26,6,5);c.fillStyle=CR;c.fillRect(X(5,1),y-28,1,3);c.fillRect(X(8,1),y-28,1,3); // testa e orecchie
      c.fillStyle='#2a2018';c.fillRect(X(8,1),y-25,1,1);c.fillRect(X(10,1),y-24,1,1);
      c.fillStyle=CD;c.fillRect(X(-6,2),y-3,2,3-(f?1:0));c.fillRect(X(-2,2),y-3,2,3-(f?0:1));c.fillRect(X(2,2),y-3,2,3-(f?1:0));c.fillRect(X(5,2),y-3,2,3-(f?0:1));
      c.fillStyle=CR;c.fillRect(X(-10,2),y-9,2,3);
    }else{
      c.fillStyle=CR;c.fillRect(x-6,y-12,13,9);c.fillStyle=CD;c.fillRect(x-6,y-5,13,2);
      c.fillStyle=CR;c.fillRect(x-2,y-22,5,11);c.fillStyle=FC;c.fillRect(x-3,y-26,7,5);c.fillStyle=CR;c.fillRect(x-3,y-28,2,3);c.fillRect(x+2,y-28,2,3);
      if(n.dir!==1){c.fillStyle='#2a2018';c.fillRect(x-2,y-24,1,1);c.fillRect(x+1,y-24,1,1);c.fillRect(x,y-22,1,1);}
      c.fillStyle=CD;c.fillRect(x-5,y-3,2,3-(f?1:0));c.fillRect(x+3,y-3,2,3-(f?0:1));
    }
  }
}
/* ---------- suoni ---------- */
A.meow=function(){this.tone(620,.12,'sine',.05,880);setTimeout(()=>this.tone(880,.2,'sine',.05,520),120);};
A.purr=function(){for(let i=0;i<10;i++)setTimeout(()=>this.tone(70+(i%2)*14,.06,'triangle',.03),i*70);};
A.hum=function(){this.tone(220,.3,'sine',.04,180);};
/* ---------- dialoghi dei due animali ---------- */
const CG_GREET=['Miao.','Miao? (Traduzione: «Come modello linguistico felino, ho fame.»)','CatGPT ti fissa. Poi sbadiglia. Poi ti fissa di nuovo.','*CatGPT sta generando una risposta… nove vite rimaste*','CatGPT ti guarda con la sicurezza di chi ha già deciso che questa è casa sua.'];
const CG_PURR=['Prrrrr… (CatGPT ha raggiunto il 100% di soddisfazione.)','*CatGPT fa le fusa a 25 Hz, frequenza certificata per curare i bug.*','Prrr… prrr… CatGPT ti riconosce come utente premium.','*CatGPT si struscia sulla tua gamba. Token consumati: nessuno. Affetto: tanto.*','Prrrr. (Ha deciso che puoi restare.)'];
const CG_ADV=['CatGPT: «Come modello addestrato su nove vite ti consiglio: 1) Dormi. 2) Fissa il vuoto. 3) Fai cadere qualcosa dal tavolo. Ottimizza il funnel.»','CatGPT: «Miao. (Traduzione: non esiste il prompt perfetto, esiste solo una scatola di cartone.)»','CatGPT: «Non rispondere subito alle mail. Osserva dalla finestra. Poi rispondi male.»','CatGPT: «Il segreto del copywriting: ripetere una parola finché il cliente non la compra.»','CatGPT: «Dai sempre il 110% e poi un pisolino di quattordici ore.»','CatGPT: «Mi dispiace, non posso aiutarti. Ho un contesto di cinque secondi e poi mi distraggo con un filo.»'];
const CG_COPY=['CatGPT scrive: «COMPRA ORA. Hai nove vite per decidere, il carrello solo una.»','CatGPT scrive: «Miao miao miao. Garanzia soddisfatti o rimpallati.»','CatGPT scrive: «Il tuo brand ha bisogno di una cosa sola: più crocchette.»','CatGPT scrive: «Titolo: “Come ho smesso di cercare e ho cominciato a dormire”. Call to action: miagola.»'];
const AL_GREET=['Alpachino ti guarda con l’aria di chi ha visto troppi webinar.','Alpachino mastica lentamente. Sembra pensare a qualcosa di profondo.','Alpachino sbatte le ciglia. Sono lunghissime.','Alpachino fa un verso strano: «Hmmmm.»'];
const AL_PET=['La lana di Alpachino è morbidissima. Hai appena scoperto cosa manca al tuo brand: la morbidezza.','Alpachino chiude gli occhi. Sembra felice. O annoiato. Con gli alpaca è difficile dirlo.','Alpachino appoggia la testa sul tuo braccio. Ti ha scelto come cuscino.','*Hmmmm.* (Traduzione: «Continua, ma senza fare il gesto del “follow”.»)'];
const AL_ADV=['Alpachino: «Fai come l’alpaca: rumina un’idea tre volte prima di pubblicarla.»','Alpachino: «Un buon brand è come la lana: caldo, morbido e difficile da lavare via.»','Alpachino: «Non sputare mai su un cliente. Al massimo, dietro le quinte.»','Alpachino: «Alpaccino macchiato, grazie. Anzi, Alpachino.»','Alpachino: «Più che alpaca, mi sento un influencer della lana.»'];
function petNote(n){const F=G.flags;F.petKinds=F.petKinds||{};if(!F.petKinds[n.pet]){F.petKinds[n.pet]=1;F.pets=Object.keys(F.petKinds).length;A.stamp();if(F.pets>=2)toast('Hai salutato CatGPT e Alpachino!',2600);}}
function petTalk(n){
  if(n.pet==='alpaca'){alpaGuide(n);return;}
  const cat=n.pet==='cat',greet=exPick(cat?CG_GREET:AL_GREET);
  const again=(kind)=>{const pool=kind==='pet'?(cat?CG_PURR:AL_PET):kind==='adv'?(cat?CG_ADV:AL_ADV):CG_COPY;
    return{t:exPick(pool),c:[{t:kind==='pet'?'Continua a coccolare':'Chiedi ancora',n:()=>again(kind),act:()=>{if(kind==='pet')(cat?A.purr():A.hum());}},...(cat&&kind==='adv'?[{t:'Fatti scrivere un copy',n:()=>again('copy')}]:[]),{t:'Ok, a dopo!',n:null}]};};
  if(cat)A.meow();else A.hum();petNote(n);
  say(n,{t:greet,c:[
    {t:cat?'Accarezza CatGPT':'Accarezza Alpachino',n:()=>again('pet'),act:()=>{cat?A.purr():A.hum();}},
    {t:'Chiedi un consiglio',n:()=>again('adv')},
    {t:'Fai un selfie insieme',n:null,act:()=>selfie(n)},
    {t:'Vai per la tua strada',n:null}]});
}
/* ---------- occhiali raccoglibili (si aggiungono agli oggetti nascosti di items.js) ---------- */
ITEMS.cyclops={n:'Occhiali da ciclope',desc:'Visiera futuristica: ti senti un X-Man del marketing.',slot:'face'};
ITEMS.pixel={n:'Occhiali in pixel art',desc:'Otto bit di puro stile. Thug life.',slot:'face'};
/* ---------- amici: dialoghi ---------- */
function friendTalk(n){
  if(typeof bmuAdd==='function')bmuAdd(n);
  const F=FRIENDS.find(x=>x.id===n.friend),first=(n.name||'').split(' ')[0];
  const onMet=()=>{if(!G.met[n.id]){G.met[n.id]=1;addContact(n);G.flags.friends=(G.flags.friends||0)+1;}};
  const r=chRng(n,'fr');
  if(F.self){
    return say(n,{t:'Ah, mi hai trovato! Sì, sono quello che ha costruito questo giochino. Qui dentro faccio ancora il podcast coach: se mi cerchi, sono sempre vicino a un microfono. E sì: voglio lasciare la fabbrica!',c:[
      {t:'Complimenti per il gioco!',n:{t:'Grazie! L’ho fatto con Claude Code, un po’ di pixel e tanta pazienza. Realizzato da Olivieri Domenico, appunto.',c:[{t:'Scambiamoci i contatti',n:null,act:onMet},{t:'Grazie!',n:null}]}},
      {t:'E il lavoro in fabbrica?',n:{t:'Voglio lasciare la fabbrica! Intanto faccio il podcast coach, l’editor e il sound designer: un passo alla volta.',c:[{t:'Forza, ce la fai!',n:null,act:onMet},{t:'Scambiamoci i contatti',n:null,act:onMet}]}},
      {t:'Un consiglio sul podcast?',n:{t:'«'+exPick(TIPS.pod)+'» Parola di podcast coach.',c:[{t:'Lo segno!',n:null,act:()=>{onMet();addTip(exPick(TIPS.pod),'consiglio di Domenico');}}]}},
      {t:'Ciao!',n:null}].slice(0,4)});
  }
  if(G.met[n.id])return say(n,{t:chPick(r,['Ehi, siamo già amici! Come procede?','Di nuovo tu! Ti ho scritto su Marketers Pro.','Ciao! Sempre un piacere trovarti qui.','Eccoti. Dai, facciamoci un selfie dopo!']),c:[{t:'Ciao!',n:null}]});
  let g=gxf(exPick(FR_SPECIAL[F.id]||FR_GREET[F.job]||FR_GREET.Copywriter),npcGender(n)).replace('{first}',first);
  const tp=chTopics(n,1)[0];
  say(n,{t:g,c:[
    ...(F.id==='gabriele'?[{t:'Stasera ci sto!',n:{t:'Ecco, così si fa! Baldoria sia. 🍻',c:[{t:'Scambiamoci i contatti',n:null,act:onMet},{t:'A stasera!',n:null,act:onMet}]}}]:[]),
    ...jobChoices(n,onMet,false),
    topicChoice(n,tp,onMet),
    {t:'Facciamo un selfie?',n:null,act:()=>{onMet();selfie(n);}},
    {t:exPick(FR_BYE),n:null}].slice(0,4)});
}
/* ---------- riferimenti: argomenti di conversazione e post ---------- */
CH_TOPIC.push(
 {q:'Sei mai stat{O|A} al Kalemana Festival?',a:['Sì! Yoga sulla spiaggia, workshop creativi e la sera DJ set: è il Kalemana, il festival più rilassato del mondo Marketers.','Il Kalemana Festival? A Punta Marina, a due passi dal mare: ci vado per ricaricarmi tra una fiera e l’altra.','Il Kalemana è dedicato alle anime libere, ai ribelli e ai sognatori. Ci si sente a casa.','Yoga all’alba in spiaggia e poi tutti a parlare di business scalzi. Il Kalemana è questo.']},
 {q:'Hai fatto la Copy Week?',a:['Sì! Una settimana intera a vivere di titoli e call to action: ne esci con la testa piena di parole giuste.','La Copy Week? Cinque giorni in cui scrivi più di quanto abbia mai scritto in un mese. Ma ne vale la pena.','Ho fatto la Copy Week quando ancora scrivevo “soluzioni innovative”. Poi ho capito.','La Copy Week mi ha insegnato una cosa: il cliente non legge, scorre. Scrivi per chi scorre.']},
 {q:'Fai parte del Mastermind?',a:['Il Mastermind? Un gruppo dove ci si dice le cose in faccia, con affetto. Il posto più utile in cui io sia mai stato.','Al Mastermind ho imparato che i problemi dei miei clienti sono quasi uguali ai tuoi. Ci si consola a vicenda.','Il Mastermind è quel posto dove porti un problema e torni con tre soluzioni e un nuovo amico.']},
 {q:'Conosci Business Genetics?',a:['Business Genetics è il corso di Marketers con cui ho cominciato a mettere ordine nella mia attività. E il workbook è anche bellissimo.','Business Genetics? Sì! Mi ha dato una struttura: prima non sapevo da dove partire.','Ho letto tutto Business Genetics con la matita in mano. Il workbook è finito pieno di appunti.']},
 {q:'Hai fatto Copy Mastery?',a:['Copy Mastery è il corso di copywriting di Marketers: ho finito il modulo sui titoli e ora scrivo titoli anche per la lista della spesa.','Copy Mastery mi ha tolto per sempre la paura della pagina bianca. Adesso ho paura della pagina piena.','Ne parlano tutti bene di Copy Mastery: io ho ancora il quaderno dei titoli.']},
 {q:'Ascolti il Marketers Podcast?',a:['Il Marketers Podcast lo ascolto in treno: tra una puntata e l’altra segno sempre almeno un’idea.','Ho scoperto il Marketers Podcast durante una levataccia: da allora è il mio compagno di viaggio.','Per me il Marketers Podcast è come un amico che parla di lavoro senza farti sentire in ritardo.','Prima ascoltavo musica in cuffia; adesso ascolto il Marketers Podcast. Cresco!']},
 {q:'Hai visto Andrea Bottoni?',a:['Certo! '+BOTTONI_TAG,'Ah, '+BOTTONI_TAG+' Ha un modo di parlare di copy che ti resta addosso.','Dicono: '+BOTTONI_TAG+' Io aggiungo: e molto bravo con le parole.','Andrea Bottoni? '+BOTTONI_TAG+' Non perdere la sua sessione.']});
CM_EVENT.push(
 'Oggi mi manca già il Kalemana: yoga in spiaggia e zero notifiche. #Kalemana',
 'Copy Week in corso nella mia testa: ho riscritto il titolo di questo post quattro volte.',
 'Qualcuno del Mastermind è qui? Facciamo un caffè prima del prossimo speech.',
 'Business Genetics in valigia, taccuino in mano: si riparte da qui. #MW26',
 'Copy Mastery, lezione dell’anno: il titolo si scrive per ultimo (e si riscrive cinque volte).',
 'Nelle pause ascolto il Marketers Podcast. Metà delle persone qui le conosco dalle puntate.',
 BOTTONI_TAG+' Sta per salire sul Main Stage. #MW26',
 'Ho appena chiesto un selfie con '+'CatGPT. Ha accettato. Ha anche chiesto le crocchette.',
 'Avete visto Alpachino sul prato? È più calmo di me dopo tre caffè.');
CM_Q.push('Chi viene al prossimo Kalemana? Io metto la sveglia per i biglietti.','Copy Week o Copy Mastery se devo scegliere un solo percorso di copy? Consigli?','Chi del Mastermind ha un consiglio per chi parte da zero con i clienti?');
CM_ABSENT.push('Quest’anno niente Marketers World per me: mi consolo con il Kalemana, almeno lì ci sono.');
/* ---------- contenuti: Bottoni presentato, Bacchi comico ---------- */
function spkNote(sp){return /Bottoni/.test(sp||'')?`<br><small style="color:#ffd24d">${BOTTONI_TAG}</small>`:'';}
function extrasTalk(s){
  if(/Bacchi/.test(s.sp||'')){
    const sl=[
     ['Titolo in arrivo (il ritorno, in video)',['Relatore: Paolo Bacchi','Film Maker | DOP | Editor at Marketers'],'Buonasera! Avevo preparato una presentazione seria, poi ho visto l’orario: sabato, quasi le cinque. Quindi niente di serio. Il titolo è ancora in arrivo, ma le battute sono già arrivate. Parliamo di video, quindi: luci, ciak e freddure.','Il titolo è in arrivo, le battute sono già qui.'],
     ['La luce',['L’ora d’oro dura quaranta minuti','Io arrivo sempre al minuto trentanove'],'Qual è la luce preferita dei film maker? Quella che non c’è mai quando serve: l’ora d’oro dura quaranta minuti e io arrivo sempre al minuto trentanove.','La luce giusta si prepara prima, non si insegue.'],
     ['Il fuoco',['Metti a fuoco una cosa sola','Troppo fuoco brucia la scena'],'Il segreto per stare sereni? Mettere a fuoco. Ma non troppo, sennò si brucia la scena.','Metti a fuoco una sola cosa per inquadratura.'],
     {q:'Qual è il primo strumento di un film maker?',c:[{t:'Il treppiede: è l’unico appoggio che non ti molla mai.',r:'Esatto! Ed è anche l’unico che regge i miei discorsi.',good:true},{t:'La pazienza del cliente.',r:'Quella finisce al secondo giro di correzioni.',good:false},{t:'Un file da quaranta giga.',r:'Quello è il nemico, non lo strumento. Si mangia tutto lo spazio, come me a cena dai suoceri.',good:false}]},
     ['L’audio',['L’audio pulito vale più dell’immagine','Il microfono non si improvvisa'],'Cosa fa un microfono quando è triste? Si spegne in diretta. Per questo l’audio non si improvvisa.','L’audio pulito vale più dell’immagine bella.'],
     ['Il montaggio',['Taglia, poi taglia ancora','Il video migliore è il più corto'],'Il colmo per un editor? Tagliare corto… e consegnare in ritardo.','Taglia di più: il video migliore è quello più corto.'],
     ['Il verticale',['9:16 per i social','Pensa al formato prima di girare'],'Il 9:16 è l’unico formato in cui un marketer riesce a stare in piedi dopo il terzo caffè.','Scegli il formato prima di girare, non dopo.'],
     ['E l’AI?',['Accelera il lavoro','Non sostituisce l’occhio'],'Ho chiesto all’AI di generare il mio video. Poi le ho chiesto di generare la mia pazienza: errore 404.','L’AI accelera il lavoro, non sostituisce l’occhio.'],
     ['Grazie!',['Un film maker non dice “ho finito”','Dice “l’ho consegnato”'],'Un film maker non dice mai “ho finito”: dice “l’ho consegnato”. Grazie a tutti e ricordate: sottotitoli sempre!','Sottotitoli sempre.']];
    return{title:s.title,speaker:s.sp,role:s.role,pal:{shirt:'#2a5a4a',skin:'#e8b98a',hair:'#5a4630',long:false},slides:sl};
  }
  return null;
}
function extrasContent(s,c){
  if(/Bottoni/.test(s.sp||'')){const f=c.slides[0];f[2]='Lo presenta così: «'+BOTTONI_TAG+'» '+f[2];}
  return c;
}

(function(){const b=FAMILY.find(f=>f.id==='bottoni');if(b&&!b.facts.includes(BOTTONI_TAG))b.facts.unshift(BOTTONI_TAG);})();

/* Marketers Pro: frasi fisse di Gabriele e Domenico (commenti e post) */
const EX_LINES={'Gabriele Lucesole':'Stasera facciamo baldoria? 🍻','Domenico Olivieri':'Voglio lasciare la fabbrica!'};
function extrasWarm(who,r){if(EX_LINES[who.name]&&r()<.7)return EX_LINES[who.name];return null;}
function extrasFeed(T){
  const out=[],mk=(f,id,at,text)=>({id,at,m:{name:f,gender:'m',job:f==='Gabriele Lucesole'?'Coach':'Podcast coach, editor e sound designer',pal:(NPC.find(n=>n.name===f)||{}).p||facePal(f,'m')},text,kind:'ex',q:false,mine:false});
  [[0,18*60+40],[1,18*60+30],[2,17*60+50]].forEach(([d,m],i)=>out.push(mk('Gabriele Lucesole','exg'+i,d*1440+m,'Stasera facciamo baldoria? 🍻 #MW26')));
  [[0,10*60+20],[1,13*60],[2,9*60+30]].forEach(([d,m],i)=>out.push(mk('Domenico Olivieri','exd'+i,d*1440+m,['Voglio lasciare la fabbrica! (ma prima il caffè) #MW26','Voglio lasciare la fabbrica! Intanto mi alleno: oggi microfono e due chiacchiere.','Voglio lasciare la fabbrica, ve lo dico qui così sono costretto a farlo. #MW26'][i])));
  return out.filter(x=>x.at<=T);
}

/* ---------- Alpachino: nella realtà è il bot di assistenza clienti, qui è la guida del gioco (Q&A) ---------- */
function goalText(){const F=G.flags;
  if(VILLAGE_ON&&!F.bus)return{t:'Sei al Marketers Village: vai alla fermata in basso e sali sulla navetta per il Marketers World.',dest:{n:'Fermata della navetta',f:2,x:k(VG.bus.x),y:k(VG.bus.y)}};
  if(!F.app){const n=NPC.find(x=>x.id==='info');return{t:'Vai all’Assistenza app, fuori dall’Ingresso A, e attiva l’app dell’evento (nel gioco).',dest:{n:'Assistenza app',f:0,x:n.x,y:n.y}};}
  if(!F.accred){const n=NPC.find(x=>x.id==='accred');return{t:'Hai l’app: vai dallo Staff accrediti, mostra il QR e ritira il badge.',dest:{n:'Staff accrediti',f:0,x:n.x,y:n.y}};}
  const nx=nextEvent();
  return{t:nx?'Sei dentro! Prossima sessione: «'+nx.title+'» alle '+nx.t+' ('+nx.room+'). Apri il telefono 📱 per prenotare i workshop del venerdì.':'Per oggi le sessioni sono finite: fai networking, passa dall’Offworld o torna al Village dalla navetta.'};
}
function alpaGuide(n){
  A.hum();petNote(n);
  const me=ME();
  const go=(d)=>({t:'Portami lì',n:null,act:()=>{G.dest=Object.assign({auto:0},d);toast('Destinazione: '+d.n,2000);}});
  const menu=(t,items)=>({t,c:items});
  const place=(name,txt,f,x,y)=>({t:name,n:()=>menu(txt,[go({n:name,f,x:k(x),y:k(y)}),{t:'Altri luoghi',n:()=>luoghi()},{t:'Indietro al menu',n:()=>main()}])});
  const luoghi=()=>menu('Dimmi dove vuoi andare.',[
    place('Palco principale','Il Main Stage è in Sala della Piazza, al piano terra, in mezzo al Palacongressi: speech e sessioni grandi.',0,651,470),
    place('Silent Stage','Le Silent Stage sono quattro zone con cuffie, sul lato ovest vicino al Main Stage: sessioni “silenziose”.',0,442,415),
    {t:'Altro luogo…',n:()=>altro()},
    {t:'Indietro',n:()=>main()}]);
  const altro=()=>menu('Quali servizi cerchi?',[
    place('Area networking','Qui ti incontri con chi hai contattato dall’app (scheda Rete). Ricorda l’orario del meeting.',0,225,694),
    place('Accrediti','Fuori dall’Ingresso A, a sinistra: ritiro badge. Serve prima l’app attivata.',0,520,805),
    place('Assistenza app','Fuori dall’Ingresso A, a destra: attivazione dell’app dell’evento.',0,745,805),
    {t:'Indietro',n:()=>luoghi()}]);
  const gioco=()=>menu('Che dubbio hai sul gioco?',[
    {t:'Cosa devo fare adesso?',n:()=>{const g=goalText();return menu(g.t,[...(g.dest?[go(g.dest)]:[]),{t:'Indietro al menu',n:()=>main()}]);}},
    {t:'Come prenoto i workshop?',n:()=>menu('Apri il telefono 📱 (o P), scheda Programma, giorno di venerdì: tocca “Prenota”. Se due workshop si sovrappongono, il secondo non si prenota. I workshop sono al primo piano.',[{t:'Indietro al menu',n:()=>main()}])},
    {t:'Come scorre il tempo?',n:()=>menu(G.sandbox?'Sei in Sandbox: il tempo è fermo e puoi entrare in qualsiasi sessione. ⏩ salta un’ora, toccando l’orologio cambi giorno.':'Un minuto di gioco ogni quattro secondi, dalle 8:15 alle 23:30. Si ferma quando apri telefono, mappa o parli. ⏩ salta quindici minuti. Dalle 17:00 puoi chiudere la giornata con la navetta.',[{t:'Indietro al menu',n:()=>main()}])},
    {t:'Indietro',n:()=>main()}]);
  const prog=()=>menu('Cosa vuoi sapere sul programma?',[
    {t:'Cosa c’è adesso?',n:()=>{const nx=nextEvent();return menu(nx?'La prossima sessione è «'+nx.title+'» alle '+nx.t+', in '+nx.room+'. Per vedere tutto: telefono, scheda Programma.':'Per oggi non ci sono altre sessioni. Domani si riparte!',[{t:'Indietro al menu',n:()=>main()}]);}},
    {t:'Una sessione per me',n:()=>{const e=PROGRAMMA.find(x=>x.kind!=='lounge'&&x.start>G.min&&x.d===G.day&&forMe(x));return menu(e?'Per te ('+me.job+'): «'+e.title+'» alle '+hm(e.start)+', in '+e.room+'. La trovi con “★ Per te” nel Programma.':'Per oggi non vedo altre sessioni adatte a te: prova domani, o filtra “★ Per te” nel Programma.',[{t:'Indietro al menu',n:()=>main()}]);}},
    {t:'Come funziona Marketers Pro?',n:()=>menu('È la community dell’evento: scrivi post brevi, metti like e commenta. Chi hai incontrato dal vivo ti riconosce. Il pulsante 🌐 Marketers Pro è sempre sullo schermo.',[{t:'Indietro al menu',n:()=>main()}])},
    {t:'Indietro',n:()=>main()}]);
  const altroMenu=()=>menu('Qui il bot lascia spazio all’alpaca.',[
    {t:'Accarezza Alpachino',n:()=>menu(exPick(AL_PET),[{t:'Ancora!',n:()=>altroMenu(),act:()=>A.hum()},{t:'Indietro al menu',n:()=>main()}]),act:()=>A.hum()},
    {t:'Fai un selfie insieme',n:null,act:()=>selfie(n)},
    {t:'Chi sei davvero?',n:()=>menu('Nella realtà sono il bot di assistenza clienti di Marketers: rispondo a domande e smisto problemi. Qui sono la guida del gioco, solo con più pelo e meno ticket. '+exPick(AL_ADV),[{t:'Indietro al menu',n:()=>main()}])},
    {t:'Indietro',n:()=>main()}]);
  const main=()=>menu(exPick(AL_GREET)+' Sono Alpachino, assistenza clienti del Marketers World (tecnicamente un bot, praticamente un alpaca). Come posso aiutarti?',[
    {t:'Il gioco: dubbi e consigli',n:()=>gioco()},
    {t:'Dove devo andare?',n:()=>luoghi()},
    {t:'Programma e sessioni',n:()=>prog()},
    {t:'Altro…',n:()=>altroMenu()},
    {t:'Grazie, a dopo!',n:null}]);
  say(n,main());
}

/* ---------- Denise Dellagiacoma allo stand di Yoga Academy ---------- */
function deniseTalk(n){
  if(typeof trophyFound==='function')trophyFound(n);
  const ct=()=>{addContact(n);};
  const menu=()=>({t:'Ciao! Benvenuta o benvenuto allo stand di Yoga Academy. Qui si parla di yoga, respiro e benessere, anche tra una sessione e l’altra. Cosa ti incuriosisce?',c:[
    {t:'Cos’è Yoga Academy?',n:()=>({t:'Yoga Academy è una scuola di yoga online, e qui allo stand ti racconto come funziona. È uno dei progetti del gruppo Marketers: yoga e business si parlano più di quanto pensi.',c:[{t:'Scambiamoci i contatti',n:null,act:ct},{t:'Indietro',n:()=>menu()}]})},
    {t:'Parlami del Kalemana Festival',n:()=>({t:'Il Kalemana Experience Festival è organizzato da Yoga Academy insieme a WeAreMarketers a Punta Marina di Ravenna: yoga in spiaggia, workshop creativi e DJ set la sera. Un festival per anime libere, ribelli e sognatori.',c:[{t:'Che bello!',n:null,act:ct},{t:'Indietro',n:()=>menu()}]})},
    {t:'Facciamo tre respiri',n:{t:'Inspira… espira… Meglio. Il respiro è l’unico strumento che hai sempre con te: usalo prima di ogni speech importante.',c:[{t:'Grazie!',n:null,act:()=>{if(!G.flags.yoga){G.flags.yoga=true;A.stamp();toast('Yoga fatto!',2200);}ct();}}]}}]});
  say(n,menu());
}

/* trofei: Denise e il «Gruppo BMU» (Bar Marketers Unofficial): si completa incontrando tutti gli amici del gruppo */
const bmuTotal=()=>FRIENDS.length;
const bmuCount=()=>FRIENDS.filter(f=>G.bmu&&G.bmu[f.id]).length;
function bmuAdd(n){
  if(!n||!n.friend)return;G.bmu=G.bmu||{};if(G.bmu[n.friend])return;G.bmu[n.friend]=true;
  if(bmuCount()>=bmuTotal())trophyFound({id:'bmu',name:'Gruppo BMU (Bar Marketers Unofficial)'});
}
function extrasTrophies(){
  const L=[];const dn=NPC.find(n=>n.id==='denise');
  if(dn)L.push({id:'denise',g:'fam',name:'Denise Dellagiacoma',role:'Yoga Academy',pal:dn.p});
  const me=NPC.find(n=>n.id==='fr_dom');L.push({id:'bmu',g:'grp',name:'Gruppo BMU',role:'Bar Marketers Unofficial',pal:me?me.p:{shirt:'#2a5a8a',pants:'#232a44',skin:'#e8b98a',hair:'#1a1a20'}});
  return L;
}
