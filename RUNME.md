# 🚀 CodeCollab - Quick Start Guide

## TL;DR - Run Everything with One Command

```bash
# 1. Install all dependencies (run once)
npm run install:all

# 2. Start all services
npm run dev
```

Then open http://localhost:5173 in your browser! 🎉

---

## 📋 Prerequisites

- **Node.js 18+** and **npm**
- **MongoDB** (local or Atlas)
- **Git**

### Check Prerequisites

```bash
node --version    # Should be v18+
npm --version     # Should be 8+
mongod --version  # MongoDB
```

---

## 🛠️ Installation & Setup

### Step 1: Install Dependencies

```bash
# Install all dependencies for root, backend, frontend, and yjs-server
npm run install:all
```

This will install:
- Root dependencies (concurrently)
- Backend dependencies (Express, Socket.IO, MongoDB, etc.)
- Frontend dependencies (React, Vite, Tailwind, etc.)
- Yjs server dependencies

### Step 2: Set Up Environment Variables

The environment files are already created with default values:

**Backend** (`backend/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/codecollab
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
YWS_URL=ws://localhost:10000
ROOM_MAX_PARTICIPANTS=6
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_BACKEND_URL=http://localhost:8080
VITE_YWS_URL=ws://localhost:10000
VITE_APP_ENV=development
```

### Step 3: Start MongoDB

If MongoDB is not running, start it:

```bash
# Create data directory if it doesn't exist
mkdir -p data

# Start MongoDB
mongod --dbpath ./data
```

Or if you have MongoDB installed as a service:

```bash
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

---

## 🚀 Running the Application

### Option 1: Start All Services at Once (Recommended)

```bash
npm run dev
```

This will start:
- Backend API (http://localhost:8080)
- Yjs WebSocket Server (ws://localhost:10000)
- Frontend Dev Server (http://localhost:5173)

### Option 2: Start Services Individually

Open 4 separate terminals:

**Terminal 1 - MongoDB** (if not running as service):
```bash
mongod --dbpath ./data
```

**Terminal 2 - Backend**:
```bash
npm run dev:backend
```

**Terminal 3 - Yjs Server**:
```bash
npm run dev:yjs
```

**Terminal 4 - Frontend**:
```bash
npm run dev:frontend
```

---

## 🌐 Access the Application

Once all services are running:

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8080 |
| **Health Check** | http://localhost:8080/health |
| **Yjs WebSocket** | ws://localhost:10000 |

---

## 🛠️ Troubleshooting

### MongoDB Connection Issues

**Error**: `MongoNetworkError: failed to connect to server`

**Solution**:
```bash
# Check if MongoDB is running
pgrep mongod

# Start MongoDB if not running
mongod --dbpath ./data

# Or start as service
sudo systemctl start mongod
```

### Port Already in Use

**Error**: `EADDRINUSE: Address already in use :::8080`

**Solution**:
```bash
# Find and kill process using port 8080
lsof -ti:8080 | xargs kill -9

# Or use different port
PORT=3000 npm start
```

### Node Modules Issues

**Error**: `Cannot find module 'xxx'`

**Solution**:
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm run install:all
```

### CORS Errors

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: Check that `FRONTEND_URL` in backend `.env` matches the actual frontend URL.

---

## 📚 Additional Scripts

```bash
# Install all dependencies
npm run install:all

# Start all services
npm run dev

# Start individual services
npm run dev:backend
npm run dev:yjs
npm run dev:frontend

# Build frontend for production
cd frontend && npm run build
```

---

## 🎓 Next Steps

1. **Create an account** - Sign up on the landing page
2. **Create a project** - Start a new collaborative coding session
3. **Invite team members** - Share your project with others
4. **Start collaborating** - Edit code in real-time with video conferencing!

---

## 🆘 Need Help?

- Check the [Troubleshooting](#-troubleshooting) section
- Review the [README.md](README.md) for detailed documentation
- Open an issue on GitHub

---

**Happy Coding! 🚀**
