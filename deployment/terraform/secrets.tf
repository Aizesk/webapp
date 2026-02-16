# ===========================================
# SSM PARAMETER STORE (Secrets)
# ===========================================
# Secrets stored in SSM and injected into ECS task definitions
# Standard parameters are FREE (no cost)
# Using "String" type because Learner Lab doesn't allow SecureString (requires custom KMS key)

resource "aws_ssm_parameter" "db_username" {
  name  = "/${var.project_name}/database/username"
  type  = "String"
  value = var.db_username

  tags = {
    Name = "${var.project_name}-db-username"
  }
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.project_name}/database/password"
  type  = "String"
  value = var.db_password

  tags = {
    Name = "${var.project_name}-db-password"
  }
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.project_name}/auth/jwt-secret"
  type  = "String"
  value = var.jwt_secret

  tags = {
    Name = "${var.project_name}-jwt-secret"
  }
}

resource "aws_ssm_parameter" "stripe_api_key" {
  name  = "/${var.project_name}/stripe/api-key"
  type  = "String"
  value = var.stripe_api_key

  tags = {
    Name = "${var.project_name}-stripe-api-key"
  }
}

resource "aws_ssm_parameter" "stripe_webhook_secret" {
  name  = "/${var.project_name}/stripe/webhook-secret"
  type  = "String"
  value = var.stripe_webhook_secret

  tags = {
    Name = "${var.project_name}-stripe-webhook-secret"
  }
}

resource "aws_ssm_parameter" "shopify_client_id" {
  name  = "/${var.project_name}/shopify/client-id"
  type  = "String"
  value = var.shopify_client_id

  tags = {
    Name = "${var.project_name}-shopify-client-id"
  }
}

resource "aws_ssm_parameter" "shopify_client_secret" {
  name  = "/${var.project_name}/shopify/client-secret"
  type  = "String"
  value = var.shopify_client_secret

  tags = {
    Name = "${var.project_name}-shopify-client-secret"
  }
}
