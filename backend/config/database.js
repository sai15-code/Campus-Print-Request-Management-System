/**
 * Database Configuration & MySQL Connection Pool
 * Campus Print Request Management System
 * Uses mysql2/promise for async/await query execution and connection pooling.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_print_db',
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS !== 'false',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0', 10),
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+00:00',
  dateStrings: true
};

const pool = mysql.createPool(poolConfig);

/**
 * Test MySQL connection
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL database: ${poolConfig.database} on ${poolConfig.host}:${poolConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`[Database Warning] Could not connect to MySQL server (${error.message}). Check DB_HOST, DB_USER, DB_PASSWORD.`);
    return false;
  }
}

/**
 * Execute query with parameters
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Promise<[Array, Object]>}
 */
async function query(sql, params = []) {
  return pool.query(sql, params);
}

/**
 * Execute parameterized statement
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Promise<[Object, Object]>}
 */
async function execute(sql, params = []) {
  return pool.execute(sql, params);
}

/**
 * Get a connection from the pool for transactions
 * @returns {Promise<mysql.PoolConnection>}
 */
async function getConnection() {
  return pool.getConnection();
}

module.exports = {
  pool,
  query,
  execute,
  getConnection,
  testConnection
};
