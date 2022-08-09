output "cluster_arn" {
  value       = aws_ecs_cluster.ecs_cluster.arn
  description = "The name of the Auto Scaling Group"
}

output "repository_url" {
  value = aws_ecr_repository.sunset_recorder.repository_url
}
