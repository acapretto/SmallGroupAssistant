# CLAUDE.md — Small Group Learning Assistant

## Project Vision
AI-powered tutor that customizes instruction for a small group (3–5 students) while the rest of the class works independently. Adapts to group's questions, creates targeted examples, generates practice problems on the fly. Frees teacher to circulate and intervene.

## Context
- **Category:** AI-Assisted Learning + Teacher Tools
- **User:** Math teacher with 25+ students, only one teacher
- **Pain Point:** Teacher can't be in multiple places; whole-class lectures waste fast learners' time
- **Target Model:** Classroom tool (web-based); optional Canvas integration

## Tech Stack
- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js + Express (session management)
- **AI:** Claude API for dynamic instruction
- **Database:** Supabase (group sessions, question history)
- **Deployment:** Netlify

## Conventions & Standards
- **Interaction:** Voice (optional), text, or problem cards
- **Content Generation:** Use Claude to create examples tailored to group's questions
- **Group Management:** Teacher can swap students between "independent work" and "small group"
- **Privacy:** Session data encrypted, deleted after class

## Status & Milestones
- **V0.1 (March 2026):** Tutor interface, problem generator, Q&A mode
- **V0.2:** Multi-group support, teacher roaming dashboard
- **V1.0:** Voice input, progress tracking, adaptive difficulty
