@echo off
echo Starting Express Backend and FastAPI servers...

echo.
echo Starting Express Backend on port 5000...
start "Express Backend" cmd /k "cd Backend && npm start"

echo.
echo Starting FastAPI Backend on port 8001...
start "FastAPI Backend" cmd /k "cd FaceAuth && python main.py"

echo.
echo Starting React Frontend on port 3000...
start "React Frontend" cmd /k "cd attendance-system && npm run dev"

echo.
echo All servers are starting...
echo Express Backend: http://localhost:5000
echo FastAPI Backend: http://localhost:8001
echo React Frontend: http://localhost:3000
echo.
pause
