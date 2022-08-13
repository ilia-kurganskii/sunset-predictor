LAMBDA_NAME=$1
aws lambda invoke --function-name $LAMBDA_NAME \
  --payload '{
               "id": "hague-beach",
               "type": "add_place",
               "name": "Hague",
               "start_offset": 23,
               "duration":30,
               "lat": "52.117891",
               "lon": "4.279861",
               "stream_url": "https://59f185ece6219.streamlock.net/live/_definst_/sys2.stream/playlist.m3u8"
             }'

aws lambda invoke --function-name $LAMBDA_NAME \
  --payload '{
               "id": "hague-zeilvereniging",
               "type": "add_place",
               "start_offset": 23,
               "duration":30,
               "name": "Zeilvereniging Noordwijk",
               "lat": "52.2438376",
               "lon": "4.4241582",
               "stream_url": "http://webcam.zvnoordwijk.nl:82/mjpg/video.mjpg"
             }'
