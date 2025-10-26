const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import configurations
const { db } = require('./config/firebase');

// Import routes
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3002; // Changed from 3001 to 3002

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Playrush Backend Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const firebaseStatus = db ? 'connected' : 'disconnected';
  res.json({
    status: 'healthy',
    services: {
      firebase: firebaseStatus,
      walletAuth: 'enabled'
    },
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
