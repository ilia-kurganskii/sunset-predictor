output "ecr_repository_url" {
  value = aws_ecr_repository.sunset_recorder.repository_url
}

output "private_key" {
  value     = tls_private_key.sunset_key.private_key_pem
  sensitive = true
}

output "records_bitbucket" {
  value = aws_s3_bucket.records.bucket
}
