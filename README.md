# frameoloom

Node script to generate flicker videos by interweaving frames from multiple videos

--------

## Requirements 

This script relies on `ffmpeg` to export and stitch video back together

Installation instructions for ffmpeg here: https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg

## Installation

git clone https://github.com/sixteenmillimeter/videoloom.git
cd videoloom
chmod +x videoloom
npm install 


## Usage

./videoloom -i /path/to/video1:/path/to/video2 -o /path/to/output
