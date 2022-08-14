resource "aws_dynamodb_table" "records" {
  billing_mode = "PAY_PER_REQUEST"
  name         = "${var.env}_records"
  attribute {
    name = "pollId"
    type = "S"
  }
  hash_key = "pollId"
}

resource "aws_dynamodb_table" "places" {
  billing_mode = "PAY_PER_REQUEST"
  name         = "${var.env}_places"
  attribute {
    name = "id"
    type = "S"
  }
  hash_key = "id"
}

resource "aws_dynamodb_table" "predictions" {
  billing_mode = "PAY_PER_REQUEST"
  name         = "${var.env}_predictions"
  attribute {
    name = "predictionId"
    type = "S"
  }
  hash_key = "predictionId"
}
