@echo off
echo ====================================================
echo Starting NetResQ FastAPI Backend Engine...
echo Host: http://127.0.0.1:8000
echo Docs: http://127.0.0.1:8000/docs
echo ====================================================

cd /d "%~dp0\..\backend"
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
)
pause
