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

  default = {
    name              = "hague"
    displayName       = "Den Haag"
    lat               = "52.117891"
    lon               = "4.279861"
    stream_url        = "https://59f185ece6219.streamlock.net/live/_definst_/sys2.stream/playlist.m3u8"
    sunset_time_h_utc = 21
    sunset_time_m_utc = 42
  }
}

variable "recorder_image_version" {
  type    = string
  default = "latest"
}

variable "openweather_token" {
  type        = string
  description = "Open Weather Token"
}
