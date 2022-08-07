resource "aws_s3_bucket" "records" {
  bucket = "sunset-records"

  tags = {
    Name = "SunsetRecords"
  }
}
