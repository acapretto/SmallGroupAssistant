/**
 * Chat & Session Type Definitions
 * Core interfaces for TutorChat component and AI interaction
 */

/** Represents a single message in the chat */
export interface Message {
  id: string;
  type: 'user' | 'ai';
  author?: string; // User name if type === 'user'
  text: string;
  timestamp: Date;
  isThinking?: boolean; // AI thinking state
}

/** Represents a student in the group */
export interface Student {
  id: string;
  name: string;
  level?: 'below' | 'at' | 'above'; // Academic level for differentiation
}

/** Represents the learning group */
export interface Group {
  id: string;
  name: string;
  students: Student[];
  createdAt: Date;
}

/** Represents a tutoring session */
export interface Session {
  id: string;
  groupId: string;
  groupName: string;
  topic: string;
  difficulty: 'foundational' | 'standard' | 'advanced';
  messages: Message[];
  startedAt: Date;
  pausedAt?: Date;
  endedAt?: Date;
  status: 'active' | 'paused' | 'ended';
}

/** Props for TutorChat component */
export interface TutorChatProps {
  groupId: string;
  groupName?: string;
  topic: string;
  difficulty?: 'foundational' | 'standard' | 'advanced';
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: (sessionId: string) => void;
  onSendMessage?: (message: string) => void | Promise<void>;
  maxMessages?: number;
  showTimer?: boolean;
}

/** API request/response types */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  sessionId: string;
  groupId: string;
  topic: string;
  difficulty: string;
  messages: ChatMessage[];
}

export interface AIResponse {
  id: string;
  content: string;
  timestamp: Date;
}
