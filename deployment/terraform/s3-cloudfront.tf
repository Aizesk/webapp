# ===========================================
# S3 (Frontend Hosting) — Learner Lab Compatible
# ===========================================
# Angular SPA served from S3 with static website hosting
# CloudFront OAC is NOT available in Learner Lab
# Using S3 static website hosting instead

# ---- S3 Bucket for Frontend ----
resource "aws_s3_bucket" "frontend" {
  bucket        = "${var.project_name}-frontend-${var.aws_account_id}"
  force_destroy = true

  tags = {
    Name = "${var.project_name}-frontend"
  }
}

# ---- S3 Static Website Hosting ----
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# ---- S3 Public Access (required for static website hosting) ----
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# ---- S3 Bucket Policy (public read for website) ----
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  depends_on = [aws_s3_bucket_public_access_block.frontend]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}
