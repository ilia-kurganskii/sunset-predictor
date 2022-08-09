resource "aws_cloudwatch_event_rule" "capture_sunset" {
  for_each            = var.places
  name                = "${each.key}_capture_sunset"
  description         = "Capture sunset in ${each.value.displayName}"
  schedule_expression = "cron(${each.value.sunset_time_m_utc} ${each.value.sunset_time_h_utc} * * ? *)"
  lifecycle {
    ignore_changes = [schedule_expression]
  }
}

resource "aws_cloudwatch_event_target" "ecs_task" {
  for_each  = var.places
  target_id = "${each.key}_capture_sunset_ecs_task"
  arn       = aws_ecs_cluster.ecs_cluster.arn
  rule      = aws_cloudwatch_event_rule.capture_sunset[each.key].name
  role_arn  = aws_iam_role.scheduled_task_cloudwatch.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.task_definition[each.key].arn
  }

}
