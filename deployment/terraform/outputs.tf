# ===========================================
# OUTPUTS
# ===========================================
# Key information displayed after terraform apply

# ---- Access URLs ----
output "frontend_url" {
  description = "Frontend URL (S3 static website)"
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}

output "api_url" {
  description = "API URL (ALB HTTP endpoint)"
  value       = "http://${aws_lb.main.dns_name}"
}

# ---- Infrastructure Details ----
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "s3_frontend_bucket" {
  description = "S3 bucket for frontend assets"
  value       = aws_s3_bucket.frontend.bucket
}

output "s3_website_endpoint" {
  description = "S3 website endpoint"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "ecr_repository_urls" {
  description = "ECR repository URLs for each microservice"
  value       = { for k, v in aws_ecr_repository.services : k => v.repository_url }
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "google_client_id" {
  description = "Google OAuth client ID"
  value       = var.google_client_id
  sensitive   = true
}
