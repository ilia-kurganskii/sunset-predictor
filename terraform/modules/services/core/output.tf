output "bucket_records_name" {
  value       = aws_s3_bucket.records.bucket
  description = "The name of bucket with records"
}

output "bucket_records_arn" {
  value       = aws_s3_bucket.records.arn
  description = "The name of bucket with records"
}

output "dynamodb_table_records_name" {
  value = aws_dynamodb_table.records.name
}
