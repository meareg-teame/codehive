# Railway Deployment (CodeHive)

This repo is multi-service. Deploy them as separate Railway services:

- Judge0 API + Judge0 worker: see `judge0/RAILWAY.md`
- Backend API (Express + Socket.IO)
- Yjs WebSocket server (`y-websocket`)
- Frontend (Vite build output) — recommended: Vercel/Netlify; Railway is possible with a small static server

## 1) Backend API (Express)

**Create a new Railway service**
- Source: GitHub repo
- Root directory: `backend`
- Builder: Nixpacks (Node)
- Start command: `npm start`
- Health check: `GET /health`

**Add Postgres**
- Add Railway Postgres plugin to the project
- Attach it to the backend service
- Railway will inject `DATABASE_URL`

**Backend environment variables (copy/paste)**

Set these in Railway → Service → Variables:

```env
NODE_ENV=production
DATABASE_SSL=true
SEQUELIZE_SYNC=false

# Required
JWT_SECRET=__CHANGE_ME__
FRONTEND_URL=https://__YOUR_FRONTEND_DOMAIN__
BACKEND_URL=https://__YOUR_BACKEND_DOMAIN__

# Judge0
JUDGE0_URL=https://__YOUR_JUDGE0_API_DOMAIN__
# Optional if you enable Judge0 auth
# JUDGE0_AUTH_TOKEN=
# JUDGE0_AUTH_USER=

# Optional resource limits (defaults exist)
CODE_RUNNER_CPU_TIME_LIMIT=5
CODE_RUNNER_WALL_TIME_LIMIT=10
CODE_RUNNER_MEMORY_LIMIT_KB=512000
```

Notes:
- `FRONTEND_URL` is used for CORS allowlist.
- `BACKEND_URL` is used to decide cookie settings (secure/sameSite).

First deploy tip:
- If this is a brand-new empty Postgres database, temporarily set `SEQUELIZE_SYNC=true` for the first successful boot to auto-create tables, then flip it back to `false`.

## 2) Yjs WebSocket server

**Create a new Railway service**
- Root directory: `yjs-server`
- Builder: Nixpacks (Node)
- Start command: `npm start`

The existing script already binds to `0.0.0.0` and uses Railway’s `PORT`.

## 3) Frontend (Vite)

Recommended: deploy `frontend/` on Vercel/Netlify.

If deploying on Railway, you’ll need to serve the built `dist/` directory (e.g. using `serve` or an nginx container).

Frontend environment variables:

```env
VITE_BACKEND_URL=https://__YOUR_BACKEND_DOMAIN__
VITE_YWS_URL=wss://__YOUR_YJS_DOMAIN__
```

## 4) Final wiring checklist

- Backend `FRONTEND_URL` matches the deployed frontend domain exactly.
- Frontend `VITE_BACKEND_URL` points at the backend service.
- Frontend `VITE_YWS_URL` points at the yjs service (use `wss://` in production).
- Backend `JUDGE0_URL` points at the Judge0 API service.
