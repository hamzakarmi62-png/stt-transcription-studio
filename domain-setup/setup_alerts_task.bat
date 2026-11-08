@echo off
REM One-click setup: registers a Windows task that starts the AudStudio
REM storage-alert listener at every logon (hidden). Desktop toasts appear
REM whenever the server sends a storage alert (75% / 90% / full disk / cloud
REM write failure). Run this file once (double-click). To remove later:
REM   schtasks /Delete /TN "AudAlerts" /F

schtasks /Create /TN "AudAlerts" /TR "wscript.exe \"C:\Users\dell\Desktop\hamza karmi\domain-setup\aud_alerts.vbs\"" /SC ONLOGON /F
if %errorlevel%==0 (
  schtasks /Run /TN "AudAlerts"
  echo.
  echo [OK] Alert listener task created and started. Desktop toasts are live.
  echo      Test: send anything to ntfy.sh/audstudio-storage-NdZDPqsrQtgZ00
) else (
  echo.
  echo [ERROR] Could not create the task. Try running this file as Administrator.
)
pause
