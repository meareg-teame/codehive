import express from "express";
import {
  createProject,
  getProjects,
  deleteProject,
  getProjectDetails,
  createFile,
  deleteFile,
  renameFile,
  runCode,
  saveFile,
  aiExplain,
  sharedWithMe,
  removeAccess,
  accessManagement,
  joinProject
} from "../controllers/projectControllers.js";
import { checkLogin } from "../middlewares/checkLogin.js";
import { isUserAllowed } from "../middlewares/isUserAllowed.js";

const router = express.Router();
//dashboard part
router.post("/create-project", checkLogin, createProject);
router.post("/get-projects", checkLogin, getProjects);
router.post("/delete-project", checkLogin, deleteProject);
//Editor part
router.post(
  "/get-project-details",
  checkLogin,
  isUserAllowed,
  getProjectDetails
);
router.post("/create-file", checkLogin, createFile);
router.post("/delete-file", checkLogin, deleteFile);
router.post("/rename-file", checkLogin, renameFile);
router.post("/run-code", checkLogin, runCode);
router.post("/save-file", checkLogin, saveFile);
router.post("/ai-explain", aiExplain);
router.post("/shared-with-me", checkLogin, sharedWithMe);
router.post("/remove-access", checkLogin, removeAccess);
router.post("/access-management", checkLogin, accessManagement);
router.post("/join", checkLogin, joinProject);

export default router;
