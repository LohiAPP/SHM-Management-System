const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action' }
      });
    }
    next();
  };
};

const requireDepartmentAccess = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }});
  
  if (req.user.role === 'ADMIN') return next();

  // If endpoint specifies a department in body or query, verify it matches
  const targetDept = req.body.department_id || req.query.department_id || req.params.departmentId;
  
  if (targetDept && targetDept !== req.user.departmentId) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Cross-department access is forbidden' }
    });
  }

  next();
};

module.exports = {
  requireRole,
  requireDepartmentAccess
};
