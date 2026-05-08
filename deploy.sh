#!/bin/sh

SERVER_PATH="/var/www/html"

echo "$SERVER_PATH"

mkdir -p "$SERVER_PATH/img" "$SERVER_PATH/files" "$SERVER_PATH/fonts" "$SERVER_PATH/js" "$SERVER_PATH/snd"

cp -r img "$SERVER_PATH/img"
cp -r files "$SERVER_PATH/files"
cp -r fonts "$SERVER_PATH/fonts"
cp -r js "$SERVER_PATH/js"
cp -r snd "$SERVER_PATH/snd"
cp index.html "$SERVER_PATH/index.html"
