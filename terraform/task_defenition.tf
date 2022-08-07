resource "aws_ecs_task_definition" "task_definition" {
  family = "sunset_recorder"
  container_definitions = templatefile("task-definitions/video_record_service.tftpl", {
    repository_url   = aws_ecr_repository.sunset_recorder.repository_url,
    image_version    = "3",
    input_stream_url = "https://59f185ece6219.streamlock.net/live/_definst_/sys2.stream/playlist.m3u8",
    bucket           = aws_s3_bucket.records.bucket
  })
}
