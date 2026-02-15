# ===========================================
# SSM PARAMETER STORE (Secrets)
# ===========================================
# Standard parameters are FREE (no cost)

resource "aws_ssm_parameter" "db_username" {
  name  = "/${var.project_name}/database/username"
  type  = "SecureString"
  value = var.db_username

  tags = {
    Name = "${var.project_name}-db-username"
  }
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.project_name}/database/password"
  type  = "SecureString"
  value = var.db_password

  tags = {
    Name = "${var.project_name}-db-password"
  }
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.project_name}/auth/jwt-secret"
  type  = "SecureString"
  value = var.jwt_secret

  tags = {
    Name = "${var.project_name}-jwt-secret"
  }
}

resource "aws_ssm_parameter" "stripe_api_key" {
  name  = "/${var.project_name}/stripe/api-key"
  type  = "SecureString"
  value = var.stripe_api_key

  tags = {
    Name = "${var.project_name}-stripe-api-key"
  }
}

resource "aws_ssm_parameter" "stripe_webhook_secret" {
  name  = "/${var.project_name}/stripe/webhook-secret"
  type  = "SecureString"
  value = var.stripe_webhook_secret

  tags = {
    Name = "${var.project_name}-stripe-webhook-secret"
  }
}

resource "aws_ssm_parameter" "shopify_client_id" {
  name  = "/${var.project_name}/shopify/client-id"
  type  = "SecureString"
  value = var.shopify_client_id

  tags = {
    Name = "${var.project_name}-shopify-client-id"
  }
}

resource "aws_ssm_parameter" "shopify_client_secret" {
  name  = "/${var.project_name}/shopify/client-secret"
  type  = "SecureString"
  value = var.shopify_client_secret

  tags = {
    Name = "${var.project_name}-shopify-client-secret"
  }
}

# ===========================================
# SES (Simple Email Service) — FREE from ECS
# ===========================================
# 3,000 emails/month free when sent from EC2/ECS

resource "aws_ses_domain_identity" "main" {
  domain = var.domain_name
}

resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# Route 53 records for SES domain verification
resource "aws_route53_record" "ses_verification" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_amazonses.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = [aws_ses_domain_identity.main.verification_token]
}

# DKIM records for email authentication
resource "aws_route53_record" "ses_dkim" {
  count = 3

  zone_id = aws_route53_zone.main.zone_id
  name    = "${aws_ses_domain_dkim.main.dkim_tokens[count.index]}._domainkey"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_ses_domain_dkim.main.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

# SPF record for email deliverability
resource "aws_route53_record" "ses_spf" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com ~all"]
}

# MX record for receiving bounce notifications
resource "aws_route53_record" "ses_mail_from_mx" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "mail.${var.domain_name}"
  type    = "MX"
  ttl     = 600
  records = ["10 feedback-smtp.${var.aws_region}.amazonses.com"]
}

# MAIL FROM domain configuration
resource "aws_ses_domain_mail_from" "main" {
  domain           = aws_ses_domain_identity.main.domain
  mail_from_domain = "mail.${var.domain_name}"
}

# SPF record for MAIL FROM domain
resource "aws_route53_record" "ses_mail_from_spf" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "mail.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com ~all"]
}

# ===========================================
# SMTP CREDENTIALS for notification-service
# ===========================================
# notification-service uses JavaMailSender with SMTP

resource "aws_iam_user" "ses_smtp" {
  name = "${var.project_name}-ses-smtp"

  tags = {
    Name = "${var.project_name}-ses-smtp-user"
  }
}

resource "aws_iam_user_policy" "ses_smtp" {
  name = "${var.project_name}-ses-send"
  user = aws_iam_user.ses_smtp.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_access_key" "ses_smtp" {
  user = aws_iam_user.ses_smtp.name
}

# Store SMTP credentials in SSM
resource "aws_ssm_parameter" "ses_smtp_username" {
  name  = "/${var.project_name}/ses/smtp-username"
  type  = "SecureString"
  value = aws_iam_access_key.ses_smtp.id

  tags = {
    Name = "${var.project_name}-ses-smtp-username"
  }
}

resource "aws_ssm_parameter" "ses_smtp_password" {
  name  = "/${var.project_name}/ses/smtp-password"
  type  = "SecureString"
  value = aws_iam_access_key.ses_smtp.ses_smtp_password_v4

  tags = {
    Name = "${var.project_name}-ses-smtp-password"
  }
}
