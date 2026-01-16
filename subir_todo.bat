@echo off
echo ========================================================
echo   INICIANDO SUBIDA MASIVA A GITHUB ORGANIZATION: Aizesk
echo   Usuario: alberto2606
echo ========================================================
echo.

:: --- CONFIGURACION DE BACKEND ---
cd backend

:: Definimos una funcion simple para no repetir codigo
call :subir_repo "auth-service"
call :subir_repo "user-service"
call :subir_repo "transaction-service"
call :subir_repo "reporting-service"
call :subir_repo "subscription-service"
call :subir_repo "platform-connection-service"
call :subir_repo "notification-service"
call :subir_repo "admin-service"

cd ..

:: --- CONFIGURACION DE FRONTEND ---
echo.
echo --------------------------------------------------------
echo   Procesando Frontend: webapp
echo --------------------------------------------------------
cd webapp
git init
git branch -M main
git remote add origin https://github.com/Aizesk/webapp.git
:: Si ya existia el remote, lo actualizamos por si acaso
git remote set-url origin https://github.com/Aizesk/webapp.git
git add .
git commit -m "feat: connect angular frontend to real backend microservices"
:: Intentamos bajar cambios remotos por si el repo no estaba vacio (README, License)
git pull origin main --allow-unrelated-histories
git push -u origin main
cd ..

echo.
echo ========================================================
echo   PROCESO COMPLETADO
echo ========================================================
pause
exit /b

:: --- FUNCION PARA SUBIR CADA SERVICIO ---
:subir_repo
echo.
echo --------------------------------------------------------
echo   Procesando Servicio: %~1
echo --------------------------------------------------------
cd %~1
git init
git branch -M main
git remote add origin https://github.com/Aizesk/%~1.git
:: Aseguramos que la URL sea la correcta si ya existia
git remote set-url origin https://github.com/Aizesk/%~1.git
git add .
git commit -m "feat: implementation of %~1 for TFM with Java 25"
:: Prevenimos error si el repo en GitHub ya tiene un README/License
git pull origin main --allow-unrelated-histories
git push -u origin main
cd ..
exit /b