#!/bin/bash

echo "🎯 News Aggregator Frontend Startup"
echo "===================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version:"
node --version

# Navigate to frontend directory
cd frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in frontend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Start the development server
echo "🚀 Starting React development server..."
echo "📍 Application will be available at: http://localhost:3000"
echo "🛑 Press Ctrl+C to stop the server"
echo "----------------------------------------"

npm start
