/**
 * Admin Controller
 * Handles administrative actions: Dashboard statistics, Spooler queue,
 * Status transitions, Print shops, Pricing matrix, Students directory, and Admin profile.
 */

const adminService = require('../services/adminService');

/**
 * GET /api/admin/dashboard-stats
 */
async function getDashboardStats(req, res, next) {
  try {
    const stats = await adminService.getAdminDashboardStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/requests
 */
async function getAllRequests(req, res, next) {
  try {
    const { status, shopId, search, sortBy, limit, page } = req.query;
    const pageNum = parseInt(page || 1, 10);
    const limitNum = parseInt(limit || 50, 10);
    const offset = (pageNum - 1) * limitNum;

    const requests = await adminService.getAllRequests({
      status,
      shopId,
      search,
      sortBy,
      limit: limitNum,
      offset
    });

    res.status(200).json({
      success: true,
      data: {
        total: requests.length,
        page: pageNum,
        requests
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/requests/:id
 */
async function getRequestDetails(req, res, next) {
  try {
    const requestId = req.params.id;
    const request = await adminService.getAdminRequestDetails(requestId);
    res.status(200).json({
      success: true,
      data: { request }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/requests/:id/status or PUT /api/admin/requests/:id/status
 */
async function updateRequestStatus(req, res, next) {
  try {
    const requestId = req.params.id;
    const { status, note, operatorNote } = req.body;
    const operatorId = req.user.userId;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Target status is required (e.g. ACCEPTED, PRINTING, READY, COLLECTED, REJECTED).'
      });
    }

    const updatedRequest = await adminService.updateRequestStatus(
      requestId,
      status,
      operatorId,
      operatorNote || note
    );

    res.status(200).json({
      success: true,
      message: `Print request status updated to ${status}.`,
      data: {
        request: updatedRequest
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Print Shops Management
 */
async function getShops(req, res, next) {
  try {
    const shops = await adminService.getAllShops();
    res.status(200).json({
      success: true,
      data: { shops }
    });
  } catch (error) {
    next(error);
  }
}

async function createShop(req, res, next) {
  try {
    const { name, location } = req.body;
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        error: 'Shop name and location are required.'
      });
    }

    const shop = await adminService.createShop(req.body);
    res.status(201).json({
      success: true,
      message: 'Print shop created successfully.',
      data: { shop }
    });
  } catch (error) {
    next(error);
  }
}

async function updateShop(req, res, next) {
  try {
    const shopId = req.params.id;
    const shop = await adminService.updateShop(shopId, req.body);
    res.status(200).json({
      success: true,
      message: 'Print shop updated successfully.',
      data: { shop }
    });
  } catch (error) {
    next(error);
  }
}

async function toggleShopStatus(req, res, next) {
  try {
    const shopId = req.params.id;
    const result = await adminService.toggleShopStatus(shopId);
    res.status(200).json({
      success: true,
      message: `Print shop status changed to ${result.status}.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Pricing Management
 */
async function getPricing(req, res, next) {
  try {
    const pricing = await adminService.getAllPricing();
    res.status(200).json({
      success: true,
      data: { pricing }
    });
  } catch (error) {
    next(error);
  }
}

async function createPricing(req, res, next) {
  try {
    const { shopId, printType, side, pricePerPage } = req.body;
    if (!shopId || !printType || !side || pricePerPage === undefined) {
      return res.status(400).json({
        success: false,
        error: 'shopId, printType (B&W/Color), side (Single/Double), and pricePerPage are required.'
      });
    }

    const pricing = await adminService.createPricing(req.body);
    res.status(201).json({
      success: true,
      message: 'Pricing rate added successfully.',
      data: { pricing }
    });
  } catch (error) {
    next(error);
  }
}

async function updatePricing(req, res, next) {
  try {
    const pricingId = req.params.id;
    const pricing = await adminService.updatePricing(pricingId, req.body);
    res.status(200).json({
      success: true,
      message: 'Pricing rate updated successfully.',
      data: { pricing }
    });
  } catch (error) {
    next(error);
  }
}

async function deletePricing(req, res, next) {
  try {
    const pricingId = req.params.id;
    await adminService.deletePricing(pricingId);
    res.status(200).json({
      success: true,
      message: 'Pricing record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Students Directory Management
 */
async function getStudents(req, res, next) {
  try {
    const { search, status, limit, page } = req.query;
    const pageNum = parseInt(page || 1, 10);
    const limitNum = parseInt(limit || 50, 10);
    const offset = (pageNum - 1) * limitNum;

    const students = await adminService.getAllStudents({
      search,
      status,
      limit: limitNum,
      offset
    });

    res.status(200).json({
      success: true,
      data: {
        total: students.length,
        page: pageNum,
        students
      }
    });
  } catch (error) {
    next(error);
  }
}

async function toggleStudentStatus(req, res, next) {
  try {
    const studentId = req.params.id;
    const result = await adminService.toggleStudentStatus(studentId);
    res.status(200).json({
      success: true,
      message: `Student account status updated to ${result.status}.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin Profile Management
 */
async function getProfile(req, res, next) {
  try {
    const adminId = req.user.userId;
    const profile = await adminService.getAdminProfile(adminId);
    res.status(200).json({
      success: true,
      data: { admin: profile }
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const adminId = req.user.userId;
    const updated = await adminService.updateAdminProfile(adminId, req.body);
    res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully.',
      data: { admin: updated }
    });
  } catch (error) {
    next(error);
  }
}

async function updatePassword(req, res, next) {
  try {
    const adminId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    const result = await adminService.updateAdminPassword(adminId, currentPassword, newPassword);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getAllRequests,
  getRequestDetails,
  updateRequestStatus,
  getShops,
  createShop,
  updateShop,
  toggleShopStatus,
  getPricing,
  createPricing,
  updatePricing,
  deletePricing,
  getStudents,
  toggleStudentStatus,
  getProfile,
  updateProfile,
  updatePassword
};
