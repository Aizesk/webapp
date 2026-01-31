#!/bin/bash

# ===========================================
# AIZESK - Local Development Startup Script
# ===========================================
# Usage:
#   ./start-deployment-docker.sh          # Start everything (infra + services)
#   ./start-deployment-docker.sh infra    # Start only MySQL + MailHog (for local dev)
#   ./start-deployment-docker.sh all      # Start everything
#   ./start-deployment-docker.sh stop     # Stop all containers
# ===========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MODE="${1:-all}"

echo ""
echo "🚀 AIZESK Local Development Environment"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker is not running."
  echo "   Please start Docker Desktop and try again."
  exit 1
fi

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
  echo "📝 Creating .env file with default values..."
  cat > .env << EOF
# Aizesk Local Development Environment Variables
MYSQL_ROOT_PASSWORD=root-password-2024
MYSQL_PASSWORD=aizesk-mysql-2024
JWT_SECRET=aizesk-super-secret-key-for-jwt-tokens-2024-must-be-long-enough
MAIL_DEV_MODE=true
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000

# AWS (only needed for production profile)
AWS_REGION=eu-west-1
AWS_SES_SMTP_USERNAME=
AWS_SES_SMTP_PASSWORD=
EOF
  echo "✅ .env file created"
fi

case "$MODE" in
  "infra")
    echo "📦 Starting infrastructure only (MySQL + MailHog)..."
    echo "   Use this mode to run microservices locally with your IDE."
    echo ""
    docker-compose up -d mysql mailhog
    
    echo ""
    echo "⏳ Waiting for MySQL to be ready..."
    sleep 8
    
    echo ""
    echo "✅ Infrastructure Started!"
    echo ""
    echo "====================================================="
    echo "🌐 AVAILABLE SERVICES (Infrastructure only)"
    echo "====================================================="
    echo ""
    echo "  📊 Database (MySQL)"
    echo "     └── localhost:3307"
    echo "     └── User: aizesk / Password: aizesk-mysql-2024"
    echo ""
    echo "  📧 Email Testing (MailHog)"
    echo "     └── http://localhost:8025"
    echo ""
    echo "====================================================="
    echo ""
    echo "📝 Now run your microservices locally:"
    echo "   cd ../notification-service"
    echo "   mvn spring-boot:run"
    echo ""
    echo "📝 Useful Commands:"
    echo "   ./scripts/db-utils.sh shell    # Connect to MySQL"
    echo "   docker-compose down            # Stop infrastructure"
    echo ""
    ;;
    
  "stop")
    echo "🛑 Stopping all containers..."
    docker-compose down
    echo "✅ All containers stopped."
    ;;
    
  "all"|*)
    echo "📦 Starting all services (MySQL + MailHog + Microservices)..."
    echo ""
    docker-compose up --build -d
    
    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 5
    
    echo ""
    echo "✅ Environment Started!"
    echo ""
    echo "====================================================="
    echo "🌐 AVAILABLE SERVICES"
    echo "====================================================="
    echo ""
    echo "  📊 Database (MySQL)"
    echo "     └── localhost:3307"
    echo ""
    echo "  📧 Email Testing (MailHog)"
    echo "     └── http://localhost:8025"
    echo ""
    echo "  🔔 Notification Service"
    echo "     ├── API:     http://localhost:8086"
    echo "     ├── Swagger: http://localhost:8086/swagger-ui.html"
    echo "     └── Health:  http://localhost:8086/actuator/health"
    echo ""
    echo "====================================================="
    echo ""
    echo "📝 Useful Commands:"
    echo "   docker-compose logs -f              # View all logs"
    echo "   docker-compose logs -f notification-service  # View service logs"
    echo "   docker-compose down                 # Stop all services"
    echo "   docker-compose down -v              # Stop and clean volumes"
    echo ""
    ;;
esac
