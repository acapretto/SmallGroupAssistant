/**
 * Types for SmallGroupAssistant - Example Generator
 */

export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';

export interface ExampleGeneratorRequest {
  topic: string;
  question: string;
  difficultyLevel: DifficultyLevel;
}

export interface Step {
  number: number;
  action: string;
  work: string;
  explanation: string;
}

export interface ExampleGeneratorResponse {
  problemStatement: string;
  setup: string;
  steps: Step[];
  realWorldConnection?: string;
  commonMistake: string;
  keyTakeaway: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

export interface ExampleGeneratorError {
  message: string;
  code: 'INVALID_REQUEST' | 'API_ERROR' | 'PARSING_ERROR' | 'RATE_LIMIT';
  details?: string;
}
