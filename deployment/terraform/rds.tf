# ===========================================
# RDS MySQL - Free Tier (db.t4g.micro)
# ===========================================
# Single-AZ to minimize costs

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db"

  # Free Tier eligible
  engine               = "mysql"
  engine_version       = "8.0"
  instance_class       = "db.t4g.micro"
  allocated_storage    = 20
  max_allocated_storage = 20   # No autoscaling to control costs
  storage_type         = "gp3"

  # Database config
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = 3306

  # Networking
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # Single-AZ (Free Tier, budget-optimized)
  multi_az = false

  # Character set (match docker-compose)
  parameter_group_name = aws_db_parameter_group.main.name

  # Backup config
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  # Skip final snapshot for dev/demo (set to false for real production)
  skip_final_snapshot       = true
  final_snapshot_identifier = "${var.project_name}-final-snapshot"
  delete_automated_backups  = true

  # Performance Insights (free for db.t4g.micro)
  performance_insights_enabled = true

  tags = {
    Name = "${var.project_name}-rds"
  }
}

resource "aws_db_parameter_group" "main" {
  name   = "${var.project_name}-mysql-params"
  family = "mysql8.0"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  parameter {
    name  = "default_authentication_plugin"
    value = "mysql_native_password"
    apply_method = "pending-reboot"
  }

  tags = {
    Name = "${var.project_name}-mysql-params"
  }
}
