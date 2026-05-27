#!/bin/bash

# CodeCollab Quick Start Script
# This script sets up and starts all services for local development

set -e  # Exit on any error

echo "🚀 CodeCollab Quick Start"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to print status
print_status() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================
# CHECK PREREQUISITES
# ============================================

echo "📋 Checking prerequisites..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm $NPM_VERSION"
else
    print_error "npm is not installed. Please install Node.js (includes npm) from https://nodejs.org/"
    exit 1
fi

print_warning "Database is not auto-started by this script."
echo "   CodeHive backend expects Postgres via DATABASE_URL."
echo "   For local dev, set DATABASE_URL in backend/.env (or use a hosted Postgres)."

echo ""

# ============================================
# INSTALL DEPENDENCIES
# ============================================

echo "📥 Installing dependencies..."

# Check if node_modules exists in all directories
install_deps=false

if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    install_deps=true
elif [ ! -d "$SCRIPT_DIR/backend/node_modules" ]; then
    install_deps=true
elif [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    install_deps=true
elif [ ! -d "$SCRIPT_DIR/yjs-server/node_modules" ]; then
    install_deps=true
fi

if [ "$install_deps" = true ]; then
    print_status "Installing all dependencies..."
    npm run install:all
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
else
    print_success "Dependencies already installed"
fi

echo ""

# ============================================
# CHECK ENVIRONMENT FILES
# ============================================

echo "🔧 Checking environment files..."

# Check backend .env
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
    print_warning "Backend .env not found. Creating from default..."
    cat > "$SCRIPT_DIR/backend/.env" << EOF
# Postgres configuration (required)
# Example (local): DATABASE_URL=postgres://postgres:postgres@localhost:5432/codehive
DATABASE_URL=

# JWT Secret (change this to a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Judge0 (optional for code execution)
JUDGE0_URL=http://localhost:2358

# Yjs WebSocket URL (frontend uses VITE_YWS_URL)
YWS_URL=ws://localhost:10000

# Room Configuration
ROOM_MAX_PARTICIPANTS=6

# Node Environment
NODE_ENV=development

# Set to false if you don't want Sequelize auto-sync in dev
SEQUELIZE_SYNC=true
EOF
    print_success "Created backend/.env"
else
    print_success "Backend .env exists"
fi

# Check frontend .env
if [ ! -f "$SCRIPT_DIR/frontend/.env" ]; then
    print_warning "Frontend .env not found. Creating from default..."
    cat > "$SCRIPT_DIR/frontend/.env" << EOF
# Backend API URL
VITE_BACKEND_URL=http://localhost:8080

# Yjs WebSocket URL
VITE_YWS_URL=ws://localhost:10000

# App Environment
VITE_APP_ENV=development
EOF
    print_success "Created frontend/.env"
else
    print_success "Frontend .env exists"
fi

echo ""

# ============================================
# START SERVICES
# ============================================

echo "🚀 Starting services..."
echo "======================="
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    
    # Kill all node processes started by this script
    pkill -f "node.*backend/index.js" 2>/dev/null || true
    pkill -f "node.*yjs-server" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    echo -e "${GREEN}All services stopped${NC}"
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Check if concurrently is available
if ! command -v concurrently >/dev/null 2>&1; then
    print_error "concurrently not found. Installing..."
    npm install -g concurrently
fi

print_status "Starting all services with concurrently..."
echo ""

# Start all services using concurrently
concurrently --prefix "[{name}]" --prefix-colors "blue,green,yellow" --names "backend,yjs,frontend" \
    "cd backend && npm start" \
    "cd yjs-server && npm start" \
    "cd frontend && npm run dev"

# This line will only be reached if concurrently exits
print_error "Services stopped unexpectedly"
exit 1
