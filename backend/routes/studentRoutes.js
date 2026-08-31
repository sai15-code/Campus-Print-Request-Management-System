/**
 * Student Routes
 * Prefix: /api/student (or mounted at /api)
 */

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/auth');
const { requireStudent } = require('../middleware/role');

// Public endpoints for browsing active shops and pricing matrix
router.get('/shops', studentController.getActiveShops);
router.get('/pricing', studentController.getPricing);

// Student Protected Endpoints (Requires Student JWT)
router.use(authenticateToken);
router.use(requireStudent);

router.get('/dashboard-stats', studentController.getDashboardStats);
router.get('/requests', studentController.getMyRequests);
router.get('/requests/my-requests', studentController.getMyRequests);
router.post('/requests', studentController.createPrintRequest);
router.get('/requests/:id', studentController.getRequestDetails);
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

module.exports = router;
