'use strict';
/* ECO · generatore dei casi: fatti veri e falsi, fonti, informazioni e persone */
const FACTS=['EVENT','WHEN','HOW','WITNESS','WHO','WHY','COVER','AFTER','META'];
const FACT_PH={EVENT:'context',WHEN:'context',HOW:'body',WITNESS:'body',WHO:'twist',WHY:'twist',COVER:'twist',AFTER:'close',META:'close'};
const FACT_IMP={EVENT:.3,WHEN:.4,HOW:.6,WITNESS:.6,WHO:1,WHY:.9,COVER:.9,AFTER:.7,META:.9};
const FACT_Q={EVENT:'Cosa sa di questa storia?',WHEN:'Quando è successo, esattamente?',HOW:'Com\'è andata, secondo lei?',WITNESS:'Ha visto o sentito qualcosa quella notte?',WHO:'Chi c\'era dietro, secondo lei?',WHY:'Perché è successo?',COVER:'Qualcuno ha provato a nascondere qualcosa?',AFTER:'Cosa è successo dopo?',META:'Conosce la società {org}?'};
const TRAITS={
  loquace:{pre:'Guardi, glielo dico volentieri: ',likes:'gentile',hates:'incalzante'},
  timido:{pre:'Beh… non so se dovrei… ma ',likes:'gentile',hates:'incalzante'},
  orgoglioso:{pre:'Lo so bene io, e non ho paura a dirlo: ',likes:'diretto',hates:'gentile'},
  nervoso:{pre:'Senta, io non… ',likes:'gentile',hates:'diretto'},
  sospettoso:{pre:'Se proprio vuole saperlo: ',likes:'diretto',hates:'incalzante'},
  stanco:{pre:'Eh… una vita fa. Ma ricordo che ',likes:'gentile',hates:'diretto'}};
const TRAIT_KEYS=Object.keys(TRAITS);

/* luoghi: forma nominale + preposizioni articolate */
const PLACES={
  incendio:[{n:'il vecchio mulino',in:'nel vecchio mulino',of:'del vecchio mulino',at:'al vecchio mulino',bld:'mill'},{n:'il teatro Excelsior',in:'nel teatro Excelsior',of:'del teatro Excelsior',at:'al teatro Excelsior',bld:'theater'},{n:'la fabbrica di sedie',in:'nella fabbrica di sedie',of:'della fabbrica di sedie',at:'alla fabbrica di sedie',bld:'factory'}],
  scomparsa:[{n:'il faro',in:'nel faro',of:'del faro',at:'al faro',bld:'lighthouse'},{n:'il vecchio casale',in:'nel vecchio casale',of:'del vecchio casale',at:'al vecchio casale',bld:'farm'}],
  furto:[{n:'il museo civico',in:'nel museo civico',of:'del museo civico',at:'al museo civico',bld:'museum'},{n:'la villa dei conti',in:'nella villa dei conti',of:'della villa dei conti',at:'alla villa dei conti',bld:'villa'}],
  segnale:[{n:'la torre radio',in:'nella torre radio',of:'della torre radio',at:'alla torre radio',bld:'tower'},{n:'la stazione meteo',in:'nella stazione meteo',of:'della stazione meteo',at:'alla stazione meteo',bld:'station'}],
  cedimento:[{n:'la miniera di zolfo',in:'nella miniera di zolfo',of:'della miniera di zolfo',at:'alla miniera di zolfo',bld:'mine'},{n:'la diga vecchia',in:'nella diga vecchia',of:'della diga vecchia',at:'alla diga vecchia',bld:'dam'}]
};
const OBJS=['il Calice d\'argento','il quadro del Pescatore','la Campana del 1700','il Reliquiario di Santa Nives'];
const MONTHS=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
const lc=s=>s?s[0].toLowerCase()+s.slice(1):s;

/* testi per ciascun tipo di caso: {t: vero, l:[falsi], tq/lq: prima persona per il testimone} */
function kindFacts(k,c){
  const {Y,Y2,A,B,V,W,pl,pl2,date,n,obj,Org,freq}=c;
  const lo=A.sex==='f'?'la':'lo';
  const F={};
  if(k==='incendio'){
    F.EVENT={t:`Nel ${Y} ${pl.n} andò a fuoco in piena notte: ${n} persone rimasero ferite.`,l:[`Nel ${Y} ${pl.n} fu distrutto da un incendio, per fortuna senza feriti.`]};
    F.WHEN={t:`L'incendio scoppiò nella notte del ${date}, ${Y}.`,l:[`L'incendio scoppiò nella notte del ${date}, ${Y2}.`]};
    F.HOW={t:`Le fiamme partirono dal retro, dove qualcuno aveva versato della benzina.`,l:[`Le fiamme nacquero da un cortocircuito nel quadro elettrico.`,`Una stufa rimasta accesa fece divampare l'incendio.`]};
    F.WHO={t:`${A.name} fu la persona che appiccò il fuoco.`,l:[`${B.name} fu la persona che appiccò il fuoco.`]};
    F.WHY={t:`${A.name} voleva distruggere i registri contabili che ${lo} incastravano.`,l:[`${B.name} agì per vendetta, dopo essere stato cacciato.`,`Qualcuno voleva riscuotere l'assicurazione.`]};
    F.WITNESS={t:`${W.name} vide una figura in cappotto chiaro uscire dal retro, poco prima delle fiamme.`,tq:`Vidi una figura in cappotto chiaro uscire dal retro, poco prima delle fiamme.`,l:[`${W.name} non vide nessuno aggirarsi intorno all'edificio quella notte.`],lq:[`Non vidi nessuno, quella notte. Nessuno.`]};
    F.COVER={t:`Il verbale dei vigili fu corretto per cancellare ogni riferimento alla benzina.`,l:[`Il verbale dei vigili è completo e non ha mai subito modifiche.`]};
    F.AFTER={t:`Dopo l'incendio ${A.name} prosperò: comprò il terreno bruciato a un prezzo irrisorio.`,l:[`Dopo l'incendio ${A.name} cadde in rovina e lasciò la regione.`]};
  }else if(k==='scomparsa'){
    const vs=V.sex==='f';
    F.EVENT={t:`Nel ${Y} ${V.name} scomparve nei pressi ${pl.of}, senza lasciare tracce.`,l:[`Nel ${Y} ${V.name} lasciò il paese di sua volontà e non tornò più.`]};
    F.WHEN={t:`${V.name} fu vist${vs?'a':'o'} per l'ultima volta la sera del ${date}, ${Y}.`,l:[`${V.name} fu vist${vs?'a':'o'} per l'ultima volta la sera del ${date}, ${Y2}.`]};
    F.HOW={t:`${V.name} salì su una barca insieme a qualcuno, di notte.`,l:[`${V.name} si allontanò a piedi, da sol${vs?'a':'o'}, sulla strada del passo.`]};
    F.WHO={t:`L'ultima persona con ${V.name} fu ${A.name}.`,l:[`L'ultima persona con ${V.name} fu ${B.name}.`]};
    F.WHY={t:`${V.name} aveva scoperto i traffici illeciti di ${A.name}.`,l:[`${V.name} fuggì per una storia d'amore con ${B.name}.`,`${V.name} era pien${vs?'a':'o'} di debiti e voleva sparire.`]};
    F.WITNESS={t:`${W.name} vide le luci di una barca al largo, ben dopo mezzanotte.`,tq:`Vidi le luci di una barca al largo, ben dopo mezzanotte.`,l:[`${W.name} giura di non aver visto né sentito niente quella notte.`],lq:[`Quella notte non vidi né sentii niente. Dormivo.`]};
    F.COVER={t:`La lettera d'addio di ${V.name} fu scritta da ${A.name}, non da ${vs?'lei':'lui'}.`,l:[`La lettera d'addio è autentica: la calligrafia è proprio di ${V.name}.`]};
    F.AFTER={t:`${V.name} non lasciò mai la regione: ${vs?'è nascosta':'è nascosto'} ${pl2.in}.`,l:[`${V.name} emigrò all'estero e si rifece una vita.`]};
  }else if(k==='furto'){
    F.EVENT={t:`Nel ${Y} sparì ${obj}, che era custodito ${pl.in}.`,l:[`Nel ${Y} ${obj} fu venduto in segreto dal comune.`]};
    F.WHEN={t:`Il furto avvenne nella notte del ${date}, ${Y}.`,l:[`Il furto avvenne nella notte del ${date}, ${Y2}.`]};
    F.HOW={t:`Non ci fu nessuno scasso: chi entrò aveva le chiavi.`,l:[`I ladri entrarono forzando la finestra del retro.`]};
    F.WHO={t:`${A.name} portò via ${obj}.`,l:[`${B.name} portò via ${obj}.`]};
    F.WHY={t:`${A.name} doveva saldare un debito con un collezionista privato.`,l:[`${B.name} voleva ricattare il comune.`]};
    F.WITNESS={t:`${W.name} sentì un furgone partire dal retro prima dell'alba.`,tq:`Sentii un furgone partire dal retro, prima dell'alba.`,l:[`${W.name} non sentì alcun rumore quella notte.`],lq:[`Nessun rumore, quella notte. Una notte tranquilla.`]};
    F.COVER={t:`L'inventario fu falsificato: ${obj} risultava già in prestito.`,l:[`L'inventario è integro e prova che il furto è avvenuto quella notte.`]};
    F.AFTER={t:`${cap(obj)} è nascosto ${pl2.in}.`,l:[`${cap(obj)} fu venduto all'estero e non tornerà più.`]};
  }else if(k==='segnale'){
    F.EVENT={t:`Dal ${Y}, ogni notte, dalla zona ${pl.of} parte un segnale radio: una breve sequenza di cifre.`,l:[`Il segnale registrato nella zona ${pl.of} è solo un'interferenza naturale, non una trasmissione.`]};
    F.WHEN={t:`Il segnale comparve per la prima volta la notte del ${date}, ${Y}.`,l:[`Il segnale comparve per la prima volta la notte del ${date}, ${Y2}.`]};
    F.HOW={t:`Il segnale è prodotto da un trasmettitore automatico alimentato a batterie.`,l:[`Il segnale viene trasmesso a mano da qualcuno, ogni notte.`]};
    F.WHO={t:`${A.name} installò il trasmettitore.`,l:[`${B.name} installò il trasmettitore.`]};
    F.WHY={t:`${A.name} lo programmò per indicare dove sono sepolti dei documenti compromettenti.`,l:[`${B.name} lo usa per parlare con dei contrabbandieri.`]};
    F.WITNESS={t:`${W.name} ha trascritto il codice: sono delle coordinate.`,tq:`Ho trascritto il codice per anni: sono coordinate.`,l:[`${W.name} sostiene che la sequenza sia solo rumore.`],lq:[`È solo rumore, glielo assicuro. Rumore di fondo.`]};
    F.COVER={t:`Le autorità smentirono ufficialmente l'esistenza del segnale per evitare indagini.`,l:[`Le autorità non hanno mai ricevuto alcuna segnalazione sul segnale.`]};
    F.AFTER={t:`Le coordinate puntano ${pl2.at}, dove sono interrati i documenti.`,l:[`Le coordinate cadono in mezzo al mare: non portano a niente.`]};
  }else{ // cedimento
    F.EVENT={t:`Nel ${Y} ${pl.n} cedette: ${n} lavoratori persero la vita.`,l:[`Nel ${Y} ${pl.n} fu chiuso per manutenzione, senza vittime.`]};
    F.WHEN={t:`Il cedimento avvenne il giorno ${date}, ${Y}.`,l:[`Il cedimento avvenne il giorno ${date}, ${Y2}.`]};
    F.HOW={t:`Il cedimento fu causato da controlli falsificati sulle strutture.`,l:[`Il cedimento fu causato da una piena eccezionale.`]};
    F.WHO={t:`${A.name} era il responsabile dei lavori e ignorò gli avvertimenti.`,l:[`${B.name}, il guardiano, dimenticò di chiudere le paratie.`]};
    F.WHY={t:`${A.name} tagliò i costi per vincere un appalto più grande.`,l:[`Fu soltanto una tragica fatalità.`]};
    F.WITNESS={t:`${W.name} lavorò al cantiere e vide crepe ignorate per mesi.`,tq:`Lavoravo al cantiere. Le crepe c'erano da mesi, e nessuno le guardava.`,l:[`${W.name} giura che era tutto in ordine.`],lq:[`Era tutto in ordine. Mai visto niente di strano.`]};
    F.COVER={t:`Il rapporto di sicurezza fu fatto sparire dagli archivi.`,l:[`Il rapporto di sicurezza non fu mai redatto.`]};
    F.AFTER={t:`${A.name} fu promosso e fondò un'impresa con i soldi dell'appalto.`,l:[`${A.name} fu licenziato e radiato dall'albo.`]};
  }
  F.META={t:`Il terreno, i registri e le carte di questa vicenda finirono alla società ${Org}, la stessa che compare negli altri misteri.`,l:[]};
  return F;
}
const KIND_TITLE={
  incendio:(c)=>`Il rogo ${c.pl.of}`,
  scomparsa:(c)=>`La scomparsa di ${c.V.name.split(' ')[0]}`,
  furto:(c)=>`Il furto de${c.obj.startsWith('il ')?'l '+c.obj.slice(3):c.obj.startsWith('la ')?'lla '+c.obj.slice(3):'ll\''+c.obj.slice(2)}`,
  segnale:(c)=>`Il segnale ${c.pl.of}`,
  cedimento:(c)=>`Il crollo ${c.pl.of}`
};
const SRC_STARS={npc:3,archivio:4,giornale:4,oggetto:5,voce:2,rumor:2,documento:4,tape:4};

/* ---------------------------------------------------------------------- */
function genCases(seed,towns,hubId){
  const r=rngFor(seed,'cases');
  const kinds=pickKinds(seed);
  const caseTowns=towns.filter(t=>t.id!==hubId);
  const cases=[],items={},npcs={};
  const Org=pick(r,['Società ','Fondazione ','Impresa '])+surname(r)+pick(r,[' & Figli',' Costruzioni',' Immobiliare',' Aurora']);
  let nid=0,iid=0;
  const mkNpc=(opts)=>{const sex=opts.sex||(r()<.5?'f':'m'),id='n'+(nid++);const n={id,name:personName(r,sex),sex,trait:pick(r,TRAIT_KEYS),townId:opts.town,role:opts.role,bld:opts.bld||null,case:opts.case,trust:30+Math.floor(r()*20),statements:[],chat:[],rumors:[],style:Math.floor(r()*1e6),age:ri(r,28,82),topic:'p_'+id};npcs[id]=n;return n;};
  for(let ci=0;ci<3;ci++){
    const kind=kinds[ci],tw=caseTowns[ci%caseTowns.length],cr=rngFor(seed,'case'+ci);
    const plOpt=PLACES[kind].find(p=>p.bld===tw.caseBld)||pick(cr,PLACES[kind]);
    const others=towns.filter(t=>t.id!==tw.id);
    const Y=ri(cr,1961,1996),Y2=Y+pick(cr,[-2,-1,1,2,3]);
    const day=ri(cr,2,28),date=day+' '+pick(cr,MONTHS);
    // cast
    const A=mkNpc({role:'colpevole',town:pick(cr,others).id,case:ci}),B=mkNpc({role:'sospettato',town:tw.id,case:ci});
    const W=mkNpc({role:'testimone',town:tw.id,case:ci}),X=mkNpc({role:'insider',town:pick(cr,others).id,case:ci});
    const O=mkNpc({role:'anziano',town:hubId,case:ci}),Z=mkNpc({role:'archivista',town:pick(cr,towns).id,case:ci});
    const V=kind==='scomparsa'?{name:personName(cr,'f'),sex:'f'}:null;
    const town2=pick(cr,others);
    const pl2={in:'nella cascina abbandonata di '+town2.name,at:'alla cascina abbandonata di '+town2.name};
    const c={id:ci,kind,town:tw.id,Y,Y2,A,B,V,W,pl:plOpt,pl2,date,n:ri(cr,2,9),obj:pick(cr,OBJS),Org,freq:ri(cr,3,9)+'.'+ri(cr,100,999)+' kHz'};
    const F=kindFacts(kind,c);
    const title=KIND_TITLE[kind](c);
    const cs={id:ci,kind,title,town:tw.id,placeBld:tw.caseBldId,Y,Y2,A:A.id,B:B.id,W:W.id,X:X.id,O:O.id,Z:Z.id,V:V?V.name:null,org:Org,topic:'c'+ci,facts:{},items:[],place:plOpt,date,placeName:cap(plOpt.n),difficulty:ci};
    // topics
    const topicIds={case:'c'+ci,place:'pl'+ci,year:'y'+ci,A:A.topic,B:B.topic,W:W.topic,X:X.topic,O:O.topic,V:'v'+ci,org:'org'};
    const TOPIC_NAMES={['c'+ci]:title,['pl'+ci]:cap(plOpt.n),['y'+ci]:String(Y),[A.topic]:A.name,[B.topic]:B.name,[W.topic]:W.name,[X.topic]:X.name,[O.topic]:O.name,['v'+ci]:V?V.name:'',org:Org};
    cs.topicNames=TOPIC_NAMES;cs.topicIds=topicIds;
    // fatti e informazioni
    const mk=(fact,variant,text,src,extra)=>{
      const id='i'+(iid++),truth=variant===0,f=F[fact];
      const it=Object.assign({id,case:ci,fact,variant,truth,text,tq:null,src,origin:src.origin||id,phase:FACT_PH[fact],imp:FACT_IMP[fact],keys:[],reveals:[],gate:{free:true},invReq:0,mode:'note',dur:.6,stars:SRC_STARS[src.type]||3,claim:ci+':'+fact+':'+variant},extra||{});
      items[id]=it;cs.items.push(id);return it;
    };
    const keysFor=(fact)=>{const k=[topicIds.case,topicIds.place,topicIds.year];if(fact==='WHO'||fact==='WHY')k.push(topicIds.A,topicIds.B);if(fact==='WITNESS')k.push(topicIds.W);return k;};
    const revealsFor=(fact,variant)=>{const t=[];if(fact==='EVENT'){t.push(topicIds.place,topicIds.year);if(V)t.push(topicIds.V);}
      if(fact==='WHO'){t.push(variant===0?topicIds.A:topicIds.B);}if(fact==='WITNESS')t.push(topicIds.W);if(fact==='WHEN')t.push(topicIds.year);if(fact==='COVER')t.push(topicIds.X);if(fact==='META')t.push('org');return t;};
    const stmt=(npc,fact,variant,item,gate,tough)=>{npc.statements.push({id:'st'+npc.statements.length,fact,variant,item:item.id,gate,tough:!!tough,case:ci});};
    const ev=(...a)=>a; // helper
    for(const fact of FACTS){
      const f=F[fact];if(!f)continue;
      const dif=ci; // difficulty
      const g1={free:true},g2={trust:45},g3={evid:{facts:['HOW','WITNESS','EVENT','WHEN'],trust:35}},g4={evid:{facts:['HOW','WITNESS','WHO','COVER'],trust:50}};
      const dat=(npcRole)=>npcRole;
      // ---- VERI ----
      if(fact==='EVENT'){
        // chiunque ne parla: leggenda al bar, anziano, giornale
        const a=mk(fact,0,f.t,{type:'rumor',name:'Voci in paese',origin:'voci_'+ci},{keys:[],reveals:revealsFor(fact,0).concat([topicIds.case]),dur:.4});
        const b=mk(fact,0,f.t,{type:'npc',ref:O.id,name:O.name,origin:'t_'+O.id},{keys:[],reveals:revealsFor(fact,0).concat([topicIds.case,O.topic]),dur:.8});stmt(O,fact,0,b,g1);
        const cI=mk(fact,0,f.t,{type:'giornale',name:'La Gazzetta del '+Y,origin:'gaz'+ci},{keys:[topicIds.place,topicIds.year,topicIds.case],reveals:revealsFor(fact,0),invReq:0});
        // falsa leggenda
        if(f.l&&f.l[0]){const l=mk(fact,1,f.l[0],{type:'rumor',name:'Una leggenda diffusa',origin:'leg_'+ci},{reveals:[topicIds.case],dur:.4});cs.rumorPool=(cs.rumorPool||[]);}
        cs.rumorPool=(cs.rumorPool||[]).concat([a.id]);
        const lie=cs.items.map(i=>items[i]).find(i=>i.fact===fact&&i.variant===1);if(lie)cs.rumorPool.push(lie.id);
      }else if(fact==='WHEN'){
        mk(fact,0,f.t,{type:'archivio',name:'Registro comunale',origin:'reg'+ci},{keys:keysFor(fact),reveals:revealsFor(fact,0),invReq:0});
        const s=mk(fact,0,f.t,{type:'npc',ref:O.id,name:O.name,origin:'t_'+O.id},{reveals:[topicIds.year],dur:.7,gate:g2});stmt(O,fact,0,s,g2);
        mk(fact,0,f.t,{type:'oggetto',name:'Un orologio fermo / un calendario',origin:'ogg'+ci+fact},{reveals:[topicIds.year],where:{kind:'object',case:ci},mode:'note',invReq:dif>1?1:0});
        const l=mk(fact,1,f.l[0],{type:'giornale',name:'Un giornale locale',origin:'gazErr'+ci},{keys:[topicIds.place,topicIds.case],invReq:0});
      }else if(fact==='HOW'){
        mk(fact,0,f.t,{type:'oggetto',name:'Prova sul posto',origin:'ogg'+ci+fact},{where:{kind:'object',case:ci},invReq:dif>0?1:0});
        const s=mk(fact,0,f.t,{type:'npc',ref:X.id,name:X.name,origin:'t_'+X.id},{dur:1,gate:g2,reveals:[X.topic]});stmt(X,fact,0,s,g2,dif>1);
        mk(fact,0,f.t,{type:'archivio',name:'Perizia tecnica',origin:'per'+ci},{keys:[topicIds.place,topicIds.year],invReq:1+Math.min(1,dif)});
        const off=mk(fact,1,f.l[0],{type:'archivio',name:'Verbale ufficiale',origin:'ufficiale'+ci},{keys:[topicIds.place,topicIds.case],invReq:0,stars:5});
        const sA=mk(fact,1,f.l[f.l.length-1],{type:'npc',ref:A.id,name:A.name,origin:'ufficiale'+ci},{dur:1,reveals:[A.topic]});stmt(A,fact,1,sA,g1);
      }else if(fact==='WITNESS'){
        const s=mk(fact,0,f.t,{type:'npc',ref:W.id,name:W.name,origin:'t_'+W.id},{tq:f.tq,dur:1.4,gate:g2,reveals:[W.topic]});stmt(W,fact,0,s,g2);
        mk(fact,0,f.t,{type:'archivio',name:'Verbale di testimonianza (1° interrogatorio)',origin:'int'+ci},{keys:[topicIds.place,topicIds.W,topicIds.year],invReq:1+Math.min(1,dif),reveals:[W.topic]});
        const sL=mk(fact,1,f.l[0],{type:'npc',ref:W.id,name:W.name+' (prima versione)',origin:'ufficiale'+ci},{tq:f.lq[0],dur:1,reveals:[W.topic],stars:2});stmt(W,fact,1,sL,g1);
      }else if(fact==='WHO'){
        const s=mk(fact,0,f.t,{type:'npc',ref:X.id,name:X.name,origin:'t_'+X.id},{dur:1.6,gate:g3,reveals:[A.topic]});stmt(X,fact,0,s,g3,true);
        mk(fact,0,f.t,{type:'oggetto',name:'Una lettera o una fotografia nascosta',origin:'ogg'+ci+fact},{where:{kind:'object',case:ci,hard:true},invReq:1+Math.min(2,dif),reveals:[A.topic]});
        const sT=mk(fact,0,f.t,{type:'npc',ref:Z.id,name:Z.name,origin:'t_'+Z.id},{dur:1.1,gate:{evid:{facts:['HOW','WITNESS','COVER'],trust:55},trust:40},reveals:[A.topic]});stmt(Z,fact,0,sT,{evid:{facts:['HOW','WITNESS','COVER'],trust:55}},true);
        const sB=mk(fact,1,f.l[0],{type:'npc',ref:A.id,name:A.name,origin:'ufficiale'+ci},{dur:1,reveals:[B.topic]});stmt(A,fact,1,sB,g1);
        mk(fact,1,f.l[0],{type:'giornale',name:'Un articolo dell\'epoca',origin:'ufficiale'+ci},{keys:[topicIds.case,topicIds.place],reveals:[B.topic],stars:4});
      }else if(fact==='WHY'){
        mk(fact,0,f.t,{type:'archivio',name:'Un registro riservato',origin:'ris'+ci},{keys:[topicIds.A,topicIds.place],invReq:2+Math.min(1,dif),reveals:[A.topic]});
        const s=mk(fact,0,f.t,{type:'npc',ref:Z.id,name:Z.name,origin:'t_'+Z.id},{dur:1.4,gate:{evid:{facts:['WHO','HOW','COVER','WITNESS'],trust:60},trust:45},reveals:[]});stmt(Z,fact,0,s,{evid:{facts:['WHO','HOW','COVER','WITNESS'],trust:60}},true);
        f.l.forEach((lt,li)=>{const sB=mk(fact,1+li,lt,{type:li?'rumor':'npc',ref:B.id,name:li?'Voci in paese':B.name,origin:li?'voci_w'+ci:'ufficiale'+ci},{dur:.9});if(!li)stmt(B,fact,1+li,sB,g1);else cs.rumorPool.push(sB.id);});
      }else if(fact==='COVER'){
        mk(fact,0,f.t,{type:'oggetto',name:'Documento originale',origin:'ogg'+ci+fact},{where:{kind:'object',case:ci,hard:true},invReq:1+Math.min(2,dif)});
        const s=mk(fact,0,f.t,{type:'npc',ref:X.id,name:X.name,origin:'t_'+X.id},{dur:1.2,gate:g4,reveals:[]});stmt(X,fact,0,s,g4,true);
        mk(fact,1,f.l[0],{type:'archivio',name:'Copia ufficiale agli atti',origin:'ufficiale'+ci},{keys:[topicIds.case,topicIds.place],invReq:0,stars:5});
      }else if(fact==='AFTER'){
        mk(fact,0,f.t,{type:'archivio',name:'Catasto e atti di vendita',origin:'cat'+ci},{keys:[topicIds.A,topicIds.place,topicIds.org],invReq:1+Math.min(1,dif)});
        const s=mk(fact,0,f.t,{type:'npc',ref:W.id,name:W.name,origin:'t_'+W.id},{dur:1,gate:{trust:55},tq:null,reveals:[]});stmt(W,fact,0,s,{trust:55});
        const l=mk(fact,1,f.l[0],{type:'rumor',name:'Voci in paese',origin:'voci_a'+ci},{});cs.rumorPool.push(l.id);
      }else if(fact==='META'){
        mk(fact,0,f.t,{type:'archivio',name:'Atti societari',origin:'soc'+ci},{keys:[topicIds.A,'org',topicIds.place],invReq:2+Math.min(2,dif),reveals:['org'],imp:.9});
        const s=mk(fact,0,f.t,{type:'npc',ref:Z.id,name:Z.name,origin:'t_'+Z.id+'m'},{dur:1.2,gate:{evid:{facts:['WHO','COVER','WHY'],trust:70},trust:60},reveals:['org']});stmt(Z,fact,0,s,{evid:{facts:['WHO','COVER','WHY'],trust:70},trust:60},true);
      }
    }
    // frasi di facciata per gli NPC (voci e saluti)
    const flav=[`"Qui in paese si parla ancora di ${title.toLowerCase()}."`];
    [A,B,W,X,O,Z].forEach(n=>{n.chat.push(flav[0]);});
    cs.cast=[A,B,W,X,O,Z].map(n=>n.id);
    cases.push(cs);
  }
  // domande: testo
  for(const id in npcs){const n=npcs[id];n.statements.forEach(s=>{const cs=cases[s.case];s.q=FACT_Q[s.fact].replace('{org}',Org);});}
  return{cases,items,npcs,org:Org};
}
