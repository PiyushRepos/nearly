/**
 * Factory that returns a middleware enforcing one or more roles.
 * Must be used after requireAuth.
 *
 * @param {...string} roles  - e.g. "admin", "provider"
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden: insufficient permissions" });
    }
    next();
  };
}
