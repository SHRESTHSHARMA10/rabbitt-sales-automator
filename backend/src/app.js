// ─── Load environment variables FIRST (before anything else uses them) ───
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// ─── Import our custom middleware ───
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

// ─── Import our routes ───
const uploadRouter = require('./routes/upload');

// ─── Import Swagger docs config ───
const { swaggerUi, swaggerSpec } = require('./config/swagger');

// ─── Create the Express app ───
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security: Helmet adds various HTTP headers to protect the app ───
app.use(helmet());

// ─── CORS: Only allow requests from our frontend URL ───
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],        // only allow GET and POST
  allowedHeaders: ['Content-Type'], // only allow Content-Type header
}));

// ─── Parse JSON request bodies (for non-file requests) ───
app.use(express.json());

// ─── Parse URL-encoded form data ───
app.use(express.urlencoded({ extended: true }));

// ─── Rate limiting: applies to all /api routes ───
app.use('/api', apiLimiter);

// ─── API Routes ───
app.use('/api/upload', uploadRouter);

// ─── Swagger API Docs: available at /api-docs ───
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Health check endpoint (useful for deployment monitoring) ───
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global error handler (must be LAST middleware) ───
app.use(errorHandler);

// ─── Start the server ───
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
  console.log(`Health check at http://localhost:${PORT}/health`);
});
