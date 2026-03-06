/**
 * TeacherDashboardExample.tsx
 * Complete example showing how to integrate SessionViewer with app
 */

import React, { useState, useEffect } from "react";
import { Session } from "../types/session";
import SessionList from "../components/SessionList";
import SessionViewer from "../components/SessionViewer";
import useSessionStorage from "../hooks/useSessionStorage";
import "./TeacherDashboardExample.css";

/**
 * This component demonstrates a complete teacher dashboard
 * with session list sidebar and detail view
 */
export const TeacherDashboardExample: React.FC = () => {
  const { sessions, loading, addSession, updateSession } = useSessionStorage();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  // Example: Seed with demo data on first load
  useEffect(() => {
    if (!loading && sessions.length === 0) {
      // Optionally populate with demo session
      // seedDemoSession(addSession);
    }
  }, [loading, sessions.length]);

  const handleSessionSelect = (session: Session) => {
    setSelectedSessionId(session.id);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  if (loading) {
    return <div className="dashboard loading">Loading sessions...</div>;
  }

  return (
    <div className="dashboard">
      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰ Sessions
      </button>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <SessionList
          sessions={sessions}
          onSessionSelect={handleSessionSelect}
          selectedSessionId={selectedSessionId}
        />
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {selectedSession ? (
          <SessionViewer
            session={selectedSession}
            onClose={() => setSelectedSessionId(null)}
          />
        ) : (
          <div className="no-selection">
            <div className="no-selection-content">
              <h2>Select a Session</h2>
              <p>Choose a session from the list to review details.</p>
              {sessions.length === 0 && (
                <p className="hint">No sessions recorded yet.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

/**
 * Demo function to seed a sample session
 */
export const seedDemoSession = (addSession: (session: Session) => void) => {
  const demoSession: Session = {
    id: "demo-session-001",
    groupId: "group-algebra-1",
    groupName: "Algebra 1 - Group A",
    studentNames: ["Alice Johnson", "Bob Smith", "Charlie Brown"],
    topic: "Solving Quadratic Equations",
    startTime: new Date("2026-03-05T10:00:00"),
    endTime: new Date("2026-03-05T10:45:00"),
    status: "completed",
    messages: [
      {
        id: "msg-1",
        sender: "ai",
        content:
          "Welcome everyone! Today we're going to learn how to solve quadratic equations using the quadratic formula. The quadratic formula is one of the most powerful tools in algebra.",
        timestamp: new Date("2026-03-05T10:00:00"),
        type: "text",
      },
      {
        id: "msg-2",
        sender: "student",
        senderName: "Alice",
        content: "What's the quadratic formula again?",
        timestamp: new Date("2026-03-05T10:02:00"),
        type: "text",
      },
      {
        id: "msg-3",
        sender: "ai",
        content:
          "Great question! For an equation ax² + bx + c = 0, the quadratic formula is: x = (-b ± √(b² - 4ac)) / 2a. Let me break this down step by step.",
        timestamp: new Date("2026-03-05T10:03:00"),
        type: "text",
      },
      {
        id: "msg-4",
        sender: "student",
        senderName: "Bob",
        content: "I need a hint on the first problem",
        timestamp: new Date("2026-03-05T10:15:00"),
        type: "text",
      },
      {
        id: "msg-5",
        sender: "ai",
        content:
          "Sure! For x² + 5x + 6 = 0, what are the values of a, b, and c in the quadratic formula?",
        timestamp: new Date("2026-03-05T10:15:30"),
        type: "hint",
      },
      {
        id: "msg-6",
        sender: "student",
        senderName: "Bob",
        content: "Oh! a=1, b=5, c=6",
        timestamp: new Date("2026-03-05T10:16:00"),
        type: "text",
      },
      {
        id: "msg-7",
        sender: "ai",
        content: "Perfect! Now substitute those values and calculate.",
        timestamp: new Date("2026-03-05T10:16:30"),
        type: "feedback",
      },
      {
        id: "msg-8",
        sender: "student",
        senderName: "Charlie",
        content:
          "I got x = -2 and x = -3. Is that right?",
        timestamp: new Date("2026-03-05T10:18:00"),
        type: "text",
      },
      {
        id: "msg-9",
        sender: "ai",
        content:
          "Excellent work! That's correct. You can verify by plugging these values back into the original equation. Both -2 and -3 make the equation equal zero.",
        timestamp: new Date("2026-03-05T10:18:30"),
        type: "feedback",
      },
    ],
    problemsAttempted: [
      {
        id: "prob-1",
        text: "Solve: x² + 5x + 6 = 0",
        problemNumber: 1,
        studentAnswer: "x = -2, x = -3",
        correctAnswer: "x = -2, x = -3",
        isCorrect: true,
        timeSpentSeconds: 180,
        attemptsCount: 1,
        difficulty: "easy",
      },
      {
        id: "prob-2",
        text: "Solve: 2x² - 7x + 3 = 0",
        problemNumber: 2,
        studentAnswer: "x = 3, x = 0.5",
        correctAnswer: "x = 3, x = 0.5",
        isCorrect: true,
        timeSpentSeconds: 240,
        attemptsCount: 2,
        difficulty: "medium",
      },
      {
        id: "prob-3",
        text: "Solve: x² - 2x - 8 = 0",
        problemNumber: 3,
        studentAnswer: "x = -2, x = 4",
        correctAnswer: "x = -2, x = 4",
        isCorrect: true,
        timeSpentSeconds: 150,
        attemptsCount: 1,
        difficulty: "easy",
      },
      {
        id: "prob-4",
        text: "Solve: 3x² + 5x - 2 = 0",
        problemNumber: 4,
        studentAnswer: "x = -2, x = 1/3",
        correctAnswer: "x = -2, x = 1/3",
        isCorrect: true,
        timeSpentSeconds: 300,
        attemptsCount: 3,
        difficulty: "hard",
      },
    ],
    hintsRequested: [
      {
        id: "hint-1",
        problemId: "prob-1",
        hintLevel: 1,
        hintText: "What are the values of a, b, and c?",
        timestamp: new Date("2026-03-05T10:15:30"),
      },
    ],
    score: {
      correct: 4,
      total: 4,
    },
    notes: "Excellent session! All three students demonstrated strong understanding of the quadratic formula. Bob struggled initially but recovered with hints. Group worked collaboratively and stayed on-task throughout. Ready for extension: discriminant analysis.",
  };

  addSession(demoSession);
};

export default TeacherDashboardExample;
