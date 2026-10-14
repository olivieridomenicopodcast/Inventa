#!/bin/sh
# Aggiorna il numero di build di Rimini (numero di commit + 1) prima di committare.
n=$(( $(git rev-list --count HEAD) + 1 ))
sed -i "s/^const BUILD=[0-9]*;/const BUILD=$n;/" rimini/game.js
sed -i "s/id=\"bld\" data-b=\"[0-9]*\"/id=\"bld\" data-b=\"$n\"/" rimini.html
echo "build $n"
