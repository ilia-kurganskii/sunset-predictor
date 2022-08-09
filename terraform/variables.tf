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

variable "openweather_token" {
  type        = string
  description = "Open Weather Token"
}

variable "telegram_token" {
  type        = string
  description = "Telegram bot token"
}

variable "telegram_chat_id" {
  type        = string
  description = "Telegram chat id"
}
