/**
 * Student Service Layer
 * Business logic for Student Dashboard, Submitting Print Jobs,
 * Queue Verification, and Student Profile.
 */

const db = require('../config/database');

/**
 * 1. Get Student Dashboard Statistics & Recent Jobs
 */
async function getDashboardStats(studentId) {
  // Aggregate status metrics using SQL conditional COUNT
  const [statsRows] = await db.execute(
    `SELECT 
       COUNT(*) AS totalRequests,
       COUNT(CASE WHEN status = 'PENDING' THEN 1 END) AS pendingRequests,
       COUNT(CASE WHEN status IN ('PRINTING', 'ACCEPTED') THEN 1 END) AS printingRequests,
       COUNT(CASE WHEN status = 'READY' THEN 1 END) AS readyRequests
     FROM print_requests 
     WHERE user_id = ?`,
    [studentId]
  );

  const stats = {
    totalRequests: parseInt(statsRows[0]?.totalRequests || 0, 10),
    pendingRequests: parseInt(statsRows[0]?.pendingRequests || 0, 10),
    printingRequests: parseInt(statsRows[0]?.printingRequests || 0, 10),
    readyRequests: parseInt(statsRows[0]?.readyRequests || 0, 10)
  };

  // Fetch 3 most recent requests for the student
  const [recentRows] = await db.execute(
    `SELECT 
       pr.request_id AS id,
       pr.document_name AS documentName,
       ps.shop_name AS printShop,
       pr.status,
       pr.total_amount AS amount,
       DATE_FORMAT(pr.created_at, '%Y-%m-%d %h:%i %p') AS date
     FROM print_requests pr
     INNER JOIN print_shops ps ON pr.shop_id = ps.shop_id
     WHERE pr.user_id = ?
     ORDER BY pr.created_at DESC
     LIMIT 3`,
    [studentId]
  );

  return {
    stats,
    recentRequests: recentRows
  };
}

/**
 * 2. Get Active Campus Print Shops
 */
async function getActiveShops() {
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
     WHERE status = 'ACTIVE'
     ORDER BY shop_name ASC`
  );

  return rows.map(shop => ({
    ...shop,
    rating: parseFloat(shop.rating),
    services: typeof shop.services === 'string' ? JSON.parse(shop.services) : (shop.services || [])
  }));
}

/**
 * 3. Get Active Pricing Matrix
 */
async function getActivePricing(shopId = null) {
  let sql = `
    SELECT 
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
    WHERE ps.status = 'ACTIVE'
  `;
  const params = [];

  if (shopId) {
    sql += ' AND p.shop_id = ?';
    params.push(shopId);
  }

  sql += ' ORDER BY p.shop_id, p.print_type, p.side_type';

  const [rows] = await db.execute(sql, params);
  return rows.map(r => ({
    ...r,
    pricePerPage: parseFloat(r.pricePerPage)
  }));
}

/**
 * 4. Create Print Request with Server-Authoritative Pricing Calculation & Transaction
 */
async function createPrintRequest(studentId, requestData) {
  const {
    shopId,
    documentName,
    pages,
    copies,
    printType,
    side,
    fileSize,
    fileUrl,
    specialInstructions,
    paymentMethod
  } = requestData;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Verify that the selected print shop exists and is ACTIVE
    const [shopRows] = await connection.execute(
      'SELECT shop_id, shop_name, location, status FROM print_shops WHERE shop_id = ?',
      [shopId]
    );

    if (shopRows.length === 0 || shopRows[0].status !== 'ACTIVE') {
      const err = new Error('The selected campus print shop is currently inactive or unavailable.');
      err.statusCode = 400;
      throw err;
    }
    const shop = shopRows[0];

    // 2. Fetch authoritative per-page rate from database pricing table
    const [pricingRows] = await connection.execute(
      'SELECT price_per_page FROM pricing WHERE shop_id = ? AND print_type = ? AND side_type = ?',
      [shopId, printType, side]
    );

    if (pricingRows.length === 0) {
      const err = new Error(`No pricing rate found for Shop '${shop.shop_name}', Type '${printType}', Side '${side}'.`);
      err.statusCode = 400;
      throw err;
    }

    const pricePerPage = parseFloat(pricingRows[0].price_per_page);

    // 3. Authoritative server calculation: total = pages * copies * pricePerPage
    const totalAmount = parseFloat((pages * copies * pricePerPage).toFixed(2));

    // 4. Generate unique Request ID (e.g. REQ-YYYY-XXX)
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const requestId = `REQ-${currentYear}-${randomSuffix}`;

    // 5. Insert into `print_requests`
    await connection.execute(
      `INSERT INTO print_requests (
        request_id, user_id, shop_id, document_name, file_url, file_size,
        pages, copies, print_type, side_type, price_per_page, total_amount,
        status, payment_status, payment_method, special_instructions, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PAID', ?, ?, NOW())`,
      [
        requestId,
        studentId,
        shopId,
        documentName,
        fileUrl || null,
        fileSize || '1.2 MB',
        pages,
        copies,
        printType,
        side,
        pricePerPage,
        totalAmount,
        paymentMethod || 'Campus Card / UPI',
        specialInstructions || null
      ]
    );

    // 6. Insert initial record into `status_history`
    const historyId = `HIST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await connection.execute(
      `INSERT INTO status_history (
        history_id, request_id, status, operator_id, note, completed, changed_at
      ) VALUES (?, ?, 'Submitted', NULL, 'Request submitted online with digital copy attached.', TRUE, NOW())`,
      [historyId, requestId]
    );

    // 7. Insert payment record
    const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const trxRef = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    await connection.execute(
      `INSERT INTO payments (
        payment_id, request_id, user_id, amount, payment_status, payment_method, transaction_ref, created_at
      ) VALUES (?, ?, ?, ?, 'PAID', ?, ?, NOW())`,
      [paymentId, requestId, studentId, totalAmount, paymentMethod || 'Campus Card / UPI', trxRef]
    );

    await connection.commit();

    return {
      id: requestId,
      studentId,
      shopId,
      printShop: shop.shop_name,
      documentName,
      pages,
      copies,
      printType,
      side,
      pricePerPage,
      amount: totalAmount,
      status: 'PENDING',
      paymentStatus: 'PAID',
      paymentMethod: paymentMethod || 'Campus Card / UPI',
      specialInstructions,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 5. Get Student's Own Requests with Search and Filtering
 */
async function getStudentRequests(studentId, { status, search, limit = 50, offset = 0 }) {
  let sql = `
    SELECT 
      pr.request_id AS id,
      pr.user_id AS studentId,
      u.name AS studentName,
      u.email AS studentEmail,
      u.roll_number AS studentRoll,
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
    WHERE pr.user_id = ?
  `;
  const params = [studentId];

  if (status && status !== 'ALL') {
    sql += ' AND pr.status = ?';
    params.push(status.toUpperCase());
  }

  if (search && search.trim().length > 0) {
    sql += ' AND (pr.document_name LIKE ? OR ps.shop_name LIKE ? OR pr.request_id LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY pr.created_at DESC LIMIT ? OFFSET ?';
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
 * 6. Get Request Details & Chronological Status History
 * Enforces ownership security: Student can ONLY view their own request.
 */
async function getRequestDetails(requestId, studentId) {
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

  // Ownership verification check
  if (studentId && request.studentId !== studentId) {
    const error = new Error('Forbidden. You do not have permission to view this print request.');
    error.statusCode = 403;
    throw error;
  }

  // Fetch status history timeline
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
 * 7. Get Student Profile & Lifetime Order Aggregate Metrics
 */
async function getStudentProfile(studentId) {
  const [userRows] = await db.execute(
    `SELECT 
       user_id AS id,
       name,
       email,
       role,
       roll_number AS rollNumber,
       department,
       semester,
       phone,
       avatar,
       DATE_FORMAT(created_at, '%M %d, %Y') AS accountCreated
     FROM users 
     WHERE user_id = ? AND role = 'STUDENT'`,
    [studentId]
  );

  if (userRows.length === 0) {
    const error = new Error('Student account not found.');
    error.statusCode = 404;
    throw error;
  }

  const user = userRows[0];

  // Compute lifetime orders and expenditure using aggregate SQL functions
  const [aggRows] = await db.execute(
    `SELECT 
       COUNT(request_id) AS totalOrders,
       COALESCE(SUM(CASE WHEN status != 'REJECTED' THEN total_amount ELSE 0 END), 0.00) AS totalSpent
     FROM print_requests 
     WHERE user_id = ?`,
    [studentId]
  );

  return {
    ...user,
    totalOrders: parseInt(aggRows[0]?.totalOrders || 0, 10),
    totalSpent: parseFloat(aggRows[0]?.totalSpent || 0)
  };
}

/**
 * 8. Update Student Profile
 */
async function updateStudentProfile(studentId, { name, phone, department, semester }) {
  await db.execute(
    `UPDATE users 
     SET name = COALESCE(?, name),
         phone = COALESCE(?, phone),
         department = COALESCE(?, department),
         semester = COALESCE(?, semester),
         updated_at = NOW()
     WHERE user_id = ? AND role = 'STUDENT'`,
    [name || null, phone || null, department || null, semester || null, studentId]
  );

  return getStudentProfile(studentId);
}

module.exports = {
  getDashboardStats,
  getActiveShops,
  getActivePricing,
  createPrintRequest,
  getStudentRequests,
  getRequestDetails,
  getStudentProfile,
  updateStudentProfile
};
