/**
 * TutorChat.tsx
 * AI Tutor Chat Interface Component
 *
 * Displays a conversation between a student group and an AI tutor.
 * Features: message bubbles, typing indicator, copy-to-clipboard, formatting support.
 *
 * Usage:
 *   <TutorChat
 *     groupId="group_a"
 *     topic="Quadratic Equations"
 *     difficulty="standard"
 *     onSendMessage={(text) => sendToAPI(text)}
 *   />
 */

import React, { useState, useEffect, useRef } from 'react';
import { Message, Session, TutorChatProps } from '../types/chat';
import '../styles/chat.css';

/** Generate a unique ID for messages */
const generateId = (): string => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/** Generate a unique session ID */
const generateSessionId = (): string => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const TutorChat: React.FC<TutorChatProps> = ({
  groupId,
  groupName = 'Learning Group',
  topic,
  difficulty = 'standard',
  onSessionStart,
  onSessionEnd,
  onSendMessage,
  maxMessages = 100,
  showTimer = false,
}) => {
  // Session state
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // References for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session on component mount
  useEffect(() => {
    const newSession: Session = {
      id: generateSessionId(),
      groupId,
      groupName,
      topic,
      difficulty: difficulty as 'foundational' | 'standard' | 'advanced',
      messages: [],
      startedAt: new Date(),
      status: 'active',
    };
    setSession(newSession);
    onSessionStart?.(newSession.id);

    // Add greeting message from AI
    const greetingMessage: Message = {
      id: generateId(),
      type: 'ai',
      text: `Welcome, ${groupName}! Today we're exploring **${topic}**. What would you like to understand about this topic?`,
      timestamp: new Date(),
    };
    setMessages([greetingMessage]);

    // Focus input field on mount
    inputRef.current?.focus();
  }, [groupId, groupName, topic, onSessionStart]);

  // Timer effect
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.status]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Format message text: convert markdown-like syntax to readable format
   * Supports: **bold**, `code`, math expressions
   */
  const formatMessageText = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Match patterns: **text** for bold, `text` for code
    const boldRegex = /\*\*(.*?)\*\*/g;
    const codeRegex = /`(.*?)`/g;
    const combinedRegex = /(\*\*.*?\*\*|`.*?`)/g;

    let match;
    const tempRegex = new RegExp(combinedRegex);

    const splits = text.split(combinedRegex);
    splits.forEach((part) => {
      if (!part) return;

      if (part.startsWith('**') && part.endsWith('**')) {
        parts.push(
          <strong key={`bold_${lastIndex}`}>{part.slice(2, -2)}</strong>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        parts.push(
          <code key={`code_${lastIndex}`}>{part.slice(1, -1)}</code>
        );
      } else {
        parts.push(part);
      }
      lastIndex++;
    });

    return parts.length > 0 ? parts : text;
  };

  /**
   * Copy AI message to clipboard
   */
  const handleCopyToClipboard = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy message');
    }
  };

  /**
   * Handle message submission
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!inputValue.trim()) {
      setError('Please enter a message');
      return;
    }

    if (!session) {
      setError('Session not initialized');
      return;
    }

    if (messages.length >= maxMessages) {
      setError(`Maximum messages reached (${maxMessages})`);
      return;
    }

    // Clear error state
    setError(null);

    // Create user message
    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    // Update UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Call the external handler if provided
    try {
      if (onSendMessage) {
        await onSendMessage(inputValue);
      }

      // For now (Task 4 not yet implemented): simulate AI response
      // This will be replaced with actual API call
      await simulateAIResponse(userMessage.text);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      // Remove the failed user message
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Simulate AI thinking and response (placeholder for Task 4)
   * This will be replaced with actual Claude API call
   */
  const simulateAIResponse = async (userText: string) => {
    // Add thinking indicator
    const thinkingMessage: Message = {
      id: generateId(),
      type: 'ai',
      text: 'Thinking...',
      timestamp: new Date(),
      isThinking: true,
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate contextual response (placeholder)
    const responses: Record<string, string> = {
      quadratic: `Great question about **quadratic equations**! A quadratic is any equation that can be written as \`ax² + bx + c = 0\` where \`a ≠ 0\`.

**Why they're important:** Quadratics show up everywhere—projectile motion, business profit optimization, and physics problems.

**Key methods to solve:**
1. **Factoring** - works when the equation factors nicely
2. **Completing the square** - converts to vertex form
3. **Quadratic formula** - \`x = (-b ± √(b²-4ac)) / 2a\`

Which method interests you most?`,
      formula: `The **quadratic formula** is your most powerful tool:

\`\`\`
x = (-b ± √(b²-4ac)) / 2a
\`\`\`

**What each part means:**
- \`a, b, c\` are your coefficients from \`ax² + bx + c = 0\`
- The **±** means you'll usually get two solutions
- The part under the square root \`(b²-4ac)\` is the **discriminant**

**The discriminant tells you:**
- Positive → two real solutions
- Zero → one real solution
- Negative → no real solutions

Let's work through an example: \`x² + 3x - 10 = 0\`

Here \`a = 1, b = 3, c = -10\`. What do you get when you plug these in?`,
      hint: `Let me ask you a **Socratic question** instead:

What do you already know about this topic? Sometimes retracing what you know helps unstick the problem.

When you're ready, share:
1. What the question is asking
2. What you've already tried
3. Where you got stuck

Then I can ask guiding questions to help you think through it!`,
      default: `That's a great question! Let me break this down:

**Step 1:** Understand what we're looking for
**Step 2:** Identify the key information
**Step 3:** Connect it to concepts we know
**Step 4:** Solve step-by-step

Can you tell me:
- What specifically are you trying to find?
- What information do you already have?

That'll help me give you the most helpful explanation!`,
    };

    const lowerUserText = userText.toLowerCase();
    let responseText = responses.default;

    if (lowerUserText.includes('quadratic') || lowerUserText.includes('equation')) {
      responseText = responses.quadratic;
    } else if (lowerUserText.includes('formula')) {
      responseText = responses.formula;
    } else if (lowerUserText.includes('hint') || lowerUserText.includes('stuck')) {
      responseText = responses.hint;
    }

    // Remove thinking message and add actual response
    setMessages((prev) => {
      const withoutThinking = prev.filter((msg) => !msg.isThinking);
      return [
        ...withoutThinking,
        {
          id: generateId(),
          type: 'ai',
          text: responseText,
          timestamp: new Date(),
        },
      ];
    });
  };

  /**
   * Format elapsed time for display
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Handle session end
   */
  const handleEndSession = () => {
    if (session) {
      const endedSession: Session = {
        ...session,
        endedAt: new Date(),
        status: 'ended',
        messages,
      };
      setSession(endedSession);
      onSessionEnd?.(session.id);
    }
  };

  return (
    <div className="tutor-chat-container">
      {/* Session Header */}
      <div className="tutor-chat-header">
        <div className="header-content">
          <div className="header-left">
            <h2 className="session-title">{topic}</h2>
            <p className="session-group">{groupName}</p>
          </div>
          <div className="header-right">
            {showTimer && (
              <div className="session-timer">
                <span className="timer-label">Time:</span>
                <span className="timer-value">{formatTime(elapsedTime)}</span>
              </div>
            )}
            <button
              className="button button-end-session"
              onClick={handleEndSession}
              disabled={session?.status === 'ended'}
            >
              End Session
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="tutor-chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message message-${message.type} ${message.isThinking ? 'thinking' : ''}`}
          >
            <div className="message-bubble">
              {message.type === 'ai' && message.isThinking ? (
                <div className="thinking-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                  <p>AI is thinking...</p>
                </div>
              ) : (
                <>
                  <div className="message-text">
                    {formatMessageText(message.text)}
                  </div>
                  <div className="message-meta">
                    <time className="message-time">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    {message.type === 'ai' && (
                      <button
                        className="button-copy"
                        onClick={() =>
                          handleCopyToClipboard(message.id, message.text)
                        }
                        title="Copy to clipboard"
                      >
                        {copiedMessageId === message.id ? '✓ Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button
            className="button-close-error"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Area */}
      <form className="tutor-chat-input-form" onSubmit={handleSendMessage}>
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="tutor-chat-input"
            placeholder="Ask a question or share your thinking..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading || session?.status === 'ended'}
            maxLength={500}
          />
          <button
            type="submit"
            className="button button-send"
            disabled={isLoading || !inputValue.trim() || session?.status === 'ended'}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="input-help-text">
          {inputValue.length > 0 && (
            <span className="char-count">
              {inputValue.length}/500
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default TutorChat;
