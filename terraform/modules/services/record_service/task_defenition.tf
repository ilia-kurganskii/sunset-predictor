resource "aws_ecs_task_definition" "task_definition" {
  for_each = var.places
  family   = "${each.key}_sunset_recorder"
  container_definitions = templatefile("${path.module}/files/video_record_service.tftpl", {
    repository_url     = var.docker_repository_url,
    image_version      = var.recorder_image_version,
    input_stream_url   = each.value.stream_url,
    latitude           = each.value.lat,
    longitude          = each.value.lon,
    place_id           = each.key,
    openweather_token  = var.open_weather_token,
    records_table_name = var.dynamodb_table_records_name,
    bucket             = var.bucket_records_name,
    lambda_name        = var.lambda_function_name,
    aws_region         = var.aws_region,
    eventRuleName      = aws_cloudwatch_event_rule.capture_sunset[each.key].name
  })
}
