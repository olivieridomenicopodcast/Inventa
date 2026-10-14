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
  {id:'dario',name:'Dario Vignali',role:'Fondatore di Marketers',facts:['Nel 2013 ha aperto il blog dariovignali.net.','Nel 2015 dal blog è nata la community Marketers.','Nel 2018 ha ideato con Luca Cresi Ferrari il Marketers World.'],hair:'#3a2a1c',shirt:'#1d2b4a',skin:'#e8b98a',where:{f:0,x:520,y:312}},
  {id:'luca',name:'Luca Cresi Ferrari',role:'Co-fondatore e COO di Marketers',facts:['Cura strategia, organizzazione e gestione delle persone.','Marketers lavora da oltre dieci anni a distanza, con più di 60 persone nel team.','Con Dario Vignali ha fondato la community Marketers.'],hair:'#2a2118',shirt:'#3b3b3b',skin:'#e6b48c',where:{f:0,x:790,y:312}},
  {id:'emanuele',name:'Emanuele Amodeo',role:'Fondatore di Marketers Accelerator e Yoga Academy',facts:['Marketers Accelerator è l’agenzia del gruppo.','Con Dario e Luca ha sviluppato il progetto Marketers Accelerator.'],hair:'#201812',shirt:'#8a2a2a',skin:'#dfae80',where:{f:0,x:500,y:240}},
  {id:'paolo',name:'Paolo Bacchi',role:'Creative Director della Marketers Family',facts:['Si occupa delle riprese e della parte creativa.','Ha lavorato con tanti partner di Marketers.'],hair:'#5a4630',shirt:'#2a5a4a',skin:'#e8b98a',where:{f:0,x:800,y:400}},
  {id:'vittorio',name:'Vittorio Civinini',role:'Insegnante nei corsi Marketers Pro',facts:['Compare tra i docenti dei corsi Marketers Pro.'],hair:'#2a2420',shirt:'#4a3a6a',skin:'#e0b085',where:{f:0,x:575,y:240}},
  {id:'mastella',name:'Luca Mastella',role:'Growth hacker nel team Marketers',facts:['È entrato a far parte del team Marketers come growth hacker.'],hair:'#7a5a2a',shirt:'#2a6a8a',skin:'#e8b98a',where:{f:0,x:250,y:672}},
  {id:'bottoni',name:'Andrea Bottoni',role:'Marketers Family Member',facts:['Viene presentato come membro della Marketers Family.'],hair:'#3a2a20',shirt:'#6a3a2a',skin:'#e4b288',where:{f:0,x:330,y:676}},
  {id:'elio',name:'Elio Amato',role:'Insegnante del corso Business Alchemy',facts:['Tra gli insegnanti del corso Business Alchemy.'],hair:'#25201c',shirt:'#5a2a5a',skin:'#dcae82',where:{f:0,x:920,y:230}}
];

/* Speaker annunciati per il 2026 secondo una fonte pubblica (da verificare con il programma ufficiale). */
const SPEAKERS=[
  {name:'Virginia Gambardella',ok:false,where:{f:1,x:540,y:600}},
  {name:'Camilla Brossa',ok:false,where:{f:1,x:730,y:600}},
  {name:'Mr Nobody',ok:false,where:{f:1,x:580,y:640}},
  {name:'Arianna Cavina',ok:false,where:{f:1,x:690,y:640}}
];

/* Fatti veri sull'evento e sul luogo, usati nei cartelli e nei dialoghi. */
const FACTS={
  piazza:'Sala della Piazza · piano terra · circa 70 × 67,7 m · circa 4.700 posti',
  anfi:'Sala dell’Anfiteatro · primo piano · 1.540 posti fissi',
  palazzo:'Il Palacongressi di Rimini ha sale da 20 a 4.700 persone e 11.000 mq di area espositiva.',
  nato:'Il Marketers World è nato nel 2018 da un’idea di Dario Vignali e Luca Cresi Ferrari.',
  rimini:'Si tiene a Rimini, al Palacongressi, per il quarto anno consecutivo.',
  fri:'Il venerdì è dedicato ai workshop tematici da prenotare con l’app.',
  wk:'Sabato e domenica sul palco ci sono speech e momenti di aggregazione.',
  app:'L’app ufficiale contiene il biglietto con QR, i workshop, il programma e il networking: si propongono incontri con orario e punto d’incontro.',
  off:'Gli appuntamenti Offworld sono party, karaoke, side events e after.',
  num:'Gli organizzatori parlano di oltre 18.000 partecipanti complessivi nelle edizioni passate.'
};

/* Il programma (speech e workshop) è inventato: titoli, speaker e contenuti non sono quelli ufficiali. */
const PROGRAMMA=[];
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
  {id:'acc',label:'Marketers Accelerator',short:'ACCEL.',color:'#ff6a3d',info:'Marketers Accelerator è l’agenzia del gruppo Marketers.',x:500,y:208},
  {id:'pro',label:'Marketers Pro',short:'PRO',color:'#4dd0ff',info:'Marketers Pro raccoglie i corsi e le formazioni del gruppo.',x:575,y:208},
  {id:'yoga',label:'Yoga Academy',short:'YOGA',color:'#7ad37a',info:'Yoga Academy è uno dei progetti di Dario Vignali e dei suoi soci.',x:650,y:208},
  {id:'tool',label:'Stand di strumenti e software',short:'TOOL',color:'#b57bff',info:'Qui si scoprono le novità: tool, piattaforme e servizi per chi lavora online.',x:725,y:208},
  {id:'mkt',label:'Area sponsor',short:'SPONSOR',color:'#ffd24d',info:'Gli sponsor dell’evento presentano i propri servizi.',x:800,y:208}
];

/* ============================================================ speech e workshop (inventati) */
/* slide: [titolo, [punto1, punto2], frase dello speaker, appunto da segnare] */
const TALKS=[
 {title:'Il podcast è un rapporto, non un canale',speaker:'Ottavia Brandolini',role:'Podcaster e consulente editoriale',topic:'pod',pal:{shirt:'#7a3a5a',skin:'#e8b98a',hair:'#2a1d14',long:true},slides:[
  ['Ascolti ≠ ascoltatori',['Un download non è una persona','Conta chi torna alla puntata dopo'],'Quando ho iniziato guardavo i numeri. Poi ho capito che dietro ogni ascolto c’è qualcuno che ha deciso di darmi venti minuti.','Misura chi torna, non chi scarica.'],
  ['Un formato riconoscibile',['Stessa apertura, stesso ritmo','Cambia il contenuto, non la casa'],'Il pubblico impara dove sta il divano. Se ogni settimana cambia la stanza, nessuno si siede.','Un formato fisso fa tornare il pubblico.'],
  ['La voce prima del suono',['Prima la frase, poi il microfono','Registrati e riascoltati ad alta voce'],'Il microfono migliore è inutile se ti spaventa. Allenati a parlare a una persona sola, quella giusta.','Parla a una persona, non al pubblico.'],
  ['Chiudi sempre con un invito',['Una sola azione richiesta','Chiedila con parole tue'],'Alla fine di ogni puntata chiedo una cosa sola. Una. Se ne chiedi tre, non ne ottieni nessuna.','Chiudi ogni puntata con una sola richiesta.'],
  ['Il rapporto cresce nel tempo',['Rispondi ai messaggi vocali','Cita chi ti scrive in puntata'],'Il podcast più forte che conosco è quello che risponde. La community nasce da lì.','Rispondi agli ascoltatori in puntata.']]},
 {title:'Reel che si guardano fino in fondo',speaker:'Gianmarco Tessarin',role:'Video creator',topic:'vid',pal:{shirt:'#2a5a7a',skin:'#dfae80',hair:'#1a1a20'},slides:[
  ['I primi 3 secondi',['Parti dal risultato','Mai dal saluto'],'Se perdo la persona nel primo secondo, tutto il resto è lavoro buttato. Il saluto lo metto alla fine.','Apri con il risultato, non con il saluto.'],
  ['Una sola idea per video',['Un messaggio, un esempio','Se ne hai due, fai due video'],'Quando volevo dire tutto non dicevo niente. Oggi un video, una frase, un esempio.','Una idea sola per ogni video.'],
  ['Il taglio è il ritmo',['Taglia respiri e pause','Cambia inquadratura ogni 4-6 secondi'],'Il montaggio è come la musica: se non c’è ritmo, la gente se ne va.','Taglia le pause: il ritmo tiene l’attenzione.'],
  ['Sottotitoli sempre',['Si guarda senza audio','Evidenzia le parole chiave'],'Più della metà delle persone guarda senza sonoro. Sottotitoli fatti bene valgono mezza produzione.','Sottotitoli sempre, con le parole chiave in evidenza.'],
  ['Pubblica, misura, ripeti',['Guarda dove cala l’attenzione','Correggi quel punto nel prossimo'],'Il video perfetto non esiste. Esiste il prossimo video, che sarà migliore del precedente.','Controlla dove cala l’attenzione e correggi.']]},
 {title:'Vendere senza sembrare venditori',speaker:'Ilaria Pedrotti',role:'Funnel strategist',topic:'sale',pal:{shirt:'#8a3a2a',skin:'#e0b085',hair:'#4a3322',long:true},slides:[
  ['Vendere è aiutare a scegliere',['Chiarezza prima di tutto','Il cliente ha paura di sbagliare'],'Chi compra ha un solo timore: pentirsene. Il mio lavoro è togliere quel timore.','Rendi la scelta semplice e sicura.'],
  ['Un solo passo alla volta',['Ogni pagina ha un obiettivo','Togli tutto il resto'],'Se in una pagina chiedi di iscriversi, comprare e seguirti, il cliente non fa niente.','Un obiettivo per ogni pagina.'],
  ['La prova batte la promessa',['Numeri, casi, testimonianze','Anche piccoli, ma veri'],'Un caso reale vale più di dieci aggettivi. Raccoglilo mentre il cliente è contento.','Raccogli una testimonianza a ogni progetto concluso.'],
  ['Il follow-up fa metà del lavoro',['Rispondi entro un giorno','Segui chi ha chiesto e non ha comprato'],'La maggior parte delle vendite arriva dopo il secondo contatto. Eppure quasi nessuno lo fa.','Fai sempre un secondo contatto.'],
  ['Prezzo e valore',['Spiega cosa cambia dopo','Non giustificare il prezzo'],'Quando spiego il valore con calma, il prezzo diventa un dettaglio.','Parla di cosa cambia, non di cosa costa.']]},
 {title:'L’AI come collega, non come scorciatoia',speaker:'Matteo Zanchetta',role:'Consulente AI',topic:'ai',pal:{shirt:'#2a6a5a',skin:'#e8b98a',hair:'#3a2a1c'},slides:[
  ['Parti da un compito noioso',['Il più ripetitivo della settimana','Misura quanto tempo ti costa'],'Il miglior caso d’uso è quello che odi. Se ti toglie un’ora a settimana, hai già vinto.','Automatizza prima il compito più noioso.'],
  ['Spiega come a un collega nuovo',['Contesto, esempio, formato','Più dettagli, meno sorprese'],'Una buona richiesta è un buon briefing. Se un collega non capirebbe, l’AI nemmeno.','Contesto, esempio e formato: sempre.'],
  ['Tu decidi, lei prepara',['Rileggi sempre il risultato','La responsabilità resta tua'],'Mi fido dell’AI come mi fido di uno stagista bravo: controllo prima di inviare.','Controlla sempre prima di pubblicare.'],
  ['Documenta il processo',['Scrivi i passaggi','Poi automatizza'],'Se non sai spiegare il processo a parole, non puoi automatizzarlo. Prima il metodo, poi lo strumento.','Prima scrivi il processo, poi automatizzalo.'],
  ['Il vantaggio è il tempo',['Usalo per ciò che conta','Più clienti, più cura'],'Il tempo che risparmi non è per fare di meno: è per fare meglio le cose in cui sei insostituibile.','Usa il tempo risparmiato per le cose che contano.']]},
 {title:'Costruire un brand personale che dura',speaker:'Serena Calcagno',role:'Personal brand coach',topic:'brand',pal:{shirt:'#5a2a7a',skin:'#c98e62',hair:'#1a1a20',long:true},slides:[
  ['Chi sei per chi?',['Una persona precisa','Un problema preciso'],'Non puoi parlare a tutti. Scegli chi vuoi aiutare e nomina il suo problema, non il tuo servizio.','Definisci chi aiuti e con cosa.'],
  ['Tre temi per un anno',['Ripetili senza vergogna','La coerenza ti rende riconoscibile'],'Quando sei stufo di ripeterti, il pubblico sta appena iniziando a ricordarti.','Scegli tre temi e ripetili per un anno.'],
  ['Mostra le persone dietro',['Racconta il percorso','Anche gli errori'],'La fiducia non nasce dai successi: nasce da come racconti le cadute.','Racconta il percorso, non solo il risultato.'],
  ['Una casa tua',['Lista email o sito','I social sono in affitto'],'Un social può cambiare le regole domani. La tua lista no. Costruisci la tua casa.','Costruisci una lista email: l’audience è tua.'],
  ['La pazienza vince',['Un anno di costanza','Poi cambia tutto'],'Il brand personale è una maratona. Quasi tutti si fermano al chilometro tre.','La costanza batte il talento.']]},
 {title:'Lavorare meno, produrre meglio',speaker:'Dino Ferraresi',role:'Coach di produttività',topic:'mind',pal:{shirt:'#3a5a3a',skin:'#e4b288',hair:'#5a4630'},slides:[
  ['Una priorità vera al giorno',['Scrivila la sera prima','Falla per prima'],'Le liste da quindici cose non funzionano. Una cosa sola, fatta bene, cambia la giornata.','Una priorità vera ogni giorno.'],
  ['Il riposo è lavoro',['Le pause aumentano la resa','Dormi: è un investimento'],'Le mie giornate migliori iniziano con una dormita decente, non con un caffè in più.','Il riposo fa parte del lavoro.'],
  ['Passi da 30 minuti',['Spezza ogni progetto','Inizia dal più piccolo'],'Il progetto grande spaventa. Il pezzo da mezz’ora no. Si comincia da lì.','Dividi i progetti in passi da 30 minuti.'],
  ['Meno strumenti, più abitudini',['Un solo calendario','Un solo posto dove scrivere'],'Ogni nuova app è un nuovo posto da controllare. Semplifica e vai avanti.','Meno strumenti, più abitudini.'],
  ['Misura ciò che migliora',['Non ciò che stanca','Rivedi ogni domenica'],'Ogni domenica mi chiedo: che cosa ha funzionato questa settimana? Ripeto quello.','Rivedi ogni settimana cosa ha funzionato.']]},
 {title:'Scrivere per essere letti',speaker:'Rebecca Ongaro',role:'Copywriter',topic:'cop',pal:{shirt:'#a05a2a',skin:'#f0c8a0',hair:'#8a3a2a',long:true},slides:[
  ['Un lettore, una frase',['Scrivi a una persona','Di cui conosci il problema'],'Se scrivo a tutti, scrivo a nessuno. Prima di battere una parola, immagino una faccia.','Scrivi pensando a una persona precisa.'],
  ['Il titolo per ultimo',['Scrivine venti','Tieni il più chiaro'],'Il titolo è metà del lavoro. Lo scrivo alla fine, quando so cosa dico davvero.','Scrivi venti titoli e scegli il più chiaro.'],
  ['Ad alta voce',['Leggi il testo','Dove inciampi, taglia'],'Se non riesci a leggerlo a voce alta senza fiatare, il lettore si perde a metà frase.','Leggi ad alta voce: dove inciampi, taglia.'],
  ['Le parole del cliente',['Usa le sue parole','Non le tue'],'Le recensioni e i messaggi sono una miniera di frasi che funzionano già.','Copia le parole che usano i clienti.'],
  ['Prova, non aggettivi',['Numeri, esempi, nomi','Una prova vale più di un aggettivo'],'«Il migliore» non significa niente. «Duemila clienti in tre anni» sì.','Una prova concreta batte un aggettivo.']]},
 {title:'Il negozio online che non dorme',speaker:'Loris Bevilacqua',role:'E-commerce manager',topic:'eco',pal:{shirt:'#2a4a8a',skin:'#dcae82',hair:'#25201c'},slides:[
  ['La scheda prodotto è il negozio',['Foto in contesto','Recensioni subito visibili'],'Online non c’è il commesso. C’è la scheda: se non risponde ai dubbi, il cliente se ne va.','Metti le recensioni in alto sulla scheda.'],
  ['Il carrello abbandonato',['Una email dopo un’ora','Un’altra dopo un giorno'],'Dieci carrelli su dieci li perdi, ma due o tre li puoi recuperare con un messaggio gentile.','Invia un’email al carrello abbandonato.'],
  ['La spedizione è marketing',['Soglia di spedizione gratuita','Tempi chiari e onesti'],'La domanda che fanno tutti: «e la spedizione?». Rispondi prima che la facciano.','Spiega costi e tempi di spedizione subito.'],
  ['Un test alla volta',['Cambia una cosa','Misura una settimana'],'Se cambi dieci cose insieme, non sai quale ha funzionato. Una alla volta.','Un test alla volta, misurato.'],
  ['Il cliente che torna',['Email dopo l’acquisto','Un motivo per tornare'],'Il cliente più prezioso è quello che hai già. Non dimenticarlo dopo la vendita.','Cura chi ha già comprato.']]},
 {title:'Social: meno post, più persone',speaker:'Agata Mongiello',role:'Social strategist',topic:'soc',pal:{shirt:'#c04a6a',skin:'#e8b98a',hair:'#c9a24a',long:true},slides:[
  ['Qualità, non quantità',['Un post fatto bene al giorno basta','Anche meno, se serve'],'Ho dimezzato i post e raddoppiato i risultati. Il pubblico non cerca di più: cerca meglio.','Pubblica meno ma meglio.'],
  ['Rispondi davvero',['Entro un’ora, se puoi','Con una domanda in più'],'Ogni commento è un invito a una conversazione. Se lo ignori, chiudi la porta.','Rispondi ai commenti entro un’ora.'],
  ['Una rubrica fissa',['Giorno e ora fissi','Il pubblico impara quando tornare'],'La rubrica è come una serie tv: si aspetta l’appuntamento e si torna per quello.','Crea una rubrica con giorno fisso.'],
  ['Riusa il contenuto',['Un video, un post, una storia','Stessa idea, tre formati'],'Non servono più idee. Servono più modi di raccontare la stessa buona idea.','Riusa lo stesso contenuto in tre formati.'],
  ['Guarda i salvataggi',['Non solo i like','Mostrano valore vero'],'Il like è un cenno. Il salvataggio è «mi serve». È quello che conta.','Guarda i salvataggi, non solo i like.']]},
 {title:'Dal freelance all’impresa',speaker:'Corrado Sartorelli',role:'Imprenditore',topic:'free',pal:{shirt:'#3b3b46',skin:'#e0b085',hair:'#d9d2c4'},slides:[
  ['Una offerta sola',['Dilla in una frase','Ripetila a tutti'],'Per anni ho detto sì a tutto. Quando ho scelto una cosa sola, i clienti sono arrivati da soli.','Dì cosa fai in una frase sola.'],
  ['Alza il prezzo, non le ore',['Più valore, meno tempo','Meno clienti, più cura'],'Se per guadagnare di più devi lavorare di più, hai un lavoro. Cambia il prezzo.','Alza il prezzo prima di aumentare le ore.'],
  ['Pacchetti, non listini',['Un risultato chiaro','Un prezzo chiaro'],'Il cliente non compra ore, compra un risultato. Racconta quello.','Vendi un pacchetto, non un listino.'],
  ['Il primo collaboratore',['Delega il compito che odi','Scrivi come lo fai'],'Il passaggio più difficile è fidarsi. Parti da un compito piccolo e scritto bene.','Delega prima il compito che odi.'],
  ['Una squadra si costruisce',['Condividi la visione','Premia chi cresce'],'Un’impresa è un gruppo di persone che vuole la stessa cosa. Il resto è organizzazione.','Costruisci una squadra, non una lista di fornitori.']]}
];
const WORKSHOPS=[
 {title:'Il tuo primo episodio in 60 minuti',speaker:'Mattia Cerutti',role:'Podcaster',topic:'pod',pal:{shirt:'#2a5a6a',skin:'#e8b98a',hair:'#2a1d14'},slides:[
  ['Un’idea, un ospite o un tema',['Scegli un solo argomento','Scrivi tre domande'],'Per cominciare non serve altro: un argomento, tre domande, un microfono acceso.','Un argomento e tre domande bastano.'],
  ['Registra in uno spazio morbido',['Un armadio pieno di vestiti va bene','Evita le stanze vuote'],'Il suono migliore di casa tua è sotto una coperta. Davvero.','Registra in una stanza con tessuti.'],
  {q:'Qual è l’apertura più forte per il tuo episodio?',c:[
    {t:'«Ciao a tutti, benvenuti nel mio podcast!»',r:'Gentile, ma generico. Il pubblico non sa ancora perché restare.',good:false},
    {t:'«Oggi ti racconto un errore che mi è costato un cliente.»',r:'Ottimo: una storia concreta e una promessa.',good:true},
    {t:'«Prima di iniziare, ecco le regole del canale…»',r:'Troppo presto. Prima dai valore, poi le regole.',good:false}]},
  ['Montaggio leggero',['Taglia respiri e errori','Aggiungi un jingle corto'],'Non serve montare tutto. Taglia ciò che stanca e lascia respirare il resto.','Taglia solo ciò che stanca.'],
  ['Pubblica e ascolta',['Pubblica anche se non è perfetto','Poi chiedi un parere'],'Il primo episodio non sarà il migliore. Ma sarà il primo. E il secondo sarà meglio.','Pubblica il primo episodio, anche se imperfetto.']]},
 {title:'Un hook in 3 secondi',speaker:'Lucrezia Fantoni',role:'Social media manager',topic:'soc',pal:{shirt:'#a04a8a',skin:'#f0c8a0',hair:'#4a3322',long:true},slides:[
  ['Cos’è un hook',['La frase che ferma il dito','Promette qualcosa di utile'],'Un hook è un patto: «ti faccio vedere questo, resta tre secondi».','L’hook promette qualcosa di utile.'],
  ['Tre modelli che funzionano',['Il risultato','La domanda scomoda','L’errore comune'],'Prendi un contenuto e prova a riscriverlo con tutti e tre i modelli. Il migliore spesso sorprende.','Riscrivi lo stesso contenuto con tre hook.'],
  {q:'Quale hook ferma di più chi scorre?',c:[
    {t:'«Oggi parliamo di organizzazione.»',r:'Troppo vago: non promette niente.',good:false},
    {t:'«Ho perso 3 clienti per un solo errore: eccolo.»',r:'Perfetto: risultato e curiosità insieme.',good:true},
    {t:'«Ciao! Sono Lucrezia e oggi vi spiego…»',r:'Il saluto spreca i tre secondi preziosi.',good:false}]},
  ['Testa e confronta',['Due versioni, stesso video','Guarda la ritenzione'],'Pubblica due hook e guarda quale tiene di più. Dopo dieci prove avrai un metodo tuo.','Prova due hook e confronta la ritenzione.'],
  ['Il tuo archivio di hook',['Salva quelli che funzionano','Riusali cambiando il tema'],'Tengo un file con i miei hook migliori. Il lavoro più difficile lo fai una volta sola.','Tieni un archivio degli hook migliori.']]},
 {title:'La tua offerta in una frase',speaker:'Piero Mazzantini',role:'Funnel strategist',topic:'sale',pal:{shirt:'#5a3a2a',skin:'#dfae80',hair:'#1a1a20'},slides:[
  ['Formula base',['Aiuto [chi] a ottenere [cosa]','Senza [fastidio]'],'Non è marketing: è chiarezza. Se tu non sai dirlo in una frase, i clienti nemmeno.','Aiuto [chi] a [risultato] senza [fastidio].'],
  {q:'Quale frase descrive meglio un’offerta?',c:[
    {t:'«Faccio consulenze di comunicazione a 360 gradi.»',r:'Troppo vago: chi è il cliente? Che risultato?',good:false},
    {t:'«Aiuto i ristoratori a riempire il locale il martedì sera.»',r:'Chiaro: persona, risultato, momento preciso.',good:true},
    {t:'«Sono un professionista appassionato di marketing.»',r:'Parla di te, non del cliente.',good:false}]},
  ['Prova con un amico',['Dilla ad alta voce','Chiedi cosa ha capito'],'Se la persona non ripete la frase con parole sue, riscrivila.','Verifica la frase con una persona esterna.'],
  ['Usala ovunque',['Bio, sito, presentazioni','Sempre la stessa'],'Ripetila finché non ti annoi. Poi ripetila ancora.','Usa la stessa frase in ogni canale.'],
  ['Un passo alla volta',['Un’offerta alla volta','Poi ne aggiungi altre'],'Non cambiare tutto ogni mese. Dai tempo al mercato di capirti.','Una sola offerta chiara alla volta.']]},
 {title:'Prompt che funzionano',speaker:'Greta Lombroso',role:'Consulente AI',topic:'ai',pal:{shirt:'#2a8a7a',skin:'#c98e62',hair:'#1a1a20',long:true},slides:[
  ['Ruolo, obiettivo, formato',['Chi è l’assistente','Che cosa deve produrre'],'Una buona richiesta ha tre parti: chi sei, cosa voglio, come lo voglio.','Indica ruolo, obiettivo e formato.'],
  ['Dai un esempio',['Incolla un testo buono','Chiedi «nello stesso stile»'],'L’esempio vale mille istruzioni. Mostra, non descrivere.','Aggiungi sempre un esempio.'],
  {q:'Quale richiesta è la migliore?',c:[
    {t:'«Scrivi un post sul mio podcast.»',r:'Troppo vaga: l’AI deve indovinare tutto.',good:false},
    {t:'«Sei un copywriter. Scrivi 3 post da 40 parole per i podcaster alle prime armi, tono diretto, con una domanda finale.»',r:'Ruolo, pubblico, formato e tono: ottimo.',good:true},
    {t:'«Fammi qualcosa di bello e virale.»',r:'Bello e virale non sono istruzioni.',good:false}]},
  ['Itera',['Chiedi una versione più corta','Chiedi un tono diverso'],'La prima risposta è la bozza. Il lavoro vero è migliorarla insieme.','La prima risposta è solo una bozza.'],
  ['Salva i prompt buoni',['Un file con quelli che funzionano','Riusali e migliorali'],'Un prompt che funziona è un piccolo strumento. Tienilo da parte.','Salva i prompt che funzionano.']]},
 {title:'Calendario editoriale in 30 minuti',speaker:'Nicolò Baldassarri',role:'Content strategist',topic:'mind',pal:{shirt:'#3a6a8a',skin:'#e4b288',hair:'#7a5a2a'},slides:[
  ['Scegli tre temi',['Quelli del pubblico','Non solo i tuoi'],'Parti dalle domande che ti fanno più spesso. Sono già un calendario.','Parti dalle domande più frequenti.'],
  ['Una griglia semplice',['Giorno, formato, tema','Una colonna per le note'],'Una tabella basta. Se serve un software, vuol dire che è troppo complicata.','Una griglia semplice batte un software complesso.'],
  {q:'Come organizzi la settimana?',c:[
    {t:'Decido ogni mattina cosa pubblicare.',r:'Funziona poco: ti stanca e ti fa saltare giorni.',good:false},
    {t:'Una sessione di mezz’ora per preparare tutta la settimana.',r:'Giusto: batch di lavoro, meno decisioni.',good:true},
    {t:'Aspetto l’ispirazione.',r:'Spesso non arriva quando serve.',good:false}]},
  ['Batch',['Registra tre video insieme','Scrivi tre testi di fila'],'Lavorare per blocchi ti toglie il passaggio da un compito all’altro, che è il vero stanco.','Lavora a blocchi: tre video in una sessione.'],
  ['Rivedi ogni domenica',['Cosa ha funzionato','Cosa tagli'],'Dieci minuti di revisione valgono ore di lavoro in più.','Rivedi il calendario ogni domenica.']]},
 {title:'Titoli che si cliccano',speaker:'Elisa Pagnoni',role:'Copywriter',topic:'cop',pal:{shirt:'#7a4a2a',skin:'#f0c8a0',hair:'#8a3a2a',long:true},slides:[
  ['Promessa chiara',['Cosa ottengo','In quanto tempo'],'Un titolo deve dire cosa c’è dentro. Nient’altro.','Il titolo promette un risultato.'],
  ['Numeri e dettagli',['Un numero preciso','Un dettaglio vero'],'«7 modi» è generico. «Come ho ridotto il tempo di editing da 3 ore a 40 minuti» no.','Usa numeri e dettagli precisi.'],
  {q:'Quale titolo funziona meglio?',c:[
    {t:'«Consigli per scrivere meglio»',r:'Generico. Non dà un motivo per cliccare.',good:false},
    {t:'«Come ho scritto una newsletter in 20 minuti (e ha avuto il 48% di aperture)»',r:'Concreto, con risultato e curiosità.',good:true},
    {t:'«Tutto sulla scrittura»',r:'Troppo ampio: nessuna promessa.',good:false}]},
  ['Evita il clickbait',['Mantieni ciò che prometti','O perdi la fiducia'],'Un titolo che promette troppo costa più di quanto porta. La fiducia si perde in un click.','Mantieni sempre la promessa del titolo.'],
  ['Scrivine venti',['Poi scegli il migliore','Il primo è quasi sempre il peggiore'],'Il titolo che pubblico è spesso il quindicesimo. Il primo serve solo a scaldarmi.','Scrivi venti titoli e scegli.']]}
];
const TALK_SLOTS=['09:00','10:30','14:30','16:00','17:30'],WS_SLOTS=['10:00','11:30','14:30','16:00','17:30'];
(function buildProgram(){
  let ti=0,wi=0;
  WS_SLOTS.forEach(t=>{const rooms=[0,1,2].map(r=>WORKSHOPS[(wi++)%WORKSHOPS.length]);PROGRAMMA.push({d:0,t,e:'Workshop in 3 sale',w:'work',rooms});if(t==='11:30')PROGRAMMA.push({d:0,t:'13:00',e:'Pausa pranzo e networking',w:'lounge'});});
  PROGRAMMA.push({d:0,t:'20:30',e:'Offworld: party, karaoke e side events',w:'tent'});
  for(const d of [1,2]){TALK_SLOTS.forEach(t=>{const tk=TALKS[(ti++)%TALKS.length];PROGRAMMA.push({d,t,e:tk.title+' · '+tk.speaker,w:'main',talk:tk});if(t==='10:30')PROGRAMMA.push({d,t:'12:00',e:'Pausa pranzo e networking',w:'lounge'});});
   if(d===1)PROGRAMMA.push({d:1,t:'20:30',e:'Offworld: party, karaoke e side events',w:'tent'});}
  PROGRAMMA.sort((a,b)=>a.d-b.d||(+a.t.slice(0,2)*60+ +a.t.slice(3))-(+b.t.slice(0,2)*60+ +b.t.slice(3)));
})();
