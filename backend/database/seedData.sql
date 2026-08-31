-- =====================================================================
-- CAMPUS PRINT REQUEST MANAGEMENT SYSTEM - SEED DATA SCRIPT
-- Database: campus_print_db
-- 
-- Default Test Credentials:
-- -------------------------------------------------------------
-- 1. Administrator Account:
--    Email:    admin@campus.edu
--    Password: admin123 (Bcrypt Hash: $2b$10$22f4efOno8JMN4kYukkume2aN58.wn54oy58QsHKCqml9WmwL/IvG)
-- 
-- 2. Student Accounts:
--    Email:    student1@campus.edu
--    Password: password123 (Bcrypt Hash: $2b$10$iPMwuedT6i91OxnKZX7bPe0zi9ImFeiyAtzjftjaxaqSWM9G2N8Em)
-- 
--    Email:    student2@campus.edu
--    Password: password123 (Bcrypt Hash: $2b$10$iPMwuedT6i91OxnKZX7bPe0zi9ImFeiyAtzjftjaxaqSWM9G2N8Em)
-- =====================================================================

USE campus_print_db;

-- ---------------------------------------------------------------------
-- 1. SEED USERS TABLE
-- ---------------------------------------------------------------------
INSERT INTO users (user_id, name, email, password, role, roll_number, department, semester, phone, avatar, status, created_at)
VALUES 
  -- Admin Account
  (
    'ADM-001', 
    'Prof. Rajesh Sharma', 
    'admin@campus.edu', 
    '$2b$10$22f4efOno8JMN4kYukkume2aN58.wn54oy58QsHKCqml9WmwL/IvG', 
    'ADMIN', 
    NULL, 
    'Campus Reprographics & IT Services', 
    NULL, 
    '+91 98765 00099', 
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    'ACTIVE', 
    '2023-08-10 10:00:00'
  ),

  -- Student 1 Account (Default Demo Student)
  (
    'STU-8924', 
    'Student One', 
    'student1@campus.edu', 
    '$2b$10$iPMwuedT6i91OxnKZX7bPe0zi9ImFeiyAtzjftjaxaqSWM9G2N8Em', 
    'STUDENT', 
    '21CS042', 
    'Computer Science & Engineering', 
    '6th Semester', 
    '+91 98765 43210', 
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'ACTIVE', 
    '2024-01-15 09:30:00'
  ),

  -- Student 2 Account
  (
    'STU-8925', 
    'Aarav Patel', 
    'student2@campus.edu', 
    '$2b$10$iPMwuedT6i91OxnKZX7bPe0zi9ImFeiyAtzjftjaxaqSWM9G2N8Em', 
    'STUDENT', 
    '21EC019', 
    'Electronics & Communication', 
    '6th Semester', 
    '+91 98765 43211', 
    NULL,
    'ACTIVE', 
    '2024-02-02 11:15:00'
  ),

  -- Student 3 Account
  (
    'STU-8926', 
    'Priya Sundaram', 
    'priya.s@campus.edu', 
    '$2b$10$iPMwuedT6i91OxnKZX7bPe0zi9ImFeiyAtzjftjaxaqSWM9G2N8Em', 
    'STUDENT', 
    '22ME055', 
    'Mechanical Engineering', 
    '4th Semester', 
    '+91 98765 43212', 
    NULL,
    'ACTIVE', 
    '2024-08-18 14:00:00'
  ),

  -- Student 4 Account (Inactive Demo)
  (
    'STU-8927', 
    'Rohan Verma', 
    'rohan.v@campus.edu', 
    '$2b$10$iPMwuedT6i91OxnKZX7bPe0zi9ImFeiyAtzjftjaxaqSWM9G2N8Em', 
    'STUDENT', 
    '20CS088', 
    'Computer Science & Engineering', 
    '8th Semester', 
    '+91 98765 43213', 
    NULL,
    'INACTIVE', 
    '2022-08-10 16:45:00'
  )
ON DUPLICATE KEY UPDATE name=VALUES(name), status=VALUES(status);

-- ---------------------------------------------------------------------
-- 2. SEED PRINT SHOPS TABLE (3 Campus Facilities)
-- ---------------------------------------------------------------------
INSERT INTO print_shops (shop_id, shop_name, short_name, location, timing, contact, email, rating, services, status, created_at)
VALUES
  (
    'shop-main',
    'Campus Central Xerox & Reprographics Center',
    'Campus Xerox Center',
    'Central Library Building, Ground Floor (Opposite Reading Hall)',
    '8:00 AM - 8:00 PM (Mon - Sat)',
    '+91 98765 00001',
    'reprographics@campus.edu',
    4.9,
    '["High-Speed B&W Laser", "Color HD Printing", "Spiral & Hard Binding", "Lamination & Scanning"]',
    'ACTIVE',
    '2023-01-01 08:00:00'
  ),
  (
    'shop-engg',
    'North Campus Engineering Block Print Cell',
    'North Engg Print Cell',
    'Block 4, 1st Floor, Near CAD Computing Lab',
    '9:00 AM - 5:30 PM (Mon - Fri)',
    '+91 98765 00002',
    'northprint@campus.edu',
    4.7,
    '["Plotting & Blueprints", "B&W Laser", "Spiral Binding"]',
    'ACTIVE',
    '2023-03-15 09:00:00'
  ),
  (
    'shop-hostel',
    'Hostel Quad 2 Night Print Kiosk',
    'Hostel Quad Kiosk',
    'Boys Hostel 3 Entrance Arcade',
    '6:00 PM - 12:00 AM (Daily)',
    '+91 98765 00003',
    'hostelkiosk@campus.edu',
    4.5,
    '["Express B&W Printing", "A4 Document Scanning"]',
    'INACTIVE',
    '2023-09-01 18:00:00'
  )
ON DUPLICATE KEY UPDATE shop_name=VALUES(shop_name), status=VALUES(status);

-- ---------------------------------------------------------------------
-- 3. SEED PRICING MATRIX TABLE
-- ---------------------------------------------------------------------
INSERT INTO pricing (pricing_id, shop_id, print_type, side_type, price_per_page, unit, created_at)
VALUES
  ('PRC-001', 'shop-main', 'B&W', 'Single', 2.00, '₹ / page', '2026-08-01 00:00:00'),
  ('PRC-002', 'shop-main', 'B&W', 'Double', 1.50, '₹ / page', '2026-08-01 00:00:00'),
  ('PRC-003', 'shop-main', 'Color', 'Single', 10.00, '₹ / page', '2026-08-01 00:00:00'),
  ('PRC-004', 'shop-main', 'Color', 'Double', 8.00, '₹ / page', '2026-08-01 00:00:00'),
  ('PRC-005', 'shop-engg', 'B&W', 'Single', 2.50, '₹ / page', '2026-07-15 00:00:00'),
  ('PRC-006', 'shop-engg', 'Color', 'Single', 12.00, '₹ / page', '2026-07-15 00:00:00')
ON DUPLICATE KEY UPDATE price_per_page=VALUES(price_per_page);

-- ---------------------------------------------------------------------
-- 4. SEED PRINT REQUESTS TABLE (Diverse Statuses for Testing)
-- ---------------------------------------------------------------------
INSERT INTO print_requests (
  request_id, user_id, shop_id, document_name, file_url, file_size,
  pages, copies, print_type, side_type, price_per_page, total_amount,
  status, payment_status, payment_method, special_instructions, created_at
) VALUES
  (
    'REQ-2024-001',
    'STU-8924',
    'shop-main',
    'DBMS_Mini_Project_Report_Final.pdf',
    NULL,
    '4.2 MB',
    32,
    2,
    'B&W',
    'Double',
    1.50,
    96.00, -- 32 pages * 2 copies * ₹1.50 = ₹96.00
    'READY',
    'PAID',
    'Campus Card / UPI',
    'Spiral binding requested. Black header covers.',
    '2026-08-28 09:30:00'
  ),
  (
    'REQ-2024-002',
    'STU-8925',
    'shop-main',
    'Computer_Networks_Lab_Assignment_3.pdf',
    NULL,
    '1.8 MB',
    14,
    1,
    'Color',
    'Single',
    10.00,
    140.00, -- 14 pages * 1 copy * ₹10.00 = ₹140.00
    'PRINTING',
    'PAID',
    'UPI (Google Pay)',
    'Glossy photo paper for architecture diagram on page 4.',
    '2026-08-29 07:15:00'
  ),
  (
    'REQ-2024-003',
    'STU-8926',
    'shop-main',
    'Software_Engineering_Case_Study_Presentation.pdf',
    NULL,
    '8.5 MB',
    18,
    3,
    'Color',
    'Double',
    8.00,
    432.00, -- 18 pages * 3 copies * ₹8.00 = ₹432.00
    'ACCEPTED',
    'PAID',
    'Campus Smart Card',
    'Corner stapled, landscape orientation.',
    '2026-08-29 08:05:00'
  ),
  (
    'REQ-2024-004',
    'STU-8924',
    'shop-main',
    'Resume_Campus_Placement_2026.pdf',
    NULL,
    '620 KB',
    2,
    10,
    'B&W',
    'Single',
    2.00,
    40.00, -- 2 pages * 10 copies * ₹2.00 = ₹40.00
    'COLLECTED',
    'PAID',
    'Campus UPI',
    '100 GSM Bond paper requested for crisp text.',
    '2026-08-26 14:20:00'
  ),
  (
    'REQ-2024-005',
    'STU-8927',
    'shop-main',
    'Machine_Learning_Term_Paper_Draft.pdf',
    NULL,
    '2.4 MB',
    24,
    1,
    'B&W',
    'Double',
    1.50,
    36.00, -- 24 pages * 1 copy * ₹1.50 = ₹36.00
    'PENDING',
    'PENDING',
    'Pay on Collection',
    'Standard duplex printing, 2-hole punch on left margin.',
    '2026-08-29 08:20:00'
  ),
  (
    'REQ-2024-006',
    'STU-8924',
    'shop-main',
    'Genetics_Lab_Manual_Pages_1_to_8.pdf',
    NULL,
    '1.1 MB',
    8,
    1,
    'Color',
    'Single',
    10.00,
    80.00,
    'REJECTED',
    'REFUNDED',
    'Campus UPI',
    'High contrast microscopic slides.',
    '2026-08-27 11:10:00'
  )
ON DUPLICATE KEY UPDATE status=VALUES(status), total_amount=VALUES(total_amount);

-- ---------------------------------------------------------------------
-- 5. SEED STATUS HISTORY AUDIT LOGS
-- ---------------------------------------------------------------------
INSERT INTO status_history (history_id, request_id, status, operator_id, note, completed, changed_at)
VALUES
  -- REQ-2024-001 (Currently READY)
  ('HIST-101', 'REQ-2024-001', 'Submitted', NULL, 'Request submitted online with digital copy attached.', TRUE, '2026-08-28 09:30:00'),
  ('HIST-102', 'REQ-2024-001', 'Accepted', 'ADM-001', 'Operator verified page layout and paper stock.', TRUE, '2026-08-28 09:45:00'),
  ('HIST-103', 'REQ-2024-001', 'Printing', 'ADM-001', 'Heavy duty laser printer queue started (Tray 2).', TRUE, '2026-08-28 10:15:00'),
  ('HIST-104', 'REQ-2024-001', 'Ready', 'ADM-001', 'Document printed, spiral-bound, and shelved in Locker Box #14.', TRUE, '2026-08-28 10:50:00'),

  -- REQ-2024-002 (Currently PRINTING)
  ('HIST-201', 'REQ-2024-002', 'Submitted', NULL, 'Request submitted online.', TRUE, '2026-08-29 07:15:00'),
  ('HIST-202', 'REQ-2024-002', 'Accepted', 'ADM-001', 'High-resolution color profile calibrated.', TRUE, '2026-08-29 07:40:00'),
  ('HIST-203', 'REQ-2024-002', 'Printing', 'ADM-001', 'High speed digital color printing in progress.', TRUE, '2026-08-29 08:10:00'),

  -- REQ-2024-003 (Currently ACCEPTED)
  ('HIST-301', 'REQ-2024-003', 'Submitted', NULL, 'Request logged by student.', TRUE, '2026-08-29 08:05:00'),
  ('HIST-302', 'REQ-2024-003', 'Accepted', 'ADM-001', 'Order approved, queued for morning slot batch.', TRUE, '2026-08-29 08:20:00'),

  -- REQ-2024-004 (COLLECTED)
  ('HIST-401', 'REQ-2024-004', 'Submitted', NULL, 'Uploaded by student.', TRUE, '2026-08-26 14:20:00'),
  ('HIST-402', 'REQ-2024-004', 'Accepted', 'ADM-001', 'Accepted by Xerox Reprographics operator.', TRUE, '2026-08-26 14:25:00'),
  ('HIST-403', 'REQ-2024-004', 'Printing', 'ADM-001', 'Bond paper loaded and printed.', TRUE, '2026-08-26 14:30:00'),
  ('HIST-404', 'REQ-2024-004', 'Ready', 'ADM-001', 'Dispatched to pickup rack.', TRUE, '2026-08-26 14:40:00'),
  ('HIST-405', 'REQ-2024-004', 'Collected', 'ADM-001', 'Collected by student (Student ID verified).', TRUE, '2026-08-26 15:10:00'),

  -- REQ-2024-005 (PENDING)
  ('HIST-501', 'REQ-2024-005', 'Submitted', NULL, 'Request placed by student. Awaiting shop queue acknowledgment.', TRUE, '2026-08-29 08:20:00'),

  -- REQ-2024-006 (REJECTED)
  ('HIST-601', 'REQ-2024-006', 'Submitted', NULL, 'Uploaded by student.', TRUE, '2026-08-27 11:10:00'),
  ('HIST-602', 'REQ-2024-006', 'Rejected', 'ADM-001', 'Rejected: Corrupted font embedding in uploaded PDF. Refund initiated.', TRUE, '2026-08-27 11:25:00')
ON DUPLICATE KEY UPDATE note=VALUES(note);

-- ---------------------------------------------------------------------
-- 6. SEED PAYMENTS TABLE
-- ---------------------------------------------------------------------
INSERT INTO payments (payment_id, request_id, user_id, amount, payment_status, payment_method, transaction_ref, created_at)
VALUES
  ('PAY-001', 'REQ-2024-001', 'STU-8924', 96.00, 'PAID', 'Campus Card / UPI', 'TXN-98427163', '2026-08-28 09:30:00'),
  ('PAY-002', 'REQ-2024-002', 'STU-8925', 140.00, 'PAID', 'UPI (Google Pay)', 'TXN-74195230', '2026-08-29 07:15:00'),
  ('PAY-003', 'REQ-2024-003', 'STU-8926', 432.00, 'PAID', 'Campus Smart Card', 'TXN-31298401', '2026-08-29 08:05:00'),
  ('PAY-004', 'REQ-2024-004', 'STU-8924', 40.00, 'PAID', 'Campus UPI', 'TXN-65412987', '2026-08-26 14:20:00'),
  ('PAY-005', 'REQ-2024-005', 'STU-8927', 36.00, 'PENDING', 'Pay on Collection', 'TXN-PENDING-05', '2026-08-29 08:20:00'),
  ('PAY-006', 'REQ-2024-006', 'STU-8924', 80.00, 'REFUNDED', 'Campus UPI', 'TXN-REFUND-06', '2026-08-27 11:10:00')
ON DUPLICATE KEY UPDATE amount=VALUES(amount);
