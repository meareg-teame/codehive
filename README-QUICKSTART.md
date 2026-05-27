# CodeCollab - Quick Start Guide

Get your CodeCollab final year project running in minutes!

## 🚀 One-Command Start

Simply run:

```bash
./quick-start.sh
```

This will:
1. ✅ Check all prerequisites (Node.js, MongoDB)
2. ✅ Install dependencies if needed
3. ✅ Start MongoDB (if not running)
4. ✅ Start the backend server (port 8080)
5. ✅ Start the Yjs WebSocket server (port 10000)
6. ✅ Start the frontend dev server (port 5173)

Then open your browser to: **http://localhost:5173**

## 📋 Manual Steps (if quick-start doesn't work)

### 1. Start MongoDB
```bash
mkdir -p data
mongod --dbpath ./data
```

### 2. Start Backend
```bash
cd backend
npm start
```

### 3. Start Yjs Server
```bash
cd yjs-server
npm start
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
```

## 🔧 Troubleshooting

### "Port already in use"
Kill processes using the ports:
```bash
# Kill process on port 8080 (backend)
lsof -ti:8080 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Kill process on port 10000 (yjs)
lsof -ti:10000 | xargs kill -9
```

### "MongoDB connection failed"
Make sure MongoDB is running:
```bash
# Check if MongoDB is running
pgrep mongod

# Start MongoDB if not running
mkdir -p data && mongod --dbpath ./data
```

### "Module not found" errors
Reinstall dependencies:
```bash
npm run install:all
```

## 🌐 Access Points

Once running:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Main application |
| Backend API | http://localhost:8080 | REST API |
| Health Check | http://localhost:8080/health | API status |
| Yjs WebSocket | ws://localhost:10000 | Collaboration sync |

## 🎉 Your Final Year Project is Ready!

All features are implemented:
- ✅ Real-time collaborative editing
- ✅ WebRTC video conferencing (up to 6 users)
- ✅ User presence with colored cursors
- ✅ Session state tracking
- ✅ JWT authentication with RBAC
- ✅ Analytics dashboard with charts
- ✅ Team management with invite links

**Good luck with your presentation! 🚀🎓**
