variable "places" {
  type = map(object({
    id                = string
    name              = string
    displayName       = string
    lat               = string
    lon               = string
    stream_url        = string
    sunset_time_h_utc = number
    sunset_time_m_utc = number
  }))
}

variable "recorder_image_version" {
  type    = string
  default = "latest"
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
