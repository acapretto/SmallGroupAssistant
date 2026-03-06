# SmallGroupAssistant V0.1 — Setup & Usage Guide

## Overview
SmallGroupAssistant is an AI-powered tutor that generates step-by-step worked examples and practice problems for small learning groups. The system uses Claude 3.5 Sonnet to create customized mathematical instruction.

## Architecture

```
SmallGroupAssistant/
├── backend/
│   ├── server.ts           # Express.js server entry point
│   └── routes/
│       └── examples.ts     # /api/examples endpoint
├── src/
│   ├── components/
│   │   ├── ExampleGenerator.tsx    # React component
│   │   └── ExampleGenerator.css    # Component styles
│   ├── services/
│   │   └── apiClient.ts    # HTTP client wrapper
│   ├── App.tsx             # Root app component
│   ├── App.css             # App styles
│   ├── main.tsx            # React entry point
│   ├── index.css           # Global styles
│   └── types.ts            # TypeScript type definitions
├── prompts/
│   └── example-generator.txt  # Claude system prompt
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── .env.example
└── SETUP.md (this file)
```

## Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Anthropic API Key** (from https://console.anthropic.com)
- A terminal / command line

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/13-FoiledByMath/SmallGroupAssistant
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-...your-key-here...
   PORT=3000
   CLIENT_URL=http://localhost:5173
   ```

## Development Mode

### Start both frontend and backend:
```bash
npm run dev
```

This runs both servers concurrently:
- **Frontend** (React/Vite): http://localhost:5173
- **Backend** (Express): http://localhost:3000

### Or run them separately:

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

## Build for Production

```bash
npm run build
```

This creates:
- `dist/frontend/` — optimized React build
- `dist/backend/` — compiled Node.js backend

## File Structure Explained

### Backend (`backend/`)

**server.ts**
- Initializes Express app
- Loads CORS middleware
- Sets up health check endpoint at `/api/health`
- Registers routes (examples)
- Error handling

**routes/examples.ts**
- `POST /api/examples` endpoint
- Takes: `{ topic, question, difficultyLevel }`
- Returns: `{ problemStatement, setup, steps, commonMistake, keyTakeaway }`
- Loads system prompt from `prompts/example-generator.txt`
- Calls Claude 3.5 Sonnet API
- Parses and validates JSON response
- Comprehensive error handling

### Frontend (`src/`)

**components/ExampleGenerator.tsx**
- Main React component for the entire workflow
- Form: topic, question, difficulty selector
- Display: formatted example with steps
- UX: loading state, error boundaries, copy-to-clipboard
- Props: `topic?`, `question?`, `onExampleGenerated?`

**components/ExampleGenerator.css**
- Teacher-friendly design
- Clean typography, math-focused colors
- Responsive layout (mobile-friendly)
- Copy button feedback (green "✓ Copied")
- Step highlighting and callout styles

**services/apiClient.ts**
- `generateExample(request)` — calls `/api/examples`
- `checkHealth()` — verifies backend is running
- Error handling and parsing

**types.ts**
- `DifficultyLevel` = 'basic' | 'intermediate' | 'advanced'
- `ExampleGeneratorRequest` — input schema
- `ExampleGeneratorResponse` — output schema (matches Claude's JSON)
- `ApiResponse<T>` — generic API wrapper
- Type-safe throughout

**App.tsx**
- Root component
- Status badge (checking/connected/disconnected)
- Warning if API is offline
- Renders `<ExampleGenerator />`

### Prompts (`prompts/`)

**example-generator.txt**
- System prompt for Claude
- Instructs Claude to:
  - Generate step-by-step examples
  - Explain the "why" not just the "how"
  - Tailor to difficulty level (Basic/Intermediate/Advanced)
  - Include real-world connections
  - Identify common mistakes
  - Output strict JSON format
- Loaded at runtime by the backend

## API Reference

### POST `/api/examples`

**Request:**
```json
{
  "topic": "Quadratic Formula",
  "question": "How do I know when to use the quadratic formula?",
  "difficultyLevel": "intermediate"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "problemStatement": "Solve x² - 5x + 6 = 0 using the quadratic formula.",
    "setup": "This is a quadratic equation in standard form. We'll use the quadratic formula...",
    "steps": [
      {
        "number": 1,
        "action": "Identify a, b, c",
        "work": "a = 1, b = -5, c = 6",
        "explanation": "These are the coefficients in the standard form ax² + bx + c = 0."
      },
      ...
    ],
    "realWorldConnection": "Quadratic equations model projectile motion...",
    "commonMistake": "Students often forget the ± symbol, thinking there's only one solution.",
    "keyTakeaway": "The quadratic formula always works for any quadratic equation."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "message": "Missing required fields: topic and question",
    "code": "INVALID_REQUEST"
  }
}
```

**Error Codes:**
- `INVALID_REQUEST` — missing/malformed input
- `API_ERROR` — Claude API failure
- `PARSING_ERROR` — Claude response wasn't valid JSON
- `RATE_LIMIT` — too many requests

## Usage Example

1. **Start the servers:**
   ```bash
   npm run dev
   ```

2. **Open the app:**
   - http://localhost:5173 in your browser

3. **Generate an example:**
   - Topic: "Systems of Equations"
   - Question: "How do I know whether to use substitution or elimination?"
   - Difficulty: Intermediate
   - Click "Show Me An Example"

4. **Review the output:**
   - Problem statement
   - Step-by-step solution
   - Real-world connection
   - Common mistake callout
   - Key takeaway
   - Copy individual steps to clipboard

## Prompt Engineering

The system prompt in `prompts/example-generator.txt` is critical. Key features:

- **Structure:** Tells Claude exactly what output format to generate (JSON with specific fields)
- **Difficulty:** Adapts problem complexity (Basic: 2-3 steps; Advanced: complex relationships)
- **Pedagogy:** Emphasizes explanation (why) over mechanics (how)
- **Real-world:** Connects abstract concepts to student interests
- **Common Mistakes:** Highlights errors students actually make

### Customizing the Prompt

To improve example quality:
1. Edit `prompts/example-generator.txt`
2. Restart the backend (`npm run dev:backend`)
3. Test with a new example

Example improvements:
- Add specific teaching frameworks (e.g., "Use the Polya problem-solving steps")
- Include example topics (e.g., "If topic is 'Slope', emphasize rate of change")
- Refine difficulty guidelines

## TypeScript Configuration

**tsconfig.json** strict mode enabled:
- `strict: true` — all type checking
- `noUnusedLocals: true` — no unused variables
- `noUnusedParameters: true` — no unused params
- `noFallthroughCasesInSwitch: true` — enforce switch exhaustiveness

**Backend & Frontend share types:**
- Both read `src/types.ts`
- TypeScript catch errors at build time, not runtime

## Styling

**Design System:**
- **Primary Color:** #0066cc (blue)
- **Font:** System UI (Helvetica Neue, Segoe UI, etc.)
- **Math Font:** Menlo/Monaco/Courier for code blocks
- **Spacing:** 8px base grid
- **Responsive:** Mobile-first, breakpoint at 768px

**Component Structure:**
- BEM naming convention (`.example-generator__field`, etc.)
- CSS variables for colors/fonts
- Transitions for feedback (200ms ease)
- Loading spinner with keyframe animation

## Error Handling

**Frontend:**
- Validates input (topic, question required)
- Shows loading spinner while fetching
- Displays error messages in red callouts
- Gracefully handles API offline (status badge)

**Backend:**
- Validates request schema
- Catches and logs Claude API errors
- Returns structured error responses
- Specific error codes for client handling

**Example:**
```typescript
if (!topic.trim()) {
  setError('Please enter a topic');
  return;
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "API Offline" badge | Check backend is running: `npm run dev:backend` |
| API 401 error | Verify ANTHROPIC_API_KEY in .env |
| API 429 (rate limit) | Wait a moment, then try again. Rate limits reset hourly. |
| "Failed to parse example" | Claude returned malformed JSON. Try different wording in question. |
| TypeScript errors | Run `npm run type-check` to see all issues. |
| CSS looks wrong | Hard-refresh browser (Cmd+Shift+R on Mac). |

## Testing the System

**Quick Test:**
```bash
# Start servers
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/examples \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Fractions",
    "question": "How do I add fractions with different denominators?",
    "difficultyLevel": "basic"
  }'
```

**Expected Response:** JSON with problemStatement, steps array, etc.

## Next Steps (V0.2)

- [ ] Session persistence (save/load groups)
- [ ] Practice problem generator (3–5 tailored problems)
- [ ] Hint system (Socratic questions)
- [ ] Teacher dashboard (multi-group view)
- [ ] Student response tracking
- [ ] Canvas LMS integration

## Deployment (Netlify)

**Frontend:**
1. Push to GitHub
2. Connect repo to Netlify
3. Build command: `npm run build:frontend`
4. Publish directory: `dist/frontend`
5. Add env var: `VITE_API_URL=https://api.example.com`

**Backend:**
1. Deploy to Netlify Functions or Vercel
2. Set env vars (ANTHROPIC_API_KEY, etc.)
3. Update CLIENT_URL in backend .env

## Support

For issues or questions:
- Check CLAUDE.md in the project root
- Review error messages in browser console (F12)
- Check backend logs in terminal
