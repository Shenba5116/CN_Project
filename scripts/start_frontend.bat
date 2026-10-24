@echo off
echo ====================================================
echo Starting NetResQ React + Vite Frontend Dashboard...
echo URL: http://localhost:5173
echo ====================================================

cd /d "%~dp0\..\frontend"
npm run dev
pause
