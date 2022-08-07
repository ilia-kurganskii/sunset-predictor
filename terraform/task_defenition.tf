resource "aws_ecs_task_definition" "task_definition" {
  family = "sunset_recorder"
  container_definitions = templatefile("task-definitions/video_record_service.tftpl", {
    repository_url   = aws_ecr_repository.sunset_recorder.repository_url,
    image_version    = var.recorder_image_version,
    input_stream_url = var.place.stream_url,
    bucket           = aws_s3_bucket.records.bucket
  })
}
