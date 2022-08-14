resource "aws_iam_role" "backup" {
  name = "${var.env}_backup_role"
  assume_role_policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Action" : ["sts:AssumeRole"],
          "Effect" : "allow",
          "Principal" : {
            "Service" : ["backup.amazonaws.com"]
          }
        }
      ]
    }
  )
}

resource "aws_iam_role_policy_attachment" "example" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
  role       = aws_iam_role.backup.name
}

