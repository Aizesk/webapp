# ===========================================
# AIZESK - Local Development Startup Script (Windows)
# ===========================================
#
# Usage: .\start.ps1

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
Set-Location $ScriptDir

Write-Host ""
Write-Host "🚀 Starting Aizesk Microservices Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
} catch {
    Write-Host "❌ Error: Docker is not running." -ForegroundColor Red
    Write-Host "   Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists, if not create from example
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file with default values..." -ForegroundColor Yellow
    
    $envContent = @"
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
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created" -ForegroundColor Green
}

# Build and start services
Write-Host ""
Write-Host "📦 Building and starting containers..." -ForegroundColor Yellow
docker-compose up --build -d

# Wait for services to be healthy
Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Show status
Write-Host ""
Write-Host "✅ Environment Started!" -ForegroundColor Green
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "🌐 AVAILABLE SERVICES" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📊 Database (MySQL)" -ForegroundColor White
Write-Host "     └── localhost:3307" -ForegroundColor Gray
Write-Host ""
Write-Host "  📧 Email Testing (MailHog)" -ForegroundColor White
Write-Host "     └── http://localhost:8025" -ForegroundColor Gray
Write-Host ""
Write-Host "  🔔 Notification Service" -ForegroundColor White
Write-Host "     ├── API:     http://localhost:8086" -ForegroundColor Gray
Write-Host "     ├── Swagger: http://localhost:8086/swagger-ui.html" -ForegroundColor Gray
Write-Host "     └── Health:  http://localhost:8086/actuator/health" -ForegroundColor Gray
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Useful Commands:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f              # View all logs"
Write-Host "   docker-compose logs -f notification-service  # View service logs"
Write-Host "   docker-compose down                 # Stop all services"
Write-Host "   docker-compose down -v              # Stop and clean volumes"
Write-Host ""
