import express from "express";
import {
  login,
  signup,
  emailVerification,
  user,
  logout,
  userInfo,
  changePassword,
  googleOauth,
  firebaseSignin,
  guestLogin,
  updateProfile
} from "../controllers/authControllers.js";
const router = express.Router();

router.post("/user", user);
router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
router.post("/user-info", userInfo);
router.post("/verification/:id", emailVerification);
router.post("/change-password", changePassword);
router.post("/update-profile", updateProfile);
router.post("/google-oauth", googleOauth);
router.post("/firebase-signin", firebaseSignin);
router.post("/guest-login", guestLogin);

export default router;
