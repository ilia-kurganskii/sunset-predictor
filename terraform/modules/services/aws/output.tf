output "cluster_arn" {
  value       = aws_ecs_cluster.ecs_cluster.arn
  description = "The name of the Auto Scaling Group"
}

output "repository_url" {
  value = aws_ecr_repository.sunset_recorder.repository_url
}

output "s3_lambda_bucket" {
  value = aws_lambda_function.telegram_bot.s3_bucket
}

output "s3_lambda_bucket_key" {
  value = aws_lambda_function.telegram_bot.s3_key
}

output "lambda_function_name" {
  value = aws_lambda_function.telegram_bot.function_name
}

output "lambda_function_url" {
  value = aws_lambda_function_url.lambda_url.function_url
}
