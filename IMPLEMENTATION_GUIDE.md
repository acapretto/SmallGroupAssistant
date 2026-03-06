# Practice Problem Generator — Implementation Guide

## Overview
This is the problem generation and auto-grading system for SmallGroupAssistant V0.1. It provides:
- **Problem generation**: Creates 3-5 math problems on any topic at specified difficulty
- **Auto-grading**: Uses Claude to check answers and provide feedback
- **React component**: Displays problems, collects answers, shows results

## Files Delivered

### Backend
- **`backend/routes/problems.ts`** — Express routes for problem generation and grading
  - `POST /api/problems/generate` — Create problems
  - `POST /api/problems/check-answer` — Grade a student answer
  - `GET /api/problems/health` — Health check

### Frontend
- **`frontend/src/components/ProblemSet.tsx`** — Full React component
- **`frontend/src/components/ProblemSet.module.css`** — Styling
- **`frontend/src/types/problem.ts`** — TypeScript interfaces

### Prompts
- **`prompts/problem-generator.txt`** — Instructs Claude to generate problems
- **`prompts/problem-grader.txt`** — Instructs Claude to grade answers

## Integration Steps

### 1. Backend Setup

**Install dependencies** (if not already installed):
```bash
npm install @anthropic-ai/sdk express
npm install -D @types/express @types/node typescript
```

**Register the router in your Express app** (`backend/server.ts` or similar):
```typescript
import problemsRouter from "./routes/problems";

app.use("/api/problems", problemsRouter);
```

**Ensure environment variable is set**:
```bash
export ANTHROPIC_API_KEY="your-key-here"
```

**Test the endpoints**:
```bash
# Generate problems
curl -X POST http://localhost:3000/api/problems/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Quadratic Equations", "count": 3, "difficultyLevel": "medium"}'

# Check an answer
curl -X POST http://localhost:3000/api/problems/check-answer \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "problem_1",
    "userAnswer": "x = 2",
    "problemText": "Solve: x^2 - 4 = 0",
    "correctAnswer": "x = 2 or x = -2"
  }'
```

### 2. Frontend Setup

**Copy component files** into your React project:
- `frontend/src/components/ProblemSet.tsx`
- `frontend/src/components/ProblemSet.module.css`
- `frontend/src/types/problem.ts`

**Use the component in your app**:
```tsx
import ProblemSet from "./components/ProblemSet";

function App() {
  return (
    <div>
      <h1>Math Practice</h1>
      <ProblemSet
        topic="Quadratic Equations"
        count={4}
        difficultyLevel="medium"
        onComplete={(correct, total) => {
          console.log(`Completed: ${correct}/${total}`);
        }}
      />
    </div>
  );
}
```

**Props**:
- `topic` (string, optional) — Math topic (default: "Algebra")
- `count` (number, optional) — 3-5 problems (default: 3)
- `difficultyLevel` (string, optional) — "easy", "medium", or "hard" (default: "medium")
- `onComplete` (function, optional) — Called when all problems answered with `(correctCount, totalCount)`

### 3. CSS Integration

**Option A: CSS Modules** (recommended)
The component uses `ProblemSet.module.css`. Ensure your build system supports CSS modules.

**Option B: Global CSS**
Copy the styles from `ProblemSet.module.css` into your global stylesheet, removing the `.module` prefix from class names.

## API Endpoints

### POST /api/problems/generate

**Request**:
```json
{
  "topic": "Solving Linear Equations",
  "count": 4,
  "difficultyLevel": "medium"
}
```

**Response**:
```json
{
  "problems": [
    {
      "id": "problem_1",
      "problemText": "Solve for x: 2x + 5 = 13",
      "correctAnswer": "x = 4",
      "hints": [
        "What operation is being applied to x?",
        "Try subtracting 5 from both sides",
        "Now divide both sides by 2"
      ],
      "topic": "Solving Linear Equations",
      "difficultyLevel": "medium"
    },
    ...
  ],
  "generatedAt": "2026-03-05T12:34:56.789Z"
}
```

### POST /api/problems/check-answer

**Request**:
```json
{
  "problemId": "problem_1",
  "userAnswer": "x = 4",
  "problemText": "Solve for x: 2x + 5 = 13",
  "correctAnswer": "x = 4"
}
```

**Response**:
```json
{
  "problemId": "problem_1",
  "correct": true,
  "feedback": "Exactly! You correctly solved for x = 4.",
  "explanation": "When we subtract 5 from both sides and then divide by 2, we get x = 4.",
  "hint": null,
  "gradedAt": "2026-03-05T12:35:10.123Z"
}
```

Or if incorrect:
```json
{
  "problemId": "problem_1",
  "correct": false,
  "feedback": "Not quite. Let me check your work step-by-step.",
  "explanation": "Starting with 2x + 5 = 13, we first subtract 5 to get 2x = 8, then divide by 2.",
  "hint": "What's the result when you divide 8 by 2?",
  "gradedAt": "2026-03-05T12:35:10.123Z"
}
```

## Component Features

### Problem Display
- Shows one problem at a time
- Displays problem text, input field, and hint button
- Progress bar shows current problem/total count

### Answer Collection
- Text input field (works with most answer formats)
- Enter key submits answer
- Hint system (3 progressive hints per problem)

### Auto-Grading
- Claude evaluates correctness
- Provides specific feedback (not just "right" or "wrong")
- Shows explanation if incorrect
- Tracks score across all problems

### Navigation
- "Next Problem" button after answer is graded
- "Skip" button to move to next without answering
- "Try Again" button to re-attempt a problem
- "View Results" on final problem

### Results Summary
- Shows final score (X/Y correct)
- Percentage calculated
- Option to regenerate new problems

## Customization

### Change Prompts
Edit `prompts/problem-generator.txt` and `prompts/problem-grader.txt` to adjust:
- Problem difficulty guidance
- Hint style (Socratic vs. direct)
- Grading strictness
- Feedback tone

### Adjust Component Styling
Edit `ProblemSet.module.css`:
- Colors: `.difficultyBadge`, `.nextButton.complete`, `.feedbackSection.correct`
- Fonts: Modify font sizes in any class
- Layout: Adjust flex properties, spacing (gap, padding, margin)

### Change Model
In `backend/routes/problems.ts`, update the model name:
```typescript
model: "claude-3-5-sonnet-20241022", // Change this line
```

Available models:
- `claude-3-5-sonnet-20241022` — Best balance of speed/quality (recommended)
- `claude-3-opus-20250219` — Most capable but slower
- `claude-3-haiku-20250301` — Fastest, lighter tasks

## Error Handling

### Common Issues

**"Failed to generate problems"**
- Check ANTHROPIC_API_KEY is set
- Verify Claude API has remaining quota
- Ensure topic is descriptive (not empty)

**"Failed to parse Claude response"**
- Claude may have generated non-JSON
- Increase `max_tokens` in the API call
- Check prompt for unclear instructions

**"Answer grading failed"**
- Ensure `problemText` and `correctAnswer` are provided in request
- Check that `userAnswer` is not empty
- Verify problem was actually generated (not corrupted)

### Validation

Backend validates:
- Topic is non-empty string
- Count is 3-5
- Difficulty is "easy", "medium", or "hard"
- Answers are non-empty strings
- JSON responses are parseable

Frontend validates:
- Answer field is not empty before submission
- Problems array exists and has length > 0
- All problems have required fields

## Testing Scenarios

### Basic Generation
```typescript
const response = await fetch("/api/problems/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    topic: "Fractions",
    count: 3,
    difficultyLevel: "easy"
  })
});
```

### Edge Cases
1. **Non-numeric answers**: "Simplify 1/2 + 1/3" → "5/6" ✓
2. **Multiple equivalent forms**: "Solve x^2 = 4" → accepts "x = 2 or x = -2", "2 or -2", "±2"
3. **Units in answers**: "Distance" → "5 miles" or "5" both acceptable
4. **Decimal precision**: "0.75" = "3/4" ✓

## Performance Notes

- Problem generation: ~2-4 seconds (depends on count + topic complexity)
- Answer grading: ~1-2 seconds per answer
- Consider showing loading spinners for better UX
- Cache generated problems if re-using same topic (optional optimization)

## Next Steps (Future Enhancements)

1. **Difficulty adaptation**: Track accuracy, adjust difficulty of future problems
2. **Problem caching**: Store generated problems by topic to avoid re-generation
3. **Multiple choice support**: Auto-generate multiple choice options
4. **Timed mode**: Add timer, require answer within X seconds
5. **Session history**: Log all problems/answers for teacher review
6. **Voice input**: Accept spoken answers (requires Speech-to-Text API)
