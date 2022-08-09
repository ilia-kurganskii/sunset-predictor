terraform {
  cloud {
    organization = "zmeiko"

    workspaces {
      name = "production-sunset-predictor"
    }
  }
}

provider "aws" {
  region = local.aws_region
}
