# ===========================================
# VARIABLES
# ===========================================

# ---- General ----
variable "aws_account_id" {
  description = "AWS Account ID (from Learner Lab: AWS Details > Account ID)"
  type        = string
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "aizesk"
}

# ---- Networking ----
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones (must match aws_region)"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# ---- Database ----
variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "aizesk"
  sensitive   = true
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "RDS database name"
  type        = string
  default     = "aizesk"
}

# ---- ECS/Fargate ----
variable "service_cpu" {
  description = "CPU units for each Fargate task (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "service_memory" {
  description = "Memory in MB for each Fargate task"
  type        = number
  default     = 512
}

# ---- Secrets (passed via terraform.tfvars or env vars) ----
variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

variable "stripe_api_key" {
  description = "Stripe API key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "stripe_price_professional_monthly" {
  description = "Stripe Price ID for Professional Monthly plan"
  type        = string
  default     = ""
}

variable "stripe_price_professional_annual" {
  description = "Stripe Price ID for Professional Annual plan"
  type        = string
  default     = ""
}

variable "stripe_price_enterprise_monthly" {
  description = "Stripe Price ID for Enterprise Monthly plan"
  type        = string
  default     = ""
}

variable "stripe_price_enterprise_annual" {
  description = "Stripe Price ID for Enterprise Annual plan"
  type        = string
  default     = ""
}

variable "shopify_client_id" {
  description = "Shopify OAuth client ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "shopify_client_secret" {
  description = "Shopify OAuth client secret"
  type        = string
  sensitive   = true
  default     = ""
}

# ---- Microservices Configuration ----
variable "microservices" {
  description = "Map of microservices with their configurations"
  type = map(object({
    port         = number
    health_path  = string
    path_pattern = list(string)
    priority     = number
  }))
  default = {
    auth-service = {
      port         = 8081
      health_path  = "/actuator/health"
      path_pattern = ["/api/v1/auth/*"]
      priority     = 100
    }
    user-service = {
      port         = 8082
      health_path  = "/actuator/health"
      path_pattern = ["/api/v1/users/*"]
      priority     = 200
    }
    transaction-service = {
      port         = 8083
      health_path  = "/actuator/health"
      path_pattern = ["/api/v1/transactions/*"]
      priority     = 300
    }
    subscription-service = {
      port         = 8084
      health_path  = "/actuator/health"
      path_pattern = ["/api/v1/subscriptions/*"]
      priority     = 400
    }
    platform-connection-service = {
      port         = 8085
      health_path  = "/actuator/health"
      path_pattern = ["/api/v1/platforms/*"]
      priority     = 500
    }
    notification-service = {
      port         = 8086
      health_path  = "/actuator/health"
      path_pattern = ["/api/v1/notifications/*", "/ws/*"]
      priority     = 600
    }
    reporting-service = {
      port         = 8087
      health_path  = "/actuator/health"
      path_pattern = ["/api/v1/reports/*"]
      priority     = 700
    }
  }
}
