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
      APP_TIMELAPSE_FACTOR              = var.app_timelapse_factor
      TELEGRAM_TOKEN                    = var.telegram_token
      TELEGRAM_CHAT_ID                  = var.telegram_chat_id
      OPEN_WEATHER_TOKEN                = var.open_weather_token
      AWS_BUCKET_RECORDS                = aws_s3_bucket.records.bucket
      AWS_CLUSTER_ARN                   = aws_ecs_cluster.ecs_cluster.arn
      AWS_DYNAMO_DB_PLACE_TABLE_NAME    = aws_dynamodb_table.places.name
      AWS_DYNAMO_DB_RECORDS_TABLE_NAME  = aws_dynamodb_table.records.name
      AWS_REPOSITORY_RECORDER_URL       = aws_ecr_repository.sunset_recorder.repository_url
      AWS_LAMBDA_TELEGRAM_BOT_FUNC_NAME = "${var.env}_telegram_bot"
      AWS_EVENT_EXECUTION_ROLE_ARN      = aws_iam_role.event_execution.arn
      AWS_ECS_EXECUTION_ROLE_ARN        = aws_iam_role.ecs_execution.arn
      AWS_ECS_TASK_ROLE_ARN             = aws_iam_role.ecs_task.arn
      AWS_SECURITY_GROUP_ARN            = aws_security_group.ecs_sg.id,
      AWS_SUBNET_ARN                    = aws_subnet.pub_subnet.id,
      NO_COLOR                          = true
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

