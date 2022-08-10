locals {
  env        = "develop"
  aws_region = "us-east-1"
}

module "core" {
  source = "../../modules/services/core"
  env    = local.env
}

module "cluster" {
  source              = "../../modules/services/cluster"
  instance_type       = "t3.nano"
  instance_ami        = "ami-040d909ea4e56f8f3"
  instance_spot_price = "0.0017"
  aws_region          = local.aws_region
  env                 = local.env
}

module "record_service" {
  source                      = "../../modules/services/record_service"
  aws_region                  = local.aws_region
  env                         = local.env
  bucket_records_name         = module.core.bucket_records_name
  cluster_arn                 = module.cluster.cluster_arn
  docker_repository_url       = module.cluster.repository_url
  dynamodb_table_records_name = module.core.dynamodb_table_records_name
  lambda_function_name        = module.telegram_bot.lambda_function_name
  open_weather_token          = var.open_weather_token
  places                      = var.places
}

module "telegram_bot" {
  source              = "../../modules/services/telegram_bot_service"
  bucket_records_name = module.core.bucket_records_name
  bucket_records_arn  = module.core.bucket_records_arn
  env                 = local.env
  open_weather_token  = var.open_weather_token
  telegram_chat_id    = var.telegram_chat_id
  telegram_token      = var.telegram_token
}
