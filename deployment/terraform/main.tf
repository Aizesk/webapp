# ===========================================
# AIZESK - TERRAFORM INFRASTRUCTURE
# ===========================================
# Budget-optimized AWS deployment (~$29-32/month)
# Architecture: ECS Fargate + RDS Free Tier + S3/CloudFront

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state in S3 (create bucket manually first)
  # backend "s3" {
  #   bucket         = "aizesk-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "eu-west-1"
  #   encrypt        = true
  #   dynamodb_table = "aizesk-terraform-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "aizesk"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# CloudFront requires ACM certificates in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "aizesk"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
