# Practice Problem Generator — V0.1 Summary

## Deliverables

### Files Created (8 total)

#### Backend
1. **`backend/routes/problems.ts`** (325 lines)
   - Express router with 3 endpoints
   - POST /api/problems/generate — Creates 3-5 math problems via Claude
   - POST /api/problems/check-answer — Auto-grades answers via Claude
   - GET /api/problems/health — Health check
   - Full error handling and input validation

2. **`backend/lib/ai-client.ts`** (75 lines)
   - Shared Claude API client
   - Reusable `chatComplete()` and `chatWithHistory()` functions
   - Configurable model, tokens, temperature

#### Frontend
3. **`frontend/src/components/ProblemSet.tsx`** (450 lines)
   - Full React component (TypeScript)
   - Problem generation with loading state
   - Answer input with auto-submit (Enter key)
   - Hint system (3 progressive hints per problem)
   - Auto-grading with feedback display
   - Score tracking and results summary
   - Responsive design, keyboard accessible

4. **`frontend/src/components/ProblemSet.module.css`** (380 lines)
   - Professional styling
   - Dark/light mode consideration
   - Mobile responsive (600px breakpoint)
   - Loading spinners, error states, feedback colors
   - Progress bar and score display

5. **`frontend/src/types/problem.ts`** (40 lines)
   - TypeScript interfaces for type safety
   - Problem, Request/Response types
   - Component state interface

#### Prompts
6. **`prompts/problem-generator.txt`**
   - Detailed instruction for Claude to create problems
   - Difficulty guidance (easy = 1-2 steps, medium = 3-4, hard = 5+)
   - JSON output format with hints
   - ~400 tokens

7. **`prompts/problem-grader.txt`**
   - Detailed instruction for Claude to evaluate answers
   - Accounts for equivalent forms (fractions, decimals, notation)
   - Feedback tone guidance (encouraging, growth-oriented)
   - ~350 tokens

#### Documentation
8. **`IMPLEMENTATION_GUIDE.md`**
   - Step-by-step integration instructions
   - API endpoint documentation with examples
   - Component usage and props
   - Customization guide
   - Error handling reference

9. **`TESTING_EXAMPLES.md`**
   - 12 test scenarios with curl commands
   - Browser DevTools examples
   - Topics known to work well
   - Performance baselines
   - Debugging guide

10. **`PROBLEM_GENERATOR_SUMMARY.md`** (this file)
    - Overview of deliverables
    - How everything works together
    - Integration checklist

---

## How It Works

### User Flow (From Student's Perspective)

```
1. Student opens ProblemSet component
   ↓
2. Component loads and calls POST /api/problems/generate
   ↓
3. Backend:
   - Validates input (topic, count, difficulty)
   - Loads problem-generator.txt prompt
   - Substitutes TOPIC, DIFFICULTY, COUNT placeholders
   - Calls Claude to generate problems
   - Parses JSON response
   - Returns array of 3-5 Problem objects
   ↓
4. Frontend:
   - Displays Problem #1 with text, input field, hints
   - Shows progress bar (1/5)
   - Shows score (0/5)
   ↓
5. Student types answer, presses Enter or clicks "Check Answer"
   ↓
6. Backend:
   - Loads problem-grader.txt prompt
   - Substitutes PROBLEM_TEXT, CORRECT_ANSWER, USER_ANSWER
   - Calls Claude to evaluate correctness
   - Returns { correct: boolean, feedback: string, ... }
   ↓
7. Frontend:
   - Shows feedback box (green if correct, red if incorrect)
   - Displays explanation
   - Shows hint if incorrect
   - Enables "Next Problem" button
   ↓
8. Repeat steps 5-7 for remaining problems
   ↓
9. After final problem:
   - Show results summary (3/5 = 60%)
   - Option to regenerate new problems
```

### Data Flow Diagram

```
Frontend (React)
  ├─ ProblemSet component
  │  ├─ State: problems[], currentIndex, userAnswers, scores
  │  ├─ Load: POST /api/problems/generate
  │  └─ Grade: POST /api/problems/check-answer (per answer)
  │
Backend (Express)
  ├─ /api/problems/generate
  │  ├─ Validate: { topic, count: 3-5, difficulty: easy|medium|hard }
  │  ├─ Load: prompts/problem-generator.txt
  │  ├─ Call: Claude API
  │  └─ Return: { problems: [{id, problemText, correctAnswer, hints}] }
  │
  ├─ /api/problems/check-answer
  │  ├─ Validate: { problemId, userAnswer, problemText, correctAnswer }
  │  ├─ Load: prompts/problem-grader.txt
  │  ├─ Call: Claude API
  │  └─ Return: { correct, feedback, explanation?, hint? }
  │
Claude API
  ├─ Problem Generation
  │  ├─ Input: 1 prompt + system message
  │  ├─ Model: claude-3-5-sonnet-20241022
  │  └─ Output: JSON array of problems
  │
  └─ Answer Grading
     ├─ Input: 1 prompt + system message
     ├─ Model: claude-3-5-sonnet-20241022
     └─ Output: JSON grading result
```

---

## Key Design Decisions

### 1. **One Problem at a Time (Not All-at-Once)**
- **Why**: Reduces cognitive overload, better pacing for group learning
- **Implementation**: currentIndex state, Next/Skip buttons
- **Alternative considered**: Show all problems on one page (rejected: too overwhelming)

### 2. **Progressive Hints (3 Per Problem)**
- **Why**: Socratic approach, builds problem-solving thinking
- **Implementation**: hints[] array in Problem, hintIndex state
- **Hint levels**: 1=Concept, 2=Strategy, 3=Final push

### 3. **Claude-Powered Grading (Not Regex/Rules)**
- **Why**: Handles equivalent answers, explains mistakes, is forgiving
- **Implementation**: POST /check-answer calls Claude with full problem context
- **Fallback**: None (Claude required, not best-effort)

### 4. **Flexible Answer Formats**
- **Supported**: Numbers, fractions, decimals, equations, words, units
- **Not supported**: Long essays (not designed for)
- **Implementation**: Prompt tells Claude to be flexible on notation

### 5. **Separate Prompts (Not One Mega-Prompt)**
- **Why**: Reusable, easier to tweak, clearer concerns
- **Implementation**: Two .txt files loaded at request time
- **Benefit**: Can update prompts without redeploying backend code

### 6. **No Caching**
- **Why**: Problems are supposed to be different each time (good for practice sets)
- **Trade-off**: Slightly slower (requires 2 API calls per session)
- **Future optimization**: Optional caching if same topic used in same session

---

## Integration Checklist

- [ ] Install `@anthropic-ai/sdk` and `express` (backend)
- [ ] Set `ANTHROPIC_API_KEY` environment variable
- [ ] Copy `backend/routes/problems.ts` into your Express app
- [ ] Import and register router: `app.use("/api/problems", problemsRouter)`
- [ ] Copy `frontend/src/components/` and `frontend/src/types/` into React project
- [ ] Import `ProblemSet` component in parent page/component
- [ ] Render with props: `<ProblemSet topic="..." count={3} difficultyLevel="medium" />`
- [ ] Test via browser or curl commands (see TESTING_EXAMPLES.md)
- [ ] Verify both frontend and backend console logs for errors

---

## Performance Characteristics

### Latency
- Problem generation: 2-4 seconds (depends on difficulty, topic complexity)
- Answer grading: 1-2 seconds
- Frontend renders: <100ms

### API Calls
- Per session: 1 (generate) + N (grade each answer)
- Example: 3-problem session = 4 API calls total
- Cost: ~$0.01-0.02 per session (using sonnet model)

### Token Usage
- Generation prompt: ~400 tokens (template + substitutions)
- Grading prompt: ~350 tokens (template + substitutions)
- Example: 3-problem session ≈ 2,700 input tokens, 1,500 output tokens

---

## Extensibility

### Easy Customizations
1. **Prompt quality**: Edit `problem-generator.txt` and `problem-grader.txt`
2. **Component styling**: Modify `ProblemSet.module.css`
3. **Model selection**: Change `model` in `backend/routes/problems.ts`
4. **Difficulty mapping**: Adjust language in problem-generator prompt

### Medium Customizations
1. **Multi-step conversations**: Use `chatWithHistory()` from ai-client.ts
2. **Problem caching**: Wrap generation with simple Map cache by topic
3. **Teacher interface**: Add dropdown for topic selection (frontend only)
4. **Session logging**: Add SQL queries to save problems/answers to database

### Hard Customizations
1. **Adaptive difficulty**: Track accuracy, increment difficulty in next session
2. **Multiple choice generation**: Add separate endpoint for MCQ with distractor generation
3. **Voice input**: Integrate Speech-to-Text API, modify check-answer to accept audio
4. **Real-time typing hints**: Stream hints as student types (requires WebSocket)

---

## Testing Coverage

### Unit Tests (Not Included)
- Problem validation (empty topic, invalid count, etc.)
- JSON parsing (malformed Claude response)
- Answer grading edge cases (empty answers, whitespace)

### Integration Tests (See TESTING_EXAMPLES.md)
- Happy path: Generate → Answer all → View results
- Error path: Invalid input → Error message
- Edge case: Equivalent answer forms (3/4 vs 0.75)

### Manual Testing (Recommended)
1. Test 3-5 different math topics
2. Test all three difficulty levels
3. Test correct, incorrect, and partially-correct answers
4. Test Skip button on last problem
5. Test Hint button exhaustion
6. Test on mobile (resize browser to 600px width)

---

## Future Enhancements (Post-V0.1)

### Short Term (V0.2)
- [ ] Teacher dashboard: see all group sessions, problems, scores
- [ ] Save session data to Supabase
- [ ] Session replay: teacher can review what group saw
- [ ] Problem bank: curated library of problems (don't regenerate each time)

### Medium Term (V0.3)
- [ ] Adaptive difficulty: easy → medium → hard based on accuracy
- [ ] Explanation video links (if problem matches a topic, show relevant video)
- [ ] Timed mode: countdown timer for competitive practice
- [ ] Leaderboard: group scores over multiple sessions

### Long Term (V1.0)
- [ ] Voice input: speak answers (Whisper API)
- [ ] Voice feedback: Claude reads feedback aloud
- [ ] Image input: solve problems with diagram or handwriting
- [ ] Canvas integration: show in student grade book

---

## Troubleshooting Quick Reference

| Issue | Cause | Fix |
|---|---|---|
| "Failed to generate problems" | No API key | Set ANTHROPIC_API_KEY |
| "Failed to parse Claude response" | Non-JSON from Claude | Increase max_tokens, improve prompt |
| Component won't load | Backend not running | Start backend, check PORT |
| Answers always marked wrong | Grading prompt too strict | Soften grading prompt guidance |
| Slow problem generation | Model is slow | Use haiku instead of sonnet (faster) |
| Repeated problems | Cache enabled | Disable caching (current design has none) |

---

## File Organization

```
SmallGroupAssistant/
├── backend/
│   ├── routes/
│   │   └── problems.ts (← Main backend implementation)
│   └── lib/
│       └── ai-client.ts (← Shared Claude client)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ProblemSet.tsx (← Main React component)
│       │   └── ProblemSet.module.css (← Styling)
│       └── types/
│           └── problem.ts (← TypeScript types)
├── prompts/
│   ├── problem-generator.txt (← Claude prompt)
│   └── problem-grader.txt (← Claude prompt)
├── IMPLEMENTATION_GUIDE.md (← Integration steps)
├── TESTING_EXAMPLES.md (← Test scenarios)
└── PROBLEM_GENERATOR_SUMMARY.md (← This file)
```

---

## Support & Next Steps

1. **Integrate backend**: Copy `backend/` files, register router
2. **Integrate frontend**: Copy `frontend/src/` files, import component
3. **Set environment**: Export ANTHROPIC_API_KEY
4. **Test**: Run curl commands from TESTING_EXAMPLES.md
5. **Debug**: Check browser console and backend logs for errors
6. **Customize**: Edit prompts and styling as needed
7. **Deploy**: Push to Netlify (frontend) + your Node server (backend)

Contact: andrew@capretto.net with questions.
