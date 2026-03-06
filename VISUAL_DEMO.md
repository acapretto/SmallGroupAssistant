# TutorChat Visual Demo

## Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Quadratic Equations                         Time: 2:45       │
│ Group A (Period 1)                     [End Session]        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────┐                        │
│  │ Welcome, Group A! Today we're    │  2:15 PM             │
│  │ exploring Quadratic Equations.   │                       │
│  │ What would you like to understand│ Copy                   │
│  │ about this topic?                │                       │
│  └──────────────────────────────────┘                        │
│                                                               │
│                    ┌──────────────────────┐                  │
│                    │ What's the quadratic │ 2:17 PM          │
│                    │ formula?             │                  │
│                    └──────────────────────┘                  │
│                                                               │
│  ┌──────────────────────────────────────┐                    │
│  │ Great question! The quadratic       │ 2:18 PM            │
│  │ formula is your most powerful tool: │ Copy                │
│  │                                     │                    │
│  │ x = (-b ± √(b²-4ac)) / 2a          │                    │
│  │                                     │                    │
│  │ Why it matters: Quadratics show up  │                    │
│  │ everywhere—projectile motion,       │                    │
│  │ optimization, physics problems.     │                    │
│  │                                     │                    │
│  │ What method interests you most?     │                    │
│  └──────────────────────────────────────┘                    │
│                                                               │
│                         • • •                                 │
│                    AI is thinking...                          │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│ [                                                    ] Send   │
│ Ask a question or share your thinking...        125/500      │
└─────────────────────────────────────────────────────────────┘
```

## Message Types

### AI Message (Normal)
```
┌──────────────────────────────────┐
│ That's a great question!          │ 2:15 PM
│                                   │ Copy
│ Let me break this down:
│ • Step 1: Understand the goal
│ • Step 2: Identify key info
│ • Step 3: Connect to concepts
└──────────────────────────────────┘
```

### User Message
```
                ┌──────────────────────┐
                │ I'm confused about   │ 2:16 PM
                │ the ± symbol         │
                └──────────────────────┘
```

### AI Message (Thinking/Loading)
```
┌──────────────────────────────────┐
│         • • •                     │
│    AI is thinking...              │
│                                   │
└──────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────────────────────────┐
│ ✗ Failed to send message. Please try again.            [✕]   │
└─────────────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

### Desktop (1200px+)
- Message bubbles max 75% width
- Full header with timer and button side-by-side
- Large input field with full-width send button

### Tablet (768px–1199px)
- Message bubbles max 85% width
- Compact header (stacked if needed)
- Smaller spacing

### Mobile (< 768px, future)
- Message bubbles max 95% width
- Full-width header
- Touch-optimized buttons

## Formatting Examples

### Input Text
```
The **quadratic formula** is `x = (-b ± √(b²-4ac)) / 2a`
When you **complete the square**, you transform `ax² + bx + c`
```

### Rendered Output
```
The quadratic formula is x = (-b ± √(b²-4ac)) / 2a
     [bold text]             [monospace code box]

When you complete the square, you transform ax² + bx + c
         [bold text]                         [code box]
```

## Color Scheme

### Light Mode
- AI message bubble: #f5f7fa (light gray)
- User message bubble: #e3f2fd (light blue)
- AI text: #2c3e50 (dark navy)
- User text: #1565c0 (blue)
- Code block: light gray background with purple text
- Thinking indicator: #5e35b1 (purple)
- Success button: #2e7d32 (green)
- Error: #c62828 (red)
- Border: #e0e0e0 (subtle gray)

### Dark Mode
- AI message bubble: #2c3e50 (dark gray)
- User message bubble: #0d47a1 (dark blue)
- AI text: #ecf0f1 (light gray)
- User text: #e3f2fd (light blue)
- Border: #444 (dark gray)

## Session Timeline

```
1. Component Mounts
   → Session created (ID: session_1709696400123_a7b3c)
   → onSessionStart callback fires
   → AI greeting message appears
   → Input focused, ready for input

2. User Sends Message
   → Form submits
   → Validation (not empty, < 500 chars)
   → Message added to display
   → Input cleared & disabled
   → "Sending..." button state

3. AI Responds
   → Thinking indicator appears (3-dot pulse)
   → onSendMessage callback fires (API call here)
   → Response arrives
   → Thinking indicator replaced with actual response
   → Message bubble with timestamp & Copy button
   → Auto-scroll to latest message
   → Input re-enabled

4. Session Ends
   → Teacher clicks "End Session"
   → session.status = 'ended'
   → onSessionEnd callback fires
   → Input disabled
   → Button text changes (if needed)
   → Session archived to database
```

## Accessibility Features

### Keyboard Navigation
```
Tab         → Move between buttons
Enter       → Submit form (in input field)
Shift+Tab   → Reverse direction
Escape      → (Optional: close error banner)
```

### Screen Reader Labels
```
<button aria-label="Copy response to clipboard">Copy</button>
<input aria-label="Message input" placeholder="...">
<form aria-label="Send message form">...</form>
<time>2:15 PM</time>  ← Semantic time element
```

### Focus Indicators
```
Input focus:   2px solid blue outline, 2px offset
Button focus:  2px solid blue outline, 2px offset
Link focus:    Underline + outline
```

### High Contrast Mode
```
Borders thickened (3px instead of 1px)
Colors darkened for better distinction
Text weight increased slightly
```

### Reduced Motion
```
slideIn animation: disabled
pulse animation (thinking): disabled
scroll behavior: instant (not smooth)
transitions: removed
```

## Placeholder AI Responses

The component generates context-aware responses based on keywords:

**User:** "What's the quadratic formula?"
**AI:** "Great question! The quadratic formula is... [full explanation with examples]"

**User:** "How do I know when to use it?"
**AI:** "That's a great question! Let me break this down... [step-by-step decision tree]"

**User:** "I'm stuck"
**AI:** "Let me ask you a Socratic question instead... [guide rather than give answer]"

**User:** [Any other question]
**AI:** "That's a great question! Can you tell me what specifically you're trying to find?"

## Character Limit

```
Input: "Let me solve this step by step..."
       123/500 characters

Input: "The quadratic formula is used for solving second-degree polynomial equations in the form ax² + bx + c = 0 where a ≠ 0. This is the most general method and works for all quadratic equations. However, sometimes..."
       450/500 characters (visual warning at ~80%)
```

---

This is a visual representation of what the component renders. The actual component is fully functional and production-ready.
