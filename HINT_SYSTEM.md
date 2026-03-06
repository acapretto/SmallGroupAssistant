# Hint System — Small Group Learning Assistant

## Overview
The hint system provides progressive, Socratic guidance when students get stuck on problems. Rather than giving answers, it asks questions that prompt thinking and metacognition.

## Architecture

### 3-Level Hint Progression

| Level | Purpose | Style | Example |
|---|---|---|---|
| **1** | Open question | "What did you try first?" | Gentle re-engagement without math content |
| **2** | Guided hint | "Name a strategy/property and ask how it applies" | "Have you considered the distributive property? How might that help here?" |
| **3** | Detailed explanation | "Work through most of it, stop before the answer" | Step-by-step walkthrough ending with "Now you try the final step." |

### Backend Route

**File:** `backend/routes/hints.ts`

**Endpoint:** `POST /api/hints/get`

**Request:**
```json
{
  "problemText": "Solve: 2(x + 3) = 14",
  "userAttempt": "I'm not sure where to start",
  "hintLevel": 1
}
```

**Response:**
```json
{
  "hint": "Walk me through what you've tried so far. What do you notice about the equation?",
  "type": "question",
  "level": 1,
  "keyMessage": "Help them restart their thinking process"
}
```

**Features:**
- Claude 3.5 Sonnet generates hints using Socratic system prompt
- Loads system prompt from `prompts/socratic-hints.txt`
- Validates input and response format
- Returns structured JSON for frontend parsing
- Optional `/api/hints/track` endpoint logs hint usage for teacher analytics

### Frontend Component

**File:** `src/components/HintSystem.tsx`

**Props:**
```typescript
interface HintSystemProps {
  problemText: string;      // The original problem
  problemId: string;        // For tracking/logging
  groupId: string;          // For tracking/logging
  studentName: string;      // For tracking/logging
  onHintRequested?: (level: number) => void;  // Callback
}
```

**Features:**
- Textarea for students to describe their attempt
- Three buttons (Level 1 → 2 → 3) with progressive unlock
  - Level 1 available immediately (if attempt provided)
  - Level 2 unlocks after Level 1 retrieved
  - Level 3 unlocks after Level 2 retrieved
- Hints display in labeled callout boxes with emojis
- Throttling prevents spam (2-second minimum between requests)
- Hint caching during session
- Encouragement messages

### Custom Hook

**File:** `src/hooks/useHints.ts`

**Interface:**
```typescript
const { getHint, hints, loading, error } = useHints();

// getHint() accepts HintRequest
// hints[1], hints[2], hints[3] contain HintData or undefined
// loading: boolean (true during API call)
// error: string | null
```

**Features:**
- Manages hint state across all 3 levels
- Throttles requests (2 seconds minimum between any request)
- Caches hints to avoid re-requesting the same level
- Tracks loading and error states
- Provides user-friendly error messages

### Prompt Engineering

**File:** `prompts/socratic-hints.txt`

System prompt that instructs Claude to:
1. Ask questions, never give answers
2. Reference what student has done
3. Name strategies/properties (formal math language)
4. Avoid final answers even at Level 3
5. Use "I notice...", "Have you considered...", "What if...?" phrasing
6. Keep hints concise (1–3 sentences max)

## Usage Example

```typescript
import { HintSystem } from "./components/HintSystem";

export const ProblemPage = () => {
  return (
    <HintSystem
      problemText="Solve: 2(x + 3) = 14"
      problemId="quad-001"
      groupId="group-a"
      studentName="Alex"
      onHintRequested={(level) => {
        console.log(`Student requested level ${level} hint`);
      }}
    />
  );
};
```

## Data Flow

1. **Student describes attempt** → Textarea captures their thinking
2. **Student clicks "Need a hint?"** → Component calls `getHint()`
3. **Hook throttles & caches** → Prevents spam, avoids duplicate requests
4. **Backend calls Claude** → Generates hint using Socratic system prompt
5. **Response validated** → Ensures JSON structure is correct
6. **Hint displays** → Component shows callout with styling
7. **Usage tracked** → Optional analytics endpoint logs for teacher dashboard

## Throttling & Spam Prevention

- **2-second minimum** between requests for any hint
- **Caching** within session prevents re-requesting same level
- **Button states** prevent clicking before hint is ready
- **Error messages** guide students if they try to request too fast

## Teacher Analytics (Optional)

The `/api/hints/track` endpoint logs:
- `groupId`, `studentName`, `problemId`
- `hintLevel` requested
- `timestamp`

This data can be used for:
- Which students request hints most
- What problems require most scaffolding
- Which hint levels are most effective
- Time spent before requesting help

## Guardrails in System Prompt

The Socratic prompt includes explicit rules:
- Never provide numerical answers or final results
- Never do the thinking for the student
- Ask clarifying questions if assumptions fail
- Redirect students who ask for direct answers
- Keep hints concise and question-focused

## Styling & UX

**Visual Hierarchy:**
- Blue (Level 1): Gentle restart questions
- Gold (Level 2): Strategy guidance
- Green (Level 3): Detailed explanation

**Accessibility:**
- Large tap targets (buttons: 12px font, 12px padding)
- Clear button labels and descriptions
- Disabled state styling (grayed out, cursor: not-allowed)
- Error messages persist briefly (3 seconds) then disappear

**Responsive Design:**
- Desktop (3-column button grid)
- Mobile (1-column stacked buttons)
- Textarea resizable on desktop, fixed height on mobile

## Integration Points

### In Tutor Chat
Embed HintSystem in the main tutor interface when student is working on a practice problem.

### In Problem Generator
Each generated problem should have a HintSystem instance with its own `problemId`.

### In Session Log
Track hint requests per student per problem for teacher review.

## Future Enhancements

1. **Multi-hint variants**: Generate multiple hints at same level and let student choose
2. **Hint feedback**: Student rates hint helpfulness (👍 👎) → improves prompts
3. **Adaptive difficulty**: Adjust Level 3 verbosity based on student level
4. **Voice hints**: Anthropic TTS reads hints aloud
5. **Hint history**: Show "You've asked 3 hints for this problem" → encourage independence
6. **Teacher override**: Teacher can inject custom hints for common stuck points

## Testing the Hint System

### Manual Test (Browser)
1. Describe an attempt in textarea
2. Click "Need a hint?"
3. Wait for Level 1 to appear
4. Click "Go deeper"
5. Wait for Level 2 to appear
6. Click "Full guidance"
7. Verify Level 3 appears with detailed hint

### Throttle Test
1. Click "Need a hint?" for Level 1
2. Immediately click "Go deeper" for Level 2 → Should show "Please wait 2s..."
3. Wait 2 seconds
4. Try again → Should work

### Edge Cases
- Empty attempt textarea → "Please describe what you've tried first"
- Invalid hint response → Shows error message
- Network error → Shows error, user can retry
- Same problem, different attempt → New hint request

## Files Modified/Created

- ✅ `backend/routes/hints.ts` — API endpoint
- ✅ `src/components/HintSystem.tsx` — React component
- ✅ `src/hooks/useHints.ts` — Custom hook
- ✅ `src/components/HintSystem.css` — Styling
- ✅ `prompts/socratic-hints.txt` — System prompt
- ✅ `HINT_SYSTEM.md` — This documentation
