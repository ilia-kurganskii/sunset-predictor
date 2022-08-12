LAMBDA_NAME=$1
aws lambda invoke --function-name $LAMBDA_NAME \
  --payload '{
               "id": "hague-beach",
               "type": "add_place",
               "name": "Hague",
               "lat": "52.117891",
               "lon": "4.279861",
               "stream_url": "https://59f185ece6219.streamlock.net/live/_definst_/sys2.stream/playlist.m3u8"
             }'

aws lambda invoke --function-name $LAMBDA_NAME \
  --payload '{
               "id": "hague-noordwijk",
               "type": "add_place",
               "name": "Coast Surf Club Noordwijk",
               "lat": "52.235504",
               "lon": "4.420697",
               "stream_url": "https://s86.ipcamlive.com/streams/56urtcbjlbughc0gs/stream.m3u8"
             }'

aws lambda invoke --function-name $LAMBDA_NAME \
  --payload '{
               "id": "hague-zeilvereniging",
               "type": "add_place",
               "name": "Zeilvereniging Noordwijk",
               "lat": "52.2438376",
               "lon": "4.4241582",
               "stream_url": "http://webcam.zvnoordwijk.nl:82/mjpg/video.mjpg"
             }'

aws lambda invoke --function-name $LAMBDA_NAME \
  --payload '{
               "id": "harlem-bloemendaal",
               "type": "add_place",
               "name": "Bloemendaal aan Zee",
               "lat": "52.3990412",
               "lon": "4.3863241",
               "stream_url": "https://wowza01.crossmediaventures.com/beachcam/beachcam.smil/playlist.m3u8"
             }'

aws lambda invoke --function-name $LAMBDA_NAME \
  --payload '{
               "id": "ndl-paal-17",
               "type": "add_place",
               "name": "Paal 17",
               "lat": "52.8437104",
               "lon": "4.795708",
               "stream_url": "https://565c3c746b763.streamlock.net/hls/paal17b.stream/chunklist_w1122015977_tkd293emF0b2tlbmVuZHRpbWU9MTY2MDI5OTA5NSZ3b3d6YXRva2VuaGFzaD1lUVVXc1lGYnhReWNzdmstaTVnVVFmdDlNV0E3LVhCTTJyS1VTdElEVFVrPSZ3b3d6YXRva2Vuc3RhcnR0aW1lPTE2NjAyOTcyMzU=.m3u8"
             }'
