/**
 * SmallGroupAssistant Backend Server
 * Express.js + Node.js
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import examplesRouter from './routes/examples';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/examples', examplesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Not found',
      code: 'NOT_FOUND',
    },
  });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`SmallGroupAssistant backend running on port ${PORT}`);
  console.log(`Client URL: ${CLIENT_URL}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
