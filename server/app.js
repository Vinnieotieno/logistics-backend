// server/app.js - Updated version
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
// const fetch = require('node-fetch'); // Commented out to reduce memory usage
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
app.use('/admin/api/', limiter);

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

// Health check for Railway
app.get('/admin/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/admin/api/auth', require('./routes/auth'));
app.use('/admin/api/users', require('./routes/users'));
app.use('/admin/api/blogs', require('./routes/blogs'));
app.use('/admin/api/categories', require('./routes/categories'));
app.use('/admin/api/services', require('./routes/services'));
app.use('/admin/api/contacts', require('./routes/contacts'));
app.use('/admin/api/testimonials', require('./routes/testimonials'));
app.use('/admin/api/jobs', require('./routes/jobs'));
app.use('/admin/api/tracking', require('./routes/tracking'));
app.use('/admin/api/dashboard', require('./routes/dashboard'));
app.use('/admin/api/team', require('./routes/team'));
app.use('/admin/api/communication', require('./routes/communication'));
app.use('/admin/api/staff', require('./routes/staff'));
app.use('/admin/api/feedback', require('./routes/feedback'));

// Simple email API endpoint for frontend compatibility
app.post('/email-api', async (req, res) => {
  try {
    // Forward the request to the contacts API using built-in http module
    const http = require('http');
    const url = require('url');
    
    const parsedUrl = url.parse(`${req.protocol}://${req.get('host')}/admin/api/contacts/public`);
    
    const postData = JSON.stringify(req.body);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (req.protocol === 'https' ? 443 : 80),
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const request = http.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (response.statusCode >= 200 && response.statusCode < 300) {
            res.json(jsonData);
          } else {
            res.status(response.statusCode).json(jsonData);
          }
        } catch (error) {
          res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
          });
        }
      });
    });
    
    request.on('error', (error) => {
      console.error('Email API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    });
    
    request.write(postData);
    request.end();
    
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

