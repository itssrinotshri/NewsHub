@echo off
echo 🎯 News Aggregator Frontend Startup
echo ====================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Navigate to frontend directory
cd frontend

REM Check if package.json exists
if not exist package.json (
    echo ❌ package.json not found in frontend directory
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Start the development server
echo 🚀 Starting React development server...
echo 📍 Application will be available at: http://localhost:3000
echo 🛑 Press Ctrl+C to stop the server
echo ----------------------------------------

call npm start

pause
