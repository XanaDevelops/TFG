#!/bin/sh

SERVER_PATH="/var/www/html"

echo "$SERVER_PATH"

mkdir -p "$SERVER_PATH/img" "$SERVER_PATH/files" "$SERVER_PATH/fonts" "$SERVER_PATH/js" "$SERVER_PATH/snd"

rsync -a --delete \
	--include='/img/***' \
	--include='/files/***' \
	--include='/fonts/***' \
	--include='/js/***' \
	--include='/snd/***' \
	--include='/index.html' \
	--exclude='*' \
	./ "$SERVER_PATH/"
