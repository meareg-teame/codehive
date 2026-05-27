#!/bin/bash

# Start Frontend Dev Server
echo "🚀 Starting CodeCollab Frontend..."
cd /home/meareg/code-collab/CodeHive/frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🌟 Starting frontend dev server on http://localhost:5173"
npm run dev
