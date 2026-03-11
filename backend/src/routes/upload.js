const express = require('express');
const multer = require('multer');
const { validateFile, validateEmail } = require('../middleware/validation');
const { parseFile } = require('../services/fileParser');
const { generateSummary } = require('../services/aiService');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

// ─── Configure multer for file uploads ───
// We use memoryStorage so the file stays in RAM (as a buffer) — no temp files on disk.
// This is simpler and works well for small files (< 5MB).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a sales file and receive an AI-generated summary via email
 *     description: >
 *       Accepts a CSV or XLSX sales file along with an email address.
 *       The file is parsed, analyzed by AI (Groq Llama 3), and a professional
 *       summary report is sent to the provided email address.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: Sales data file (.csv or .xlsx, max 5MB)
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *         description: Email address to receive the summary report
 *     responses:
 *       200:
 *         description: Summary generated and email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Sales summary has been sent to your email!
 *                 summary:
 *                   type: string
 *                   example: "## Executive Summary\n..."
 *       400:
 *         description: Validation error (missing file, invalid email, wrong file type)
 *       500:
 *         description: Server error (AI or email service failure)
 */
router.post(
  '/',
  upload.single('file'),   // Step 1: multer processes the file upload (field name: "file")
  validateFile,            // Step 2: validate file exists, type, and size
  validateEmail,           // Step 3: validate email format
  async (req, res, next) => {
    try {
      // ─── Step 4: Parse the uploaded file into JSON data ───
      console.log(`Parsing file: ${req.file.originalname}`);
      const salesData = parseFile(req.file);
      console.log(`Parsed ${salesData.length} rows of sales data`);

      // ─── Step 5: Send data to Groq AI for analysis ───
      console.log('Generating AI summary...');
      const summary = await generateSummary(salesData);
      console.log('AI summary generated successfully');

      // ─── Step 6: Email the summary to the user ───
      const email = req.body.email;
      console.log(`Sending summary to ${email}...`);
      await sendEmail(email, summary);
      console.log('Email sent successfully!');

      // ─── Step 7: Send success response back to frontend ───
      res.status(200).json({
        success: true,
        message: 'Sales summary has been sent to your email!',
        summary: summary,  // also return the summary so frontend can display it
      });

    } catch (error) {
      // Pass any errors to the global error handler
      next(error);
    }
  }
);

module.exports = router;
