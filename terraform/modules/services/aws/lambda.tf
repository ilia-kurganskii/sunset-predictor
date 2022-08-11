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
      TELEGRAM_TOKEN                    = var.telegram_token
      TELEGRAM_CHAT_ID                  = var.telegram_chat_id
      AWS_BUCKET_RECORDS                = aws_s3_bucket.records.bucket
      AWS_CLUSTER_ARN                   = aws_ecs_cluster.ecs_cluster.arn
      AWS_DYNAMO_DB_PLACE_TABLE_NAME    = aws_dynamodb_table.places.name
      AWS_DYNAMO_DB_RECORDS_TABLE_NAME  = aws_dynamodb_table.records.name
      AWS_REPOSITORY_RECORDER_URL       = aws_ecr_repository.sunset_recorder.repository_url
      AWS_LAMBDA_TELEGRAM_BOT_FUNC_NAME = "${var.env}_telegram_bot"
      AWS_TASK_RECORDS_ROLE_ARN         = aws_iam_role.scheduled_task.arn
      AWS_EVENT_BRIDGE_ROLE_ARN         = aws_iam_role.scheduled_task.arn
      OPEN_WEATHER_TOKEN                = var.open_weather_token

    }
  }
}

resource "aws_cloudwatch_log_group" "telegram_bot" {
  name              = "/aws/lambda/${aws_lambda_function.telegram_bot.function_name}"
  retention_in_days = 30
}

resource "aws_lambda_function_url" "lambda_url" {
  function_name      = aws_lambda_function.telegram_bot.function_name
  authorization_type = "NONE"
}

