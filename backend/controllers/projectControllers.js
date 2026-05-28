import Project from "../models/Project.js";
import Account from "../models/Account.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import { executeWithJudge0 } from "../services/judge0.js";
import { Op } from "sequelize";
import { getFrontendUrl } from "../lib/urlUtils.js";

const DEV_USER = "local@codecollab.dev";
const devProjects = new Map();

// Maps language key → default filename for new projects
const DEFAULT_FILE_MAP = {
  nodejs:     "main.js",
  typescript: "main.ts",
  python:     "main.py",
  java:       "Main.java",
  c:          "main.c",
  cpp:        "main.cpp",
  csharp:     "Program.cs",
  go:         "main.go",
  rust:       "main.rs",
  ruby:       "main.rb",
  php:        "index.php",
  kotlin:     "Main.kt",
  swift:      "main.swift",
  bash:       "script.sh",
};

function getCurrentUser(req) {
  // Prefer the decoded user attached by authenticateToken middleware
  if (req.user && req.user.email) {
    return req.user.email;
  }
  // Fallback: attempt to verify token manually from header or cookies
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.token || req.cookies.user;
  if (!token) return null;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded?.email || decoded?.user;
}

function buildDevProject({ projectName, language, visibility, owner }) {
  const now = Date.now();
  return {
    _id: `dev-${now}-${Math.random().toString(36).slice(2, 8)}`,
    name: projectName,
    language,
    visibility,
    owner,
    collaborators: [owner],
    files: [],
    accessRequests: [],
    creationTime: now,
    editedTime: now,
  };
}

export async function createProject(req, res) {
  const { projectName, language, visibility } = req.body;
  const user = getCurrentUser(req);

  if (user === DEV_USER) {
    const project = buildDevProject({
      projectName,
      language,
      visibility,
      owner: user,
    });
    devProjects.set(project._id, project);
    return res.status(200).json({ msg: "project created", project });
  }

  const defaultFileName = DEFAULT_FILE_MAP[language] || "main.txt";
  await Project.create({
    name: projectName,
    language: language,
    visibility: visibility,
    owner: user,
    collaborators: [user],
    files: [{ name: defaultFileName, content: "" }],
    creationTime: new Date().getTime(),
  });
  return res.status(200).json({ msg: "project created" });
}

export async function getProjects(req, res) {
  const user = getCurrentUser(req);

  if (user === DEV_USER) {
    const projects = [...devProjects.values()].filter(
      (project) => project.owner === user
    );
    return res.status(200).json({ projects });
  }

  const projects = await Project.findAll({ where: { owner: user } });
  return res.status(200).json({ projects: projects });
}

export async function deleteProject(req, res) {
  const projectId = req.body.id;
  if (String(projectId).startsWith("dev-")) {
    devProjects.delete(projectId);
    return res.status(200).json({ msg: "project deleted" });
  }
  await Project.destroy({ where: { _id: projectId } });
  


  return res.status(200).json({ msg: "project deleted" });
}

export async function getProjectDetails(req, res) {
  const user = getCurrentUser(req);
  const projectId = req.body.id;

  if (user === DEV_USER || String(projectId).startsWith("dev-")) {
    const projectDetails = devProjects.get(projectId);
    if (!projectDetails) {
      return res.status(404).json({ msg: "project not found" });
    }
    return res.status(200).json({ projectDetails, user });
  }

  const projectDetails = await Project.findByPk(projectId);
  return res.status(200).json({ projectDetails: projectDetails, user: user });
}

export async function createFile(req, res) {
  const { projectId, fileName } = req.body;
  if (String(projectId).startsWith("dev-")) {
    const projectData = devProjects.get(projectId);
    if (!projectData) {
      return res.status(404).json({ msg: "project not found" });
    }
    projectData.files.push({
      name: fileName,
      content: "",
    });
    projectData.editedTime = Date.now();
    devProjects.set(projectId, projectData);
    const io = req.app.get("io");
    io.emit("updated files", { projectDetails: projectData });
    return res
      .status(200)
      .json({ msg: "new file created", projectDetails: projectData });
  }

  let projectData = await Project.findByPk(projectId);
  if (!projectData) {
    return res.status(404).json({ msg: "project not found" });
  }
  // Clone the array so Sequelize detects the JSONB change
  const files = [...(projectData.files || []), { name: fileName, content: "" }];
  await projectData.update({ files });
  projectData.changed("files", true);
  await projectData.save();
  const io = req.app.get("io");
  io.emit("updated files", { projectDetails: projectData });
  res
    .status(200)
    .json({ msg: "new file created", projectDetails: projectData });
}

export async function deleteFile(req, res) {
  const { id, fileName } = req.body;
  if (String(id).startsWith("dev-")) {
    const projectData = devProjects.get(id);
    if (!projectData) {
      return res.status(404).json({ msg: "project not found" });
    }
    projectData.files = projectData.files.filter((file) => file.name !== fileName);
    projectData.editedTime = Date.now();
    devProjects.set(id, projectData);
    const io = req.app.get("io");
    io.emit("updated files", {
      projectDetails: projectData,
      deletedFile: fileName,
    });
    return res
      .status(200)
      .json({ msg: "file deleted", projectDetails: projectData });
  }

  let projectData = await Project.findByPk(id);
  if (!projectData) {
    return res.status(404).json({ msg: "project not found" });
  }
  let files = projectData.files;
  let newFiles = [];
  for (let file of files) {
    if (file.name !== fileName) {
      newFiles.push(file);
    }
  }
  await projectData.update({ files: newFiles });
  const io = req.app.get("io");
  io.emit("updated files", {
    projectDetails: projectData,
    deletedFile: fileName,
  });
  return res
    .status(200)
    .json({ msg: "file deleted", projectDetails: projectData });
}

export async function renameFile(req, res) {
  const { projectId, newFileName, oldFileName } = req.body;
  if (String(projectId).startsWith("dev-")) {
    const projectData = devProjects.get(projectId);
    if (!projectData) {
      return res.status(404).json({ msg: "project not found" });
    }
    for (let file of projectData.files) {
      if (file.name === oldFileName) {
        file.name = newFileName;
        break;
      }
    }
    projectData.editedTime = Date.now();
    devProjects.set(projectId, projectData);
    const io = req.app.get("io");
    io.emit("updated files", { projectDetails: projectData });
    return res
      .status(200)
      .json({ msg: "file renamed", projectDetails: projectData });
  }

  let projectData = await Project.findByPk(projectId);
  if (!projectData) {
    return res.status(404).json({ msg: "project not found" });
  }
  let files = projectData.files;
  for (let file of files) {
    if (file.name === oldFileName) {
      file.name = newFileName;
      break;
    }
  }
  await projectData.update({ files });
  const io = req.app.get("io");
  io.emit("updated files", { projectDetails: projectData });
  return res
    .status(200)
    .json({ msg: "file deleted", projectDetails: projectData });
}

export async function runCode(req, res) {
  const code = req.body.code || "";
  const language = req.body.language;
  const stdin = req.body.stdin || "";

  if (!language) {
    return res.status(400).json({ msg: "Language is required." });
  }

  try {
    const result = await executeWithJudge0({
      language,
      sourceCode: code,
      stdin,
    });

    return res.status(200).json({
      result: {
        stdout: result.stdout || "",
        stderr:
          result.compile_output || result.stderr || result.message || "",
        status: result.status?.description || "Finished",
        time: result.time ?? null,
        memory: result.memory ?? null,
        judge0LanguageId: result.language_id ?? null,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 503).json({
      msg: error.message || "Error executing code.",
    });
  }
}

export async function saveFile(req, res) {
  const { code, projectId, fileName } = req.body;
  if (String(projectId).startsWith("dev-")) {
    const projectData = devProjects.get(projectId);
    if (!projectData) {
      return res.status(404).json({ msg: "project not found" });
    }
    for (let file of projectData.files) {
      if (file.name === fileName) {
        file.content = code;
        break;
      }
    }
    projectData.editedTime = Date.now();
    devProjects.set(projectId, projectData);
    const io = req.app.get("io");
    io.emit("updated files", { projectDetails: projectData, newContent: code });
    return res.status(200).json({ msg: "file saved", files: [...projectData.files].reverse() });
  }

  let projectData = await Project.findByPk(projectId);
  if (!projectData) {
    return res.status(404).json({ msg: "project not found" });
  }
  // Clone the array so Sequelize detects the JSONB mutation
  const files = (projectData.files || []).map((file) =>
    file.name === fileName ? { ...file, content: code } : file
  );
  await projectData.update({ files });
  projectData.changed("files", true);
  await projectData.save();
  const io = req.app.get("io");
  io.emit("updated files", { projectDetails: projectData, newContent: code });
  return res.status(200).json({ msg: "file saved", files: [...files].reverse() });
}

export async function aiExplain(req, res) {
  const { code, language } = req.body;
  const prompt = `
    Language: ${language}

Code snippet:
${code}

explain the above code's error.
Do NOT show reasoning, analysis, or search references.
Return only the final explanation, fix, and tip.
You are a programming error explainer.

Rules:
- Do NOT reveal your reasoning or analysis.
- Do NOT use <think> tags or explain your thought process.
- Do NOT mention searches or sources.
- Output ONLY the final answer.

Format STRICTLY as:
Cause:
Fix:
Prevention Tip:
Provide your answer in the above format only.
  `;

  try {
    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar",
        messages: [
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json({msg:response.data.choices[0].message.content});
  } catch (err) {
    res.status(404).json({ msg: "error in AI explanation" });
  }
}

export async function sharedWithMe(req, res) {
  const user = await jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;

  const userData = await Account.findOne({ where: { email: user } });
  const sharedProjectsId = userData?.sharedWithMe || [];
  const sharedProjectsData = await Project.findAll({
    where: { _id: { [Op.in]: sharedProjectsId } },
  });
  
  return res.status(200).json({sharedProjects:sharedProjectsData});
}

export async function removeAccess(req, res) {
  const {projectId}=req.body;
  const user = await jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
  const projectData = await Project.findByPk(projectId);
  if (!projectData) {
    return res.status(404).json({ msg: "project not found" });
  }
  const collaborators=projectData.collaborators;
  const newCollaborators=[];
  for(let collaborator of collaborators){
    if(collaborator!==user){
      newCollaborators.push(collaborator);
    }
  }
  await projectData.update({ collaborators: newCollaborators });

  const accessRequests=projectData.accessRequests;
  const newAccessRequests=[];
  for(let request of accessRequests){
    if(request!==user){
      newAccessRequests.push(request);
    } 
  }
  await projectData.update({ accessRequests: newAccessRequests });
  
  const userData = await Account.findOne({ where: { email: user } });
  const sharedWithMe=userData.sharedWithMe;
  const newSharedWithMe=[];
  for(let sharedProject of sharedWithMe){
    if(sharedProject.toString()!==projectId.toString()){
      newSharedWithMe.push(sharedProject);
    }
  }
  await Account.update({ sharedWithMe: newSharedWithMe }, { where: { email: user } });
  const sharedProjectsData = await Project.findAll({
    where: { _id: { [Op.in]: newSharedWithMe } },
  });



  return res.status(200).json({msg:"access removed",sharedProjects:sharedProjectsData});
}

export async function accessManagement(req, res) {
  const user = await jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
  const userData = await Account.findOne({ where: { email: user } });
  const accessManagementProjects=userData.accessManagementProjects;
  const newAccessManagementProjects=[];
  for(let project of accessManagementProjects){
    const projectData = await Project.findByPk(project.projectId);
    if(projectData==null) continue; 
    project.projectName=projectData?.name;
    newAccessManagementProjects.push(project);
  }
  res.status(200).json({accessManagementProjects:newAccessManagementProjects});
}

export async function joinProject(req, res) {
  const { token } = req.body;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { projectId } = payload;
    const userEmail = getCurrentUser(req);

    if (userEmail === DEV_USER) {
      return res.status(400).json({ msg: "Cannot join project as development user" });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    const collaborators = Array.isArray(project.collaborators) ? [...project.collaborators] : [];
    if (!collaborators.includes(userEmail)) {
      collaborators.push(userEmail);
      await project.update({ collaborators });
      project.changed("collaborators", true);
      await project.save();
    }

    return res.status(200).json({ msg: "Successfully joined project", projectId });
  } catch (error) {
    return res.status(400).json({ msg: "Invalid or expired invite token" });
  }
}

export async function generateInvite(req, res) {
  const { projectId } = req.body;
  try {
    const userEmail = getCurrentUser(req);

    if (userEmail === DEV_USER) {
      // In dev mode, still generate a usable link for testing
      const inviteToken = jwt.sign(
        { projectId, invitedBy: "dev" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      const frontendUrl = getFrontendUrl(process.env.FRONTEND_URL);
      const inviteLink = `${frontendUrl}/join/${inviteToken}`;
      return res.status(200).json({ msg: "Invite generated", inviteLink, token: inviteToken });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // Find user account to get their ID for the token
    const userAccount = await Account.findOne({ where: { email: userEmail } });
    const invitedById = userAccount?._id || userEmail;

    const inviteToken = jwt.sign(
      { projectId: project._id, invitedBy: invitedById },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const frontendUrl = getFrontendUrl(process.env.FRONTEND_URL);
    const inviteLink = `${frontendUrl}/join/${inviteToken}`;

    return res.status(200).json({ msg: "Invite generated", inviteLink, token: inviteToken });
  } catch (error) {
    console.error("generateInvite error:", error);
    return res.status(500).json({ msg: "Failed to generate invite link" });
  }
}
