@echo off
echo 🔄 Rebooting JMarkets server...

echo Stopping existing processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM tsx.exe 2>nul

echo Stopping processes on ports 3001, 3002, 5000, 9000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3002" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":9000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

timeout /t 2 /nobreak >nul

echo Cleaning Vite caches...
if exist dashboard\node_modules\.vite rmdir /s /q dashboard\node_modules\.vite 2>nul
if exist dashboard\.vite rmdir /s /q dashboard\.vite 2>nul
if exist dashboard\dist rmdir /s /q dashboard\dist 2>nul
if exist landing-client\node_modules\.vite rmdir /s /q landing-client\node_modules\.vite 2>nul
if exist landing-client\.vite rmdir /s /q landing-client\.vite 2>nul
if exist landing-client\dist rmdir /s /q landing-client\dist 2>nul
if exist client\node_modules\.vite rmdir /s /q client\node_modules\.vite 2>nul
if exist client\.vite rmdir /s /q client\.vite 2>nul
if exist client\dist rmdir /s /q client\dist 2>nul
echo Caches cleared

if not exist logs mkdir logs

echo 🚀 Starting all services (server, landing, dashboard)...
start /B npm run dev:all > logs\server.log 2>&1

timeout /t 3 /nobreak >nul

echo ✅ All services started!
echo.
echo URLs:
echo   • API Server: http://localhost:5000
echo   • Landing: http://localhost:3001
echo   • Dashboard: http://localhost:3002
echo   • Store Port: http://localhost:9000
echo.
echo Logs:
echo   • All services: type logs\server.log
echo.
echo Commands:
echo   • Stop all: stop-server.bat
echo   • Restart: reboot-server.bat
