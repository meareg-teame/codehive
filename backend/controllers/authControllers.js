import Account from "../models/Account.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import sendVerificationLink from "../services/sendVerificationLink.js";
import jwt from "jsonwebtoken";
import admin from "../lib/firebase.js";

const DEV_USER = "local@codecollab.dev";

export async function user(req, res) {
  try {
    jwt.verify(req.cookies.user, process.env.JWT_SECRET);
    return res.status(200).json({});
  } catch (e) {
    return res.status(401).json({ msg: "unauthorized" });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const userData = await Account.findOne({ where: { email: email } });
  if (userData === null) {
    return res.status(404).json({ msg: "user does not exists" });
  }
  if (userData.password === "") {
    return res.status(404).json({ msg: "login through google" });
  }
  if (
    email !== userData.email ||
    !(await bcrypt.compare(password, userData.password))
  ) {
    return res.status(401).json({ msg: "incorrect credentials" });
  }
  const token = jwt.sign({ user: email }, process.env.JWT_SECRET);
  const isProduction = !(process.env.BACKEND_URL === "http://localhost:8080");
  res.cookie("user", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  return res.status(200).json({ msg: "login success" });
}

export async function signup(req, res) {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  let userData = await Account.findOne({ where: { email: email } });
  if (userData !== null && userData.isVerified === true) {
    return res.status(409).json({ msg: "user already exists" });
  }
  if (userData == null) {
    await Account.create({
      email: email,
      name: name,
      password: hashedPassword,
      isVerified: true,
    });
  } else {
    await Account.update(
      { name: name, password: hashedPassword, isVerified: true },
      { where: { email: email } }
    );
  }
  return res.status(200).json({ msg: "success" });
}

export async function emailVerification(req, res) {
  const id = req.params.id;
  const userData = await Account.findByPk(id);
  const timeDiff = parseInt(
    (new Date().getTime() - userData.verificationLinkSendingTime) / 1000
  );
  if (userData.isVerified) {
    return res.render("../views/emailVerified.ejs");
  } else {
    if (timeDiff > 600) res.render("../views/emailVerificationLinkExpired.ejs");
    else {
      await Account.update({ isVerified: true }, { where: { _id: id } });
      return res.render("../views/emailVerified.ejs");
    }
  }
}

export async function logout(req, res) {
  try {
    const isProduction = !(process.env.BACKEND_URL === "http://localhost:8080");
    res.clearCookie("user", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    return res.status(200).json({});
  } catch (e) {
    return res.status(404).json({});
  }
}

export async function userInfo(req, res) {
  if (!req.cookies.user) {
    return res.status(401).json({ msg: "unauthorized" });
  }
  try {
    const decoded = jwt.verify(req.cookies.user, process.env.JWT_SECRET);
    const user = decoded.user;
    if (user === DEV_USER) {
      return res.json({
        userData: {
          name: "Guest User",
          email: DEV_USER,
          photoUrl: "",
        },
      });
    }
    const userData = await Account.findOne({ where: { email: user } });
    if (!userData) {
      return res.status(404).json({ msg: "user not found" });
    }
    return res.json({ userData });
  } catch (e) {
    return res.status(401).json({ msg: "unauthorized" });
  }
}

export async function changePassword(req, res) {
  let user;
  try {
    user = await jwt.verify(req.cookies.user, process.env.JWT_SECRET).user;
  } catch (e) {
    return res.status(401).json({});
  }

  const { oldPassword, newPassword } = req.body;
  const userData = await Account.findOne({ where: { email: user } });
  if (userData.password === "")
    return res
      .status(405)
      .json({ msg: "Changing password not allowed for this account!" });

  const isOldPasswordRight = await bcrypt.compare(
    oldPassword,
    userData.password
  );
  if (!isOldPasswordRight)
    return res.status(400).json({ msg: "The old password is incorrect!" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await Account.update({ password: hashedPassword }, { where: { email: user } });

  return res.status(200).json({ msg: "Password changed!" });
}

export async function googleOauth(req, res) {
  const { email, name, photoUrl } = req.body;
  const userData = await Account.findOne({ where: { email: email } });
  const isProduction = !(process.env.BACKEND_URL === "http://localhost:8080");
  const token = jwt.sign({ user: email }, process.env.JWT_SECRET);
  if (userData !== null) {
    res.cookie("user", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    return res.status(200).json({});
  }
  await Account.create({ email: email, name: name, photoUrl: photoUrl, isVerified:true });
  res.cookie("user", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  return res.status(200).json({});
}

export async function guestLogin(req, res) {
  const email = "local@codecollab.dev";
  const token = jwt.sign({ user: email }, process.env.JWT_SECRET);
  const isProduction = !(process.env.BACKEND_URL === "http://localhost:8080");
  
  res.cookie("user", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(200).json({ msg: "Guest login success", email });
}


export async function firebaseSignin(req, res) {
  const { idToken } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    let user = await User.findOne({ where: { firebaseUID: uid } });
    if (!user) {
      user = await User.create({
        firebaseUID: uid,
        email: email,
        displayName: name,
        photoURL: picture,
        role: 'user'
      });
    } else {
      await User.update({ lastActiveAt: new Date() }, { where: { firebaseUID: uid } });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const isProduction = !(process.env.BACKEND_URL === "http://localhost:8080");
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Firebase verify error:", error);
    return res.status(401).json({ error: true, message: "Invalid Firebase token" });
  }
}
