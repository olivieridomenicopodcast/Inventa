'use strict';
/* RIMINI 3 GIORNI · "Marketers Pro" (community nell'app, tutta finta e generata dal gioco).
   Post e commenti sono procedurali e deterministici dal seme; le persone che incontri davvero nel gioco ti riconoscono. */

const CM_ABSENT=[
 'Beati voi che siete al #MW26! Io quest’anno non ce l’ho fatta a venire. Raccontatemi tutto.',
 'Guardo le storie da Rimini e mi mangio le mani. Il prossimo anno ci sono, promesso.',
 'Chi è al Marketers World? Fatemi sapere cosa vi porta a casa oggi, io seguo da lontano.',
 'Quest’anno niente Rimini per me: lavoro e scadenze. Beati voi!',
 'Se qualcuno prende appunti dei workshop, io offro un caffè virtuale 🙏',
 'Non ce l’ho fatta a venire al #MW26. Qualcuno mi racconta com’è l’Offworld?',
 'Invidia pura per chi è al Palacongressi oggi. Fate un saluto da parte mia!',
 'Dalla scrivania non è la stessa cosa. Beati voi che siete a Rimini! #MW26',
 'Ho il biglietto per l’anno prossimo già in testa. Oggi mi accontento delle vostre foto.',
 'Chiunque abbia visto qualche slide interessante: condividetela, vi prego!',
 'Giornata in ufficio mentre tutti sono a Rimini. Tengo duro con il caffè.',
 'Mi hanno detto che la Silent Stage è fantastica. Qualcuno mi dice com’è?',
 'Quest’anno ho dovuto rinunciare al #MW26. Mi consolo con i vostri aggiornamenti.',
 'Seguo il tag #MW26 da stamattina. Mi sembra di essere lì, ma senza il caffè.',
 'Un saluto a tutti i presenti da chi è rimasto a casa. Fate networking anche per me!',
 'Il vero dolore di non essere a Rimini: scoprire dopo cosa mi sono pers{o|a}.',
 'Se vi capita di incontrare qualcuno che lavora con me, salutatelo da parte mia. #MW26',
 'Il prossimo anno non mi frega nessuno: biglietto preso prima che escano. Intanto, beati voi!'];
const CM_PRE=[
 'Domani si parte: Rimini, Palacongressi, #MW26. Zaino pronto e batteria del telefono carica.',
 'Ultime ore prima del Marketers World. Chi c’è? Scrivetemi, ci incontriamo.',
 'Ho già salvato tre workshop nell’app. Il resto lo decido sul momento. #MW26',
 'Viaggio verso Rimini: playlist, caffè e un taccuino ancora vuoto.',
 'Quest’anno porto con me biglietti da visita veri. Sì, esistono ancora.',
 'Primo anno al Marketers World: ansia e curiosità in parti uguali. #MW26',
 'Scarpe comode: pront{o|a}. Powerbank: pront{o|a}. Coraggio per parlare con sconosciuti: quasi.',
 'Ho scaricato l’app dell’evento. Mi aspetto di perdermi tra le sale entro un’ora.',
 'Check-in all’hotel: sembra di essere in gita scolastica, ma per adulti. #MW26',
 'Mi sono segnato due workshop imperdibili e uno “vediamo”. Voi?',
 'Domani ci si vede al Palacongressi! Chi vuole un caffè prima dell’apertura?',
 'La valigia è piena di libri e vuota di vestiti, come sempre. #MW26',
 'Ho appena scritto sul taccuino: “parla con almeno cinque persone nuove”. Vediamo.',
 'In treno verso Rimini con altre trenta persone che sembrano andare allo stesso posto.'];
const CM_EVENT=[
 'Giorno {n} al Marketers World: i piedi chiedono pietà ma la testa è piena. #MW26',
 'Il Palacongressi pieno di gente che parla di lavoro con gli occhi che brillano. Energia pazzesca.',
 'Caffè, networking e un’altra chiacchierata che mi ha dato una dritta. Che bella gente. #MW26',
 'Silent Stage con le cuffie: strana, ma funziona. Consigliata.',
 'Appena finito «{title}»: tre spunti da riguardare con calma. #MW26',
 '«{title}» è stato più utile di quanto pensassi. Appunti salvati.',
 'Ho sbagliato sala due volte, ma ho conosciuto gente per strada. Il Palacongressi è un labirinto simpatico.',
 'Il Main Stage pieno è un colpo d’occhio. Pelle d’oca. #MW26',
 'Consiglio da primo giorno: scegliete i workshop nell’app, le sale si riempiono in fretta.',
 'Una coda lunghissima per il firmacopie: segno che i libri servono ancora.',
 'Scale mobili, ascensori e il mio senso dell’orientamento: oggi hanno vinto le scale mobili.',
 '«{title}»: ho preso così tanti appunti che la penna è finita prima della sessione.',
 'Chi sta andando a «{title}»? Mi siedo vicino alla porta, vi tengo un posto.',
 'Pausa pranzo al volo: panino in piedi e due contatti nuovi. Si chiama efficienza. #MW26',
 'La cosa più bella del Marketers World? Parlare con gente che fa il tuo stesso lavoro e lo capisce.',
 'Ho appena chiesto a uno sconosciuto cosa pensa dell’AI nel suo lavoro. Un’ora dopo eravamo ancora lì.',
 'Il caffè dell’Area networking è il vero punto d’incontro. #MW26',
 'Batteria del telefono al 9%: tra foto, mappa e app, è la risorsa più preziosa dell’evento.',
 'Ho messo un like a metà dei post di #MW26. L’altra metà li metto domani.',
 'Qualcuno sa dove si trova la sala dopo «{title}»? Ho solo la mappa e tanta speranza.',
 'Mi hanno consigliato un workshop che non avevo segnato: ora sono content{o|a} di aver cambiato idea.',
 'Non pensavo che una sessione sulla «noia» mi desse tanta energia. #MW26',
 'Sala piena, aria condizionata che non ce la fa, ma nessuno se ne va. Questo dice tutto.',
 'L’app dice che sono in sala, il mio stomaco dice che è ora di pranzo. Vince lo stomaco.',
 'Ho conosciuto una persona che fa il mio stesso mestiere a mille chilometri da me. Il mondo è piccolo.',
 'Foto dal Main Stage: la mia è venuta mossa, ma l’emozione era reale. #MW26',
 'Il mio taccuino ha già tre pagine di cose da fare lunedì.',
 'Oggi ho scoperto che la sala al primo piano ha il WiFi migliore. Informazione preziosa.',
 'Pausa in Area networking: meglio di qualsiasi workshop, e non lo dico per cattiveria. 😅',
 'Ho appena sentito una frase che mi cambia la settimana. Poi ve la racconto. #MW26',
 'Fila per il caffè: il momento più democratico dell’evento.'];
const CM_MORNING=['Ore 9: già in coda per entrare. Che bella energia, non pensavo.','Colazione veloce e via, la prima sessione inizia presto. #MW26','Buongiorno Rimini! Il Palacongressi si sveglia e noi con lui.'];
const CM_AFTER=['Il pomeriggio è il momento in cui l’attenzione cala. Io resisto con il caffè.','Terza sessione di fila: la testa è piena, il taccuino anche.','Pausa pomeridiana: due chiacchiere e una cioccolata dal distributore.'];
const CM_EVE0=['Stasera Offworld al Village: karaoke e zero vergogna. #MW26','Giornata piena, serata ancora più piena. Ci vediamo al Village! #Offworld','Dopo una giornata così, la serata è tutta da ballare. #MW26','Chi viene stasera all’Offworld? Prometto di non cantare. (Non è vero.)'];
const CM_LAST=['Ultimo giorno: nostalgia già prima di salutarci. #MW26','Ultimi saluti, ultimi contatti scambiati. Grazie a chi ha reso questi giorni speciali.','Tornerò a casa con la testa piena di idee e il telefono pieno di nuovi contatti.','Il Marketers World finisce, ma le idee restano: adesso tocca metterle in pratica.','Tre giorni dopo: stanc{o|a} mort{o|a} e felicissim{o|a}. #MW26','Grazie a tutti quelli che ho incontrato: mi avete regalato un sacco di spunti.'];
const CM_Q=[
 'Che strumento AI usate ogni giorno nel lavoro? Io sto provando a ridurre i passaggi manuali.',
 'Freelance o agenzia nel 2026? Voi come la vedete?',
 'Quante volte a settimana postate su LinkedIn? Io sono ferm{o|a} a una e mi sento in colpa.',
 'Podcast in video o solo audio? Mi serve un parere onesto.',
 'Qual è la cosa più utile che avete imparato quest’anno? Io: documentare tutto.',
 'Newsletter o social: se dovete scegliere un canale solo, quale?',
 'Voi i report ai clienti come li fate? Slide, dashboard o vocale?',
 'Come gestite i clienti che non rispondono mai? Io ho due mail ferme da una settimana.',
 'Qual è il vostro rapporto con le call? Meno ne faccio, meglio lavoro.',
 'Quanto tempo dedicate alla formazione ogni settimana? Io sono a un’ora, mi pare poco.',
 'Meglio un tool unico o tanti strumenti collegati? Dubbio quotidiano.',
 'Chi usa ancora i fogli di calcolo per gestire i progetti? Alzi la mano.',
 'Come si prezza un lavoro di cui non si conosce la durata? Consigli?',
 'Il vostro miglior consiglio per chi comincia oggi nel nostro mestiere?',
 'Voi pianificate i contenuti con un mese di anticipo o improvvisate?',
 'Che podcast ascoltate in treno? Ne cerco di nuovi.',
 'Ha senso aprire un nuovo canale social nel 2026? Mi piacerebbe un parere.',
 'Quando dite no a un cliente? Io faccio fatica.',
 'Come tenete in ordine le idee? Io ho dodici taccuini e nessun sistema.',
 'Quanto conta la formazione in presenza rispetto ai corsi online? Per me tantissimo.',
 'Se doveste dare un consiglio a voi stessi di un anno fa, quale sarebbe?',
 'Avete già provato ad automatizzare le email di follow-up? Come è andata?',
 'Quale libro di marketing consigliereste a qualcuno che parte da zero?',
 'Come si convince un cliente a investire in contenuti di qualità? Sono a corto di argomenti.'];
const CM_GEN=['Concordo!','Bella osservazione, grazie per averla condivisa.','Interessante, ci pensavo proprio oggi.','Io la penso un po’ diversamente, ma il punto è valido.','Salvato, lo provo la prossima settimana.','Questa è oro 🙌','Lo giro al mio team.','Top. Aggiungo: misurate sempre i risultati.','Ci vediamo al prossimo Marketers!','Grazie per averlo scritto, mi ci ritrovo molto.','Ottimo spunto per il mio lavoro.','Complimenti, continua così!',
 'Mi hai fatto venire un’idea. Grazie!','Esattamente quello che stavo pensando.','Detto meglio di come l’avrei detto io.','Posso citarti nel mio prossimo post?','Piccolo dettaglio che cambia tutto. Complimenti!','Ci ragiono su e ti faccio sapere.','Lo stampo e lo attacco in ufficio.','Parole sante.','Mi hai strappato un sorriso, grazie.','Segnato sul taccuino.','Sono d’accordo al 90%, ma sul resto ne parliamo di persona.','Bellissimo spunto, soprattutto l’ultima parte.','Questo andrebbe letto da tanti.','Condivido volentieri.','Posso farti una domanda in privato?','Sono d’accordo, ma bisogna anche saperlo fare.','Ottima sintesi.','Sempre sul pezzo!','Ne parlavo proprio ieri con un collega.','Che bella la community di Marketers Pro.','Mi iscrivo al tuo club di persone sensate.','Grazie, mi serviva proprio oggi.','Utilissimo, grazie!','Ci metto un cuore e torno a lavorare. ❤️','Mi sa che ti seguo.','Il tuo punto di vista è sempre una boccata d’aria.','Sembra facile, ma non lo è affatto.','Lo proverò e ti racconto com’è andata.','Aggiungo solo: fatelo con calma.','Ottimo promemoria per tutti noi.','Interessante, non ci avevo mai pensato.','Il mio capo dovrebbe leggere questo.','Le cose semplici sono le più difficili da fare bene.','Ho riso e imparato. Che combinazione!','Pensa che io faccio il contrario e funziona a metà.','Chapeau.','Grazie per la dritta, la applico domattina.','Qui dentro si impara più che ai webinar.','Spunto prezioso, soprattutto per chi comincia.'];
const CM_ANS=['Io uso un paio di strumenti e un controllo umano a fine giornata.','Dipende da cosa vuoi ottenere, ma io partirei dal più semplice.','Ci ho appena provato: funziona meglio con regole chiare.','Una volta a settimana, ma fatta bene.','Per me meglio un solo canale e farlo benissimo.','Prova entrambe e guarda i numeri dopo un mese.',
 'Io ho risolto con un modello di mail e un promemoria a tre giorni.','Per me la risposta è: dipende dal cliente. Ma sempre per iscritto.','Ho smesso di cercare lo strumento perfetto: uso quello che ho e lo faccio bene.','Un’ora a settimana è un buon inizio. L’importante è non saltarla.','Meglio poche cose fatte con costanza che tante fatte a caso.','Parto sempre dal problema, poi vedo cosa serve.','Io ho provato e non mi ha convinto, ma vale la pena fare un test.','Parlane con tre colleghi: ti daranno tre risposte diverse e una verità.','Io i libri li ascolto: audiolibro mentre cammino.','Per me il segreto è dire di no una volta all’anno, a un cliente che ti sta stretto.','Dipende dal budget, ma in generale provo a fare prima in piccolo.','Se un cliente non risponde mai, di solito è un segnale. Io smetto di inseguirlo.','Io ho cominciato con un taccuino. Poi sono passato alle note digitali, ma non ho smesso di scrivere a mano.','Ho provato in tutti i modi: la cosa che funziona è fissare data e ora.'];
const CM_REACT_ABS=['Beati voi che siete lì!','Quanto mi piacerebbe esserci, il prossimo anno ci sono.','Fatemi sapere com’è, io seguo da lontano.','Invidia pura, godetevela!','Io sono a casa a guardare le storie. Beati voi!','Mi mangio le mani per non esserci.','Divertitevi anche per me!','Prima o poi ci vengo anch’io, intanto grazie per gli aggiornamenti.','Aspettiamo i riassunti con ansia da casa.','Mi siete mancati in sala: alla prossima!','Voglio un resoconto dettagliato, eh!','Che bello leggervi da lontano, quasi come esserci.'];
const CM_REACT_ATT=['Ci vediamo domani in sala!','Io ero lì, bellissima sessione.','Ci incontriamo all’Area networking?','Anch’io ho preso appunti, te li giro.','Io sono al primo piano: se passi mi fai un cenno!','Anche io, la sala era piena fino in fondo.','Ero a due file da te e non ti ho riconosciuto: la prossima volta ci salutiamo.','Ti ho visto in coda al caffè: sei sempre in movimento!','Ci sentiamo dopo cena, magari all’Offworld.','Sala bellissima, speaker ancora meglio.','Anch’io, il Palacongressi è una piccola città.','Domani ci rivediamo per il workshop del mattino?','Io sono in Area networking, ti aspetto lì.','Ci siamo incrociati proprio al varco!'];
const CM_FAM={
 creator:['Dal mio punto di vista, i contenuti vincono quando raccontano una persona.','Sul fronte contenuti: prima l’idea, poi la forma.','Per chi fa contenuti, la costanza è tutto.','Registro tutto, poi taglio. È la regola.','La storia batte la tecnica, quasi sempre.'],
 design:['Dal lato del design: meno elementi, più chiarezza.','Quando guardo un layout controllo sempre prima la gerarchia.','Un buon design si nota quando manca.','Colori e spazi dicono molto più delle parole.','Ci vuole sempre un occhio esterno, anche nel design.'],
 social:['Sui social la regola d’oro: rispondere alle persone.','Il tono di voce fa il 50% del lavoro.','Community vuol dire presenza, non solo contenuti.','Un buon commento vale più di mille like.','Parlare con le persone, non alle persone.'],
 perf:['Prima di tutto: i numeri. Poi le opinioni.','Se non lo misuri non esiste. È un mantra ma funziona.','Test piccolo, decisione veloce.','Io guardo sempre il costo per risultato.','Un’ipotesi chiara vale più di tre dashboard.'],
 tech:['Sul fronte tecnico: automatizzare solo ciò che già funziona a mano.','Prima capire il processo, poi costruire lo strumento.','Un prototipo brutto batte un progetto perfetto mai realizzato.','Con l’AI il collo di bottiglia siamo sempre noi, e va bene così.','Documentate tutto: il futuro voi ringrazierà.'],
 strat:['Visione d’insieme: senza strategia è solo attività.','Chiedetevi sempre “e quindi?”. Cambia tutto.','Priorità, priorità, priorità.','Una buona strategia dice anche cosa non fare.','Pochi obiettivi, ben chiari.'],
 biz:['Dal punto di vista di chi fa impresa: fate le cose, poi perfezionate.','I clienti sono il miglior consulente che avrete mai.','Un’attività vive di relazioni e di cassa.','Vendere è un servizio, non un favore.','Partite piccoli, ma partite.'],
 edu:['Dal punto di vista di chi forma: nessuno impara guardando. Si impara facendo.','Una domanda ben posta vale una lezione.','Ogni errore è materiale didattico.','Crescere è un mestiere che si fa in due.','Il feedback onesto è un regalo.']};
const CM_WARM=['Che bello averti incontrato al #MW26, {me}!','Mi ha fatto davvero piacere conoscerti di persona.','Ci siamo conosciuti oggi: bella chiacchierata, ci sentiamo!','È stato un piacere incontrarti, {me}!','Ricordo bene la chiacchierata di oggi: teniamoci in contatto 🙌','{me}! Ci siamo visti proprio oggi. Grazie ancora per il confronto.','Mi ha fatto piacere incontrarti al #MW26. Scrivimi quando vuoi.','Piacere di averti conosciuto, {me}: hai un modo di ragionare che mi ha dato spunti.','Mi sei rimast{O|A} in mente dopo la chiacchierata, {me}. Facciamo qualcosa insieme?','Grazie per il tempo di oggi, {me}: è stato un incontro che non mi aspettavo.','Ti ho visto qui sopra e mi sono ricordato subito di te. Bella conoscenza!','Quando ci vediamo la prossima volta il caffè lo offro io, {me}.','Sei una delle belle sorprese di questo #MW26.','Se vuoi continuare la conversazione di oggi, io ci sono.'];
const CM_REPLY=['Grazie del commento, {me}!','Esatto, hai colto il punto.','Ci ragiono e ti rispondo meglio più tardi.','Bella domanda, {me}: dipende da molte cose.','Concordo, ma proverei anche l’altra strada.','Mi fa piacere che ti sia utile!','Ci vediamo in giro e ne parliamo.','Hai ragione, non ci avevo pensato.','Grazie! Se vuoi ne parliamo in privato.','Capisco il tuo punto di vista.','Sì, anch’io la penso così.','Ottimo, fammi sapere come va.'];
const CM_METPOST=['Oggi ho conosciuto {me} al #MW26, {job}: bellissima chiacchierata. Ne riparliamo presto!','Tra le persone più interessanti incontrate oggi: {me}. Segnatevi il nome. #MW26','Una chiacchierata con {me} ({job}) mi ha dato idee nuove. Il Marketers World serve a questo.','Ho incontrato {me}, {job}, e abbiamo parlato di tutto tranne che del tempo. Che bella gente.','Mi era venuta una domanda: l’ho fatta a {me} ({job}). Risposta migliore del previsto. #MW26','Se cercate un confronto onesto sul lavoro, parlate con {me}. Ve lo dice chi l’ha appena fatto.'];
const CM_COMPOSE=['Sono a Rimini per il #MW26: chi c’è?','Che energia al Palacongressi! #MW26','Primo workshop fatto: spunti a pioggia.','Consiglio del giorno: scrivete tutto nel taccuino.','Cerco qualcuno con cui parlare di {job} all’Area networking.','Silent Stage provata: strana ma bellissima.','Sto cercando di capire come si arriva al primo piano. Consigli?','Una sola cosa da portare a casa oggi: scelgo quella che segno per ultima.'];

const cmT=()=>G.day*1440+Math.floor(G.min);
function cmInit(){return{liked:{},posts:[],cm:{},metT:{},seenT:0,notifT:0,pid:0,lv:1};}
function cmEnsure(){if(!G.comm)G.comm=cmInit();return G.comm;}
function cmMetNote(name){cmEnsure().metT[name]=cmT();}
function cmRel(a,T){const d=T-a;if(d<1)return 'adesso';if(d<60)return Math.floor(d)+' min fa';if(d<1440)return Math.floor(d/60)+' h fa';const g=Math.floor(d/1440);return g===1?'ieri':g+' g fa';}
const cmPick=(r,a)=>a[Math.floor(r()*a.length)];

/* membri della community (finti) */
function cmMembers(){
  if(G._cmM&&G._cmM.k===G.seed)return G._cmM.v;
  const r=mulberry32(hashStr(G.seed+'|members')),used=new Set(),out=[];
  for(let i=0;i<90;i++){let nm;do{nm=cmPick(r,ATT_FIRST)+' '+cmPick(r,ATT_LAST);}while(used.has(nm));used.add(nm);
    const jb=cmPick(r,JOBS);out.push({id:'m'+i,name:nm,job:jb[0],fam:jb[1],city:cmPick(r,ATT_CITY),absent:r()<.3,gender:genderOf(nm),pal:facePal(nm,genderOf(nm))});}
  G._cmM={k:G.seed,v:out};return out;
}
/* post programmati nei tre giorni (e il giorno prima) */
function cmPool(){
  if(G._cmP&&G._cmP.k===G.seed+'|'+PLAYER.job)return G._cmP.v;
  const r=mulberry32(hashStr(G.seed+'|pool')),M=cmMembers(),out=[],usedP=new Set(),N=110,start=-1500,end=2*1440+1400;
  const titles=[0,1,2].map(d=>PROGRAMMA.filter(e=>e.d===d&&(e.kind==='ws'||e.kind==='talk')&&e.title.length<70));
  for(let i=0;i<N;i++){
    const at=Math.round(start+(end-start)*(i+r()*.8)/N),m=M[Math.floor(r()*M.length)],day=Math.max(0,Math.floor(at/1440)),mn=((at%1440)+1440)%1440;
    let text,kind='ev',q=false;
    for(let tr=0;tr<10;tr++){
      if(m.absent&&r()<.75){text=cmPick(r,CM_ABSENT);kind='abs';}
      else if(at<525){text=cmPick(r,CM_PRE);kind='pre';}
      else{
        const x=r();
        if(x<.2){q=true;kind='q';text=cmPick(r,CM_Q);}
        else if(x<.4){kind='tip';const f=JOBFAM[m.fam];text='Consiglio da '+m.job.toLowerCase()+': '+cmPick(r,TIPS[cmPick(r,f.tip)]);}
        else{
          const pool=day===2&&mn>900&&r()<.5?CM_LAST:day===0&&mn>1080&&r()<.5?CM_EVE0:mn<600&&r()<.35?CM_MORNING:(mn>840&&mn<1080&&r()<.3)?CM_AFTER:CM_EVENT;
          const e=titles[day][Math.floor(r()*titles[day].length)];
          text=cmPick(r,pool).replace('{n}',day+1).replace('{title}',e?e.title:'un workshop');
        }
      }

      if(!usedP.has(text))break;
    }
    usedP.add(text);
    out.push({id:'c'+i,at,m,text,kind,q});
  }
  out.sort((a,b)=>a.at-b.at);G._cmP={k:G.seed+'|'+PLAYER.job,v:out};return out;
}
/* persone incontrate davvero nel gioco (kind att) come "membri" riconoscibili */
function cmMetPeople(){
  const C=cmEnsure();return G.contacts.filter(c=>c.kind==='att'&&C.metT[c.name]!=null).map(c=>{const [job,city]=(c.role||'').split(' · '),jb=jobFind(job);
    return{id:'k'+hashStr(c.name),name:c.name,job:job||'Partecipante',fam:jb?jb[1]:'strat',city:city||'',met:true,at:C.metT[c.name],gender:c.gender||genderOf(c.name),pal:c.p||facePal(c.name,c.gender||genderOf(c.name))};});
}
const cmFill=(s,extra)=>s.replace('{me}',pname()).replace('{job}',(extra&&extra.job)||ME().job);
/* commenti di un post (del pool o mio): deterministici, ordinati nel tempo */
function cmComments(p,mine){
  const C=cmEnsure(),r=mulberry32(hashStr(G.seed+'|cm|'+p.id)),M=cmMembers(),met=mine?cmMetPeople().filter(x=>x.at<=p.at):[],out=[],usedT=new Set(),usedW=new Set();
  const n=mine?2+Math.floor(r()*4):p.q?2+Math.floor(r()*4):Math.floor(r()*4);
  let t=p.at;const warm=met.slice().sort(()=>r()-.5).slice(0,Math.min(3,met.length));
  for(let i=0;i<n;i++){
    t+=mine?4+Math.floor(r()*28):6+Math.floor(r()*70);
    let who,text,isMet=false;
    if(mine&&warm[i]){who=warm[i];text=(typeof extrasWarm==='function'&&extrasWarm(who,r))||cmFill(cmPick(r,CM_WARM));isMet=true;}
    else{let g2=0;do{who=cmPick(r,M);}while((who===p.m||usedW.has(who.id))&&g2++<12);
      for(g2=0;g2<12;g2++){
        const x=r();
        text=who.absent&&x<.5?cmPick(r,CM_REACT_ABS):p.q&&!mine&&x<.7?cmPick(r,CM_ANS):x<.3?cmPick(r,CM_FAM[who.fam]||CM_GEN):x<.5?cmPick(r,CM_REACT_ATT):cmPick(r,CM_GEN);
        if(!usedT.has(text))break;}}
    usedT.add(text);if(who&&who.id)usedW.add(who.id);
    out.push({id:p.id+'_'+i,at:t,who,text,met:isMet});
  }
  if(mine&&C.selfLike&&C.selfLike[p.id]!=null){const w2=cmPick(mulberry32(hashStr(G.seed+'|sl|'+p.id)),M);out.push({id:p.id+'_sl',at:C.selfLike[p.id]+5,who:w2,text:'Mettersi il like al proprio post è come darsi il cinque da soli.',met:false});}
  return out;
}
/* risposte alle mie commenti */
function cmReplies(){
  const C=cmEnsure(),out=[];
  for(const pid in C.cm)for(const c of C.cm[pid]){const r=mulberry32(hashStr(G.seed+'|rp|'+c.id));if(r()<.25)continue;
    const M=cmMembers(),who=cmPick(r,M);out.push({id:'r'+c.id,pid,at:c.at+8+Math.floor(r()*24),who,text:cmFill(cmPick(r,CM_REPLY.concat(CM_GEN)),null),to:c.id});}
  return out;
}
/* feed visibile: pool + post degli incontrati + miei */
function cmFeed(T,onlyMine,pin,noExtras,full){
  const C=cmEnsure(),items=[];
  for(const p of cmPool())if(p.at<=T)items.push(Object.assign({},p,{mine:false}));
  if(!onlyMine)items.push(...cmThanks(T).map(n=>Object.assign({},n,{mine:false,q:false})));
  if(!onlyMine)items.push(...cmLates(T).map(n=>Object.assign({},n,{mine:false,q:false})));
  if(!onlyMine)items.push(...cmNoShows(T).map(n=>Object.assign({},n,{mine:false,q:false})));
  cmMetPeople().forEach((m,i)=>{const r=mulberry32(hashStr(G.seed+'|mp|'+m.name));if(i>5)return;
    items.push({id:'k_'+m.id,at:m.at+25,m,text:cmFill(cmPick(r,CM_METPOST),{job:ME().job}).replace('{job}',ME().job),kind:'met',q:false,mine:false});});
  const me={id:'me',name:pname(),job:ME().job,fam:ME().fam,pal:playerLook(),me:true};
  for(const p of C.posts)items.push({id:p.id,at:p.at,m:me,text:p.text,img:p.img||null,kind:'mine',mine:true});
  if(typeof extrasFeed==='function'&&!onlyMine&&!noExtras)items.push(...extrasFeed(T));
  const all=items.filter(x=>x.at<=T&&(!onlyMine||x.mine)).sort((a,b)=>b.at-a.at),out=full?all:all.slice(0,onlyMine?200:40);
  if(pin&&!out.some(x=>x.id===pin)){const f=all.find(x=>x.id===pin);if(f)out.unshift(f);}
  return out;
}
function cmView(p,T){
  const C=cmEnsure(),base=p.mine?cmComments(p,true):p.kind==='met'?[]:p.kind==='noshow'?cmReactComments(p,CM_INDIG):p.kind==='late'?cmReactComments(p,CM_TEASE):p.kind==='thanks'?cmReactComments(p,CM_THX_R):cmComments(p,false),mine=(C.cm[p.id]||[]).map(c=>({id:c.id,at:c.at,who:{name:pname(),me:true,pal:playerLook()},text:c.text,me:true}));
  const reps=cmReplies().filter(x=>x.pid===p.id).map(x=>({id:x.id,at:x.at,who:x.who,text:x.text}));
  const all=[...base,...mine,...reps].filter(c=>c.at<=T).sort((a,b)=>a.at-b.at);
  const r=mulberry32(hashStr(G.seed+'|lk|'+p.id)),cap=p.mine?3+Math.floor(r()*6)+cmMetPeople().length*3:4+Math.floor(r()*40);
  const likes=Math.min(cap,Math.floor(Math.max(0,T-p.at)/(p.mine?9:25)*(1+r())))+(C.liked[p.id]?1:0);
  return{comments:all,likes};
}
/* attività sui miei contenuti, per le notifiche */
function cmPostText(pid){const C=cmEnsure(),m=C.posts.find(p=>p.id===pid);if(m)return m.text;const q=cmPool().find(p=>p.id===pid);if(q)return q.text;const k=cmFeed(cmT(),false,null,true).find(p=>p.id===pid);return k?k.text:'';}
function cmActivity(T){
  const C=cmEnsure(),out=[];
  for(const p of C.posts)for(const c of cmComments(p,true))if(c.at<=T)out.push({id:c.id,type:'comment',at:c.at,met:c.met,who:c.who,text:c.text,pid:p.id,ptext:p.text});
  for(const n of cmThanks(T))out.push({id:n.id+'_a',type:'noshow',at:n.at,met:false,who:n.who,text:n.text,pid:n.id,ptext:'il tuo favore'});
  for(const n of cmLates(T))out.push({id:n.id+'_a',type:'noshow',at:n.at,met:false,who:n.who,text:n.text,pid:n.id,ptext:'il tuo ritardo alla festa'});
  for(const n of cmNoShows(T))out.push({id:n.id+'_a',type:'noshow',at:n.at,met:false,who:n.who,text:n.text,pid:n.id,ptext:'il meeting saltato'});
  for(const x of cmReplies())if(x.at<=T)out.push({id:x.id,type:'reply',at:x.at,met:false,who:x.who,text:x.text,pid:x.pid,ptext:cmPostText(x.pid)});
  return out;
}
function cmLikesNotes(T){const C=cmEnsure(),out=[];for(const p of C.posts){const n=cmView({id:p.id,at:p.at,mine:true,m:{}},T).likes;if(n>0)out.push({id:'lk_'+p.id,type:'like',at:p.at+10,count:n,pid:p.id,ptext:p.text});}return out;}
/* meeting saltati: chi ti ha aspettato 10 minuti si lamenta su Marketers Pro */
const CM_NOSHOW=['Ho aspettato dieci minuti all’Area networking e {me} non si è presentat{O|A}. Dare buca così non è il massimo. #MW26','Meeting fissato, meeting saltato: {me} non si è presentat{O|A}. Io ero lì con il caffè in mano.','Quando dici sì a un incontro e poi sparisci… {me}, ci siamo capiti. #networking','Dieci minuti di attesa, zero messaggi da {me}. Il networking è anche rispetto del tempo degli altri.','Un consiglio a chi viene al #MW26: se accetti un meeting, presentati. Io oggi ho aspettato {me} per niente.','Il mio meeting delle {ora} con {me} non c’è stato: non si è visto. Pazienza, ma lo segno.','Mai dare buca a un meeting: il mondo del marketing è piccolo e le community ancora di più. Parlo di {me}.','Ho trattenuto la delusione per dieci minuti, poi sono andat{o|a} via. Il meeting con {me} è saltato.'];
/* arrivo in ritardo alla serata del Village: alcuni membri lo fanno notare */
const CM_LATE=['La festa è già cominciata e manca solo {me}. Ritardatari si nasce. 😅 #Offworld','Qualcuno ha visto {me}? La navetta delle 22 è partita e lo ha riportato indietro per i capelli.','Premio ritardatario della serata a {me}: arrivat{O|A} quando il microfono era già caldo. #MW26','Alle 22 puntuali al Village, tranne {me}. Ti perdoniamo, ma offri il primo giro.','«Dieci minuti e arrivo» ‑ {me}, alle 22:00 in punto, in navetta all’ultimo secondo.'];
function cmLate(day){
  const C=cmEnsure();if(!C.late)C.late=[];if(C.late.some(x=>x.day===day))return;
  const r=mulberry32(hashStr(G.seed+'|late|'+day)),M=cmMembers(),base=cmT()+4;
  for(let i=0;i<3;i++)C.late.push({id:'l'+day+'_'+i,day,at:base+i*7+Math.floor(r()*6),k:(Math.floor(r()*CM_LATE.length)+i)%CM_LATE.length,mid:M[Math.floor(r()*M.length)].id});
}
const cmLates=T=>(cmEnsure().late||[]).filter(x=>x.at<=T).map(x=>{const m=cmMembers().find(q=>q.id===x.mid)||cmMembers()[0];return{id:'lt_'+x.id,at:x.at,m,text:gxf(cmFill(CM_LATE[x.k]),m.gender),kind:'late',who:m};});
const CM_INDIG=['Ma davvero? Che maleducazione.','Dare buca così non si fa.','Succede, ma almeno avvisare…','Io ci sarei rimasto malissimo al posto tuo, {first}.','Il tempo degli altri vale quanto il proprio.','Solidarietà! Anche a me è capitato, mai più.','Poteva almeno mandare un messaggio, no?','Brutta storia. Il networking vive di parola data.','Mai più meeting con chi non si presenta.','Che peccato, {first}: la prossima volta scegli un orario più comodo.','Inaccettabile. Ma la community sa chi è, eh.'];
const CM_TEASE=['Ahahah, il ritardatario ufficiale!','Il classico ritardo da navetta.','Lo sapevamo tutti.','La festa non è festa senza di te, ma nemmeno senza orologio.','Ti aspettavamo con il karaoke già acceso!','Prossima volta sveglia presto, ritardatario!'];
function cmReactComments(p,pool){
  const r=mulberry32(hashStr(G.seed+'|ic|'+p.id)),M=cmMembers(),n=2+Math.floor(r()*4),out=[],first=(p.m&&p.m.name||'').split(' ')[0];let t=p.at;
  for(let i=0;i<n;i++){t+=3+Math.floor(r()*30);const who=cmPick(r,M);out.push({id:p.id+'_i'+i,at:t,who,text:cmPick(r,pool).replace('{first}',first)});}
  return out;
}
const CM_MEETRE=/(facciamo qualcosa|qualcosa insieme|prendiamo un caff|ne riparliamo|ci sentiamo|ci vediamo|collaboriamo|collaborare|incontriamoci|ne parliamo di persona|continuare la conversazione|teniamoci in contatto)/i;
function cmNoShow(m){
  const C=cmEnsure(),pe=G.people.find(x=>x.id===m.pid);if(!pe)return;if(!C.noshow)C.noshow=[];
  const r=mulberry32(hashStr(G.seed+'|ns|'+m.pid+'|'+m.day+'|'+m.start));
  C.noshow.push({id:'n'+C.noshow.length+m.pid,pid:m.pid,at:cmT()+6+Math.floor(r()*14),k:Math.floor(r()*CM_NOSHOW.length),ora:hm(m.start)});
  A.blip();toast('🙄 '+pe.name.split(' ')[0]+' ti ha aspettato dieci minuti e se n’è andat'+(pe.gender==='f'?'a':'o')+'. Potrebbe lamentarsi su Marketers Pro…',4200);
}
const CM_THX={coffee:['Grazie {me} per il caffè salvavita di oggi al #MW26!','Un grazie a {me}: mi ha portato l’espresso giusto al momento giusto.'],lost:['Grazie {me}: ha ritrovato il mio {obj} e mi ha salvato la giornata. #MW26','Un applauso a {me}, che mi ha riportato il {obj} che davo per perso!'],intro:['Grazie {me} per avermi fatto conoscere la persona giusta al #MW26.','Un grazie a {me}: mi ha fatto da tramite e adesso abbiamo un caffè in programma.']};
const CM_THX_R=['Che bel gesto, {first}!','Il bello del #MW26 è anche questo.','Applausi.','Ecco, queste sono le persone che vogliamo in community.','Grazie, {first}, per aver aiutato!'];
const cmThanks=T=>(cmEnsure().thanks||[]).filter(x=>x.at<=T).map(x=>{const pe={id:'th_'+hashStr(x.name),name:x.name,job:x.job,gender:x.gender,pal:x.pal||facePal(x.name,x.gender)},pool=CM_THX[x.type]||CM_THX.coffee,r=mulberry32(hashStr('thx|'+x.id));
  return{id:'th_'+x.id,at:x.at,m:pe,text:gxf(cmFill(cmPick(r,pool).replace('{obj}',x.obj||'oggetto')),x.gender),kind:'thanks',who:pe};});
const cmNoShows=T=>(cmEnsure().noshow||[]).filter(x=>x.at<=T).map(x=>{const pe=G.people.find(p=>p.id===x.pid)||{name:'?',job:'',gender:'m'};return{id:'ns_'+x.id,at:x.at,m:pe,text:gxf(cmFill(CM_NOSHOW[x.k].replace('{ora}',x.ora)),pe.gender),kind:'noshow',who:pe};});
const cmUnread=T=>cmActivity(T).filter(a=>a.at>cmEnsure().seenT).length;
const cmHasMetComment=T=>cmActivity(T).some(a=>a.met);
function cmNotify(){
  const C=cmEnsure(),T=cmT();if(!G.flags.app)return;if(T-C.notifT<2)return;
  const n=cmActivity(T).filter(a=>a.at>C.notifT).length;C.notifT=T;
  if(n&&phoneTab!=='comm')toast('Marketers Pro: '+n+(n>1?' nuove interazioni':' nuova interazione')+' con i tuoi contenuti',2800);
}
const cmHL=s=>esc(s).replace(/(#[\wÀ-ÿ]+|@[\wÀ-ÿ]+)/g,'<span class="hl">$1</span>');
let cmOpen={},cmMine=false,cmAlbum=false,cmNotif=false,cmPin=null,cmHi=null,cmPerson=null;
/* ---------- punti e livelli di Marketers Pro: 1 Mi piace ricevuto = 1 punto; tutti partono dal livello 1 ---------- */
const CM_LV=['Osservatore','Apprendista','Iniziato','Custode','Sciamano','Profeta','Alchimista','Oracolo','Illuminato'];
const CM_TH=[0,6,14,22,35,50,70,95,120];            // punti per raggiungere i livelli 1..9 (fasce piccole)
const CM_T0=495,CM_TEND=2*1440+1400;
const cmRamp=T=>Math.pow(Math.max(0,Math.min(1,(T-CM_T0)/(CM_TEND-CM_T0))),.65);
function cmLvOf(pt){let l=0;for(let i=0;i<CM_TH.length;i++)if(pt>=CM_TH[i])l=i;return l+1;}
function cmLikesLite(p,T){const r=mulberry32(hashStr(G.seed+'|lk|'+p.id)),cap=4+Math.floor(r()*40);return Math.min(cap,Math.floor(Math.max(0,T-p.at)/25*(1+r())));}
function cmInfl(key){const r=mulberry32(hashStr(G.seed+'|infl|'+key)),x=r();return x<.3?.25+r()*.35:x<.75?.7+r()*.8:x<.93?1.4+r()*.9:2.2+r()*1.3;}
function cmPtsMap(T){
  if(G._cmPt&&G._cmPt.T===T&&G._cmPt.s===G.seed)return G._cmPt.v;
  const ramp=cmRamp(T),v={},sums={};
  for(const p of cmPool())if(p.at<=T)sums[p.m.id]=(sums[p.m.id]||0)+cmLikesLite(p,T);
  for(const m of cmMembers()){const r=mulberry32(hashStr(G.seed+'|base|'+m.id));v[m.id]=Math.floor((((sums[m.id]||0))+Math.floor(r()*r()*18))*cmInfl(m.id)*ramp);}
  G._cmPt={T,s:G.seed,v};return v;
}
function cmMyPts(T){const C=cmEnsure(),key=T+'|'+C.posts.length+'|'+Object.keys(C.liked).length+'|'+G.seed;if(G._cmMy&&G._cmMy.k===key)return G._cmMy.v;let n=0;for(const p of C.posts)n+=cmView({id:p.id,at:p.at,mine:true,kind:'mine',m:{me:true}},T).likes;G._cmMy={k:key,v:n};return n;}
function cmPtsOf(w,T){
  if(!w)return 0;if(w.me)return cmMyPts(T);
  const M=cmPtsMap(T);if(w.id&&M[w.id]!=null)return M[w.id];
  const key='x'+hashStr(w.name||'?');return Math.floor(Math.floor((mulberry32(hashStr(G.seed+'|base|'+key))()*14))*cmInfl(key)*cmRamp(T));
}
const cmLevel=(w,T)=>cmLvOf(cmPtsOf(w,T==null?cmT():T));
function cmLevelInfo(pt){const l=cmLvOf(pt);return{l,name:CM_LV[l-1],pt,next:l<9?CM_TH[l]:null,left:l<9?CM_TH[l]-pt:0};}
function cmTop(T,n){return cmMembers().map(m=>({m,pt:cmPtsOf(m,T)})).sort((a,b)=>b.pt-a.pt).slice(0,n);}
function cmLevelWatch(){
  if(!G||!G.comm)return;const C=cmEnsure(),l=cmLvOf(cmMyPts(cmT()));
  if(C.lv==null){C.lv=l;return;}
  if(l>C.lv){C.lv=l;A.stamp();if(A.fanfare)setTimeout(()=>A.fanfare(),300);toast('🏅 Sei salito al livello '+l+' di Marketers Pro: '+CM_LV[l-1]+'!',3600);}
}
let cmHow=false;
function levelCard(T){
  const me=cmLevelInfo(cmMyPts(T));
  return `<div class="lvc"><div class="lvh"><b>Livello ${me.l} · ${CM_LV[me.l-1]}</b><small>${me.pt} ${me.pt===1?'punto':'punti'}${me.next!=null?' · ancora '+me.left+' per il livello '+(me.l+1):' · livello massimo!'}</small></div><div class="lvbar"><i style="width:${me.next!=null?Math.round((me.pt-CM_TH[me.l-1])/(me.next-CM_TH[me.l-1])*100):100}%"></i></div><button class="lvq" id="cmHow">Come funzionano i punti?</button></div>`;
}
function howRender(B,T){
  const top=cmTop(T,5);
  B.innerHTML=`<div class="back" id="hwBack">‹ Indietro</div><h3 class="h3">Come funzionano i punti?</h3>
   <div class="hwh">1 Mi piace = 1 punto</div><div class="note" style="margin:0 0 12px">Per ogni Mi piace che ricevi su un post guadagni un punto. Questo incentiva a dare contributi di qualità e a premiare gli altri mettendo Mi piace ai loro post.</div>
   <div class="hwh">Livelli</div><div class="note" style="margin:0 0 8px">Accumulando punti sali di livello da 1 a 9. Il livello è visibile sull’avatar; qui sotto vedi i punti necessari. Tutti partono dal livello 1.</div>
   ${CM_LV.map((n,i)=>`<div class="lvrow"><span class="lvb2">${i+1}</span><b>${n}</b><small>${CM_TH[i]}+ punti</small></div>`).join('')}
   <div class="hwh" style="margin-top:12px">I più in alto adesso</div>${top.map((x,i)=>`<div class="lvrow">${cmAv(x.m)}<b>${esc(x.m.name)}</b><small>${x.pt} pt · liv. ${cmLvOf(x.pt)}</small></div>`).join('')}`;
  $('#hwBack').onclick=()=>{cmHow=false;renderPhone();};
}
const cmAv=m=>{const l=cmLevel(m);return `<span class="lvw">${faceImg(m.pal&&m.pal.hair?m.pal:facePal(m.name||'?',m.gender||'m'),'cav')}<i class="lvb">${l}</i></span>`;};
function cmCompose(){const r=mulberry32(hashStr(G.seed+'|cmp|'+G.day));return CM_COMPOSE.map((_,i)=>i).sort(()=>r()-.5).slice(0,3).map(i=>gxf(cmFill(CM_COMPOSE[i],{job:ME().job.toLowerCase()}),PLAYER.gender,PLAYER.gender));}
function renderComm(B){
  const C=cmEnsure(),T=cmT();
  const sug=cmCompose(),feed=cmFeed(T,cmMine&&!cmNotif,cmPin),nMine=C.posts.length,nAlb=(G.album||[]).length,nUn=cmUnread(T);
  const fil=`<div class="cfil"><button data-f="all" class="${cmMine||cmAlbum||cmNotif?'':'on'}">Tutti i post</button><button data-f="mine" class="${cmMine&&!cmAlbum&&!cmNotif?'on':''}">✎ I miei post (${nMine})</button><button data-f="notif" class="${cmNotif?'on':''}">🔔 Notifiche${nUn?' <i class="nbd">'+nUn+'</i>':''}</button><button data-f="album" class="${cmAlbum?'on':''}">📷 Album (${nAlb})</button></div>`;
  const bindFil=()=>B.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{cmAlbum=b.dataset.f==='album';cmNotif=b.dataset.f==='notif';cmMine=b.dataset.f==='mine';cmPin=null;cmHi=null;cmPerson=null;renderPhone();});
  const av=cmAv;
  if(cmHow){howRender(B,T);return;}
  if(cmAlbum){albumRender(B,fil);bindFil();return;}
  if(cmPerson){personRender(B,T);return;}
  if(cmNotif){notifRender(B,fil,T);bindFil();return;}
  B.innerHTML=`<div class="note" style="margin:0 0 8px"><b>Marketers Pro</b> · la community dell’evento. Post e commenti sono generati dal gioco; le persone che incontri qui ti riconoscono.</div>${levelCard(T)}
   <div class="cbox"><textarea id="cmT" maxlength="160" rows="2" placeholder="Cosa stai vivendo al Marketers World?"></textarea><div class="csug">${sug.map((s,i)=>`<button data-sg="${i}">${esc(s.length>34?s.slice(0,32)+'…':s)}</button>`).join('')}</div><div class="crow"><small id="cmN">0/160</small><button class="pb" id="cmP">Pubblica</button></div></div>`+
   fil+
   (feed.length?feed.map(p=>{const v=cmView(p,T),open=!!cmOpen[p.id],liked=!!C.liked[p.id];
     return `<div class="cp ${p.mine?'mine':''}" data-pid="${p.id}"><div class="ch">${av(p.m)}<div><b>${esc(p.m.name)}${p.m.me?' (tu)':''}</b><small>${esc(p.m.job||'')} · ${cmRel(p.at,T)}</small></div></div><div class="ct">${cmHL(gxf(p.text,p.m.gender||'m'))}</div>${p.img&&albumGet(p.img)?'<img class="cimg" src="'+albumGet(p.img).img+'">':''}<div class="ca"><button data-lk="${p.id}" class="${liked?'on':''}">${liked?'♥':'♡'} ${v.likes}</button><button data-op="${p.id}">💬 ${v.comments.length}</button></div>`+
      (open?`<div class="cc">${v.comments.map(c=>`<div class="cm ${c.me?'me':''} ${c.id===cmHi?'hi':''}">${av(c.who)}<div><b>${esc(c.who.name)}${c.me?' (tu)':''}</b><small>${cmRel(c.at,T)}</small><div>${cmHL(gxf(c.text,(c.who&&c.who.gender)||'m'))}</div>${(!c.me&&c.who&&CM_MEETRE.test(c.text))?`<button class="pb cmeet" data-cmeet="${esc(c.who.name)}">Proponi un meeting</button>`:''}</div></div>`).join('')||'<small>Ancora nessun commento.</small>'}<div class="cin"><input data-ci="${p.id}" maxlength="120" placeholder="Scrivi un commento…"><button class="pb" data-cs="${p.id}">Invia</button></div></div>`:'')+'</div>';}).join(''):(cmMine?'<div class="note">Non hai ancora pubblicato nulla. Scrivi un post qui sopra, poi tocca “Tutti i post” per tornare al feed.</div>':'<div class="note">Ancora nessun post: la community si sveglia a breve.</div>'));
  $('#cmHow').onclick=()=>{cmHow=true;renderPhone();};
  const ta=$('#cmT');ta.oninput=()=>{$('#cmN').textContent=ta.value.length+'/160';};
  bindFil();
  if(cmPin){const el=B.querySelector('[data-pid="'+cmPin+'"]');if(el)setTimeout(()=>el.scrollIntoView({block:'center'}),30);cmPin=null;}
  B.querySelectorAll('[data-sg]').forEach(b=>b.onclick=()=>{ta.value=sug[+b.dataset.sg];ta.oninput();});
  $('#cmP').onclick=()=>{const t=ta.value.trim();if(!t){toast('Scrivi qualcosa prima di pubblicare.',1800);return;}C.posts.push({id:'u'+(++C.pid),text:t.slice(0,160),at:cmT()});toast('Post pubblicato su Marketers Pro.',1800);A.stamp();renderPhone();};
  B.querySelectorAll('[data-cmeet]').forEach(b=>b.onclick=()=>{const nm=b.dataset.cmeet,m=cmMembers().find(x=>x.name===nm)||G.people.find(x=>x.name===nm)||cmMetPeople().find(x=>x.name===nm);if(!m)return;const ct=G.contacts.find(c=>c.name===nm)||{name:m.name,role:(m.job||'Partecipante')+' · '+(m.city||'Rimini'),p:m.pal,gender:m.gender,fam:m.fam};askMeeting(personFor(ct).id);});
  B.querySelectorAll('[data-lk]').forEach(b=>b.onclick=()=>{const id=b.dataset.lk;C.liked[id]=!C.liked[id];if(C.liked[id]&&/^u/.test(id)){C.selfLike=C.selfLike||{};if(C.selfLike[id]==null)C.selfLike[id]=cmT();}A.blip();const y=B.scrollTop;renderPhone();B.scrollTop=y;});
  B.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>{const id=b.dataset.op;cmOpen[id]=!cmOpen[id];const y=B.scrollTop;renderPhone();B.scrollTop=y;});
  B.querySelectorAll('[data-cs]').forEach(b=>b.onclick=()=>{const id=b.dataset.cs,inp=B.querySelector('[data-ci="'+id+'"]'),t=inp.value.trim();if(!t)return;(C.cm[id]=C.cm[id]||[]).push({id:'x'+(++C.pid),text:t,at:cmT()});toast('Commento pubblicato.',1400);const y=B.scrollTop;renderPhone();B.scrollTop=y;});
}

/* ---------- album di Marketers Pro: foto e selfie di questa partita ---------- */
const albumGet=id=>(G.album||[]).find(x=>x.id===id)||null;
function albumPlace(){let best=null,bd=1e9;for(const p of mapPlaces()){if(p.f!==G.f)continue;const d=Math.hypot(k(p.x)-G.p.x,k(p.y)-G.p.y);if(d<bd){bd=d;best=p;}}return best&&bd<k(150)?best.n:FLN[G.f];}
function albumAdd(src,cap){
  if(!G.album)G.album=[];
  const w=360,h=Math.round(src.height*w/src.width),t=document.createElement('canvas');t.width=w;t.height=h;const g=t.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(src,0,0,w,h);
  const e={id:'a'+Date.now().toString(36)+Math.floor(Math.random()*99),d:G.day,m:Math.floor(G.min),place:albumPlace(),cap,img:t.toDataURL('image/jpeg',.62)};
  G.album.push(e);if(G.album.length>12)G.album.shift();return e;
}
function albumRender(B,fil){
  const L=(G.album||[]).slice().reverse();
  B.innerHTML=`<div class="note" style="margin:0 0 8px"><b>Album</b> · le foto e i selfie di questa partita (massimo 12). Tocca una foto per aprirla, pubblicarla su Marketers Pro o scaricarla.</div>`+fil+
   (L.length?`<div class="agrid">${L.map(e=>`<button data-al="${e.id}"><img src="${e.img}"><small><b>${esc(e.cap)}</b><br>${DAYNAMES[e.d]} ${hm(e.m)} · ${esc(e.place)}</small></button>`).join('')}</div>`:'<div class="note">Ancora nessuna foto. Scatta con il pulsante 📷 (o il tasto F), oppure chiedi un selfie a chi incontri.</div>');
  B.querySelectorAll('[data-al]').forEach(b=>b.onclick=()=>albumView(b.dataset.al));
}
function albumView(id){
  const e=albumGet(id);if(!e)return;let v=document.getElementById('albv');
  if(!v){v=document.createElement('div');v.id='albv';document.body.appendChild(v);}
  const pub=(G.comm&&G.comm.posts||[]).some(p=>p.img===id);
  v.innerHTML=`<div class="box"><img src="${e.img}"><div class="cap"><b>${esc(e.cap)}</b><br><small>${DAYNAMES[e.d]} ${hm(e.m)} · ${esc(e.place)}</small></div><div class="row"><button class="btn" id="alPub" ${pub?'disabled':''}>${pub?'Già pubblicata':'Pubblica su Marketers Pro'}</button><button class="btn ghost" id="alDl">Scarica</button><button class="btn ghost" id="alDel">Elimina</button><button class="btn ghost" id="alX">Chiudi</button></div></div>`;
  v.classList.remove('hide');
  const close=()=>v.classList.add('hide');
  $('#alX').onclick=close;
  $('#alDl').onclick=()=>{const a=document.createElement('a');a.href=e.img;a.download='rimini-album-'+new Date().toISOString().replace(/[-:T]/g,'').slice(0,14)+'.jpg';document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),300);};
  $('#alDel').onclick=()=>{G.album=G.album.filter(x=>x.id!==id);close();toast('Foto eliminata dall’album.',1600);renderPhone();};
  $('#alPub').onclick=()=>{const C=cmEnsure();C.posts.push({id:'u'+(++C.pid),text:e.cap+' · '+e.place+' #MW26',at:cmT(),img:id});toast('Foto pubblicata su Marketers Pro.',2000);A.stamp();close();cmAlbum=false;cmMine=true;renderPhone();};
}

/* ---------- notifiche: dove ti hanno commentato, risposto o messo like ---------- */
function notifRender(B,fil,T){
  const C=cmEnsure(),seen=C.seenT,L=[...cmActivity(T),...cmLikesNotes(T)].sort((a,b)=>b.at-a.at);
  const cut=s=>{s=(s||'').replace(/\s+/g,' ');return s.length>60?s.slice(0,58)+'…':s;};
  B.innerHTML=`<div class="note" style="margin:0 0 8px"><b>Notifiche</b> · commenti, risposte e like ai tuoi contenuti. Tocca una notifica per aprire il post.</div>`+fil+
   (L.length?L.map(a=>{const nw=a.type!=='like'&&a.at>seen,head=a.type==='noshow'?`<b>${esc(a.who.name)}</b> ha scritto di te su Marketers Pro`:a.type==='comment'?`<b>${esc(a.who.name)}</b> ha commentato il tuo post`:a.type==='reply'?`<b>${esc(a.who.name)}</b> ha risposto al tuo commento su`:`<b>${a.count} ${a.count===1?'persona ha':'persone hanno'}</b> messo like al tuo post`;
     return `<button class="nt ${nw?'new':''}" data-nid="${esc(a.pid)}|${esc(a.id)}">${a.type==='like'?'<span class="nti">♥</span>':cmAv(a.who)}<div><div>${head} «${esc(cut(a.ptext))}»${a.met?' <span class="nmet">incontrat'+(a.who&&a.who.gender==='f'?'a':'o')+' di persona</span>':''}</div>${a.text?`<div class="nq">${cmHL2(a.text,a.who)}</div>`:''}<small>${cmRel(a.at,T)}${nw?' · NUOVA':''}</small></div></button>`;}).join(''):'<div class="note">Nessuna notifica per ora. Quando qualcuno commenta o risponde ai tuoi contenuti, lo vedi qui.</div>');
  B.querySelectorAll('[data-nid]').forEach(b=>b.onclick=()=>{const [pid,cid]=b.dataset.nid.split('|');cmAlbum=false;cmNotif=false;cmMine=!!C.posts.find(p=>p.id===pid);cmPin=pid;cmOpen[pid]=true;cmHi=cid;renderPhone();});
  C.seenT=T;
}
const cmHL2=(t,w)=>cmHL(gxf(t,(w&&w.gender)||'m'));

/* ---------- profilo di una persona incontrata: cosa ha scritto e commentato ---------- */
function cmShowPerson(name){cmPerson=name;cmAlbum=cmNotif=cmMine=false;cmPin=null;cmHi=null;phoneTab='comm';renderPhone();}
function personRender(B,T){
  const C=cmEnsure(),name=cmPerson,ct=G.contacts.find(x=>x.name===name)||{name,role:''},gender=ct.gender||genderOf(name),pal=ct.p||facePal(name,gender);
  const posts=cmFeed(T,false,null,false,true).filter(p=>p.m&&p.m.name===name&&!p.mine),acts=cmActivity(T).filter(a=>a.who&&a.who.name===name).sort((a,b)=>b.at-a.at);
  const cut=s=>{s=(s||'').replace(/\s+/g,' ');return s.length>60?s.slice(0,58)+'…':s;};
  const rows=[...posts.map(p=>({at:p.at,html:`<button class="nt" data-pp="${esc(p.id)}">${faceImg(pal,'cav')}<div><div><b>${esc(name)}</b> ha pubblicato</div><div class="nq">${cmHL(gxf(p.text,gender))}</div><small>${cmRel(p.at,T)}</small></div></button>`})),
   ...acts.map(a=>({at:a.at,html:`<button class="nt" data-nid="${esc(a.pid)}|${esc(a.id)}">${faceImg(pal,'cav')}<div><div><b>${esc(name)}</b> ${a.type==='comment'?'ha commentato il tuo post':'ha risposto al tuo commento su'} «${esc(cut(a.ptext))}»</div><div class="nq">${cmHL(gxf(a.text,gender))}</div><small>${cmRel(a.at,T)}</small></div></button>`}))].sort((a,b)=>b.at-a.at);
  const pe=typeof personFor==='function'?personFor(ct):null;
  B.innerHTML=`<div class="pcard ct" style="margin-bottom:10px"><div class="ctb" style="display:flex;gap:10px;align-items:center">${faceImg(pal,'avi2')}<div class="pi"><b>${esc(name)}</b><small>${esc(ct.role||'')}</small><small>${(()=>{const w={id:'k'+hashStr(name),name,me:false},i=cmLevelInfo(cmPtsOf(w,T));return '🏅 Livello '+i.l+' · '+i.name+' · '+i.pt+' pt';})()}</small></div></div><div class="crow2" style="margin-top:8px"><button class="pb" id="pfMt">Proponi un meeting</button><button class="pb ghost" id="pfBack">‹ Torna ai contatti</button></div></div>`+
   (rows.length?`<div class="note" style="margin:0 0 8px">Cosa ha scritto e commentato ${esc(name.split(' ')[0])} su Marketers Pro. Tocca per aprire il post.</div>`+rows.map(r=>r.html).join(''):`<div class="note">Per ora ${esc(name.split(' ')[0])} non ha scritto né commentato nulla su Marketers Pro. Pubblica un post: chi hai incontrato può risponderti.</div>`);
  $('#pfBack').onclick=()=>{cmPerson=null;phoneTab='net';netTab='con';renderPhone();};
  $('#pfMt').onclick=()=>{cmPerson=null;if(pe)askMeeting(pe.id);};
  B.querySelectorAll('[data-nid]').forEach(b=>b.onclick=()=>{const [pid,cid]=b.dataset.nid.split('|');cmPerson=null;cmAlbum=false;cmNotif=false;cmMine=!!C.posts.find(p=>p.id===pid);cmPin=pid;cmOpen[pid]=true;cmHi=cid;renderPhone();});
  B.querySelectorAll('[data-pp]').forEach(b=>b.onclick=()=>{cmPerson=null;cmAlbum=false;cmNotif=false;cmMine=false;cmPin=b.dataset.pp;cmOpen[b.dataset.pp]=true;renderPhone();});
}
