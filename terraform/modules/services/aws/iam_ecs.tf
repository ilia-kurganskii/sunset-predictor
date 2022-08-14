resource "aws_iam_role" "ecs_execution" {
  name = "${var.env}_ecs_execution"
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : "sts:AssumeRole",
        "Principal" : {
          "Service" : "ecs-tasks.amazonaws.com"
        },
        "Effect" : "Allow",
        "Sid" : ""
      }
    ]
  })
}

resource "aws_iam_role_policy" "ecs_execution_policy" {
  name = "${var.env}_ecs_execution"
  role = aws_iam_role.ecs_execution.id
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "ec2:DescribeTags",
          "ecs:CreateCluster",
          "ecs:DeregisterContainerInstance",
          "ecs:DiscoverPollEndpoint",
          "ecs:Poll",
          "ecs:RegisterContainerInstance",
          "ecs:StartTelemetrySession",
          "ecs:UpdateContainerInstancesState",
          "ecs:Submit*",
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "logs:CreateLogStream",
          "logs:CreateLogGroup",
          "logs:PutLogEvents"
        ],
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_role" "ecs_task" {
  name = "${var.env}_ecs_task"
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : "sts:AssumeRole",
        "Principal" : {
          "Service" : "ecs-tasks.amazonaws.com"
        },
        "Effect" : "Allow",
        "Sid" : ""
      }
    ]
  })
}

resource "aws_iam_role_policy" "task_role_policy" {
  name = "${var.env}_ecs_agent"
  role = aws_iam_role.ecs_task.id
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "ecs:RunTask"
        ],
        "Resource" : [
          aws_ecs_cluster.ecs_cluster.arn
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "dynamodb:*"
        ],
        "Resource" : [
          aws_dynamodb_table.records.arn,
          aws_dynamodb_table.predictions.arn,
          aws_dynamodb_table.records.arn,
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:*"
        ],
        "Resource" : [
          "${aws_s3_bucket.records.arn}/*"
        ]
        }, {
        "Effect" : "Allow",
        "Action" : [
          "lambda:*"
        ],
        "Resource" : [
          aws_lambda_function.telegram_bot.arn
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
