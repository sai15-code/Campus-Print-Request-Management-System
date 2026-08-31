/**
 * Global Error Handling & Not Found Middleware
 */

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Resource not found: ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  console.error('[Error Occurred]:', err.stack || err.message || err);

  // Handle JSON parse error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON payload in request body.'
    });
  }

  // Handle MySQL Duplicate Entry (Error 1062)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'A record with this unique identifier or email already exists.'
    });
  }

  // Handle MySQL Foreign Key Failure (Error 1452)
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      error: 'Referenced foreign key entity does not exist.'
    });
  }

  // General server error fallback
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error occurred.'
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
