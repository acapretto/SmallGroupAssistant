# Session Viewer Integration Guide

## Quick Start

### 1. File Structure

All session viewer files are now in place:

```
src/
├── types/
│   └── session.ts                    # Core type definitions
├── components/
│   ├── SessionViewer.tsx             # Main session detail view
│   ├── SessionViewer.css
│   ├── TranscriptViewer.tsx          # Conversation display
│   ├── TranscriptViewer.css
│   ├── ProblemReview.tsx             # Problem analysis
│   ├── ProblemReview.css
│   ├── SessionList.tsx               # Session dashboard list
│   └── SessionList.css
├── hooks/
│   └── useSessionStorage.ts          # localStorage hook
└── examples/
    ├── TeacherDashboardExample.tsx   # Full integration example
    └── TeacherDashboardExample.css

backend/
└── routes/
    └── sessions.ts                   # API endpoints

docs/
├── SESSIONVIEWER_README.md           # Complete documentation
└── INTEGRATION_GUIDE.md              # This file
```

### 2. Basic Setup

#### Step 1: Import the hook in your app

```tsx
import { useSessionStorage } from "./hooks/useSessionStorage";
```

#### Step 2: Use the hook to load/manage sessions

```tsx
const { sessions, addSession, updateSession, deleteSession } = useSessionStorage();
```

#### Step 3: Add the SessionList and SessionViewer components

```tsx
import SessionList from "./components/SessionList";
import SessionViewer from "./components/SessionViewer";

function App() {
  const { sessions, addSession } = useSessionStorage();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedSession = sessions.find(s => s.id === selectedId);

  return (
    <div style={{ display: "flex" }}>
      <SessionList
        sessions={sessions}
        onSessionSelect={(s) => setSelectedId(s.id)}
        selectedSessionId={selectedId}
      />
      {selectedSession && (
        <SessionViewer session={selectedSession} />
      )}
    </div>
  );
}
```

### 3. Creating Sessions

When the AI tutor completes a session, create a Session object and save it:

```tsx
const newSession: Session = {
  id: crypto.randomUUID(),
  groupId: "group-a",
  groupName: "Group A",
  studentNames: ["Alice", "Bob"],
  topic: "Quadratic Equations",
  startTime: new Date(),
  endTime: new Date(),
  messages: [], // populated during session
  problemsAttempted: [], // populated as group solves
  hintsRequested: [], // populated when hints given
  score: { correct: 0, total: 0 },
  status: "completed",
};

addSession(newSession);
```

### 4. Backend Integration

The backend routes are ready to use. Register them in your Express app:

```tsx
// server.ts or main backend file
import sessionsRouter from "./routes/sessions";

app.use("/api/sessions", sessionsRouter);
```

Then fetch sessions from React:

```tsx
// Instead of localStorage, call the API
async function fetchSessions() {
  const response = await fetch("/api/sessions");
  const sessions = await response.json();
  setSessions(sessions);
}
```

## Component Reference

### SessionViewer

**Props:**
- `session: Session` — The session to display (required)
- `onClose?: () => void` — Callback when user closes viewer

**Features:**
- Tabbed interface (Overview, Transcript, Problems, Notes)
- Automatic stats calculation
- JSON export
- Editable teacher notes

```tsx
<SessionViewer
  session={session}
  onClose={() => setSelectedId(null)}
/>
```

### SessionList

**Props:**
- `sessions: Session[]` — Array of sessions to display
- `onSessionSelect: (session: Session) => void` — Selection callback
- `selectedSessionId?: string` — Currently selected session ID

**Features:**
- Filterable by status, topic, group
- Sortable by date, topic, group, score
- Quick-view metrics (score, status, student count)

```tsx
<SessionList
  sessions={sessions}
  onSessionSelect={handleSelect}
  selectedSessionId={selectedId}
/>
```

### TranscriptViewer

**Props:**
- `messages: Message[]` — Array of messages to display

**Features:**
- Searchable by content and sender name
- Color-coded sender badges
- Timestamps and time deltas
- Message type badges (text/hint/feedback)
- Expandable long messages

```tsx
<TranscriptViewer messages={session.messages} />
```

### ProblemReview

**Props:**
- `problems: Problem[]` — Array of problems to display

**Features:**
- Filterable by correctness
- Per-problem statistics
- Expandable detail cards
- Color-coded difficulty levels

```tsx
<ProblemReview problems={session.problemsAttempted} />
```

## Data Flow

### Creating a Session During Tutoring

```
1. AI Tutor Session Starts
   ↓
2. Collect messages as they're exchanged
   messages.push({ sender: "ai", content: "...", timestamp: now })
   ↓
3. As problems are solved, add to problemsAttempted
   problemsAttempted.push({ text, studentAnswer, correctAnswer, isCorrect, ... })
   ↓
4. When hints are requested, add to hintsRequested
   hintsRequested.push({ hintLevel, hintText, timestamp, ... })
   ↓
5. Session ends (teacher clicks stop)
   ↓
6. Calculate final score: { correct: 3, total: 5 }
   ↓
7. Create Session object and save
   addSession(newSession)
   ↓
8. Session available in SessionList & SessionViewer
```

### Viewing a Session

```
1. Teacher clicks session in SessionList
   ↓
2. SessionList calls onSessionSelect(session)
   ↓
3. Parent component updates selectedId state
   ↓
4. SessionViewer renders with selected session
   ↓
5. Teacher can:
   - View Overview (stats, score)
   - Search Transcript
   - Filter & expand Problems
   - Add/edit Notes
   - Export JSON
```

## Customization

### Adding Custom Fields to Session

Edit `src/types/session.ts`:

```tsx
export interface Session {
  // ... existing fields
  customField?: string;
  customData?: { [key: string]: any };
}
```

Then use in components as needed.

### Changing Color Scheme

All colors are defined in CSS files. Key variables:
- Primary: `#0066cc` (blue)
- Success: `#28a745` (green)
- Error: `#dc3545` (red)
- Warning: `#ffc107` (yellow)

Edit any `.css` file to customize colors.

### Backend Storage

To replace localStorage with a database:

1. Edit `backend/routes/sessions.ts`
2. Replace `getStoredSessions()` / `saveStoredSessions()` with DB calls
3. No changes needed to API routes or React components

Example:

```tsx
// Before (localStorage)
const getStoredSessions = (): Record<string, Session> => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
};

// After (Supabase)
const getStoredSessions = async (): Promise<Record<string, Session>> => {
  const { data, error } = await supabase.from("sessions").select("*");
  return data.reduce((acc, session) => {
    acc[session.id] = session;
    return acc;
  }, {});
};
```

## Testing

### Seed Demo Data

Use the `seedDemoSession()` function in `TeacherDashboardExample.tsx`:

```tsx
import { seedDemoSession } from "./examples/TeacherDashboardExample";

const { addSession } = useSessionStorage();
seedDemoSession(addSession);
```

This creates a realistic sample session with:
- 3 students
- Multiple messages
- 4 problems (all correct)
- 1 hint request
- Full transcript

### Manual Testing Checklist

- [ ] SessionList loads and displays sessions
- [ ] Filter by status/topic/group works
- [ ] Sort by date/topic/group/score works
- [ ] Select session highlights row
- [ ] SessionViewer opens and displays correct data
- [ ] Overview tab shows stats and performance
- [ ] Transcript tab shows all messages
- [ ] Transcript search filters results
- [ ] Problems tab shows problem cards
- [ ] Problem cards expand/collapse
- [ ] Problem filters work (correct/incorrect)
- [ ] Notes tab allows editing and saving
- [ ] JSON export downloads file
- [ ] Responsive layout works on tablet/mobile

## Performance Tips

1. **Lazy load large sessions:** For sessions with 100+ messages, use `useMemo` to avoid re-renders
2. **Pagination:** SessionList is naturally paginated by filtering; no need to change
3. **Archiving old sessions:** Implement a cleanup routine to delete sessions older than N days
4. **Caching:** Store frequently accessed sessions in React Context or Redux

## Common Issues

### Issue: Sessions not persisting after refresh
**Solution:** Check that localStorage is enabled. Use the `useSessionStorage` hook which handles this automatically.

### Issue: Transcript search is slow
**Solution:** For large transcripts (1000+ messages), implement debounced search:
```tsx
const [debouncedQuery, setDebouncedQuery] = useState("");
const [query, setQuery] = useState("");

useEffect(() => {
  const timer = setTimeout(() => setDebouncedQuery(query), 300);
  return () => clearTimeout(timer);
}, [query]);
```

### Issue: Components look wrong on mobile
**Solution:** All CSS files include media queries. Check that viewport meta tag is set:
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

## Next Steps

1. **For V0.2:**
   - Add real-time dashboard for multiple groups
   - Implement PDF export
   - Add session comparison view
   - Voice recording playback

2. **For V1.0:**
   - Canvas LMS integration
   - Student self-reflection
   - Group progress trends
   - Teacher notifications

3. **Infrastructure:**
   - Migrate localStorage to Supabase
   - Set up session archival
   - Implement search indexing for large datasets
   - Add role-based access control

---

**Questions?** See `SESSIONVIEWER_README.md` for detailed documentation.
