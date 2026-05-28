const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const AppError = require('../utils/AppError');

const router = express.Router();

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'creator-platform',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      }
    );

    stream.end(buffer);
  });

router.post('/', authenticateToken, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image', 400));
    }

    const result = await uploadToCloudinary(req.file.buffer);

    return res.status(201).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    return next(error);
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Image size must be 5MB or less',
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }

  return next(error);
});

module.exports = router;