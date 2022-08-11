resource "aws_s3_bucket" "records" {
  bucket        = "${var.env}-sunset-records"
  force_destroy = var.force_destroy

  tags = {
    Name        = "SunsetRecords"
    Environment = var.env
  }
}


resource "aws_s3_bucket" "telegram_bot_lambda_function" {
  bucket        = "${var.env}-telegram-bot-lambda-function"
  force_destroy = var.force_destroy
  tags = {
    Name        = "LambdaFunction"
    Environment = var.env
  }
}
