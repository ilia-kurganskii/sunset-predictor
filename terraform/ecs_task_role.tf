resource "aws_iam_role" "scheduled_task_cloudwatch" {
  name               = "scheduled_task_cloudwatch"
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : "sts:AssumeRole",
        "Principal" : {
          "Service" : "events.amazonaws.com"
        },
        "Effect" : "Allow",
        "Sid" : ""
      }
    ]
  })
}

resource "aws_iam_role_policy" "scheduled_task_cloudwatch_policy" {
  name   = "scheduled_task_cloudwatch_policy"
  role   = aws_iam_role.scheduled_task_cloudwatch.id
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "ecs:RunTask"
        ],
        "Resource" : [
          "*"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : "iam:PassRole",
        "Resource" : [
          "*"
        ]
      }
    ]
  })
}

