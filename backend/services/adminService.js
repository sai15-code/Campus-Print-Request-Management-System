/**
 * Admin Service Layer
 * Business logic for Admin Dashboard Analytics, Spooler Queue Management,
 * Valid Status Transitions, Print Shops, Pricing Matrix, Students Directory, and Admin Profile.
 */

const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { isValidStatusTransition } = require('../utils/validators');

/**
 * 1. Get Admin Dashboard Aggregated Statistics & Recent Requests
 */
async function getAdminDashboardStats() {
  // Aggregate request counts and gross revenue via single multi-conditional SQL query
  const [requestStatsRows] = await db.execute(
    `SELECT 
       COUNT(*) AS totalRequests,
       COUNT(CASE WHEN status = 'PENDING' THEN 1 END) AS pendingCount,
       COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) AS acceptedCount,
       COUNT(CASE WHEN status = 'PRINTING' THEN 1 END) AS printingCount,
       COUNT(CASE WHEN status = 'READY' THEN 1 END) AS readyCount,
       COUNT(CASE WHEN status = 'COLLECTED' THEN 1 END) AS collectedCount,
       COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) AS rejectedCount,
       COALESCE(SUM(CASE WHEN status != 'REJECTED' THEN total_amount ELSE 0 END), 0.00) AS totalRevenue
     FROM print_requests`
  );

  const reqStats = requestStatsRows[0] || {};

  // Count active students
  const [studentStatsRows] = await db.execute(
    "SELECT COUNT(*) AS totalStudents FROM users WHERE role = 'STUDENT'"
  );

  // Count campus print shops
  const [shopStatsRows] = await db.execute(
    'SELECT COUNT(*) AS totalShops FROM print_shops'
  );

  // Fetch 6 most recent print queue items
  const [recentRows] = await db.execute(
    `SELECT 
       pr.request_id AS id,
       pr.user_id AS studentId,
       u.name AS studentName,
       u.roll_number AS studentRoll,
       pr.document_name AS documentName,
       ps.shop_name AS printShop,
       pr.pages,
       pr.copies,
       pr.print_type AS printType,
       pr.side_type AS side,
       pr.total_amount AS amount,
       pr.status,
       DATE_FORMAT(pr.created_at, '%Y-%m-%d %h:%i %p') AS date
     FROM print_requests pr
     INNER JOIN users u ON pr.user_id = u.user_id
     INNER JOIN print_shops ps ON pr.shop_id = ps.shop_id
     ORDER BY pr.created_at DESC
     LIMIT 6`
  );

  return {
    metrics: {
      totalRequests: parseInt(reqStats.totalRequests || 0, 10),
      pendingCount: parseInt(reqStats.pendingCount || 0, 10),
      acceptedCount: parseInt(reqStats.acceptedCount || 0, 10),
      printingCount: parseInt(reqStats.printingCount || 0, 10),
      readyCount: parseInt(reqStats.readyCount || 0, 10),
      collectedCount: parseInt(reqStats.collectedCount || 0, 10),
      rejectedCount: parseInt(reqStats.rejectedCount || 0, 10),
      totalRevenue: parseFloat(reqStats.totalRevenue || 0),
      totalStudents: parseInt(studentStatsRows[0]?.totalStudents || 0, 10),
      totalShops: parseInt(shopStatsRows[0]?.totalShops || 0, 10)
    },
    recentRequests: recentRows.map(r => ({
      ...r,
      pages: parseInt(r.pages, 10),
      copies: parseInt(r.copies, 10),
      amount: parseFloat(r.amount)
    }))
  };
}

/**
 * 2. Get All Print Requests (Queue Spooler) with Filter and Search
 */
async function getAllRequests({ status, shopId, search, sortBy = 'newest', limit = 50, offset = 0 }) {
  let sql = `
    SELECT 
      pr.request_id AS id,
      pr.user_id AS studentId,
      u.name AS studentName,
      u.email AS studentEmail,
      u.roll_number AS studentRoll,
      u.department AS studentDepartment,
      u.phone AS studentPhone,
      pr.document_name AS documentName,
      pr.file_size AS fileSize,
      pr.pages,
      pr.copies,
      pr.print_type AS printType,
      pr.side_type AS side,
      pr.shop_id AS shopId,
      ps.shop_name AS printShop,
      ps.location AS shopLocation,
      pr.price_per_page AS pricePerPage,
      pr.total_amount AS amount,
      pr.status,
      pr.payment_status AS paymentStatus,
      pr.payment_method AS paymentMethod,
      pr.special_instructions AS specialInstructions,
      DATE_FORMAT(pr.created_at, '%Y-%m-%d %h:%i %p') AS date
    FROM print_requests pr
    INNER JOIN users u ON pr.user_id = u.user_id
    INNER JOIN print_shops ps ON pr.shop_id = ps.shop_id
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== 'ALL') {
    sql += ' AND pr.status = ?';
    params.push(status.toUpperCase());
  }

  if (shopId && shopId !== 'ALL') {
    sql += ' AND pr.shop_id = ?';
    params.push(shopId);
  }

  if (search && search.trim().length > 0) {
    sql += ' AND (pr.document_name LIKE ? OR u.name LIKE ? OR u.roll_number LIKE ? OR pr.request_id LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  // Apply Sorting
  if (sortBy === 'oldest') {
    sql += ' ORDER BY pr.created_at ASC';
  } else if (sortBy === 'amount-high') {
    sql += ' ORDER BY pr.total_amount DESC';
  } else if (sortBy === 'amount-low') {
    sql += ' ORDER BY pr.total_amount ASC';
  } else {
    sql += ' ORDER BY pr.created_at DESC'; // default newest
  }

  sql += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const [rows] = await db.execute(sql, params);
  return rows.map(r => ({
    ...r,
    pages: parseInt(r.pages, 10),
    copies: parseInt(r.copies, 10),
    pricePerPage: parseFloat(r.pricePerPage),
    amount: parseFloat(r.amount)
  }));
}

/**
 * 3. Get Admin Request Details by ID with Full Timeline
 */
async function getAdminRequestDetails(requestId) {
  const [rows] = await db.execute(
    `SELECT 
       pr.request_id AS id,
       pr.user_id AS studentId,
       u.name AS studentName,
       u.email AS studentEmail,
       u.roll_number AS studentRoll,
       u.department AS studentDepartment,
       u.phone AS studentPhone,
       pr.document_name AS documentName,
       pr.file_size AS fileSize,
       pr.file_url AS fileUrl,
       pr.pages,
       pr.copies,
       pr.print_type AS printType,
       pr.side_type AS side,
       pr.shop_id AS shopId,
       ps.shop_name AS printShop,
       ps.location AS shopLocation,
       pr.price_per_page AS pricePerPage,
       pr.total_amount AS amount,
       pr.status,
       pr.payment_status AS paymentStatus,
       pr.payment_method AS paymentMethod,
       pr.special_instructions AS specialInstructions,
       DATE_FORMAT(pr.created_at, '%Y-%m-%d %h:%i %p') AS date
     FROM print_requests pr
     INNER JOIN users u ON pr.user_id = u.user_id
     INNER JOIN print_shops ps ON pr.shop_id = ps.shop_id
     WHERE pr.request_id = ?`,
    [requestId]
  );

  if (rows.length === 0) {
    const error = new Error('Print request not found.');
    error.statusCode = 404;
    throw error;
  }

  const request = rows[0];

  // Fetch chronological status history timeline
  const [historyRows] = await db.execute(
    `SELECT 
       status,
       DATE_FORMAT(changed_at, '%b %d, %Y, %h:%i %p') AS timestamp,
       note,
       completed
     FROM status_history
     WHERE request_id = ?
     ORDER BY changed_at ASC`,
    [requestId]
  );

  return {
    ...request,
    pages: parseInt(request.pages, 10),
    copies: parseInt(request.copies, 10),
    pricePerPage: parseFloat(request.pricePerPage),
    amount: parseFloat(request.amount),
    timeline: historyRows.map(h => ({
      ...h,
      completed: Boolean(h.completed)
    }))
  };
}

/**
 * 4. Update Request Status with FSM Validation & Audit Logging (Transaction)
 */
async function updateRequestStatus(requestId, newStatus, operatorId, operatorNote) {
  const normalizedStatus = (newStatus || '').toUpperCase();

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Lock request row for update
    const [rows] = await connection.execute(
      'SELECT request_id, status, payment_status FROM print_requests WHERE request_id = ? FOR UPDATE',
      [requestId]
    );

    if (rows.length === 0) {
      const error = new Error('Print request not found.');
      error.statusCode = 404;
      throw error;
    }

    const currentStatus = rows[0].status;

    // Validate finite state machine transition
    if (!isValidStatusTransition(currentStatus, normalizedStatus)) {
      const error = new Error(
        `Invalid status transition from '${currentStatus}' to '${normalizedStatus}'. Permitted transitions: [${
          currentStatus === 'PENDING' ? 'ACCEPTED, REJECTED' : 
          currentStatus === 'ACCEPTED' ? 'PRINTING' : 
          currentStatus === 'PRINTING' ? 'READY' : 
          currentStatus === 'READY' ? 'COLLECTED' : 'None (Terminal state)'
        }]`
      );
      error.statusCode = 400;
      throw error;
    }

    // Determine default operator note if not provided
    const defaultNotes = {
      ACCEPTED: 'Request accepted by admin. Added to print batch spooler.',
      PRINTING: 'Print job actively processing on high-speed laser hardware.',
      READY: 'Print job completed, collated, and staged at the pickup counter.',
      COLLECTED: 'Document successfully handed over and collected by student.',
      REJECTED: 'Request rejected by operator. Refund initiated.'
    };
    const finalNote = operatorNote || defaultNotes[normalizedStatus] || `Status changed to ${normalizedStatus}`;

    // Update status and refund payment if rejected
    const newPaymentStatus = normalizedStatus === 'REJECTED' ? 'REFUNDED' : rows[0].payment_status;
    await connection.execute(
      `UPDATE print_requests 
       SET status = ?, payment_status = ?, updated_at = NOW() 
       WHERE request_id = ?`,
      [normalizedStatus, newPaymentStatus, requestId]
    );

    // Insert into status_history
    const historyId = `HIST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await connection.execute(
      `INSERT INTO status_history (
        history_id, request_id, status, operator_id, note, completed, changed_at
      ) VALUES (?, ?, ?, ?, ?, TRUE, NOW())`,
      [historyId, requestId, normalizedStatus, operatorId || null, finalNote]
    );

    await connection.commit();

    return getAdminRequestDetails(requestId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 5. Print Shops Management (CRUD)
 */
async function getAllShops() {
  const [rows] = await db.execute(
    `SELECT 
       shop_id AS id,
       shop_name AS name,
       short_name AS shortName,
       location,
       timing,
       contact,
       email,
       rating,
       services,
       status
     FROM print_shops 
     ORDER BY shop_name ASC`
  );

  return rows.map(shop => ({
    ...shop,
    rating: parseFloat(shop.rating),
    services: typeof shop.services === 'string' ? JSON.parse(shop.services) : (shop.services || [])
  }));
}

async function createShop(shopData) {
  const { name, shortName, location, timing, contact, email, services, status } = shopData;
  const shopId = `shop-${Math.random().toString(36).substring(2, 8)}`;

  await db.execute(
    `INSERT INTO print_shops (
      shop_id, shop_name, short_name, location, timing, contact, email, rating, services, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 5.0, ?, ?, NOW())`,
    [
      shopId,
      name.trim(),
      (shortName || name.split(' ')[0]).trim(),
      location.trim(),
      timing || '8:00 AM - 6:00 PM',
      contact || '+91 98765 00000',
      email || 'printcenter@campus.edu',
      JSON.stringify(services || ['B&W Laser', 'Color Printing']),
      status || 'ACTIVE'
    ]
  );

  return {
    id: shopId,
    name,
    shortName: shortName || name.split(' ')[0],
    location,
    timing,
    contact,
    email,
    rating: 5.0,
    services: services || ['B&W Laser', 'Color Printing'],
    status: status || 'ACTIVE'
  };
}

async function updateShop(shopId, shopData) {
  const { name, shortName, location, timing, contact, email, services, status } = shopData;

  await db.execute(
    `UPDATE print_shops 
     SET shop_name = COALESCE(?, shop_name),
         short_name = COALESCE(?, short_name),
         location = COALESCE(?, location),
         timing = COALESCE(?, timing),
         contact = COALESCE(?, contact),
         email = COALESCE(?, email),
         services = COALESCE(?, services),
         status = COALESCE(?, status),
         updated_at = NOW()
     WHERE shop_id = ?`,
    [
      name || null,
      shortName || null,
      location || null,
      timing || null,
      contact || null,
      email || null,
      services ? JSON.stringify(services) : null,
      status || null,
      shopId
    ]
  );

  const [rows] = await db.execute('SELECT * FROM print_shops WHERE shop_id = ?', [shopId]);
  if (rows.length === 0) {
    const error = new Error('Print shop not found.');
    error.statusCode = 404;
    throw error;
  }
  const s = rows[0];
  return {
    id: s.shop_id,
    name: s.shop_name,
    shortName: s.short_name,
    location: s.location,
    timing: s.timing,
    contact: s.contact,
    email: s.email,
    rating: parseFloat(s.rating),
    services: typeof s.services === 'string' ? JSON.parse(s.services) : s.services,
    status: s.status
  };
}

async function toggleShopStatus(shopId) {
  const [rows] = await db.execute('SELECT status FROM print_shops WHERE shop_id = ?', [shopId]);
  if (rows.length === 0) {
    const error = new Error('Shop not found.');
    error.statusCode = 404;
    throw error;
  }
  const newStatus = rows[0].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  await db.execute('UPDATE print_shops SET status = ?, updated_at = NOW() WHERE shop_id = ?', [newStatus, shopId]);
  return { id: shopId, status: newStatus };
}

/**
 * 6. Pricing Matrix Management (CRUD)
 */
async function getAllPricing() {
  const [rows] = await db.execute(
    `SELECT 
       p.pricing_id AS id,
       p.shop_id AS shopId,
       ps.shop_name AS shopName,
       p.print_type AS printType,
       p.side_type AS side,
       p.price_per_page AS pricePerPage,
       p.unit,
       DATE_FORMAT(p.updated_at, '%b %d, %Y') AS lastUpdated
     FROM pricing p
     INNER JOIN print_shops ps ON p.shop_id = ps.shop_id
     ORDER BY p.shop_id, p.print_type, p.side_type`
  );

  return rows.map(r => ({
    ...r,
    pricePerPage: parseFloat(r.pricePerPage)
  }));
}

async function createPricing(pricingData) {
  const { shopId, printType, side, pricePerPage } = pricingData;
  const pricingId = `PRC-${Math.floor(100 + Math.random() * 900)}`;

  await db.execute(
    `INSERT INTO pricing (
      pricing_id, shop_id, print_type, side_type, price_per_page, unit, created_at
    ) VALUES (?, ?, ?, ?, ?, '₹ / page', NOW())`,
    [pricingId, shopId, printType, side, parseFloat(pricePerPage)]
  );

  const [shopRows] = await db.execute('SELECT shop_name FROM print_shops WHERE shop_id = ?', [shopId]);
  return {
    id: pricingId,
    shopId,
    shopName: shopRows[0]?.shop_name || '',
    printType,
    side,
    pricePerPage: parseFloat(pricePerPage),
    unit: '₹ / page',
    lastUpdated: 'Just now'
  };
}

async function updatePricing(pricingId, pricingData) {
  const { pricePerPage, printType, side } = pricingData;

  await db.execute(
    `UPDATE pricing 
     SET price_per_page = COALESCE(?, price_per_page),
         print_type = COALESCE(?, print_type),
         side_type = COALESCE(?, side_type),
         updated_at = NOW()
     WHERE pricing_id = ?`,
    [pricePerPage ? parseFloat(pricePerPage) : null, printType || null, side || null, pricingId]
  );

  const [rows] = await db.execute(
    `SELECT 
       p.pricing_id AS id,
       p.shop_id AS shopId,
       ps.shop_name AS shopName,
       p.print_type AS printType,
       p.side_type AS side,
       p.price_per_page AS pricePerPage,
       p.unit,
       DATE_FORMAT(p.updated_at, '%b %d, %Y') AS lastUpdated
     FROM pricing p
     INNER JOIN print_shops ps ON p.shop_id = ps.shop_id
     WHERE p.pricing_id = ?`,
    [pricingId]
  );

  if (rows.length === 0) {
    const error = new Error('Pricing record not found.');
    error.statusCode = 404;
    throw error;
  }

  return {
    ...rows[0],
    pricePerPage: parseFloat(rows[0].pricePerPage)
  };
}

async function deletePricing(pricingId) {
  const [res] = await db.execute('DELETE FROM pricing WHERE pricing_id = ?', [pricingId]);
  if (res.affectedRows === 0) {
    const error = new Error('Pricing rule not found.');
    error.statusCode = 404;
    throw error;
  }
  return { success: true, deletedId: pricingId };
}

/**
 * 7. Students Directory Management
 */
async function getAllStudents({ search, status, limit = 50, offset = 0 }) {
  let sql = `
    SELECT 
      u.user_id AS id,
      u.name,
      u.email,
      u.roll_number AS rollNumber,
      u.department,
      u.semester,
      u.phone,
      u.status,
      DATE_FORMAT(u.created_at, '%b %d, %Y') AS registrationDate,
      COUNT(pr.request_id) AS totalOrders,
      COALESCE(SUM(CASE WHEN pr.status != 'REJECTED' THEN pr.total_amount ELSE 0 END), 0.00) AS totalSpent
    FROM users u
    LEFT JOIN print_requests pr ON u.user_id = pr.user_id
    WHERE u.role = 'STUDENT'
  `;
  const params = [];

  if (status && status !== 'ALL') {
    sql += ' AND u.status = ?';
    params.push(status.toUpperCase());
  }

  if (search && search.trim().length > 0) {
    sql += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.roll_number LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  sql += ' GROUP BY u.user_id, u.name, u.email, u.roll_number, u.department, u.semester, u.phone, u.status, u.created_at';
  sql += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const [rows] = await db.execute(sql, params);
  return rows.map(r => ({
    ...r,
    totalOrders: parseInt(r.totalOrders, 10),
    totalSpent: parseFloat(r.totalSpent)
  }));
}

async function toggleStudentStatus(studentId) {
  const [rows] = await db.execute("SELECT status FROM users WHERE user_id = ? AND role = 'STUDENT'", [studentId]);
  if (rows.length === 0) {
    const error = new Error('Student account not found.');
    error.statusCode = 404;
    throw error;
  }
  const newStatus = rows[0].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  await db.execute('UPDATE users SET status = ?, updated_at = NOW() WHERE user_id = ?', [newStatus, studentId]);
  return { id: studentId, status: newStatus };
}

/**
 * 8. Admin Profile & Password Credentials Management
 */
async function getAdminProfile(adminId) {
  const [rows] = await db.execute(
    `SELECT 
       user_id AS id,
       name,
       email,
       role,
       department,
       phone,
       avatar,
       DATE_FORMAT(created_at, '%M %d, %Y') AS accountCreated
     FROM users 
     WHERE user_id = ? AND role = 'ADMIN'`,
    [adminId]
  );

  if (rows.length === 0) {
    const error = new Error('Admin profile not found.');
    error.statusCode = 404;
    throw error;
  }

  return {
    ...rows[0],
    role: 'Super Admin',
    office: 'Central Library Building, Admin Block Room 102',
    permissions: [
      'Full System Access',
      'Manage Print Queue & Transitions',
      'Manage Print Centers',
      'Manage Per-Page Pricing',
      'Student User Controls'
    ]
  };
}

async function updateAdminProfile(adminId, { name, phone, department }) {
  await db.execute(
    `UPDATE users 
     SET name = COALESCE(?, name),
         phone = COALESCE(?, phone),
         department = COALESCE(?, department),
         updated_at = NOW()
     WHERE user_id = ? AND role = 'ADMIN'`,
    [name || null, phone || null, department || null, adminId]
  );

  return getAdminProfile(adminId);
}

async function updateAdminPassword(adminId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters.');
    error.statusCode = 400;
    throw error;
  }

  const [rows] = await db.execute('SELECT password FROM users WHERE user_id = ? AND role = \'ADMIN\'', [adminId]);
  if (rows.length === 0) {
    const error = new Error('Admin account not found.');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
  if (!isMatch) {
    const error = new Error('Current admin password does not match.');
    error.statusCode = 401;
    throw error;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await db.execute('UPDATE users SET password = ?, updated_at = NOW() WHERE user_id = ?', [hashed, adminId]);
  return { success: true, message: 'Admin password updated successfully.' };
}

module.exports = {
  getAdminDashboardStats,
  getAllRequests,
  getAdminRequestDetails,
  updateRequestStatus,
  getAllShops,
  createShop,
  updateShop,
  toggleShopStatus,
  getAllPricing,
  createPricing,
  updatePricing,
  deletePricing,
  getAllStudents,
  toggleStudentStatus,
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword
};
