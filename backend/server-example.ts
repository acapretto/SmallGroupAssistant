/**
 * server-example.ts - Example Express server setup
 * Shows how to integrate the problems router into your backend
 *
 * NOTE: This is an example. Adapt to your existing server structure.
 */

import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import problemsRouter from "./routes/problems";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "small-group-assistant-api",
    timestamp: new Date().toISOString(),
  });
});

// Register the problems router
// All routes will be prefixed with /api/problems
app.use("/api/problems", problemsRouter);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "SmallGroupAssistant API",
    version: "0.1",
    endpoints: {
      health: "GET /health",
      generateProblems: "POST /api/problems/generate",
      checkAnswer: "POST /api/problems/check-answer",
      problemsHealth: "GET /api/problems/health",
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use(
  (
    err: Error,
    req: Request,
    res: Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(
    `SmallGroupAssistant API running on http://localhost:${PORT}`
  );
  console.log(`API endpoints:`);
  console.log(`  POST /api/problems/generate`);
  console.log(`  POST /api/problems/check-answer`);
  console.log(`  GET /api/problems/health`);
  console.log(`  GET /health`);
});

export default app;
