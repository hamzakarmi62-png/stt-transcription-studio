@echo off
curl -s -o %TEMP%\aud_ping1.txt https://audstudio.onrender.com/api/health
curl -s -o %TEMP%\aud_ping2.txt https://stt-transcription-studio.onrender.com/api/health
