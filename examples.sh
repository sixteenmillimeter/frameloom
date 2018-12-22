#!/bin/bash

echo "Downloading example videos from archive.org..."

mkdir examples

#Please run this script sparingly!!!
#examples come from https://archive.org/details/ElectricSheep

if [ ! -f ./examples/A.mp4 ]; then
	wget -O A.mp4 https://ia802701.us.archive.org/9/items/electricsheep-flock-244-20000-0/00244%3D20660%3D11095%3D11000_512kb.mp4
	mv A.mp4 ./examples/
fi
if [ ! -f ./examples/B.mp4 ]; then
	wget -O B.mp4 https://ia802603.us.archive.org/0/items/electricsheep-flock-244-72500-0/00244%3D73690%3D73529%3D73425.mp4
	mv B.mp4 ./examples/
fi
if [ ! -f ./examples/C.mp4 ]; then
	wget -O C.mp4 https://ia800300.us.archive.org/6/items/electricsheep-flock-244-72500-8/00244%3D73008%3D72588%3D72531.mp4
	mv C.mp4 ./examples/
fi
if [ ! -f ./examples/D.mp4 ]; then
	wget -O D.mp4 https://ia800306.us.archive.org/34/items/electricsheep-flock-244-72500-6/00244%3D73236%3D72551%3D72705.mp4
	mv D.mp4 ./examples/
fi
if [ ! -f ./examples/E.mp4 ]; then
	wget -O E.mp4 https://ia600501.us.archive.org/16/items/electricsheep-flock-244-82500-4/00244%3D82524%3D82019%3D82016.mp4
	mv E.mp4 ./examples/
fi

./frameloom -i "./examples/A.mp4:./examples/B.mp4" -o "./examples/AB.mov"
./frameloom -i "./examples/A.mp4:./examples/B.mp4" -o "./examples/AB_realtime.mov" --realtime
./frameloom -i "./examples/A.mp4:./examples/B.mp4:./examples/C.mp4:./examples/D.mp4" -o "./examples/ABCD.mov"
./frameloom -i "./examples/B.mp4:./examples/C.mp4" -o "./examples/BCE_random.mov" --random