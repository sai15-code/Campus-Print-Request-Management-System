/**
 * Authentication Routes
 * Prefix: /api/auth
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public Auth Endpoints
router.post('/register', authController.register);
router.post('/login', authController.generalLogin);
router.post('/student/login', authController.studentLogin);
router.post('/admin/login', authController.adminLogin);

// Protected Token Verification Endpoint
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
