data "aws_s3_object" "lambda_zip" {
  bucket = aws_s3_bucket.telegram_bot_lambda_function.bucket
  key    = "dist.zip"
}

resource "aws_lambda_function" "telegram_bot" {
  function_name = "TelegramBot"

  s3_bucket         = aws_s3_bucket.telegram_bot_lambda_function.id
  s3_key            = data.aws_s3_object.lambda_zip.key

  runtime = "nodejs16.x"
  handler = "main.handler"

  role = aws_iam_role.lambda_exec.arn

  environment {
    variables = {
      TELEGRAM_TOKEN     = var.telegram_token
      TELEGRAM_CHAT_ID   = var.telegram_chat_id
      AWS_RECORDS_BUCKET = aws_s3_bucket.records.bucket
    }
  }
}

resource "aws_cloudwatch_log_group" "telegram_bot" {
  name = "/aws/lambda/${aws_lambda_function.telegram_bot.function_name}"

  retention_in_days = 30
}

resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
