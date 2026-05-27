import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { requireRole } from "../middlewares/requireRole.js";
import {
  getMe,
  createProject,
  getProjects,
  getProjectDetails,
  updateProject,
  archiveProject,
  createSession,
  getSessions,
  getDocument,
  saveDocument,
  getTeam,
  createInvite
} from "../controllers/apiV1Controllers.js";

const router = express.Router();

// Auth-protected user profile
router.get("/auth/me", authenticateToken, getMe);

// Projects
router.get("/projects", authenticateToken, getProjects);
router.post("/projects", authenticateToken, createProject);
router.get("/projects/:id", authenticateToken, getProjectDetails);
router.put("/projects/:id", authenticateToken, updateProject);
router.delete("/projects/:id", authenticateToken, archiveProject);

// Sessions
router.post("/projects/:id/sessions", authenticateToken, createSession);
router.get("/projects/:id/sessions", authenticateToken, getSessions);

// Persistence (Yjs doc snapshot)
router.get("/projects/:id/document", authenticateToken, getDocument);
router.post("/projects/:id/document", authenticateToken, saveDocument);

// Team
router.get("/projects/:id/team", authenticateToken, getTeam);
router.post("/projects/:id/team/invite", authenticateToken, createInvite);

export default router;
