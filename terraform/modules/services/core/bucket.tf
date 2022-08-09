resource "aws_s3_bucket" "records" {
  bucket = "${var.env}-sunset-records"

  tags = {
    Name        = "SunsetRecords"
    Environment = var.env
  }
}
