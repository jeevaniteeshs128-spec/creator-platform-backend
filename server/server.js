const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');

dotenv.config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { authenticateToken } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const Project = require('./models/Project');
const User = require('./models/User');
const AppError = require('./utils/AppError');

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigin = process.env.CLIENT_URL;
const defaultAllowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const allowedOrigins = new Set([...defaultAllowedOrigins, allowedOrigin].filter(Boolean));
const allowedProjectStatuses = ['draft', 'in progress', 'published'];

const sanitizeProjectInput = ({ title, description, status }) => {
  const safeTitle = typeof title === 'string' ? title.trim() : '';
  const safeDescription = typeof description === 'string' ? description.trim() : '';
  const safeStatus = allowedProjectStatuses.includes(status) ? status : 'draft';

  return {
    title: safeTitle,
    description: safeDescription,
    status: safeStatus,
  };
};

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('Server authentication is not configured', 500);
  }

  return process.env.JWT_SECRET;
};

const createProjectHandler = (io) => async (req, res, next) => {
  try {
    const { title, description, status } = sanitizeProjectInput(req.body);

    if (!title || !description) {
      return next(new AppError('Please provide a title and description', 400));
    }

    const project = await Project.create({
      userId: req.userId,
      title,
      description,
      status,
    });

    const actor = await User.findById(req.userId).select('email name role');

    io.emit('newPost', {
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt,
      },
      user: {
        id: actor?.id || req.userId,
        email: actor?.email || 'unknown',
        username: actor?.name || req.user?.username || '',
        role: actor?.role || req.user?.role || 'user',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new AppError(`Not allowed by CORS for origin: ${origin}`, 403));
    },
  })
);

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new AppError(`Not allowed by CORS for origin: ${origin}`, 403));
    },
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('email name role');

    if (!user) {
      return next(new Error('Authentication error'));
    }

    socket.user = user;
    socket.data.user = {
      id: user.id,
      email: user.email,
      username: user.name || decoded.username || '',
      role: user.role || decoded.role || 'user',
    };

    return next();
  } catch (error) {
    return next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.data.user.email}`);
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Frontend and backend are connected',
  });
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password', 400));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const payload = {
      id: user._id,
      username: user.name || user.username || '',
      role: user.role || 'user',
    };

    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    const payload = {
      id: user._id,
      username: user.name || user.username || '',
      role: user.role || 'user',
    };

    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

app.get('/api/dashboard/summary', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    return res.json({
      success: true,
      message: `Secure summary loaded for ${user.name}.`,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/projects', authenticateToken, createProjectHandler(io));

app.get('/api/projects', authenticateToken, async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const requestedLimit = Number.parseInt(req.query.limit, 10) || 5;
    const limit = Math.min(Math.max(requestedLimit, 1), 20);
    const currentPage = Math.max(page, 1);
    const skip = (currentPage - 1) * limit;

    const [items, totalItems] = await Promise.all([
      Project.find({ userId: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Project.countDocuments({ userId: req.userId }),
    ]);

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

    return res.json({
      success: true,
      items,
      pagination: {
        currentPage,
        pageSize: limit,
        skip,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/projects/:projectId', authenticateToken, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    if (project.userId.toString() !== req.userId) {
      return next(new AppError('You are not allowed to view this project', 403));
    }

    return res.json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/projects/:projectId', authenticateToken, async (req, res, next) => {
  try {
    const existingProject = await Project.findById(req.params.projectId);

    if (!existingProject) {
      return next(new AppError('Project not found', 404));
    }

    if (existingProject.userId.toString() !== req.userId) {
      return next(new AppError('You are not allowed to update this project', 403));
    }

    const { title, description, status } = sanitizeProjectInput(req.body);

    if (!title || !description) {
      return next(new AppError('Please provide a title and description', 400));
    }

    existingProject.title = title;
    existingProject.description = description;
    existingProject.status = status;
    const project = await existingProject.save();

    return res.json({
      success: true,
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/projects/:projectId', authenticateToken, async (req, res, next) => {
  try {
    const existingProject = await Project.findById(req.params.projectId);

    if (!existingProject) {
      return next(new AppError('Project not found', 404));
    }

    if (existingProject.userId.toString() !== req.userId) {
      return next(new AppError('You are not allowed to delete this project', 403));
    }

    await existingProject.deleteOne();

    return res.json({
      success: true,
      message: 'Project deleted successfully',
      project: existingProject,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Creator Platform API is running' });
});

app.use((req, res, next) => {
  next(new AppError('Route not found', 404));
});

app.use(errorHandler);

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });

module.exports = app;
module.exports.io = io;
module.exports.server = server;
