# ===========================================
# ECS CLUSTER + FARGATE SERVICES
# ===========================================
# 7 microservices on ECS Fargate with minimal resources
# Adapted for AWS Academy Learner Lab (uses LabRole)
# No Service Discovery (not available in Learner Lab)

# ---- ECS Cluster ----
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled" # Save costs — enable later if needed
  }

  tags = {
    Name = "${var.project_name}-cluster"
  }
}

# ---- IAM Role: AWS Academy LabRole ----
# Learner Lab provides a pre-configured LabRole with broad permissions.
# Custom IAM roles cannot be created in Learner Lab environments.
locals {
  lab_role_arn = "arn:aws:iam::${var.aws_account_id}:role/LabRole"
}

# ---- CloudWatch Log Groups ----
resource "aws_cloudwatch_log_group" "services" {
  for_each = var.microservices

  name              = "/ecs/${var.project_name}/${each.key}"
  retention_in_days = 14 # Keep logs 2 weeks to save costs

  tags = {
    Service = each.key
  }
}

# Services with custom task definitions are in ecs-overrides.tf
locals {
  # Services that use the generic ECS configuration (no extra secrets)
  generic_services = {
    for k, v in var.microservices : k => v
    if !contains(["subscription-service", "platform-connection-service", "notification-service"], k)
  }
}

# ---- Task Definitions (Generic Services) ----
resource "aws_ecs_task_definition" "services" {
  for_each = local.generic_services

  family                   = "${var.project_name}-${each.key}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.service_cpu
  memory                   = var.service_memory
  execution_role_arn       = local.lab_role_arn
  task_role_arn            = local.lab_role_arn

  container_definitions = jsonencode([
    {
      name      = each.key
      image     = "${aws_ecr_repository.services[each.key].repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = each.value.port
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "SPRING_PROFILES_ACTIVE"
          value = "prod"
        },
        {
          name  = "SPRING_DATASOURCE_URL"
          value = "jdbc:mysql://${aws_db_instance.main.endpoint}/${var.db_name}?useSSL=true&requireSSL=true&allowPublicKeyRetrieval=true&characterEncoding=UTF-8&useUnicode=true&connectionCollation=utf8mb4_unicode_ci"
        },
        {
          name  = "CORS_ALLOWED_ORIGINS"
          value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint},http://${aws_lb.main.dns_name}"
        },
        # Inter-service communication via ALB (no Service Discovery in Learner Lab)
        {
          name  = "AUTH_SERVICE_URL"
          value = "http://${aws_lb.main.dns_name}"
        },
        {
          name  = "USER_SERVICE_URL"
          value = "http://${aws_lb.main.dns_name}"
        },
        {
          name  = "TRANSACTION_SERVICE_URL"
          value = "http://${aws_lb.main.dns_name}"
        },
        {
          name  = "SUBSCRIPTION_SERVICE_URL"
          value = "http://${aws_lb.main.dns_name}"
        },
        {
          name  = "PLATFORM_CONNECTION_SERVICE_URL"
          value = "http://${aws_lb.main.dns_name}"
        },
        {
          name  = "NOTIFICATION_SERVICE_URL"
          value = "http://${aws_lb.main.dns_name}"
        },
        {
          name  = "REPORTING_SERVICE_URL"
          value = "http://${aws_lb.main.dns_name}"
        },
        {
          name  = "FRONTEND_URL"
          value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
        },
        {
          name  = "CORS_ALLOWED_ORIGINS"
          value = "http://localhost:4200,https://app.aizesk.com,https://www.aizesk.com,http://${aws_s3_bucket_website_configuration.frontend.website_endpoint},http://${aws_lb.main.dns_name}"
        },
      ]

      secrets = [
        {
          name      = "SPRING_DATASOURCE_USERNAME"
          valueFrom = aws_ssm_parameter.db_username.arn
        },
        {
          name      = "SPRING_DATASOURCE_PASSWORD"
          valueFrom = aws_ssm_parameter.db_password.arn
        },
        {
          name      = "JWT_SECRET"
          valueFrom = aws_ssm_parameter.jwt_secret.arn
        },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.services[each.key].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:${each.value.port}${each.value.health_path} || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 120
      }
    }
  ])

  tags = {
    Service = each.key
  }
}

# ---- ECS Services ----
resource "aws_ecs_service" "services" {
  for_each = local.generic_services

  name            = each.key
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.services[each.key].arn
  desired_count   = 1 # Single instance per service (budget)
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true # Required — no NAT Gateway (budget optimization)
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services[each.key].arn
    container_name   = each.key
    container_port   = each.value.port
  }

  health_check_grace_period_seconds = 300

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  lifecycle {
    ignore_changes = [desired_count]
  }

  depends_on = [
    aws_lb_listener.http,
    aws_db_instance.main
  ]

  tags = {
    Service = each.key
  }
}
