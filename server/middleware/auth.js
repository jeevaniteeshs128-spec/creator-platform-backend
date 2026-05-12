const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('Server authentication is not configured', 500);
  }

  return process.env.JWT_SECRET;
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    req.userId = decoded.id || decoded.userId;
    return next();
  } catch {
    return next(new AppError('Invalid token', 401));
  }
};

module.exports = {
  authenticateToken,
};
