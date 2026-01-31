@echo off
setlocal EnableDelayedExpansion
REM =====================================================
REM AIZESK Platform - Start All Microservices Script
REM Batch version for Windows (double-click friendly)
REM =====================================================

title AIZESK - Microservices Launcher

echo.
echo ================================================
echo    AIZESK Platform - Microservices Launcher
echo ================================================
echo.

REM Configuration - Get the script directory and resolve backend path
set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%..\..\"
set "WEBAPP_DIR=%CD%"
popd
pushd "%SCRIPT_DIR%..\..\..\..\backend"
set "BACKEND_DIR=%CD%"
popd

echo Script directory: %SCRIPT_DIR%
echo Webapp directory: %WEBAPP_DIR%
echo Backend directory: %BACKEND_DIR%
echo.

REM Check if backend directory exists
if not exist "%BACKEND_DIR%" (
    echo [ERROR] Backend directory not found: %BACKEND_DIR%
    echo Please check the script path configuration.
    pause
    exit /b 1
)

REM Check if Java is available
java -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Java is not installed or not in PATH
    echo Please install Java 17 or higher
    pause
    exit /b 1
)
echo [OK] Java found

REM Check if Maven is available
call mvn -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Maven is not installed or not in PATH
    echo Please install Maven 3.6 or higher
    pause
    exit /b 1
)
echo [OK] Maven found
echo.

echo Starting all microservices...
echo Each service will open in a new window.
echo.

REM Start each microservice in a new window (ordered by port)
echo [1/8] Starting transaction-service (port 8080)...
start "transaction-service - 8080" cmd /k "cd /d "%BACKEND_DIR%\transaction-service" && mvn spring-boot:run -DskipTests"
timeout /t 3 /nobreak >nul

echo [2/8] Starting reporting-service (port 8081)...
start "reporting-service - 8081" cmd /k "cd /d "%BACKEND_DIR%\reporting-service" && mvn spring-boot:run -DskipTests"
timeout /t 3 /nobreak >nul

echo [3/8] Starting auth-service (port 8082)...
start "auth-service - 8082" cmd /k "cd /d "%BACKEND_DIR%\auth-service" && mvn spring-boot:run -DskipTests"
timeout /t 3 /nobreak >nul

echo [4/8] Starting user-service (port 8083)...
start "user-service - 8083" cmd /k "cd /d "%BACKEND_DIR%\user-service" && mvn spring-boot:run -DskipTests"
timeout /t 3 /nobreak >nul

echo [5/8] Starting subscription-service (port 8084)...
start "subscription-service - 8084" cmd /k "cd /d "%BACKEND_DIR%\subscription-service" && mvn spring-boot:run -DskipTests"
timeout /t 3 /nobreak >nul

echo [6/8] Starting platform-connection-service (port 8085)...
start "platform-connection-service - 8085" cmd /k "cd /d "%BACKEND_DIR%\platform-connection-service" && mvn spring-boot:run -DskipTests"
timeout /t 3 /nobreak >nul

echo [7/8] Starting notification-service (port 8086)...
start "notification-service - 8086" cmd /k "cd /d "%BACKEND_DIR%\notification-service" && mvn spring-boot:run -DskipTests"
timeout /t 3 /nobreak >nul

echo [8/8] Starting admin-service (port 8087)...
start "admin-service - 8087" cmd /k "cd /d "%BACKEND_DIR%\admin-service" && mvn spring-boot:run -DskipTests"
timeout /t 3 /nobreak >nul

echo [9/9] Starting Angular webapp (port 4200)...
start "webapp - Angular" cmd /k "cd /d "%WEBAPP_DIR%" && npm start"

echo.
echo ================================================
echo    All services are starting!
echo ================================================
echo.
echo Services will be available at:
echo   - transaction-service:         http://localhost:8080
echo   - reporting-service:           http://localhost:8081
echo   - auth-service:                http://localhost:8082
echo   - user-service:                http://localhost:8083
echo   - subscription-service:        http://localhost:8084
echo   - platform-connection-service: http://localhost:8085
echo   - notification-service:        http://localhost:8086
echo   - admin-service:               http://localhost:8087
echo   - Angular webapp:              http://localhost:4200
echo.
echo Wait a few moments for all services to start up.
echo Close this window when done, or press any key to exit.
echo.
pause
endlocal
