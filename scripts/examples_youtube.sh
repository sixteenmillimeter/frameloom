#!/bin/sh

#This example script requires that you have youtube-dl installed 

echo "Downloading example videos using youtube-dl..."

mkdir -p examples

#11 second videos
if [ ! -f ./examples/Y1.mp4 ]; then
	(cd examples && youtube-dl --verbose --format 'bestvideo+bestaudio/best' --audio-format best https://www.youtube.com/watch?v=u2DYOsrJrDQ)
	(mv "./examples/Stars Through the Trees-u2DYOsrJrDQ.mp4" "./examples/Y1.mp4")
else 
	echo "Y1.mp4 already exists"
fi
if [ ! -f ./examples/Y2.mp4 ]; then
	(cd examples && youtube-dl --verbose --format 'bestvideo+bestaudio/best' --audio-format best https://www.youtube.com/watch?v=lJfSTZjm5wQ)
	mv "./examples/Fireworks on 4th of July-lJfSTZjm5wQ.mp4" "./examples/Y2.mp4"
else 
	echo "Y2.mp4 already exists"
fi
if [ ! -f ./examples/Y3.mp4 ]; then
	(cd examples && youtube-dl --verbose --format 'bestvideo+bestaudio/best' --audio-format best https://www.youtube.com/watch?v=HHdfpIoSAfs)
	mv "./examples/Free Nature Stock Footage - Birds Reflected in Water-HHdfpIoSAfs.mp4" "./examples/Y3.mp4"
else 
	echo "Y3.mp4 already exists"
fi

./frameloom -i "./examples/Y1.mp4:./examples/Y2.mp4:./examples/Y3.mp4" -o "./examples/Y1Y2Y3.mov"

#19
#https://www.youtube.com/watch?v=cRjf8pxWApE
#16
#https://www.youtube.com/watch?v=xAp-zovVL9s
#21
#https://www.youtube.com/watch?v=T-esjZFXaYA
#https://www.youtube.com/watch?v=tZZjY-UZPaI

