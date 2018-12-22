#!/bin/bash

declare -a arr=("frameloom" "Basic usage")

## now loop through the above array
for i in "${!arr[@]}"
do
   echo "Generating title $i"
   ffmpeg -f lavfi -i color=c=black:s=1920x1080:d=2.0 -r 24 -vf \
	"drawtext=fontfile=/path/to/font.ttf:fontsize=62: \
	 fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:text='$arr'" \
	 -y -c:v prores_ks -profile:v 3 \
	examples/title_$i.mov
done

