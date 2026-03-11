// ─── Global Error Handler Middleware ───
// Express recognizes this as an error handler because it has 4 parameters: (err, req, res, next).
// Any time an error is thrown or passed via next(err), it lands here.
const errorHandler = (err, req, res, next) => {
  // Log the full error to the server console (for debugging)
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // ─── Handle specific error types ───

  // Multer errors (file upload issues)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
    });
  }

  // Validation errors (bad user input)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // ─── Default: Internal server error ───
  // In production, hide the real error message from users (security best practice).
  // In development, show the actual error for easier debugging.
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again later.'
      : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = { errorHandler };
