# CodeCollab - Real-Time Collaborative Code Editor with Video Conferencing

A full-featured, real-time collaborative code editor with integrated video conferencing, perfect for pair programming, code reviews, and team collaboration.

## 🚀 Features

### Core Features
- **Real-time Collaborative Editing** - Multiple users can edit code simultaneously using Yjs CRDT
- **Video Conferencing** - WebRTC-powered video calls with up to 6 participants
- **Code Execution** - Run code in multiple languages (JavaScript, Python, C++, Java)
- **AI Error Analysis** - Get intelligent error explanations using Perplexity AI

### Collaboration Features
- **Colored Cursor Overlays** - See where other users are editing
- **Activity Heatmap** - Visual indicator of recently edited lines
- **Session State Tracking** - Real-time sync status indicator
- **Team Management** - Invite members, manage roles, generate invite links

### Analytics & Management
- **Personal Analytics** - Track coding sessions, time spent, executions
- **Project Analytics** - Language distribution, member contributions
- **Team Management** - Role-based access control (Owner, Admin, Member, Guest)
- **Session History** - Track all collaboration sessions

## 🏗️ Architecture

```
CodeCollab/
├── frontend/           # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   └── lib/        # Utilities
├── backend/            # Node.js + Express
│   ├── routes/         # API routes
│   ├── middleware/     # Auth & role middleware
│   ├── models/         # MongoDB schemas
│   └── controllers/    # Route handlers
└── yjs-server/         # Yjs WebSocket server
```

### Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, ShadCN UI, Monaco Editor
- **Backend**: Node.js, Express, Socket.IO, MongoDB
- **Real-time**: Yjs (CRDT), WebRTC (Simple-Peer)
- **Auth**: Firebase Auth + JWT
- **Charts**: Recharts

### Code Execution Setup (Judge0)

CodeHive uses a self-hosted Judge0 instance for code execution. 

1. **Start Judge0 using Docker Compose**
```bash
docker compose -f docker-compose.judge0.yml up -d
```

2. **Verify Judge0 is running**
Open `http://localhost:2358/languages` in your browser. You should see a list of supported languages.

3. **Configure Backend**
Ensure `backend/.env` contains:
```env
JUDGE0_URL=http://localhost:2358
```

*Note: In development environments where cgroups v1 are not available, CodeHive uses a `mock_isolate.sh` script to bypass sandboxing requirements. This is already configured in the provided `docker-compose.judge0.yml`.*

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CodeCollab
```

2. **Install dependencies**
```bash
# Install all dependencies (root, backend, frontend, yjs-server)
npm run install:all
```

3. **Set up environment variables**

Create `.env` files:

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

4. **Start MongoDB** (if running locally)
```bash
mkdir -p data
mongod --dbpath ./data
```

5. **Start the application**

You have multiple options:

**Option A: Start all services at once**
```bash
npm run dev
```

**Option B: Start services individually**

Terminal 1 - Backend:
```bash
npm run dev:backend
```

Terminal 2 - Yjs Server:
```bash
npm run dev:yjs
```

Terminal 3 - Frontend:
```bash
npm run dev:frontend
```

### Access the Application

Once all services are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Yjs WebSocket**: ws://localhost:10000

## 📁 Project Structure

```
CodeCollab/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── authenticateToken.js # JWT auth middleware
│   │   └── requireRole.js     # RBAC middleware
│   ├── models/
│   │   ├── Account.js         # User model
│   │   ├── Project.js         # Project model
│   │   └── Session.js         # Session model
│   ├── routes/
│   │   ├── apiRoutes.js       # API routes
│   │   ├── authRoutes.js      # Auth routes
│   │   └── projectRoutes.js   # Project routes
│   ├── index.js               # Main server file
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── team/
│   │   │   │   └── TeamManagement.tsx
│   │   │   ├── ui/            # ShadCN components
│   │   │   ├── video/         # Video conferencing
│   │   │   ├── Analytics.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Editor.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── usePresence.ts
│   │   │   └── useWebRTC.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── .env
├── yjs-server/
│   ├── package.json
│   └── ...
├── package.json
├── start-dev.sh
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/codecollab` |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `YWS_URL` | Yjs WebSocket URL | `ws://localhost:10000` |
| `ROOM_MAX_PARTICIPANTS` | Max video call participants | `6` |

#### Frontend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:8080` |
| `VITE_YWS_URL` | Yjs WebSocket URL | `ws://localhost:10000` |

## 🧪 Testing

Run tests (when implemented):
```bash
npm test
```

## 📦 Deployment

### Production Build

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Set production environment variables

3. Start the backend:
```bash
cd backend
NODE_ENV=production npm start
```

### Docker Deployment

A Docker setup can be added for easier deployment:

```yaml
# docker-compose.yml (example)
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
  
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/codecollab
    depends_on:
      - mongodb
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Yjs](https://github.com/yjs/yjs) - CRDT framework for collaborative editing
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code's editor
- [Simple-Peer](https://github.com/feross/simple-peer) - WebRTC wrapper
- [Socket.IO](https://socket.io/) - Real-time bidirectional communication
- [ShadCN UI](https://ui.shadcn.com/) - UI component library

---

Made with ❤️ by the CodeCollab Team
