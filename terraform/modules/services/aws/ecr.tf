resource "aws_ecr_repository" "sunset_recorder" {
  name = "${var.env}-sunset_recorder"
}

resource "aws_ecr_lifecycle_policy" "remove_old_image" {
  repository = aws_ecr_repository.sunset_recorder.name

  policy = jsonencode(
    {
      "rules" : [
        {
          "rulePriority" : 1,
          "description" : "Expire images older than 2 days",
          "selection" : {
            "tagStatus" : "untagged",
            "countType" : "sinceImagePushed",
            "countUnit" : "days",
            "countNumber" : 2
          },
          "action" : {
            "type" : "expire"
          }
        }
      ]
    }
  )
}
