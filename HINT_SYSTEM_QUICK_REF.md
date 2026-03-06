# Hint System — Quick Reference

## Files Created

| File | Purpose |
|---|---|
| `backend/routes/hints.ts` | Express API endpoint for generating hints via Claude |
| `src/components/HintSystem.tsx` | React component with 3-level hint UI |
| `src/hooks/useHints.ts` | Custom hook managing hint state + throttling |
| `src/components/HintSystem.css` | Styling (navy/teal/cream theme) |
| `prompts/socratic-hints.txt` | System prompt for Socratic questioning |
| `HINT_SYSTEM.md` | Full technical documentation |
| `INTEGRATION_HINT_SYSTEM.md` | Integration guide with examples |
| `HINT_SYSTEM_QUICK_REF.md` | This file |

## Copy-Paste Integration (30 seconds)

### 1. Backend server.ts
```typescript
import hintsRouter from "./routes/hints";
app.use("/api/hints", hintsRouter);
```

### 2. Problem Page Component
```typescript
import { HintSystem } from "../components/HintSystem";

// In your JSX:
<HintSystem
  problemText={problem.text}
  problemId={problem.id}
  groupId="group-a"
  studentName="Alex"
/>
```

## Three-Level Hint Flow

```
Student stuck on problem
  ↓
Types attempt in textarea
  ↓
Clicks "Need a hint?" → GET LEVEL 1
  (Open question: "What did you try first?")
  ↓
Clicks "Go deeper" → GET LEVEL 2 (unlocks after L1)
  (Named strategy: "Have you tried the distributive property?")
  ↓
Clicks "Full guidance" → GET LEVEL 3 (unlocks after L2)
  (Detailed explanation: step-by-step, stops before answer)
```

## API Behavior

### POST /api/hints/get
**Request:**
```json
{
  "problemText": "Solve 2(x+3)=14",
  "userAttempt": "I don't know where to start",
  "hintLevel": 1
}
```

**Response:**
```json
{
  "hint": "Walk me through what you've tried. What does the equation tell you?",
  "type": "question",
  "level": 1,
  "keyMessage": "Restart their thinking process"
}
```

**Error:** Returns 400/500 with `{ error: "message" }`

## Component Props Explained

| Prop | Required | Type | Example |
|---|---|---|---|
| `problemText` | Yes | string | "Solve: 2(x + 3) = 14" |
| `problemId` | Yes | string | "quad-001" (for logging) |
| `groupId` | Yes | string | "group-a" (for logging) |
| `studentName` | Yes | string | "Alex" (for logging) |
| `onHintRequested` | No | function | `(level) => console.log(level)` |

## Hook Usage

```typescript
const { getHint, hints, loading, error } = useHints();

// Call hint API
await getHint({
  problemText: "...",
  userAttempt: "...",
  hintLevel: 1
});

// Check cache
if (hints[1]) console.log(hints[1].hint);

// Check states
if (loading) console.log("Getting hint...");
if (error) console.log("Error:", error);
```

## Throttling

- **2-second minimum** between hint requests
- Prevents API spam
- Caches hints (don't re-request Level 1 if already retrieved)
- Clear error message if throttled: "Please wait 2s..."

## System Prompt Philosophy

The Socratic system prompt (in `prompts/socratic-hints.txt`) enforces:
- ❌ **Never** give the numerical answer
- ❌ **Never** do the student's thinking
- ✅ **Always** ask questions
- ✅ **Always** name strategies (e.g., "distributive property")
- ✅ **Always** reference prior work ("I see you tried...")

## CSS Classes (for customization)

```css
.hint-system                    /* Main container */
.hint-system__button            /* All buttons */
.hint-system__button--level-1   /* Level 1 button */
.hint-system__button--level-2   /* Level 2 button */
.hint-system__button--level-3   /* Level 3 button */
.hint-system__hint              /* Hint display box */
.hint-system__hint--level-1     /* Level 1 styling */
.hint-system__hint--level-2     /* Level 2 styling */
.hint-system__hint--level-3     /* Level 3 styling */
.hint-system__loading           /* Loading state */
.hint-system__error             /* Error message */
```

Colors used:
- **Level 1:** Teal (#2ec4b6) + Blue accent
- **Level 2:** Teal (#2ec4b6) + Gold accent
- **Level 3:** Teal (#2ec4b6) + Green accent

## Testing Hints (Manual)

1. **Open DevTools** (F12 or Cmd+Option+I)
2. **Go to your problem page**
3. **Type in "What have you tried?" textarea**
4. **Click "Need a hint?"**
5. **Check Network tab → POST to /api/hints/get**
   - Should see JSON response with hint text
6. **Click "Go deeper"**
   - Should see Level 2 hint (different wording)
7. **Click "Full guidance"**
   - Should see Level 3 hint (more detailed)

## Troubleshooting

| Problem | Check |
|---|---|
| Buttons disabled | Is textarea empty? Students must describe their attempt first. |
| "Getting your hint..." forever | Network → /api/hints/get. Is Claude API key set? `echo $ANTHROPIC_API_KEY` |
| "Failed to parse response" | Check CloudAPI is running. Check `prompts/socratic-hints.txt` exists. |
| "Please wait 2s..." error | This is correct throttling. Wait 2 seconds and try again. |
| Hint text is generic | This is Claude's interpretation. Check system prompt phrasing. |

## Next Steps

1. ✅ Integrate into problem page (see INTEGRATION_HINT_SYSTEM.md)
2. ✅ Test locally with backend running
3. ✅ Add hint tracking to session log
4. ✅ Deploy to Netlify (hints route needs `/api/hints` proxy)
5. ✅ Gather teacher feedback on hint quality
6. ⏳ Refine system prompt based on examples

## Questions?

See full docs:
- **Architecture & design:** `HINT_SYSTEM.md`
- **Integration examples:** `INTEGRATION_HINT_SYSTEM.md`
- **System prompt logic:** `prompts/socratic-hints.txt`
