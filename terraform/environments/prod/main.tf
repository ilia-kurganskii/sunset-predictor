locals {
  env        = "production"
  aws_region = "eu-west-3"
}

module "core" {
  source = "../../modules/services/core"
  env    = local.env
}

module "cluster" {
  source     = "../../modules/services/cluster"
  env        = local.env
  aws_region = local.aws_region
}

module "record_service" {
  source                      = "../../modules/services/record_service"
  env                         = local.env
  bucket_records_name         = module.core.bucket_records_name
  cluster_arn                 = module.cluster.cluster_arn
  docker_repository_url       = module.cluster.cluster_arn
  dynamodb_table_records_name = module.core.dynamodb_table_records_name
  lambda_function_name        = module.telegram_bot.lambda_function_name
  open_weather_token          = var.open_weather_token
  places                      = var.places
  aws_region                  = local.aws_region
}

module "telegram_bot" {
  source              = "../../modules/services/telegram_bot_service"
  bucket_records_name = module.core.bucket_records_name
  env                 = local.env
  open_weather_token  = var.open_weather_token
  telegram_chat_id    = var.telegram_chat_id
  telegram_token      = var.telegram_token
}
