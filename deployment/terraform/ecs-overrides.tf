# ===========================================
# SERVICE-SPECIFIC TASK DEFINITION OVERRIDES
# ===========================================
# Additional environment variables and secrets per service
# These override the generic task definitions in ecs.tf

# ---- Subscription Service: Stripe secrets ----
resource "aws_ecs_task_definition" "subscription_service" {
  family                   = "${var.project_name}-subscription-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.service_cpu
  memory                   = var.service_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "subscription-service"
      image     = "${aws_ecr_repository.services["subscription-service"].repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8084
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "SPRING_PROFILES_ACTIVE", value = "prod" },
        { name = "SPRING_DATASOURCE_URL", value = "jdbc:mysql://${aws_db_instance.main.endpoint}/${var.db_name}?useSSL=true&requireSSL=true&allowPublicKeyRetrieval=true" },
        { name = "CORS_ALLOWED_ORIGINS", value = "https://${var.app_subdomain}.${var.domain_name},https://www.${var.domain_name}" },
        { name = "AUTH_SERVICE_URL", value = "http://auth-service.${var.project_name}.local:8081" },
        { name = "USER_SERVICE_URL", value = "http://user-service.${var.project_name}.local:8082" },
        { name = "NOTIFICATION_SERVICE_URL", value = "http://notification-service.${var.project_name}.local:8086" },
        { name = "STRIPE_SUCCESS_URL", value = "https://${var.app_subdomain}.${var.domain_name}/subscriptions?checkout=success" },
        { name = "STRIPE_CANCEL_URL", value = "https://${var.app_subdomain}.${var.domain_name}/subscriptions?checkout=cancelled" },
        { name = "FRONTEND_URL", value = "https://${var.app_subdomain}.${var.domain_name}" },
      ]

      secrets = [
        { name = "SPRING_DATASOURCE_USERNAME", valueFrom = aws_ssm_parameter.db_username.arn },
        { name = "SPRING_DATASOURCE_PASSWORD", valueFrom = aws_ssm_parameter.db_password.arn },
        { name = "JWT_SECRET", valueFrom = aws_ssm_parameter.jwt_secret.arn },
        { name = "STRIPE_API_KEY", valueFrom = aws_ssm_parameter.stripe_api_key.arn },
        { name = "STRIPE_WEBHOOK_SECRET", valueFrom = aws_ssm_parameter.stripe_webhook_secret.arn },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.services["subscription-service"].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8084/actuator/health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 120
      }
    }
  ])

  tags = {
    Service = "subscription-service"
  }
}

# ---- Platform Connection Service: Shopify/Platform secrets ----
resource "aws_ecs_task_definition" "platform_connection_service" {
  family                   = "${var.project_name}-platform-connection-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.service_cpu
  memory                   = var.service_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "platform-connection-service"
      image     = "${aws_ecr_repository.services["platform-connection-service"].repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8085
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "SPRING_PROFILES_ACTIVE", value = "prod" },
        { name = "SPRING_DATASOURCE_URL", value = "jdbc:mysql://${aws_db_instance.main.endpoint}/${var.db_name}?useSSL=true&requireSSL=true&allowPublicKeyRetrieval=true" },
        { name = "CORS_ALLOWED_ORIGINS", value = "https://${var.app_subdomain}.${var.domain_name},https://www.${var.domain_name}" },
        { name = "AUTH_SERVICE_URL", value = "http://auth-service.${var.project_name}.local:8081" },
        { name = "USER_SERVICE_URL", value = "http://user-service.${var.project_name}.local:8082" },
        { name = "TRANSACTION_SERVICE_URL", value = "http://transaction-service.${var.project_name}.local:8083" },
        { name = "SUBSCRIPTION_SERVICE_URL", value = "http://subscription-service.${var.project_name}.local:8084" },
        { name = "FRONTEND_URL", value = "https://${var.app_subdomain}.${var.domain_name}" },
        { name = "SHOPIFY_REDIRECT_URI", value = "https://${var.api_subdomain}.${var.domain_name}/api/v1/platforms/callback/shopify" },
        { name = "SHOPIFY_API_VERSION", value = "2026-01" },
      ]

      secrets = [
        { name = "SPRING_DATASOURCE_USERNAME", valueFrom = aws_ssm_parameter.db_username.arn },
        { name = "SPRING_DATASOURCE_PASSWORD", valueFrom = aws_ssm_parameter.db_password.arn },
        { name = "JWT_SECRET", valueFrom = aws_ssm_parameter.jwt_secret.arn },
        { name = "SHOPIFY_CLIENT_ID", valueFrom = aws_ssm_parameter.shopify_client_id.arn },
        { name = "SHOPIFY_CLIENT_SECRET", valueFrom = aws_ssm_parameter.shopify_client_secret.arn },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.services["platform-connection-service"].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8085/actuator/health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 120
      }
    }
  ])

  tags = {
    Service = "platform-connection-service"
  }
}

# ---- Notification Service: SES SMTP secrets ----
resource "aws_ecs_task_definition" "notification_service" {
  family                   = "${var.project_name}-notification-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.service_cpu
  memory                   = var.service_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "notification-service"
      image     = "${aws_ecr_repository.services["notification-service"].repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8086
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "SPRING_PROFILES_ACTIVE", value = "prod" },
        { name = "SPRING_DATASOURCE_URL", value = "jdbc:mysql://${aws_db_instance.main.endpoint}/${var.db_name}?useSSL=true&requireSSL=true&allowPublicKeyRetrieval=true" },
        { name = "CORS_ALLOWED_ORIGINS", value = "https://${var.app_subdomain}.${var.domain_name},https://www.${var.domain_name}" },
        { name = "AUTH_SERVICE_URL", value = "http://auth-service.${var.project_name}.local:8081" },
        { name = "USER_SERVICE_URL", value = "http://user-service.${var.project_name}.local:8082" },
        { name = "MAIL_DEV_MODE", value = "false" },
        { name = "SPRING_MAIL_HOST", value = "email-smtp.${var.aws_region}.amazonaws.com" },
        { name = "SPRING_MAIL_PORT", value = "587" },
        { name = "MAIL_FROM_ADDRESS", value = "noreply@${var.domain_name}" },
        { name = "FRONTEND_URL", value = "https://${var.app_subdomain}.${var.domain_name}" },
      ]

      secrets = [
        { name = "SPRING_DATASOURCE_USERNAME", valueFrom = aws_ssm_parameter.db_username.arn },
        { name = "SPRING_DATASOURCE_PASSWORD", valueFrom = aws_ssm_parameter.db_password.arn },
        { name = "JWT_SECRET", valueFrom = aws_ssm_parameter.jwt_secret.arn },
        { name = "SPRING_MAIL_USERNAME", valueFrom = aws_ssm_parameter.ses_smtp_username.arn },
        { name = "SPRING_MAIL_PASSWORD", valueFrom = aws_ssm_parameter.ses_smtp_password.arn },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.services["notification-service"].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8086/actuator/health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 120
      }
    }
  ])

  tags = {
    Service = "notification-service"
  }
}

# ---- Override ECS services to use specific task definitions ----
resource "aws_ecs_service" "subscription_service" {
  name            = "subscription-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.subscription_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services["subscription-service"].arn
    container_name   = "subscription-service"
    container_port   = 8084
  }

  service_registries {
    registry_arn = aws_service_discovery_service.services["subscription-service"].arn
  }

  health_check_grace_period_seconds = 180

  depends_on = [aws_lb_listener.https, aws_db_instance.main]

  tags = { Service = "subscription-service" }

  lifecycle {
    ignore_changes = [desired_count]
  }
}

resource "aws_ecs_service" "platform_connection_service" {
  name            = "platform-connection-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.platform_connection_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services["platform-connection-service"].arn
    container_name   = "platform-connection-service"
    container_port   = 8085
  }

  service_registries {
    registry_arn = aws_service_discovery_service.services["platform-connection-service"].arn
  }

  health_check_grace_period_seconds = 180

  depends_on = [aws_lb_listener.https, aws_db_instance.main]

  tags = { Service = "platform-connection-service" }

  lifecycle {
    ignore_changes = [desired_count]
  }
}

resource "aws_ecs_service" "notification_service" {
  name            = "notification-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.notification_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services["notification-service"].arn
    container_name   = "notification-service"
    container_port   = 8086
  }

  service_registries {
    registry_arn = aws_service_discovery_service.services["notification-service"].arn
  }

  health_check_grace_period_seconds = 180

  depends_on = [aws_lb_listener.https, aws_db_instance.main]

  tags = { Service = "notification-service" }

  lifecycle {
    ignore_changes = [desired_count]
  }
}
