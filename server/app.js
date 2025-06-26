// server/app.js - Updated version
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const fetch = require('node-fetch'); // Add fetch for Node.js
require('dotenv').config();

const sequelize = require('./config/database');
require('./models'); // This will run models/index.js and set up associations

const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();

// Fix: Enable trust proxy for correct client IP detection (for rate limiting, logging, etc.)
app.set('trust proxy', 1); // or true

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://globeflight.co.ke',
    'https://www.globeflight.co.ke'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploads statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/services', require('./routes/services'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/team', require('./routes/team'));
app.use('/api/communication', require('./routes/communication'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/feedback', require('./routes/feedback'));

// Simple email API endpoint for frontend compatibility
app.post('/email-api', async (req, res) => {
  try {
    // Forward the request to the contacts API
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/contacts/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    if (response.ok) {
      res.json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Email API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Seed super admin
async function seedSuperAdmin() {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const fullName = 'Super Admin';

    if (!email || !password) {
      console.log('Super admin credentials not found in environment variables');
      return;
    }

    const existing = await User.findOne({ where: { email } });
    if (!existing) {
      const hashed = await bcrypt.hash(password, 10);
      await User.create({
        email,
        password: hashed,
        fullName,
        role: 'superadmin',
        isActive: true
      });
      console.log('Super admin seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding super admin:', error);
  }
}

// Initialize database
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully');
    // Only use alter in development if you are the DB owner
    // return sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    return sequelize.sync(); // <-- Use this for production or if you are not the owner
  })
  .then(() => {
    return seedSuperAdmin();
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
  });

module.exports = app;

