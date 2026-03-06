# Tasks — Small Group Learning Assistant V0.1

## Backlog (Sprint Order)

### Phase 1: AI Tutor Interface + Content Generation
- [ ] Set up React + Node.js scaffold
- [ ] Build AI tutor chat interface (display messages, input box)
- [ ] Create concept-explanation prompt (Claude generates explanation for topic)
- [ ] Build example generator (ask Claude to create step-by-step worked example)
- [ ] Implement practice problem generator (3–5 problems tailored to topic + group level)
- [x] Add hint system (Socratic questions, not direct answers) — **COMPLETED 2026-03-05**
  - API route: `backend/routes/hints.ts`
  - React component: `src/components/HintSystem.tsx`
  - Custom hook: `src/hooks/useHints.ts`
  - System prompt: `prompts/socratic-hints.txt`
  - Docs: `HINT_SYSTEM.md` + `INTEGRATION_HINT_SYSTEM.md`
- [ ] Create session log viewer (teacher can review what was covered)
- [ ] Deploy to Netlify

### Phase 2: Group Management & Customization
- [ ] Teacher interface: start session, select topic, set difficulty level
- [ ] Group management: add/remove students from group
- [ ] Session pause/resume
- [ ] Topic selection (dropdown or search)
- [ ] Difficulty slider (affects problem generator)

### Phase 3: Testing & Iteration
- [ ] Test prompt quality (5+ topics, check explanation clarity)
- [ ] Pilot with 1 teacher + 2 groups for 1 week
- [ ] Gather teacher feedback on AI quality, student engagement
- [ ] Refine prompts, improve hint system
- [ ] Write README + teacher guide

## Current Status
- **Phase 1:** In progress (1 of 7 tasks complete: hint system ✅)
- **Next priority:** Scaffold React + Node.js, build tutor chat interface

## Blockers
- None yet

## Dependencies
- Netlify hosting
- GitHub repo created
- Claude API key (user has this)
