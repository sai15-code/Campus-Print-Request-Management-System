/**
 * Authentication Service
 * Handles user registration, bcrypt password hashing & verification,
 * and JWT token issuance.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new Student account
 */
async function registerStudent({ name, email, password, rollNumber, department, semester, phone }) {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user with this email already exists
  const [existingUsers] = await db.execute(
    'SELECT user_id FROM users WHERE email = ?',
    [normalizedEmail]
  );

  if (existingUsers.length > 0) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Generate User ID (e.g. STU-XXXX)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const userId = `STU-${randomSuffix}`;

  // Hash password using bcrypt
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insert student into users table
  await db.execute(
    `INSERT INTO users (
      user_id, name, email, password, role, 
      roll_number, department, semester, phone, status, created_at
    ) VALUES (?, ?, ?, ?, 'STUDENT', ?, ?, ?, ?, 'ACTIVE', NOW())`,
    [
      userId,
      name.trim(),
      normalizedEmail,
      hashedPassword,
      rollNumber ? rollNumber.trim() : null,
      department ? department.trim() : null,
      semester ? semester.trim() : null,
      phone ? phone.trim() : null
    ]
  );

  // Fetch newly created user (excluding password)
  const [rows] = await db.execute(
    `SELECT user_id AS id, name, email, role, roll_number AS rollNumber, 
            department, semester, phone, status, created_at AS accountCreated
     FROM users WHERE user_id = ?`,
    [userId]
  );

  const user = rows[0];

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { user, token };
}

/**
 * Login user (Student or Admin)
 */
async function loginUser({ email, password, expectedRole }) {
  const normalizedEmail = email.trim().toLowerCase();

  // Query user record including password hash
  const [rows] = await db.execute(
    `SELECT user_id AS id, name, email, password, role, 
            roll_number AS rollNumber, department, semester, 
            phone, avatar, status, created_at AS accountCreated
     FROM users WHERE email = ?`,
    [normalizedEmail]
  );

  if (rows.length === 0) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const user = rows[0];

  // Verify account is active
  if (user.status === 'INACTIVE') {
    const error = new Error('Your account is currently deactivated. Please contact campus IT support.');
    error.statusCode = 403;
    throw error;
  }

  // Enforce expected role if specified
  if (expectedRole && user.role !== expectedRole.toUpperCase()) {
    const error = new Error(`Access denied for this portal. Required role: ${expectedRole}.`);
    error.statusCode = 403;
    throw error;
  }

  // Compare password using bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Strip password hash from response object
  delete user.password;

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { user, token };
}

/**
 * Get current authenticated user details by user ID
 */
async function getUserById(userId) {
  const [rows] = await db.execute(
    `SELECT user_id AS id, name, email, role, 
            roll_number AS rollNumber, department, semester, 
            phone, avatar, status, created_at AS accountCreated
     FROM users WHERE user_id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return rows[0];
}

module.exports = {
  registerStudent,
  loginUser,
  getUserById
};
