# =====================================================
# AIZESK Platform - Start All Microservices Script
# PowerShell version for Windows
# =====================================================

param(
    [Parameter(Position=0)]
    [string]$Command,
    [switch]$SkipBuild,
    [switch]$Parallel
)

# Configuration - Microservices directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$WEBAPP_DIR = Resolve-Path (Join-Path $SCRIPT_DIR "..\..")
$BACKEND_DIR = Resolve-Path (Join-Path $SCRIPT_DIR "..\..\..\..\backend")

# List of microservices in recommended startup order (by port)
$SERVICES = @(
    "transaction-service",
    "reporting-service",
    "auth-service",
    "user-service",
    "subscription-service",
    "platform-connection-service",
    "notification-service"
)

# Service ports (confirmed from ServiceRegistrationConfig.java and environment.ts)
$SERVICE_PORTS = @{
    "transaction-service" = 8080
    "reporting-service" = 8081
    "auth-service" = 8082
    "user-service" = 8083
    "subscription-service" = 8084
    "platform-connection-service" = 8085
    "notification-service" = 8086
}

function Write-Header {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "   AIZESK Platform - Microservices Launcher     " -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-ServiceStatus($ServiceName, $Status, $Color) {
    Write-Host "  [$Status] " -ForegroundColor $Color -NoNewline
    Write-Host "$ServiceName"
}

function Test-JavaInstalled {
    try {
        $javaVersion = java -version 2>&1 | Select-String "version"
        if ($javaVersion) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Test-MavenInstalled {
    try {
        $mvnVersion = mvn -version 2>&1 | Select-String "Apache Maven"
        if ($mvnVersion) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Start-Service {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [bool]$SkipBuild
    )
    
    $port = $SERVICE_PORTS[$ServiceName]
    Write-Host ""
    Write-Host "Starting $ServiceName on port $port..." -ForegroundColor Yellow
    
    if (-not (Test-Path $ServicePath)) {
        Write-Host "  [ERROR] Service directory not found: $ServicePath" -ForegroundColor Red
        return $false
    }
    
    Push-Location $ServicePath
    
    try {
        if ($SkipBuild) {
            $mvnCommand = "mvn spring-boot:run -DskipTests"
        } else {
            $mvnCommand = "mvn clean spring-boot:run -DskipTests"
        }
        
        # Start the service in a new window
        Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "title $ServiceName && cd /d `"$ServicePath`" && $mvnCommand" -WindowStyle Normal
        
        Write-ServiceStatus $ServiceName "STARTED" "Green"
        return $true
    } catch {
        Write-ServiceStatus $ServiceName "FAILED" "Red"
        Write-Host "  Error: $_" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

function Stop-AllServices {
    Write-Host ""
    Write-Host "Stopping all AIZESK microservices..." -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($service in $SERVICES) {
        $port = $SERVICE_PORTS[$service]
        Write-Host "Checking port $port for $service..." -ForegroundColor Gray
        
        # Find process using the port
        $netstatOutput = netstat -ano | Select-String ":$port\s+.*LISTENING"
        if ($netstatOutput) {
            $pid = ($netstatOutput -split '\s+')[-1]
            if ($pid -and $pid -ne "0") {
                try {
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Write-ServiceStatus $service "STOPPED" "Yellow"
                } catch {
                    Write-Host "  Could not stop process $pid for $service" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "  $service is not running" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "All services stopped." -ForegroundColor Green
}

function Get-ServicesStatus {
    Write-Host ""
    Write-Host "Checking services status..." -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($service in $SERVICES) {
        $port = $SERVICE_PORTS[$service]
        $netstatOutput = netstat -ano | Select-String ":$port\s+.*LISTENING"
        
        if ($netstatOutput) {
            Write-ServiceStatus "$service (port $port)" "RUNNING" "Green"
        } else {
            Write-ServiceStatus "$service (port $port)" "STOPPED" "Red"
        }
    }
    Write-Host ""
}

function Start-AllServices {
    param([bool]$SkipBuild)
    
    Write-Host "Starting all AIZESK microservices + frontend..." -ForegroundColor Yellow
    Write-Host "Backend directory: $BACKEND_DIR" -ForegroundColor Gray
    Write-Host "Webapp directory: $WEBAPP_DIR" -ForegroundColor Gray
    Write-Host ""
    
    if (-not $SkipBuild) {
        Write-Host "Note: Each service will be built before starting." -ForegroundColor Gray
        Write-Host "Use -SkipBuild flag to skip the build step." -ForegroundColor Gray
    }
    
    $startedCount = 0
    $failedCount = 0
    
    foreach ($service in $SERVICES) {
        $servicePath = Join-Path $BACKEND_DIR $service
        
        if (Start-Service -ServiceName $service -ServicePath $servicePath -SkipBuild $SkipBuild) {
            $startedCount++
        } else {
            $failedCount++
        }
        
        # Small delay between service starts to avoid resource contention
        Start-Sleep -Seconds 2
    }
    
    # Start Angular frontend
    Write-Host ""
    Write-Host "Starting Angular webapp on port 4200..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "title webapp - Angular && cd /d `"$WEBAPP_DIR`" && npm start" -WindowStyle Normal
    Write-ServiceStatus "webapp (port 4200)" "STARTED" "Green"
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "  Summary: $startedCount MS + 1 webapp started, $failedCount failed" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Services are starting in separate windows." -ForegroundColor Yellow
    Write-Host "Wait a few moments for all services to be ready." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Use './start-all-services.ps1 status' to check service status." -ForegroundColor Gray
    Write-Host "Use './start-all-services.ps1 stop' to stop all services." -ForegroundColor Gray
}

function Show-Help {
    Write-Host ""
    Write-Host "Usage: ./start-all-services.ps1 [command] [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  start     Start all microservices (default)"
    Write-Host "  stop      Stop all running microservices"
    Write-Host "  status    Show status of all microservices"
    Write-Host "  help      Show this help message"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -SkipBuild    Skip Maven build step (faster startup)"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  ./start-all-services.ps1                  # Start all services with build"
    Write-Host "  ./start-all-services.ps1 start -SkipBuild # Start without building"
    Write-Host "  ./start-all-services.ps1 stop             # Stop all services"
    Write-Host "  ./start-all-services.ps1 status           # Check service status"
    Write-Host ""
    Write-Host "Service Ports:" -ForegroundColor Yellow
    foreach ($service in $SERVICES) {
        Write-Host "  $service : $($SERVICE_PORTS[$service])"
    }
    Write-Host ""
}

# =====================================================
# Main Script
# =====================================================

Write-Header

# Check prerequisites
if (-not (Test-JavaInstalled)) {
    Write-Host "[ERROR] Java is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Java 17 or higher" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-MavenInstalled)) {
    Write-Host "[ERROR] Maven is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Maven 3.6 or higher" -ForegroundColor Yellow
    exit 1
}

# Execute command
switch ($Command.ToLower()) {
    "stop" {
        Stop-AllServices
    }
    "status" {
        Get-ServicesStatus
    }
    "help" {
        Show-Help
    }
    default {
        Start-AllServices -SkipBuild $SkipBuild
    }
}
