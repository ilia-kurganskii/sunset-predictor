resource "aws_backup_vault" "dynamodb_backup" {
  name = "${var.env}_backup_vault"
}

resource "aws_backup_plan" "dynamodb_backup" {
  name = "${var.env}_dynamodb_backup_plan"

  rule {
    rule_name         = "${var.env}_backup_dynamodb_rule"
    target_vault_name = aws_backup_vault.dynamodb_backup.name
    schedule          = "cron(0 12 * * ? *)"

    lifecycle {
      delete_after = 7
    }
  }
}

resource "aws_backup_selection" "dynamo_db" {
  iam_role_arn = aws_iam_role.backup.arn
  name         = "${var.env}_backup_selection"
  plan_id      = aws_backup_plan.dynamodb_backup.id

  resources = [
    "${aws_dynamodb_table.records.arn}/*",
    "${aws_dynamodb_table.places.arn}/*"
  ]
}
