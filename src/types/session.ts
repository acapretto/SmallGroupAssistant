/**
 * Session Type Definitions
 * Defines data structures for group learning sessions
 */

export interface Message {
  id: string;
  sender: "ai" | "student";
  senderName?: string; // For student messages, track which student
  content: string;
  timestamp: Date;
  type?: "text" | "hint" | "feedback"; // Message category
}

export interface Problem {
  id: string;
  text: string;
  problemNumber: number;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  attemptsCount: number;
  difficulty?: "easy" | "medium" | "hard";
}

export interface Hint {
  id: string;
  problemId: string;
  hintLevel: number; // 1 (most Socratic) to 3 (most direct)
  hintText: string;
  timestamp: Date;
}

export interface Session {
  id: string;
  groupId: string;
  groupName: string;
  studentNames: string[];
  topic: string;
  startTime: Date;
  endTime?: Date;
  messages: Message[];
  problemsAttempted: Problem[];
  hintsRequested: Hint[];
  score: {
    correct: number;
    total: number;
  };
  notes?: string; // Teacher notes on group progress
  status: "active" | "paused" | "completed";
}

export interface SessionStats {
  totalDuration: number; // seconds
  messagesCount: number;
  problemsCount: number;
  correctProblems: number;
  hintsUsedCount: number;
  averageTimePerProblem: number; // seconds
  scorePercentage: number;
}

export const calculateSessionStats = (session: Session): SessionStats => {
  const totalDuration = session.endTime
    ? (new Date(session.endTime).getTime() -
        new Date(session.startTime).getTime()) /
      1000
    : 0;

  const problemsCount = session.problemsAttempted.length;
  const correctProblems = session.problemsAttempted.filter(
    (p) => p.isCorrect
  ).length;
  const totalTime = session.problemsAttempted.reduce(
    (sum, p) => sum + p.timeSpentSeconds,
    0
  );
  const averageTimePerProblem =
    problemsCount > 0 ? totalTime / problemsCount : 0;
  const scorePercentage =
    problemsCount > 0 ? (correctProblems / problemsCount) * 100 : 0;

  return {
    totalDuration,
    messagesCount: session.messages.length,
    problemsCount,
    correctProblems,
    hintsUsedCount: session.hintsRequested.length,
    averageTimePerProblem,
    scorePercentage,
  };
};
