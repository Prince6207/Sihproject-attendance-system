@echo off
echo Starting Express Backend and FastAPI servers...

echo.
echo Starting Express Backend on port 5000...
start "Express Backend" cmd /k "cd Backend && npm start"

echo.
echo Waiting 3 seconds for Express to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting FastAPI Backend on port 8001...
start "FastAPI Backend" cmd /k "cd FaceAuth && python main.py"

echo.
echo Both servers are starting...
echo Express Backend: http://localhost:5000
echo FastAPI Backend: http://localhost:8001
echo.
echo Press any key to exit...
pause > nul
