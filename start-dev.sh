#!/bin/bash

# CodeCollab Development Startup Script
# This script starts all necessary services for local development

echo "🚀 Starting CodeCollab Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null
then
    echo -e "${GREEN}✓${NC} MongoDB is running"
else
    echo -e "${YELLOW}⚠${NC}  MongoDB is not running. Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    echo "   or"
    echo "   mongod --dbpath /path/to/data"
    echo ""
fi

# Function to start a service
start_service() {
    local name=$1
    local dir=$2
    local cmd=$3
    local color=$4
    
    echo -e "${color}Starting $name...${NC}"
    cd "$dir" || exit
    
    # Run in background and capture PID
    eval "$cmd" &
    local PID=$!
    
    echo $PID > "/tmp/codecollab-${name,,}.pid"
    echo -e "${GREEN}✓${NC} $name started (PID: $PID)"
    echo ""
    
    cd - > /dev/null || exit
}

# Start Backend
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Starting Backend Services${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

start_service "Backend API" "/home/meareg/code-collab/CodeHive/backend" "npm start" "$BLUE"

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Starting Frontend${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""

start_service "Frontend" "/home/meareg/code-collab/CodeHive/frontend" "npm run dev" "$GREEN"

# Print summary
echo ""
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  🎉 CodeCollab is now running!${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""
echo "  Frontend:    http://localhost:5173"
echo "  Backend API: http://localhost:8080"
echo "  Health:      http://localhost:8080/health"
echo ""
echo "  Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    
    for service in frontend backend; do
        if [ -f "/tmp/codecollab-${service}.pid" ]; then
            PID=$(cat "/tmp/codecollab-${service}.pid")
            if kill -0 "$PID" 2>/dev/null; then
                kill "$PID" 2>/dev/null
                echo -e "  ${GREEN}✓${NC} Stopped $service"
            fi
            rm -f "/tmp/codecollab-${service}.pid"
        fi
    done
    
    echo -e "${GREEN}All services stopped${NC}"
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Wait for user interrupt
wait
