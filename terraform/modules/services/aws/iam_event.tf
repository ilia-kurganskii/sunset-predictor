resource "aws_iam_role" "event_execution" {
  name = "${var.env}_event_execution"
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

resource "aws_iam_role_policy" "event_execution" {
  name = "${var.env}_event_execution_policy"
  role = aws_iam_role.event_execution.id
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
        "Action" : [
          "iam:PassRole",
          "iam:ListInstanceProfiles",
          "iam:ListRoles"
        ],
        "Resource" : [
          "*"
        ]
      }
    ]
  })
}
