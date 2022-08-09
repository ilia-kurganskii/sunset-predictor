variable "env" {
  type        = string
  description = "Environment"
}

variable "aws_region" {
  type = string
}

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

variable "cluster_arn" {
  type        = string
  description = "Cluster ARN"
}

variable "dynamodb_table_records_name" {
  type = string
}

variable "bucket_records_name" {
  type = string
}

variable "lambda_function_name" {
  type = string
}

variable "docker_repository_url" {
  type = string
}
