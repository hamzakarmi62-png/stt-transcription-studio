@echo off
chcp 65001 > nul
echo ===================================================
echo   تشغيل نظام التفريغ الصوتي (STT Studio)
echo ===================================================

echo [1/3] تشغيل السيرفر الخلفي (Backend - FastAPI)...
start "STT Backend" cmd /k "cd /d C:\Users\dell\Desktop\hamza karmi\backend && call .venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo [2/3] بناء وتجهيز الواجهة الأمامية...
cd /d C:\Users\dell\Desktop\hamza karmi\frontend
call npm run build

echo [3/3] تشغيل سيرفر الواجهة الأمامية وفتح المتصفح...
start "STT Frontend" cmd /k "cd /d C:\Users\dell\Desktop\hamza karmi\frontend && npm run preview -- --port 4173 --strictPort"

timeout /t 3 /nobreak > nul
start http://localhost:4173

echo ===================================================
echo تم التشغيل بنجاح!
echo رابط الموقع: http://localhost:4173
echo ===================================================
pause
