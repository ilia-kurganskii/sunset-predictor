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
