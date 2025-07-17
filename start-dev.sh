#!/bin/bash

echo "🚀 Starting backend..."
cd backend
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found."
    exit 1
fi
if ! lsof -i :6000 > /dev/null; then
    python3 app.py & 
    BACKEND_PID=$!
    echo "✅ Backend running at http://localhost:6000 (PID: $BACKEND_PID)"
else
    echo "⚠️ Port 6000 already in use. Skipping backend start."
fi
cd ..

echo "🚀 Starting frontend..."
cd frontend
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found."
    exit 1
fi
npm install
npm start &
FRONTEND_PID=$!
echo "✅ Frontend running at http://localhost:3000 (PID: $FRONTEND_PID)"
cd ..

echo "🟢 Both apps running. Press Ctrl+C to stop."

# Wait forever until killed
wait
