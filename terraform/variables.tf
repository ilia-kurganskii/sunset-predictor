variable "place" {
  type = object({
    name              = string
    displayName       = string
    lat               = string
    lon               = string
    stream_url        = string
    sunset_time_h_utc = number
    sunset_time_m_utc = number
  })
}

variable "recorder_image_version" {
  type = string
}

variable "openweather_token" {
  type = string
  description = "Open Weather Token"
}
