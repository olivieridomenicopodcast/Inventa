'use strict';
/* RIMINI 3 GIORNI · contenuti inventati delle sessioni.
   Ogni sessione sceglie, in modo deterministico dal titolo e dallo speaker, argomenti diversi tra loro (senza ripetizioni) da banche per tema. */

/* punto: [titolo slide, spunto 1, spunto 2, frase detta dal relatore, appunto da portare a casa] */
const TK={
ai:[
 ['Parti dal compito che odi','Elenca i lavori ripetitivi della settimana','Scegli quello che ti toglie più energia','Non partire dallo strumento: parti dal lavoro che vorresti non fare mai più. Lì l’automazione rende subito.','Automatizza prima il compito che odi di più.'],
 ['Il prompt è un brief','Contesto, obiettivo, esempio e formato','Una richiesta vaga dà una risposta vaga','Trattate l’AI come un collaboratore nuovo: se gli date un brief chiaro, vi risponde da professionista; se gli dite «fai qualcosa», vi risponde «qualcosa».','Scrivi i prompt come briefing: contesto, esempio, formato.'],
 ['Umano nel ciclo','L’AI propone, tu decidi','Rileggi sempre prima di pubblicare','Il controllo umano non è un freno: è quello che vi distingue da chi pubblica qualunque cosa esca dalla macchina.','Tieni sempre un controllo umano sull’ultimo miglio.'],
 ['Agenti e flussi','Un passo, un responsabile, un risultato','Collega gli strumenti che già usi','Un agente non è magia: è un flusso con regole chiare. Se riuscite a descrivere il processo su un foglio, potete farlo eseguire a una macchina.','Disegna il processo su carta prima di automatizzarlo.'],
 ['Dati: cosa dare e cosa no','Mai dati sensibili in strumenti pubblici','Anonimizza prima di incollare','Prima di incollare qualsiasi cosa in uno strumento chiedetevi: lo direi ad alta voce in una sala piena? Se no, non va nel prompt.','Prima di incollare un dato, chiediti se lo diresti in pubblico.'],
 ['Costruire in poche ore','Un problema piccolo, un’app piccola','Pubblica una versione brutta e usala','Oggi un prototipo si fa in una sera. Il vantaggio non è più saper programmare: è sapere quale problema valga la pena risolvere.','Costruisci un prototipo brutto in una sera e usalo davvero.'],
 ['Il tuo stile conta ancora','Dagli esempi dei tuoi testi migliori','Correggi finché suona come te','Se tutti usano gli stessi strumenti con le stesse richieste, otterrete tutti lo stesso testo. Il vostro tono è l’unica cosa che non si copia.','Allena l’AI sul tuo stile, non sullo stile medio.'],
 ['Misura il tempo risparmiato','Prima e dopo, in minuti','Reinvesti il tempo guadagnato','Se non misurate quanto tempo avete recuperato, non saprete mai se l’automazione funziona. E poi decidete: cosa fate con quel tempo?','Misura i minuti recuperati e decidi come reinvestirli.']],
podcast:[
 ['Il primo minuto','Entra subito nel tema','Il saluto lungo si taglia','Chi ascolta decide nei primi trenta secondi. Non presentate il microfono: presentate il motivo per cui devono restare.','Entra nel tema nei primi 30 secondi.'],
 ['Il suono vale più del video','Una buona voce, una stanza silenziosa','Microfono vicino, volume costante','Un ascoltatore perdona un’immagine brutta, non un audio fastidioso. Investite prima nell’orecchio.','Cura il suono prima di qualsiasi altra cosa.'],
 ['Un formato riconoscibile','Stessa struttura, ospiti diversi','Una rubrica fissa fidelizza','Quando l’ascoltatore sa cosa aspettarsi, torna. Il formato è una promessa che fate a ogni puntata.','Definisci un formato che si riconosca in tre secondi.'],
 ['L’ospite giusto','Chi ha una storia, non solo un titolo','Preparati tre domande che non ha mai sentito','Il miglior ospite non è il più famoso: è quello che ha qualcosa da dire e voi sapete farlo parlare.','Prepara tre domande che l’ospite non ha mai sentito.'],
 ['Clip e riuso','Una puntata, dieci contenuti','Scegli la frase che resta in testa','Una puntata di un’ora contiene dieci clip, tre post e una newsletter. Il lavoro vero è sapere dove tagliare.','Estrai almeno tre clip da ogni puntata.'],
 ['Costanza batte ispirazione','Un giorno fisso di uscita','Meglio ogni due settimane che mai','I podcast non muoiono per mancanza di idee: muoiono alla decima puntata, quando scoprite che serve disciplina.','Fissa un giorno di uscita e rispettalo.'],
 ['Chiudere con un invito','Un solo invito, chiaro','Dì cosa fare adesso','Alla fine dite una cosa sola: iscriviti, rispondi, condividi. Se ne chiedete tre, ne ottenete zero.','Chiudi ogni puntata con un solo invito.']],
video:[
 ['Il gancio dei 3 secondi','Parti dal risultato o dalla domanda','Niente logo animato iniziale','Il pollice scorre veloce: avete tre secondi per fargli cambiare idea. Mostrate subito la cosa più interessante.','Metti il momento migliore nei primi 3 secondi.'],
 ['Taglia, poi taglia ancora','Togli le pause e i giri di parole','Il ritmo è una scelta','Quando pensate di aver tagliato abbastanza, tagliate ancora un po’. Nessuno si è mai lamentato di un video troppo asciutto.','Taglia i primi 5 secondi di ogni video.'],
 ['Sottotitoli sempre','Molti guardano senza audio','Contrasto alto, righe brevi','Più della metà di chi vi guarda lo fa a volume zero. Se non scrivete cosa dite, per loro non state dicendo nulla.','Sottotitola ogni video.'],
 ['Luce prima della camera','Una finestra vale più di una lente','Evita la luce dall’alto','Con un telefono e una buona luce battete una cinepresa al buio. Posizionatevi davanti alla finestra e rispettate le ombre.','Metti la luce davanti a te, non sopra di te.'],
 ['Una storia in tre atti','Situazione, ostacolo, risultato','Anche un reel da 20 secondi','Anche un video da venti secondi ha un inizio, un problema e una fine. Quando manca uno dei tre, lo sentite subito.','Dai ad ogni video un inizio, un ostacolo e un risultato.'],
 ['Miniatura e titolo','Una promessa chiara, un volto','Poche parole, leggibili dal telefono','La miniatura è il biglietto da visita del video: se non si legge dal telefono in dieci centimetri, non esiste.','Testa titolo e miniatura prima di pubblicare.']],
social:[
 ['Meno post, più risposte','Rispondi ai commenti entro un’ora','Fai domande, non solo affermazioni','L’algoritmo premia chi crea conversazione. Un post con venti risposte vale più di tre post senza nessun commento.','Pubblica meno ma rispondi ai commenti entro un’ora.'],
 ['Un contenuto, tre formati','Testo, immagine, video breve','Adatta il linguaggio, non l’idea','L’idea è una sola; cambia la forma in base a dove la pubblicate. Non copiate e incollate: traducete.','Riusa una stessa idea in tre formati.'],
 ['Il tuo pubblico reale','Chi ti scrive in privato?','Parla a una persona, non a tutti','Quando scrivete pensate a una sola persona precisa. Il contenuto che parla a tutti non parla a nessuno.','Scrivi pensando a una persona precisa.'],
 ['Costruire una community','Dai un nome e una regola','Premia chi partecipa','Una community nasce quando le persone parlano tra loro, non solo con voi. Il vostro lavoro è creare le condizioni.','Fai parlare le persone tra loro, non solo con te.'],
 ['Calendario editoriale leggero','Tre pilastri, non trenta temi','Pianifica il mese, scrivi la settimana','Tre temi fissi e un po’ di spazio per l’improvvisazione. Più regole non vi rendono più creativi, vi rendono solo più stanchi.','Scegli tre pilastri di contenuto e resta su quelli.'],
 ['Quando va male','Un post flop è un dato','Chiedi cosa non ha funzionato','Un contenuto che non funziona non è un fallimento: è un esperimento concluso. Prendete nota e passate al prossimo.','Tratta i flop come dati, non come giudizi.'],
 ['La viralità non si pianifica','Costruisci un pubblico, non un colpo','Un post virale senza strategia svanisce','Potete aumentare le probabilità, mai garantirle. Meglio mille persone fedeli che un milione di passanti.','Punta a un pubblico fedele, non al colpo di fortuna.']],
brand:[
 ['Una frase che ti descrive','Cosa fai, per chi, con quale risultato','Se la devi spiegare, è troppo lunga','Provate a descrivere cosa fate in una frase. Se alla fine ci vogliono due minuti, il vostro posizionamento non è ancora chiaro.','Scrivi in una frase cosa fai, per chi e con quale risultato.'],
 ['Coerenza visiva e verbale','Stessi colori, stesso tono','Ogni punto di contatto racconta la stessa storia','Il brand non è il logo: è ciò che le persone ricordano dopo averci parlato. E si costruisce con piccoli gesti ripetuti.','Controlla che ogni punto di contatto racconti la stessa storia.'],
 ['Il tuo nome, la tua firma','Il personal brand apre porte','Mostra il lavoro, non solo le opinioni','Le opinioni le hanno tutti. Mostrare il processo, gli errori e i risultati vi distingue molto più di una frase ad effetto.','Mostra il processo e i risultati, non solo le opinioni.'],
 ['Il tono di voce','Tre aggettivi che ti rappresentano','Un esempio di ciò che non diresti mai','Scegliete tre aggettivi e poi scrivete una frase che non direste mai. Il tono si definisce tanto per ciò che si include quanto per ciò che si esclude.','Definisci il tuo tono con tre aggettivi e un “mai”.'],
 ['Raccontare un cambiamento','Prima, durante, dopo','Le persone si ricordano le storie','Un caso cliente non è una lista di numeri: è una persona che parte da un problema e arriva da qualche altra parte. Raccontate quel viaggio.','Racconta i casi come storie di cambiamento.'],
 ['Fiducia lenta','Promettere meno, consegnare di più','Rispondi anche quando è scomodo','Il brand si costruisce in anni e si rovina in una settimana. Ogni risposta data in ritardo è una piccola crepa.','Prometti meno, consegna di più.']],
seo:[
 ['Rispondi a una domanda vera','Parti da ciò che le persone cercano','Una pagina, un’intenzione','Non scrivete per Google: scrivete per la persona che ha digitato quella domanda alle undici di sera. Google arriverà dopo.','Scrivi per la domanda reale di una persona.'],
 ['Struttura prima del testo','Titoli chiari e sottotitoli utili','Una pagina che si scansiona in dieci secondi','La maggior parte dei lettori scorre. Se i titoli bastano a capire il contenuto, avete già vinto metà della partita.','Fai in modo che i soli titoli raccontino la pagina.'],
 ['Velocità e mobile','Un sito lento perde persone','Controlla da telefono, non solo dal computer','Un secondo di attesa in più costa più conversioni di qualsiasi errore di keyword. E ormai quasi tutti vi leggono da mobile.','Testa il sito dal telefono su rete normale.'],
 ['Contenuti che invecchiano bene','Aggiorna invece di riscrivere','Un articolo vivo vale più di dieci morti','Tornate sui vecchi contenuti, correggete e aggiornate. È il modo più economico di crescere in classifica.','Aggiorna i contenuti migliori ogni sei mesi.'],
 ['Link e autorevolezza','Meglio pochi link buoni','Fatti citare da chi conta nel tuo settore','Dieci menzioni da siti seri valgono più di mille link a caso. Chiedetevi chi dovrebbe parlare di voi e cosa potete offrirgli.','Cerca poche menzioni di qualità, non tanti link.'],
 ['Misurare davvero','Posizione non è risultato','Guarda richieste, non solo visite','Essere primi per una parola che non porta clienti è un bel trofeo e basta. Misurate ciò che arriva dopo il clic.','Misura contatti e vendite, non solo posizioni.']],
ads:[
 ['Il test è il lavoro','Una sola variabile alla volta','Decidi prima cosa vuol dire “funziona”','Se cambiate tre cose insieme non imparate nulla. Scrivete prima il criterio di successo e poi lanciate.','Cambia una sola variabile per volta.'],
 ['Creatività che ferma lo scroll','Un messaggio per volta','Tre varianti, non trenta','Nell’era delle campagne automatiche la creatività è la leva che resta. Più è specifica per un pubblico, più convince.','Investi nella creatività, è la leva che l’algoritmo non ti toglie.'],
 ['Il funnel è una conversazione','Awareness, considerazione, decisione','A ogni fase la sua domanda','Non si chiede il matrimonio al primo appuntamento. Capite a che punto si trova la persona e rispondete a quella domanda.','Parla a ogni fase del funnel con il messaggio giusto.'],
 ['Budget e pazienza','Non spegnere dopo due giorni','Aspetta dati sufficienti','Le piattaforme hanno bisogno di imparare. Spegnere e riaccendere ogni giorno è il modo migliore per non capire mai nulla.','Lascia che la campagna impari prima di giudicarla.'],
 ['La pagina di arrivo','Una promessa, una azione','Coerenza tra annuncio e pagina','Potete avere il miglior annuncio del mondo: se la pagina è confusa, pagate per far scappare le persone.','Allinea l’annuncio alla pagina di arrivo.'],
 ['Tracciare bene','Se non lo misuri non esiste','Controlla gli eventi prima di spendere','Prima di spendere un euro verificate che ogni evento arrivi davvero. Metà dei problemi nasce da un tracciamento che non funziona.','Verifica il tracciamento prima di spendere.'],
 ['Crescere senza bruciarsi','Scala del 20% alla volta','Tieni d’occhio il costo per risultato','Raddoppiare il budget in una notte quasi mai raddoppia i risultati. Crescete a gradini e guardate i numeri a ogni gradino.','Scala il budget a piccoli gradini.']],
ecom:[
 ['Un prodotto, un pubblico','Parti dal problema del cliente','Meglio uno scaffale piccolo e chiaro','I negozi che crescono vendono poche cose molto bene. Capite chi è il cliente e costruite tutto intorno a lui.','Parti dal cliente, non dal catalogo.'],
 ['Pagina prodotto','Foto vere, taglie chiare, resi semplici','Le recensioni valgono più di un testo perfetto','La gente compra quando smette di avere dubbi. Ogni dubbio che eliminate vale un acquisto in più.','Elimina un dubbio alla volta dalla pagina prodotto.'],
 ['Il carrello abbandonato','Spedizione e costi a vista','Un promemoria educato dopo un’ora','Il novanta per cento di chi abbandona lo fa per un costo imprevisto. Mostrate tutto prima e recupererete molte vendite.','Mostra tutti i costi prima del carrello.'],
 ['Fidelizzare','Il secondo acquisto è il più importante','Un biglietto scritto a mano','Acquisire un cliente costa. Farlo tornare costa molto meno. Pensate ai primi trenta giorni dopo l’acquisto come a una vostra campagna.','Cura i primi 30 giorni dopo l’acquisto.'],
 ['Logistica come marketing','Consegna puntuale, imballo curato','Un reso facile genera fiducia','Il pacco che arriva è il vostro ultimo contatto con il cliente. Fate in modo che sia un bel ricordo.','Tratta la consegna come parte del marketing.'],
 ['Marketplace o sito proprio','Vantaggi e rischi di ciascuno','Non dipendere da un solo canale','Un marketplace vi dà traffico, ma anche regole e commissioni. Un sito proprio vi dà libertà, ma vi chiede di portare voi le persone.','Non dipendere da un solo canale di vendita.']],
sales:[
 ['Ascolta prima di proporre','Cinque domande prima dell’offerta','Riformula ciò che hai sentito','Chi parla di più in una trattativa ha già perso. Fate domande, ascoltate e poi dite: «Se ho capito bene…».','Fai cinque domande prima di fare un’offerta.'],
 ['Parla di risultati','Cosa cambia per il cliente?','Il prezzo si capisce dopo il valore','Nessuno compra un servizio: compra il cambiamento che ne ottiene. Raccontate il dopo, non il come.','Parla del cambiamento, non della funzione.'],
 ['Le obiezioni sono aiuto','Il “costa troppo” spesso significa “non ho capito”','Rispondi con una domanda','Un’obiezione è un segnale: il cliente ci sta dicendo cosa deve ancora vedere. Ringraziatelo e rispondete con calma.','Tratta le obiezioni come informazioni, non come rifiuti.'],
 ['Il follow-up','Un messaggio dopo tre giorni','Porta sempre qualcosa di nuovo','La maggior parte delle vendite si chiude dopo il quinto contatto, e la maggior parte delle persone si ferma al secondo. Siate gentili e costanti.','Pianifica il follow-up prima di chiudere la call.'],
 ['Prezzo e fiducia','Non svalutarti per chiudere','Offri opzioni, non sconti','Se abbassate il prezzo al primo no, il cliente impara che il prezzo era negoziabile. Proponete opzioni diverse invece di sconti.','Offri opzioni, non sconti.'],
 ['Dire di no','Non tutti i clienti sono buoni clienti','Scegli con chi lavorare','Il cliente sbagliato costa più di quello che paga. Imparate a riconoscerlo e a salutarlo con garbo.','Impara a dire di no al cliente sbagliato.']],
startup:[
 ['Un problema vero','Parla con venti persone prima di costruire','Se nessuno lo paga, non è un problema','Molte imprese nascono da un’idea che piace a chi la inventa. Funzionano quelle che nascono da un problema che qualcuno già paga per risolvere.','Parla con venti persone prima di costruire qualsiasi cosa.'],
 ['Fare poco, in fretta','La versione più piccola che funziona','Lanciare è imparare','Se il vostro primo lancio non vi imbarazza un po’, avete aspettato troppo. Il mercato è il miglior professore che abbiate.','Lancia la versione più piccola che funziona.'],
 ['I primi dieci clienti','Uno alla volta, a mano','Impara da ognuno','Non scalate prima di avere dieci clienti felici. Con quei dieci imparate più che con mille di dati.','Cura a mano i primi dieci clienti.'],
 ['Soci e ruoli','Chi decide cosa','Scrivi le regole quando va tutto bene','Gli accordi tra soci si scrivono quando tutti si vogliono bene. Quando serve rileggerli, di solito è troppo tardi per scriverli.','Scrivi gli accordi tra soci quando va tutto bene.'],
 ['Il conto in banca','Quanti mesi di autonomia hai?','Controlla i numeri ogni settimana','Le imprese non falliscono per mancanza di idee ma per mancanza di cassa. Guardate i numeri come guardate le notifiche.','Controlla la cassa ogni settimana.'],
 ['Cambiare strada','Non è un fallimento, è un dato','Decidi con criteri scritti','Cambiare direzione non è debolezza se è fatto con dati. Stabilite in anticipo quando vi fermerete e cosa guarderete.','Stabilisci prima i criteri con cui cambierai strada.'],
 ['Il team','Assumi per ciò che non sai fare','Cultura è ciò che premi','Il vostro primo collaboratore deve compensare un vostro limite, non somigliarvi. Ogni scelta che premiate costruisce la cultura più di mille valori scritti.','Assumi per compensare un tuo limite, non per somigliarti.']],
mindset:[
 ['Una priorità vera','Una cosa che conta, ogni giorno','Il resto è contorno','La giornata è piena di cose urgenti e poche importanti. Scegliete una sola priorità e proteggetela.','Scegli una sola priorità per ogni giorno.'],
 ['Pianifica la sera prima','Dieci minuti per scrivere il giorno dopo','La mattina parti già in corsa','Chi pianifica la mattina sta già rincorrendo. Chi pianifica la sera arriva in anticipo.','Pianifica il giorno prima, non la mattina stessa.'],
 ['Il riposo è lavoro','Dormire, camminare, staccare','Non si pedala per sempre','L’energia non è infinita e nessuno ve lo dirà finché non crollate. Il riposo è parte del metodo, non una ricompensa.','Metti il riposo in agenda come un appuntamento.'],
 ['Paura e decisioni','Distingui paura da prudenza','Fai il passo più piccolo','La paura non scompare: si ridimensiona agendo. Scegliete il passo più piccolo che vi avvicina e fatelo oggi.','Scegli il passo più piccolo e fallo oggi.'],
 ['Confronto sano','Chi è davanti a te può insegnarti','Il tuo punto di partenza è solo tuo','Il confronto è utile solo se vi fa imparare. Se vi fa sentire in ritardo, state guardando la vetrina e non la cucina.','Confrontati per imparare, non per giudicarti.'],
 ['Abitudini piccole','Due minuti al giorno','La costanza batte l’intensità','Una piccola abitudine ripetuta vince sempre sul grande slancio una tantum. Il vostro futuro si costruisce con minuscoli lunedì.','Parti da un’abitudine di due minuti.'],
 ['Chiedere aiuto','Una domanda ben posta vale un mese','Trova qualcuno più avanti di te','Nessuno è arrivato dove è arrivato da solo. Chiedere aiuto non è debolezza, è un modo di accorciare la strada.','Chiedi aiuto prima di quanto ti sembri necessario.']],
money:[
 ['Prima i conti semplici','Entrate, uscite, margine','Una tabella basta','Non servono fogli complicati: ogni mese scrivete quanto entra, quanto esce e cosa resta. Il resto viene dopo.','Tieni sotto controllo entrate, uscite e margine ogni mese.'],
 ['Il fondo di sicurezza','Tre-sei mesi di spese','Prima di investire, proteggiti','Investire senza una riserva significa vendere nel momento sbagliato. Costruite prima il cuscino e poi i progetti.','Costruisci un fondo di sicurezza prima di investire.'],
 ['Tasse senza panico','Metti da parte una quota di ogni incasso','Parla con un commercialista presto','Le tasse non sono un imprevisto: sono una voce di costo. Accantonate subito la quota e non ve la ritroverete come sorpresa.','Accantona ogni volta la quota delle tasse.'],
 ['Diversificare','Non tutte le uova nello stesso cesto','Più fonti di reddito, più libertà','Una sola fonte di reddito è comoda finché dura. Costruire un secondo canale è il modo migliore per dormire tranquilli.','Costruisci una seconda fonte di reddito.'],
 ['Tempo è denaro, ma anche viceversa','Calcola il tuo valore orario reale','Delega ciò che costa meno del tuo tempo','Se il vostro tempo vale cinquanta euro l’ora e passate tre ore a fare un lavoro da dieci, state perdendo soldi.','Calcola quanto vale davvero un’ora del tuo tempo.'],
 ['Il lungo periodo','Piccole somme costanti','Gli interessi composti lavorano per te','Non serve indovinare il momento giusto. Serve cominciare e restare. Il tempo fa il resto.','Parti con una somma piccola, ma costante.']],
write:[
 ['Una riga che si legge','Parti dal beneficio','Taglia l’introduzione','Se la prima riga non convince, il resto non verrà letto. Scrivetela per ultima e riscrivetela dieci volte.','Riscrivi la prima riga dieci volte.'],
 ['Scrivi come parli','Frasi brevi, parole semplici','Leggi ad alta voce','Il test migliore è leggere ad alta voce. Dove inciampate, il lettore inciamperà.','Leggi ad alta voce prima di pubblicare.'],
 ['Una storia per ogni idea','Personaggio, ostacolo, svolta','Una scena vale più di un concetto','Le idee astratte scivolano via. Le scene restano. Dategli un volto, un luogo e un momento preciso.','Trasforma ogni idea in una scena concreta.'],
 ['La newsletter che si apre','Un oggetto onesto e curioso','Una sola idea per invio','L’oggetto è un invito, non uno slogan. E dentro, una sola idea scritta bene vale più di cinque messe in fila.','Una sola idea per invio.'],
 ['Il lettore ha fretta','Titoli, elenchi, paragrafi brevi','Scrivi per chi scorre','Nessuno vi deve la sua attenzione. Rendete facile capire dove sta il valore anche a chi legge in diagonale.','Scrivi per chi legge in diagonale.'],
 ['Modificare è scrivere','Prima bozza brutta, poi taglia','Il 30% di ogni testo si può togliere','La prima bozza serve a sapere cosa pensate. La seconda serve al lettore. Siate generosi con le forbici.','Taglia il 30% di ogni bozza.']],
data:[
 ['Poche metriche che contano','Tre numeri, non trenta','Ogni numero collegato a un’azione','Una dashboard con cinquanta numeri non vi dice nulla. Sceglietene tre e per ciascuno decidete cosa fareste se salisse o scendesse.','Scegli tre metriche e decidi cosa fare per ciascuna.'],
 ['Prima la domanda','Cosa voglio capire?','Poi cerca i dati','Non cercate dati per vedere cosa succede: partite da una domanda. I dati sono la risposta, non il punto di partenza.','Parti da una domanda, non dai dati.'],
 ['Correlazione e causa','Due cose insieme non sono la stessa','Prova con un test','Che due numeri salgano insieme non significa che uno causi l’altro. Se volete saperlo, fate un test.','Verifica con un test prima di attribuire una causa.'],
 ['Raccontare i numeri','Un grafico, un messaggio','Titolo che dice cosa vedere','Un grafico senza titolo chiaro è un puzzle. Scrivete sopra la conclusione che volete far capire.','Dai ad ogni grafico un titolo che dica la conclusione.'],
 ['Qualità dei dati','Dati sporchi, decisioni sporche','Controlla da dove arrivano','Prima di fidarvi di un numero chiedetevi come è stato raccolto. Il dato peggiore è quello che sembra preciso ma non lo è.','Controlla sempre la fonte di un dato.'],
 ['Report che si leggono','Una pagina, una decisione','Cosa è cambiato e perché','Un buon report non elenca: spiega cosa è cambiato, perché e cosa fare adesso. Se serve una riunione per capirlo, va riscritto.','Scrivi report che chiudano con una decisione.']],
freelance:[
 ['Scegli il cliente ideale','Chi è, cosa cerca, cosa può pagare','Meglio pochi clienti giusti','Il freelance che accetta tutto lavora per tutti e non è nessuno. Scegliete un tipo di cliente e diventate la scelta ovvia.','Definisci il tuo cliente ideale.'],
 ['Un’offerta chiara','Cosa è incluso, cosa no','Un pacchetto batte un preventivo infinito','Più è chiaro il pacchetto, meno si negozia. Spiegate cosa fate, quanto costa e in quanto tempo.','Trasforma i tuoi servizi in pacchetti chiari.'],
 ['Prezzo e valore','Non calcolare solo le ore','Prezza sul risultato','Se un lavoro vale diecimila euro al cliente, farlo pagare cento è un errore per tutti e due. Il prezzo comunica anche la serietà.','Prezza sul valore, non solo sulle ore.'],
 ['Il passaparola','Chiedi una raccomandazione','Fai bene un lavoro piccolo','La maggior parte dei buoni clienti arriva da qualcuno che vi conosce. Chiedete, ringraziate e ricambiate.','Chiedi una raccomandazione dopo ogni lavoro riuscito.'],
 ['Contratti e confini','Scrivi cosa e quando','Il silenzio costa','Un accordo scritto vi protegge entrambi. Tre righe chiare valgono più di mille promesse a voce.','Metti per iscritto ogni accordo, anche piccolo.'],
 ['Evitare l’altalena','Mese pieno e mese vuoto','Costruisci un flusso costante','Il segreto del freelance tranquillo è cercare clienti anche quando è pieno di lavoro. Il momento per seminare è sempre adesso.','Cerca nuovi clienti anche quando sei pieno.']],
copy:[
 ['Il titolo fa metà del lavoro','Una promessa chiara, non un’idea vaga','Scrivine venti e scegli il migliore','Nove persone su dieci leggono solo il titolo. Scrivetene almeno venti versioni e buttate le prime dieci: sono quelle ovvie.','Scrivi venti titoli e scegli il migliore.'],
 ['Parla come il cliente','Raccogli le sue parole, non le tue','Recensioni e messaggi sono oro','Le parole migliori non le inventate: le trovate nelle recensioni, nelle email e nelle chiamate. Copiate la frase che il cliente userebbe parlando con un amico.','Raccogli le frasi reali dei clienti e riusale nei testi.'],
 ['Benefici, non caratteristiche','Cosa cambia per chi legge?','Dal “cosa è” al “cosa ci faccio”','Nessuno compra un trapano: compra un buco nel muro. Traducete ogni caratteristica in qualcosa che cambia la vita di chi legge.','Trasforma ogni caratteristica in un beneficio concreto.'],
 ['Una call to action sola','Una sola azione per pagina','Verbo chiaro, risultato chiaro','Chi ha tre scelte non ne fa nessuna. Decidete cosa volete che accada dopo e chiedetelo una volta, in modo chiaro.','Chiedi una sola azione per pagina.'],
 ['Rispondi alle obiezioni','Costa troppo? Funziona davvero?','Prevedile dentro il testo','Il lettore ha dei dubbi e voi non siete lì per rispondere. Scrivete le domande che farebbe e rispondete prima che le faccia.','Scrivi le obiezioni del cliente e rispondi dentro il testo.'],
 ['Prova sociale vera','Numeri, nomi, storie precise','Una recensione vale mille slogan','“Clienti soddisfatti” non dice nulla. “Marta ha dimezzato i tempi in due settimane” sì. Siate specifici e verificabili.','Usa prove specifiche: numeri, nomi, risultati.'],
 ['Struttura di una pagina di vendita','Problema, soluzione, prova, invito','Il lettore scorre, aiutalo','Una buona pagina racconta: ecco il problema, ecco come lo risolviamo, ecco chi ce l’ha fatta, ecco cosa fare adesso. Fine.','Segui la sequenza problema, soluzione, prova, invito.'],
 ['Tono e lunghezza','Lungo se serve, corto se basta','Taglia ogni parola che non lavora','Non esiste un testo troppo lungo: esiste un testo noioso. Controllate ogni frase e chiedetevi cosa succede se la tolgo.','Taglia ogni frase che non spinge il lettore avanti.']],
community:[
 ['Un luogo, una regola','Dai alle persone una casa','Poche regole, scritte chiare','Una community senza regole diventa rumore. Una con troppe regole diventa silenzio. Scrivetene poche e rispettatele per prime.','Dai alla community poche regole chiare.'],
 ['Il primo saluto','Accogli chi entra per nome','Chiedi cosa cerca','I primi cinque minuti decidono se resta. Un messaggio personale vale più di un benvenuto automatico.','Saluta ogni nuovo membro con un messaggio personale.'],
 ['Fai parlare gli altri','Domande aperte','Metti in luce chi partecipa','Il vostro compito non è parlare, è far parlare. Premiate chi contribuisce e ne arriveranno altri.','Metti in luce chi partecipa.'],
 ['Eventi dal vivo','Si crea fiducia in una giornata','Un caffè vale mille messaggi','Un’ora dal vivo crea più legami di un anno di chat. Se potete, ritrovatevi di persona.','Organizza ogni tanto un incontro dal vivo.']]
};
/* punti generali, usati per riempire */
const TKG=[
 ['Una azione sola','Scegli una cosa da fare domani','Falla prima di cercare altro','Alla fine di ogni evento scegliete un’unica cosa da portare a casa e fatela entro 48 ore. Tutto il resto è intrattenimento.','Porta a casa una sola azione e falla entro domani.'],
 ['Misura prima di cambiare','Parti da un numero di oggi','Confronta con lo stesso numero tra un mese','Senza un punto di partenza ogni miglioramento è solo un’impressione. Scrivete il numero di oggi.','Misura il punto di partenza prima di cambiare.'],
 ['Impara in pubblico','Racconta ciò che stai imparando','Gli errori sono contenuto','Condividere ciò che state imparando vi fa capire meglio le cose e vi avvicina a chi è un passo indietro. È il modo più onesto di costruire autorevolezza.','Racconta ciò che stai imparando, errori compresi.'],
 ['Le persone prima degli strumenti','Una buona relazione vale un’ottima tecnica','Chiedi, ascolta, ricambia','Gli strumenti cambiano ogni sei mesi, le persone no. Investite nelle relazioni e avrete sempre qualcuno con cui ripartire.','Investi nelle relazioni più che negli strumenti.'],
 ['Semplice vince','Togli un passaggio dal tuo processo','Spiegalo in tre frasi','Ogni passaggio in più è un posto dove perdersi. Se non riuscite a spiegarlo in tre frasi, non è ancora semplice.','Togli un passaggio dal tuo processo.'],
 ['Il feedback è un regalo','Chiedilo a tre persone diverse','Ringrazia senza difenderti','Chi vi dà un feedback sincero vi sta facendo un favore. Ascoltate fino in fondo prima di rispondere.','Chiedi feedback a tre persone diverse.'],
 ['Il tempo è la risorsa vera','Blocca ore per il lavoro profondo','Spegni le notifiche','Il lavoro che conta richiede ore ininterrotte. Se non le proteggete in agenda, qualcun altro le occuperà.','Blocca ore di lavoro profondo in agenda.'],
 ['Ripeti ciò che funziona','Trova il tuo contenuto migliore','Fanne una versione nuova','Prima di inventare qualcosa di nuovo, guardate cosa ha già funzionato e ripetetelo con una variazione.','Ripeti con una variazione ciò che già funziona.']];
/* domande: [domanda, risposta giusta, errata 1, errata 2, spiegazione] */
const TKQ={
ai:[['Il modo migliore di iniziare con l’AI nel lavoro è…','Scegliere un compito ripetitivo e provarlo per una settimana','Cambiare tutti i processi in un colpo solo','Aspettare che diventi perfetta','Meglio un compito concreto e misurabile.'],['Un buon prompt contiene…','Contesto, obiettivo, esempio e formato','Solo una parola chiave','Il tono più cortese possibile','Un brief chiaro dà risposte migliori.']],
podcast:[['Cosa decide se un ascoltatore resta?','I primi trenta secondi','La durata totale','Il logo della copertina','Il gancio iniziale decide.'],['Cosa fai di una puntata di un’ora?','Estrai clip, post e una newsletter','La pubblichi e basta','La cancelli dopo una settimana','Il riuso moltiplica il valore.']],
video:[['Qual è la priorità di un video breve?','Il gancio nei primi secondi','Il logo animato','Una musica epica','Il pollice scorre in tre secondi.'],['Quando un video funziona meglio?','Quando ha sottotitoli e ritmo','Quando è il più lungo possibile','Quando non ha una storia','Senza audio molti non lo capiscono.']],
social:[['Cosa fa crescere una pagina in modo stabile?','Conversazione con le persone','Pubblicare ogni ora','Comprare follower','Le risposte creano relazione.'],['Un post va male. Cosa fai?','Lo tratti come un dato e provi una variante','Cancelli la pagina','Pubblichi lo stesso post ancora','Ogni flop è un esperimento.']],
brand:[['Un brand forte è…','Coerente in ogni punto di contatto','Il logo più colorato','Quello con più followers','La coerenza costruisce fiducia.'],['Il tuo posizionamento è chiaro quando…','Lo spieghi in una frase','Serve una presentazione','Nessuno lo ricorda','Una frase chiara vale più di cento slide.']],
seo:[['Per scalare Google serve…','Rispondere alle domande reali delle persone','Ripetere la keyword cento volte','Copiare i concorrenti','Chi cerca una risposta la vuole trovare.'],['Cosa è meglio fare con un vecchio articolo?','Aggiornarlo','Eliminarlo','Ignorarlo','Aggiornare costa poco e rende molto.']],
ads:[['In un test pubblicitario cambi…','Una variabile alla volta','Tutto insieme','Niente','Solo così capisci cosa ha funzionato.'],['La campagna va male dopo due giorni. Cosa fai?','Aspetti dati sufficienti prima di decidere','La spegni subito','Raddoppi il budget','Servono dati per giudicare.']],
ecom:[['Perché si abbandona un carrello?','Costi imprevisti','Colori troppo vivaci','Il logo piccolo','I costi a sorpresa sono la prima causa.'],['Come si fidelizza un cliente?','Curando il periodo dopo l’acquisto','Con sconti sempre più alti','Ignorandolo','Il secondo acquisto è il più importante.']],
sales:[['In una trattativa è meglio…','Fare domande e ascoltare','Parlare tutto il tempo','Abbassare subito il prezzo','Chi ascolta capisce cosa serve.'],['Il cliente dice “costa troppo”. Tu…','Chiedi cosa non ti ha convinto','Cambi cliente','Sconti del 50%','L’obiezione spesso nasconde un dubbio.']],
startup:[['Prima di costruire un prodotto…','Parli con persone che hanno il problema','Disegni il logo','Cerchi investitori','Il problema vero vale più dell’idea.'],['Cosa uccide più imprese?','La mancanza di cassa','Un logo brutto','La concorrenza','Controlla i numeri ogni settimana.']],
mindset:[['Per una giornata più efficace…','Scegli una sola priorità vera','Fai il doppio delle cose','Salti le pause','Una priorità protetta vale più di dieci urgenze.'],['Cosa vince nel tempo?','La costanza di piccole abitudini','Il grande slancio isolato','La fortuna','Gli slanci si spengono, le abitudini restano.']],
money:[['Prima di investire…','Costruisci un fondo di sicurezza','Compra la moda del momento','Prendi un prestito','La riserva ti salva nei momenti storti.'],['Le tasse sono…','Una voce di costo da accantonare','Un imprevisto','Un problema del commercialista','Accantonare evita le sorprese.']],
write:[['Come si scrive una buona prima riga?','Si parte dal beneficio per chi legge','Si saluta a lungo','Si cita una definizione','La prima riga decide se continui.'],['Dopo la prima bozza…','Si taglia','Si pubblica subito','Si allunga','Tagliare rende il testo più chiaro.']],
data:[['Quante metriche seguire?','Poche, collegate a un’azione','Tutte quelle possibili','Nessuna','Meno numeri, più decisioni.'],['Due numeri salgono insieme. Significa che…','Può esserci o no un legame: va testato','Uno causa l’altro','Sono sbagliati','Correlazione non è causa.']],
freelance:[['Meglio avere…','Un cliente ideale ben definito','Qualsiasi cliente','Un solo cliente','Chi sceglie, si fa scegliere.'],['Come prezzare un lavoro?','In base al valore per il cliente','Solo a ore','In base al prezzo del concorrente','Il valore giustifica il prezzo.']],
copy:[['Cosa fa più differenza in un annuncio?','Il titolo e la promessa','Il font','La lunghezza del testo','Il titolo è ciò che si legge per primo.'],['Dove trovi le parole migliori per un testo?','Nelle parole dei clienti','Nel dizionario','Nei testi dei concorrenti','Chi compra parla in modo naturale.'],['Quante azioni chiedi in una pagina?','Una sola','Cinque, per sicurezza','Nessuna','Una scelta sola aumenta le probabilità.']],
community:[['Una community cresce quando…','Le persone parlano tra loro','Parli solo tu','Ci sono mille regole','Il tuo ruolo è far parlare.'],['Il primo messaggio a un nuovo membro è…','Personale e con una domanda','Un modulo automatico','Un listino prezzi','I primi minuti contano.']]
};
const TKQG=[['Alla fine di un evento, cosa conta di più?','Una sola azione fatta entro 48 ore','Il numero di appunti presi','Quante persone hai incontrato','Le idee senza azione svaniscono.'],['Per migliorare qualcosa devi prima…','Misurare il punto di partenza','Comprare uno strumento nuovo','Chiedere a un esperto','Senza partenza non vedi il progresso.'],['Un feedback duro è…','Una informazione utile','Un attacco personale','Da ignorare','Ascoltalo fino in fondo, poi decidi.'],['Cosa rende un processo semplice?','Si spiega in tre frasi','Ha molti passaggi','Serve un manuale','Se è lungo da spiegare, è lungo da fare.']];
const TKI=[
 'Oggi parliamo di una cosa che sembra semplice e semplice non è.',
 'Ho sbagliato quasi tutto, prima di imparare quello che vi racconto adesso.',
 'Vi prometto tre idee. Se ne portate a casa una, ho fatto il mio lavoro.',
 'Prima di cominciare: alzi la mano chi ha già provato a farlo e ha fallito. Bene, siete nel posto giusto.',
 'Non vi darò una formula. Vi racconterò cosa ha funzionato a me e cosa no.',
 'Questa sessione parte da una domanda scomoda: perché facciamo le cose come le facciamo?',
 'Vi racconto una storia vera e poi ne ricaviamo le regole.',
 'Ho solo trenta minuti. Quindi niente giri di parole: partiamo.'];
const TKO=[
 'Se oggi ricordate una cosa sola, che sia quella che avete segnato per ultima.',
 'Vi lascio con una domanda: cosa fareste domani mattina, se dipendesse solo da voi?',
 'Grazie per l’attenzione. Venitemi a trovare in corridoio: le domande migliori nascono lì.',
 'Il prossimo passo non è leggere altro: è fare. Grazie e buon proseguimento!',
 'Fate un esperimento piccolo questa settimana e raccontatemi com’è andato.',
 'Grazie di essere venuti. Adesso un caffè, che ve lo siete meritato.'];

const TKTOPIC=[
 ['ai',/\bai\b|\bia\b|intelligenza|gpt|prompt|agent|automaz|chatbot|llm|machine|app e tool|tool\b|codice|programm/i],
 ['podcast',/podcast|audio|puntat|radio/i],
 ['video',/video|youtube|reel|short|montaggio|tiktok|regia|film/i],
 ['social',/social|instagram|creator|follower|community|virale|viralit|influencer|trend/i],
 ['brand',/brand|posizionament|identit|personal|reputaz|linkedin|autorevol/i],
 ['seo',/seo|google|ricerca|keyword|traffico|sem\b/i],
 ['ads',/\bads\b|advertising|meta|campagn|funnel|conversion|lead|performance|growth|pubblicit/i],
 ['ecom',/e-?commerce|shop|amazon|vendere online|negozio|dropship|marketplace/i],
 ['sales',/vendit|sales|cliente|clienti|trattativ|offert|prezz|closer|commerciale/i],
 ['startup',/impresa|startup|fondar|imprendi|business|azienda|scalare|exit|soci|idea/i],
 ['mindset',/mindset|mente|abitudin|produttiv|focus|energia|riattiv|yoga|equilibr|benessere|successo|ribell|divergent|coraggio|cambiar|paura|motiv/i],
 ['money',/econom|soldi|finanz|invest|rendit|immobil|real estate|tass|fisco|cripto|budget|patrimon|risparm/i],

 ['copy',/copy|copywrit|headline|slogan|call to action|cta|pagina di vendita|landing|testi che vendono|persuas/i],
 ['write',/scriv|storytelling|narraz|racconto|newsletter|email|libro|testo|parole/i],
 ['data',/dati|analytic|metric|report|misur|kpi|numeri/i],
 ['freelance',/freelance|partita iva|consulen|agenzia|clienti ideali|autonom/i],
 ['community',/community|gruppo|tribù|membri|eventi/i]];
const TKTAG={'AI':['ai'],'Business':['startup','sales'],'Growth & Advertising':['ads','seo'],'Brand & Comunicazione':['brand','write'],'Social & Creator':['social','video'],'Economics':['money'],'Mindset & Lifestyle':['mindset']};

function tkTopics(s){
  const txt=(s.title||'')+' '+(s.sp||'')+' '+(s.role||''),out=[];
  TKTOPIC.forEach(([k,re])=>{if(re.test(txt)&&!out.includes(k))out.push(k);});
  (s.tags||[]).forEach(t=>(TKTAG[t]||[]).forEach(k=>{if(!out.includes(k))out.push(k);}));
  if(!out.length)out.push('startup','mindset');
  return out.slice(0,3);
}
function makeContent(s){
  if(s.c)return s.c;
  if(typeof extrasTalk==='function'){const x=extrasTalk(s);if(x)return s.c=x;}
  if(s.egg)return s.c=eggContent(s);
  const r=mulberry32(hashStr('talk|'+s.title+'|'+(s.sp||''))),tp=tkTopics(s);
  const shuf=a=>a.map(x=>[r(),x]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
  /* punti: a turno dai temi, senza ripetizioni, poi riempimento generale */
  const banks=tp.map(k=>shuf(TK[k]||[])),pts=[],used=new Set();
  for(let i=0;pts.length<4&&i<12;i++){const b=banks[i%banks.length],x=b.shift();if(x&&!used.has(x[0])){used.add(x[0]);pts.push(x);}}
  for(const x of shuf(TKG)){if(pts.length>=4)break;if(!used.has(x[0])){used.add(x[0]);pts.push(x);}}
  /* domanda: dal primo tema, con correct/wrong mescolati */
  const qs=shuf(tp.flatMap(k=>TKQ[k]||[]).concat(TKQG)),q=qs[0],opts=shuf([{t:q[1],r:'Giusto: '+q[4],good:true},{t:q[2],r:'Non proprio. '+q[4],good:false},{t:q[3],r:'Non proprio. '+q[4],good:false}]);
  const sh=s.title.length>46?s.title.slice(0,44)+'…':s.title;
  const intro=shuf(TKI)[0],outro=shuf(TKO)[0];
  const sl=[
   [sh,['Relatore: '+(s.sp||'—'),s.role||''],intro+' Titoli e speaker sono quelli del programma; i contenuti di queste slide sono inventati per il gioco.','Sessione: '+sh],
   ...pts.slice(0,2).map(p=>[p[0],[p[1],p[2]],p[3],p[4]]),
   {q:q[0],c:opts},
   ...pts.slice(2,4).map(p=>[p[0],[p[1],p[2]],p[3],p[4]]),
   ['Per concludere',['Una cosa da portare a casa','Una da fare entro domani'],outro,'Scegli un’azione da questa sessione e falla entro domani.']];
  s.c={title:s.title,speaker:s.sp,role:s.role,pal:{shirt:['#3a4a8a','#8a3a4a','#3a7a5a','#6a4a8a','#aa7a3a','#3a6a8a'][s.title.length%6],skin:['#e8b98a','#dfae80','#c98e62','#f0c8a0'][(s.sp||'').length%4],hair:['#2a1d14','#4a3322','#1a1a20','#8a3a2a'][s.title.length%4],long:s.title.length%3===0},slides:sl};
  if(typeof extrasContent==='function')extrasContent(s,s.c);
  return s.c;
}
