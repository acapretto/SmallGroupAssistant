# PRD — Small Group Learning Assistant

## Overview
An AI-powered learning companion that works with small groups (3–5 students) while the teacher handles other students or groups. The AI tutor adapts to the group's specific questions, generates targeted examples and practice problems, and keeps the group on track. Frees the teacher to be more effective.

## Problem Statement
**The single-teacher bottleneck:**
- 25 students, 1 teacher
- Teacher explains concept to whole class (too slow for fast learners, too fast for struggling learners)
- Teacher tries to work with small group (rest of class off-task or bored)
- No way to provide differentiated, real-time instruction at scale

**Solution:** AI tutor for small group, human teacher for intervention and roaming.

## User Stories

### Story 1: Teacher Assigns Small Group
- Teacher: "Group A (5 students), use the AI tutor for quadratic equations"
- Students gather at a station with a tablet/laptop
- AI greets: "Today we're solving quadratic equations. What do you already know?"
- **Outcome:** Structured, AI-led learning while teacher works with another group

### Story 2: Group Asks Question
- Student: "How do I know when to use the quadratic formula?"
- AI analyzes question, generates specific example, writes it step-by-step
- Group works through it together (AI is guide, not giver of answers)
- **Outcome:** Immediate, customized instruction without teacher

### Story 3: Problem Generation
- Group finishes the explanation portion
- Teacher hits "Generate 3 practice problems" for this group's level
- AI creates on-the-fly, tailored to what group just learned
- Group works while AI provides hints (not answers)
- **Outcome:** Continuous engagement, no downtime

### Story 4: Teacher Reviews Group Progress
- Teacher checks dashboard: "Group A mastered quadratics, ready for Group B's extension"
- Teacher swaps students between groups/tasks
- **Outcome:** Data-informed, flexible grouping

## MVP Features (V0.1)

| Feature | Scope |
|---|---|
| AI tutor chat interface | ✅ |
| Concept explanation (Claude generates, group reads/discusses) | ✅ |
| Step-by-step example generation | ✅ |
| Practice problem generator (3–5 problems, auto-graded) | ✅ |
| Hint system (Socratic, not answer-giving) | ✅ |
| Group session management (teacher can start/pause/end) | ✅ |
| Session log (teacher can review what was covered) | ✅ |

## Out of Scope (V0.1)
- Voice input (text only)
- Video explanations
- Multi-group support (single group per session)
- Canvas integration
- Real-time teacher dashboard with multiple groups
- Mobile optimization

## Success Metrics
- **Teacher Feedback:** "I can finally work with multiple groups"
- **Group Engagement:** 90%+ on-task during AI session
- **Problem Quality:** AI-generated problems are appropriate difficulty (teacher rating > 8/10)
- **Adoption:** 2+ teachers pilot

## Assumptions & Risks

| Assumption | Risk | Mitigation |
|---|---|---|
| AI can generate good math explanations | Generic, unhelpful explanations | Provide detailed prompts, template-based responses |
| Students will prefer AI + peers over teacher | Students feel ignored or alienated | Frame as "AI coach while teacher handles other priorities" |
| Group will stay on-task without teacher | Off-task behavior, gaming the system | Build in engagement checks, hint-request tracking |

## Success Criteria for V0.1
- Pilot with 1 teacher, 2 groups (10 students), 1 week
- AI explanations rated > 7/10 by teacher and students
- Group completes 80% of assigned problems without teacher
