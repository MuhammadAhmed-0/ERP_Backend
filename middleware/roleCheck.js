// Middleware to check user roles
const checkRole = (...roles) => {
    return (req, res, next) => {
      // Assuming req.user is set by the auth middleware
      if (!req.user) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
  
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ msg: 'Access denied: Not authorized for this action' });
      }
  
      next();
    };
  };
  
  module.exports = checkRole;