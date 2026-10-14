'use strict';
/* RIMINI 3 GIORNI · dialoghi con le persone: tante varianti scelte in modo deterministico (seme + persona + giorno). */
const CH_GREET=[
 'Ciao! Sono {first}, {job} di {city}. Tu?',
 'Ehi, ciao! Ti ho visto prima in fila per il caffè. Io sono {first}, {job}.',
 'Scusa se ti fermo: sono {first}, vengo da {city}. Tu di cosa ti occupi?',
 'Buongiorno! {first}, {job}. È il tuo primo Marketers World?',
 'Posso rubarti un minuto? Sono {first}, faccio {job} a {city}.',
 'Ciao, ti va di scambiare due parole? Io sono {first}, {job}.',
 'Che giornata, eh? Io sono {first} ({job}). E tu?',
 'Ma tu sei in fila per il prossimo workshop? Io sono {first}, {job} di {city}.',
 'Ehi! Hai anche tu quell’aria di chi ha già cambiato sala tre volte? Io sono {first}.',
 'Piacere, {first}. Da {city} per il #MW26: faccio {job}. Tu?',
 'Scusa, mi puoi dire se la sessione dopo è in questa sala? Ah, comunque sono {first}, {job}.',
 'Ciao! Ho appena finito di parlare con tre persone e già mi gira la testa. Sono {first}, {job}.',
 'Ti va un caffè virtuale? Io sono {first}, {job}. Ho già perso due volte l’ascensore.',
 'Hey, bel badge! Io sono {first}, {job} di {city}. Cosa ti ha portato qui?',
 '{first}, piacere. Mi occupo di {job} e sto cercando di capire dove si mangia qui intorno. Tu?'];
const CH_GREET_T={
 m:['Che sonno stamattina! Io sono {first}, {job}. Tu come stai?','Buongiorno! Sono {first}, {job}: caffè numero tre, ma giuro che sono svegli{o|a}.'],
 p:['Dopo pranzo cala l’energia, vero? Io sono {first}, {job}. Tu?','Pomeriggio pieno! Sono {first}, {job} di {city}. Dove stai andando?'],
 s:['Dopo una giornata così ci vuole una pausa. Sono {first}, {job}. E tu?','Serata tranquilla o stasera si va all’Offworld? Io sono {first}, {job}.']};
const CH_MET=[
 'Ci siamo già presentati! Ci sentiamo dopo l’evento, ok?',
 'Ehi, ci siamo già visti! Come sta andando la giornata?',
 'Ancora tu! Sempre un piacere. Hai visto qualche sessione bella?',
 'Ciao di nuovo! Ci rivediamo domani, magari in sala.',
 'Ci siamo già scambiati i contatti: scrivimi per quella cosa che dicevamo.',
 'Eccoti! Ti ho appena cercato su Marketers Pro.',
 'Ci incontriamo per la terza volta oggi: è un segno!'];
const CH_BYE=['Ciao, devo scappare!','Scusa, devo andare in sala.','Ci vediamo dopo, ok?','Devo correre, ho un workshop!','Grazie, a più tardi!'];
const CH_CONTACT=['Volentieri','Certo, scambiamoci i contatti','Perfetto, ti passo il mio profilo','Sì, ci sto!','Va bene, teniamoci in contatto'];
const CH_HI=[
 'Ma dai, {job}! Io sto dalla parte {lato}: siamo complementari, ci sarebbero mille cose da fare insieme. ',
 '{job}? Non ci credo, è proprio ciò che cercavo! Io sto dalla parte {lato}. ',
 'Che coincidenza: io sto dalla parte {lato} e tu fai {job}. Dovremmo collaborare! ',
 'Quindi fai {job}! Io lavoro {lato}: ci sono sicuramente cose da costruire insieme. '];
const CH_MID=[
 '{job}, interessante! Io sono più dalla parte {lato}. Magari c’è qualcosa da fare insieme. ',
 'Ah, {job}! Io mi occupo {lato}: i nostri lavori si sfiorano. ',
 '{job}… bello! Io sto più su cose {lato}, ma ci incontriamo a metà strada. ',
 'Piacere! Quindi {job}. Io lavoro {lato}, potremmo scambiarci qualche dritta. '];
const CH_LO=[
 'Wow, {job}: un mondo diverso dal mio, che sta dalla parte {lato}. Mi incuriosisce molto. ',
 '{job}! Io sono {lato}, quindi parliamo lingue diverse. Ma mi piace imparare. ',
 'Interessante, io non so quasi nulla di {job}. Io sto dalla parte {lato}: ti va di scambiarci i punti di vista? ',
 'Che bello, un punto di vista nuovo! Io sto {lato}, di {job} so poco. '];
const CH_BYE_OK=['Ci sentiamo dopo l’evento!','Segnati il mio nome, ci vediamo in giro.','Scrivimi su Marketers Pro, rispondo sempre.','Alla prossima chiacchierata!'];
/* domande che puoi fare: ogni risposta ha varianti */
const CH_TOPIC=[
 {q:'Che workshop consigli?',tip:true,a:['Il consiglio che mi porto a casa: «{tip}»','Se posso: «{tip}». Me l’hanno detto proprio qui.','Non ti so dire quale sala, ma ti dico cosa ho imparato: «{tip}»']},
 {q:'Qual è la sessione più bella finora?',a:['Quella di ieri mattina, senza dubbio: ho preso tre pagine di appunti.','Dipende dai gusti. Io mi sono innamorat{o|a} di una sessione piccola in una sala piccola.','Per ora il Main Stage, ma ho sentito ottime cose di un workshop al primo piano.','Non ho ancora scelto, però il Main Stage dà una carica pazzesca.']},
 {q:'Dove si mangia bene qui intorno?',a:['Ti dico solo: piadina. Poi mi ringrazierai.','Nel Palacongressi c’è il Bistrot, ma se hai tempo esci a camminare.','Io ho preso un panino al volo, ma dicono che il pesce a Rimini sia ottimo.','Chiedi in giro: tutti hanno un posto del cuore. Io ho scoperto il mio ieri.']},
 {q:'Com’è l’Offworld?',a:['Karaoke, musica e gente che non ti aspetteresti mai sul palco. Da non perdere.','Dicono che il venerdì sera sia il più bello. Io ci vado.','Ci vado per ascoltare, non per cantare. Ma sai come va a finire…','Mi hanno detto che alla fine ti ritrovi a ballare con persone che non conoscevi.']},
 {q:'Come ti orienti tra le sale?',a:['Il telefono: mappa e “Portami qui”. Io senza mi sarei pers{o|a} al primo piano.','Seguo la folla. Di solito funziona.','Ho sbagliato sala due volte, ma ho conosciuto gente così.','Controllo il programma nell’app prima di ogni pausa.']},
 {q:'Come sei arrivat{O|A} a fare questo lavoro?',a:['Per caso: ho cominciato per gioco e non mi sono più fermato.','Dopo tre mestieri diversi. Ogni volta ho imparato qualcosa che mi serve oggi.','Ho seguito la curiosità. Se vuoi un consiglio: fai.','All’inizio facevo tutto gratis, per imparare. Ripagherebbe ancora oggi.']},
 {q:'È il tuo primo Marketers World?',a:['No, è la terza volta. Ma ogni anno cambio sessioni e scopro cose nuove.','Sì, il primo! Sono emozionat{o|a} e un po’ spaesat{o|a}.','Il secondo. L’anno scorso ho fatto troppo poco networking, stavolta recupero.','Sì, e già sto pensando di tornare il prossimo anno.']},
 {q:'Che strumenti usi tutti i giorni?',a:['Pochi, ma buoni: un editor, un foglio di calcolo e un paio di automazioni.','Sto cercando di semplificare: meno strumenti, più abitudini.','Ho provato di tutto, adesso uso solo ciò che mi fa risparmiare tempo vero.','L’AI per le bozze, poi riscrivo tutto con il mio stile.']},
 {q:'Hai visto qualche speaker interessante?',a:['Ieri ho sentito un intervento che mi ha fatto cambiare idea su un sacco di cose.','Non faccio il fan, ma sul Main Stage c’è stato un momento da brividi.','Seguo soprattutto i workshop: sono più pratici.','Ti dico solo: arriva presto in sala se vuoi un posto in prima fila.']},
 {q:'Cosa consigli di non perdere?',a:['Il networking tra una sessione e l’altra: è lì che succedono le cose.','La Silent Stage: strana ma bellissima, con le cuffie sembra di essere altrove.','Il firmacopie, se ti piacciono i libri. La coda è lunga ma ne vale la pena.','Un giro tra gli stand: ci sono sempre idee utili e gadget carini.']},
 {q:'Come si fa networking senza sembrare invadenti?',a:['Chiedi una cosa vera, non “di cosa ti occupi”. Funziona sempre.','Parti dalla sessione appena finita: tutti hanno qualcosa da dire.','Ascolta più di quanto parli. E poi ricontatta entro due giorni.','Un sorriso e una domanda aperta. Il resto viene da sé.']},
 {q:'Cosa ne pensi dell’AI nel nostro lavoro?',a:['È uno strumento potentissimo, ma il giudizio resta nostro.','Mi ha tolto i compiti che odio. Adesso devo imparare a usare meglio il tempo che mi resta.','Ci vedo più opportunità che rischi, ma bisogna restare curiosi.','Un po’ mi spaventa, un po’ mi entusiasma. Come tutte le cose nuove.']},
 {q:'Quanto ti fermi a Rimini?',a:['Fino a domenica sera, poi ritorno in treno e dormo per due giorni.','Ho una giornata in più: andrò a fare due passi in spiaggia.','Solo per l’evento: il lunedì mi aspetta già la scrivania.','Tre giorni pieni, senza perdere una sessione, per quanto possibile.']},
 {q:'Quale app o profilo segui per aggiornarti?',a:['Ne seguo pochi ma buoni. E Marketers Pro, ovviamente.','Newsletter e podcast: li ascolto in treno.','Faccio una lista di creator che mi ispirano e li guardo il sabato mattina.','Niente di fisso: seguo ciò che mi serve per il progetto del momento.']},
 {q:'Il Palacongressi è grande, vero?',a:['Enorme. Io me lo ricordo più piccolo.','Tra scale mobili e ascensori mi perdo sempre. Meno male che c’è la mappa.','Mi hanno detto che il primo piano è ancora più bello: ci sono le sale dei workshop.','Per me il bello è girare: ogni angolo ha qualcuno da conoscere.']}];


/* genere dei personaggi: dal nome; {o|a} = genere di chi parla, {O|A} = genere del giocatore */
const FEM_NAMES=new Set(['Giulia','Chiara','Sara','Elena','Francesca','Martina','Alessia','Valentina','Silvia','Federica','Ilaria','Laura','Beatrice','Arianna','Camilla','Noemi','Veronica','Roberta','Serena','Benedetta','Elisa','Greta','Irene','Monica','Rebecca','Teresa','Vittoria','Agnese','Lucia','Erika','Patrizia','Paola','Linda','Lusi']);
const genderOf=first=>FEM_NAMES.has((first||'').split(' ')[0])?'f':'m';
const gxf=(s,g,pg)=>(s||'').replace(/\{o\|a\}/g,g==='f'?'a':'o').replace(/\{O\|A\}/g,(pg||(typeof PLAYER!=='undefined'?PLAYER.gender:'m'))==='f'?'a':'o');
const npcGender=n=>n.gender||genderOf((n.name||'').split(' ')[0]);
function chRng(n,salt){return mulberry32(hashStr(G.seed+'|ch|'+n.id+'|'+G.day+'|'+(salt||'')));}
const chPick=(r,a)=>a[Math.floor(r()*a.length)];
function chFill(s,n,extra){const [job,city]=(n.role||'').split(' · ');return gxf(s,npcGender(n)).replace(/\{first\}/g,(n.name||'').split(' ')[0]).replace(/\{job\}/g,(job||n.job||'').toLowerCase()).replace(/\{city\}/g,city||'Rimini').replace(/\{lato\}/g,(extra&&extra.lato)||'').replace(/\{tip\}/g,(extra&&extra.tip)||'');}
function chGreet(n){const r=chRng(n,'g'),tm=G.min<12*60?'m':G.min<18*60?'p':'s';const pool=r()<.35?CH_GREET_T[tm]:CH_GREET;return chFill(chPick(r,pool),n);}
function chMet(n){return chFill(chPick(chRng(n,'m'),CH_MET),n);}
function chReply(n,a,lato,job){const r=chRng(n,'r'),pool=a>=.75?CH_HI:a>=.62?CH_MID:CH_LO;return gxf(chPick(r,pool),npcGender(n)).replace(/\{job\}/g,job.toLowerCase()).replace(/\{lato\}/g,lato);}
function chTopics(n,count){const r=chRng(n,'t'),idx=CH_TOPIC.map((_,i)=>i).sort(()=>r()-.5).slice(0,count);return idx.map(i=>CH_TOPIC[i]);}
function chAnswer(n,t,tip){const r=chRng(n,'a'+t.q);return chFill(chPick(r,t.a),n,{tip});}
