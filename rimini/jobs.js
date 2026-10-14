'use strict';
/* RIMINI 3 GIORNI · mestieri del digital marketing (aggiornati all'era dell'AI), famiglie, tratti e profili.
   Fonti della ricerca: IAB Italia / Sole 24 Ore (AI prompt designer, creative technologist, agent orchestrator, data ethicist),
   Addison Group 2026 (AI/automation strategist, ruoli ibridi "full stack"), LinkedIn Jobs on the Rise 2026 (AI consultant, founder, consulenti indipendenti). */

/* famiglie di mestiere: lato = "di cosa si occupano", tags = sessioni del programma consigliate, tip = chiavi di TIPS */
const JOBFAM={
  creator:{n:'Contenuti e produzione',lato:'dei contenuti',tags:['Social & Creator','Brand & Comunicazione'],tip:['pod','vid','soc'],
    w:{creativo:3,curioso:2,ironico:2,empatico:1,pratico:1},
    pitch:'Do voce e forma alle idee: costruisco contenuti che le persone hanno voglia di guardare o ascoltare fino in fondo.',
    cerca:'storie da raccontare e persone con cui fare cose insieme',
    scout:'Cerco qualcuno che sappia trasformare un’idea in contenuti veri: tu sembri la persona giusta. Ti va di fare una prova insieme?',
    epi:'Torni a casa con la cartella piena di idee, clip e storie da trasformare in contenuti.'},
  design:{n:'Design e creatività visiva',lato:'del design',tags:['Brand & Comunicazione','Social & Creator'],tip:['brand','vid'],
    w:{creativo:3,analitico:1,pratico:1,curioso:2,empatico:1},
    pitch:'Do un’identità a ciò che gli altri hanno in testa: layout, brand, interfacce e movimento.',
    cerca:'progetti con un’anima e clienti che sappiano ascoltare',
    scout:'Ho un brand che ha bisogno di un occhio come il tuo. Mi mandi un portfolio e ne parliamo?',
    epi:'Torni con quaderni pieni di schizzi, palette e un paio di collaborazioni da inseguire.'},
  social:{n:'Social, community e PR',lato:'dei social',tags:['Social & Creator','Brand & Comunicazione'],tip:['soc','brand','pod'],
    w:{empatico:3,ironico:2,ambizioso:1,curioso:2,pratico:1},
    pitch:'Costruisco community e reputazione: parlo con le persone, scelgo cosa dire e quando dirlo.',
    cerca:'brand con una voce e creator con cui costruire qualcosa',
    scout:'Cerco chi sappia far parlare di noi sui social senza sembrare una pubblicità. Parliamone con calma?',
    epi:'Torni con la rubrica piena di nuovi contatti e un calendario editoriale in testa.'},
  perf:{n:'Performance, SEO e dati',lato:'dei numeri',tags:['Growth & Advertising','Economics'],tip:['sale','ai'],
    w:{analitico:3,pratico:2,diretto:2,ambizioso:1,curioso:1},
    pitch:'Faccio crescere i numeri: campagne, SEO, funnel e test. Se non si misura, per me non esiste.',
    cerca:'budget da ottimizzare e dati con cui giocare',
    scout:'Il nostro funnel perde pezzi e serve qualcuno che sappia misurarlo. Ti andrebbe di dare un’occhiata ai dati?',
    epi:'Torni con una lista di test da lanciare lunedì e qualche numero da battere.'},
  tech:{n:'AI, automazioni e sviluppo',lato:'dell’AI e delle automazioni',tags:['AI','Growth & Advertising'],tip:['ai','sale'],
    w:{analitico:2,curioso:3,pratico:2,diretto:1,creativo:1},
    pitch:'Costruisco strumenti: automazioni, agenti, app e flussi con l’AI che fanno il lavoro noioso al posto nostro.',
    cerca:'problemi veri da automatizzare e persone con idee da trasformare in strumenti',
    scout:'Abbiamo mille processi manuali che sembrano fatti apposta per un’automazione. Ci dai una mano a costruirla?',
    epi:'Torni con una lista di automazioni da costruire e almeno tre idee di app.'},
  strat:{n:'Strategia e management',lato:'della strategia',tags:['Business','Brand & Comunicazione','Growth & Advertising'],tip:['brand','sale','mind'],
    w:{analitico:2,ambizioso:3,diretto:2,pratico:2,empatico:1},
    pitch:'Metto ordine tra obiettivi, canali e persone: decido cosa fare, in che ordine e perché.',
    cerca:'partner affidabili e idee che reggono alla prova dei numeri',
    scout:'Stiamo ripensando la strategia e servirebbe una persona con visione d’insieme. Ti va di fare due chiacchiere?',
    epi:'Torni con una visione più chiara, un taccuino pieno di spunti e qualche piano da riscrivere.'},
  biz:{n:'Imprenditoria, freelance e vendite',lato:'del business',tags:['Business','Economics','Growth & Advertising'],tip:['sale','mind','brand'],
    w:{ambizioso:3,diretto:2,pratico:3,curioso:1,ironico:1},
    pitch:'Metto in piedi e faccio girare attività: prodotti, clienti, vendite e conti che tornano.',
    cerca:'clienti, soci e collaboratori che abbiano voglia di fare',
    scout:'Sto cercando un socio o un collaboratore che condivida questo spirito. Tu sembri una persona che non si ferma: ne parliamo?',
    epi:'Torni con contatti pronti a diventare clienti o soci, e una lista di cose da fare lunedì.'},
  edu:{n:'Formazione, coaching e crescita',lato:'della formazione',tags:['Mindset & Lifestyle','Business'],tip:['mind','pod','brand'],
    w:{empatico:3,curioso:2,ironico:1,pratico:1,ambizioso:1},
    pitch:'Aiuto le persone a crescere: ascolto, spiego, accompagno e trasformo l’esperienza in metodo.',
    cerca:'storie di persone che cambiano e colleghi con cui scambiarsi metodi',
    scout:'Stiamo costruendo un percorso formativo e cerchiamo una persona con la tua sensibilità. Ti piacerebbe collaborare?',
    epi:'Torni con nuovi metodi, storie da raccontare e la voglia di aiutare altri a crescere.'}
};

/* mestieri: [etichetta, famiglia] */
const JOBS=[
 ['Podcaster','creator'],['Podcast producer','creator'],['Podcast coach','creator'],['Audio editor / sound designer','creator'],['Videomaker','creator'],['Video editor','creator'],['YouTuber','creator'],['Content creator','creator'],['UGC creator','creator'],['Copywriter','creator'],['Content strategist','creator'],['Ghostwriter / scrittore','creator'],['Giornalista / editor','creator'],['Fotografo/a','creator'],['Newsletter writer','creator'],['Streamer','creator'],
 ['Graphic designer','design'],['Brand designer','design'],['UI/UX designer','design'],['Motion designer','design'],['Illustratore/trice','design'],['Art director','design'],['Creative technologist','design'],['Web designer','design'],
 ['Social media manager','social'],['Social media strategist','social'],['Community manager','social'],['Influencer marketer','social'],['Personal brand strategist / LinkedIn','social'],['PR / ufficio stampa','social'],['Digital PR','social'],
 ['Media buyer','perf'],['Performance marketer','perf'],['Specialista SEO','perf'],['Specialista SEM / Google Ads','perf'],['Growth marketer','perf'],['Marketing analyst','perf'],['Web analyst','perf'],['Email / CRM marketer','perf'],['CRO specialist','perf'],['Affiliate marketer','perf'],['Lead generation specialist','perf'],
 ['AI marketer','tech'],['Consulente AI','tech'],['AI automation specialist','tech'],['Prompt designer','tech'],['Agent orchestrator','tech'],['No-code developer','tech'],['Sviluppatore web','tech'],['Sviluppatore di app con l’AI','tech'],['Data analyst','tech'],['Marketing technologist','tech'],['AI governance / data ethics','tech'],
 ['Marketing manager','strat'],['Brand manager','strat'],['Product marketing manager','strat'],['Digital strategist','strat'],['Full stack marketer','strat'],['Head of marketing / CMO','strat'],['Project manager','strat'],['Product manager','strat'],['Marketing operations manager','strat'],
 ['Imprenditore/trice','biz'],['Founder di startup','biz'],['Freelance / partita IVA','biz'],['Titolare di agenzia','biz'],['E-commerce manager','biz'],['E-commerce owner','biz'],['Consulente marketing','biz'],['Sales / venditore','biz'],['Business developer','biz'],['Amazon seller','biz'],['Infoprodotti e corsi online','biz'],['Investitore / real estate','biz'],
 ['Coach','edu'],['Formatore/trice','edu'],['Mentor','edu'],['Consulente aziendale','edu'],['Docente','edu'],['HR / recruiter','edu'],['Mindset coach','edu'],['Studente/ssa','edu'],['Career changer in cerca di lavoro','edu'],['Appassionato/a di marketing','edu']
];
const JOBALTRO='Altro';

/* parole chiave per classificare un mestiere scritto a mano ("Altro") */
const JOBKW=[
 ['tech',/\b(ai|a\.i\.|intelligenza|prompt|agent|automaz|automation|no.?code|low.?code|sviluppat|developer|program|software|app\b|dati|data|machine|bot|tecnic|it\b|cyber|engineer|ingegner)/i],
 ['perf',/\b(seo|sem|ads|adv|media buy|perform|growth|funnel|analytic|analist|crm|email|newsletter|conversion|cro|affiliat|lead|traffic|campagn)/i],
 ['creator',/\b(podcast|video|audio|montaggio|editor|youtub|tiktok|stream|content|contenut|copy|scrittor|writer|giornalis|fotograf|regista|musicis|sound|speaker|blog|reel)/i],
 ['design',/\b(design|grafic|illustr|brand design|ui\b|ux\b|motion|animaz|art director|3d|packag|logo|web design|creativ)/i],
 ['social',/\b(social|community|influenc|pr\b|ufficio stampa|comunicaz|personal brand|linkedin|instagram|reputaz|brand ambassador)/i],
 ['biz',/\b(imprendit|founder|fondator|titolar|ceo|ecommerce|e-commerce|negozio|vendit|sales|business|startup|agenzia|partita iva|freelance|amazon|dropship|investit|immobil|real estate|commerciale|socio)/i],
 ['edu',/\b(coach|formator|mentor|docente|insegnant|trainer|psicolog|hr\b|recruit|student|consulent|terap|educat|formazione|scuola)/i],
 ['strat',/\b(manager|strateg|direttore|direzione|cmo|responsabile|project|product|marketing|brand|operations|pianific|head of|lead\b)/i]
];
const jobNorm=s=>(s||'').toString().trim().replace(/\s+/g,' ');
function jobFind(txt){const t=jobNorm(txt).toLowerCase();if(!t)return null;return JOBS.find(j=>j[0].toLowerCase()===t)||null;}
function jobFam(txt){
  const f=jobFind(txt);if(f)return f[1];
  const t=jobNorm(txt);if(!t)return 'strat';
  for(const [fam,re] of JOBKW)if(re.test(t))return fam;
  const keys=Object.keys(JOBFAM);return keys[hashStr('job|'+t.toLowerCase())%keys.length];   // nessuna parola riconosciuta: personalità generata dal testo
}
function jobSuggest(q){const t=jobNorm(q).toLowerCase();if(!t)return JOBS.slice(0,8);
  const sc=j=>{const l=j[0].toLowerCase();return l.startsWith(t)?0:l.split(/[\s/]+/).some(w=>w.startsWith(t))?1:l.includes(t)?2:9;};
  return JOBS.map(j=>[sc(j),j]).filter(x=>x[0]<9).sort((a,b)=>a[0]-b[0]).slice(0,7).map(x=>x[1]);}

/* tratti caratteriali: pesati dalla famiglia, scelti in modo deterministico dal testo del mestiere */
const TRAITS={
  curioso:{n:'curioso/a',q:'Mi hanno sempre incuriosito le cose che non conosco: ti va di raccontarmi come lavori?'},
  diretto:{n:'diretto/a',q:'Vado al sodo: cosa cerchi qui e come posso esserti utile?'},
  creativo:{n:'creativo/a',q:'Ho in testa una cosa strana: e se unissimo le nostre idee in un progetto?'},
  analitico:{n:'analitico/a',q:'Mi piace ragionare coi numeri: quali risultati ti hanno sorpreso di più?'},
  ironico:{n:'ironico/a',q:'Dico solo che il caffè qui costa più di certi corsi… ma ne vale la pena, no?'},
  empatico:{n:'empatico/a',q:'Prima di parlare di lavoro: come stai vivendo questi giorni?'},
  ambizioso:{n:'ambizioso/a',q:'Io punto in alto: qual è l’obiettivo più grande che hai per quest’anno?'},
  pratico:{n:'pratico/a',q:'Parliamo di cose concrete: cosa possiamo fare insieme già dal mese prossimo?'}
};
function jobTraits(txt){
  const fam=JOBFAM[jobFam(txt)],r=mulberry32(hashStr('traits|'+jobNorm(txt).toLowerCase())),pool=Object.entries(fam.w).flatMap(([k,w])=>Array(w).fill(k)),out=[];
  let g=0;while(out.length<3&&g++<200){const t=pool[Math.floor(r()*pool.length)];if(!out.includes(t))out.push(t);}
  return out;
}
/* profilo completo del personaggio a partire dal mestiere */
function jobProfile(txt){const job=jobNorm(txt)||'Appassionato/a di marketing',fam=jobFam(job);return{job,fam,famN:JOBFAM[fam].n,traits:jobTraits(job),listed:!!jobFind(job)};}

/* affinità tra famiglie (0..1): complementari alte, lontane basse */
const AFF={
 'creator-creator':.8,'creator-design':.85,'creator-social':.9,'creator-perf':.55,'creator-tech':.6,'creator-strat':.6,'creator-biz':.65,'creator-edu':.75,
 'design-design':.8,'design-social':.7,'design-perf':.5,'design-tech':.65,'design-strat':.6,'design-biz':.6,'design-edu':.55,
 'social-social':.8,'social-perf':.7,'social-tech':.55,'social-strat':.75,'social-biz':.7,'social-edu':.65,
 'perf-perf':.8,'perf-tech':.85,'perf-strat':.8,'perf-biz':.9,'perf-edu':.5,
 'tech-tech':.8,'tech-strat':.7,'tech-biz':.75,'tech-edu':.55,
 'strat-strat':.8,'strat-biz':.85,'strat-edu':.65,
 'biz-biz':.8,'biz-edu':.75,
 'edu-edu':.8};
const aff=(a,b)=>AFF[a+'-'+b]??AFF[b+'-'+a]??.55;
