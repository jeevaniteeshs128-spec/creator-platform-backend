const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('./middleware/auth');
const {
  createProject,
  deleteProjectForUser,
  getPaginatedProjectsForUser,
  getProjectById,
  updateProjectForUser,
} = require('./models/Project');

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
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
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
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
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
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
});

// Get current user endpoint
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = users.find((u) => u.id === req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
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
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// Logout endpoint (client-side token deletion)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

app.get('/api/dashboard/summary', authenticateToken, (req, res) => {
  const user = users.find((entry) => entry.id === req.userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
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

app.post('/api/projects', authenticateToken, (req, res) => {
  const { title, description, status } = sanitizeProjectInput(req.body);

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a title and description',
    });
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

app.get('/api/projects/:projectId', authenticateToken, (req, res) => {
  const project = getProjectById(req.params.projectId);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  if (project.userId !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'You are not allowed to view this project',
    });
  }

  return res.json({
    success: true,
    project,
  });
});

app.put('/api/projects/:projectId', authenticateToken, (req, res) => {
  const existingProject = getProjectById(req.params.projectId);

  if (!existingProject) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  if (existingProject.userId !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'You are not allowed to update this project',
    });
  }

  const { title, description, status } = sanitizeProjectInput(req.body);

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a title and description',
    });
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

app.delete('/api/projects/:projectId', authenticateToken, (req, res) => {
  const existingProject = getProjectById(req.params.projectId);

  if (!existingProject) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  if (existingProject.userId !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'You are not allowed to delete this project',
    });
  }

  const deletedProject = deleteProjectForUser(req.params.projectId, req.userId);

  if (!deletedProject) {
    return res.status(404).json({
      success: false,
      message: 'Project not found or you do not have access',
    });
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
