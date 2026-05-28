import jwt from "jsonwebtoken";
import Project from "../models/Project.js";
import Session from "../models/Session.js";
import CodeDocument from "../models/CodeDocument.js";
import Account from "../models/Account.js";
import { Op } from "sequelize";

export const getMe = async (req, res) => {
  try {
    const user = await Account.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: true, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, language, visibility } = req.body;
    const project = await Project.create({
      name,
      description: description || "",
      language: language || "",
      visibility: visibility || "private",
      owner: req.user.email,
      collaborators: [req.user.email],
      files: [],
      accessRequests: [],
      creationTime: Date.now(),
      editedTime: Date.now(),
      isArchived: false,
    });
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: {
        isArchived: false,
        [Op.or]: [
          { owner: req.user.email },
          { collaborators: { [Op.contains]: [req.user.email] } },
        ],
      },
      order: [["editedTime", "DESC"]],
    });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const getProjectDetails = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: true, message: "Project not found" });

    const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];
    const hasAccess =
      project.visibility === "public" ||
      project.owner === req.user.email ||
      collaborators.includes(req.user.email);

    if (!hasAccess) {
      return res.status(403).json({ error: true, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: true, message: "Project not found" });

    if (project.owner !== req.user.email) {
      return res.status(403).json({ error: true, message: "Only owner can update project" });
    }

    const { name, description, language, visibility } = req.body;
    await project.update({
      name: name ?? project.name,
      description: description ?? project.description,
      language: language ?? project.language,
      visibility: visibility ?? project.visibility,
      editedTime: Date.now(),
    });

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const archiveProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: true, message: "Project not found" });

    if (project.owner !== req.user.email) {
      return res.status(403).json({ error: true, message: "Only owner can archive project" });
    }
    await project.update({ isArchived: true, editedTime: Date.now() });
    res.status(200).json({ success: true, message: "Project archived" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const createSession = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: true, message: "Project not found" });

    const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];
    if (project.owner !== req.user.email && !collaborators.includes(req.user.email)) {
      return res.status(403).json({ error: true, message: "Access denied" });
    }

    const roomCode = `${project._id}-${Date.now()}`;
    const session = await Session.create({
      projectId: project._id,
      roomCode,
      state: "Initialized",
      startedAt: new Date(),
      participants: [],
      linesWritten: 0,
      executionsRun: 0,
    });
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: { projectId: req.params.id },
      order: [["startedAt", "DESC"]],
    });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const getDocument = async (req, res) => {
  try {
    const doc = await CodeDocument.findOne({ where: { projectId: req.params.id } });
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const saveDocument = async (req, res) => {
  try {
    const { content, language } = req.body;
    const existing = await CodeDocument.findOne({ where: { projectId: req.params.id } });
    const doc = existing
      ? await existing.update({
          content,
          language,
          lastEditedByUserId: req.user.userId,
        })
      : await CodeDocument.create({
          projectId: req.params.id,
          content,
          language,
          lastEditedByUserId: req.user.userId,
        });
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const getTeam = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: true, message: "Project not found" });

    const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];
    if (project.owner !== req.user.email && !collaborators.includes(req.user.email)) {
      return res.status(403).json({ error: true, message: "Access denied" });
    }

    const members = await Promise.all(
      collaborators.map(async (email) => {
        const account = await Account.findOne({ where: { email } });
        return {
          email,
          name: account?.name || email,
          photoUrl: account?.photoUrl || "",
          role: email === project.owner ? "owner" : "member",
        };
      })
    );

    res.status(200).json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const createInvite = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: true, message: "Project not found" });

    const userEmail = req.user.email || req.user.user;
    const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];
    const collaboratorEmails = collaborators.map((collaborator) =>
      typeof collaborator === "string" ? collaborator : collaborator?.email || collaborator?.user || ""
    );
    const isOwner = project.owner === userEmail;
    const isCollaborator = collaboratorEmails.includes(userEmail);
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: true, message: "You must be a project member to invite others" });
    }

    const inviteToken = jwt.sign(
      { projectId: project._id, invitedBy: req.user.userId, invitedByEmail: userEmail },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173";
    const inviteLink = `${frontendUrl}/join/${inviteToken}`;
    res.status(200).json({ success: true, data: { inviteLink, token: inviteToken } });
  } catch (error) {
    console.error("createInvite error:", error);
    res.status(500).json({ error: true, message: error.message });
  }
};
