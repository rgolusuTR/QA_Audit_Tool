@echo off
echo 🚀 QA Audit Tool - Railway Deployment Helper
echo =============================================

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not found. Initializing...
    git init
    git add .
    git commit -m "Initial commit for Railway deployment"
)

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Railway CLI not found. Please install it first:
    echo    npm install -g @railway/cli
    echo    or visit: https://docs.railway.app/develop/cli
    pause
    exit /b 1
)

echo ✅ Railway CLI found

REM Login to Railway
echo 🔐 Logging into Railway...
railway login

REM Create new project
echo 📦 Creating new Railway project...
railway init

REM Deploy the application
echo 🚀 Deploying to Railway...
railway up

echo ✅ Deployment initiated!
echo.
echo 📋 Next steps:
echo 1. Wait for deployment to complete (2-3 minutes)
echo 2. Get your Railway URL from the dashboard
echo 3. Update src/App.tsx with your Railway URL
echo 4. Test your endpoints:
echo    - Health: https://your-app.railway.app/api/health
echo    - Docs: https://your-app.railway.app/docs
echo.
echo 🎉 Your QA Audit Tool will now run 24/7!
pause
