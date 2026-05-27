#!/bin/bash

# Start Backend Server
echo "🚀 Starting CodeCollab Backend..."
cd /home/meareg/code-collab/CodeHive/backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🌟 Starting backend server on http://localhost:8080"
npm start
