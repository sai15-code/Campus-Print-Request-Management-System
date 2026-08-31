/**
 * Admin Routes
 * Prefix: /api/admin
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// All Admin Endpoints Require Authentication & Admin Role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard Analytics
router.get('/dashboard-stats', adminController.getDashboardStats);

// Print Queue Spooler Management
router.get('/requests', adminController.getAllRequests);
router.get('/requests/:id', adminController.getRequestDetails);
router.patch('/requests/:id/status', adminController.updateRequestStatus);
router.put('/requests/:id/status', adminController.updateRequestStatus);

// Print Shops Management
router.get('/shops', adminController.getShops);
router.post('/shops', adminController.createShop);
router.put('/shops/:id', adminController.updateShop);
router.patch('/shops/:id/status', adminController.toggleShopStatus);

// Pricing Matrix Management
router.get('/pricing', adminController.getPricing);
router.post('/pricing', adminController.createPricing);
router.put('/pricing/:id', adminController.updatePricing);
router.delete('/pricing/:id', adminController.deletePricing);

// Students Directory Management
router.get('/students', adminController.getStudents);
router.patch('/students/:id/status', adminController.toggleStudentStatus);

// Admin Profile & Security
router.get('/profile', adminController.getProfile);
router.put('/profile', adminController.updateProfile);
router.put('/profile/password', adminController.updatePassword);

module.exports = router;
