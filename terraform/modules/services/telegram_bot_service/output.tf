output "lambda_function_name" {
  value = aws_lambda_function.telegram_bot.function_name
}

output "s3_lambda_bucket" {
  value = aws_s3_bucket.telegram_bot_lambda_function.bucket
}

output "s3_lambda_bucket_key" {
  value = aws_lambda_function.telegram_bot.s3_key
}
