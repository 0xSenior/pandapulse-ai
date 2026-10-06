@echo off
title PandaPulse AI Launcher
echo ============================================================
echo          Launching PandaPulse AI (Backend + Frontend)
echo ============================================================
echo.

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "PandaPulse AI - Backend Server" cmd /k "cd /d "%~dp0backend" && venv\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start "PandaPulse AI - Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ============================================================
echo Both servers are starting up!
echo Opening browser at http://localhost:5173 in 3 seconds...
echo ============================================================
timeout /t 3 /nobreak >nul
start http://localhost:5173
