/**
 * Session Management Routes
 * Handles CRUD operations for learning sessions
 * Uses localStorage for V0.1 (no DB)
 */

import express from "express";
import { Session, Message, Problem, Hint } from "../../src/types/session";

const router = express.Router();

// ============================================================================
// Utility: localStorage simulation (for Node.js backend)
// In production, replace with actual database
// ============================================================================

const STORAGE_KEY = "smallgroup_sessions";

const getStoredSessions = (): Record<string, Session> => {
  try {
    const stored = global.localStorage?.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveStoredSessions = (sessions: Record<string, Session>): void => {
  try {
    global.localStorage?.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    console.error("Failed to save sessions to storage");
  }
};

// In-memory fallback (when localStorage is not available)
let inMemorySessions: Record<string, Session> = {};

const getSessions = (): Record<string, Session> => {
  if (global.localStorage) {
    return getStoredSessions();
  }
  return inMemorySessions;
};

const saveSessions = (sessions: Record<string, Session>): void => {
  if (global.localStorage) {
    saveStoredSessions(sessions);
  } else {
    inMemorySessions = sessions;
  }
};

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /api/sessions
 * Save a new session
 * Body: Session object
 */
router.post("/", (req, res) => {
  try {
    const session: Session = req.body;

    // Validate required fields
    if (!session.id || !session.groupId || !session.topic) {
      return res.status(400).json({
        error: "Missing required fields: id, groupId, topic",
      });
    }

    // Parse dates if they're strings
    if (typeof session.startTime === "string") {
      session.startTime = new Date(session.startTime);
    }
    if (session.endTime && typeof session.endTime === "string") {
      session.endTime = new Date(session.endTime);
    }

    // Parse message timestamps
    session.messages = session.messages.map((msg) => ({
      ...msg,
      timestamp:
        typeof msg.timestamp === "string"
          ? new Date(msg.timestamp)
          : msg.timestamp,
    }));

    // Parse hint timestamps
    session.hintsRequested = session.hintsRequested.map((hint) => ({
      ...hint,
      timestamp:
        typeof hint.timestamp === "string"
          ? new Date(hint.timestamp)
          : hint.timestamp,
    }));

    const sessions = getSessions();
    sessions[session.id] = session;
    saveSessions(sessions);

    res.status(201).json({
      success: true,
      message: "Session saved",
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error saving session:", error);
    res.status(500).json({ error: "Failed to save session" });
  }
});

/**
 * GET /api/sessions/:id
 * Retrieve a specific session by ID
 */
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const sessions = getSessions();
    const session = sessions[id];

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error("Error retrieving session:", error);
    res.status(500).json({ error: "Failed to retrieve session" });
  }
});

/**
 * GET /api/sessions
 * List all sessions with optional filters
 * Query params:
 *   - groupId: filter by group ID
 *   - topic: filter by topic (partial match)
 *   - status: filter by status (active, paused, completed)
 */
router.get("/", (req, res) => {
  try {
    const { groupId, topic, status } = req.query;
    const sessions = getSessions();

    let sessionList = Object.values(sessions);

    // Apply filters
    if (groupId) {
      sessionList = sessionList.filter((s) => s.groupId === groupId);
    }

    if (topic) {
      const topicLower = String(topic).toLowerCase();
      sessionList = sessionList.filter((s) =>
        s.topic.toLowerCase().includes(topicLower)
      );
    }

    if (status) {
      sessionList = sessionList.filter((s) => s.status === status);
    }

    // Sort by startTime (newest first)
    sessionList.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    res.json(sessionList);
  } catch (error) {
    console.error("Error listing sessions:", error);
    res.status(500).json({ error: "Failed to list sessions" });
  }
});

/**
 * PATCH /api/sessions/:id
 * Update a session (partial update)
 * Body: Partial Session object
 */
router.patch("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const sessions = getSessions();
    const session = sessions[id];

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Parse dates if needed
    if (updates.endTime && typeof updates.endTime === "string") {
      updates.endTime = new Date(updates.endTime);
    }

    // Parse messages if included
    if (updates.messages) {
      updates.messages = updates.messages.map(
        (msg: Message) => ({
          ...msg,
          timestamp:
            typeof msg.timestamp === "string"
              ? new Date(msg.timestamp)
              : msg.timestamp,
        })
      );
    }

    // Merge updates
    const updatedSession = { ...session, ...updates };
    sessions[id] = updatedSession;
    saveSessions(sessions);

    res.json({
      success: true,
      message: "Session updated",
      session: updatedSession,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ error: "Failed to update session" });
  }
});

/**
 * DELETE /api/sessions/:id
 * Delete a session by ID
 */
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const sessions = getSessions();

    if (!sessions[id]) {
      return res.status(404).json({ error: "Session not found" });
    }

    delete sessions[id];
    saveSessions(sessions);

    res.json({
      success: true,
      message: "Session deleted",
    });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

/**
 * GET /api/sessions/stats/summary
 * Get summary statistics across all sessions
 */
router.get("/stats/summary", (req, res) => {
  try {
    const sessions = Object.values(getSessions());

    const stats = {
      totalSessions: sessions.length,
      activeSessions: sessions.filter((s) => s.status === "active").length,
      completedSessions: sessions.filter((s) => s.status === "completed")
        .length,
      totalStudents: new Set(
        sessions.flatMap((s) => s.studentNames)
      ).size,
      totalProblemsAttempted: sessions.reduce(
        (sum, s) => sum + s.problemsAttempted.length,
        0
      ),
      totalHintsRequested: sessions.reduce(
        (sum, s) => sum + s.hintsRequested.length,
        0
      ),
      overallCorrectRate:
        sessions.reduce((sum, s) => sum + s.score.correct, 0) /
        Math.max(
          1,
          sessions.reduce((sum, s) => sum + s.score.total, 0)
        ),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error retrieving stats:", error);
    res.status(500).json({ error: "Failed to retrieve stats" });
  }
});

export default router;
