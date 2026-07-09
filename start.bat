@echo off
echo ==============================================
echo Starting YouTube Video Summarizer
echo ==============================================

:: Start Backend in a new window
echo Starting FastAPI Backend...
start "Backend Server" cmd /k "cd backend && call .venv\Scripts\activate.bat && uvicorn app.main:app --reload"

:: Start Frontend in a new window
echo Starting Next.js Frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers have been launched in separate windows!
echo Close the newly opened windows to stop the servers.
pause
