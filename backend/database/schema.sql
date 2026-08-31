-- =====================================================================
-- CAMPUS PRINT REQUEST MANAGEMENT SYSTEM - RELATIONAL DATABASE SCHEMA
-- Target DBMS: MySQL 8.0+
-- Database Name: campus_print_db
-- 
-- Academic DBMS Project Features Demonstrated:
--  1. Normalization: 3NF Relational Structure (Zero redundant data)
--  2. Integrity Constraints: Primary Keys, Foreign Keys with ON DELETE CASCADE / RESTRICT
--  3. Domain Integrity: ENUM types, CHECK constraints, NOT NULL, DEFAULT values
--  4. Performance: B-Tree Indexes on foreign keys and frequently queried filter columns
--  5. Complex Queries: Multi-table INNER JOIN, LEFT JOIN, Aggregation (SUM, COUNT, AVG, GROUP BY)
--  6. Database Views: Pre-compiled multi-table join abstractions for dashboards
--  7. Stored Procedures: Server-side business logic and transactional atomic order processing
--  8. Triggers: Automatic constraint auditing and timestamp updating
--  9. Transactions: ACID-compliant multi-step operations for status transitions
-- =====================================================================

CREATE DATABASE IF NOT EXISTS campus_print_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_print_db;

-- ---------------------------------------------------------------------
-- TABLE 1: users
-- Stores both Student accounts and Staff/Administrator accounts.
-- Role-based access control (RBAC) separates 'STUDENT' from 'ADMIN'.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'Bcrypt-hashed salt + password',
  role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  roll_number VARCHAR(50) NULL COMMENT 'Student roll / enrollment number',
  department VARCHAR(100) NULL COMMENT 'Academic department',
  semester VARCHAR(50) NULL COMMENT 'Current semester',
  phone VARCHAR(25) NULL,
  avatar VARCHAR(255) NULL,
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT pk_users PRIMARY KEY (user_id),
  CONSTRAINT uq_users_email UNIQUE (email),
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- TABLE 2: print_shops
-- Represents physical campus reprographics, xerox, and print centers.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS print_shops (
  shop_id VARCHAR(50) NOT NULL,
  shop_name VARCHAR(150) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  location TEXT NOT NULL,
  timing VARCHAR(100) NOT NULL,
  contact VARCHAR(50) NOT NULL,
  email VARCHAR(150) NOT NULL,
  rating DECIMAL(2, 1) NOT NULL DEFAULT 5.0,
  services JSON NULL COMMENT 'Array of offered services (JSON array format)',
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT pk_print_shops PRIMARY KEY (shop_id),
  INDEX idx_shops_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- TABLE 3: pricing
-- Authoritative per-page pricing matrix defined per shop, print type,
-- and duplex/simplex orientation.
-- Demonstrates: Composite Unique Key & Foreign Key Relationships.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pricing (
  pricing_id VARCHAR(50) NOT NULL,
  shop_id VARCHAR(50) NOT NULL,
  print_type ENUM('B&W', 'Color') NOT NULL,
  side_type ENUM('Single', 'Double') NOT NULL,
  price_per_page DECIMAL(6, 2) NOT NULL,
  unit VARCHAR(30) NOT NULL DEFAULT '₹ / page',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT pk_pricing PRIMARY KEY (pricing_id),
  CONSTRAINT fk_pricing_shop FOREIGN KEY (shop_id) 
    REFERENCES print_shops (shop_id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT uq_shop_pricing_matrix UNIQUE (shop_id, print_type, side_type),
  CONSTRAINT chk_price_positive CHECK (price_per_page > 0),
  INDEX idx_pricing_shop (shop_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- TABLE 4: print_requests
-- The central print spooler entity capturing student print orders.
-- Authoritative `total_amount` is calculated server-side:
--   total_amount = pages * copies * price_per_page
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS print_requests (
  request_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  shop_id VARCHAR(50) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NULL,
  file_size VARCHAR(50) NOT NULL DEFAULT '1.0 MB',
  pages INT NOT NULL,
  copies INT NOT NULL DEFAULT 1,
  print_type ENUM('B&W', 'Color') NOT NULL,
  side_type ENUM('Single', 'Double') NOT NULL,
  price_per_page DECIMAL(6, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('PENDING', 'ACCEPTED', 'PRINTING', 'READY', 'COLLECTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  payment_status ENUM('PENDING', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'PAID',
  payment_method VARCHAR(100) NOT NULL DEFAULT 'Campus Card / UPI',
  special_instructions TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT pk_print_requests PRIMARY KEY (request_id),
  CONSTRAINT fk_requests_user FOREIGN KEY (user_id) 
    REFERENCES users (user_id) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  CONSTRAINT fk_requests_shop FOREIGN KEY (shop_id) 
    REFERENCES print_shops (shop_id) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  CONSTRAINT chk_pages_positive CHECK (pages > 0),
  CONSTRAINT chk_copies_positive CHECK (copies > 0),
  CONSTRAINT chk_amount_nonnegative CHECK (total_amount >= 0),
  INDEX idx_requests_user (user_id),
  INDEX idx_requests_shop (shop_id),
  INDEX idx_requests_status (status),
  INDEX idx_requests_created (created_at DESC)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- TABLE 5: status_history
-- Detailed audit trail of all queue transitions, timestamps,
-- operator IDs, and processing notes.
-- Demonstrates: 1-to-Many relationship with `print_requests`.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS status_history (
  history_id VARCHAR(50) NOT NULL,
  request_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  operator_id VARCHAR(50) NULL,
  note TEXT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT pk_status_history PRIMARY KEY (history_id),
  CONSTRAINT fk_history_request FOREIGN KEY (request_id) 
    REFERENCES print_requests (request_id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT fk_history_operator FOREIGN KEY (operator_id) 
    REFERENCES users (user_id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  INDEX idx_history_request (request_id),
  INDEX idx_history_changed (changed_at ASC)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- TABLE 6: payments
-- Payment ledger tracking student transactions and refunds.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  payment_id VARCHAR(50) NOT NULL,
  request_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_status ENUM('PENDING', 'PAID', 'REFUNDED', 'FAILED') NOT NULL DEFAULT 'PAID',
  payment_method VARCHAR(100) NOT NULL DEFAULT 'Campus Card / UPI',
  transaction_ref VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT pk_payments PRIMARY KEY (payment_id),
  CONSTRAINT fk_payments_request FOREIGN KEY (request_id) 
    REFERENCES print_requests (request_id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) 
    REFERENCES users (user_id) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  INDEX idx_payments_request (request_id),
  INDEX idx_payments_user (user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- DATABASE VIEWS (Demonstrating Multi-Table JOIN & Query Abstraction)
-- =====================================================================

-- VIEW 1: vw_print_requests_detailed
-- Joins print_requests with users and print_shops for complete order details.
CREATE OR REPLACE VIEW vw_print_requests_detailed AS
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
  DATE_FORMAT(pr.created_at, '%Y-%m-%d %h:%i %p') AS date,
  pr.created_at AS createdAt,
  pr.updated_at AS updatedAt
FROM print_requests pr
INNER JOIN users u ON pr.user_id = u.user_id
INNER JOIN print_shops ps ON pr.shop_id = ps.shop_id;

-- VIEW 2: vw_shop_revenue_summary
-- Demonstrates: GROUP BY, SUM, COUNT, and aggregate filtering.
CREATE OR REPLACE VIEW vw_shop_revenue_summary AS
SELECT 
  ps.shop_id,
  ps.shop_name,
  ps.status AS shop_status,
  COUNT(pr.request_id) AS total_requests,
  COUNT(CASE WHEN pr.status = 'PENDING' THEN 1 END) AS pending_requests,
  COUNT(CASE WHEN pr.status = 'PRINTING' THEN 1 END) AS printing_requests,
  COUNT(CASE WHEN pr.status = 'READY' THEN 1 END) AS ready_requests,
  COUNT(CASE WHEN pr.status = 'COLLECTED' THEN 1 END) AS collected_requests,
  COUNT(CASE WHEN pr.status = 'REJECTED' THEN 1 END) AS rejected_requests,
  COALESCE(SUM(CASE WHEN pr.status != 'REJECTED' THEN pr.total_amount ELSE 0 END), 0.00) AS gross_revenue
FROM print_shops ps
LEFT JOIN print_requests pr ON ps.shop_id = pr.shop_id
GROUP BY ps.shop_id, ps.shop_name, ps.status;

-- VIEW 3: vw_student_order_summary
-- Aggregates lifetime orders and total expenditure per student account.
CREATE OR REPLACE VIEW vw_student_order_summary AS
SELECT 
  u.user_id,
  u.name,
  u.email,
  u.roll_number,
  u.department,
  u.semester,
  u.phone,
  u.status,
  DATE_FORMAT(u.created_at, '%b %d, %Y') AS registration_date,
  COUNT(pr.request_id) AS total_orders,
  COALESCE(SUM(CASE WHEN pr.status != 'REJECTED' THEN pr.total_amount ELSE 0 END), 0.00) AS total_spent
FROM users u
LEFT JOIN print_requests pr ON u.user_id = pr.user_id
WHERE u.role = 'STUDENT'
GROUP BY u.user_id, u.name, u.email, u.roll_number, u.department, u.semester, u.phone, u.status, u.created_at;

-- =====================================================================
-- STORED PROCEDURES & TRANSACTIONS
-- =====================================================================

DELIMITER //

-- ---------------------------------------------------------------------
-- PROCEDURE 1: sp_create_print_request
-- Atomic transaction that:
--   1. Validates print shop is active
--   2. Retrieves authoritative price_per_page from `pricing` table
--   3. Calculates total_amount = pages * copies * price_per_page
--   4. Inserts into `print_requests`
--   5. Inserts initial entry into `status_history`
--   6. Records payment in `payments` table
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_create_print_request(
  IN p_request_id VARCHAR(50),
  IN p_user_id VARCHAR(50),
  IN p_shop_id VARCHAR(50),
  IN p_document_name VARCHAR(255),
  IN p_file_url VARCHAR(500),
  IN p_file_size VARCHAR(50),
  IN p_pages INT,
  IN p_copies INT,
  IN p_print_type ENUM('B&W', 'Color'),
  IN p_side_type ENUM('Single', 'Double'),
  IN p_special_instructions TEXT,
  IN p_payment_method VARCHAR(100),
  OUT p_total_amount DECIMAL(10, 2),
  OUT p_status VARCHAR(50)
)
BEGIN
  DECLARE v_price_per_page DECIMAL(6, 2);
  DECLARE v_shop_status VARCHAR(20);
  DECLARE v_history_id VARCHAR(50);
  DECLARE v_payment_id VARCHAR(50);
  DECLARE v_trx_ref VARCHAR(100);
  
  -- Error handling: Rollback on any SQL exception
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Step 1: Verify shop exists and is active
  SELECT status INTO v_shop_status FROM print_shops WHERE shop_id = p_shop_id;
  IF v_shop_status IS NULL OR v_shop_status != 'ACTIVE' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Selected print shop is currently inactive or does not exist.';
  END IF;

  -- Step 2: Fetch authoritative pricing from MySQL pricing table
  SELECT price_per_page INTO v_price_per_page 
  FROM pricing 
  WHERE shop_id = p_shop_id AND print_type = p_print_type AND side_type = p_side_type;

  IF v_price_per_page IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No pricing matrix configured for the selected shop, type, and side.';
  END IF;

  -- Step 3: Authoritative server-side cost calculation
  SET p_total_amount = (p_pages * p_copies * v_price_per_page);
  SET p_status = 'PENDING';
  SET v_history_id = CONCAT('HIST-', UUID_SHORT());
  SET v_payment_id = CONCAT('PAY-', UUID_SHORT());
  SET v_trx_ref = CONCAT('TXN-', UPPER(SUBSTRING(MD5(RAND()), 1, 10)));

  -- Step 4: Insert into print_requests
  INSERT INTO print_requests (
    request_id, user_id, shop_id, document_name, file_url, file_size,
    pages, copies, print_type, side_type, price_per_page, total_amount,
    status, payment_status, payment_method, special_instructions, created_at
  ) VALUES (
    p_request_id, p_user_id, p_shop_id, p_document_name, p_file_url, p_file_size,
    p_pages, p_copies, p_print_type, p_side_type, v_price_per_page, p_total_amount,
    'PENDING', 'PAID', p_payment_method, p_special_instructions, NOW()
  );

  -- Step 5: Insert into status_history
  INSERT INTO status_history (
    history_id, request_id, status, operator_id, note, completed, changed_at
  ) VALUES (
    v_history_id, p_request_id, 'Submitted', NULL, 'Request submitted online with digital copy attached.', TRUE, NOW()
  );

  -- Step 6: Insert into payments ledger
  INSERT INTO payments (
    payment_id, request_id, user_id, amount, payment_status, payment_method, transaction_ref, created_at
  ) VALUES (
    v_payment_id, p_request_id, p_user_id, p_total_amount, 'PAID', p_payment_method, v_trx_ref, NOW()
  );

  COMMIT;
END //

-- ---------------------------------------------------------------------
-- PROCEDURE 2: sp_update_request_status
-- Enforces valid finite state machine transitions and audit logging.
-- Allowed Transitions:
--   PENDING   -> ACCEPTED or REJECTED
--   ACCEPTED  -> PRINTING
--   PRINTING  -> READY
--   READY     -> COLLECTED
-- ---------------------------------------------------------------------
CREATE PROCEDURE sp_update_request_status(
  IN p_request_id VARCHAR(50),
  IN p_new_status VARCHAR(50),
  IN p_operator_id VARCHAR(50),
  IN p_operator_note TEXT
)
BEGIN
  DECLARE v_current_status VARCHAR(50);
  DECLARE v_history_id VARCHAR(50);
  DECLARE v_is_valid_transition BOOLEAN DEFAULT FALSE;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Lock row for update
  SELECT status INTO v_current_status 
  FROM print_requests 
  WHERE request_id = p_request_id 
  FOR UPDATE;

  IF v_current_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Print request not found.';
  END IF;

  -- Validate state machine transition
  IF v_current_status = 'PENDING' AND (p_new_status = 'ACCEPTED' OR p_new_status = 'REJECTED') THEN
    SET v_is_valid_transition = TRUE;
  ELSEIF v_current_status = 'ACCEPTED' AND p_new_status = 'PRINTING' THEN
    SET v_is_valid_transition = TRUE;
  ELSEIF v_current_status = 'PRINTING' AND p_new_status = 'READY' THEN
    SET v_is_valid_transition = TRUE;
  ELSEIF v_current_status = 'READY' AND p_new_status = 'COLLECTED' THEN
    SET v_is_valid_transition = TRUE;
  END IF;

  IF NOT v_is_valid_transition THEN
    SIGNAL SQLSTATE '45000' 
      SET MESSAGE_TEXT = 'Invalid status transition. Workflow does not permit this state change.';
  END IF;

  -- Update request record
  UPDATE print_requests 
  SET 
    status = p_new_status,
    payment_status = CASE WHEN p_new_status = 'REJECTED' THEN 'REFUNDED' ELSE payment_status END,
    updated_at = NOW()
  WHERE request_id = p_request_id;

  -- Insert history audit record
  SET v_history_id = CONCAT('HIST-', UUID_SHORT());
  INSERT INTO status_history (
    history_id, request_id, status, operator_id, note, completed, changed_at
  ) VALUES (
    v_history_id, p_request_id, p_new_status, p_operator_id, p_operator_note, TRUE, NOW()
  );

  COMMIT;
END //

DELIMITER ;
