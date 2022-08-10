data "aws_s3_object" "lambda_zip" {
  bucket = aws_s3_bucket.telegram_bot_lambda_function.bucket
  key    = "dist.zip"
}

resource "aws_lambda_function" "telegram_bot" {
  function_name = "${var.env}_telegram_bot"

  s3_bucket = aws_s3_bucket.telegram_bot_lambda_function.id
  s3_key    = data.aws_s3_object.lambda_zip.key

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

resource "aws_iam_role" "lambda_exec" {
  name = "${var.env}_serverless_lambda"

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

resource "aws_iam_policy" "lambda_access_resources_policy" {
  name = "${var.env}_lambda_policy"
  path = "/"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
        ]
        Effect   = "Allow"
        Resource = [var.bucket_records_arn, "${var.bucket_records_arn}/*"]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_access_resources_policy.arn
}
