data "aws_s3_object" "lambda_zip" {
  bucket = aws_s3_bucket.telegram_bot_lambda_function.bucket
  key    = "dist.zip"
}

resource "aws_lambda_function" "telegram_bot" {
  function_name = "${var.env}_telegram_bot"

  s3_bucket = aws_s3_bucket.telegram_bot_lambda_function.id
  s3_key    = data.aws_s3_object.lambda_zip.key

  timeout = 15
  runtime = "nodejs16.x"
  handler = "dist/main.handler"

  role = aws_iam_role.lambda_exec.arn

  environment {
    variables = {
      TELEGRAM_TOKEN     = var.telegram_token
      TELEGRAM_CHAT_ID   = var.telegram_chat_id
      AWS_RECORDS_BUCKET = var.bucket_records_name
    }
  }
}

resource "aws_cloudwatch_log_group" "telegram_bot" {
  name = "/aws/lambda/${aws_lambda_function.telegram_bot.function_name}"

  retention_in_days = 30
}

resource "aws_lambda_function_url" "lambda_url" {
  function_name      = aws_lambda_function.telegram_bot.function_name
  authorization_type = "NONE"
}

