/**
 * Student Controller
 * Handles student requests for statistics, active shops, pricing,
 * creating print jobs, order history, and student profile.
 */

const studentService = require('../services/studentService');
const { validatePrintRequestInput } = require('../utils/validators');

/**
 * GET /api/student/dashboard-stats
 */
async function getDashboardStats(req, res, next) {
  try {
    const studentId = req.user.userId;
    const result = await studentService.getDashboardStats(studentId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/student/shops or GET /api/shops
 */
async function getActiveShops(req, res, next) {
  try {
    const shops = await studentService.getActiveShops();
    res.status(200).json({
      success: true,
      data: { shops }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/student/pricing or GET /api/pricing
 */
async function getPricing(req, res, next) {
  try {
    const shopId = req.query.shopId;
    const pricing = await studentService.getActivePricing(shopId);
    res.status(200).json({
      success: true,
      data: { pricing }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/student/requests or POST /api/requests
 */
async function createPrintRequest(req, res, next) {
  try {
    const studentId = req.user.userId;

    const { isValid, errors, sanitized } = validatePrintRequestInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: errors[0]
      });
    }

    const createdRequest = await studentService.createPrintRequest(studentId, sanitized);

    res.status(201).json({
      success: true,
      message: 'Print request submitted successfully to campus print queue.',
      data: {
        request: createdRequest
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/student/requests or GET /api/requests/my-requests
 */
async function getMyRequests(req, res, next) {
  try {
    const studentId = req.user.userId;
    const { status, search, limit, page } = req.query;

    const pageNum = parseInt(page || 1, 10);
    const limitNum = parseInt(limit || 50, 10);
    const offset = (pageNum - 1) * limitNum;

    const requests = await studentService.getStudentRequests(studentId, {
      status,
      search,
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
 * GET /api/student/requests/:id or GET /api/requests/:id
 */
async function getRequestDetails(req, res, next) {
  try {
    const studentId = req.user.userId;
    const requestId = req.params.id;

    const request = await studentService.getRequestDetails(requestId, studentId);

    res.status(200).json({
      success: true,
      data: { request }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/student/profile
 */
async function getProfile(req, res, next) {
  try {
    const studentId = req.user.userId;
    const profile = await studentService.getStudentProfile(studentId);
    res.status(200).json({
      success: true,
      data: { user: profile }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/student/profile
 */
async function updateProfile(req, res, next) {
  try {
    const studentId = req.user.userId;
    const { name, phone, department, semester } = req.body;

    const updated = await studentService.updateStudentProfile(studentId, {
      name,
      phone,
      department,
      semester
    });

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully.',
      data: { user: updated }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getActiveShops,
  getPricing,
  createPrintRequest,
  getMyRequests,
  getRequestDetails,
  getProfile,
  updateProfile
};
