# Session Viewer — Quick Reference

## Import Statements

```tsx
// Types
import { Session, Message, Problem, Hint, calculateSessionStats } from "./types/session";

// Components
import SessionViewer from "./components/SessionViewer";
import SessionList from "./components/SessionList";
import TranscriptViewer from "./components/TranscriptViewer";
import ProblemReview from "./components/ProblemReview";

// Hook
import useSessionStorage from "./hooks/useSessionStorage";

// Example
import TeacherDashboardExample, { seedDemoSession } from "./examples/TeacherDashboardExample";
```

## Basic Usage

### 1. Load/Save Sessions

```tsx
const { sessions, addSession, updateSession, deleteSession } = useSessionStorage();

// Add a new session
addSession(newSession);

// Update a session
updateSession(sessionId, { status: "completed", notes: "Great work!" });

// Delete a session
deleteSession(sessionId);
```

### 2. Display All Sessions

```tsx
<SessionList
  sessions={sessions}
  onSessionSelect={(session) => setSelectedId(session.id)}
  selectedSessionId={selectedId}
/>
```

### 3. Display Single Session

```tsx
<SessionViewer
  session={selectedSession}
  onClose={() => setSelectedId(null)}
/>
```

## Creating a Session

```tsx
const session: Session = {
  id: crypto.randomUUID(),
  groupId: "group-a",
  groupName: "Group A",
  studentNames: ["Alice", "Bob", "Charlie"],
  topic: "Quadratic Equations",
  startTime: new Date(),
  endTime: undefined, // Set when session ends
  messages: [], // Built up during session
  problemsAttempted: [],
  hintsRequested: [],
  score: { correct: 0, total: 0 },
  status: "active",
  notes: undefined,
};
```

## During Tutoring Session

### Add AI Message
```tsx
const message: Message = {
  id: crypto.randomUUID(),
  sender: "ai",
  content: "Let's solve a quadratic equation...",
  timestamp: new Date(),
  type: "text",
};
messages.push(message);
```

### Add Student Message
```tsx
const message: Message = {
  id: crypto.randomUUID(),
  sender: "student",
  senderName: "Alice",
  content: "How do I use the formula?",
  timestamp: new Date(),
  type: "text",
};
messages.push(message);
```

### Add Hint
```tsx
const hint: Hint = {
  id: crypto.randomUUID(),
  problemId: "prob-1",
  hintLevel: 1, // 1=Socratic, 2=guided, 3=direct
  hintText: "What are the values of a, b, and c?",
  timestamp: new Date(),
};
hintsRequested.push(hint);
```

### Add Problem & Solution
```tsx
const problem: Problem = {
  id: crypto.randomUUID(),
  text: "Solve x² + 5x + 6 = 0",
  problemNumber: 1,
  studentAnswer: "x = -2, x = -3",
  correctAnswer: "x = -2, x = -3",
  isCorrect: true,
  timeSpentSeconds: 180,
  attemptsCount: 1,
  difficulty: "easy",
};
problemsAttempted.push(problem);

// Update score
session.score = { correct: 1, total: 1 };
```

## End Session & Save

```tsx
session.endTime = new Date();
session.status = "completed";
session.notes = "Group mastered quadratic formula";

addSession(session);
```

## View Session Stats

```tsx
const stats = calculateSessionStats(session);

console.log(stats);
// {
//   totalDuration: 2700,           // seconds
//   messagesCount: 15,
//   problemsCount: 5,
//   correctProblems: 4,
//   hintsUsedCount: 2,
//   averageTimePerProblem: 540,
//   scorePercentage: 80
// }
```

## Component Props

### SessionViewer
```tsx
<SessionViewer
  session={session}                    // Session object
  onClose={() => handleClose()}        // Optional close callback
/>
```

### SessionList
```tsx
<SessionList
  sessions={sessions}                  // Session[]
  onSessionSelect={handleSelect}       // (session) => void
  selectedSessionId={selectedId}       // Optional string
/>
```

### TranscriptViewer (used by SessionViewer, but available standalone)
```tsx
<TranscriptViewer
  messages={session.messages}          // Message[]
/>
```

### ProblemReview (used by SessionViewer, but available standalone)
```tsx
<ProblemReview
  problems={session.problemsAttempted} // Problem[]
/>
```

## API Endpoints (Backend)

```bash
# List all sessions
GET /api/sessions?groupId=group-a&topic=Quadratic&status=completed

# Get one session
GET /api/sessions/session-123

# Create session
POST /api/sessions
Content-Type: application/json
{ session object }

# Update session
PATCH /api/sessions/session-123
Content-Type: application/json
{ partial updates }

# Delete session
DELETE /api/sessions/session-123

# Get stats
GET /api/sessions/stats/summary
```

## Common Patterns

### Dashboard with Sidebar
```tsx
function TeacherDashboard() {
  const { sessions } = useSessionStorage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = sessions.find(s => s.id === selectedId);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <SessionList
        sessions={sessions}
        onSessionSelect={(s) => setSelectedId(s.id)}
        selectedSessionId={selectedId}
      />
      {selected && <SessionViewer session={selected} />}
    </div>
  );
}
```

### Filter Completed Sessions
```tsx
const completedSessions = sessions.filter(s => s.status === "completed");
```

### Sort by Score (Highest First)
```tsx
const sorted = [...sessions].sort((a, b) => {
  const scoreA = a.score.total > 0 ? a.score.correct / a.score.total : 0;
  const scoreB = b.score.total > 0 ? b.score.correct / b.score.total : 0;
  return scoreB - scoreA;
});
```

### Export to JSON
```tsx
const exportSession = (session: Session) => {
  const json = JSON.stringify(session, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `session-${session.id}.json`;
  a.click();
};
```

## Types Reference

### Session
```tsx
{
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
  score: { correct: number; total: number };
  notes?: string;
  status: "active" | "paused" | "completed";
}
```

### Message
```tsx
{
  id: string;
  sender: "ai" | "student";
  senderName?: string;
  content: string;
  timestamp: Date;
  type?: "text" | "hint" | "feedback";
}
```

### Problem
```tsx
{
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
```

### Hint
```tsx
{
  id: string;
  problemId: string;
  hintLevel: number; // 1-3
  hintText: string;
  timestamp: Date;
}
```

## CSS Classes (for customization)

```css
/* Main components */
.session-viewer
.session-list
.transcript-viewer
.problem-review

/* Common elements */
.stat-card
.score-badge
.status-badge
.problem-card
.transcript-message
.message-meta
```

## Testing with Demo Data

```tsx
import { seedDemoSession } from "./examples/TeacherDashboardExample";

const { addSession } = useSessionStorage();
seedDemoSession(addSession);
// Realistic sample session now in storage
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Sessions not persisting | Check localStorage is enabled (DevTools → Application → Storage) |
| Components not rendering | Verify `loading` state is false from `useSessionStorage` |
| Styles missing | Ensure CSS files imported in main App component |
| Search slow | For 1000+ messages, implement debounced search (see docs) |
| Mobile layout broken | Check viewport meta tag in HTML |

## Performance Tips

- Use `useMemo` for filtered/sorted lists
- Implement lazy loading for very large sessions
- Archive sessions older than 30 days
- Pagination unnecessary (list naturally filtered)

---

**Full documentation:** `SESSIONVIEWER_README.md`
**Integration guide:** `INTEGRATION_GUIDE.md`
