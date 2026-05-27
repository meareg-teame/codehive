#!/bin/bash

# Start Yjs WebSocket Server
echo "🚀 Starting Yjs WebSocket Server..."
cd /home/meareg/code-collab/CodeHive/yjs-server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🌟 Starting Yjs server on ws://localhost:10000"
npm start
