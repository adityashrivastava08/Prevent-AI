@echo off
echo Starting PreventAI Health System...

:: Start Backend
echo Starting Backend API...
start powershell.exe -NoExit -Command "cd 'a:\ai health\ai health\model'; .\venv\Scripts\Activate.ps1; python web_app/app.py"

:: Start Frontend
echo Starting Frontend UI...
start powershell.exe -NoExit -Command "cd 'a:\ai health\ai health\frontend'; npm run dev"

echo.
echo ==========================================
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:5173
echo ==========================================
echo Keep the other two windows open while using the app.
pause
