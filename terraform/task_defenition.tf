resource "aws_ecs_task_definition" "task_definition" {
  family                = "worker"
  container_definitions = file("task-definitions/bot_service.json")
}
