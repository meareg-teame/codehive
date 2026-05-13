---
name: codehive-project-context
description: >
  Use this skill file whenever working on the CodeHive / CodeCollab project.
  It contains the full project context, architecture, existing stack, what is
  already built, what needs to be built, naming conventions, and all design
  decisions. Read this before writing a single line of code.
---

# CodeHive → CodeCollab: Project Skill File

## What This Project Is

CodeHive is a **web-based real-time collaborative code editor** that is being
upgraded into a final-year university project called **CodeCollab**. The upgrade
adds **WebRTC peer-to-peer video conferencing**, persistent project storage,
role-based access control, cursor presence UI, analytics, and team management
on top of the existing working codebase.

The academic requirements document (RAD) is titled:
**"CodeCollab: Real-Time Collaborative Code Editor with Video Conferencing"**
submitted to Bahir Dar Institute of Technology, Faculty of Computing.

---

## Current Tech Stack (Do NOT Change Core Choices)

### Frontend
- **React.js** (component-based SPA)
- **ShadCN** (UI component library — use it for ALL new UI components)
- **Monaco Editor** (VS Code-like editing — already integrated, do not replace)
- **Tailwind CSS** (via ShadCN — use utility classes throughout)

### Backend
- **Node.js** + **Express.js** (keep this — do NOT rewrite in FastAPI/Python)
- **Socket.IO** (real-time bidirectional events — already used for editor sync)
- **Piston API** (code execution engine — already integrated)
- **Perplexity API** (AI error analysis — valid till Aug 2026, keep it)

### Real-Time Collaboration
- **Yjs** (CRDT-based collaboration engine — already integrated, superior to OT)
- **y-websocket** (Yjs WebSocket provider — already integrated)

### Authentication
- **Firebase Google OAuth** (already working)
- **JWT** (needs to be added as a layer on top of Firebase for RBAC)

### Database
- **MongoDB** (already set up — extend schemas, do not replace)

### NEW: Video Conferencing (To Be Built)
- **simple-peer** OR **mediasoup** for WebRTC
- Signaling runs over the **existing Socket.IO server** — do NOT create a
  separate signaling server
- STUN servers: use Google's free public STUN (stun:stun.l.google.com:19302)

---

## What Is Already Built (Do NOT Rebuild These)

1. **Dashboard UI** — project list, create/join room, user profile
2. **Monaco Code Editor** — syntax highlighting, themes, multi-language
3. **Real-time collaborative editing** — Yjs CRDT syncing across users
4. **Code execution** — run Java, C++, Python, JavaScript via Piston API
5. **AI error analysis** — send errors to Perplexity API, display suggestions
6. **Google OAuth login** — Firebase-based, users can sign in with Google

---

## What Needs To Be Built (Prioritized)

### PHASE 1 — WebRTC Video Conferencing [HIGHEST PRIORITY]
This is the core academic contribution. Without it the project is incomplete.

**Components to build:**
- `VideoConferencePanel` — right sidebar panel rendering all video tiles
- `VideoTile` — individual participant video component with:
  - Name tag overlay
  - Active speaker highlight (Electric Blue border when speaking)
  - Connection quality indicator (signal strength icon from WebRTC stats)
  - Mute/unmute overlay icon
- `MediaControlBar` — bottom toolbar with:
  - Microphone toggle (red slash icon when muted)
  - Camera toggle
  - Screen share button
  - Leave call button
- `useWebRTC` — custom React hook managing:
  - `getUserMedia()` for camera/mic access
  - WebRTC offer/answer/ICE exchange via Socket.IO
  - Peer connection lifecycle (create, update, close)
  - Fallback to audio-only if camera permission denied
- Socket.IO events to add on the server:
  - `webrtc:offer` — relay offer to target peer
  - `webrtc:answer` — relay answer back
  - `webrtc:ice-candidate` — relay ICE candidates
  - `webrtc:user-joined-call` — broadcast to room
  - `webrtc:user-left-call` — broadcast to room

**Business rule:** Maximum 6 concurrent video streams per room (BR-02).

**UI design:** Floating rounded thumbnail grid in the right sidebar.
Active speaker gets an Electric Blue (#3B82F6) border.
Thumbnails are draggable between sidebar-pinned and floating-overlay modes.

---

### PHASE 2 — Cursor Presence UI
Yjs already tracks cursor positions. Surface them visually.

**Components to build:**
- `CursorOverlay` — renders colored cursor markers over Monaco Editor
- Each user gets a unique color from a predefined palette:
  `['#10B981', '#F97316', '#8B5CF6', '#EF4444', '#06B6D4', '#F59E0B']`
- Floating name tag attached to each cursor, fades after 3s of inactivity
- **Activity heatmap** — line gutter shows color-coded dots for recently
  edited lines, attributed to the user who edited them
- **Status bar** at the bottom of the editor showing:
  - Current language (e.g., "Python")
  - Active collaborator count (e.g., "3 online")
  - Sync status icon: "● Synced" (green) or "⟳ Syncing..." (yellow)

**Session State Machine** (server-side):
```
Initialized → Waiting → Active → Synchronizing → Terminated
```
Track this per room in MongoDB. Emit `room:state-change` events via Socket.IO.

---

### PHASE 3 — Persistent Storage + RBAC

**MongoDB Schema additions:**
```
User       { _id, firebaseUID, email, displayName, role, createdAt }
Project    { _id, name, ownerId, members[], language, createdAt, updatedAt }
Session    { _id, projectId, roomCode, state, participants[], startedAt, endedAt }
CodeDocument { _id, projectId, content, language, lastEditedBy, updatedAt }
```

**RBAC Roles (3 tiers):**
- `admin` — full system access, manage all users/projects
- `user` — create/join projects, edit code, use video
- `guest` — read-only view of shared session, can join video call if invited

**JWT layer:**
- After Firebase Google OAuth succeeds, generate a signed JWT on the backend
  containing `{ userId, email, role }`
- All API routes use an `authenticateToken` middleware that verifies the JWT
- Role-specific middleware: `requireRole('admin')`, `requireRole('user')`

---

### PHASE 4 — Analytics Module

**Metrics to track and display:**
- Per-session: duration, number of participants, lines of code written,
  languages used, number of code executions run
- Per-user: total sessions joined, code contribution (characters typed),
  most used language
- Per-project: total sessions, active members, last active timestamp

**UI:** A simple analytics dashboard page with:
- Bar chart (sessions over time)
- Pie chart (language distribution)
- Contribution leaderboard (characters typed per user in session)
Use **Recharts** for all charts (already a common React chart library).

---

### PHASE 5 — Team Management

**UI features:**
- Project settings page → "Team" tab
- List all project members with their role badges
- Owner can: invite by email, remove members, change roles
- Invitation sends a shareable join link (not email SMTP — just a link)
- Guest users can be "promoted" to full user by the owner

---

## Architecture Rules (Never Violate These)

1. **Do NOT create a separate backend service** for WebRTC signaling.
   Extend the existing Socket.IO server. One server only.

2. **Do NOT replace Yjs with Socket.IO for code sync.**
   Yjs CRDT is already running and is superior. Keep them doing their jobs:
   - Yjs = code document sync
   - Socket.IO = signaling, presence events, room state, WebRTC relay

3. **Do NOT install mediasoup or Agora** unless the user explicitly asks.
   Use `simple-peer` (wraps native WebRTC, works well with Socket.IO).
   It's lightweight and sufficient for ≤6 participants per room.

4. **Every new UI component uses ShadCN + Tailwind.** No plain CSS files for
   new components. Match the existing visual style of the project.

5. **MongoDB only.** Do not introduce Redis, SQL, or any other database.
   Use MongoDB for session state too (not in-memory only).

6. **Environment variables** go in `.env` and are referenced via `process.env`.
   Never hardcode secrets, API keys, or Firebase config in source files.

---

## File Structure Convention

```
/client
  /src
    /components
      /editor          ← Monaco editor + cursor overlays
      /video           ← All WebRTC video components (NEW)
      /dashboard       ← Dashboard, room list
      /analytics       ← Charts and metrics (NEW)
      /team            ← Team management UI (NEW)
      /ui              ← ShadCN auto-generated components
    /hooks
      useWebRTC.js     ← WebRTC logic hook (NEW)
      useRoom.js       ← Room join/leave/state
      usePresence.js   ← Cursor & participant presence
    /pages
      Dashboard.jsx
      Editor.jsx
      Analytics.jsx    ← (NEW)
      Settings.jsx     ← (NEW)
    /context
      AuthContext.jsx  ← Firebase + JWT combined auth state
      RoomContext.jsx
    /lib
      socket.js        ← Socket.IO client singleton
      api.js           ← Axios instance with JWT header injection

/server
  /routes
    auth.js            ← Login, JWT issue, user creation
    projects.js        ← CRUD for projects
    sessions.js        ← Session start/end/history
    analytics.js       ← Metrics endpoints (NEW)
    team.js            ← Member management (NEW)
  /middleware
    authenticateToken.js
    requireRole.js
  /socket
    editorEvents.js    ← Existing Yjs/editor socket handlers
    videoEvents.js     ← WebRTC signaling handlers (NEW)
    roomEvents.js      ← Room state machine events (NEW)
  /models
    User.js
    Project.js
    Session.js
    CodeDocument.js
  server.js
```

---

## Coding Conventions

- **JavaScript (not TypeScript)** — the existing project uses plain JS
- **async/await** everywhere, no raw `.then()` chains
- **Named exports** for components, default exports for pages
- **camelCase** for variables and functions
- **PascalCase** for React components
- **SCREAMING_SNAKE_CASE** for constants
- Socket.IO event names use **kebab-case with a namespace prefix**:
  e.g., `webrtc:offer`, `room:state-change`, `editor:cursor-update`
- All API routes prefixed with `/api/v1/`
- Error responses always return `{ error: true, message: "..." }`
- Success responses always return `{ success: true, data: {...} }`

---

## Key Academic Requirements (From RAD Document)

These must be demonstrably working for the final year presentation:

| ID | Requirement | Where It Lives |
|----|-------------|---------------|
| FREQ-1 | Simultaneous real-time code editing | Already done (Yjs) |
| FREQ-2 | Real-time cursor broadcasting | Phase 2 |
| FREQ-3 | In-session video call | Phase 1 ← CRITICAL |
| FREQ-4 | Syntax highlighting for JS/Python/C++ | Already done (Monaco) |
| UC-01 | Real-time code sync with reconnect handling | Already done + enhance |
| UC-02 | P2P video with offer/answer/ICE | Phase 1 |
| BR-01 | Session isolation by Room ID | Already done |
| BR-02 | Max 6 concurrent video streams | Phase 1 |
| BR-03 | Conflict resolution (CRDT/OT) | Already done (Yjs CRDT) |

---

## Non-Functional Requirements (Must Be Met)

- **Sync latency:** Code updates visible across clients within **100–200ms**
- **Concurrent rooms:** Backend handles **50+ rooms** without degradation
- **Video streams:** No more than **6 per room** (enforce server-side)
- **Security:** All API calls over HTTPS, WebSockets over WSS, WebRTC over DTLS/SRTP
- **Reconnection:** If WebSocket drops, client auto-reconnects and re-syncs state
- **Permission handling:** Always request camera/mic via `getUserMedia` with
  graceful fallback if denied

---

## Do NOT Do These Things

- Do NOT rewrite the backend in Python/FastAPI. The RAD mentions FastAPI but
  the existing project is Node.js. Keep Node.js.
- Do NOT replace Yjs with manual OT (Operational Transformation). Yjs is better.
- Do NOT use `localStorage` for session state. Use MongoDB + in-memory Socket.IO rooms.
- Do NOT install heavy SFU servers (mediasoup, Janus) for ≤6 users. Use simple-peer.
- Do NOT add a separate chat microservice. Chat can be a Socket.IO channel.
- Do NOT skip error boundaries in React. Wrap all new panels in `<ErrorBoundary>`.
- Do NOT hardcode room capacity. Read it from a `ROOM_MAX_PARTICIPANTS` env variable.