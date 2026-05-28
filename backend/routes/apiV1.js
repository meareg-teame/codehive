import express from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { requireRole } from "../middlewares/requireRole.js";
import { isUserAllowed } from "../middlewares/isUserAllowed.js";
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
router.get("/projects/:id", authenticateToken, isUserAllowed, getProjectDetails);
router.put("/projects/:id", authenticateToken, isUserAllowed, updateProject);
router.delete("/projects/:id", authenticateToken, isUserAllowed, archiveProject);

// Sessions
router.post("/projects/:id/sessions", authenticateToken, isUserAllowed, createSession);
router.get("/projects/:id/sessions", authenticateToken, isUserAllowed, getSessions);

// Persistence (Yjs doc snapshot)
router.get("/projects/:id/document", authenticateToken, isUserAllowed, getDocument);
router.post("/projects/:id/document", authenticateToken, isUserAllowed, saveDocument);

// Team
router.get("/projects/:id/team", authenticateToken, isUserAllowed, getTeam);
router.post("/projects/:id/team/invite", authenticateToken, isUserAllowed, createInvite);

export default router;
