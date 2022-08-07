#!/bin/bash
echo "Start record sunset"
ffmpeg \
  -i $INPUT_STREAM_URL \
  -t $DURATION \
  -c:v libvpx-vp9 \
  -crf 23 \
  -speed 3 \
  -pix_fmt yuv420p \
  -color_primaries 1 \
  -color_trc 1 \
  -colorspace 1 \
  -movflags +faststart \
  -filter:v "setpts=$TIMELAPSE_FACTOR*PTS" \
  -an \
  output.webm

echo "Copy video to bucket"
CURRENT_DATE=$(date +"%Y-%m-%d")
aws s3 cp ./output.webm s3://$BUCKET/$CURRENT_DATE/video.webm
