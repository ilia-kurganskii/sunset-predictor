data "aws_iam_policy_document" "ecs_agent" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_agent" {
  name               = "${var.env}_ecs-agent"
  assume_role_policy = data.aws_iam_policy_document.ecs_agent.json
}

resource "aws_iam_role_policy_attachment" "AmazonEC2ContainerServiceforEC2Role" {
  role       = aws_iam_role.ecs_agent.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_role_policy" "ecs_agent_policy" {
  name = "${var.env}_ecs_agent"
  role = aws_iam_role.ecs_agent.id
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


resource "aws_iam_instance_profile" "ecs_agent" {
  name = "${var.env}_ecs-agent"
  role = aws_iam_role.ecs_agent.name
}
