const multer = require('multer');
const AppError = require('../utils/AppError');

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new AppError('Only jpeg, png, webp, and gif images are allowed', 400));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;