import argparse
import os
import subprocess
import boto3
import json
from datetime import datetime
import requests
from boto3.dynamodb.types import TypeSerializer
from decimal import Decimal


def environ_or_required(key):
    return (
        {'default': os.environ.get(key)} if os.environ.get(key) else {'required': True}
    )


def environ_or_default(key, default):
    return (
        {'default': os.environ.get(key) if os.environ.get(key) else default}
    )


parser = argparse.ArgumentParser(description='Record and deploy stream to S3 bucket')
parser.add_argument('--stream-url',
                    type=str,
                    dest='stream_url',
                    help='input stream URL like http://example.com/video.m3u8',
                    **environ_or_required('STREAM_URL'))

parser.add_argument('--duration',
                    type=str,
                    dest='duration',
                    metavar='D',
                    help='duration of result video',
                    **environ_or_required('DURATION'))

parser.add_argument('--place-id',
                    type=str,
                    dest='place_id',
                    metavar='ID',
                    help='place id',
                    **environ_or_required('PLACE_ID'))

parser.add_argument('--aws-bucket',
                    type=str,
                    dest='aws_bucket',
                    metavar='BUCKET',
                    help='aws bucket name',
                    **environ_or_required('AWS_BUCKET'))

parser.add_argument('--aws-lambda-bot-function-name',
                    type=str,
                    dest='lambda_name',
                    metavar='NAME',
                    help='AWS lambda name (Telegram bot)',
                    **environ_or_required('AWS_LAMBDA_NAME'))

parser.add_argument('--timelapse-factor',
                    type=str,
                    dest='timelapse_factor',
                    metavar='T',
                    help='timelapse factor. e.g 1 is default 0.5 or 1.5 ',
                    **environ_or_default('TIMELAPSE_FACTOR', '1'))

args = parser.parse_args()

# Save video stream to file
print("Start record stream...")
subprocess.run(["/usr/local/bin/ffmpeg",
                        "-i", args.stream_url,
                         "-t", args.duration,
                         "-vcodec", "libx265", # CODEC
                         "-crf", "23", # QUALITY
                         "-filter:v", f"setpts={args.timelapse_factor}*PTS", # TIMELAPSE
                         "-an", # ONLY VIDEO
                         "-hide_banner",
                         "-loglevel", "warning",
                         "recorded_stream.mp4"], check=True)

print("Add silence to video...")
# Add silence to video to prevent converting to GIF (Telegram convert video without sound to GIF)
subprocess.run(["/usr/local/bin/ffmpeg",
                         "-i","recorded_stream.mp4",
                         "-f", "lavfi",
                         "-i", "anullsrc",
                         "-c:v", "copy",
                         "-c:a", "aac",
                         "-shortest",
                         "-hide_banner",
                         "-loglevel", "warning",
                         "output.mp4"], check=True)

# Upload video to S3 bucket
print("Upload video to S3...")
s3 = boto3.resource('s3')

video_file_key = f'videos/video_{datetime.timestamp(datetime.now())}.mp4'
data = open('output.mp4', 'rb')
s3.Bucket(args.aws_bucket).put_object(Key=video_file_key, Body=data)

print("Invoke lambda function ...")

lambdaClient = boto3.client('lambda')
lambdaClient.invoke(
    FunctionName=args.lambda_name,
    InvocationType='Event',
    Payload=json.dumps({ "type" : "video_recorded", "file" : video_file_key, "place_id": args.place_id}),
)

print("Finish all tasks")
