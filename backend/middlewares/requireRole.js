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
