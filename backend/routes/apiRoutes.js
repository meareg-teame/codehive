import express from "express";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { requireRole } from "../middlewares/requireRole.js";
import Project from "../models/Project.js";
import Account from "../models/Account.js";
import Session from "../models/Session.js";
import { Op } from "sequelize";
import { getOverview, getProjectAnalytics } from "../controllers/analyticsControllers.js";
const router = express.Router();

// Auth routes
router.post("/v1/auth/firebase-signin", async (req, res) => {
  try {
    const { firebaseToken, email, displayName, photoURL, firebaseUID } = req.body;
    
    // Find or create user
    let user = await Account.findOne({ where: { email } });
    
    if (!user) {
      user = await Account.create({
        email,
        name: displayName || email.split('@')[0],
        photoUrl: photoURL || "",
        firebaseUID,
        isVerified: true
      });
    }
    
    // Create JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role || "user",
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    res.json({
      success: true,
      data: { token, user: { id: user._id, email: user.email, name: user.name, role: user.role || "user" } }
    });
  } catch (error) {
    console.error("Firebase signin error:", error);
    res.status(500).json({ error: true, message: "Authentication failed" });
  }
});

router.get("/v1/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await Account.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
        role: user.role || "user"
      }
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch user" });
  }
});

// Project routes
router.post("/v1/projects", authenticateToken, async (req, res) => {
  try {
    const { name, description, language, visibility } = req.body;
    const project = await Project.create({
      name,
      description,
      owner: req.user.email,
      language,
      visibility: visibility || "private",
      collaborators: [req.user.email],
      creationTime: Date.now(),
      editedTime: Date.now()
    });
    res.json({ success: true, data: project });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ error: true, message: "Failed to create project" });
  }
});

router.get("/v1/projects", authenticateToken, async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: {
        [Op.or]: [
          { owner: req.user.email },
          { collaborators: { [Op.contains]: [req.user.email] } },
        ],
      },
    });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch projects" });
  }
});

router.get("/v1/projects/:id", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: true, message: "Project not found" });
    }
    // Check if user has access
    const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];
    if (!collaborators.includes(req.user.email) && project.visibility !== "public") {
      return res.status(403).json({ error: true, message: "Access denied" });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch project" });
  }
});

router.put("/v1/projects/:id", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: true, message: "Project not found" });
    }
    if (project.owner !== req.user.email) {
      return res.status(403).json({ error: true, message: "Only owner can update project" });
    }
    const { name, description, visibility } = req.body;
    project.name = name || project.name;
    project.description = description || project.description;
    project.visibility = visibility || project.visibility;
    project.editedTime = Date.now();
    await project.save();
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to update project" });
  }
});

router.delete("/v1/projects/:id", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: true, message: "Project not found" });
    }
    if (project.owner !== req.user.email) {
      return res.status(403).json({ error: true, message: "Only owner can delete project" });
    }
    await Project.destroy({ where: { _id: req.params.id } });
    res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to delete project" });
  }
});

// Session routes
router.post("/v1/projects/:id/sessions", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: true, message: "Project not found" });
    }
    const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];
    if (!collaborators.includes(req.user.email)) {
      return res.status(403).json({ error: true, message: "Access denied" });
    }
    
    const roomCode = `${project._id}-${Date.now()}`;
    const session = await Session.create({
      projectId: project._id,
      roomCode,
      state: "Initialized",
      startedAt: new Date(),
      participants: []
    });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to create session" });
  }
});

router.get("/v1/projects/:id/sessions", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: true, message: "Project not found" });
    }
    const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];
    if (!collaborators.includes(req.user.email)) {
      return res.status(403).json({ error: true, message: "Access denied" });
    }
    
    const sessions = await Session.findAll({
      where: { projectId: project._id },
      order: [["startedAt", "DESC"]],
    });
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch sessions" });
  }
});

// Analytics routes
router.get("/v1/analytics/overview", authenticateToken, getOverview);
// analytics overview handled by controller

router.get("/v1/analytics/projects/:id", authenticateToken, getProjectAnalytics);

    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: true, message: "Project not found" });
    }
    
    // Check access
    const user = await Account.findByPk(req.user.userId);
    const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];
    if (!collaborators.includes(user.email) && project.visibility !== "public") {
      return res.status(403).json({ error: true, message: "Access denied" });
    }
    
    const sessions = await Session.findAll({
      where: { projectId: project._id },
      order: [["startedAt", "DESC"]],
    });
    
    // Calculate stats
    const totalSessions = sessions.length;
    const avgSessionDuration = sessions.length > 0 
      ? sessions.reduce((acc, s) => {
          if (s.endedAt && s.startedAt) {
            return acc + (new Date(s.endedAt) - new Date(s.startedAt)) / 1000;
          }
          return acc;
        }, 0) / sessions.length
      : 0;
    
    // Language distribution
    const languageDistribution = {};
    sessions.forEach(s => {
      if (project.language) {
        languageDistribution[project.language] = (languageDistribution[project.language] || 0) + 1;
      }
    });
    
    // Member contributions (lines written)
    const memberContributions = [];
    const participantMap = new Map();
    sessions.forEach(s => {
      s.participants?.forEach(p => {
        if (p.userId) {
          const existing = participantMap.get(p.userId) || { userName: p.userId, linesContributed: 0 };
          existing.linesContributed += s.linesWritten || 0;
          participantMap.set(p.userId, existing);
        }
      });
    });
    memberContributions.push(...Array.from(participantMap.values()));
    
    // Sessions over time (group by date)
    const sessionsByDate = {};
    sessions.forEach(s => {
      const date = new Date(s.startedAt).toISOString().split('T')[0];
      sessionsByDate[date] = (sessionsByDate[date] || 0) + 1;
    });
    const sessionsOverTime = Object.entries(sessionsByDate).map(([date, count]) => ({ date, count }));
    
    res.json({
      success: true,
      data: {
        totalSessions,
        avgSessionDuration: Math.round(avgSessionDuration),
        languageDistribution,
        memberContributions,
        sessionsOverTime
      }
    });
  } catch (error) {
    console.error("Project analytics error:", error);
    res.status(500).json({ error: true, message: "Failed to fetch project analytics" });
  }
});

// Team management routes
router.get("/v1/projects/:id/team", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: true, message: "Project not found" });
    }
    
    const user = await Account.findByPk(req.user.userId);
    const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];
    if (!collaborators.includes(user.email)) {
      return res.status(403).json({ error: true, message: "Access denied" });
    }
    
    // Get member details
    const memberDetails = await Promise.all(
      collaborators.map(async (email) => {
        const member = await Account.findOne({ where: { email } });
        return {
          email,
          name: member?.name || email,
          photoUrl: member?.photoUrl || "",
          role: email === project.owner ? "owner" : "member"
        };
      })
    );
    
    res.json({ success: true, data: memberDetails });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to fetch team members" });
  }
});

router.post("/v1/projects/:id/team/invite", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: true, message: "Project not found" });
    }
    
    // Only owner can invite
    if (project.owner !== req.user.email) {
      return res.status(403).json({ error: true, message: "Only owner can invite members" });
    }
    
    // Generate invite token (valid for 24 hours)
    const inviteToken = jwt.sign(
      { projectId: project._id, invitedBy: req.user.userId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    const inviteLink = `${process.env.FRONTEND_URL}/join/${inviteToken}`;
    
    res.json({ success: true, data: { inviteLink, token: inviteToken } });
  } catch (error) {
    res.status(500).json({ error: true, message: "Failed to generate invite" });
  }
});

export default router;
