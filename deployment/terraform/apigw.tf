resource "aws_apigatewayv2_api" "alb_proxy" {
  name          = "aizesk-alb-https-proxy"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "alb" {
  api_id             = aws_apigatewayv2_api.alb_proxy.id
  integration_type   = "HTTP_PROXY"
  integration_uri    = "http://${aws_lb.main.dns_name}"
  integration_method = "ANY"
  connection_type    = "INTERNET"
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.alb_proxy.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.alb.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.alb_proxy.id
  name        = "$default"
  auto_deploy = true
}

output "https_api_url" {
  value = aws_apigatewayv2_api.alb_proxy.api_endpoint
}
