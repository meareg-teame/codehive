import { verifyJwt } from "../lib/jwtUtils.js";

/**
 * @function authenticateToken
 * @description Middleware to authenticate JWT tokens from Authorization header or cookies.
 * Attaches the decoded user payload to `req.user` if authentication is successful.
 * Responds with 401 if no token is provided or if the token is invalid/expired.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.token || req.cookies.user;

  if (!token) {
    return res.status(401).json({ error: true, message: "Authentication required" });
  }

  const decoded = verifyJwt(token);
  if (!decoded) {
    return res.status(401).json({ error: true, message: "Invalid or expired token" });
  }

  if (decoded.user && !decoded.email) {
    decoded.email = decoded.user;
  }
  req.user = decoded;
  next();
};
