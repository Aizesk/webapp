# ===========================================
# ECS CLUSTER + FARGATE SERVICES
# ===========================================
# 7 microservices on ECS Fargate with minimal resources

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

# ---- IAM Role for ECS Task Execution ----
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-ecs-task-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Allow ECS to read SSM parameters (for secrets)
resource "aws_iam_role_policy" "ecs_ssm_access" {
  name = "${var.project_name}-ecs-ssm-access"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter"
        ]
        Resource = "arn:aws:ssm:${var.aws_region}:*:parameter/${var.project_name}/*"
      }
    ]
  })
}

# ---- IAM Role for ECS Tasks (runtime permissions) ----
resource "aws_iam_role" "ecs_task" {
  name = "${var.project_name}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Allow tasks to send emails via SES
resource "aws_iam_role_policy" "ecs_ses_access" {
  name = "${var.project_name}-ecs-ses-access"
  role = aws_iam_role.ecs_task.id

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

# ---- CloudWatch Log Groups ----
resource "aws_cloudwatch_log_group" "services" {
  for_each = var.microservices

  name              = "/ecs/${var.project_name}/${each.key}"
  retention_in_days = 14 # Keep logs 2 weeks to save costs

  tags = {
    Service = each.key
  }
}

# ---- ECS Service Discovery (Cloud Map) ----
resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "${var.project_name}.local"
  description = "Service discovery for ${var.project_name} microservices"
  vpc         = aws_vpc.main.id
}

resource "aws_service_discovery_service" "services" {
  for_each = var.microservices

  name = each.key

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
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

# ---- Task Definitions ----
resource "aws_ecs_task_definition" "services" {
  for_each = local.generic_services

  family                   = "${var.project_name}-${each.key}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.service_cpu
  memory                   = var.service_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

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
          value = "https://${var.app_subdomain}.${var.domain_name},https://www.${var.domain_name}"
        },
        # Service discovery URLs
        {
          name  = "AUTH_SERVICE_URL"
          value = "http://auth-service.${var.project_name}.local:8081"
        },
        {
          name  = "USER_SERVICE_URL"
          value = "http://user-service.${var.project_name}.local:8082"
        },
        {
          name  = "TRANSACTION_SERVICE_URL"
          value = "http://transaction-service.${var.project_name}.local:8083"
        },
        {
          name  = "SUBSCRIPTION_SERVICE_URL"
          value = "http://subscription-service.${var.project_name}.local:8084"
        },
        {
          name  = "PLATFORM_CONNECTION_SERVICE_URL"
          value = "http://platform-connection-service.${var.project_name}.local:8085"
        },
        {
          name  = "NOTIFICATION_SERVICE_URL"
          value = "http://notification-service.${var.project_name}.local:8086"
        },
        {
          name  = "REPORTING_SERVICE_URL"
          value = "http://reporting-service.${var.project_name}.local:8087"
        },
        {
          name  = "FRONTEND_URL"
          value = "https://${var.app_subdomain}.${var.domain_name}"
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

  service_registries {
    registry_arn = aws_service_discovery_service.services[each.key].arn
  }

  # Allow service to stabilize during deployments
  health_check_grace_period_seconds = 180

  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }

  # Ignore changes to desired_count (if scaling manually)
  lifecycle {
    ignore_changes = [desired_count]
  }

  depends_on = [
    aws_lb_listener.https,
    aws_db_instance.main
  ]

  tags = {
    Service = each.key
  }
}
