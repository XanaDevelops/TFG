#!/bin/sh

SERVER_PATH="/var/www/html"

echo "$SERVER_PATH"

mkdir -p "$SERVER_PATH/img" "$SERVER_PATH/files" "$SERVER_PATH/fonts" "$SERVER_PATH/js" "$SERVER_PATH/snd"

cp -r img "$SERVER_PATH/"
cp -r files "$SERVER_PATH/"
cp -r fonts "$SERVER_PATH/"
cp -r js "$SERVER_PATH/"
cp -r snd "$SERVER_PATH/"
cp index.html "$SERVER_PATH/index.html"
