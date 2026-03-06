/**
 * Problem.ts - Type definitions for the practice problem generator
 */

export interface Problem {
  id: string;
  problemText: string;
  correctAnswer: string;
  hints: string[];
  topic: string;
  difficultyLevel: string;
}

export interface ProblemGenerationRequest {
  topic: string;
  count: number; // 3-5
  difficultyLevel: string; // "easy" | "medium" | "hard"
}

export interface ProblemGenerationResponse {
  problems: Problem[];
  generatedAt: string;
}

export interface CheckAnswerRequest {
  problemId: string;
  userAnswer: string;
}

export interface CheckAnswerResponse {
  correct: boolean;
  feedback: string;
  hint?: string;
  explanation?: string;
}

export interface ProblemSetState {
  problems: Problem[];
  currentIndex: number;
  userAnswers: Map<string, string>;
  scores: Map<string, boolean>;
  isLoading: boolean;
  error?: string;
  totalCorrect: number;
}
