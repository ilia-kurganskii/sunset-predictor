variable "env" {
  type        = string
  description = "Environment"
}

variable "open_weather_token" {
  type        = string
  description = "Open Weather Token"
  sensitive   = true
}

variable "telegram_token" {
  type        = string
  description = "Telegram bot token"
  sensitive   = true
}

variable "telegram_chat_id" {
  type        = string
  description = "Telegram chat id"
  sensitive   = true
}

variable "bucket_records_name" {
  type = string
}

variable "bucket_records_arn" {
  type = string
}

