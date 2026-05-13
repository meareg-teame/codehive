import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  roomCode: { type: String, unique: true, index: true },
  state: { 
    type: String, 
    enum: ["Initialized", "Waiting", "Active", "Synchronizing", "Terminated"],
    default: "Initialized"
  },
  participants: [{ 
    userId: { type: String }, // Can be ObjectId or string if firebase UID
    joinedAt: { type: Date }, 
    leftAt: { type: Date } 
  }],
  linesWritten: { type: Number, default: 0 },
  executionsRun: { type: Number, default: 0 },
  startedAt: { type: Date },
  endedAt: { type: Date }
});

export default mongoose.model("Session", SessionSchema);
