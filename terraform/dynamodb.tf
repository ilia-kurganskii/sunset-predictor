resource "aws_dynamodb_table" "records" {
  billing_mode = "PAY_PER_REQUEST"
  name         = "records"
  attribute {
    name = "recordId"
    type = "S"
  }
  hash_key = "recordId"
}

resource "aws_dynamodb_table" "polls" {
  billing_mode = "PAY_PER_REQUEST"
  name         = "polls"
  attribute {
    name = "pollId"
    type = "S"
  }
  hash_key = "pollId"
}

resource "aws_dynamodb_table" "predictions" {
  billing_mode = "PAY_PER_REQUEST"
  name         = "predictions"
  attribute {
    name = "predictionId"
    type = "S"
  }
  hash_key = "predictionId"
}
