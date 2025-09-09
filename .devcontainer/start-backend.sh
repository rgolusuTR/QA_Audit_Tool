#!/bin/bash

# QA Audit Tool - Backend Startup Script for GitHub Codespaces
echo "🚀 Starting QA Audit Tool Backend in Codespaces..."

# Navigate to backend directory
cd backend

# Start the backend server in the background
echo "📊 Starting Python FastAPI backend server..."
python main.py &

# Store the process ID
BACKEND_PID=$!
echo "✅ Backend server started with PID: $BACKEND_PID"
echo "🌐 Backend will be available on port 8000"
echo "📖 API documentation will be available at /docs endpoint"

# Wait a moment for the server to start
sleep 3

# Check if the server is running
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server is running successfully!"
    echo "🔗 Backend API: http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo ""
    echo "🎯 The QA Audit Tool is now ready!"
    echo "   - Frontend: Available on GitHub Pages"
    echo "   - Backend: Running in this Codespace"
    echo "   - Port 8000 is configured for public access"
    echo ""
    echo "💡 Tip: The backend will automatically connect to the frontend"
else
    echo "❌ Failed to start backend server"
    exit 1
fi

# Keep the script running to maintain the background process
wait $BACKEND_PID
