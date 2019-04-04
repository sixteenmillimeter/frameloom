#!/bin/bash

TMP_FILE=$(mktemp)

echo "Generating square gif of ${1} as ${2}x${2}"

ffmpeg -i "$1" -c:v prores_ks -profile:v 3 -filter:v "crop=1080:1080:420:0" $TMP_FILE
ffmpeg -i $TMP_FILE -f gif -vf scale=$2:$2 "square_${2}.gif"

echo "Generated square_${2}.gif"