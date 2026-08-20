@echo off
title AI Interview Simulator Backend Server
echo ========================================================
echo   Starting AI Interview Simulator Backend (Port 8000)
echo   Local:   http://localhost:8000
echo   Network: http://127.0.0.1:8000
echo ========================================================
cd /d "%~dp0"
call venv\Scripts\activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
