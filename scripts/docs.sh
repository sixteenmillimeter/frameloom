#!/bin/sh

echo "Generating documentation for frameloom source"
#This is a little dumb
cp ./frameloom ./docs/frameloom.js
./node_modules/.bin/jsdoc2md ./docs/frameloom.js > ./docs/README.md
rm ./docs/frameloom.js