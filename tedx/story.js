'use strict';
/* TEDx PESARO · storia: capitoli 2024-2027, compiti, fasi, Taccuino, salvataggi. Nomi e ruoli reali (fonti pubbliche), dialoghi inventati. */
const NPCx=(name,role,extra)=>Object.assign({name,role,p:palOf(name)},extra||{});
const tm=k=>NPCx(TEAM[k].n,TEAM[k].r,{key:k});
const spk=n=>NPCx(n,SPK_INFO[n]?SPK_INFO[n].charAt(0).toUpperCase()+SPK_INFO[n].slice(1):'Speaker',{spk:true});
const VOL=(n,r)=>NPCx(n,r||'Persona del posto (inventata)');
const MAPN={sede:'la sede di Spazio Rosso',pesaro:'Pesaro, in piazza',astra:'il Cinema Teatro Astra',scavolini:'l’Auditorium Scavolini',farina:'Farina Pizzeria',forum:'il Forum Della Chiara',gradara:'Gradara',fano:'Fano'};
const TASKS={};
function TK(id,label,map,x,y,who,run,o){TASKS[id]=Object.assign({id,label,map,x,y,who,run},o||{});}
const done=(id,pts,msg)=>finishTask(id,pts,msg);

/* ===================== PROLOGO ===================== */
TK('p1','Presentati a Christian','sede',260,106,tm('christian'),()=>chain(tm('christian'),[
 'Benvenut{o|a}! Io sono Christian. Qui nasce Spazio Rosso: un’associazione di volontari che vuole portare un TEDx a Pesaro.',
 'TEDx è un evento organizzato in modo indipendente, su licenza TED: idee che meritano di essere diffuse, talk brevi, un palco per persone di mondi diversi.',
 {q:'Perché ti sei offert{o|a} come volontari{o|a}?',c:[['Mi piacciono le idee che cambiano le cose.','Bellissimo: è proprio per questo che siamo qui.',1],['Voglio imparare e conoscere persone.','Ottimo: qui si impara facendo.',1],['Non lo so ancora, ma sono curios{o|a}.','Va benissimo: la curiosità basta.',1]]},
 'Il lavoro è gratuito e volontario: si fa per passione. Comincia conoscendo la squadra.'],()=>done('p1',20)));
TK('p2','Conosci la squadra','sede',130,170,tm('antonino'),()=>chain(tm('antonino'),[
 'Spazio Rosso APS è nata il 1° febbraio 2024. I fondatori siamo in sette: Christian e Francesca Carbonari, Lorenzo Donzelli, Valerio Gioviani, Paolo Pagnini, Marina Roselli e io, Antonino.',
 'Io faccio l’Event Manager: la regia di tutto l’evento, dal palco alla porta d’ingresso.',
 {q:'Dove vuoi dare una mano all’inizio?',c:[['Con gli speaker: contattarli e convincerli.','Il lavoro più delicato: contiamo su di te.',1],['Con la comunicazione e i social.','Ti presento Valerio e Tommaso: ci serve gente così.',1],['Con la logistica e la sala.','Ottimo: la sala è il cuore del giorno dell’evento.',1]]}],()=>{G.met.antonino=1;done('p2',20);}));
TK('p3','La licenza TEDx','sede',400,170,tm('paolo'),()=>chain(tm('paolo'),[
 'La licenza si chiede a TED con una domanda in inglese. Il nome deve riferirsi a un luogo e viene approvato da TED. E va rinnovata ogni anno.',
 'Come ci raccontano Christian e Antonino, per ottenerla serve andare in America. Partono loro: noi qui prepariamo tutto.',
 'Prima di partire, ripassiamo le regole: ti faccio qualche domanda.'],()=>quizMini('Le regole TEDx',RULES_Q,(ok,n)=>{G.met.paolo=1;done('p3',15+ok*5,ok+'/'+n+' risposte giuste');},{n:5})));

/* ===================== 2024 · TEDxPantano ===================== */
TK('n1_nome','Perché “Pantano”?','sede',300,106,tm('paolo'),()=>chain(tm('paolo'),[
 'Ci siamo chiamati TEDxPantano: Pantano è un quartiere di Pesaro, legato alla storia della mia famiglia. Le regole di TED sono molto rigide: ci hanno accettato questo nome.',
 'Il prossimo anno, se tutto va bene, potremo usare TEDx Pesaro. L’evento lo aprirà mio padre Carlo, che ha 96 anni.',
 {q:'Come lo spieghi a chi ti chiede perché “Pantano” e non “Pesaro”?',c:[['Il nome si basa sul luogo e deve essere approvato da TED.','Esatto: una regola che ci ha portati a Pantano.',2],['Perché ci piaceva il suono.','Ehm... no: è una regola di TED, non un gusto.',0],['Non lo so, è un mistero.','Tranquill{o|a}: ora lo sai.',0]]}],(g)=>{G.met.paolo=1;done('n1_nome',15+g*5);}));
const spkTask=(id,name,x,y,trait,year,lab)=>TK(id,lab||('Convinci '+name),'pesaro',x,y,spk(name),()=>persuade(spk(name),trait,ok=>{if(ok){G.spk[name]=1;done(id,30,name+' sarà sul palco!');toast(name+' sarà sul palco',3000);}else{done(id,10,'Per ora no: la squadra se ne occupa');}}));
spkTask('n1_sp1','Gabriele Pagnini',360,290,'entusiasta',2024);
spkTask('n1_sp2','Davide Bertozzi',380,400,'pratico',2024);
spkTask('n1_sp3','Paolo Ercolani',580,300,'riflessivo',2024);
TK('n1_astra','Parla con l’Astra','astra',110,285,NPCx('Gestore dell’Astra','Cinema Teatro Astra (personaggio inventato)'),()=>chain(NPCx('Gestore dell’Astra','Cinema Teatro Astra (inventato)'),[
 'Un TEDx all’Astra? Bella idea. Ci stanno poche persone, ma la sala è calda e il palco è vostro.',
 {q:'Cosa chiedi per primo?',c:[['Orari per allestire e provare il giorno prima.','Si può fare: veniamo incontro volentieri.',2],['Il numero esatto di posti e uscite.','Ve lo preparo, così vi regolate con i biglietti.',2],['Se possiamo avere tutto gratis.','Una mano si può dare, ma gli accordi si fanno bene: ne parlo con Christian.',1]]}],g=>done('n1_astra',15+g*5)));
TK('n1_vol','Cerca volontari','pesaro',300,205,VOL('Chiara','Studentessa (inventata)'),()=>chain(VOL('Chiara','Studentessa (inventata)'),[
 'Un TEDx a Pesaro? Ci sarebbe da lavorare... ma io non so fare niente di speciale.',
 {q:'Come la convinci a unirsi alla squadra?',c:[['Servono mani e competenze diverse: troveremo il tuo posto.','Allora ci sto! Magari mi occupo della sala.',2],['Ti serve per il curriculum.','Mah... non so se è il motivo giusto.',0],['È una cosa seria, non puoi mancare.','Ok, ci penso... forse.',1]]}],g=>{if(g>0)G.vol++;done('n1_vol',15+g*5,'Nuov{o|a} volontari{o|a} in squadra');}));
TK('n1_open','Accompagna Carlo Pagnini','astra',110,100,NPCx('Carlo Pagnini','96 anni, aprirà l’evento'),()=>chain(NPCx('Carlo Pagnini','Speaker, 96 anni'),[
 'Eccomi. Ho 96 anni e stasera sono io ad aprire. Se mi tremano le gambe, mi tengo a te.',
 {q:'Come lo accompagni sul palco?',c:[['Gli offro il braccio e restiamo insieme fino al microfono.','Grazie, figliolo: con te vado tranquillo.',2],['Gli dico di andare da solo, il palco è suo.','Lo so... ma un braccio non mi dispiace.',1],['Aspetto che cominci e lo guardo da dietro.','Va bene, ma non lasciarmi troppo solo.',0]]}],g=>{G.met.paolo=1;done('n1_open',20+g*5);}));
TK('n1_tick','Accoglienza all’ingresso','astra',70,350,tm('francesca'),()=>chain(tm('francesca'),['Il sold out è questo: file ordinate, biglietti controllati. Pronto{|a}? Si entra a gruppi.'],()=>ticketsMini({title:'Accoglienza all’Astra',seed:'2024',n:10,year:2024},(s,n)=>{G.met.francesca=1;done('n1_tick',10+s*3,s+'/'+n+' controlli giusti');})));
TK('n1_cue','Cue per Silvia','astra',110,185,tm('silvia'),()=>chain(tm('silvia'),[
 'Sono Silvia, presento io la serata. Tra poco tocca a Gabriele Pagnini: ricordati, tre minuti, un minuto, stop.',
 'Tu stai in regia e mostri i segnali al palco. Niente panico: i 18 minuti passano in fretta.'],()=>cueMini({intro:'Primo talk della serata. Mostra i segnali al momento giusto.',out:'Applauso lungo: il TEDxPantano è partito bene.'},(s)=>{G.met.silvia=1;done('n1_cue',15+s*3);})));
TK('n1_fin','Dopo l’ultimo talk','astra',360,126,tm('christian'),()=>chain(tm('christian'),[
 'Dieci speaker, un cinema-teatro pieno. Abbiamo fatto TEDxPantano.',
 'Non c’erano mai stati tanti volontari tutti insieme nello stesso posto, a Pesaro, per qualcosa di così.',
 {q:'Cosa ti porti a casa di stasera?',c:[['Ho visto delle idee diventare parole.','Anche io. È per questo che si fa.',1],['Ho scoperto di far parte di una squadra.','Da stasera sei di Spazio Rosso a tutti gli effetti.',1],['La stanchezza e la voglia di ricominciare.','Ricominciamo presto: il prossimo anno ci aspetta.',1]]}],()=>done('n1_fin',25)));

/* ===================== 2025 · TEDx Pesaro, Intrecci ===================== */
TK('n2_nome','Il nome cambia','sede',260,106,tm('christian'),()=>chain(tm('christian'),[
 'Ce l’abbiamo fatta: TED ci ha dato il riconoscimento. Da quest’anno siamo TEDx Pesaro.',
 'Cambiamo anche casa: l’Auditorium Scavolini. Più posti, un palco vero, tanta responsabilità. Il tema è “Intrecci”.',
 {q:'Cosa significa “Intrecci” per te?',c:[['Persone e discipline che si incontrano.','Proprio così: è il filo del programma.',1],['Passato e futuro che si tengono per mano.','Bella: tradizione e innovazione insieme.',1],['Tanti fili che fanno un tessuto.','Il tessuto che stiamo costruendo.',1]]}],()=>done('n2_nome',20)));
spkTask('n2_sp1','Vera Gheno',360,290,'riflessivo',2025);
spkTask('n2_sp2','Zico Pieri',580,300,'pratico',2025);
spkTask('n2_sp3','Aurora Ruffino',380,400,'entusiasta',2025);
TK('n2_spons','Cerca sostenitori','pesaro',600,390,VOL('Referente aziendale','Azienda locale (inventato)'),()=>chain(VOL('Referente aziendale','Azienda locale (inventato)'),[
 'Mi parli di sponsor... io non vorrei decidere cosa dicono gli speaker. Come funziona?',
 {q:'Cosa prometti a chi sostiene TEDx Pesaro?',c:[['Visibilità e un legame con la comunità, senza controllo sui contenuti.','Perfetto: è la regola di TEDx. Ci stiamo.',2],['Un intervento commerciale dal palco.','Non si può: nei TEDx gli sponsor non fanno pubblicità dal palco.',0],['Che sceglierà lei gli speaker.','No: nessun controllo editoriale agli sponsor.',0]]},
 'Vi aiuto: FTP, Farina Pizzeria e Lindbergh Hotels sono tra i sostenitori principali di quest’anno.'],g=>done('n2_spons',15+g*5)));
TK('n2_vol','Quasi 40 volontari','pesaro',300,205,VOL('Marco','Pensionato (inventato)'),()=>chain(VOL('Marco','Pensionato (inventato)'),[
 'Sono in pensione, ho tempo, ma poca esperienza con questa roba moderna.',
 {q:'Cosa gli proponi?',c:[['Accoglienza e assistenza di sala: serve gente affidabile.','Questo lo so fare! Dove firmo?',2],['Il montaggio video.','Non saprei... forse meglio altro.',0],['Pulire dopo l’evento.','Anche quello, ma preferirei stare con le persone.',1]]}],g=>{if(g>0)G.vol++;done('n2_vol',15+g*5,'Il gruppo cresce');}));
TK('n2_setup','Allestimento della sala','scavolini',200,497,tm('antonino'),()=>chain(tm('antonino'),[
 'Auditorium Scavolini, assetto teatrale: 1.400 posti totali, noi ne apriamo una parte. Si entra dal foyer, si scende le scale, si passa la tenda e si è in platea.',
 {q:'Da dove cominciamo?',c:[['Dall’ingresso: i flussi di persone.','Giusto: se l’ingresso funziona, funziona tutto.',2],['Dal palco e dal backstage.','Tecnica e camerini: ci pensa Daniele, ma dà un’occhiata.',1],['Dai posti a sedere.','I posti li segniamo a fine giornata. Prima il flusso.',1]]}],g=>{G.met.antonino=1;done('n2_setup',15+g*5);}));
TK('n2_tick','Accoglienza e accrediti','scavolini',330,497,tm('francesca'),()=>chain(tm('francesca'),['Foyer, banco accrediti, tutto il pubblico arriva insieme. Facciamo entrare tutti senza coda!'],()=>ticketsMini({title:'Accoglienza all’Auditorium',seed:'2025',n:12,year:2025},(s,n)=>{G.met.francesca=1;done('n2_tick',10+s*3,s+'/'+n+' controlli giusti');})));
TK('n2_back','Accompagna gli speaker','scavolini',150,78,spk('Vera Gheno'),()=>chain(spk('Vera Gheno'),[
 'Mi hanno detto che il mio talk parla di intrecci tra lingua e realtà. Un po’ di ansia c’è sempre.',
 {q:'Come la tranquillizzi prima del palco?',c:[['Respira, hai solo 18 minuti e una sola idea.','Grazie: è proprio quello che mi serviva.',2],['Dai, vai e basta.','Eh... un po’ meno aiuto.',0],['Ti accompagno fino all’ultimo passo.','Che gentile: ci sto.',1]]}],g=>done('n2_back',15+g*5)));
TK('n2_cue','Il timer dei 18 minuti','scavolini',600,76,tm('daniele'),()=>chain(tm('daniele'),['Sono Daniele, lo Stage Manager. Per questo talk ti affido il timer: tre minuti, un minuto, stop.'],()=>cueMini({intro:'Zico Pieri sul palco: “La magia del confine tra il possibile e l’impossibile”.',out:'Standing ovation.'},s=>{G.met.daniele=1;done('n2_cue',15+s*3);})));
TK('n2_fin','Fine di Intrecci','scavolini',400,216,tm('christian'),()=>chain(tm('christian'),[
 'Otto speaker, una platea piena, un auditorium vero. Intrecci è stato un intreccio anche di mani: quasi 40 volontari.',
 {q:'Come ti senti?',c:[['Stanchissim{o|a}, ma felice.','Il mix perfetto.',1],['Orgoglios{o|a} di aver fatto parte della squadra.','Anche noi di te.',1],['Voglio fare di più l’anno prossimo.','Ti prendiamo in parola.',1]]}],()=>done('n2_fin',25)));
TK('n2_corsa','La corsa della domenica','pesaro',520,420,NPCx('Associazione Podistica','Atletica Centro Storico (referente inventato)'),()=>chain(NPCx('Associazione Podistica','Atletica Centro Storico'),['Domenica, il giorno dopo il TEDx: corsa non competitiva con noi. Vieni a correre?'],()=>runMini({title:'La corsa della domenica',intro:'Tocca o premi Spazio in ritmo per correre fino al traguardo.',secs:14},st=>done('n2_corsa',10+st*5,st?'Traguardo!':'Hai partecipato'))));

/* ===================== 2026 · Radici ===================== */
TK('n3_nome','Il tema: Radici','sede',260,106,tm('christian'),()=>chain(tm('christian'),[
 'La terza edizione. Tema: “Radici”. Non nostalgia: guardare indietro per capire cosa ci sostiene mentre andiamo avanti.',
 'Quest’anno c’è anche altro: le Adventure, eventi fuori dal palco in giro per la città. TEDx Pesaro deve vivere tutto l’anno.',
 {q:'Cosa sono per te le tue radici?',c:[['Le persone che mi hanno cresciut{o|a}.','Bella risposta.',1],['I luoghi in cui sono stat{o|a} bene.','Anche i posti ci formano.',1],['Quello che voglio costruire.','Radici per il futuro: giusto.',1]]}],()=>done('n3_nome',20)));
spkTask('n3_sp1','Gabriella Greison',360,290,'impegnato',2026);
spkTask('n3_sp2','Fabio Zaffagnini',580,300,'entusiasta',2026);
spkTask('n3_sp3','Max Mariola',380,400,'pratico',2026);
TK('n3_rondine','Le studentesse di Rondine','pesaro',500,230,NPCx('Zohra e Bernadette','Studentesse di Rondine Cittadella della Pace'),()=>chain(NPCx('Zohra e Bernadette','Studentesse del Progetto Rondine'),[
 'Siamo due studentesse di Rondine. Il nostro talk è uno solo, ma lo diciamo in due: “Radici diverse, una sola umanità”.',
 {q:'Come le aiuti a prepararsi insieme?',c:[['Troviamo il punto in cui le due storie si incontrano.','Sì, è proprio quello che ci serve.',2],['Ognuna parla per metà, senza coordinarsi.','Così rischiamo di non sentirci.',0],['Fate quel che volete.','Un po’ di aiuto ci farebbe bene...',1]]}],g=>{G.spk['Studentesse del Progetto Rondine']=1;done('n3_rondine',20+g*5);}));
TK('n3_spons','Partner e sostenitori','sede',400,170,tm('claudia'),()=>chain(tm('claudia'),[
 'Sono Claudia, fundraising. Quest’anno abbiamo livelli di partnership: Main Sponsor, Video Partner, Hospitality, Gold, Digital Marketing, Silver, Friends ed Event Partner.',
 {q:'Cosa diciamo a chi vuole sostenerci?',c:[['Che sostiene un progetto culturale senza fini di lucro, senza controllo sui contenuti.','Perfetto. È la regola e la nostra forza.',2],['Che può scegliere gli speaker.','No: gli sponsor non hanno controllo editoriale.',0],['Che l’evento è gratis per tutti.','Il biglietto serve a coprire i costi: spieghiamolo bene.',1]]}],g=>{G.met.claudia=1;done('n3_spons',15+g*5);}));
TK('n3_plus','Un Consigliere PLUS','pesaro',165,385,VOL('Titolare del Figaro Bar','Figaro Bar (personaggio inventato)'),()=>chain(VOL('Titolare del Figaro Bar','Figaro Bar (inventato)'),[
 'I Consiglieri PLUS ospitano una box per raccogliere le autocandidature degli speaker del 2027. Poche realtà in città.',
 {q:'Come glielo proponi?',c:[['È un modo per far sentire la città parte del palco: la box è il tuo spazio nelle idee.','Mi piace! Metto la box al bancone.',2],['Costa poco e fa pubblicità.','Mah... non è solo pubblicità, vero?',0]]}],g=>done('n3_plus',15+g*5)));
TK('n3_gen','Gen-E-razioni','forum',230,160,tm('antonino'),()=>chain(tm('antonino'),[
 'Gen-E-razioni, 26 febbraio, ore 17:30: tre imprenditori del territorio parlano di famiglia, tecnologia e futuro dell’impresa. Con FTP, gratuito su prenotazione.',
 'Ci sono Massimo Cecchini (STR Automotive), Luigino Gambini (Gambini Meccanica) e Daniele Livi (FIAM). Una conversazione tra radici e innovazione.',
 {q:'Cosa fai per far funzionare la serata?',c:[['Accolgo gli ospiti e controllo le prenotazioni.','Perfetto: il primo contatto conta.',2],['Sistemo le sedie e il microfono.','Utilissimo: tecnica senza intoppi.',2],['Resto in fondo a guardare.','Va bene, ma una mano serve...',0]]}],g=>{G.met.antonino=1;done('n3_gen',20+g*5);}));
TK('n3_par','Le parole sono immagini','gradara',120,292,NPCx('Davide Bertozzi','Autore dei poster (speaker 2024)'),()=>chain(NPCx('Davide Bertozzi','Autore dei poster (speaker 2024)'),[
 'Al MARV di Gradara c’è la mostra: cinquanta poster, parole che diventano immagini. Il 21 febbraio c’è anche il workshop “words hacking”.',
 'Chi compra il biglietto TEDx può portarsi a casa un’opera.',
 {q:'Quale parola trasformeresti in immagine?',c:[['Radici.','Bella scelta: radici come disegno, come mappa.',1],['Casa.','Casa: una parola che sa di luogo e di persone.',1],['Futuro.','Futuro: l’immagine più difficile.',1]]}],()=>done('n3_par',20)));
TK('n3_gent','Le radici della gentilezza','fano',180,184,NPCx('Filippo Sabattini','Psicologo e pedagogista'),()=>chain(NPCx('Filippo Sabattini','Psicologo, pedagogista, counselor'),[
 'Siamo alla MeMo, a Fano: l’incontro è gratuito, su prenotazione. Parliamo di ascolto e cura delle parole: la gentilezza come scelta consapevole.',
 {q:'Come ascolti davvero qualcuno?',c:[['Aspetto che finisca di parlare, senza interrompere.','L’ascolto comincia dal silenzio.',2],['Preparo la risposta mentre parla.','Si fa, ma così non si ascolta.',0],['Prendo appunti di quello che dice.','Un buon modo per restare attenti.',1]]}],g=>done('n3_gent',20+g*5)));
TK('n3_cibo','Tradisci le radici del cibo','farina',270,190,NPCx('Massimo Bernardi','Giornalista enogastronomico, Dissapore'),()=>chain(NPCx('Massimo Bernardi','Giornalista enogastronomico, Dissapore'),[
 'Siamo da Farina, 15 marzo, ore 15:30. Il tema: le tradizioni sopravvivono quando possono evolvere. Ogni tradizione “intoccabile” è nata da una modifica.',
 {q:'Cosa la tradizione italiana ha cambiato nel tempo?',c:[['La pizza: è nata da ingredienti arrivati da lontano.','Esatto: pomodoro e mozzarella non erano sempre lì.',2],['Niente: è sempre uguale.','Quasi mai: è un’idea che ci rassicura.',0],['La pasta, che cambia forma ovunque.','Giusto: ogni zona la reinventa.',2]]}],g=>done('n3_cibo',20+g*5)));
TK('n3_xrun','XRun','pesaro',330,340,tm('massimo'),()=>chain(tm('massimo'),[
 'XRun: corsa o camminata non competitiva da 10 o 5 km, partenza da Piazzale della Libertà. Iscrizione 5 euro, con l’Atletica podistica e Pesaro Challenge.',
 'Forza, mettiti le scarpe.'],()=>runMini({title:'XRun · Piazzale della Libertà',intro:'Corri tra le strade di Pesaro: tocca o premi Spazio in ritmo.',secs:13},st=>{G.met.massimo=1;done('n3_xrun',15+st*5,st?'Traguardo!':'Hai partecipato');})));
TK('n3_setup','Allestimento','scavolini',200,497,tm('daniele'),()=>chain(tm('daniele'),[
 'Giorno dell’evento: 22 marzo, dalle 15:30 alle 19:00. Più di 600 biglietti venduti, 440 sedie in platea più le tribune. Ogni cosa al suo posto.',
 {q:'Cosa controlli per prima?',c:[['Che il palco e il timer siano pronti.','Giusto: il tempo è tutto in un TEDx.',2],['Che il foyer sia accogliente.','Importante: la prima impressione.',1],['Che gli speaker siano arrivati.','Quelli li gestiamo dopo, ma bravo{|a}.',1]]}],g=>{G.met.daniele=1;done('n3_setup',15+g*5);}));
TK('n3_tick','Accoglienza e biglietti','scavolini',330,497,tm('francesca'),()=>chain(tm('francesca'),['Oltre 600 biglietti, tanta gente anche da fuori città: Fano e l’entroterra. Facciamo entrare tutti.'],()=>ticketsMini({title:'Accoglienza all’Auditorium',seed:'2026',n:14,year:2026},(s,n)=>{G.met.francesca=1;done('n3_tick',10+s*3,s+'/'+n+' controlli giusti');})));
TK('n3_back','La presentatrice','scavolini',300,78,tm('sara'),()=>chain(tm('sara'),[
 'Sono Sara, ma sul palco sono “essenonesiste”. Presento io: otto interventi, nove persone sul palco, perché il talk di Rondine è a due voci.',
 {q:'Qualcosa da dirle prima di salire?',c:[['In bocca al lupo, siamo con te.','Crepi! Mi serviva.',2],['Sbrigati, sei in ritardo.','Eh... meglio non iniziare con questa.',0],['Ti porto un bicchiere d’acqua.','Grazie, gentile.',1]]}],g=>{G.met.sara=1;done('n3_back',15+g*5);}));
TK('n3_cue','Il timer dei 18 minuti','scavolini',600,76,tm('daniele'),()=>chain(tm('daniele'),['Sei il mio braccio destro in regia. Rodolfo Canestrari sale ora: ricordati i segnali.'],()=>cueMini({intro:'Rodolfo Canestrari sul palco: “Quando le tue radici sono lunghe 15.000 chilometri”.',out:'La sala applaude in piedi.'},s=>{done('n3_cue',15+s*3);})));
TK('n3_fin','Radici è finito','scavolini',400,216,tm('christian'),()=>chain(tm('christian'),[
 'La prima edizione è stata una scommessa, la seconda una conferma, oggi TEDx Pesaro è un progetto culturale stabile.',
 'Ma non finisce qui: ci sono ancora le Adventure dell’autunno. Gradara Ludens, Fano Comics, e la consegna dei giochi.'],()=>done('n3_fin',25)));
TK('n3_gquiz','Il quiz a Gradara Ludens','gradara',410,290,tm('valerio'),()=>chain(tm('valerio'),[
 'Gradara Ludens, 19 e 20 settembre. Abbiamo una postazione con quiz di cultura generale: chi risponde bene vince un piccolo premio e scopre TEDx Pesaro.'],()=>quizMini('Il quiz di TEDx Pesaro',GEN_Q,(ok,n)=>{G.met.valerio=1;done('n3_gquiz',15+ok*4,ok+'/'+n+' risposte giuste');},{n:5})));
TK('n3_gdono','Dona il tuo gioco','gradara',0,0,null,null,{multi:[
 {x:260,y:365,label:'Gioco in scatola'},{x:560,y:330,label:'Gioco in scatola'},{x:690,y:300,label:'Gioco in scatola'},{x:300,y:425,label:'Gioco in scatola'},{x:120,y:360,label:'Gioco in scatola'},
 {x:610,y:262,label:'Cassa della raccolta',last:true}],
 sub:(i,s)=>{if(!s.last){toast('Gioco in scatola raccolto ('+(subCount('n3_gdono')+1)+'/5)',1800);A.ok();subDone('n3_gdono',i);}else{if(subCount('n3_gdono')<5){toast('Ti mancano ancora dei giochi.',2200);return;}subDone('n3_gdono',i);chain(tm('francesca'),['Cinque scatole di giochi, tutti completi. Li portiamo ad ABIO Pesaro, per i bambini in ospedale.'],()=>done('n3_gdono',30,'Giochi raccolti'));}}});
TK('n3_abio','La consegna ad ABIO','pesaro',620,205,NPCx('Alessandra Della Chiara','Presidente di ABIO Pesaro'),()=>chain(NPCx('Alessandra Della Chiara','Presidente di ABIO Pesaro'),[
 '12 ottobre: è il giorno della consegna. Diversi scatoloni di giochi per il reparto pediatrico dell’ospedale San Salvatore.',
 'Grazie davvero: un gioco è una mano tesa a un bambino che ne ha bisogno.',
 {q:'Cosa le rispondi?',c:[['È stato un piacere: la raccolta l’hanno fatta in tanti.','E la sentiamo tutti, questa gentilezza.',1],['Era solo un gioco, niente di che.','Per un bambino è moltissimo.',0]]}],()=>done('n3_abio',25)));
TK('n3_fumetto','Fano Comics','fano',140,332,NPCx('Marco Astracedi','Illustratore, ACCA Academy'),()=>chain(NPCx('Marco Astracedi','Illustratore, ACCA Academy'),[
 '17 ottobre, Fano Comics. Al banchetto TEDx c’è un gioco con domande e gadget, poi il workshop “Dall’idea al fumetto”: 90 minuti, per ragazzi dai 7 ai 13 anni.',
 'Costruiamo una storia in tre vignette: tu aiuti i ragazzi a trovarla.'],()=>comicMini(()=>done('n3_fumetto',25,'Fumetto fatto'))));

/* ===================== 2027 · verso il 21 marzo ===================== */
TK('n4_box','Le box dei Consiglieri PLUS','pesaro',0,0,null,null,{multi:[
 {x:165,y:263,label:'Box · Libreria Campus'},{x:165,y:323,label:'Box · Trony Pesaro'},{x:165,y:385,label:'Box · Figaro Bar'},{x:165,y:443,label:'Box · Pietro Leo Hairstyle'}],
 sub:(i,s)=>{toast('Hai preso le autocandidature: '+s.label,2200);A.ok();subDone('n4_box',i);if(subCount('n4_box')>=4)done('n4_box',25,'Box svuotate');}});
TK('n4_vote','Il voto dei Consiglieri','sede',260,106,tm('christian'),()=>chain(tm('christian'),[
 'Le box sono piene: autocandidature da tutta la città. I Consiglieri possono votare le migliori per il palco del 2027.',
 'Ti faccio vedere le prime. (Sono candidati inventati: quelli veri li scopriremo.)'],()=>voteMini(CANDS,l=>{G.vote=l.map(c=>c.n);done('n4_vote',25+l.length*3);})));
TK('n4_niky','Un nuovo volontario','sede',400,285,NPCx('Niky','Nuovo volontario del 2027',{p:Object.assign(palOf('Niky'),{shirt:'#2a5a8a',hair:'#1a1a20',skin:'#e8b98a',gphones:true})}),()=>chain(NPCx('Niky','Nuovo volontario',{p:Object.assign(palOf('Niky'),{shirt:'#2a5a8a',hair:'#1a1a20',skin:'#e8b98a',gphones:true})}),[
 'Ciao! Sono Domenico, ma tutti mi chiamano Niky. Sono nuovo qui: da quest’anno faccio il volontario.',
 'Nella vita faccio il podcast coach, l’editor e il sound designer. Quindi se serve un microfono, un’audio fatto bene o un suono di sottofondo... ci sono.',
 'Per ora sto imparando dove si butta la roba... ma ho una passione: le cuffie verdi.'],()=>{G.met.niky=1;done('n4_niky',20,'Un volontario in più!');}));
TK('n4_end','Il 21 marzo 2027','sede',300,106,tm('christian'),()=>chain(tm('christian'),[
 'Quarta edizione: domenica 21 marzo 2027, all’Auditorium Scavolini.',
 'Il tema, gli speaker e il programma non sono ancora annunciati: ci stiamo lavorando. Quello che sappiamo è che saremo di più e le idee che arriveranno dalle box saranno tante.',
 'Grazie di aver fatto tutta la strada con noi.'],()=>done('n4_end',30)));

/* ===================== CAPITOLI ===================== */
const CH=[
 {id:'p',year:'Febbraio 2024',title:'Nasce Spazio Rosso',intro:'1° febbraio 2024. Un’associazione di volontari vuole portare TEDx a Pesaro. Tu entri in squadra.',start:{map:'sede',x:260,y:290},phases:[{name:'La squadra',tasks:['p1','p2','p3']}],outro:'Febbraio 2024. La licenza sarà in viaggio, il nome sarà TEDxPantano. Si parte.'},
 {id:'2024',year:'2024',title:'TEDxPantano · Limiti',intro:'22 marzo 2024, Cinema Teatro Astra. La prima edizione di TEDx a Pesaro, nell’anno di Pesaro Capitale italiana della Cultura. Tema: “Limiti”.',start:{map:'sede',x:260,y:290},
  phases:[{name:'Organizzazione',tasks:['n1_nome','n1_sp1','n1_sp2','n1_sp3','n1_astra','n1_vol']},{name:'22 marzo 2024 · Astra',card:'22 marzo 2024, ore 20. Si apre la prima edizione.',start:{map:'astra',x:75,y:390},tasks:['n1_open','n1_tick','n1_cue','n1_fin']}],
  outro:'Sold out. Dieci speaker, un cinema-teatro pieno, una squadra che non si fermerà.',stage:2024},
 {id:'2025',year:'2025',title:'TEDx Pesaro · Intrecci',intro:'Marzo 2025. Il nome diventa TEDx Pesaro e la sede l’Auditorium Scavolini. Tema: “Intrecci”.',start:{map:'sede',x:260,y:290},
  phases:[{name:'Organizzazione',tasks:['n2_nome','n2_sp1','n2_sp2','n2_sp3','n2_spons','n2_vol']},{name:'22 marzo 2025 · Scavolini',card:'22 marzo 2025. L’Auditorium Scavolini apre le porte.',start:{map:'scavolini',x:400,y:630},tasks:['n2_setup','n2_tick','n2_back','n2_cue','n2_fin']},{name:'Il giorno dopo',card:'Domenica. Il giorno dopo, tutta Pesaro corre.',start:{map:'pesaro',x:470,y:460},tasks:['n2_corsa']}],
  outro:'Otto speaker, quasi 40 volontari. TEDx Pesaro ha una casa.',stage:2025},
 {id:'2026',year:'2026',title:'TEDx Pesaro · Radici',intro:'2026. Terza edizione, “Radici”. Oltre al palco, le Adventure: eventi fuori dal palco, in giro per Pesaro, Fano e Gradara.',start:{map:'sede',x:260,y:290},
  phases:[{name:'Organizzazione',tasks:['n3_nome','n3_sp1','n3_sp2','n3_sp3','n3_rondine','n3_spons','n3_plus']},
   {name:'Adventure · febbraio e marzo',card:'Febbraio 2026. Le Adventure portano TEDx fuori dal palco.',start:{map:'pesaro',x:470,y:470},tasks:['n3_gen','n3_par','n3_gent','n3_cibo','n3_xrun']},
   {name:'22 marzo 2026 · Scavolini',card:'22 marzo 2026, dalle 15:30 alle 19:00. Radici.',start:{map:'scavolini',x:400,y:630},tasks:['n3_setup','n3_tick','n3_back','n3_cue','n3_fin']},
   {name:'Adventure · autunno',card:'Settembre e ottobre 2026. Le Adventure continuano.',start:{map:'pesaro',x:470,y:470},tasks:['n3_gquiz','n3_gdono','n3_abio','n3_fumetto']}],
  outro:'Otto interventi, nove speaker, oltre 600 biglietti. E un autunno di giochi, fumetti e solidarietà.',stage:2026},
 {id:'2027',year:'2027',title:'Verso il 21 marzo 2027',intro:'Autunno 2026, verso il 2027. I Consiglieri raccolgono le autocandidature per il palco.',start:{map:'pesaro',x:470,y:470},
  phases:[{name:'Verso il 2027',tasks:['n4_box','n4_vote','n4_niky','n4_end']}],outro:'Il 21 marzo 2027, all’Auditorium Scavolini, TEDx Pesaro tornerà. Il resto ancora da scrivere.',final:true}];

/* ===================== stato e flusso ===================== */
function newState(){return{ch:0,ph:0,done:{},sub:{},pts:0,met:{},spk:{},vol:0,tree:0,stage:{},map:'sede',score:{},ended:false};}
const curCh=()=>CH[G.ch],curPh=()=>CH[G.ch].phases[G.ph];
const phaseTasks=()=>curPh().tasks.map(id=>TASKS[id]);
const subCount=id=>Object.keys(G.sub[id]||{}).length;
function subDone(id,i){(G.sub[id]=G.sub[id]||{})[i]=1;}
function activeTasks(){return phaseTasks().filter(t=>!G.done[t.id]);}
function save(){if(!G)return;const d=Object.assign({},G,{map:G.map,x:PL.x,y:PL.y});lsSet('tedx.save',{G:d,P:PLAYER});}
function finishTask(id,pts,msg){if(G.done[id])return;G.done[id]=1;G.pts+=pts;G.tree++;A.stamp();toast((msg||'Fatto')+' · +'+pts,2800);save();STORY.populate(G.map);
  if(activeTasks().length===0)setTimeout(phaseComplete,900);}
function phaseComplete(){if(DL||MINI){return setTimeout(phaseComplete,600);}const ch=curCh();
  if(G.ph+1<ch.phases.length){G.ph++;const p=curPh();cardShow(p.name,p.card||'',()=>{fade(()=>{loadMap(p.start.map,p.start.x,p.start.y);const f=freeSpot(CURM,p.start.x,p.start.y);PL.x=f[0];PL.y=f[1];STORY.populate(CURM.id);save();});});}
  else chapterEnd();}
function chapterEnd(){const ch=curCh();if(ch.stage)G.stage[ch.stage]=1;save();
  const leaves=G.tree;const spkN=Object.keys(G.spk).length;
  const html=`<h2>${esc(ch.title)}</h2><p class="q">${esc(gx(ch.outro))}</p><canvas id="trc" width="260" height="170" style="width:100%;max-width:300px;display:block;margin:6px auto;image-rendering:pixelated;border-radius:10px"></canvas><div class="card"><div><b>Punti: ${G.pts}</b><small>Radici cresciute: ${leaves} · Speaker convinti: ${spkN} · Volontà reclutati: ${G.vol} · Persone del team incontrate: ${Object.keys(G.met).length}</small></div></div><div class="row"><button class="btn" id="chN">${ch.final?'Fine':'Capitolo successivo'}</button></div>`;
  openMini(html,{act:()=>$('#chN').click()});drawTree($('#trc'),leaves);A.fanfare();
  $('#chN').onclick=()=>{closeMini();if(ch.final)endGame();else{G.ch++;G.ph=0;save();startChapter(G.ch);}};}
function drawTree(cn,n){const c=cn.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#14141c';c.fillRect(0,0,260,170);c.fillStyle='#2a3a2a';c.fillRect(0,150,260,20);
  c.fillStyle='#6a4426';c.fillRect(124,90,12,62);for(let i=0;i<6;i++){c.fillRect(124-i*6,148,12+i*12,4);}
  c.fillStyle='#5a3a1c';c.fillRect(118,110,26,6);c.fillRect(110,100,12,6);c.fillRect(140,98,12,6);
  const r=mulberry32(77),N=Math.min(n,70);for(let i=0;i<N;i++){const a=r()*6.28,rad=10+r()*(40+Math.min(40,n)),x=130+Math.cos(a)*rad*1.2,y=80+Math.sin(a)*rad*.8;c.fillStyle=['#2f7a3a','#4aa84a','#e62b1e','#ffd24d'][i%4===3?3:i%4===2?2:i%2];c.fillRect(Math.round(x),Math.round(y),5,5);}
  c.fillStyle='#fff';c.font='8px '+PIX;c.textAlign='center';c.fillText('LE TUE RADICI',130,14);}
function startChapter(i){G.ch=i;G.ph=0;const ch=CH[i];mode='card';cardShow(ch.title,ch.intro+'\n\n'+ch.year,()=>{loadMap(ch.start.map,ch.start.x,ch.start.y);const f=freeSpot(CURM,ch.start.x,ch.start.y);PL.x=f[0];PL.y=f[1];mode='play';$('#hud').classList.remove('hide');STORY.populate(CURM.id);save();});}
function endGame(){mode='end';cardShow('FINE (PER ORA)','Hai vissuto TEDx Pesaro da volontario: dal TEDxPantano del 2024 alle radici del 2026, fino al 21 marzo 2027.\n\nPunti: '+G.pts+'\nRadici: '+G.tree+'\n\nGrazie a tutti i volontari di Spazio Rosso APS.\nProgetto interno non ufficiale, fatto con Claude Code.',()=>{location.reload();});}

/* ===================== STORY: ponte con il motore ===================== */
const AMB={
 sede:[['marina',110,255,0],['valerio',480,165,0],['lorenzo',80,80,0],['francesca',330,270,0],['damiana',240,255,3],['lucia',300,255,3]],
 pesaro:[],astra:[['valerio',60,120,1],['nicola',130,150,1]],
 scavolini:[['antonino',140,480,2],['valerio',620,500,2],['nicola',540,590,3],['tommaso',620,590,3],['marta',420,500,3],['daniele',640,150,3]]};
const CROWD={sede:0,pesaro:6,astra:0,scavolini:0,gradara:7,fano:7,farina:2,forum:3};
const LINES=['Che bella giornata per un TEDx.','Ho sentito dire che ci sono idee molto interessanti.','Sono venut{o|a} da fuori città: mi hanno parlato bene.','Peccato per la coda, ma ne valeva la pena.','Mi piace che sia fatto tutto da volontari.','Sai dov’è il bar?'];
const STORY={
 populate(mapId){NPCS=[];const m=MAPS[mapId];if(!m||!G)return;
  const ph=curPh(),tasks=phaseTasks().filter(t=>!G.done[t.id]&&t.map===mapId&&!t.multi);
  tasks.forEach(t=>{const w=t.who;NPCS.push({x:t.x,y:t.y,dir:0,name:w.name,role:w.role,p:w.p,mark:true,show:true,task:t.id});});
  const inTasks=new Set(tasks.map(t=>t.who&&t.who.key));
  (AMB[mapId]||[]).forEach(([k,x,y,minCh])=>{if(G.ch<minCh||inTasks.has(k))return;const T0=TEAM[k];if(!T0)return;const f=freeSpot(m,x,y);NPCS.push({x:f[0],y:f[1],dir:0,name:T0.n,role:T0.r,p:palOf(T0.n),team:k,show:true,talk:true});});
  const dday=/22 marzo/.test(ph.name||'');let nCrowd=CROWD[mapId]||0;if(dday&&(mapId==='astra'))nCrowd=12;if(dday&&mapId==='scavolini')nCrowd=G.ch>=3?18:14;
  const rr=mulberry32(hashStr('crowd'+mapId+G.ch+G.ph));
  const zone=mapId==='pesaro'?{x0:230,y0:190,x1:690,y1:470}:mapId==='astra'?{x0:16,y0:240,x1:540,y1:420}:mapId==='scavolini'?{x0:210,y0:470,x1:780,y1:650}:{x0:60,y0:180,x1:Math.min(740,m.w-60),y1:Math.min(400,m.h-60)};
  for(let i=0;i<nCrowd;i++){const nm=FN[Math.floor(rr()*FN.length)]+' '+LN[Math.floor(rr()*LN.length)];const x=zone.x0+rr()*(zone.x1-zone.x0),y=zone.y0+rr()*(zone.y1-zone.y0),f=freeSpot(m,x,y);NPCS.push({x:f[0],y:f[1],dir:0,name:nm,role:'Partecipante',p:palOf(nm),talk:true,show:false,wander:zone,t:rr()*2});}
  if(mapId==='scavolini'||mapId==='astra'){/* niente */}
 },
 entered(id){},
 interactables(mapId){const out=[];for(const t of activeTasks()){if(t.map!==mapId)continue;
    if(t.multi){t.multi.forEach((s,i)=>{if(G.sub[t.id]&&G.sub[t.id][i])return;out.push({x:s.x,y:s.y,r:26,label:s.label,fn:()=>t.sub(i,s)});});}
    else out.push({x:t.x,y:t.y,r:30,label:'Parla con '+t.who.name,fn:()=>t.run()});}
  for(const n of NPCS)if(n.talk)out.push({x:n.x,y:n.y,r:26,label:'Parla con '+n.name,fn:()=>ambient(n)});
  return out;},
 target(){const a=activeTasks();if(!a.length||mode!=='play')return null;
  const cur=CURM?CURM.id:null;let best=a.find(t=>t.map===cur&&!t.multi)||a.find(t=>t.map===cur)||a[0];
  if(best.multi){const i=best.multi.findIndex((s,k)=>!(G.sub[best.id]&&G.sub[best.id][k]));if(i<0)return null;const s=best.multi[i];return{map:best.map,x:s.x,y:s.y,label:s.label};}
  return{map:best.map,x:best.x,y:best.y,label:best.who.name};},
 drawWorld(c,m){for(const t of activeTasks()){if(!t.multi||t.map!==m.id)continue;t.multi.forEach((s,i)=>{if(G.sub[t.id]&&G.sub[t.id][i])return;const b=Math.sin(T*5+i)>0?0:1;c.fillStyle='#ffd24d';c.fillRect(Math.round(s.x)-3,Math.round(s.y)-16+b,6,6);c.fillStyle='#fff6c0';c.fillRect(Math.round(s.x)-1,Math.round(s.y)-15+b,2,2);c.fillStyle='rgba(255,210,77,.25)';c.beginPath();c.ellipse(s.x,s.y,9,4,0,0,7);c.fill();});}}
};
function ambient(n){if(n.team){G.met[n.team]=1;chain(n,[(TEAM[n.team]?'Io sono '+TEAM[n.team].n+': '+TEAM[n.team].r+'.':'Ciao!'),'Se ti serve una mano, sai dove trovarci. Grazie di essere con noi.'],()=>{save();});toast('Nel Taccuino: '+n.name,1800);return;}
  const r=mulberry32(hashStr(n.name+G.ch));chain(n,[LINES[Math.floor(r()*LINES.length)]]);}
function runTask(t){if(G.done[t.id])return;t.run();}

/* ===================== Taccuino ===================== */
let menuTab='ob';
function openMenu(){if(mode!=='play')return;MENUOPEN=true;$('#menu').classList.remove('hide');renderMenu();}
function closeMenu(){MENUOPEN=false;$('#menu').classList.add('hide');}
function renderMenu(){const b=$('#menuB');const tabs=[['ob','Obiettivi'],['team','Il team'],['stage','Il palco'],['note','Note'],['game','Partita']];
  let h=`<div class="tabs2">${tabs.map(t=>`<button data-t="${t[0]}" class="${menuTab===t[0]?'on':''}">${t[1]}</button>`).join('')}<button id="mx" style="margin-left:auto">Chiudi</button></div>`;
  if(menuTab==='ob'){const ch=curCh(),ph=curPh();h+=`<h2>${esc(ch.title)}</h2><p style="color:var(--dim)">${esc(ph.name)} · Punti ${G.pts} · Radici ${G.tree}</p>`+phaseTasks().map(t=>`<div class="card ${G.done[t.id]?'':'no'}" style="opacity:1"><div><b>${G.done[t.id]?'✓ ':''}${esc(t.label)}</b><small>${esc(MAPN[t.map]||t.map)}</small></div></div>`).join('');}
  else if(menuTab==='team'){h+='<h2>Il team</h2><p style="color:var(--dim)">Le persone che incontri nel gioco (nomi e ruoli da fonti pubbliche).</p>';for(const k of Object.keys(TEAM)){const t=TEAM[k],m=G.met[k];h+=`<div class="card ${m?'':'no'}">${faceImg(m?palOf(t.n):{shirt:'#333',pants:'#222',skin:'#555',hair:'#222'},'')}<div><b>${m?esc(t.n):'???'}</b><small>${m?esc(t.r):'Non ancora incontrat'+(isF(t.n)?'a':'o')}</small></div></div>`;}
    if(G.met.niky)h+=`<div class="card">${faceImg(Object.assign(palOf('Niky'),{shirt:'#2a5a8a',gphones:true}),'')}<div><b>Niky</b><small>Nuovo volontario del 2027</small></div></div>`;}
  else if(menuTab==='stage'){h+='<h2>Il palco</h2>';for(const y of [2024,2025,2026]){h+=`<h3>${y}</h3>`+SPK[y].map(n=>{const mine=G.spk[n],on=G.stage[y];return`<div class="card ${mine||on?'':'no'}"><div><b>${mine?'★ ':''}${esc(n)}</b><small>${esc(SPK_INFO[n]||'')}${SPK_TALK[n]?(SPK_INFO[n]?' · ':'')+'«'+esc(SPK_TALK[n])+'»':''}${mine?' · convint'+(isF(n)?'a':'o')+' da te':''}</small></div></div>`;}).join('');}
    h+='<p style="color:var(--dim)">★ = convinti da te. Gli altri compaiono quando l’edizione si conclude.</p>';}
  else if(menuTab==='note'){h+='<h2>Cosa è vero e cosa no</h2>'+NOTES.map(n=>`<h3>${esc(n[0])}</h3><p>${esc(n[1])}</p>`).join('');}
  else{h+=`<h2>Partita</h2><p>Punti ${G.pts} · Radici ${G.tree} · Capitolo ${G.ch+1}/${CH.length}</p><div class="row"><button class="btn" id="gSave">Salva ora</button><button class="btn ghost" id="gNew">Ricomincia da capo</button></div><p id="gMsg" style="color:var(--ok);min-height:20px"></p><p class="disc" style="color:var(--dim);font-size:12px">Il gioco si salva da solo a ogni compito. Per ora senza musica.</p>`;}
  b.innerHTML=h;b.querySelectorAll('[data-t]').forEach(x=>x.onclick=()=>{menuTab=x.dataset.t;renderMenu();});$('#mx').onclick=closeMenu;
  const s=$('#gSave');if(s)s.onclick=()=>{save();$('#gMsg').textContent='Salvato.';};const n=$('#gNew');if(n)n.onclick=()=>{if(confirm('Ricominciare da capo? Il salvataggio attuale verrà cancellato.')){try{localStorage.removeItem('tedx.save');}catch(e){}location.reload();}};}
$('#bMenu').onclick=()=>{if(mode==='play'&&!DL&&!MINI)openMenu();};

/* ===================== titolo e creazione personaggio ===================== */
function initTitle(){
  const sv=lsGet('tedx.save',null);$('#cont').classList.toggle('hide',!sv);
  const P=lsGet('tedx.player',null);if(P)Object.assign(PLAYER,P);$('#pname').value=PLAYER.name==='Volontario'?'':PLAYER.name;
  const mk=(id,arr,key)=>{const box=$(id);box.innerHTML='';arr.forEach((c,i)=>{const b=document.createElement('button');b.style.background=c;if(PLAYER[key]%arr.length===i)b.className='on';b.onclick=()=>{PLAYER[key]=i;box.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');prev();};box.appendChild(b);});};
  mk('#csh',SHIRTS,'si');mk('#csk',SKINC,'ki');mk('#chc',HAIRC,'hi');
  $('#gseg').querySelectorAll('button').forEach(b=>{b.classList.toggle('on',b.dataset.g===PLAYER.g);b.onclick=()=>{PLAYER.g=b.dataset.g;$('#gseg').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));};});
  $('#chs').querySelectorAll('button').forEach(b=>{b.classList.toggle('on',b.dataset.h===PLAYER.hs);b.onclick=()=>{PLAYER.hs=b.dataset.h;$('#chs').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));prev();};});
  const prev=()=>{const c=$('#tcv'),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#1b1b28';x.fillRect(0,0,150,150);x.fillStyle='#2d2d44';x.fillRect(0,120,150,30);x.save();x.scale(4.5,4.5);person(x,16.6,29,0,0,playerLook());x.restore();};prev();
  const begin=(g)=>{PLAYER.name=($('#pname').value.trim()||'Volontario').slice(0,16);lsSet('tedx.player',PLAYER);$('#title').classList.add('hide');A.init();G=g;mode='card';};
  $('#go').onclick=()=>{begin(newState());startChapter(0);};
  $('#cont').onclick=()=>{const s=lsGet('tedx.save',null);if(!s)return;Object.assign(PLAYER,s.P||{});begin(Object.assign(newState(),s.G));loadMap(G.map||'sede',s.G.x||260,s.G.y||290);mode='play';$('#hud').classList.remove('hide');STORY.populate(G.map);toast('Partita caricata',1800);};
}
/* HUD obiettivo */
setInterval(()=>{if(!G||mode!=='play')return;const ch=curCh(),ph=curPh(),a=activeTasks(),t=a.length?(a.find(x=>x.map===(CURM&&CURM.id))||a[0]):null;$('#obT').textContent=ch.year;$('#obS').textContent=ch.title+' · '+ph.name;
  $('#obG').textContent=t?'▶ '+t.label+(t.map!==(CURM&&CURM.id)?' · '+(MAPN[t.map]||t.map):''):'Tutto fatto: avanti!';},300);
window.STORY=STORY;initTitle();
