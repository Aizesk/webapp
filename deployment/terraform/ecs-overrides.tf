# ===========================================
# SERVICE-SPECIFIC TASK DEFINITION OVERRIDES
# ===========================================
# Additional environment variables and secrets per service
# These override the generic task definitions in ecs.tf
# Adapted for AWS Academy Learner Lab (no Service Discovery, no CloudFront)

# ---- Subscription Service: Stripe secrets ----
resource "aws_ecs_task_definition" "subscription_service" {
  family                   = "${var.project_name}-subscription-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.service_cpu
  memory                   = var.service_memory
  execution_role_arn       = local.lab_role_arn
  task_role_arn            = local.lab_role_arn

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
        { name = "CORS_ALLOWED_ORIGINS", value = "http://localhost:4200,https://app.aizesk.com,https://www.aizesk.com,http://${aws_s3_bucket_website_configuration.frontend.website_endpoint},http://${aws_lb.main.dns_name}" },
        { name = "AUTH_SERVICE_URL", value = "http://${aws_lb.main.dns_name}" },
        { name = "USER_SERVICE_URL", value = "http://${aws_lb.main.dns_name}" },
        { name = "NOTIFICATION_SERVICE_URL", value = "http://${aws_lb.main.dns_name}" },
        { name = "STRIPE_SUCCESS_URL", value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}/subscriptions?checkout=success" },
        { name = "STRIPE_CANCEL_URL", value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}/subscriptions?checkout=cancelled" },
        { name = "STRIPE_PRICE_PROFESSIONAL_MONTHLY", value = var.stripe_price_professional_monthly },
        { name = "STRIPE_PRICE_PROFESSIONAL_ANNUAL", value = var.stripe_price_professional_annual },
        { name = "STRIPE_PRICE_ENTERPRISE_MONTHLY", value = var.stripe_price_enterprise_monthly },
        { name = "STRIPE_PRICE_ENTERPRISE_ANNUAL", value = var.stripe_price_enterprise_annual },
        { name = "FRONTEND_URL", value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}" },
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
  execution_role_arn       = local.lab_role_arn
  task_role_arn            = local.lab_role_arn

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
        { name = "CORS_ALLOWED_ORIGINS", value = "http://localhost:4200,https://app.aizesk.com,https://www.aizesk.com,http://${aws_s3_bucket_website_configuration.frontend.website_endpoint},http://${aws_lb.main.dns_name},${aws_apigatewayv2_api.alb_proxy.api_endpoint}" },
        { name = "AUTH_SERVICE_URL", value = "http://${aws_lb.main.dns_name}" },
        { name = "USER_SERVICE_URL", value = "http://${aws_lb.main.dns_name}" },
        { name = "TRANSACTION_SERVICE_URL", value = "http://${aws_lb.main.dns_name}" },
        { name = "SUBSCRIPTION_SERVICE_URL", value = "http://${aws_lb.main.dns_name}" },
        { name = "FRONTEND_URL", value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}" },
        { name = "SHOPIFY_REDIRECT_URI", value = "${aws_apigatewayv2_api.alb_proxy.api_endpoint}/api/v1/platforms/callback/shopify" },
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

# ---- Notification Service: Dev Mode (SES not available in Learner Lab) ----
resource "aws_ecs_task_definition" "notification_service" {
  family                   = "${var.project_name}-notification-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.service_cpu
  memory                   = var.service_memory
  execution_role_arn       = local.lab_role_arn
  task_role_arn            = local.lab_role_arn

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
        { name = "CORS_ALLOWED_ORIGINS", value = "http://localhost:4200,https://app.aizesk.com,https://www.aizesk.com,http://${aws_s3_bucket_website_configuration.frontend.website_endpoint},http://${aws_lb.main.dns_name}" },
        { name = "AUTH_SERVICE_URL", value = "http://${aws_lb.main.dns_name}" },
        { name = "USER_SERVICE_URL", value = "http://${aws_lb.main.dns_name}" },
        # SES not available in Learner Lab — emails are logged, not sent
        { name = "MAIL_DEV_MODE", value = "true" },
        { name = "SPRING_MAIL_HOST", value = "localhost" },
        { name = "SPRING_MAIL_PORT", value = "1025" },
        { name = "SPRING_MAIL_USERNAME", value = "not-configured" },
        { name = "SPRING_MAIL_PASSWORD", value = "not-configured" },
        { name = "MAIL_FROM_ADDRESS", value = "noreply@aizesk.local" },
        { name = "FRONTEND_URL", value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}" },
      ]

      secrets = [
        { name = "SPRING_DATASOURCE_USERNAME", valueFrom = aws_ssm_parameter.db_username.arn },
        { name = "SPRING_DATASOURCE_PASSWORD", valueFrom = aws_ssm_parameter.db_password.arn },
        { name = "JWT_SECRET", valueFrom = aws_ssm_parameter.jwt_secret.arn },
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

  health_check_grace_period_seconds = 180

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  depends_on = [aws_lb_listener.http, aws_db_instance.main]

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

  health_check_grace_period_seconds = 180

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  depends_on = [aws_lb_listener.http, aws_db_instance.main]

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

  health_check_grace_period_seconds = 180

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  depends_on = [aws_lb_listener.http, aws_db_instance.main]

  tags = { Service = "notification-service" }

  lifecycle {
    ignore_changes = [desired_count]
  }
}
