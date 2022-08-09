output "ecr_repository_url" {
  value = module.cluster.repository_url
}

output "s3_lambda_bucket" {
  value = module.telegram_bot.s3_lambda_bucket
}

output "s3_lambda_bucket_key" {
  value = module.telegram_bot.s3_lambda_bucket_key
}

output "lambda_name" {
  value = module.telegram_bot.lambda_function_name
}
