terraform {
  cloud {
    organization = "zmeiko"

    workspaces {
      name = "sunset-predictor-workspace"
    }
  }
}

provider "aws" {
  region = "eu-west-3"
}
