/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role authorization ('STUDENT', 'ADMIN')
 */

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Authentication is required before role checking.'
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden. This resource requires one of the following roles: [${allowedRoles.join(', ')}]. Your role is '${req.user.role}'.`
      });
    }

    next();
  };
}

const requireAdmin = requireRole('ADMIN');
const requireStudent = requireRole('STUDENT');

module.exports = {
  requireRole,
  requireAdmin,
  requireStudent
};
