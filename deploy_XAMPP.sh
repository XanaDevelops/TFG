#!/bin/sh

SERVER_PATH="/opt/lampp/htdocs/"

#eval "$(ssh-agent -s)"
#echo "$SERVER_PATH"
#git pull

sudo -S rsync -a --delete --mkpath \
	--include='/img/***' \
	--include='/files/***' \
	--include='/fonts/***' \
	--include='/js/***' \
	--include='/snd/***' \
	--include='/index.html' \
	--include='/backend.php' \
	--include='/scenes/***' \
	--include='/templates/***' \
	--exclude='*' \
	./ "$SERVER_PATH/"

if [ $? -eq 0 ]; then
	echo "rsync ok"
else
	echo "rsync err"
fi


