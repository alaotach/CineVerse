#!/bin/bash

# Start the C++ backend
echo "Starting C++ backend..."
cd backend
./bin/cinema_backend &
CPP_PID=$!
echo "C++ backend started with PID $CPP_PID"

# Wait for C++ backend to initialize
sleep 2

# Start the Python bridge
echo "Starting Python bridge..."
cd ../bridge
python app.py &
PYTHON_PID=$!
echo "Python bridge started with PID $PYTHON_PID"

# Function to handle shutdown
function cleanup {
  echo "Shutting down..."
  
  # Kill processes
  echo "Stopping Python bridge..."
  kill $PYTHON_PID
  
  echo "Stopping C++ backend..."
  kill $CPP_PID
  
  echo "All processes stopped"
  exit 0
}

# Register cleanup handler for SIGINT (Ctrl+C)
trap cleanup SIGINT

# Keep script running
echo "All services are running. Press Ctrl+C to stop."
wait
