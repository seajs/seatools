#!/bin/bash
#usage: ./tools/size.sh

SRC=$1-debug.js
MIN=$1.js

SIZE_SRC=$(cat dist/$SRC | wc -c)
SIZE_MIN=$(cat dist/$MIN | wc -c)
SIZE_GZIP=$(gzip -c1 dist/$MIN | wc -c)

RESULT1="$(echo "scale=3;$SIZE_SRC/1024" | bc -l) KB;$SRC\n"
RESULT2="$(echo "scale=3;$SIZE_MIN/1024" | bc -l) KB;$MIN\n"
RESULT3="$(echo "scale=3;$SIZE_GZIP/1024" | bc -l) KB;$MIN gzipped\n"

echo -e "$RESULT1$RESULT2$RESULT3$RESULT4" | column -t -s ";"
echo -e "$(cat dist/$SRC | wc -l | sed 's/ //g') LOC"
