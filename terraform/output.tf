output "ecr_repository_url" {
  value = aws_ecr_repository.sunset_recorder.repository_url
}

output "s3_lambda_bucket" {
  value = aws_s3_bucket.telegram_bot_lambda_function.bucket
}

output "s3_lambda_bucket_key" {
  value = aws_lambda_function.telegram_bot.s3_key
}

output "s3_lambda_name" {
  value = aws_lambda_function.telegram_bot.function_name
}

output "private_key" {
  value     = tls_private_key.sunset_key.private_key_pem
  sensitive = true
}

output "records_bitbucket" {
  value = aws_s3_bucket.records.bucket
}
