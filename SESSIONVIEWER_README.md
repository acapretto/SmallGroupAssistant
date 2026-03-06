# Session Log Viewer — V0.1

Comprehensive session review interface for teachers to analyze group learning outcomes.

## Overview

The Session Log Viewer allows teachers to:
- Browse all recorded group learning sessions
- Filter by status, topic, and group
- Review complete transcripts of AI-student interactions
- Analyze problems solved, answer correctness, and time spent
- Track hints requested and group engagement metrics
- Add notes on group progress and next steps

## Architecture

### Data Structure

**Session** (`src/types/session.ts`)
```typescript
Session {
  id: string                    // Unique session ID
  groupId: string              // Group identifier
  groupName: string            // Human-readable group name
  studentNames: string[]       // List of participating students
  topic: string                // Learning topic (e.g., "Quadratic Equations")
  startTime: Date              // Session start timestamp
  endTime?: Date               // Session end timestamp
  messages: Message[]          // Full chat transcript
  problemsAttempted: Problem[] // All problems with solutions
  hintsRequested: Hint[]       // All hint requests with context
  score: { correct: number, total: number } // Aggregate score
  notes?: string               // Teacher's notes on group
  status: "active" | "paused" | "completed"
}

Message {
  id: string
  sender: "ai" | "student"
  senderName?: string         // Which student (if applicable)
  content: string
  timestamp: Date
  type?: "text" | "hint" | "feedback"
}

Problem {
  id: string
  text: string
  problemNumber: number
  studentAnswer: string
  correctAnswer: string
  isCorrect: boolean
  timeSpentSeconds: number
  attemptsCount: number
  difficulty?: "easy" | "medium" | "hard"
}

Hint {
  id: string
  problemId: string
  hintLevel: number  // 1 (Socratic) to 3 (direct)
  hintText: string
  timestamp: Date
}
```

### Components

#### `SessionViewer.tsx` (Main Component)
Displays a single session with tabbed interface:
- **Overview Tab**: Statistics, performance summary, score visualization
- **Transcript Tab**: Searchable conversation history with timestamps
- **Problems Tab**: Detailed review of each problem (with filters)
- **Notes Tab**: Teacher's observations and next steps

Key features:
- Automatic session stats calculation
- JSON export for archiving
- Editable notes section
- Color-coded sender identification

#### `SessionList.tsx` (Dashboard)
Sidebar/main view showing all sessions:
- Filterable by status (active/paused/completed)
- Filterable by topic and group
- Sortable by date, topic, group, or score
- Session selection highlights
- Quick-view score and status indicators

#### `TranscriptViewer.tsx`
Searchable conversation display:
- Timeline layout with timestamps
- AI vs. student color coding
- Message type badges (text/hint/feedback)
- Time deltas between consecutive messages
- Expandable long messages
- Full-text search across all messages

#### `ProblemReview.tsx`
Problem analysis view:
- Filter by correctness (all/correct/incorrect)
- Statistics: total problems, correct count, time per problem
- Expandable problem cards showing:
  - Problem text
  - Student answer
  - Correct answer (if wrong)
  - Difficulty level
  - Attempts count
- Score percentage badge (color-coded: good/fair/poor)

### Backend Routes

**File:** `backend/routes/sessions.ts`

Uses in-memory storage (or localStorage fallback) for V0.1. Easy to swap with database.

#### POST `/api/sessions`
Save a new session
```json
{
  "id": "session-123",
  "groupId": "group-a",
  "topic": "Quadratic Equations",
  ...
}
```

#### GET `/api/sessions/:id`
Retrieve specific session by ID

#### GET `/api/sessions`
List all sessions with optional filters:
```
?groupId=group-a&topic=Quadratic&status=completed
```

#### PATCH `/api/sessions/:id`
Partial update (e.g., end session, add notes)

#### DELETE `/api/sessions/:id`
Remove a session

#### GET `/api/sessions/stats/summary`
Aggregate statistics across all sessions

### Storage

**V0.1 approach:** `localStorage` with in-memory fallback
- Key: `smallgroup_sessions`
- Format: Record<sessionId, Session>
- Automatic date parsing on load/save

**Migration path for V0.2:**
- Replace `getStoredSessions()` / `saveStoredSessions()` with DB calls
- No API changes needed

### Hook: `useSessionStorage`

React hook for managing sessions in localStorage:
```typescript
const {
  sessions,        // All sessions
  loading,         // Initial load state
  addSession,      // Add new session
  updateSession,   // Update partial session
  deleteSession,   // Remove session
  getSession,      // Retrieve by ID
  clearAll         // Reset storage
} = useSessionStorage();
```

## Usage Example

### In a React App

```tsx
import { useSessionStorage } from "./hooks/useSessionStorage";
import SessionList from "./components/SessionList";
import SessionViewer from "./components/SessionViewer";
import { useState } from "react";

export function TeacherDashboard() {
  const { sessions, addSession, updateSession } = useSessionStorage();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedSession = sessions.find(s => s.id === selectedId);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <SessionList
        sessions={sessions}
        onSessionSelect={(s) => setSelectedId(s.id)}
        selectedSessionId={selectedId}
      />
      {selectedSession && (
        <SessionViewer
          session={selectedSession}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
```

### Creating a Session

```tsx
import { Session } from "./types/session";
import { useSessionStorage } from "./hooks/useSessionStorage";

const { addSession } = useSessionStorage();

const newSession: Session = {
  id: "sess-" + Date.now(),
  groupId: "group-a",
  groupName: "Group A",
  studentNames: ["Alice", "Bob", "Charlie"],
  topic: "Quadratic Equations",
  startTime: new Date(),
  status: "active",
  messages: [
    {
      id: "msg-1",
      sender: "ai",
      content: "Today we're learning quadratic equations...",
      timestamp: new Date(),
    },
    // ... more messages
  ],
  problemsAttempted: [],
  hintsRequested: [],
  score: { correct: 0, total: 0 },
};

addSession(newSession);
```

## Features

### Overview Tab
- **Session header** with topic, group name, student list, status
- **Info strip** showing date, group, status, duration
- **Stats grid** with engagement (messages, hints), problem-solving (correct count, score %), timing (duration, avg time/problem)
- **Performance summary** with large score circle, accuracy percentage, narrative breakdown

### Transcript Tab
- **Search** across all messages (by content or sender name)
- **Timeline** with:
  - Color-coded sender badges (🤖 AI, 👤 Student)
  - Timestamps (HH:MM:SS)
  - Time deltas (Δ 2m 34s)
  - Message type pills (text, hint, feedback)
- **Collapsible messages** for long content
- **Result count** showing filtered/total messages

### Problems Tab
- **Stats bar** showing total, correct, incorrect, avg time, total time
- **Filter buttons** (All, Correct, Incorrect) with counts
- **Problem cards** for each problem:
  - Problem number + ✓/✗ status
  - Difficulty level, attempt count, time spent
  - Expandable details:
    - Problem text (with blue left border)
    - Student answer (yellow border)
    - Correct answer (green border, if wrong)
  - Color-coded card left edge (green=correct, red=incorrect)

### Notes Tab
- **Display mode** (default): Read-only notes with "Edit" button
- **Edit mode**: textarea for adding/modifying teacher observations
- **Save/Cancel** buttons when editing
- Empty state: "No notes yet"

## Styling

All components use **CSS Grid and Flexbox** for responsive layout:
- Light theme: white backgrounds, #0066cc primary color
- Accessibility: adequate contrast ratios, large touch targets
- Responsive: adapts to tablet/mobile (see CSS media queries)

## Export

- **JSON export**: Downloads complete session as JSON file
- Format: `session-{sessionId}.json`
- Includes all messages, problems, hints, metadata

## Future Enhancements (V0.2+)

- [ ] PDF export with formatted report
- [ ] Compare multiple sessions side-by-side
- [ ] Group progress trends (multiple sessions)
- [ ] Print-friendly views
- [ ] Session templates for recurring topics
- [ ] Audio/video playback of session hints
- [ ] LMS integration (Canvas, Blackboard)
- [ ] Real-time dashboard for multi-group monitoring
- [ ] Student self-reflection prompts post-session

## File Locations

```
src/
├── types/
│   └── session.ts                 # Type definitions
├── components/
│   ├── SessionViewer.tsx          # Main view
│   ├── SessionViewer.css
│   ├── TranscriptViewer.tsx
│   ├── TranscriptViewer.css
│   ├── ProblemReview.tsx
│   ├── ProblemReview.css
│   ├── SessionList.tsx            # Dashboard list
│   └── SessionList.css
└── hooks/
    └── useSessionStorage.ts       # localStorage hook

backend/
└── routes/
    └── sessions.ts                # API endpoints
```

## Testing

Example test session data (seed with `useSessionStorage`):

```json
{
  "session-001": {
    "id": "session-001",
    "groupId": "group-a",
    "groupName": "Group A",
    "studentNames": ["Alice", "Bob", "Charlie"],
    "topic": "Quadratic Equations",
    "startTime": "2026-03-05T10:00:00Z",
    "endTime": "2026-03-05T10:45:00Z",
    "messages": [
      {
        "id": "msg-1",
        "sender": "ai",
        "content": "Today we're learning how to solve quadratic equations using the quadratic formula...",
        "timestamp": "2026-03-05T10:00:00Z",
        "type": "text"
      }
    ],
    "problemsAttempted": [
      {
        "id": "prob-1",
        "text": "Solve: x² + 5x + 6 = 0",
        "problemNumber": 1,
        "studentAnswer": "x = -2, x = -3",
        "correctAnswer": "x = -2, x = -3",
        "isCorrect": true,
        "timeSpentSeconds": 120,
        "attemptsCount": 1,
        "difficulty": "easy"
      }
    ],
    "hintsRequested": [],
    "score": {
      "correct": 1,
      "total": 1
    },
    "status": "completed"
  }
}
```

---

**Built for Small Group Assistant V0.1** — AI-powered learning companion for classroom small groups.
