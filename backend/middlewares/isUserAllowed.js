import Project from "../models/Project.js";

/**
 * @function isUserAllowed
 * @description Middleware to check if the authenticated user is allowed to access a specific project.
 * Requires `req.user` to be populated by a previous authentication middleware.
 * Determines access based on whether the user's email is in the collaborator list or is the owner.
 * Attaches the `projectData` to `req.project` if access is granted.
 * @param {Object} req - Express request object (expects `req.user.user` containing the user email).
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function isUserAllowed(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: true, message: "Authentication required" });
  }

  const userEmail = req.user.user || req.user.email;
  if (!userEmail) {
    return res.status(401).json({ error: true, message: "Authentication email is required" });
  }

  const projectId = req.params.id || req.body.id;
  if (!projectId) {
    return res.status(400).json({ error: true, message: "Project ID is required" });
  }

  try {
    const projectData = await Project.findOne({ where: { _id: projectId } });

    if (!projectData) {
      return res.status(404).json({ error: true, message: "Project not found" });
    }

    // Check if the user is the project owner
    const isOwner = projectData.owner === userEmail;

    // Check if the user is a collaborator (collaborators are stored as email strings)
    const collaborators = Array.isArray(projectData.collaborators) ? projectData.collaborators : [];
    const isCollaborator = collaborators.includes(userEmail);

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

