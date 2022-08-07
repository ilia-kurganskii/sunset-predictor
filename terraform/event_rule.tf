resource "aws_cloudwatch_event_rule" "capture_sunset" {
  name                = "capture-the-sunset"
  description         = "Capture sunset in ${var.place.displayName}"
  schedule_expression = "cron(${var.place.sunset_time_m_utc} ${var.place.sunset_time_h_utc} * * ? *)"
  lifecycle {
    ignore_changes = [schedule_expression]
  }
}

resource "aws_cloudwatch_event_target" "ecs_task" {
  target_id = "capture_sunset_ecs_task"
  arn       = aws_ecs_cluster.ecs_cluster.arn
  rule      = aws_cloudwatch_event_rule.capture_sunset.name
  role_arn  = aws_iam_role.scheduled_task_cloudwatch.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.task_definition.arn
  }

}
