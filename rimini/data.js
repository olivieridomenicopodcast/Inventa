'use strict';
/* RIMINI · contenuti del gioco.
   Tutto ciò che è "reale" sta qui, con il flag `ok` (verificato da fonti pubbliche) o `ok:false` (da verificare).
   Per aggiornare il programma o gli speaker basta modificare questo file. */

const EVENT={
  name:'Marketers World',
  year:2026,
  dates:'16–18 ottobre 2026',
  place:'Palacongressi di Rimini · via della Fiera 23',
  hours:'ingresso circa dalle 9 alle 19',
  src:'riminiturismo.it, marketersworld.net (pagine pubbliche)'
};

/* Persone reali legate a Marketers, con i ruoli riportati da fonti pubbliche.
   Nel gioco compaiono solo con una scheda informativa e un saluto cordiale. */
const FAMILY=[
  {id:'dario',name:'Dario Vignali',role:'Fondatore di Marketers',facts:['Nel 2013 ha aperto il blog dariovignali.net.','Nel 2015 dal blog è nata la community Marketers.','Nel 2018 ha ideato con Luca Cresi Ferrari il Marketers World.'],hair:'#3a2a1c',shirt:'#1d2b4a',skin:'#e8b98a',where:{f:0,x:222,y:78}},
  {id:'luca',name:'Luca Cresi Ferrari',role:'Co-fondatore e COO di Marketers',facts:['Cura strategia, organizzazione e gestione delle persone.','Marketers lavora da oltre dieci anni a distanza, con più di 60 persone nel team.','Con Dario Vignali ha fondato la community Marketers.'],hair:'#2a2118',shirt:'#3b3b3b',skin:'#e6b48c',where:{f:0,x:418,y:78}},
  {id:'emanuele',name:'Emanuele Amodeo',role:'Fondatore di Marketers Accelerator e Yoga Academy',facts:['Marketers Accelerator è l’agenzia del gruppo.','Con Dario e Luca ha sviluppato il progetto Marketers Accelerator.'],hair:'#201812',shirt:'#8a2a2a',skin:'#dfae80',where:{f:0,x:66,y:112}},
  {id:'paolo',name:'Paolo Bacchi',role:'Creative Director della Marketers Family',facts:['Si occupa delle riprese e della parte creativa.','Ha lavorato con tanti partner di Marketers.'],hair:'#5a4630',shirt:'#2a5a4a',skin:'#e8b98a',where:{f:0,x:432,y:176}},
  {id:'vittorio',name:'Vittorio Civinini',role:'Insegnante nei corsi Marketers Pro',facts:['Compare tra i docenti dei corsi Marketers Pro.'],hair:'#2a2420',shirt:'#4a3a6a',skin:'#e0b085',where:{f:0,x:66,y:196}},
  {id:'mastella',name:'Luca Mastella',role:'Growth hacker nel team Marketers',facts:['È entrato a far parte del team Marketers come growth hacker.'],hair:'#7a5a2a',shirt:'#2a6a8a',skin:'#e8b98a',where:{f:0,x:560,y:300}},
  {id:'bottoni',name:'Andrea Bottoni',role:'Marketers Family Member',facts:['Viene presentato come membro della Marketers Family.'],hair:'#3a2a20',shirt:'#6a3a2a',skin:'#e4b288',where:{f:0,x:524,y:338}},
  {id:'elio',name:'Elio Amato',role:'Insegnante del corso Business Alchemy',facts:['Tra gli insegnanti del corso Business Alchemy.'],hair:'#25201c',shirt:'#5a2a5a',skin:'#dcae82',where:{f:0,x:588,y:112}}
];

/* Speaker annunciati per il 2026 secondo una fonte pubblica (da verificare con il programma ufficiale). */
const SPEAKERS=[
  {name:'Virginia Gambardella',ok:false,where:{f:1,x:230,y:372}},
  {name:'Camilla Brossa',ok:false,where:{f:1,x:430,y:372}},
  {name:'Mr Nobody',ok:false,where:{f:1,x:260,y:352}},
  {name:'Arianna Cavina',ok:false,where:{f:1,x:400,y:352}}
];

/* Fatti veri sull'evento e sul luogo, usati nei cartelli e nei dialoghi. */
const FACTS={
  piazza:'Sala della Piazza · piano terra · circa 70 × 67,7 m · circa 4.700 posti',
  anfi:'Sala dell’Anfiteatro · primo piano · 1.540 posti fissi',
  palazzo:'Il Palacongressi di Rimini ha sale da 20 a 4.700 persone e 11.000 mq di area espositiva.',
  nato:'Il Marketers World è nato nel 2018 da un’idea di Dario Vignali e Luca Cresi Ferrari.',
  rimini:'Dal 2023 si tiene a Rimini, al Palacongressi (il 2026 è la quarta edizione di fila).',
  fri:'Il venerdì è dedicato ai workshop tematici da prenotare con l’app.',
  wk:'Sabato e domenica sul palco ci sono speech e momenti di aggregazione.',
  app:'L’app ufficiale contiene il biglietto con QR, i workshop, il programma e il networking: si propongono incontri con orario e punto d’incontro.',
  off:'Gli appuntamenti Offworld sono party, karaoke, side events e after.',
  num:'Gli organizzatori parlano di oltre 18.000 partecipanti complessivi nelle edizioni passate.'
};

/* Programma generico: orari indicativi (ingresso circa 9–19). Da sostituire con quello ufficiale. */
const PROGRAMMA=[
  {d:0,t:'09:00',e:'Apertura Palacongressi e accrediti',w:'foyer'},
  {d:0,t:'10:00',e:'Workshop tematici (prenotati con l’app)',w:'work',n:'ws'},
  {d:0,t:'11:30',e:'Workshop tematici',w:'work',n:'ws'},
  {d:0,t:'13:00',e:'Pausa pranzo e networking',w:'lounge'},
  {d:0,t:'14:30',e:'Workshop tematici',w:'work',n:'ws'},
  {d:0,t:'16:00',e:'Workshop tematici',w:'work',n:'ws'},
  {d:0,t:'17:30',e:'Workshop tematici',w:'work',n:'ws'},
  {d:0,t:'20:30',e:'Offworld: party, karaoke e side events',w:'tent',n:'off'},
  {d:1,t:'09:00',e:'Apertura e saluto dal palco principale',w:'main',n:'talk'},
  {d:1,t:'10:30',e:'Speech dal palco principale',w:'main',n:'talk'},
  {d:1,t:'12:00',e:'Pausa pranzo e networking',w:'lounge'},
  {d:1,t:'14:30',e:'Speech dal palco principale',w:'main',n:'talk'},
  {d:1,t:'16:00',e:'Speech dal palco principale',w:'main',n:'talk'},
  {d:1,t:'17:30',e:'Speech dal palco principale',w:'main',n:'talk'},
  {d:1,t:'20:30',e:'Offworld: party, karaoke e side events',w:'tent',n:'off'},
  {d:2,t:'09:00',e:'Apertura e saluto dal palco principale',w:'main',n:'talk'},
  {d:2,t:'10:30',e:'Speech dal palco principale',w:'main',n:'talk'},
  {d:2,t:'12:00',e:'Pausa pranzo e networking',w:'lounge'},
  {d:2,t:'14:30',e:'Speech dal palco principale',w:'main',n:'talk'},
  {d:2,t:'16:00',e:'Speech dal palco principale',w:'main',n:'talk'},
  {d:2,t:'17:30',e:'Chiusura dei tre giorni sul palco',w:'main',n:'talk'}
];
const DAYNAMES=['Venerdì 16','Sabato 17','Domenica 18'];

const TIPS={
  pod:['Registra un trailer di 40 secondi e mettilo nei primi episodi.','Chiedi a ogni ospite una frase da usare come clip.','Un formato riconoscibile ogni settimana batte il caos quotidiano.'],
  soc:['Il gancio dei primi 3 secondi decide tutto.','Pubblica meno ma rispondi ai commenti entro un’ora.','Riusa un contenuto in tre formati diversi.'],
  ai:['Automatizza prima il compito che odi di più.','Scrivi bene la richiesta: contesto, esempio, formato.','Tieni sempre un controllo umano sull’output finale.'],
  sale:['Ogni funnel ha un solo obiettivo per passaggio.','Il follow-up fa metà del lavoro.','Offri un primo passo piccolo e facile da accettare.'],
  brand:['Racconta il percorso, non solo il risultato.','Scegli tre temi e ripetili per un anno.','Costruisci una lista email: l’audience è tua.'],
  vid:['Il suono conta più della risoluzione.','Taglia i primi 5 secondi di ogni video.','Sottotitoli sempre.'],
  mind:['Pianifica il giorno prima, non la mattina stessa.','Una priorità vera ogni giorno.','Il riposo fa parte del lavoro.']
};
const TIPKEYS=Object.keys(TIPS);

const ATT_FIRST=['Giulia','Marco','Chiara','Luca','Sara','Matteo','Elena','Davide','Francesca','Andrea','Martina','Simone','Alessia','Federico','Valentina','Paolo','Silvia','Riccardo','Federica','Nicola','Ilaria','Stefano','Laura','Giacomo','Beatrice','Tommaso','Arianna','Lorenzo','Camilla'];
const ATT_LAST=['Rossi','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo','Conti','De Luca','Mancini','Costa','Giordano','Rizzo','Lombardi','Moretti','Barbieri','Fontana','Santoro'];
const ATT_JOBS=['podcaster','social media manager','videomaker','copywriter','freelance','e-commerce manager','coach','consulente AI','media buyer','grafica e illustratrice','fondatore di una startup','content creator'];
const ATT_CITY=['Milano','Roma','Torino','Bologna','Napoli','Firenze','Bari','Padova','Verona','Pesaro','Cagliari','Palermo','Genova','Trento','Perugia','Brescia','Udine','Catania','Lecce','Ancona'];

const STANDS=[
  {id:'acc',label:'Marketers Accelerator',short:'ACCEL.',color:'#ff6a3d',info:'Marketers Accelerator è l’agenzia del gruppo Marketers.',x:66,y:140},
  {id:'pro',label:'Marketers Pro',short:'PRO',color:'#4dd0ff',info:'Marketers Pro raccoglie i corsi e le formazioni del gruppo.',x:66,y:224},
  {id:'yoga',label:'Yoga Academy',short:'YOGA',color:'#7ad37a',info:'Yoga Academy è uno dei progetti di Dario Vignali e dei suoi soci.',x:128,y:112},
  {id:'tool',label:'Stand di strumenti e software',short:'TOOL',color:'#b57bff',info:'Qui si scoprono le novità: tool, piattaforme e servizi per chi lavora online.',x:128,y:196},
  {id:'mkt',label:'Area sponsor',short:'SPONSOR',color:'#ffd24d',info:'Gli sponsor dell’evento presentano i propri servizi.',x:128,y:280}
];
