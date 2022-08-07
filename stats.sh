while true ; do memory=`ps aux | grep ffmpeg | grep -v grep | awk '{print $6}'` ; echo "ffmpeg memory: $memory"; sleep 1 ; done
