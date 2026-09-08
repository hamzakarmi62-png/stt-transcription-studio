@echo off
chcp 65001 > nul
echo ===================================================
echo   تشغيل وبث موقع التفريغ الصوتي أونلاين على الإنترنت
echo ===================================================
cd /d "C:\Users\dell\Desktop\hamza karmi"
backend\.venv\Scripts\python.exe online_server.py
pause
