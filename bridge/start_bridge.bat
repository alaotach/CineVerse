@echo off
echo Checking backend connection...
curl -s -o nul -w "%%{http_code}" http://localhost:8080/api/status >temp.txt
set /p status=<temp.txt
del temp.txt

if "%status%"=="200" (
    echo Backend connection successful. Starting bridge...
    python app.py
) else (
    echo Backend connection failed with status %status%.
    echo Please make sure the C++ backend is running at http://localhost:8080/api
    echo You can start the backend first with: cd ..\backend ^& cinema_backend.exe --port=8080
    pause
)
