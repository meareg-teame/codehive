import jwt from "jsonwebtoken";

export async function checkLogin(req, res, next) {
  if (!req.cookies.user) {
    return res.status(401).json({ msg: "logged out" });
  }
  try {
    const decoded = jwt.verify(req.cookies.user, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ msg: "logged out" });
  }
}
