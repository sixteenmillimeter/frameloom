#!/bin/bash

TMP_CROP=$(mktemp)
TMP_GIF=$(mktemp)
TMP_PALETTE=$(mktemp)
echo "Generating square gif of ${1} as ${2}x${2}"

ffmpeg -y -i "$1" -c:v prores_ks -profile:v 3 -filter:v "crop=1080:1080:420:0" "$TMP_CROP.mov"
ffmpeg -y -i "$TMP_CROP.mov" -c:v prores_ks -profile:v 3 -vf scale=$2:$2 "$TMP_GIF.mov"
ffmpeg -y -i "$TMP_GIF.mov" -vf palettegen "$TMP_PALETTE.png"
ffmpeg -y -i "$TMP_GIF.mov" -i "$TMP_PALETTE.png" -filter_complex paletteuse -f gif "square_${2}.gif"

echo "Generated square_${2}.gif"