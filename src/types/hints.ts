/**
 * Hint System TypeScript Types
 * Shared types for backend and frontend
 */

/**
 * Request payload for getting a hint
 */
export interface HintRequest {
  problemText: string;
  userAttempt: string;
  hintLevel: 1 | 2 | 3;
}

/**
 * Response from the hint API
 */
export interface HintData {
  hint: string;
  type: "question" | "hint" | "explanation";
  level: 1 | 2 | 3;
  keyMessage: string;
}

/**
 * Hint tracking record (for analytics)
 */
export interface HintUsageRecord {
  groupId: string;
  studentName: string;
  problemId: string;
  hintLevel: 1 | 2 | 3;
  timestamp: string; // ISO 8601
}

/**
 * Hint system component props
 */
export interface HintSystemProps {
  problemText: string;
  problemId: string;
  groupId: string;
  studentName: string;
  onHintRequested?: (level: number) => void;
}

/**
 * Internal state for useHints hook
 */
export interface HintsState {
  [key: number]: HintData | undefined;
  1?: HintData;
  2?: HintData;
  3?: HintData;
}

/**
 * Return type for useHints custom hook
 */
export interface UseHintsReturn {
  getHint: (request: HintRequest) => Promise<void>;
  hints: HintsState;
  loading: boolean;
  error: string | null;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  debug?: unknown;
}

/**
 * Hint system analytics for teacher dashboard
 */
export interface HintAnalytics {
  groupId: string;
  studentName: string;
  problemId: string;
  totalHintsRequested: number;
  hintsByLevel: {
    level1: number;
    level2: number;
    level3: number;
  };
  timeBeforeFirstHint: number; // milliseconds
  timeToComplete: number; // milliseconds
}

/**
 * Session log entry for a single problem
 */
export interface ProblemSessionLog {
  id: string;
  text: string;
  hintsRequested: {
    level: 1 | 2 | 3;
    timestamp: Date;
  }[];
  studentAnswer?: string;
  isCorrect?: boolean;
  timeSpent: number; // milliseconds
}

/**
 * Full session log for a group
 */
export interface SessionLog {
  groupId: string;
  groupName: string;
  startTime: Date;
  endTime?: Date;
  problems: ProblemSessionLog[];
  totalHintsRequested: number;
}
