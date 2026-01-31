# =====================================================
# AIZESK Platform - Database Utilities (Windows)
# =====================================================
# Utilities for managing the MySQL database.
# To start/stop the database, use: docker-compose up/down
# =====================================================

param(
    [Parameter(Position=0)]
    [string]$Command,
    [Parameter(Position=1)]
    [string]$SqlFile
)

# Configuration
$ContainerName = "aizesk-mysql"
$MysqlUser = "aizesk"
$MysqlPassword = "aizesk-mysql-2024"
$MysqlDatabase = "aizesk"
$MysqlRootPassword = "root-password-2024"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DbDir = Join-Path (Split-Path -Parent $ScriptDir) "db"
$RootDir = Split-Path -Parent $ScriptDir

function Test-ContainerRunning {
    $result = docker ps --format '{{.Names}}' | Select-String -Pattern "^$ContainerName$"
    return $null -ne $result
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   AIZESK Platform - Database Utilities         " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

switch ($Command.ToLower()) {
    "status" {
        if (Test-ContainerRunning) {
            Write-Host "✅ MySQL container is running" -ForegroundColor Green
            Write-Host ""
            Write-Host "Connection info:" -ForegroundColor Cyan
            Write-Host "  Host: localhost"
            Write-Host "  Port: 3307"
            Write-Host "  Database: $MysqlDatabase"
            Write-Host "  User: $MysqlUser"
            Write-Host "  Password: $MysqlPassword"
        } else {
            Write-Host "❌ MySQL container is not running" -ForegroundColor Red
            Write-Host "  Run: .\start-deployment-docker.ps1"
        }
    }
    
    "shell" {
        if (-not (Test-ContainerRunning)) {
            Write-Host "❌ MySQL container is not running" -ForegroundColor Red
            exit 1
        }
        Write-Host "🔌 Connecting to MySQL..." -ForegroundColor Cyan
        docker exec -it $ContainerName mysql -u $MysqlUser -p$MysqlPassword $MysqlDatabase
    }
    
    "shell-root" {
        if (-not (Test-ContainerRunning)) {
            Write-Host "❌ MySQL container is not running" -ForegroundColor Red
            exit 1
        }
        Write-Host "🔌 Connecting to MySQL as root..." -ForegroundColor Cyan
        docker exec -it $ContainerName mysql -u root -p$MysqlRootPassword
    }
    
    "logs" {
        docker logs -f $ContainerName
    }
    
    "reset" {
        Write-Host "⚠️  WARNING: This will DELETE all data!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (y/N)"
        if ($confirm -match "^[Yy]") {
            Write-Host "🗑️  Resetting database..." -ForegroundColor Yellow
            Push-Location $RootDir
            docker-compose down -v
            docker-compose up -d mysql
            Write-Host "⏳ Waiting for MySQL to be ready..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
            Pop-Location
            Write-Host "✅ Database reset complete!" -ForegroundColor Green
        } else {
            Write-Host "Operation cancelled." -ForegroundColor Cyan
        }
    }
    
    "seed" {
        if (-not (Test-ContainerRunning)) {
            Write-Host "❌ MySQL container is not running" -ForegroundColor Red
            exit 1
        }
        Write-Host "🌱 Running seed data..." -ForegroundColor Yellow
        $seedFile = Join-Path $DbDir "02-seed-data.sql"
        Get-Content $seedFile | docker exec -i $ContainerName mysql -u $MysqlUser -p$MysqlPassword $MysqlDatabase
        Write-Host "✅ Seed data inserted!" -ForegroundColor Green
    }
    
    "exec" {
        if (-not $SqlFile) {
            Write-Host "Usage: .\db-utils.ps1 exec <sql-file>" -ForegroundColor Red
            exit 1
        }
        if (-not (Test-ContainerRunning)) {
            Write-Host "❌ MySQL container is not running" -ForegroundColor Red
            exit 1
        }
        Write-Host "📄 Executing SQL file: $SqlFile" -ForegroundColor Yellow
        Get-Content $SqlFile | docker exec -i $ContainerName mysql -u $MysqlUser -p$MysqlPassword $MysqlDatabase
        Write-Host "✅ SQL executed!" -ForegroundColor Green
    }
    
    default {
        Write-Host "Usage: .\db-utils.ps1 <command>" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor Cyan
        Write-Host "  status      Check container status and connection info"
        Write-Host "  shell       Connect to MySQL as aizesk user"
        Write-Host "  shell-root  Connect to MySQL as root user"
        Write-Host "  logs        View container logs (follow mode)"
        Write-Host "  reset       Delete all data and restart (DESTRUCTIVE!)"
        Write-Host "  seed        Re-run seed data script"
        Write-Host "  exec <file> Execute a SQL file"
        Write-Host ""
        Write-Host "Note: To start/stop use docker-compose:" -ForegroundColor Cyan
        Write-Host "  docker-compose up -d    # Start"
        Write-Host "  docker-compose down     # Stop"
    }
}
