# ===========================================
# OUTPUTS
# ===========================================
# Key information displayed after terraform apply

# ---- Access URLs ----
output "frontend_url" {
  description = "Frontend URL (CloudFront default domain)"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
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

output "cloudfront_distribution_domain" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = aws_cloudfront_distribution.frontend.id
}

output "s3_frontend_bucket" {
  description = "S3 bucket for frontend assets"
  value       = aws_s3_bucket.frontend.bucket
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
