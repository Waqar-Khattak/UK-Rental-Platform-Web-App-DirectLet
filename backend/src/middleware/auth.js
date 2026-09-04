// Authentication Middleware
// Phase 1: JWT Verification

const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded?.id) {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
          };
        }
      }
    } catch (error) {
      console.log('Invalid token:', error.message);
    }
  }

  next();
};

module.exports = authMiddleware;
