node_modules/.bin/tsc --target ES6 ./scratch.ts

make modal dragabble
pause/resume
adjust wpm
close btn
put js,css,html on gh-pages
write a bookmarklet that inserts script tag on page and loads js into it, which then builds the window
better monospace font
tone down colors
./node_modules/.bin/tsc --target ES6 ./src/reader.ts --outFile /dev/stdout | ./node_modules/.bin/terser --compress --
better solution for setting bar-guide width: hardcoding font-size style attr inline since the js runs before the css downloads otherwise. docker container run --publish 80:80 --publish 443:443 --add-host branweb1.github.io:127.0.0.1 --mount type=bind,source="${HOME}/Desktop/reader/dist",target=/data/site/reader/dist reader-nginx:latest