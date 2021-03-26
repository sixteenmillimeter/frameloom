# frameloom

Node script to generate flicker videos by interweaving frames from multiple videos

--------

## Requirements 

This script relies on `ffmpeg` to export and stitch video back together

Installation instructions for ffmpeg here: https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg

## Installation

```
git clone https://github.com/sixteenmillimeter/frameloom.git
cd frameloom
npm install 
chmod +x frameloom
```

## Basic Usage

```bash
./frameloom -i /path/to/video1:/path/to/video2 -o /path/to/output
```

## Options

Run `./frameloom -h` to display help screen.

```bash
Usage: frameloom [options]

Options:
  -V, --version            output the version number
  -i, --input [files]      Specify input videos with paths seperated by colon
  -o, --output [file]      Specify output path of video
  -p, --pattern [pattern]  Specify a pattern for the flicker 1:1 is standard
  -r, --realtime           Specify if videos should preserve realtime speed
  -t, --tmp [dir]          Specify tmp directory for exporting frames
  -a, --avconv             Specify avconv if preferred to ffmpeg
  -R, --random             Randomize frames. Ignores pattern if included
  -s, --spin               Randomly rotate frames before rendering
  -e, --exec               Command to execute on every frame. Specify {{i}} and {{o}} if the command requires
                           it, otherwise frame path will be appended to command
  -q, --quiet              Suppresses all log messages
  -h, --help               display help for command
```

## TODO

* Generate example videos automatically
* Publish example videos