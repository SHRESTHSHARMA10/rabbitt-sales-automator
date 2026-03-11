const path = require('path');
const { body, validationResult } = require('express-validator');

// ─── Allowed file extensions ───
const ALLOWED_EXTENSIONS = ['.csv', '.xlsx'];

// ─── Max file size: 5MB (in bytes) ───
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ─── Middleware: Validate the uploaded file ───
// Checks that a file exists, has an allowed extension, and is under 5MB.
const validateFile = (req, res, next) => {
  // Check if a file was uploaded at all
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded. Please upload a .csv or .xlsx file.',
    });
  }

  // Check file extension
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return res.status(400).json({
      success: false,
      error: `Invalid file type: "${ext}". Only .csv and .xlsx files are allowed.`,
    });
  }

  // Check file size
  if (req.file.size > MAX_FILE_SIZE) {
    return res.status(400).json({
      success: false,
      error: `File too large (${(req.file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`,
    });
  }

  // All checks passed — continue to the next middleware/route handler
  next();
};

// ─── Middleware: Validate email format ───
// Uses express-validator to check the email field in the request body.
const validateEmail = [
  body('email')
    .trim()                                          // remove whitespace
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.'),

  // After validation, check if there were any errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,  // return the first error message
      });
    }
    next();
  },
];

module.exports = { validateFile, validateEmail };
