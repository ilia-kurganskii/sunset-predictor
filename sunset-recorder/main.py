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
parser.add_argument('--input-url',
                    type=str,
                    dest='input_url',
                    help='input stream URL like http://example.com/video.m3u8',
                    **environ_or_required('INPUT_URL'))

parser.add_argument('--duration',
                    type=str,
                    dest='duration',
                    metavar='D',
                    help='duration of result video',
                    **environ_or_required('DURATION'))

parser.add_argument('--latitude',
                    type=str,
                    dest='latitude',
                    metavar='LAT',
                    help='latitude of location',
                    **environ_or_required('LATITUDE'))

parser.add_argument('--longitude',
                    type=str,
                    dest='longitude',
                    metavar='LNG',
                    help='longitude of location',
                    **environ_or_required('LONGITUDE'))

parser.add_argument('--aws-bucket',
                    type=str,
                    dest='aws_bucket',
                    metavar='BUCKET',
                    help='aws bucket name',
                    **environ_or_required('AWS_BUCKET'))

parser.add_argument('--table-name',
                    type=str,
                    dest='table_name',
                    metavar='TABLE',
                    help='AWS DynamoDB table name',
                    **environ_or_required('AWS_TABLE_NAME'))

parser.add_argument('--openweather-token',
                    type=str,
                    dest='weather_token',
                    metavar='TOKEN',
                    help='OpenWeather token',
                    **environ_or_required('OPENWEATHER_TOKEN'))

parser.add_argument('--aws-event-rule-name',
                    type=str,
                    dest='event_name',
                    metavar='AWS_EVENT_RULE_NAME',
                    help='AWS event name',
                    **environ_or_required('AWS_EVENT_RULE_NAME'))

parser.add_argument('--timelapse-factor',
                    type=str,
                    dest='timelapse_factor',
                    metavar='T',
                    help='timelapse factor. e.g 1 is default 0.5 or 1.5 ',
                    **environ_or_default('TIMELAPSE_FACTOR', '1'))

args = parser.parse_args()

# Save video stream to file

# QUALITY 1-perfect 50-bad
quality = 23

result = subprocess.run(["/usr/local/bin/ffmpeg", "-i", args.input_url,
                         "-t", args.duration,
                         "-c:v", "libvpx-vp9",
                         "-crf", "23",
                         "-speed", "3",
                         "-pix_fmt", "yuv420p",
                         "-color_primaries", "1",
                         "-color_trc", "1",
                         "-colorspace", "1",
                         "-movflags", "+faststart",
                         "-filter:v", f"setpts={args.timelapse_factor}*PTS",
                         "-an",
                         "output.webm"], check=True)

# Upload video to S3 bucket
s3 = boto3.resource('s3')

today_date_formatted = datetime.today().strftime('%Y-%m-%d')
video_file_key = f'{today_date_formatted}/v2/video.webm'
data = open('output.webm', 'rb')
s3.Bucket(args.aws_bucket).put_object(Key=video_file_key, Body=data)

# Get current weather
response = requests.get("https://api.openweathermap.org/data/3.0/onecall", params={
    "lat": args.latitude,
    "lon": args.longitude,
    "appid": args.weather_token,
    "units": "metric",
    "exclude": "daily, alerts"
})
jsonResponse = json.loads(response.text, parse_float=Decimal)
currentWeather = jsonResponse['current']
sunsetUTC = datetime.utcfromtimestamp(currentWeather['sunset']).timetuple()

def python_obj_to_dynamo_obj(python_obj: dict) -> dict:
    serializer = TypeSerializer()
    return {
        k: serializer.serialize(v)
        for k, v in python_obj.items()
    }


# Put new item to dynamodb
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(args.table_name)
table.put_item(
    Item={
        'recordId': today_date_formatted,
        'video_url': video_file_key,
        'sunset_weather': python_obj_to_dynamo_obj(currentWeather)
    }
)

# Schedule next event
eventBridgeClient = boto3.client('events')
eventBridgeClient.put_rule(
    Name=args.event_name,
    ScheduleExpression=f'cron({sunsetUTC.tm_min-13} {sunsetUTC.tm_hour} * * ? *)'
)
