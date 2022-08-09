resource "tls_private_key" "sunset_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "generated_key" {
  key_name   = "${var.env}_ssh-key"
  public_key = tls_private_key.sunset_key.public_key_openssh
}
