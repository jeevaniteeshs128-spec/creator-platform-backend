const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const {
  createProject,
  deleteProjectForUser,
  getPaginatedProjectsForUser,
  getProjectById,
  updateProjectForUser,
} = require('./models/Project');
const AppError = require('./utils/AppError');

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigin = process.env.CLIENT_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
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

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS for origin: ${origin}`));
    },
  })
);

app.use(express.json());

// In-memory user store (replace with database in production)
let users = [];

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Frontend and backend are connected',
  });
});

// Register endpoint
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password', 400));
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
    };

    users.push(user);

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find user
    const user = users.find((u) => u.email === email);
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user endpoint
app.get('/api/auth/me', authenticateToken, (req, res, next) => {
  try {
    const user = users.find((u) => u.id === req.userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Logout endpoint (client-side token deletion)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

app.get('/api/dashboard/summary', authenticateToken, (req, res, next) => {
  const user = users.find((entry) => entry.id === req.userId);

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
});

app.post('/api/projects', authenticateToken, (req, res, next) => {
  const { title, description, status } = sanitizeProjectInput(req.body);

  if (!title || !description) {
    return next(new AppError('Please provide a title and description', 400));
  }

  const project = createProject({
    userId: req.userId,
    title,
    description,
    status,
  });

  return res.status(201).json({
    success: true,
    message: 'Project created successfully',
    project,
  });
});

app.get('/api/projects', authenticateToken, (req, res) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const requestedLimit = Number.parseInt(req.query.limit, 10) || 5;
  const limit = Math.min(Math.max(requestedLimit, 1), 20);
  const { items, pagination } = getPaginatedProjectsForUser(req.userId, page, limit);

  return res.json({
    success: true,
    items,
    pagination,
  });
});

app.get('/api/projects/:projectId', authenticateToken, (req, res, next) => {
  const project = getProjectById(req.params.projectId);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  if (project.userId !== req.userId) {
    return next(new AppError('You are not allowed to view this project', 403));
  }

  return res.json({
    success: true,
    project,
  });
});

app.put('/api/projects/:projectId', authenticateToken, (req, res, next) => {
  const existingProject = getProjectById(req.params.projectId);

  if (!existingProject) {
    return next(new AppError('Project not found', 404));
  }

  if (existingProject.userId !== req.userId) {
    return next(new AppError('You are not allowed to update this project', 403));
  }

  const { title, description, status } = sanitizeProjectInput(req.body);

  if (!title || !description) {
    return next(new AppError('Please provide a title and description', 400));
  }

  const project = updateProjectForUser(req.params.projectId, req.userId, {
    title,
    description,
    status,
  });

  return res.json({
    success: true,
    message: 'Project updated successfully',
    project,
  });
});

app.delete('/api/projects/:projectId', authenticateToken, (req, res, next) => {
  const existingProject = getProjectById(req.params.projectId);

  if (!existingProject) {
    return next(new AppError('Project not found', 404));
  }

  if (existingProject.userId !== req.userId) {
    return next(new AppError('You are not allowed to delete this project', 403));
  }

  const deletedProject = deleteProjectForUser(req.params.projectId, req.userId);

  if (!deletedProject) {
    return next(new AppError('Project not found or you do not have access', 404));
  }

  return res.json({
    success: true,
    message: 'Project deleted successfully',
    project: deletedProject,
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Creator Platform API is running' });
});

app.use((req, res, next) => {
  next(new AppError('Route not found', 404));
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
