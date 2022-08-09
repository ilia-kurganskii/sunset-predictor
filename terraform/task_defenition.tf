resource "aws_ecs_task_definition" "task_definition" {
  for_each = var.places
  family   = "${each.key}_sunset_recorder"
  container_definitions = templatefile("task-definitions/video_record_service.tftpl", {
    repository_url     = aws_ecr_repository.sunset_recorder.repository_url,
    image_version      = var.recorder_image_version,
    input_stream_url   = each.value.stream_url,
    latitude           = each.value.lat,
    longitude          = each.value.lon,
    place_id           = each.key,
    openweather_token  = var.openweather_token,
    records_table_name = aws_dynamodb_table.records.name,
    bucket             = aws_s3_bucket.records.bucket
    eventRuleName      = aws_cloudwatch_event_rule.capture_sunset[each.key].name
  })
}
