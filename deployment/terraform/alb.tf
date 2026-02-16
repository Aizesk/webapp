# ===========================================
# ALB + PATH-BASED ROUTING
# ===========================================
# Single ALB routing to all 7 microservices by URL path
# HTTP only (no custom domain/ACM certificate in Learner Lab)

resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# ---- Target Groups (one per microservice) ----
resource "aws_lb_target_group" "services" {
  for_each = var.microservices

  name        = "${var.project_name}-${replace(each.key, "-service", "")}"
  port        = each.value.port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = each.value.health_path
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
    matcher             = "200"
  }

  # Slow start for Spring Boot (needs time to initialize)
  slow_start = 120

  tags = {
    Name    = "${var.project_name}-${each.key}-tg"
    Service = each.key
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ---- HTTP Listener (primary) ----
# Learner Lab: no custom domain/ACM certificate available for HTTPS
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "application/json"
      message_body = "{\"error\":\"Not Found\"}"
      status_code  = "404"
    }
  }
}

# ---- Path-based Routing Rules ----
resource "aws_lb_listener_rule" "services" {
  for_each = var.microservices

  listener_arn = aws_lb_listener.http.arn
  priority     = each.value.priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services[each.key].arn
  }

  condition {
    path_pattern {
      values = each.value.path_pattern
    }
  }
}
