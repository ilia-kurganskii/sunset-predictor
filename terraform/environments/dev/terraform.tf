terraform {
  cloud {
    organization = "zmeiko"

    workspaces {
      name = "development-sunset-predictor"
    }
  }
}

provider "aws" {
  region = local.aws_region
}
