resource "aws_subnet" "pub_subnet" {
  vpc_id            = aws_vpc.vpc.id
  cidr_block        = "10.0.0.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name        = "Public Subnet"
    Environment = var.env
  }


}
