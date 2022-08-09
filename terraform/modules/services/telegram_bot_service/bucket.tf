
resource "aws_s3_bucket" "telegram_bot_lambda_function" {
  bucket = "${var.env}-telegram-bot-lambda-function"

  tags = {
    Name        = "LambdaFunction"
    Environment = var.env
  }
}

