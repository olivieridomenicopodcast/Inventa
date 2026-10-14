#!/bin/sh
# Sincronizza Rimini 3 giorni da Inventa al repo MW26: copia IDENTICA di tutti i file, con le sole differenze volute
# (nessun collegamento a Inventa/hub, titolo MW26, didascalia foto senza "· Inventa").
#
# Uso:   tools/sync_mw26.sh [cartella-di-MW26] [--check] [--push]
#   (senza opzioni)  copia i file e mostra cosa è cambiato; non fa commit
#   --check          non copia nulla: dice solo se i due repo sono già allineati
#   --push           dopo la copia fa commit e push su main di MW26
set -e
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DST=""; CHECK=0; PUSH=0
for a in "$@"; do case "$a" in --check) CHECK=1;; --push) PUSH=1;; *) DST="$a";; esac; done
[ -n "$DST" ] || DST=/home/user/mw26
[ -d "$DST/.git" ] || { echo "Cartella MW26 non trovata: $DST (clona prima il repo)"; exit 1; }

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/rimini"
cp "$SRC"/rimini/* "$TMP/rimini/"
cp "$SRC/shared.css" "$TMP/shared.css"
python3 - "$SRC" "$TMP" <<'PY'
import sys
src,tmp=sys.argv[1],sys.argv[2]
h=open(src+'/rimini.html',encoding='utf-8').read()
reps=[('<title>Inventa · Rimini 3 giorni</title>','<title>Rimini 3 giorni · MW26</title>'),
 ('<header class="top"><a class="brand" href="index.html"><i></i>INVENTA <span class="crumb">/ RIMINI 3 GIORNI</span></a><div class="tools"><a class="pill" href="index.html">← Hub</a></div></header>','<header class="top"><span class="brand"><i></i>MW26 <span class="crumb">/ RIMINI 3 GIORNI</span></span></header>')]
for a,b in reps:
    if a not in h: sys.exit('ATTENZIONE: non trovo in rimini.html il testo da sostituire:\n'+a[:80])
    h=h.replace(a,b)
open(tmp+'/index.html','w',encoding='utf-8').write(h)
g=open(tmp+'/rimini/game.js',encoding='utf-8').read()
g=g.replace(' · Inventa','')
open(tmp+'/rimini/game.js','w',encoding='utf-8').write(g)
PY

# il numero di build è proprio di MW26: lo lasciamo com'è nel repo di destinazione
BUILD="$(sed -n 's/^const BUILD=\([0-9]*\);.*/\1/p' "$DST/rimini/game.js" | head -1)"
DB="$(sed -n 's/.*id="bld" data-b="\([0-9]*\)".*/\1/p' "$DST/index.html" | head -1)"
[ -n "$BUILD" ] && sed -i "s/^const BUILD=[0-9]*;/const BUILD=$BUILD;/" "$TMP/rimini/game.js"
[ -n "$DB" ] && sed -i "s/id=\"bld\" data-b=\"[0-9]*\"/id=\"bld\" data-b=\"$DB\"/" "$TMP/index.html"

# confronto
CH=0
for f in index.html shared.css; do cmp -s "$TMP/$f" "$DST/$f" || { echo "da aggiornare: $f"; CH=1; }; done
for f in "$TMP"/rimini/*; do b=$(basename "$f"); cmp -s "$f" "$DST/rimini/$b" || { echo "da aggiornare: rimini/$b"; CH=1; }; done
for f in "$DST"/rimini/*; do b=$(basename "$f"); [ -e "$TMP/rimini/$b" ] || { echo "da rimuovere: rimini/$b"; CH=1; }; done
if [ $CH -eq 0 ]; then echo "MW26 è già identico a Inventa (tranne titolo, intestazione, didascalia foto e numero di build)."; exit 0; fi
[ $CHECK -eq 1 ] && { echo "MW26 NON è allineato."; exit 2; }

# copia
mkdir -p "$DST/rimini"
cp "$TMP/index.html" "$DST/index.html"; cp "$TMP/shared.css" "$DST/shared.css"
for f in "$DST"/rimini/*; do b=$(basename "$f"); [ -e "$TMP/rimini/$b" ] || rm -f "$f"; done
cp "$TMP"/rimini/* "$DST/rimini/"
echo "Copia completata in $DST."
cd "$DST"
if [ $PUSH -eq 1 ]; then
  [ -x tools/bump_build.sh ] && ./tools/bump_build.sh
  git add -A
  git commit -m "Sincronizzazione da Inventa" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_017ScaaJSVoF6aPtWfSBindy"
  git push -u origin main
else
  git status --short | head -20
  echo "Controlla e fai commit/push, oppure rilancia con --push."
fi
