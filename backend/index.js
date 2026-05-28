// index.js
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import apiV1Router from "./routes/apiV1.js";
import connectPostgres from "./config/db.js";
import cookieParser from "cookie-parser";
import Project from "./models/Project.js";
import Account from "./models/Account.js";
import Session from "./models/Session.js";
import { Op } from "sequelize";
import { createYjsServer } from "./yjs-server.js";

dotenv.config();

process.on("unhandledRejection", (reason) => {
  console.error(
    "Unhandled rejection:",
    reason instanceof Error ? reason.message : reason
  );
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error.message);
});

const app = express();

const server = http.createServer(app);

createYjsServer(server);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const cleanOrigin = origin.replace(/\/+$/, "");
  const cleanFrontendUrl = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");

  if (cleanOrigin === cleanFrontendUrl) return true;
  if (cleanOrigin === "https://codehive-gamma.vercel.app") return true;
  if (cleanOrigin.endsWith(".vercel.app") || cleanOrigin.includes("vercel.app")) return true;

  // Allow Vite/dev clients on localhost without hardcoding a single port.
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(cleanOrigin);
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};

const io = new SocketIOServer(server, {
  cors: corsOptions,
});

app.set("io", io);

app.use(cors(corsOptions));

app.set("view engine", "ejs");

await connectPostgres();

app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/project", projectRoutes);
app.use("/api/v1", apiV1Router);
app.use("/api", apiRoutes);

app.get("/health",(req,res)=>{
  res.status(200).json({msg:"200 OK"});
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`server live on port ${PORT}`);
});

//socket io part gulo

const roomParticipants = new Map();
const sessionStates = new Map(); // roomId -> { state, dbId }
let sessionTrackingWarningShown = false;

const emitRoomState = (roomId, newState) => {
  io.to(roomId).emit("room:state-change", { roomId, newState });
};

const warnSessionTracking = (error) => {
  if (sessionTrackingWarningShown) return;
  sessionTrackingWarningShown = true;
  console.warn("Session persistence disabled for local dev:", error.message);
};

io.on("connection", (socket) => {
  socket.on("request access", async (data) => {
    try {
      const projectId = data.projectId;
      const requestedBy = data.requestedBy;
      const projectOwner = data.projectOwner;
      const projectData = await Project.findByPk(projectId);
      if (!projectData) return;

      const accessRequests = Array.isArray(projectData.accessRequests)
        ? [...projectData.accessRequests]
        : [];
      accessRequests.push(requestedBy);
      await projectData.update({ accessRequests });
      const projectAccessRequest={
        projectId:projectId,
        requestedBy:requestedBy,
        status:"pending"
      }
      const ownerData = await Account.findOne({ where: { email: projectOwner } });
      if (!ownerData) return;

      const accessRequestsForOwner = Array.isArray(ownerData.accessManagementProjects)
        ? [...ownerData.accessManagementProjects]
        : [];
      accessRequestsForOwner.push(projectAccessRequest);
      await ownerData.update({ accessManagementProjects: accessRequestsForOwner });

      io.emit(`${projectOwner}:access requested`, {
        projectId,
        requestedBy,
        projectName: projectData.name,
      });
    } catch (error) {
      console.warn("request access skipped:", error.message);
    }
  });

  socket.on("grant project access", async (data) => {
    try {
      const { projectId, requestedBy } = data;
      const projectData = await Project.findByPk(projectId);
      if (!projectData) return;

      const collaborators = Array.isArray(projectData.collaborators)
        ? [...projectData.collaborators]
        : [];
      collaborators.push(requestedBy); 
      await projectData.update({ collaborators });

      const requestedByData = await Account.findOne({ where: { email: requestedBy } });
      if (requestedByData) {
        const sharedWithMe = Array.isArray(requestedByData.sharedWithMe)
          ? [...requestedByData.sharedWithMe]
          : [];
      sharedWithMe.push(projectId);
        await requestedByData.update({ sharedWithMe });
      }

      const ownerData = await Account.findOne({ where: { email: projectData.owner } });
      if (!ownerData) return;

      const accessRequestsForOwner = Array.isArray(ownerData.accessManagementProjects)
        ? [...ownerData.accessManagementProjects]
        : [];
      for(let projectRequest of accessRequestsForOwner){
        if(projectRequest.projectId.toString()===projectId.toString() && projectRequest.requestedBy===requestedBy){
          projectRequest.status="granted";
        }
      }
      await ownerData.update({ accessManagementProjects: accessRequestsForOwner });

      io.emit(`${requestedBy}:access granted`,{projectName:projectData.name});
    } catch (error) {
      console.warn("grant access skipped:", error.message);
    }
  });

  socket.on("room:join", async ({ roomId, userId }) => {
    try {
      socket.join(roomId);

      let sessionMeta = sessionStates.get(roomId);
      if (!sessionMeta) {
        try {
          let session = await Session.findOne({
            where: {
              roomCode: roomId,
              state: { [Op.ne]: "Terminated" },
            },
          });
          if (!session) {
            session = await Session.create({
              roomCode: roomId,
              state: "Initialized",
              startedAt: new Date(),
              participants: []
            });
          }
          sessionMeta = { state: session.state, dbId: session._id, participants: new Set() };
        } catch (error) {
          warnSessionTracking(error);
          sessionMeta = { state: "Initialized", dbId: null, participants: new Set() };
        }
        sessionStates.set(roomId, sessionMeta);
      }

      sessionMeta.participants.add(socket.id);
      
      // Track participant joined
      if (sessionMeta.dbId) {
        try {
          const session = await Session.findByPk(sessionMeta.dbId);
          if (session) {
            const participants = Array.isArray(session.participants) ? [...session.participants] : [];
            participants.push({ socketId: socket.id, userId, joinedAt: new Date() });
            await session.update({ participants });
          }
        } catch (error) {
          warnSessionTracking(error);
          sessionMeta.dbId = null;
        }
      }

      const prevCount = sessionMeta.participants.size - 1; // before this user
      
      if (prevCount === 0) {
        sessionMeta.state = "Waiting";
        if (sessionMeta.dbId) {
          try {
            await Session.update({ state: "Waiting" }, { where: { _id: sessionMeta.dbId } });
          } catch (error) {
            warnSessionTracking(error);
            sessionMeta.dbId = null;
          }
        }
        emitRoomState(roomId, "Waiting");
      } else if (prevCount === 1) {
        sessionMeta.state = "Active";
        if (sessionMeta.dbId) {
          try {
            await Session.update({ state: "Active" }, { where: { _id: sessionMeta.dbId } });
          } catch (error) {
            warnSessionTracking(error);
            sessionMeta.dbId = null;
          }
        }
        emitRoomState(roomId, "Active");
      } else if (prevCount > 1) {
        sessionMeta.state = "Synchronizing";
        if (sessionMeta.dbId) {
          try {
            await Session.update({ state: "Synchronizing" }, { where: { _id: sessionMeta.dbId } });
          } catch (error) {
            warnSessionTracking(error);
            sessionMeta.dbId = null;
          }
        }
        emitRoomState(roomId, "Synchronizing");
        io.to(roomId).emit("room:sync-start", { roomId });
      }
    } catch (error) {
      warnSessionTracking(error);
    }
  });

  socket.on("room:sync-confirm", async ({ roomId }) => {
    let sessionMeta = sessionStates.get(roomId);
    if (sessionMeta && sessionMeta.state === "Synchronizing") {
      sessionMeta.state = "Active";
      if (sessionMeta.dbId) {
        try {
          await Session.update({ state: "Active" }, { where: { _id: sessionMeta.dbId } });
        } catch (error) {
          warnSessionTracking(error);
          sessionMeta.dbId = null;
        }
      }
      io.to(roomId).emit("room:sync-complete", { roomId });
      emitRoomState(roomId, "Active");
    }
  });

  socket.on("code_change", async ({ roomId, linesDelta }) => {
    const sessionMeta = sessionStates.get(roomId);
    if (sessionMeta?.dbId) {
      try {
        await Session.increment({ linesWritten: linesDelta }, { where: { _id: sessionMeta.dbId } });
      } catch (error) {
        warnSessionTracking(error);
        sessionMeta.dbId = null;
      }
    }
  });

  socket.on("code_execute", async ({ roomId }) => {
    const sessionMeta = sessionStates.get(roomId);
    if (sessionMeta?.dbId) {
      try {
        await Session.increment({ executionsRun: 1 }, { where: { _id: sessionMeta.dbId } });
      } catch (error) {
        warnSessionTracking(error);
        sessionMeta.dbId = null;
      }
    }
  });

  const handleRoomLeave = async (socketId) => {
    for (const [roomId, sessionMeta] of sessionStates.entries()) {
      if (sessionMeta.participants.has(socketId)) {
        sessionMeta.participants.delete(socketId);
        
        if (sessionMeta.dbId) {
          try {
            const session = await Session.findByPk(sessionMeta.dbId);
            if (session) {
              const participants = Array.isArray(session.participants) ? [...session.participants] : [];
              const updated = participants.map((p) => {
                if (!p || typeof p !== 'object') return p;
                if (p.socketId !== socketId) return p;
                if (p.leftAt) return p;
                return { ...p, leftAt: new Date() };
              });
              await session.update({ participants: updated });
            }
          } catch (error) {
            warnSessionTracking(error);
            sessionMeta.dbId = null;
          }
        }

        if (sessionMeta.participants.size === 0) {
          sessionMeta.state = "Terminated";
          if (sessionMeta.dbId) {
            try {
              await Session.update(
                { state: "Terminated", endedAt: new Date() },
                { where: { _id: sessionMeta.dbId } }
              );
            } catch (error) {
              warnSessionTracking(error);
            }
          }
          sessionStates.delete(roomId);
          emitRoomState(roomId, "Terminated");
        }
      }
    }
  };

  socket.on("webrtc:join-call", ({ roomId, userId, userName }) => {
    const MAX_PARTICIPANTS = parseInt(process.env.ROOM_MAX_PARTICIPANTS || "6", 10);
    
    if (!roomParticipants.has(roomId)) {
      roomParticipants.set(roomId, new Map());
    }
    const participants = roomParticipants.get(roomId);
    
    if (participants.size >= MAX_PARTICIPANTS) {
      socket.emit("webrtc:call-full");
      return;
    }
    
    participants.set(socket.id, { userId, userName });
    socket.join(roomId);
    
    // Get all OTHER users
    const others = [];
    participants.forEach((user, pSocketId) => {
      if (pSocketId !== socket.id) {
        others.push({ socketId: pSocketId, ...user });
      }
    });
    
    socket.emit("webrtc:all-call-participants", others);
    socket.to(roomId).emit("webrtc:user-joined-call", {
      socketId: socket.id,
      userId,
      userName
    });
  });

  socket.on("webrtc:offer", ({ targetSocketId, offer, senderSocketId, senderUserName }) => {
    io.to(targetSocketId).emit("webrtc:offer", {
      senderSocketId,
      offer,
      senderUserName
    });
  });

  socket.on("webrtc:answer", ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit("webrtc:answer", {
      senderSocketId: socket.id,
      answer
    });
  });

  socket.on("webrtc:ice-candidate", ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit("webrtc:ice-candidate", {
      senderSocketId: socket.id,
      candidate
    });
  });

  socket.on("webrtc:media-state", ({ roomId, isMuted, isCameraOff }) => {
    socket.to(roomId).emit("webrtc:media-state", {
      socketId: socket.id,
      isMuted,
      isCameraOff
    });
  });

  const handleLeaveCall = (roomId) => {
    if (!roomId) return;
    const participants = roomParticipants.get(roomId);
    if (participants && participants.has(socket.id)) {
      participants.delete(socket.id);
      socket.to(roomId).emit("webrtc:user-left-call", { socketId: socket.id });
      socket.leave(roomId);
      if (participants.size === 0) {
        roomParticipants.delete(roomId);
      }
    }
  };

  socket.on("webrtc:leave-call", ({ roomId }) => {
    handleLeaveCall(roomId);
  });

  socket.on("disconnect", async () => {
    // Find rooms this socket was in for webrtc
    for (const [roomId, participants] of roomParticipants.entries()) {
      if (participants.has(socket.id)) {
        handleLeaveCall(roomId);
      }
    }
    
    // Handle room session state
    await handleRoomLeave(socket.id);
  });

});
