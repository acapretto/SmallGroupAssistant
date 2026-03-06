# TutorChat Component Documentation

## Overview

**TutorChat** is a production-ready React chat interface component for the Small Group Learning Assistant. It provides a conversational AI tutor experience for groups of 3–5 students, with support for message formatting, session management, and copy-to-clipboard functionality.

**Component Path:** `src/components/TutorChat.tsx`
**Styles Path:** `src/styles/chat.css`
**Types Path:** `src/types/chat.ts`

---

## Architecture

### Component Structure

```
TutorChat (Main Component)
├── Session State (created on mount)
├── Messages Array (user + AI messages)
├── Input Form
│   ├── Text Input
│   ├── Send Button
│   └── Character Counter
├── Messages Display
│   ├── Message Bubble (user)
│   ├── Message Bubble (AI)
│   │   ├── Formatted Text (bold, code)
│   │   ├── Timestamp
│   │   └── Copy Button
│   └── Thinking Indicator (loading state)
├── Error Message (if applicable)
└── Header
    ├── Topic & Group Name
    ├── Session Timer (optional)
    └── End Session Button
```

### Data Flow

```
User Input
    ↓
handleSendMessage()
    ↓
Validation + Error Handling
    ↓
Add User Message to State
    ↓
onSendMessage() Callback (external API call)
    ↓
simulateAIResponse() [Placeholder for Task 4]
    ↓
Add AI Response to State
    ↓
Auto-scroll to Latest Message
```

---

## Usage

### Basic Example

```tsx
import React from 'react';
import TutorChat from './components/TutorChat';

function App() {
  return (
    <TutorChat
      groupId="group_a"
      groupName="Group A (Period 3)"
      topic="Quadratic Equations"
      difficulty="standard"
      showTimer={true}
    />
  );
}

export default App;
```

### Props Interface

```typescript
interface TutorChatProps {
  groupId: string;                    // Required: Unique group identifier
  groupName?: string;                 // Optional: Display name (default: "Learning Group")
  topic: string;                      // Required: Current learning topic
  difficulty?: 'foundational' |       // Optional: Affects response tone (default: "standard")
               'standard' |
               'advanced';
  onSessionStart?: (sessionId: string) => void;  // Called when session initializes
  onSessionEnd?: (sessionId: string) => void;    // Called when session ends
  onSendMessage?: (message: string) => void | Promise<void>;  // Called on message send (API hook)
  maxMessages?: number;               // Max messages before session ends (default: 100)
  showTimer?: boolean;                // Show elapsed time in header (default: false)
}
```

### Props Examples

#### Minimal Setup
```tsx
<TutorChat groupId="g1" topic="Functions" />
```

#### Full Setup with Callbacks
```tsx
<TutorChat
  groupId="group_algebra_1_a"
  groupName="Algebra 1A (Period 1)"
  topic="Solving Linear Equations"
  difficulty="foundational"
  showTimer={true}
  onSessionStart={(sessionId) => {
    console.log(`Session started: ${sessionId}`);
    // Log to database
  }}
  onSessionEnd={(sessionId) => {
    console.log(`Session ended: ${sessionId}`);
    // Save session to database
  }}
  onSendMessage={async (message) => {
    // Call Claude API here (Task 4)
    // const response = await fetch('/api/chat', { ... });
  }}
  maxMessages={150}
/>
```

---

## TypeScript Interfaces

### Message

```typescript
interface Message {
  id: string;           // Unique ID (generated)
  type: 'user' | 'ai';  // Message sender
  author?: string;      // Student name (if type === 'user')
  text: string;         // Message content
  timestamp: Date;      // When sent
  isThinking?: boolean; // AI loading state
}
```

### Session

```typescript
interface Session {
  id: string;           // Unique session ID (generated)
  groupId: string;      // Associated group
  groupName: string;    // Display name
  topic: string;        // Learning topic
  difficulty: 'foundational' | 'standard' | 'advanced';
  messages: Message[];  // Full conversation history
  startedAt: Date;      // Session start time
  pausedAt?: Date;      // When paused (if applicable)
  endedAt?: Date;       // When ended
  status: 'active' | 'paused' | 'ended';
}
```

### Other Types

See `src/types/chat.ts` for:
- `Group`, `Student` (for future multi-group support)
- `ChatMessage`, `AIRequest`, `AIResponse` (API payloads)

---

## Features & Behavior

### 1. Message Formatting

The component supports inline markdown-style formatting:

- **Bold:** `**text**` → displays as `<strong>`
- **Code:** `` `text` `` → displays as `<code>` with syntax highlighting
- Plain text: rendered as-is

**Example:**
```
User sees: "The **quadratic formula** is `x = (-b ± √(b²-4ac)) / 2a`"
Renders as: The <strong>quadratic formula</strong> is <code>x = (-b ± √(b²-4ac)) / 2a</code>
```

### 2. Copy to Clipboard

AI messages include a "Copy" button (bottom right of bubble). Clicking copies the raw message text. Button shows "✓ Copied" for 2 seconds, then reverts.

**Implementation:**
```typescript
const handleCopyToClipboard = async (messageId: string, text: string) => {
  await navigator.clipboard.writeText(text);
  setCopiedMessageId(messageId);
  setTimeout(() => setCopiedMessageId(null), 2000);
};
```

### 3. Auto-Scroll

Messages automatically scroll into view as they arrive. Uses `useEffect` with `scrollIntoView({ behavior: 'smooth' })`.

### 4. Session Management

- Session created on component mount with unique ID
- `onSessionStart` callback fires immediately
- `onSessionEnd` callback fires when "End Session" button clicked
- Session status tracked in state: `'active' | 'paused' | 'ended'`
- Input disabled after session ends

### 5. Error Handling

Errors display in a dismissible banner:
- Empty input validation
- API call failures (from `onSendMessage`)
- Max messages reached
- Session initialization issues

### 6. Loading States

- Input field disabled while sending (`isLoading = true`)
- Send button shows "Sending..." text
- Thinking indicator animates while AI responds (3-dot pulse animation)

### 7. Character Counter

Displays current/max character count (500 chars) as user types.

### 8. Session Timer

If `showTimer={true}`, elapsed time displays in header in `MM:SS` format.

---

## Styling System

### CSS Variables (Theming)

All colors, spacing, and transitions defined as CSS custom properties:

```css
--color-ai: #f5f7fa;         /* AI message background */
--color-user: #e3f2fd;       /* User message background */
--color-error: #c62828;      /* Error state */
--color-success: #2e7d32;    /* Success state */
--spacing-md: 12px;
--font-size-base: 14px;
--transition-base: 200ms ease-in-out;
```

**To customize**, override in your app's CSS:

```css
:root {
  --color-ai: #e8f5e9;  /* Your custom AI color */
  --color-user: #bbdefb;
}
```

### Layout

- **Container:** CSS Grid with 4 rows (header | messages | error | input)
- **Messages:** Flexbox column with auto-scroll
- **Input:** Grid 2-column (input | button)
- **Responsive:** Tablet (max 1199px) and mobile breakpoints included

### Accessibility

- Focus indicators on buttons and input (`.focus-visible`)
- High contrast mode support (`@media (prefers-contrast: more)`)
- Reduced motion support (`@media (prefers-reduced-motion: reduce)`)
- Semantic HTML (`<time>`, `<form>`, `<button>`)
- Color not sole means of conveyance

---

## AI Response Simulation (Placeholder for Task 4)

**Current Behavior:** Component includes `simulateAIResponse()` function that generates context-aware placeholder responses based on user keywords.

**When Task 4 (API Integration) is implemented:**

1. Remove `simulateAIResponse()` function
2. Replace with actual API call in `handleSendMessage()`:

```typescript
const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... validation ...

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        groupId: session.groupId,
        topic: session.topic,
        difficulty: session.difficulty,
        messages: convertToAPIFormat(messages),
        userMessage: inputValue,
      }),
    });

    const data = await response.json();

    // Add AI response to messages
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        type: 'ai',
        text: data.content,
        timestamp: new Date(),
      },
    ]);
  } catch (err) {
    setError('Failed to get response from AI');
  } finally {
    setIsLoading(false);
  }
};
```

---

## Integration Checklist

- [x] Component complete and type-safe
- [x] Styles responsive (tablet + desktop)
- [x] Error handling implemented
- [x] Session management wired
- [x] Message formatting (bold, code)
- [x] Copy-to-clipboard working
- [x] Auto-scroll implemented
- [x] Accessibility features included
- [ ] **Task 4:** Replace `simulateAIResponse()` with actual Claude API call
- [ ] **Task 4:** Connect `onSendMessage` callback to backend endpoint
- [ ] Test with real student group
- [ ] Collect teacher feedback on UX

---

## Performance Notes

- **Message limit:** Default 100 messages per session (configurable)
- **Rendering:** React re-renders only on message/state changes (optimized)
- **Memory:** Old sessions should be cleared from state after `onSessionEnd`
- **Scroll:** Uses `scrollIntoView()` for smooth scroll (CSS-based, no JS loops)

---

## Known Limitations & Future Improvements

| Limitation | Impact | Task |
|---|---|---|
| No voice input | Text-only currently | V0.2 |
| Single message formatting | Basic **bold** and `code` only | V0.2 |
| Placeholder AI | Mock responses | Task 4 |
| No typing indicators | Can't see if group is composing | V0.2 |
| Single group only | No multi-group support yet | V0.2 |
| No message persistence | Messages lost on page refresh | Task 4 + Supabase |

---

## Testing

### Manual Testing Checklist

- [ ] Render component with minimal props
- [ ] Type message, send, verify AI response appears
- [ ] Click "Copy" button on AI message, paste to verify
- [ ] Send multiple messages, verify auto-scroll
- [ ] Disable input with `<input disabled>`, verify button disables
- [ ] End session, verify input disables
- [ ] Verify character counter updates as user types
- [ ] Test error states (empty input, failed API call)
- [ ] Test on tablet viewport (resize to 768px width)
- [ ] Test on desktop (1200px+ width)
- [ ] Keyboard navigate buttons with Tab/Enter
- [ ] Test with `showTimer={true}`, verify timer increments

### Unit Test Example (using Vitest + React Testing Library)

```typescript
import { render, screen, userEvent } from '@testing-library/react';
import TutorChat from './TutorChat';

describe('TutorChat', () => {
  it('renders with initial greeting message', () => {
    render(<TutorChat groupId="g1" topic="Functions" />);
    expect(screen.getByText(/Welcome.*Learning Group/i)).toBeInTheDocument();
  });

  it('sends message on form submit', async () => {
    const user = userEvent.setup();
    const handleSendMessage = vi.fn();
    render(
      <TutorChat
        groupId="g1"
        topic="Functions"
        onSendMessage={handleSendMessage}
      />
    );

    const input = screen.getByPlaceholderText(/Ask a question/i);
    await user.type(input, 'What is a function?');
    await user.click(screen.getByRole('button', { name: /Send/i }));

    expect(handleSendMessage).toHaveBeenCalledWith('What is a function?');
  });
});
```

---

## File Structure

```
SmallGroupAssistant/
├── src/
│   ├── components/
│   │   └── TutorChat.tsx          ← Main component
│   ├── styles/
│   │   └── chat.css               ← Component styles
│   └── types/
│       └── chat.ts                ← TypeScript interfaces
├── COMPONENT_DOCS.md              ← This file
├── CLAUDE.md                       ← Project vision
├── PRD.md                          ← Product requirements
└── tasks.md                        ← Development tasks
```

---

## Support & Next Steps

**To integrate into your app:**
1. Copy `src/components/TutorChat.tsx` into your project
2. Copy `src/types/chat.ts` for type safety
3. Copy `src/styles/chat.css` and ensure it's imported in your app
4. Wrap `<TutorChat />` in your layout with appropriate width/height constraints
5. Implement Task 4 (API integration) to connect to Claude backend

**Questions?** See `CLAUDE.md` and `PRD.md` for project context.
