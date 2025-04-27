@echo off
echo ===== Starting CookMyShow System =====

:: Start the C++ Backend
echo Starting C++ Backend on port 8080...
start "C++ Backend" cmd /c "cd backend && python app.py"

:: Wait for the backend to initialize
timeout /t 5 > nul

@REM :: Start the Python Bridge
@REM echo Starting Python Bridge on port 5000...
@REM start "Python Bridge" cmd /c "cd bridge && python app.py"

@REM :: Wait for the bridge to initialize
@REM timeout /t 5 > nul

:: Start the React Frontend
echo Starting React Frontend on port 5173...
start "React Frontend" cmd /c "cd project && npm run dev"

echo ===== CookMyShow System Started =====
echo C++ Backend: http://localhost:8080/api
@REM echo Python Bridge: http://localhost:5000
echo React Frontend: http://localhost:5173
pause