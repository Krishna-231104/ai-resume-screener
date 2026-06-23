@echo off
REM Pinecone Setup Script for Windows
REM This script helps you set up Pinecone for the AI Resume Screener

echo.
echo ============================================
echo AI Resume Screener - Pinecone Setup
echo ============================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo Creating .env from template...
    copy .env.example .env
    echo Created .env file
)

echo.
echo Setup Steps:
echo 1. Go to https://www.pinecone.io
echo 2. Sign up for free account
echo 3. Create index named 'candidates' with:
echo    - Dimension: 1536
echo    - Metric: cosine
echo    - Pod type: starter (free tier)
echo.
echo 4. Copy your API key from dashboard
echo.

setlocal enabledelayedexpansion
set /p response="Have you created Pinecone account and index? (y/n) "

if /i not "%response%"=="y" (
    echo Please complete the Pinecone setup first at https://www.pinecone.io
    exit /b 1
)

echo.
set /p PINECONE_API_KEY="Enter your Pinecone API Key: "
set /p PINECONE_ENV="Enter your Pinecone Environment (e.g., gcp-starter): "
set /p OPENAI_API_KEY="Enter your OpenAI API Key: "

REM Update .env file using PowerShell
powershell -Command ^
  "$env_content = Get-Content '.env' -Raw; " ^
  "$env_content = $env_content -replace 'PINECONE_API_KEY=.*', 'PINECONE_API_KEY=%PINECONE_API_KEY%'; " ^
  "$env_content = $env_content -replace 'PINECONE_ENVIRONMENT=.*', 'PINECONE_ENVIRONMENT=%PINECONE_ENV%'; " ^
  "$env_content = $env_content -replace 'OPENAI_API_KEY=.*', 'OPENAI_API_KEY=%OPENAI_API_KEY%'; " ^
  "Set-Content '.env' $env_content"

echo.
echo Updated .env file
echo.
echo Installing dependencies...
cd server
call npm install @pinecone-database/pinecone @langchain/pinecone
cd ..
echo Dependencies installed
echo.
echo ============================================
echo Pinecone setup complete!
echo ============================================
echo.
echo Next steps:
echo 1. Start server: npm run start or nodemon server.js
echo 2. Create some portfolios
echo 3. Sync to Pinecone: POST /api/chatbot/sync-portfolios
echo 4. Try chatbot: http://localhost:5173/chatbot
echo.
pause
