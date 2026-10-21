'use strict';
/* TEDx PESARO · dati: mappe, persone reali (nomi e ruoli da fonti pubbliche), quiz e contenuti. Dialoghi e scene sono inventati. */
function defMap(id,w,h,bg,rects,doors){MAPS[id]={id,w,h,bg,rects,doors:doors||[]};}
const R=(k,x,y,w,h,c,o)=>Object.assign({k,x,y,w,h,c},k==='wall'||k==='bldg'||k==='desk'||k==='table'||k==='counter'||k==='seats'||k==='stage'||k==='tree'||k==='water'||k==='sphere'||k==='car'||k==='shelf'?{s:1}:{},o||{});
const FRAME=(w,h,c,gx0,gx1)=>[R('wall',0,0,w,14,c),R('wall',0,0,14,h,c),R('wall',w-14,0,14,h,c),R('wall',0,h-14,gx0,14,c),R('wall',gx1,h-14,w-gx1,14,c)];

/* ---- SEDE di Spazio Rosso ---- */
defMap('sede',520,340,'#2a2a38',[
  R('floor',0,0,520,340,'#3a3a4a'),...FRAME(520,340,'#22222e',200,280),
  R('board',40,14,120,26,null,{t:'CALENDARIO',tc:'#222',ts:6}),R('board',360,14,110,26,null,{t:'IDEE',tc:'#222',ts:6}),
  R('rug',170,225,180,85,'#6a2a2a'),R('table',190,150,140,46,'#8a6a44',{t:'RIUNIONI',ts:6}),
  R('desk',60,110,110,28,'#7a5a3a'),R('desk',60,200,110,28,'#7a5a3a'),R('desk',350,110,110,28,'#7a5a3a'),R('desk',350,200,110,28,'#7a5a3a'),
  R('shelf',440,40,60,40,'#6a4a2a'),R('tree',30,270,36,40,'#2f7a3a'),R('tree',460,270,36,40,'#2f7a3a'),R('desk',420,276,70,30,'#8a2a2a')
],[{x:200,y:318,w:80,h:12,to:'pesaro',tx:115,ty:176,label:'ESCI',ly:-4,pushY:-6}]);

/* ---- PESARO ---- */
defMap('pesaro',960,600,'#2a2e3f',[
  R('floor',0,150,960,350,'#3a3f55'),R('rug',300,225,340,235,'#46405a'),R('floor',0,500,960,30,'#d8c48a'),R('water',0,530,960,70,'#1c5a8a'),
  R('bldg',40,20,150,130,'#7a4a4a',{t:'SPAZIO ROSSO',ts:6,ty:84}),R('bldg',230,20,190,130,'#8a6a3a',{t:'CINEMA TEATRO ASTRA',ts:6,ty:84}),
  R('bldg',460,20,130,130,'#b2432a',{t:'FARINA',ts:6,ty:84}),R('bldg',620,20,140,130,'#3a5a7a',{t:'FORUM DELLA CHIARA',ts:5,ty:84}),
  R('bldg',790,20,150,180,'#b01818',{t:'AUDITORIUM SCAVOLINI',ts:5,ty:100,win:'#ffdddd'}),
  R('bldg',30,240,112,46,'#6a5a3a',{t:'LIBRERIA CAMPUS',ts:5,ty:30}),R('bldg',30,300,112,46,'#4a4a6a',{t:'TRONY',ts:6,ty:30}),
  R('bldg',30,360,112,46,'#6a3a3a',{t:'FIGARO BAR',ts:6,ty:30}),R('bldg',30,420,112,46,'#3a6a5a',{t:'PIETRO LEO',ts:6,ty:30}),
  R('sphere',440,305,56,56,null,{s:1}),R('tree',680,255,40,46,'#2f7a3a'),R('tree',730,330,40,46,'#2f7a3a'),R('tree',210,260,40,46,'#2f7a3a'),R('tree',200,420,40,46,'#2f7a3a'),R('tree',560,440,40,46,'#2f7a3a'),
  R('wall',0,0,960,6,'#15151d'),R('wall',0,0,6,600,'#15151d')
],[
 {x:92,y:154,w:46,h:12,to:'sede',tx:260,ty:300,label:'SEDE',ly:-6},{x:302,y:154,w:46,h:12,to:'astra',tx:75,ty:400,label:'ASTRA',ly:-6},
 {x:502,y:154,w:46,h:12,to:'farina',tx:200,ty:210,label:'FARINA',ly:-6},{x:672,y:154,w:46,h:12,to:'forum',tx:230,ty:250,label:'FORUM',ly:-6},
 {x:842,y:204,w:46,h:12,to:'scavolini',tx:400,ty:640,label:'AUDITORIUM',ly:-6},
 {x:924,y:230,w:30,h:100,to:'fano',tx:60,ty:380,label:'FANO ▸',ly:-8},{x:924,y:360,w:30,h:100,to:'gradara',tx:60,ty:430,label:'GRADARA ▸',ly:-8}]);

/* ---- ASTRA (cinema-teatro, pianta inventata) ---- */
defMap('astra',560,440,'#1a1a24',[
  R('floor',0,230,170,210,'#4a3a30'),R('floor',170,90,390,350,'#2f2430'),R('floor',12,12,150,210,'#2a2a38'),
  ...FRAME(560,440,'#14141c',40,110),
  R('wall',150,12,12,125,'#14141c'),R('wall',150,175,12,50,'#14141c'),R('wall',12,218,48,12,'#14141c'),R('wall',100,218,62,12,'#14141c'),
  R('wall',160,230,12,75,'#14141c'),R('wall',160,355,12,75,'#14141c'),
  R('stage',212,14,300,86,null,{screen:1}),
  R('seats',195,150,110,190,'#7a2a2a'),R('seats',405,150,125,190,'#7a2a2a'),R('seats',195,350,335,50,'#7a2a2a'),
  R('desk',96,330,60,22,'#8a5a30',{t:'BIGLIETTI',ts:4}),R('counter',16,250,62,22,'#5a3a22',{t:'CAFFÈ',ts:5}),
  R('desk',24,50,64,24,'#8a6a8a',{t:'CAMERINO',ts:5}),R('desk',24,150,64,24,'#8a6a8a',{t:'REGIA',ts:5}),R('rug',60,250,60,40,'#5a2a2a'),R('tree',130,240,26,30,'#2f7a3a')
],[{x:44,y:416,w:62,h:12,to:'pesaro',tx:325,ty:178,label:'USCITA',ly:-6,pushY:-4}]);

/* ---- AUDITORIUM SCAVOLINI (pianta inventata a partire da quella pubblica: assetto teatrale) ---- */
defMap('scavolini',800,680,'#15151d',[
  R('floor',0,470,800,210,'#6d7280'),R('floor',40,12,720,92,'#222232'),R('floor',40,104,150,326,'#2e2a33'),R('floor',610,104,150,326,'#2e2a33'),R('floor',200,200,400,230,'#2b2b3a'),R('floor',190,104,420,96,'#222232'),
  R('wall',0,0,800,12,'#0c0c12'),R('wall',0,0,40,680,'#0c0c12'),R('wall',760,0,40,680,'#0c0c12'),R('wall',0,668,350,12,'#0c0c12'),R('wall',450,668,350,12,'#0c0c12'),
  R('wall',40,430,20,12,'#0c0c12'),R('wall',110,430,220,12,'#0c0c12'),R('wall',470,430,220,12,'#0c0c12'),R('wall',740,430,20,12,'#0c0c12'),
  R('wall',188,200,12,230,'#0c0c12'),R('wall',600,200,12,230,'#0c0c12'),
  R('curtain',330,418,25,16,null,{s:1}),R('curtain',445,418,25,16,null,{s:1}),R('steps',355,432,90,36,'#8a8a96'),R('steps',60,434,50,34,'#8a8a96'),R('steps',690,434,50,34,'#8a8a96'),
  R('stage',230,100,340,100,null,{screen:1,s:1}),
  R('seats',230,230,140,170,'#6a1a1a'),R('seats',430,230,140,170,'#6a1a1a'),R('floor',250,214,100,12,'#2b2b3a',{t:'PLATEA',ts:6,tc:'#aaa'}),
  R('seats',46,208,130,55,'#b8860b',{t:'E',ts:7}),R('seats',46,270,130,60,'#8a6a8a',{t:'D',ts:7}),R('seats',46,338,130,86,'#b8860b',{t:'C',ts:7}),
  R('seats',624,208,130,55,'#b8860b',{t:'G',ts:7}),R('seats',624,270,130,60,'#8a6a8a',{t:'H',ts:7}),R('seats',624,338,130,86,'#b8860b',{t:'A',ts:7}),
  R('desk',70,520,220,30,'#2a6ab0',{t:'ACCREDITAMENTO',ts:6}),R('desk',500,520,200,30,'#b07a2a',{t:'PARTNER',ts:6}),R('counter',560,620,180,28,'#5a3a22',{t:'BAR',ts:6}),
  R('desk',60,26,90,24,'#8a6a8a',{t:'CAMERINO 1',ts:5}),R('desk',170,26,90,24,'#8a6a8a',{t:'CAMERINO 2',ts:5}),R('desk',540,26,90,24,'#8a6a8a',{t:'REGIA',ts:5}),R('desk',650,26,90,24,'#8a6a8a',{t:'STAGE MGR',ts:5}),
  R('tree',60,590,34,40,'#2f7a3a'),R('tree',700,560,34,40,'#2f7a3a'),R('rug',320,590,160,60,'#6a2a2a',{t:'FOYER',ts:6,tc:'#ddd'})
],[{x:352,y:656,w:96,h:12,to:'pesaro',tx:865,ty:224,label:'USCITA',ly:-6,pushY:-4}]);

/* ---- FARINA PIZZERIA ---- */
defMap('farina',400,260,'#3a2a22',[
  R('floor',0,0,400,260,'#6a4a30'),...FRAME(400,260,'#2a1a14',160,240),
  R('counter',20,24,150,28,'#b2432a',{t:'FORNO',ts:6}),R('table',60,110,60,36,'#d8c8a0'),R('table',240,110,60,36,'#d8c8a0'),R('table',150,170,60,36,'#d8c8a0'),R('table',300,50,60,36,'#d8c8a0'),R('tree',350,200,30,36,'#2f7a3a')
],[{x:160,y:240,w:80,h:12,to:'pesaro',tx:525,ty:180,label:'ESCI',ly:-4,pushY:-6}]);
/* ---- FORUM DELLA CHIARA (coworking) ---- */
defMap('forum',460,300,'#22303a',[
  R('floor',0,0,460,300,'#4a5a6a'),...FRAME(460,300,'#18222a',190,270),
  R('board',120,16,220,30,null,{t:'GEN-E-RAZIONI',tc:'#222',ts:7}),R('seats',70,120,120,90,'#3a5a7a'),R('seats',270,120,120,90,'#3a5a7a'),R('desk',180,60,100,24,'#8a6a44'),R('desk',20,230,90,24,'#7a5a3a'),R('desk',350,230,90,24,'#7a5a3a'),R('tree',410,40,28,34,'#2f7a3a')
],[{x:190,y:278,w:80,h:12,to:'pesaro',tx:695,ty:180,label:'ESCI',ly:-4,pushY:-6}]);
/* ---- GRADARA (Gradara Ludens 19-20 settembre 2026) ---- */
defMap('gradara',800,500,'#3a6a3a',[
  R('grass',0,0,800,500,'#3a6a3a'),R('floor',0,140,800,310,'#7a6a58'),
  R('bldg',200,10,400,120,'#8a7a68',{t:'GRADARA',ts:9,ty:72,win:'#222'}),R('bldg',40,160,150,100,'#a89a82',{t:'MARV',ts:8,ty:60,win:'#333'}),
  R('bldg',320,200,180,62,'#e62b1e',{t:'TEDx PESARO',ts:6,ty:30,win:'#e62b1e'}),R('desk',560,200,100,40,'#8a5a30',{t:'DONA IL TUO GIOCO',ts:4}),
  R('tree',700,170,44,48,'#2f7a3a'),R('tree',20,300,44,48,'#2f7a3a'),R('tree',730,380,44,48,'#2f7a3a'),R('tree',150,400,44,48,'#2f7a3a'),
  R('wall',0,0,800,6,'#15151d'),R('wall',0,0,6,500,'#15151d')
],[{x:340,y:482,w:120,h:12,to:'pesaro',tx:900,ty:430,label:'◂ PESARO',ly:-6,pushY:-6}]);
/* ---- FANO (MeMo e Piazza Amiani, Fano Comics 17 ottobre 2026) ---- */
defMap('fano',760,440,'#3a4a5a',[
  R('floor',0,0,760,440,'#6a6660'),R('bldg',70,30,220,120,'#8a6a4a',{t:'MeMo MEDIATECA',ts:6,ty:72}),
  R('bldg',360,30,120,80,'#4a6a8a',{t:'CASA FANO',ts:6,ty:50}),R('bldg',560,30,140,100,'#a8683a',{t:'PIAZZA AMIANI',ts:5,ty:60}),
  R('bldg',420,190,160,50,'#e62b1e',{t:'TEDx PESARO',ts:6,ty:24,win:'#e62b1e'}),R('bldg',80,260,120,44,'#3a8a5a',{t:'ACCA ACADEMY',ts:5,ty:24}),R('desk',620,300,100,34,'#8a5a30',{t:'FUMETTI',ts:6}),
  R('tree',30,170,40,44,'#2f7a3a'),R('tree',700,200,40,44,'#2f7a3a'),R('tree',320,340,40,44,'#2f7a3a'),
  R('wall',0,0,760,6,'#15151d'),R('wall',0,0,6,440,'#15151d')
],[{x:340,y:422,w:120,h:12,to:'pesaro',tx:900,ty:290,label:'◂ PESARO',ly:-6,pushY:-6}]);

/* ---------- persone reali (ruoli da fonti pubbliche) ---------- */
const TEAM={
 christian:{n:'Christian Carbonari',r:'Licensee & Organizer, presidente di Spazio Rosso'},
 paolo:{n:'Paolo Pagnini',r:'Co-organizzatore 2024, fondatore'},
 antonino:{n:'Antonino Di Gregorio',r:'Event Manager'},
 marina:{n:'Marina Roselli',r:'Project Manager'},
 valerio:{n:'Valerio Gioviani',r:'Media Manager'},
 lorenzo:{n:'Lorenzo Donzelli',r:'Fondatore, direttivo'},
 francesca:{n:'Francesca Carbonari',r:'Fondatrice, assistenza di sala'},
 alessandra:{n:'Alessandra Giardina',r:'Team organizzativo 2025'},
 damiana:{n:'Damiana Covre',r:'Speaker Curator'},
 lucia:{n:'Lucia Pascali',r:'Speaker Curator'},
 daniele:{n:'Daniele De Angelis',r:'Stage Manager'},
 claudia:{n:'Claudia Pintus',r:'Fundraising Manager'},
 marta:{n:'Marta Grima',r:'Ufficio stampa'},
 jordan:{n:'Jordan Puzzo',r:'Legal Advisor'},
 massimo:{n:'Massimo Righi',r:'Responsabile XRun'},
 nicola:{n:'Nicola Pascucci',r:'Video maker'},
 tommaso:{n:'Tommaso Rosa',r:'Social media manager'},
 laura:{n:'Laura Saffiotti',r:'LinkedIn manager'},
 elmir:{n:'Elmir Mustafic',r:'Sviluppatore web'},
 mara:{n:'Mara Cardinali',r:'Web designer'},
 elisa:{n:'Elisa Paolucci',r:'Segreteria'},
 giulia:{n:'Giulia Dominici',r:'Content manager'},
 sara:{n:'Sara Giannessi',r:'Presentatrice 2026 (essenonesiste)'},
 silvia:{n:'Silvia Sacchi',r:'Presentatrice 2024'}
};
const SPK={
 2024:['Carlo Pagnini','Davide Bertozzi','Francesca Cavalli (LaFra)','Paolo Ercolani','Marco Fabiani','Cecilia Felici','Maury Incen','Gabriele Pagnini','Maruska Palazzi','Anna Prouse'],
 2025:['Aurora Ruffino','Fabrizio Coppola','Sally Galotti','Zico Pieri','Tullia Venturi','Marco Cattaneo','Giorgia Righi','Vera Gheno'],
 2026:['Fabio Zaffagnini','Studentesse del Progetto Rondine','Gabriella Greison','Max Mariola','Fabio Salbitano','Alessandra Battaglia','Rodolfo Canestrari','Michele Giannasi']};
const SPK_INFO={'Gabriele Pagnini':'life & business coach e divulgatore','Zico Pieri':'mental coach e atleta ultraendurance','Vera Gheno':'sociolinguista','Aurora Ruffino':'autrice e attrice','Gabriella Greison':'fisica e scrittrice','Fabio Zaffagnini':'ideatore di Rockin’1000','Max Mariola':'chef','Fabio Salbitano':'ecologo forestale','Alessandra Battaglia':'attrice e docente di voce','Rodolfo Canestrari':'ricercatore di astrofisica','Michele Giannasi':'UX e service designer','Sally Galotti':'designer','Tullia Venturi':'medica e attivista','Marco Cattaneo':'giornalista sportivo','Giorgia Righi':'psicologa e mental coach','Fabrizio Coppola':'cantautore e scrittore'};
const SPK_TALK={'Vera Gheno':'L’intreccio che ci sfugge: la complessa relazione tra realtà e lingua','Zico Pieri':'La magia del confine tra il possibile e l’impossibile','Aurora Ruffino':'Sulla punta dei peli del coniglio bianco','Gabriella Greison':'La lunghezza d’onda della felicità','Fabio Zaffagnini':'Perché l’intelligenza artificiale ha bisogno della creatività umana','Max Mariola':'Come le materie prime raccontano la tradizione della cucina italiana','Fabio Salbitano':'Alle radici delle radici','Alessandra Battaglia':'La meraviglia della voce','Rodolfo Canestrari':'Quando le tue radici sono lunghe 15.000 chilometri','Michele Giannasi':'Come il design può cambiare il mondo in cui viviamo','Sally Galotti':'L’umanizzazione pittorica colora gli ospedali','Tullia Venturi':'QWW: intrecci di (r)esistenze','Marco Cattaneo':'GPS: il Giornalismo, i più Piccoli e lo Sport','Giorgia Righi':'Luce e oscurità','Fabrizio Coppola':'Scimmie, uomini e marziani','Studentesse del Progetto Rondine':'Radici diverse, una sola umanità'};

/* regole TEDx per il quiz della licenza */
const RULES_Q=[
 {q:'Quanto dura, di norma, un talk TEDx?',o:['Meno di 18 minuti','Un’ora e mezza','Almeno 40 minuti'],a:0,e:'Di norma sotto i 18 minuti. Più breve è spesso meglio.'},
 {q:'Si può pagare uno speaker per salire sul palco?',o:['Sì, è la regola','No: gli speaker non vengono pagati né pagano','Solo se è famoso'],a:1,e:'Gli speaker non sono pagati e non pagano per parlare.'},
 {q:'Sul palco TEDx sono ammessi panel e domande dal pubblico?',o:['Sì, sempre','No: solo talk preparati','Solo a fine giornata'],a:1,e:'Nelle sessioni di palco niente panel né Q&A col pubblico.'},
 {q:'Gli sponsor possono decidere i contenuti dei talk?',o:['No, nessun controllo editoriale','Sì, se pagano di più','Solo il main sponsor'],a:0,e:'Gli sponsor non hanno controllo editoriale.'},
 {q:'Come si sceglie il nome di un TEDx?',o:['Libero, a fantasia','Basato sul luogo (città, quartiere, via)','Sempre il nome del fondatore'],a:1,e:'Un nome basato sul luogo, approvato da TED. Per questo “Pantano” nel 2024.'}];
/* quiz di cultura generale (postazione di Gradara Ludens) */
const GEN_Q=[
 {q:'Quale pianeta è chiamato il pianeta rosso?',o:['Marte','Venere','Giove'],a:0},
 {q:'In che regione si trova Pesaro?',o:['Marche','Umbria','Abruzzo'],a:0},
 {q:'Chi dipinse la Gioconda?',o:['Michelangelo','Leonardo da Vinci','Raffaello'],a:1},
 {q:'Qual è il fiume più lungo d’Italia?',o:['Po','Tevere','Adige'],a:0},
 {q:'Quanti sono i lati di un esagono?',o:['Cinque','Sei','Otto'],a:1},
 {q:'Chi è il compositore pesarese dell’“Barbiere di Siviglia”?',o:['Verdi','Rossini','Puccini'],a:1},
 {q:'Che mare bagna Pesaro?',o:['Adriatico','Tirreno','Ionio'],a:0},
 {q:'Quante ore ha un giorno?',o:['12','24','36'],a:1}];
/* candidati inventati per il voto dei Consiglieri 2027 (nomi e idee di fantasia) */
const CANDS=[
 {n:'Greta Mirelli',j:'Biologa marina',i:'Le alghe che raccontano il mare di Pesaro'},{n:'Tobia Leoni',j:'Falegname',i:'Costruire un mestiere che non si vede più'},
 {n:'Noemi Carrara',j:'Studentessa di liceo',i:'Perché i giovani non stanno zitti'},{n:'Ettore Bassi',j:'Pasticciere',i:'La ricetta come eredità'},
 {n:'Linda Fontana',j:'Ingegnera ambientale',i:'Le città che respirano'},{n:'Mauro Rinaldi',j:'Ex maratoneta',i:'Dopo il traguardo'},
 {n:'Ilenia Sartori',j:'Archivista',i:'Cosa ricorda una città'},{n:'Dario Venturelli',j:'Musicista di strada',i:'Il silenzio prima della nota'}];
const COMIC_Q=[
 {t:'Chi è il protagonista del tuo fumetto?',o:[['Una volpe curiosa','una volpe curiosa'],['Un robot gentile','un robot gentile'],['Una bambina con un mantello','una bambina con un mantello']]},
 {t:'Che problema deve affrontare?',o:[['Si è persa nel bosco','si perde nel bosco'],['Ha perso la sua voce','perde la voce'],['Non riesce a fare amicizia','non riesce a fare amicizia']]},
 {t:'Come finisce?',o:[['Grazie a un’idea pazza','ritrova la strada grazie a un’idea pazza'],['Con l’aiuto di un amico','ce la fa con l’aiuto di un amico'],['Raccontando la sua storia a tutti','racconta la sua storia a tutti e cambia le cose']]}];

/* traccia di cosa è reale e cosa è inventato (mostrata nel Taccuino) */
const NOTES=[
 ['Reale (fonti pubbliche)','Date e luoghi delle edizioni: 22 marzo 2024 (Cinema Teatro Astra, TEDxPantano, “Limiti”), 22 marzo 2025 (Auditorium Scavolini, “Intrecci”), 22 marzo 2026 (Auditorium Scavolini, “Radici”), 21 marzo 2027 (registrata su TED). Spazio Rosso APS fondata il 1° febbraio 2024. Nomi e ruoli del team come da sito, speaker e titoli dei talk come da programmi pubblici, Adventure del 2026 (Gen-E-razioni, Le radici della gentilezza, Tradisci le radici del cibo, Le parole sono immagini, XRun), Gradara Ludens 19–20 settembre, consegna ad ABIO il 12 ottobre, Fano Comics 17 ottobre.'],
 ['Raccontato dal team','Il viaggio in America per la licenza TEDx.'],
 ['Inventato','Tutti i dialoghi, le personalità e le reazioni dei personaggi (anche di quelli con nome reale), gli ospiti fittizi (gestore dell’Astra, cittadini da reclutare, candidati 2027, referenti di aziende), le piante dell’Astra e dell’Auditorium nei dettagli, i minigiochi.'],
 ['Da verificare','Volontari e Adventure del 2024 e 2025 (non ci sono liste pubbliche), numero esatto dei giochi di Gradara, tema e speaker 2027.'],
 ['Easter egg 2027','Nel 2027 compare un nuovo volontario che porta la firma di chi ha fatto il gioco.']];

/* slide dei talk mostrate durante il timer: inventate (generiche), i titoli sono quelli pubblici */
const SLIDES={'Gabriele Pagnini':['Ingegneria del Pensiero','Come pensiamo prima di decidere','Un esempio di tutti i giorni','Cambiare il modo di guardare un problema','Una sola idea da portare a casa'],
 'Zico Pieri':['La magia del confine tra il possibile e l\u2019impossibile','Dove finisce il limite?','Un passo dopo l\u2019altro','Il confine si sposta','Quello che resta dopo il traguardo'],
 'Rodolfo Canestrari':['Quando le tue radici sono lunghe 15.000 chilometri','Da dove veniamo, davvero?','Una storia scritta nelle stelle','Origine e futuro','Guardare in alto per capire dove siamo']};
