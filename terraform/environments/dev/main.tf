locals {
  env        = "develop"
  aws_region = "us-east-1"
}

module "aws_infra" {
  source              = "../../modules/services/aws"
  instance_type       = "t3.nano"
  instance_ami        = "ami-040d909ea4e56f8f3"
  instance_spot_price = "0.0017"
  asg_max_size        = 2
  force_destroy       = true
  aws_region          = local.aws_region
  env                 = local.env
  open_weather_token  = var.open_weather_token
  telegram_chat_id    = var.telegram_chat_id
  telegram_token      = var.telegram_token
}
