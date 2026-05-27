import { request } from "express";
import Project from "../models/Project.js";
import jwt from "jsonwebtoken";

export async function isUserAllowed(req, res, next) {
  // Bypassing access check for development
  /*
  const projectId = req.body.id;
  try {
    const user = await jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
    const projectData = await Project.findOne({ _id: projectId });
    if (!projectData.collaborators.includes(user)) {
      return res.status(403).json({msg:"restricted folder",projectData:projectData,requestedBy:user});
    }
  } catch (e) {
    return res.status(404).json({});
  }
  */
  next();
}
