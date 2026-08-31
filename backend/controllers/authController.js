/**
 * Authentication Controller
 * Handles Student Registration, Student/Admin Login, and Token Session Verification.
 */

const authService = require('../services/authService');
const { validateRegisterInput, validateLoginInput } = require('../utils/validators');

/**
 * Student Registration
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { isValid, errors } = validateRegisterInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: errors[0]
      });
    }

    const { user, token } = await authService.registerStudent(req.body);

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Student Login
 * POST /api/auth/login or POST /api/auth/student/login
 */
async function studentLogin(req, res, next) {
  try {
    const { isValid, errors } = validateLoginInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: errors[0]
      });
    }

    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({
      email,
      password,
      expectedRole: 'STUDENT'
    });

    res.status(200).json({
      success: true,
      message: 'Student logged in successfully.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin Login
 * POST /api/auth/admin/login
 */
async function adminLogin(req, res, next) {
  try {
    const { isValid, errors } = validateLoginInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: errors[0]
      });
    }

    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({
      email,
      password,
      expectedRole: 'ADMIN'
    });

    res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully.',
      data: {
        admin: {
          ...user,
          role: 'Super Admin',
          permissions: [
            'Full System Access',
            'Manage Print Queue & Transitions',
            'Manage Print Centers',
            'Manage Per-Page Pricing',
            'Student User Controls'
          ]
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * General Login (auto-detects role)
 * POST /api/auth/login
 */
async function generalLogin(req, res, next) {
  try {
    const { isValid, errors } = validateLoginInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: errors[0]
      });
    }

    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({
      email,
      password
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Current User Profile (JWT Session Check)
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.userId);
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  studentLogin,
  adminLogin,
  generalLogin,
  getMe
};
