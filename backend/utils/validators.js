/**
 * Request Validation Utilities
 * Campus Print Request Management System
 */

// Email regex validator
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Allowed Print Types & Side Types
const ALLOWED_PRINT_TYPES = ['B&W', 'Color'];
const ALLOWED_SIDE_TYPES = ['Single', 'Double'];

// Valid Status State Machine Transitions
const ALLOWED_STATUSES = ['PENDING', 'ACCEPTED', 'PRINTING', 'READY', 'COLLECTED', 'REJECTED'];

const VALID_STATUS_TRANSITIONS = {
  PENDING: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['PRINTING'],
  PRINTING: ['READY'],
  READY: ['COLLECTED'],
  COLLECTED: [], // Terminal State
  REJECTED: []   // Terminal State
};

/**
 * Checks if status transition is valid
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 * @returns {boolean}
 */
function isValidStatusTransition(currentStatus, nextStatus) {
  if (!currentStatus || !nextStatus) return false;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(nextStatus);
}

/**
 * Validates registration input
 */
function validateRegisterInput({ name, email, password }) {
  const errors = [];
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name is required (at least 2 characters).');
  }
  if (!email || !isValidEmail(email)) {
    errors.push('A valid campus email address is required.');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters in length.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates login input
 */
function validateLoginInput({ email, password }) {
  const errors = [];
  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required.');
  }
  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates print request creation payload
 */
function validatePrintRequestInput(body) {
  const errors = [];
  const { shopId, documentName, pages, copies, printType, side } = body;

  if (!shopId || typeof shopId !== 'string') {
    errors.push('A valid print shop selection is required.');
  }
  if (!documentName || typeof documentName !== 'string' || documentName.trim().length === 0) {
    errors.push('Document/File name is required.');
  }
  
  const parsedPages = parseInt(pages, 10);
  if (isNaN(parsedPages) || parsedPages <= 0) {
    errors.push('Page count must be a positive integer.');
  }

  const parsedCopies = parseInt(copies || 1, 10);
  if (isNaN(parsedCopies) || parsedCopies <= 0) {
    errors.push('Number of copies must be a positive integer.');
  }

  if (!printType || !ALLOWED_PRINT_TYPES.includes(printType)) {
    errors.push(`Print type must be one of: ${ALLOWED_PRINT_TYPES.join(', ')}`);
  }

  if (!side || !ALLOWED_SIDE_TYPES.includes(side)) {
    errors.push(`Side type must be one of: ${ALLOWED_SIDE_TYPES.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      shopId: (shopId || '').trim(),
      documentName: (documentName || '').trim(),
      pages: parsedPages,
      copies: parsedCopies,
      printType,
      side,
      fileSize: body.fileSize || '1.0 MB',
      fileUrl: body.fileUrl || null,
      specialInstructions: (body.specialInstructions || '').trim(),
      paymentMethod: body.paymentMethod || 'Campus Card / UPI'
    }
  };
}

module.exports = {
  isValidEmail,
  ALLOWED_PRINT_TYPES,
  ALLOWED_SIDE_TYPES,
  ALLOWED_STATUSES,
  VALID_STATUS_TRANSITIONS,
  isValidStatusTransition,
  validateRegisterInput,
  validateLoginInput,
  validatePrintRequestInput
};
