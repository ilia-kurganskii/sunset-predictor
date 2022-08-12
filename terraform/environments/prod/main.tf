locals {
  env        = "production"
  aws_region = "eu-west-3"
}

module "aws_infra" {
  source             = "../../modules/services/aws"
  env                = local.env
  aws_region         = local.aws_region
  asg_max_size       = 3
  open_weather_token = var.open_weather_token
  telegram_chat_id   = var.telegram_chat_id
  telegram_token     = var.telegram_token
}

