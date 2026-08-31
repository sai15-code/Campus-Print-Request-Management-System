/**
 * Campus Print Request Management System - Express API Backend
 * Main Entry Point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import Controllers for convenient top-level alias endpoints
const studentController = require('./controllers/studentController');
const { authenticateToken } = require('./middleware/auth');
const { requireStudent } = require('./middleware/role');

// Import Error Middleware
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Stack
app.use(cors({
  origin: '*', // In production, restrict to frontend domain
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging Middleware (in development)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Campus Print Request Management Backend API'
  });
});

// Top-Level Public Alias Routes (for frontend direct access)
app.get('/api/shops', studentController.getActiveShops);
app.get('/api/pricing', studentController.getPricing);

// Top-Level Student Request Aliases (convenient routes matching frontend patterns)
app.post('/api/requests', authenticateToken, requireStudent, studentController.createPrintRequest);
app.get('/api/requests/my-requests', authenticateToken, requireStudent, studentController.getMyRequests);
app.get('/api/requests/:id', authenticateToken, studentController.getRequestDetails);

// Modular API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// 404 Catch-all handler
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server & Connect to MySQL Database
async function startServer() {
  console.log('====================================================');
  console.log(' CAMPUS PRINT REQUEST MANAGEMENT SYSTEM - BACKEND   ');
  console.log('====================================================');

  await testConnection();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Express REST API is running on port ${PORT}`);
    console.log(`[Server] Base URL: http://localhost:${PORT}/api`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    console.log('====================================================');
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
