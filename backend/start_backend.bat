@echo off
echo Starting AI Interview Simulator Backend Server...
cd /d "%~dp0"
call venv\Scripts\activate
python main.py
pause
