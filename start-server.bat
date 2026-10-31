@echo off
title Gmail Meteor Cleaner - Local Server
echo.
echo  =============================================
echo   Gmail Meteor Cleaner - Local Dev Server
echo   Open: http://localhost:8000
echo  =============================================
echo.

rem ---- Try Python 3 first ----
python --version >nul 2>&1
if %errorlevel% == 0 (
  echo  [Python] Starting server on http://localhost:8000 ...
  echo  Press Ctrl+C to stop.
  echo.
  python -m http.server 8000
  goto end
)

rem ---- Fallback: npx http-server ----
echo  [Python not found] Falling back to npx http-server...
echo  Press Ctrl+C to stop.
echo.
npx -y http-server@latest . -p 8000 --cors -c-1

:end
pause
