/**
 * @function requireRole
 * @description Middleware to restrict access based on user roles.
 * Requires `req.user` to be populated by a previous authentication middleware.
 * Allows access if the user's role matches the required role or if the user is an 'admin'.
 * Responds with 401 if authentication is missing, or 403 if permissions are insufficient.
 * @param {string} role - The minimum role required to access the route (e.g., 'user', 'admin').
 * @returns {Function} Express middleware function.
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: true, message: "Authentication required" });
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: true, message: "Insufficient permissions" });
    }

    next();
  };
};
