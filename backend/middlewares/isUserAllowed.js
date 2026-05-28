import { request } from "express";
import Project from "../models/Project.js";
import jwt from "jsonwebtoken";

/**
 * @function isUserAllowed
 * @description Middleware to check if the authenticated user is allowed to access a specific project.
 * Requires `req.user` to be populated by a previous authentication middleware.
 * Determines access based on whether the user is a collaborator or the owner of the project.
 * Attaches the `projectData` to `req.project` if access is granted.
 * Responds with 401 if authentication is missing, 400 if project ID is missing, 404 if project not found, or 403 if access is denied.
 * @param {Object} req - Express request object (expects `req.user.userId` and `req.params.id` or `req.body.id` for projectId).
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function isUserAllowed(req, res, next) {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: true, message: "Authentication required" });
  }

  const projectId = req.params.id || req.body.id; // Check both params and body
  if (!projectId) {
    return res.status(400).json({ error: true, message: "Project ID is required" });
  }

  try {
    const userId = req.user.userId;
    const projectData = await Project.findOne({ _id: projectId });

    if (!projectData) {
      return res.status(404).json({ error: true, message: "Project not found" });
    }

    // Check if the user is a collaborator or the project owner
    const isCollaborator = projectData.collaborators.some(
      (collaborator) => collaborator.userId && collaborator.userId.toString() === userId.toString()
    );

    const isOwner = projectData.ownerId && projectData.ownerId.toString() === userId.toString();


    if (!isCollaborator && !isOwner) {
      return res.status(403).json({ error: true, message: "Access denied. Not a project collaborator or owner." });
    }

    // Attach project data to request for further use if needed
    req.project = projectData;
    next();
  } catch (e) {
    console.error("Error in isUserAllowed middleware:", e);
    return res.status(500).json({ error: true, message: "Internal server error during access check" });
  }
}

