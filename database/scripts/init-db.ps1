# =====================================================
# AIZESK Platform - Database Initialization Script
# PowerShell version for Windows
# =====================================================

param(
    [Parameter(Position=0)]
    [string]$Command,
    [Parameter(Position=1)]
    [string]$Argument
)

# Configuration
$CONTAINER_NAME = "aizesk-mysql"
$MYSQL_USER = "aizesk"
$MYSQL_PASSWORD = "aizesk-mysql-2024"
$MYSQL_DATABASE = "aizesk_users"
$MYSQL_ROOT_PASSWORD = "root"

# Get script directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$DB_DIR = Split-Path -Parent $SCRIPT_DIR

# Colors
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Header {
    Write-Host "================================================" -ForegroundColor Blue
    Write-Host "   AIZESK Platform - Database Initialization    " -ForegroundColor Blue
    Write-Host "================================================" -ForegroundColor Blue
    Write-Host ""
}

# Function to check if container exists
function Test-ContainerExists {
    $containers = docker ps -a --format '{{.Names}}' 2>$null
    return $containers -contains $CONTAINER_NAME
}

# Function to check if container is running
function Test-ContainerRunning {
    $containers = docker ps --format '{{.Names}}' 2>$null
    return $containers -contains $CONTAINER_NAME
}

# Function to wait for MySQL
function Wait-ForMySQL {
    Write-Host "⏳ Waiting for MySQL to be ready..." -ForegroundColor Yellow
    $maxAttempts = 30
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        # Use environment variable for password (more secure and compatible)
        $env:MYSQL_PWD = $MYSQL_ROOT_PASSWORD
        $result = docker exec -e MYSQL_PWD=$MYSQL_ROOT_PASSWORD $CONTAINER_NAME mysqladmin ping -h localhost -u root --silent 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ MySQL is ready!" -ForegroundColor Green
            return $true
        }
        Write-Host "   Attempt $attempt/$maxAttempts..."
        Start-Sleep -Seconds 2
        $attempt++
    }
    
    Write-Host "❌ MySQL failed to start after $maxAttempts attempts" -ForegroundColor Red
    return $false
}

# Main logic
Write-Header

switch ($Command) {
    "start" {
        Write-Host "🐳 Starting MySQL container..." -ForegroundColor Yellow
        Push-Location $DB_DIR
        docker-compose up -d
        Pop-Location
        if (Wait-ForMySQL) {
            Write-Host "✅ Database started successfully!" -ForegroundColor Green
        }
    }
    
    "stop" {
        Write-Host "🛑 Stopping MySQL container..." -ForegroundColor Yellow
        Push-Location $DB_DIR
        docker-compose down
        Pop-Location
        Write-Host "✅ Database stopped!" -ForegroundColor Green
    }
    
    "reset" {
        Write-Host "⚠️  WARNING: This will DELETE all data!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            Write-Host "🗑️  Resetting database..." -ForegroundColor Yellow
            Push-Location $DB_DIR
            docker-compose down -v
            docker-compose up -d
            Pop-Location
            if (Wait-ForMySQL) {
                Write-Host "✅ Database reset complete!" -ForegroundColor Green
            }
        } else {
            Write-Host "Operation cancelled." -ForegroundColor Blue
        }
    }
    
    "status" {
        if (Test-ContainerRunning) {
            Write-Host "✅ MySQL container is running" -ForegroundColor Green
            Write-Host ""
            Write-Host "Connection info:" -ForegroundColor Blue
            Write-Host "  Host: localhost"
            Write-Host "  Port: 3307"
            Write-Host "  Database: $MYSQL_DATABASE"
            Write-Host "  User: $MYSQL_USER"
            Write-Host "  Password: $MYSQL_PASSWORD"
            Write-Host ""
            Write-Host "Connect with:" -ForegroundColor Blue
            Write-Host "  docker exec -it $CONTAINER_NAME mysql -u $MYSQL_USER -p'$MYSQL_PASSWORD' $MYSQL_DATABASE"
        } elseif (Test-ContainerExists) {
            Write-Host "⚠️  MySQL container exists but is not running" -ForegroundColor Yellow
            Write-Host "  Run: .\init-db.ps1 start"
        } else {
            Write-Host "❌ MySQL container does not exist" -ForegroundColor Red
            Write-Host "  Run: .\init-db.ps1 start"
        }
    }
    
    "logs" {
        docker logs -f $CONTAINER_NAME
    }
    
    "shell" {
        Write-Host "🔌 Connecting to MySQL..." -ForegroundColor Blue
        # Use -e to pass password as environment variable (avoids parsing issues)
        docker exec -it -e MYSQL_PWD=$MYSQL_PASSWORD $CONTAINER_NAME mysql -u $MYSQL_USER $MYSQL_DATABASE
    }
    
    "shell-root" {
        Write-Host "🔌 Connecting to MySQL as root..." -ForegroundColor Blue
        docker exec -it -e MYSQL_PWD=$MYSQL_ROOT_PASSWORD $CONTAINER_NAME mysql -u root
    }
    
    "seed" {
        Write-Host "🌱 Running seed data..." -ForegroundColor Yellow
        $seedFile = Join-Path $DB_DIR "init\02-seed-data.sql"
        Get-Content $seedFile | docker exec -i -e MYSQL_PWD=$MYSQL_PASSWORD $CONTAINER_NAME mysql -u $MYSQL_USER $MYSQL_DATABASE
        Write-Host "✅ Seed data inserted!" -ForegroundColor Green
    }
    
    "exec" {
        if (-not $Argument) {
            Write-Host "Usage: .\init-db.ps1 exec <sql-file>" -ForegroundColor Red
            exit 1
        }
        Write-Host "📄 Executing SQL file: $Argument" -ForegroundColor Yellow
        Get-Content $Argument | docker exec -i -e MYSQL_PWD=$MYSQL_PASSWORD $CONTAINER_NAME mysql -u $MYSQL_USER $MYSQL_DATABASE
        Write-Host "✅ SQL executed!" -ForegroundColor Green
    }
    
    default {
        Write-Host "Usage: .\init-db.ps1 <command>" -ForegroundColor Blue
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor Blue
        Write-Host "  start       Start the MySQL container"
        Write-Host "  stop        Stop the MySQL container"
        Write-Host "  reset       Delete all data and restart (DESTRUCTIVE!)"
        Write-Host "  status      Check container status and connection info"
        Write-Host "  logs        View container logs (follow mode)"
        Write-Host "  shell       Connect to MySQL as aizesk user"
        Write-Host "  shell-root  Connect to MySQL as root user"
        Write-Host "  seed        Re-run seed data script"
        Write-Host "  exec <file> Execute a SQL file"
        Write-Host ""
        Write-Host "Quick start:" -ForegroundColor Blue
        Write-Host "  cd database"
        Write-Host "  .\scripts\init-db.ps1 start"
    }
}
