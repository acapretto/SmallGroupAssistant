# Quick Start — Practice Problem Generator

## 5-Minute Integration

### Backend
1. **Copy files to your project**:
   ```bash
   cp backend/routes/problems.ts YOUR_PROJECT/backend/routes/
   cp backend/lib/ai-client.ts YOUR_PROJECT/backend/lib/
   cp prompts/*.txt YOUR_PROJECT/prompts/
   ```

2. **Install dependencies**:
   ```bash
   npm install @anthropic-ai/sdk
   ```

3. **Register router in your Express app** (e.g., `server.ts`):
   ```typescript
   import problemsRouter from "./routes/problems";
   app.use("/api/problems", problemsRouter);
   ```

4. **Set environment variable**:
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-..."
   ```

5. **Start backend**:
   ```bash
   npm run dev
   ```

### Frontend
1. **Copy component**:
   ```bash
   cp frontend/src/components/ProblemSet.* YOUR_PROJECT/src/components/
   cp frontend/src/types/problem.ts YOUR_PROJECT/src/types/
   ```

2. **Use in your app**:
   ```tsx
   import ProblemSet from "./components/ProblemSet";

   export default function App() {
     return (
       <ProblemSet
         topic="Quadratic Equations"
         count={4}
         difficultyLevel="medium"
       />
     );
   }
   ```

3. **Start frontend**:
   ```bash
   npm run dev
   ```

---

## Test It (30 seconds)

```bash
# In a new terminal, generate problems:
curl -X POST http://localhost:3000/api/problems/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Fractions", "count": 3, "difficultyLevel": "easy"}'

# Then grade an answer:
curl -X POST http://localhost:3000/api/problems/check-answer \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "problem_1",
    "userAnswer": "1/2",
    "problemText": "Simplify 2/4",
    "correctAnswer": "1/2"
  }'
```

---

## Component Props

| Prop | Type | Default | Example |
|---|---|---|---|
| `topic` | string | "Algebra" | "Quadratic Equations" |
| `count` | number | 3 | 4 |
| `difficultyLevel` | string | "medium" | "hard" |
| `onComplete` | function | undefined | `(correct, total) => console.log(correct/total)` |

---

## What Happens

1. Component loads → calls `POST /api/problems/generate`
2. Backend → Claude generates 3-5 problems
3. Student answers → `POST /api/problems/check-answer` per answer
4. Backend → Claude grades each answer
5. Shows feedback + score

---

## Troubleshooting

| Error | Fix |
|---|---|
| "Failed to generate problems" | Check ANTHROPIC_API_KEY is set |
| Component won't load | Backend not running? Check http://localhost:3000/api/problems/health |
| Answers always wrong | Grading prompt too strict; edit `prompts/problem-grader.txt` |

---

## File Sizes
- Backend route: 288 lines
- React component: 419 lines
- TypeScript types: 45 lines
- Prompts: 87 lines total
- **Total code: ~840 lines**

---

## Next Steps
1. Run the 5-minute integration above
2. Test with curl commands
3. Check IMPLEMENTATION_GUIDE.md for full details
4. Check TESTING_EXAMPLES.md for more test scenarios

---

## Support
See IMPLEMENTATION_GUIDE.md for detailed documentation.
