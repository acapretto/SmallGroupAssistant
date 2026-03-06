# Development Guide — SmallGroupAssistant

## Quick Start

```bash
# Install dependencies
npm install

# Copy env template and add your API key
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=sk-ant-...

# Start both frontend + backend
npm run dev

# Open browser
open http://localhost:5173
```

## Project Structure Deep Dive

### Backend Folder Structure
```
backend/
├── server.ts           # Express app setup
├── routes/
│   └── examples.ts     # POST /api/examples handler
└── types.ts            # Shared TypeScript types
```

**Key Files:**

1. **server.ts**
   - Initializes Express
   - Registers routes
   - Sets up CORS and middleware
   - Listens on PORT (default 3000)

2. **routes/examples.ts**
   - `POST /api/examples` handler
   - Validates input
   - Loads system prompt from `prompts/example-generator.txt`
   - Calls Claude 3.5 Sonnet
   - Parses JSON response
   - Returns `ApiResponse<ExampleGeneratorResponse>`

### Frontend Folder Structure
```
src/
├── components/
│   ├── ExampleGenerator.tsx
│   └── ExampleGenerator.css
├── services/
│   └── apiClient.ts    # HTTP wrapper
├── App.tsx             # Root component
├── App.css
├── main.tsx
├── index.css
├── types.ts
└── (index.html in root)
```

**Key Files:**

1. **ExampleGenerator.tsx**
   - Form for topic/question/difficulty
   - Calls `generateExample()` from apiClient
   - Displays loading/error/result states
   - Copy-to-clipboard for each step
   - Props: `topic?`, `question?`, `onExampleGenerated?`

2. **apiClient.ts**
   - `generateExample(request)` → calls POST /api/examples
   - `checkHealth()` → verifies backend
   - Error handling & type guards

3. **types.ts**
   - TypeScript definitions shared by frontend & backend
   - `ExampleGeneratorRequest`, `ExampleGeneratorResponse`, etc.

### Configuration Files

- **package.json** — dependencies, build scripts
- **tsconfig.json** — TypeScript compiler (strict mode)
- **vite.config.ts** — Vite dev server & build
- **.env.example** — environment variable template
- **.gitignore** — what to exclude from git
- **prompts/example-generator.txt** — Claude system prompt

## Development Workflows

### Adding a New Feature

**Example: "Generate Practice Problems"**

1. **Update types** (`src/types.ts`):
   ```typescript
   export interface PracticeProblemsRequest {
     topic: string;
     level: DifficultyLevel;
     count: number;  // 3-5
   }

   export interface ProblemSet {
     problems: Problem[];
     answerKey: string;
   }
   ```

2. **Create new route** (`backend/routes/problems.ts`):
   ```typescript
   router.post('/', async (req, res) => {
     // Validate, call Claude, return response
   });
   ```

3. **Register route** in `backend/server.ts`:
   ```typescript
   import problemsRouter from './routes/problems';
   app.use('/api/problems', problemsRouter);
   ```

4. **Create React component** (`src/components/ProblemGenerator.tsx`):
   ```typescript
   export const ProblemGenerator: React.FC = () => {
     // Form → apiClient.generateProblems() → display
   };
   ```

5. **Add API client function** (`src/services/apiClient.ts`):
   ```typescript
   export async function generateProblems(req: PracticeProblemsRequest) {
     return fetchApi<ProblemSet>('/problems', {
       method: 'POST',
       body: JSON.stringify(req),
     });
   }
   ```

6. **Update App.tsx** to use new component.

### Debugging

**Backend Logs:**
- Express logs to stdout when `npm run dev:backend` runs
- Check for "Unhandled error:" messages
- Add `console.log()` or use VS Code debugger

**Frontend Logs:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Network tab shows API requests/responses

**API Testing (curl):**
```bash
curl -X POST http://localhost:3000/api/examples \
  -H "Content-Type: application/json" \
  -d '{
    "topic":"Polynomials",
    "question":"How do I multiply binomials?",
    "difficultyLevel":"intermediate"
  }'
```

### TypeScript & Type Safety

**Enabling strict mode in tsconfig.json:**
- `"strict": true` forces all type annotations
- `"noUnusedLocals": true` flags unused variables
- Run `npm run type-check` before committing

**Example — catch errors at build time:**
```typescript
// ❌ This won't compile:
function generateExample(req: ExampleGeneratorRequest): void {
  // TypeScript error: missing topic field
  const x = { question: 'test' };
}

// ✅ This works:
function generateExample(req: ExampleGeneratorRequest): void {
  const x: ExampleGeneratorRequest = {
    topic: 'Algebra',
    question: 'test',
    difficultyLevel: 'basic',
  };
}
```

### Styling Guidelines

**File Organization:**
- Component styles live next to TSX (`.css` file)
- Global styles in `App.css` and `index.css`
- No CSS-in-JS libraries (pure CSS)

**BEM Naming:**
```css
/* Block */
.example-generator {}

/* Element (child of block) */
.example-generator__form {}
.example-generator__field {}

/* Modifier (variation) */
.example-generator__button--loading {}
.example-generator__error--severe {}
```

**Responsive Design:**
```css
/* Default: mobile-first */
.example-generator {
  padding: 1rem;
}

/* Tablet+: 768px breakpoint */
@media (min-width: 768px) {
  .example-generator {
    padding: 2rem;
  }
}
```

### Environment Variables

**Frontend (.env used by Vite):**
- `VITE_API_URL` — backend API base URL

**Backend (.env used by Node.js):**
- `ANTHROPIC_API_KEY` — Anthropic API key (required)
- `PORT` — server port (default 3000)
- `CLIENT_URL` — frontend URL for CORS (default http://localhost:5173)

**Never commit .env file.** Use `.env.example` as a template.

## Build & Deployment

### Local Build
```bash
npm run build
# Creates dist/frontend and dist/backend
```

### Netlify Deploy (Frontend Only)
1. Connect GitHub repo to Netlify
2. Build command: `npm run build:frontend`
3. Publish directory: `dist/frontend`
4. Add env var in Netlify UI: `VITE_API_URL=https://your-api.com`

### Vercel Deploy (Backend)
1. Connect GitHub repo
2. Add env var: `ANTHROPIC_API_KEY`
3. Deploy `backend/` folder
4. Update frontend's `VITE_API_URL` to point to Vercel URL

## Testing Strategy (V0.1)

**Manual Testing Checklist:**
- [ ] Backend starts without errors: `npm run dev:backend`
- [ ] Frontend loads at http://localhost:5173
- [ ] API health check returns 200
- [ ] Generate example with Basic difficulty
- [ ] Generate example with Intermediate difficulty
- [ ] Generate example with Advanced difficulty
- [ ] Copy button works (text appears in clipboard)
- [ ] Error messages display if topic/question empty
- [ ] Error message displays if API is down
- [ ] Styling looks good on mobile (375px width)

**Future (V0.2+):**
- Unit tests for apiClient
- E2E tests with Playwright
- Prompt quality A/B testing

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `npm install` fails | Try `npm cache clean --force && npm install` |
| Port 3000 already in use | Change PORT in .env or kill process: `lsof -i :3000` |
| API 401 (Unauthorized) | Check ANTHROPIC_API_KEY is correct in .env |
| "Cannot find module 'express'" | Run `npm install` |
| TypeScript compile errors | Run `npm run type-check` to see all issues |
| Vite hot reload not working | Hard-refresh (Cmd+Shift+R on Mac) |
| Styles not applying | Check class names match between TSX and CSS |

## Code Standards

**Naming Conventions:**
- Components: PascalCase (`ExampleGenerator.tsx`)
- Functions: camelCase (`generateExample()`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- CSS classes: kebab-case with BEM (`.example-generator__button`)

**File Organization:**
- Related files in same folder
- Types defined in `types.ts` (shared)
- Styles collocated with components
- Services in `services/` folder

**Error Handling:**
- Try/catch in async functions
- Return structured errors (avoid throwing strings)
- Log errors to console for debugging
- Show user-friendly error messages

**Documentation:**
- JSDoc comments on exported functions/types
- README files in folders with complex logic
- SETUP.md for deployment instructions

## Next Phase Planning

**V0.2 Goals:**
- [ ] Session management (save/load groups)
- [ ] Practice problem generator
- [ ] Hint system (Socratic method)
- [ ] Multi-group dashboard
- [ ] Student response tracking

**V0.3+ Goals:**
- [ ] Voice input (speech-to-text)
- [ ] Real-time collaboration
- [ ] Canvas LMS integration
- [ ] Adaptive difficulty
- [ ] Progress analytics

## Additional Resources

- **Anthropic Docs:** https://docs.anthropic.com
- **Claude API:** https://docs.anthropic.com/claude/reference/getting-started-with-the-api
- **Express.js:** https://expressjs.com
- **React:** https://react.dev
- **Vite:** https://vitejs.dev
- **TypeScript:** https://www.typescriptlang.org

---

**Questions?** Check CLAUDE.md or SETUP.md for context.
