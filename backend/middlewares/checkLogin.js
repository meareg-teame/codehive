import { verifyJwt } from "../lib/jwtUtils.js";

/**
 * @function checkLogin
 * @description Middleware to check for user login status via a JWT in cookies.
 * If a valid token is found, decodes it and attaches the user payload to `req.user`.
 * Responds with 401 if no user cookie is present or if the token is invalid/expired.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function checkLogin(req, res, next) {
  if (!req.cookies.user) {
    return res.status(401).json({ msg: "logged out" });
  }
  const decoded = verifyJwt(req.cookies.user);
  if (!decoded) {
    return res.status(401).json({ msg: "logged out" });
  }
  req.user = decoded;
  next();
}
