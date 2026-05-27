export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: true, message: "Authentication required" });
    }

    const userRole = req.user.role || "guest";
    
    // Role hierarchy: admin > user > guest
    const roleHierarchy = {
      admin: 3,
      user: 2,
      guest: 1
    };

    if (roleHierarchy[userRole] < roleHierarchy[role]) {
      return res.status(403).json({ 
        error: true, 
        message: `Access denied. Required role: ${role}` 
      });
    }

    next();
  };
}
