/**
 * Campus Print Request Management System - Frontend API Client
 * Centralized fetch helper for communicating with Express.js + MySQL backend.
 * Base URL: http://localhost:5000/api
 */

import { PREVIEW_MOCKS_ENABLED, previewRequest } from './previewMockApi.js';

export { PREVIEW_MOCKS_ENABLED };

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
const STUDENT_TOKEN_KEY = 'campus_student_token';
const ADMIN_TOKEN_KEY = 'campus_admin_token';
const LEGACY_TOKEN_KEY = 'campus_print_token';

// ============================================================================
// TOKEN MANAGEMENT HELPERS (TAB & ROLE ISOLATED)
// ============================================================================

/**
 * Retrieve the stored Student JWT token from sessionStorage / localStorage
 * @returns {string | null}
 */
export function getStudentToken() {
  return (
    sessionStorage.getItem(STUDENT_TOKEN_KEY) ||
    localStorage.getItem(STUDENT_TOKEN_KEY) ||
    sessionStorage.getItem(LEGACY_TOKEN_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_KEY)
  );
}

/**
 * Retrieve the stored Admin JWT token from sessionStorage / localStorage
 * @returns {string | null}
 */
export function getAdminToken() {
  return (
    sessionStorage.getItem(ADMIN_TOKEN_KEY) ||
    localStorage.getItem(ADMIN_TOKEN_KEY) ||
    sessionStorage.getItem(LEGACY_TOKEN_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_KEY)
  );
}

/**
 * Retrieve a token by optional role specification ('admin' | 'student')
 * @param {'admin' | 'student' | null} [role=null]
 * @returns {string | null}
 */
export function getToken(role = null) {
  if (role === 'admin') return getAdminToken();
  if (role === 'student') return getStudentToken();
  return getStudentToken() || getAdminToken();
}

/**
 * Persist Student JWT token to sessionStorage and localStorage
 * @param {string} token
 */
export function setStudentToken(token) {
  if (token) {
    sessionStorage.setItem(STUDENT_TOKEN_KEY, token);
    localStorage.setItem(STUDENT_TOKEN_KEY, token);
  }
}

/**
 * Persist Admin JWT token to sessionStorage and localStorage
 * @param {string} token
 */
export function setAdminToken(token) {
  if (token) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

/**
 * Persist JWT token to appropriate role storage
 * @param {string} token
 * @param {'admin' | 'student' | null} [role=null]
 */
export function setToken(token, role = null) {
  if (role === 'admin') {
    setAdminToken(token);
  } else if (role === 'student') {
    setStudentToken(token);
  } else {
    setStudentToken(token);
  }
}

/**
 * Remove stored Student JWT token and user profile
 */
export function removeStudentToken() {
  sessionStorage.removeItem(STUDENT_TOKEN_KEY);
  localStorage.removeItem(STUDENT_TOKEN_KEY);
  sessionStorage.removeItem('campus_student_user');
  localStorage.removeItem('campus_student_user');
  sessionStorage.removeItem('campus_print_user');
  localStorage.removeItem('campus_print_user');
}

/**
 * Remove stored Admin JWT token and admin profile
 */
export function removeAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem('campus_admin_user');
  localStorage.removeItem('campus_admin_user');
  sessionStorage.removeItem('campus_print_admin');
  localStorage.removeItem('campus_print_admin');
}

/**
 * Remove stored JWT token
 * @param {'admin' | 'student' | null} [role=null]
 */
export function removeToken(role = null) {
  if (role === 'admin') {
    removeAdminToken();
  } else if (role === 'student') {
    removeStudentToken();
  } else {
    removeStudentToken();
    removeAdminToken();
    sessionStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }
}

/**
 * Check if a token is present for a role
 * @param {'admin' | 'student' | null} [role=null]
 * @returns {boolean}
 */
export function isAuthenticated(role = null) {
  return Boolean(getToken(role));
}

// ============================================================================
// CORE FETCH REQUEST WRAPPER
// ============================================================================

/**
 * Base HTTP request wrapper around fetch() with automatic role-isolated JWT header injection,
 * JSON serialization/deserialization, and unified error handling.
 *
 * @param {string} endpoint - API path (e.g. '/auth/login', '/student/requests', '/admin/requests')
 * @param {object} [options={}] - Fetch configuration options
 * @returns {Promise<any>} Parsed JSON response data
 */
export async function request(endpoint, options = {}) {
  if (PREVIEW_MOCKS_ENABLED) {
    return previewRequest(endpoint, options);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Determine which isolated token to attach based on endpoint path
  let token = null;
  if (endpoint.startsWith('/admin')) {
    token = getAdminToken();
  } else if (endpoint.startsWith('/student')) {
    token = getStudentToken();
  } else {
    token = getStudentToken() || getAdminToken();
  }

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      const errorMessage =
        data?.error ||
        data?.message ||
        `HTTP ${response.status}: ${response.statusText || 'Request failed'}`;

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = new Error(
        `Unable to connect to backend server at ${API_BASE_URL}. Please ensure the Express server is running on port 5000.`
      );
      networkError.status = 0;
      throw networkError;
    }
    throw err;
  }
}

// ============================================================================
// SYSTEM & HEALTH APIs
// ============================================================================

/**
 * Health check endpoint to verify backend connectivity
 * GET /api/health
 */
export async function checkHealth() {
  return request('/health');
}

// ============================================================================
// AUTHENTICATION APIs
// ============================================================================

/**
 * Unified Login (detects Student vs Admin role and stores in isolated token slot)
 * POST /api/auth/login
 * @param {string} email
 * @param {string} password
 * @param {'ADMIN' | 'STUDENT' | null} [roleHint=null]
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function login(email, password, roleHint = null) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: { email, password }
  });

  const token = res?.data?.token;
  const user = res?.data?.user;
  const role = user?.role?.toUpperCase() || roleHint;

  if (token) {
    if (role === 'ADMIN') {
      setAdminToken(token);
      sessionStorage.setItem('campus_admin_user', JSON.stringify(user));
      localStorage.setItem('campus_admin_user', JSON.stringify(user));
    } else {
      setStudentToken(token);
      sessionStorage.setItem('campus_student_user', JSON.stringify(user));
      localStorage.setItem('campus_student_user', JSON.stringify(user));
    }
  }

  return res.data;
}

/**
 * Student Login
 * POST /api/auth/student/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function studentLogin(email, password) {
  return login(email, password, 'STUDENT');
}

/**
 * Admin Login
 * POST /api/auth/admin/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ admin: object, token: string }>}
 */
export async function adminLogin(email, password) {
  return login(email, password, 'ADMIN');
}

/**
 * Student Registration
 * POST /api/auth/register
 * @param {object} userData - { name, email, password, rollNumber, department, semester, phone }
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function register(userData) {
  const res = await request('/auth/register', {
    method: 'POST',
    body: userData
  });

  if (res?.data?.token) {
    setStudentToken(res.data.token);
    if (res.data.user) {
      sessionStorage.setItem('campus_student_user', JSON.stringify(res.data.user));
      localStorage.setItem('campus_student_user', JSON.stringify(res.data.user));
    }
  }

  return res.data;
}

/**
 * Get Current Authenticated User (Session Verification)
 * GET /api/auth/me
 * @returns {Promise<object>} Current user record
 */
export async function getCurrentUser() {
  const res = await request('/auth/me');
  return res?.data?.user;
}

/**
 * Client-side logout helper
 */
export function logout() {
  removeToken();
}

// ============================================================================
// PUBLIC BROWSING APIs (Shops & Pricing Matrix)
// ============================================================================

/**
 * Get all active campus print shops
 * GET /api/shops
 * @returns {Promise<Array<object>>}
 */
export async function getShops() {
  const res = await request('/shops');
  return res?.data?.shops || [];
}

/**
 * Get active per-page pricing matrix
 * GET /api/pricing or GET /api/pricing?shopId=xxx
 * @param {string} [shopId]
 * @returns {Promise<Array<object>>}
 */
export async function getPricing(shopId) {
  const query = shopId ? `?shopId=${encodeURIComponent(shopId)}` : '';
  const res = await request(`/pricing${query}`);
  return res?.data?.pricing || [];
}

// ============================================================================
// STUDENT APIs
// ============================================================================

/**
 * Get Student Dashboard Statistics & Recent Jobs
 * GET /api/student/dashboard-stats
 * @returns {Promise<{ stats: object, recentRequests: Array<object> }>}
 */
export async function getStudentDashboardStats() {
  const res = await request('/student/dashboard-stats');
  return res?.data || { stats: {}, recentRequests: [] };
}

/**
 * Get Student's Own Print Request History (with optional filters)
 * GET /api/student/requests
 * @param {object} [params={}] - { status, search, limit, page }
 * @returns {Promise<{ total: number, page: number, requests: Array<object> }>}
 */
export async function getStudentRequests(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== 'ALL') searchParams.append('status', params.status);
  if (params.search) searchParams.append('search', params.search);
  if (params.limit) searchParams.append('limit', params.limit);
  if (params.page) searchParams.append('page', params.page);

  const queryString = searchParams.toString();
  const endpoint = `/student/requests${queryString ? `?${queryString}` : ''}`;
  const res = await request(endpoint);
  return res?.data || { total: 0, page: 1, requests: [] };
}

/**
 * Get Single Print Request Details & Chronological Timeline by ID
 * GET /api/student/requests/:id
 * @param {string} id - Request ID (e.g. 'REQ-2024-001')
 * @returns {Promise<object>} Complete print request object with timeline
 */
export async function getStudentRequest(id) {
  const res = await request(`/student/requests/${id}`);
  return res?.data?.request;
}

/**
 * Submit New Print Request to Campus Print Spooler
 * POST /api/student/requests
 * @param {object} data - { shopId, documentName, pages, copies, printType, side, fileSize, specialInstructions, paymentMethod }
 * @returns {Promise<object>} Created print request
 */
export async function createPrintRequest(data) {
  const res = await request('/student/requests', {
    method: 'POST',
    body: data
  });
  return res?.data?.request;
}

/**
 * Get Student Profile & Lifetime Order Aggregate Metrics
 * GET /api/student/profile
 * @returns {Promise<object>} Student user profile
 */
export async function getStudentProfile() {
  const res = await request('/student/profile');
  return res?.data?.user;
}

/**
 * Update Student Profile
 * PUT /api/student/profile
 * @param {object} data - { name, phone, department, semester }
 * @returns {Promise<object>} Updated student profile
 */
export async function updateStudentProfile(data) {
  const res = await request('/student/profile', {
    method: 'PUT',
    body: data
  });
  return res?.data?.user;
}

// ============================================================================
// ADMIN APIs
// ============================================================================

/**
 * Get Admin Dashboard Metrics & Recent Jobs
 * GET /api/admin/dashboard-stats
 * @returns {Promise<{ metrics: object, recentRequests: Array<object> }>}
 */
export async function getAdminDashboardStats() {
  const res = await request('/admin/dashboard-stats');
  return res?.data || { metrics: {}, recentRequests: [] };
}

/**
 * Get All Print Requests (Queue Spooler) with optional filters
 * GET /api/admin/requests
 * @param {object} [params={}] - { status, shopId, search, sortBy, limit, offset }
 * @returns {Promise<{ total: number, page: number, requests: Array<object> }>}
 */
export async function getAdminRequests(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== 'ALL') searchParams.append('status', params.status);
  if (params.shopId && params.shopId !== 'ALL') searchParams.append('shopId', params.shopId);
  if (params.search) searchParams.append('search', params.search);
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.limit) searchParams.append('limit', params.limit);
  if (params.offset) searchParams.append('offset', params.offset);

  const queryString = searchParams.toString();
  const endpoint = `/admin/requests${queryString ? `?${queryString}` : ''}`;
  const res = await request(endpoint);
  return res?.data || { total: 0, page: 1, requests: [] };
}

/**
 * Get Admin Request Details by Request ID
 * GET /api/admin/requests/:id
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getAdminRequest(id) {
  const res = await request(`/admin/requests/${id}`);
  return res?.data?.request;
}

/**
 * Update Admin Request Status (Workflow Transition)
 * PATCH /api/admin/requests/:id/status
 * @param {string} id
 * @param {string} status
 * @param {string} [note='']
 * @returns {Promise<object>}
 */
export async function updateAdminRequestStatus(id, status, note = '') {
  const res = await request(`/admin/requests/${id}/status`, {
    method: 'PATCH',
    body: { status, note, operatorNote: note }
  });
  return res?.data?.request || res?.data;
}

/**
 * Get All Students (Admin Directory)
 * GET /api/admin/students
 * @param {object} [params={}] - { search, status, page, limit }
 * @returns {Promise<{ total: number, page: number, students: Array<object> }>}
 */
export async function getAdminStudents(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.append('search', params.search);
  if (params.status && params.status !== 'ALL') searchParams.append('status', params.status);
  if (params.page) searchParams.append('page', params.page);
  if (params.limit) searchParams.append('limit', params.limit);

  const queryString = searchParams.toString();
  const endpoint = `/admin/students${queryString ? `?${queryString}` : ''}`;
  const res = await request(endpoint);
  return res?.data || { total: 0, page: 1, students: [] };
}

/**
 * Toggle Student Status (Active / Inactive)
 * PATCH /api/admin/students/:id/status
 * @param {string} studentId
 * @returns {Promise<{ id: string, status: string }>}
 */
export async function toggleAdminStudentStatus(studentId) {
  const res = await request(`/admin/students/${studentId}/status`, {
    method: 'PATCH'
  });
  return res?.data || res;
}

/**
 * Get Admin Profile
 * GET /api/admin/profile
 * @returns {Promise<object>}
 */
export async function getAdminProfile() {
  const res = await request('/admin/profile');
  return res?.data?.admin;
}

/**
 * Update Admin Profile
 * PUT /api/admin/profile
 * @param {object} formData - { name, phone, department }
 * @returns {Promise<object>}
 */
export async function updateAdminProfile(formData) {
  const res = await request('/admin/profile', {
    method: 'PUT',
    body: formData
  });
  return res?.data?.admin;
}

/**
 * Update Admin Password
 * PUT /api/admin/profile/password
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<object>}
 */
export async function updateAdminPassword(currentPassword, newPassword) {
  const res = await request('/admin/profile/password', {
    method: 'PUT',
    body: { currentPassword, newPassword }
  });
  return res;
}

// Export default object containing all API functions
const api = {
  // Token & Storage (Role-Isolated)
  getToken,
  setToken,
  removeToken,
  getStudentToken,
  getAdminToken,
  setStudentToken,
  setAdminToken,
  removeStudentToken,
  removeAdminToken,
  isAuthenticated,
  // System
  checkHealth,
  // Auth
  login,
  studentLogin,
  adminLogin,
  register,
  getCurrentUser,
  logout,
  // Public
  getShops,
  getPricing,
  // Student
  getStudentDashboardStats,
  getStudentRequests,
  getStudentRequest,
  createPrintRequest,
  getStudentProfile,
  updateStudentProfile,
  // Admin
  getAdminDashboardStats,
  getAdminRequests,
  getAdminRequest,
  updateAdminRequestStatus,
  getAdminStudents,
  toggleAdminStudentStatus,
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword
};

export default api;



