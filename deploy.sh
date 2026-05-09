#!/bin/sh

SERVER_PATH="/var/www/html"

eval "$(ssh-agent -s)"
echo "$SERVER_PATH"
git pull

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

if [ $? -eq 0 ]; then
	echo "rsync ok"
else
	echo "rsync err"
fi


