#!/bin/bash

echo "Starting Express Backend and FastAPI servers..."

echo ""
echo "Starting Express Backend on port 5000..."
cd Backend && npm start &
EXPRESS_PID=$!

echo ""
echo "Starting FastAPI Backend on port 8001..."
cd ../FaceAuth && python main.py &
FASTAPI_PID=$!

echo ""
echo "Starting React Frontend on port 3000..."
cd ../attendance-system && npm run dev &
REACT_PID=$!

echo ""
echo "All servers are starting..."
echo "Express Backend: http://localhost:5000"
echo "FastAPI Backend: http://localhost:8001"
echo "React Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup processes on exit
cleanup() {
    echo "Stopping all servers..."
    kill $EXPRESS_PID $FASTAPI_PID $REACT_PID 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for all background processes
wait
