variable "aws_region" {
  type = string
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "instance_spot_price" {
  type    = string
  default = null
}

variable "instance_ami" {
  type    = string
  default = "ami-0f51be0cf2e87b06c"
}

variable "asg_min_size" {
  type    = number
  default = 1
}

variable "asg_max_size" {
  type    = number
  default = 1
}

variable "env" {
  type        = string
  description = "Environment"
}

variable "telegram_token" {
  type = string
}

variable "telegram_chat_id" {
  type = string
}

variable "open_weather_token" {
  type = string
}

variable "app_timelapse_factor" {
  type = string
}


variable "force_destroy" {
  type    = bool
  default = null
}
