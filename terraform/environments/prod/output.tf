output "ecr_repository_url" {
  value = module.aws_infra.repository_url
}

output "s3_lambda_bucket" {
  value = module.aws_infra.s3_lambda_bucket
}

output "s3_lambda_bucket_key" {
  value = module.aws_infra.s3_lambda_bucket_key
}

output "lambda_name" {
  value = module.aws_infra.lambda_function_name
}
