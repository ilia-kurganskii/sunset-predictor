resource "aws_ecr_repository" "sunset_recorder" {
  name = "sunset_recorder"
}

resource "aws_ecr_lifecycle_policy" "foopolicy" {
  repository = aws_ecr_repository.sunset_recorder.name

  policy = jsondecode(
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
