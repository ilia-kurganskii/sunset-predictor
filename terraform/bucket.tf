resource "aws_s3_bucket" "records" {
  bucket = "sunset-records"

  tags = {
    Name = "SunsetRecords"
  }
}

resource "aws_s3_bucket" "telegram_bot_lambda_function" {
  bucket = "telegram-bot-lambda-function"

  tags = {
    Name = "LambdaFunction"
  }
}

