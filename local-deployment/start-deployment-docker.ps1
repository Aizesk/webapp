# ===========================================
# AIZESK - Local Development Startup Script (Windows)
# ===========================================
# Usage:
#   .\start-deployment-docker.ps1          # Start everything (infra + services)
#   .\start-deployment-docker.ps1 infra    # Start only MySQL + MailHog (for local dev)
#   .\start-deployment-docker.ps1 all      # Start everything
#   .\start-deployment-docker.ps1 stop     # Stop all containers
# ===========================================

param(
    [Parameter(Position=0)]
    [ValidateSet("all", "infra", "stop", "")]
    [string]$Mode = "all"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host ""
Write-Host "🚀 AIZESK Local Development Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Docker not running" }
} catch {
    Write-Host "❌ Error: Docker is not running." -ForegroundColor Red
    Write-Host "   Please start Docker Desktop and try again."
    exit 1
}

# Check if .env file exists, if not create from example
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file with default values..." -ForegroundColor Yellow
    @"
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
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created" -ForegroundColor Green
}

switch ($Mode.ToLower()) {
    "infra" {
        Write-Host "📦 Starting infrastructure only (MySQL + MailHog)..." -ForegroundColor Yellow
        Write-Host "   Use this mode to run microservices locally with your IDE." -ForegroundColor Gray
        Write-Host ""
        docker-compose up -d mysql mailhog
        
        Write-Host ""
        Write-Host "⏳ Waiting for MySQL to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 8
        
        Write-Host ""
        Write-Host "✅ Infrastructure Started!" -ForegroundColor Green
        Write-Host ""
        Write-Host "=====================================================" -ForegroundColor Cyan
        Write-Host "🌐 AVAILABLE SERVICES (Infrastructure only)" -ForegroundColor Cyan
        Write-Host "=====================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  📊 Database (MySQL)"
        Write-Host "     └── localhost:3307"
        Write-Host "     └── User: aizesk / Password: aizesk-mysql-2024"
        Write-Host ""
        Write-Host "  📧 Email Testing (MailHog)"
        Write-Host "     └── http://localhost:8025"
        Write-Host ""
        Write-Host "=====================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 Now run your microservices locally:" -ForegroundColor Yellow
        Write-Host "   cd ..\notification-service"
        Write-Host "   mvn spring-boot:run"
        Write-Host ""
        Write-Host "📝 Useful Commands:" -ForegroundColor Yellow
        Write-Host "   .\scripts\db-utils.ps1 shell    # Connect to MySQL"
        Write-Host "   docker-compose down             # Stop infrastructure"
        Write-Host ""
    }
    
    "stop" {
        Write-Host "🛑 Stopping all containers..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✅ All containers stopped." -ForegroundColor Green
    }
    
    default {
        Write-Host "📦 Starting all services (MySQL + MailHog + Microservices)..." -ForegroundColor Yellow
        Write-Host ""
        docker-compose up --build -d
        
        Write-Host ""
        Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        Write-Host ""
        Write-Host "✅ Environment Started!" -ForegroundColor Green
        Write-Host ""
        Write-Host "=====================================================" -ForegroundColor Cyan
        Write-Host "🌐 AVAILABLE SERVICES" -ForegroundColor Cyan
        Write-Host "=====================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  📊 Database (MySQL)"
        Write-Host "     └── localhost:3307"
        Write-Host ""
        Write-Host "  📧 Email Testing (MailHog)"
        Write-Host "     └── http://localhost:8025"
        Write-Host ""
        Write-Host "  🔔 Notification Service"
        Write-Host "     ├── API:     http://localhost:8086"
        Write-Host "     ├── Swagger: http://localhost:8086/swagger-ui.html"
        Write-Host "     └── Health:  http://localhost:8086/actuator/health"
        Write-Host ""
        Write-Host "=====================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 Useful Commands:" -ForegroundColor Yellow
        Write-Host "   docker-compose logs -f              # View all logs"
        Write-Host "   docker-compose logs -f notification-service  # View service logs"
        Write-Host "   docker-compose down                 # Stop all services"
        Write-Host "   docker-compose down -v              # Stop and clean volumes"
        Write-Host ""
    }
}
