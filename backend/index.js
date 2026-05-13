// index.js
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import connectMongodb from "./config/db.js";
import cookieParser from "cookie-parser";
import Project from "./models/Project.js";
import Account from "./models/Account.js";
import Session from "./models/Session.js";
import { stat } from "fs";

dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["POST", "GET"],
    credentials: true,
  })
);

app.set("view engine", "ejs");
connectMongodb();

app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/project", projectRoutes);

app.get("/health",(req,res)=>{
  res.status(200).json({msg:"200 OK"});
});

server.listen(8080, () => {
  console.log(`server live`);
});

//socket io part gulo

const roomParticipants = new Map();
const sessionStates = new Map(); // roomId -> { state, dbId }

const emitRoomState = (roomId, newState) => {
  io.to(roomId).emit("room:state-change", { roomId, newState });
};

io.on("connection", (socket) => {
  socket.on("request access", async (data) => {
    const projectId = data.projectId;
    const requestedBy = data.requestedBy;
    const projectOwner = data.projectOwner;
    let projectData=await Project.findById(projectId);
    let accessRequests=projectData.accessRequests;
    accessRequests.push(requestedBy);
    await Project.updateOne({_id:projectId},{accessRequests:accessRequests});
    const projectAccessRequest={
      projectId:projectId,
      requestedBy:requestedBy,
      status:"pending"
    }
    const ownerData=await Account.findOne({email:projectOwner});
    let accessRequestsForOwner=ownerData.accessManagementProjects || [];
    accessRequestsForOwner.push(projectAccessRequest);
    await Account.updateOne({email:projectOwner},{accessManagementProjects:accessRequestsForOwner});

    io.emit(`${projectOwner}:access requested`, {
      projectId,
      requestedBy,
      projectName: projectData.name,
    });
  });

  socket.on("grant project access", async (data) => {
    const { projectId, requestedBy } = data;
    const projectData = await Project.findById(projectId);
    let collaborators = projectData.collaborators;
    collaborators.push(requestedBy); 
    await Project.updateOne(
      { _id: projectId },
      { collaborators: collaborators }
    );
    let requestedByData=await Account.findOne({email:requestedBy});
    let sharedWithMe=requestedByData.sharedWithMe;
    sharedWithMe.push(projectId);
    await Account.updateOne({email:requestedBy},{sharedWithMe:sharedWithMe});

    const ownerData=await Account.findOne({email:projectData.owner});
    let accessRequestsForOwner=ownerData.accessManagementProjects || [];
    for(let projectRequest of accessRequestsForOwner){
      if(projectRequest.projectId.toString()===projectId.toString() && projectRequest.requestedBy===requestedBy){
        projectRequest.status="granted";
      }
    }
    await Account.updateOne({email:projectData.owner},{accessManagementProjects:accessRequestsForOwner});

    io.emit(`${requestedBy}:access granted`,{projectName:projectData.name});
  });

  socket.on("room:join", async ({ roomId, userId }) => {
    socket.join(roomId);

    let sessionMeta = sessionStates.get(roomId);
    if (!sessionMeta) {
      // Find or create session
      let session = await Session.findOne({ roomCode: roomId, state: { $ne: "Terminated" } });
      if (!session) {
        session = new Session({
          roomCode: roomId,
          state: "Initialized",
          startedAt: new Date(),
          participants: []
        });
        await session.save();
      }
      sessionMeta = { state: session.state, dbId: session._id, participants: new Set() };
      sessionStates.set(roomId, sessionMeta);
    }

    sessionMeta.participants.add(socket.id);
    
    // Track participant joined
    await Session.updateOne(
      { _id: sessionMeta.dbId },
      { $push: { participants: { userId, joinedAt: new Date() } } }
    );

    const prevCount = sessionMeta.participants.size - 1; // before this user
    
    if (prevCount === 0) {
      sessionMeta.state = "Waiting";
      await Session.updateOne({ _id: sessionMeta.dbId }, { state: "Waiting" });
      emitRoomState(roomId, "Waiting");
    } else if (prevCount === 1) {
      sessionMeta.state = "Active";
      await Session.updateOne({ _id: sessionMeta.dbId }, { state: "Active" });
      emitRoomState(roomId, "Active");
    } else if (prevCount > 1) {
      sessionMeta.state = "Synchronizing";
      await Session.updateOne({ _id: sessionMeta.dbId }, { state: "Synchronizing" });
      emitRoomState(roomId, "Synchronizing");
      io.to(roomId).emit("room:sync-start", { roomId });
    }
  });

  socket.on("room:sync-confirm", async ({ roomId }) => {
    let sessionMeta = sessionStates.get(roomId);
    if (sessionMeta && sessionMeta.state === "Synchronizing") {
      sessionMeta.state = "Active";
      await Session.updateOne({ _id: sessionMeta.dbId }, { state: "Active" });
      io.to(roomId).emit("room:sync-complete", { roomId });
      emitRoomState(roomId, "Active");
    }
  });

  socket.on("code_change", async ({ roomId, linesDelta }) => {
    const sessionMeta = sessionStates.get(roomId);
    if (sessionMeta) {
      await Session.updateOne({ _id: sessionMeta.dbId }, { $inc: { linesWritten: linesDelta } });
    }
  });

  socket.on("code_execute", async ({ roomId }) => {
    const sessionMeta = sessionStates.get(roomId);
    if (sessionMeta) {
      await Session.updateOne({ _id: sessionMeta.dbId }, { $inc: { executionsRun: 1 } });
    }
  });

  const handleRoomLeave = async (socketId) => {
    for (const [roomId, sessionMeta] of sessionStates.entries()) {
      if (sessionMeta.participants.has(socketId)) {
        sessionMeta.participants.delete(socketId);
        
        await Session.updateOne(
          { _id: sessionMeta.dbId, "participants.userId": { $exists: true } },
          { $set: { "participants.$[elem].leftAt": new Date() } },
          { arrayFilters: [{ "elem.leftAt": { $exists: false } }] }
        );

        if (sessionMeta.participants.size === 0) {
          sessionMeta.state = "Terminated";
          await Session.updateOne({ _id: sessionMeta.dbId }, { state: "Terminated", endedAt: new Date() });
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
