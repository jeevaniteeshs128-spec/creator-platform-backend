const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const getJwtSecret = () => process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    req.userId = decoded.userId;
    return next();
  } catch (error) {
    return next(new AppError('Invalid token', 401));
  }
};

module.exports = {
  authenticateToken,
};
