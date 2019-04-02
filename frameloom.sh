#!/bin/sh 

# Simple shell script version of frameloom 
# Only creates a 1:1 pattern between 2 videos 

# Usage : sh frameloom.sh examples/A.mp4 examples/B.mp4 examples/OUTPUT.mp4

TMPDIR=/tmp/frameloom/
i=0

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ] ;
  then
    echo "Not enough arguments supplied"
fi

mkdir -p $TMPDIR

#relies on the alphanumeric sorting that occurs when getting
#the list of files in the for loop below
ffmpeg -i "$1" -compression_algo raw -pix_fmt rgb24 "${TMPDIR}export-%05d_a.tif"
ffmpeg -i "$2" -compression_algo raw -pix_fmt rgb24 "${TMPDIR}export-%05d_b.tif"

#rm -r $TMP

for filename in ${TMPDIR}*.tif; do
	value=`printf %05d $i`
	#echo $filename
	#echo "${TMPDIR}render_${value}.tif"
	mv "$filename" "${TMPDIR}render_${value}.tif"
    i=`expr $i + 1`
done

ffmpeg -r 30 -f image2 -s 1920x1080 -i "${TMPDIR}render_%05d.tif" -c:v prores_ks -profile:v 3 -y "$3"

rm -r $TMPDIR