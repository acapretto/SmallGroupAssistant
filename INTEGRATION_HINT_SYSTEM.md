# Integration Guide: Hint System

This guide shows how to integrate the hint system into the main Small Group Assistant app.

## Backend Setup

### 1. Register the hints route in your Express server

**File:** `backend/server.ts` (or your main Express app file)

```typescript
import hintsRouter from "./routes/hints";

const app = express();

// ... other middleware ...

// Register hints route
app.use("/api/hints", hintsRouter);

// ... rest of server ...
```

### 2. Environment Variables

The hints route needs access to the Claude API. Ensure your `.env` file has:

```
ANTHROPIC_API_KEY=sk-ant-v1-xxxxxxxxxxxxx
```

The code uses:
```typescript
const client = new Anthropic(); // Reads ANTHROPIC_API_KEY from process.env
```

### 3. Dependencies

Add to `backend/package.json`:
```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "express": "^4.18.0"
  }
}
```

## Frontend Setup

### 1. Add React TypeScript types

Create/update `src/types/hints.ts`:

```typescript
export interface HintData {
  hint: string;
  type: "question" | "hint" | "explanation";
  level: 1 | 2 | 3;
  keyMessage: string;
}

export interface HintRequest {
  problemText: string;
  userAttempt: string;
  hintLevel: 1 | 2 | 3;
}
```

### 2. Import and use in a problem page

**File:** `src/pages/ProblemPage.tsx`

```typescript
import React, { useState } from "react";
import { HintSystem } from "../components/HintSystem";

interface ProblemPageProps {
  groupId: string;
  studentName: string;
  problem: {
    id: string;
    text: string;
    topic: string;
  };
}

export const ProblemPage: React.FC<ProblemPageProps> = ({
  groupId,
  studentName,
  problem,
}) => {
  const [hintCount, setHintCount] = useState(0);

  const handleHintRequested = (level: number) => {
    setHintCount(hintCount + 1);
    console.log(`Hint Level ${level} requested. Total hints: ${hintCount + 1}`);
  };

  return (
    <div className="problem-page">
      <div className="problem-display">
        <h2>{problem.text}</h2>
        {/* Problem working area goes here */}
      </div>

      <div className="problem-support">
        <HintSystem
          problemText={problem.text}
          problemId={problem.id}
          groupId={groupId}
          studentName={studentName}
          onHintRequested={handleHintRequested}
        />
      </div>

      {hintCount > 0 && (
        <p className="hint-counter">Hints used: {hintCount}</p>
      )}
    </div>
  );
};
```

### 3. Styling integration

The HintSystem component includes self-contained CSS in `HintSystem.css`. To use it:

```typescript
import HintSystem from "../components/HintSystem";
import "../components/HintSystem.css";
```

Or in your main CSS file:
```css
@import "./components/HintSystem.css";
```

## In Practice Problem Generator

When generating practice problems, wrap each one with hints:

```typescript
export const PracticeProblems: React.FC = () => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [problems, setProblems] = useState<Problem[]>([]);

  const currentProblem = problems[currentProblemIndex];

  return (
    <div className="practice-section">
      <div className="problem-card">
        <h3>Problem {currentProblemIndex + 1}</h3>
        <p>{currentProblem.text}</p>

        <textarea
          placeholder="Show your work or enter your answer"
          className="student-work"
        />

        {/* Hint system integrated here */}
        <HintSystem
          problemText={currentProblem.text}
          problemId={`problem-${currentProblemIndex}`}
          groupId="group-a"
          studentName="Group"
          onHintRequested={(level) => {
            console.log(`Requested Level ${level} for Problem ${currentProblemIndex}`);
          }}
        />

        <button onClick={() => setCurrentProblemIndex(currentProblemIndex + 1)}>
          Next Problem
        </button>
      </div>
    </div>
  );
};
```

## In Session Log / Teacher Dashboard

Track hint usage in the session log:

```typescript
interface SessionLog {
  groupId: string;
  startTime: Date;
  endTime?: Date;
  problems: {
    id: string;
    text: string;
    hintsRequested: {
      level: 1 | 2 | 3;
      timestamp: Date;
    }[];
    studentAnswer?: string;
    isCorrect?: boolean;
  }[];
}

// Render in teacher dashboard
export const SessionReview: React.FC<{ log: SessionLog }> = ({ log }) => {
  return (
    <div>
      {log.problems.map((problem) => (
        <div key={problem.id} className="problem-review">
          <p>{problem.text}</p>
          <p>Hints used: {problem.hintsRequested.length}</p>
          {problem.hintsRequested.map((hint, idx) => (
            <span key={idx} className="hint-badge">
              Level {hint.level}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
```

## API Integration Checklist

- [x] Claude API credentials in `.env`
- [x] Hints route registered in Express server
- [x] `/api/hints/get` endpoint responding
- [x] `/api/hints/track` endpoint for logging (optional)
- [x] Frontend imports HintSystem component
- [x] HintSystem CSS imported
- [x] Problem pages pass required props

## Testing Integration

### Local Dev
1. Start backend: `npm run dev` (or `node server.js`)
2. Start frontend: `npm run dev` (React/Vite)
3. Navigate to a problem page
4. Type an attempt in the hint system textarea
5. Click "Need a hint?" → Should see Level 1 hint from Claude
6. Click "Go deeper" → Should see Level 2 hint
7. Click "Full guidance" → Should see Level 3 hint

### Check Network Calls
Open DevTools Network tab:
- POST to `/api/hints/get` → Response should be JSON with `hint`, `type`, `level`, `keyMessage`
- POST to `/api/hints/track` (optional) → Should return `{ success: true }`

### Throttle Test
1. Request Level 1 hint
2. Immediately try to request Level 2 → Should see "Please wait 2s..." error
3. Wait 2 seconds
4. Try again → Should succeed

## Common Issues & Fixes

| Issue | Cause | Fix |
|---|---|---|
| "ANTHROPIC_API_KEY not found" | Env var missing | Add to `.env` in root directory |
| "Cannot find module hints" | Route not registered | Check Express server imports hints router |
| Hint buttons disabled | userAttempt is empty | Student must type in textarea first |
| API returns "Failed to parse response" | Claude returned invalid JSON | Check system prompt formatting in socratic-hints.txt |
| Hints loading forever | Network issue or slow API | Check browser Network tab, Claude API status |

## Architecture Diagram

```
ProblemPage.tsx
  ├─ Problem Display
  └─ HintSystem.tsx
      ├─ Textarea (userAttempt)
      ├─ 3 Buttons (Level 1, 2, 3)
      ├─ useHints() Hook
      │   ├─ getHint() function
      │   ├─ hints state [1, 2, 3]
      │   └─ loading, error state
      └─ Hint Display
          └─ POST /api/hints/get
              └─ Claude API
                  └─ prompts/socratic-hints.txt (system prompt)
```

## Optional: Teacher Analytics Dashboard

The hint system logs to `/api/hints/track`. Future enhancements can build:

```typescript
interface HintAnalytics {
  groupId: string;
  studentName: string;
  problemId: string;
  hintLevel: 1 | 2 | 3;
  timestamp: Date;
}

// Query: "Which students request most hints?"
// Query: "Which problems require most scaffolding?"
// Query: "Do students progress from Level 1 → 2 → 3?"
```

Save these to Supabase (or your DB) for teacher review.

---

**Next steps:** Wire this into your main app, test locally, then deploy to Netlify.
