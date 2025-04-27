:: filepath: c:\Users\nobit\Downloads\cookmyshow\start-system.bat
@echo off
echo ===== Starting CookMyShow System =====

:: Start the Python Flask backend
echo Starting Flask backend on port 8080...
start "Flask Backend" cmd /c "cd backend && python app.py --port=8080"

:: Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 3 > nul

:: Start Python bridge
echo Starting Python bridge on port 5000...
start "Python Bridge" cmd /c "cd bridge && python app.py"

:: Wait for bridge to initialize
echo Waiting for bridge to initialize...
timeout /t 2 > nul

:: Start frontend development server
echo Starting frontend development server on port 5173...
start "Frontend" cmd /c "cd project && npm run dev"

:: Provide instructions
echo.
echo ===== CookMyShow System Started =====
echo Flask Backend: http://localhost:8080/api
echo Python Bridge: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo To stop the system, close the terminal windows or press Ctrl+C
echo in each terminal window.
echo.
echo Press any key to open the application in your browser...
pause > nul

:: Open the frontend in the browser
start http://localhost:5173