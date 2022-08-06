output "ecr_repository_worker_endpoint" {
  value = aws_ecr_repository.worker.repository_url
}

output "private_key" {
  value     = tls_private_key.sunset_key.private_key_pem
  sensitive = true
}
