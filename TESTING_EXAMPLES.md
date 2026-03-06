# Testing Examples — Practice Problem Generator

## Test Scenarios

All examples assume the backend is running on `http://localhost:3000`.

### 1. Basic Problem Generation

**Request: Generate 3 easy algebra problems**
```bash
curl -X POST http://localhost:3000/api/problems/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Solving One-Step Linear Equations",
    "count": 3,
    "difficultyLevel": "easy"
  }'
```

**Expected Response**:
```json
{
  "problems": [
    {
      "id": "problem_1",
      "problemText": "Solve for x: x + 7 = 12",
      "correctAnswer": "x = 5",
      "hints": [
        "What number do you need to add to 7 to get 12?",
        "Try subtracting 7 from both sides",
        "What is 12 - 7?"
      ],
      "topic": "Solving One-Step Linear Equations",
      "difficultyLevel": "easy"
    },
    ...
  ],
  "generatedAt": "2026-03-05T14:20:00.000Z"
}
```

---

### 2. Medium Difficulty Problem Generation

**Request: Generate 4 medium difficulty quadratic equation problems**
```bash
curl -X POST http://localhost:3000/api/problems/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Factoring Quadratic Equations",
    "count": 4,
    "difficultyLevel": "medium"
  }'
```

**Topics that work well**:
- Solving Linear Equations
- Quadratic Equations
- Factoring
- Systems of Equations
- Exponents and Radicals
- Fractions and Decimals
- Percentage Problems
- Geometry (Area, Perimeter, Volume)
- Probability and Counting
- Trigonometry Basics

---

### 3. Correct Answer Grading

**Request: Grade a correct answer**
```bash
curl -X POST http://localhost:3000/api/problems/check-answer \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "problem_1",
    "userAnswer": "x = 5",
    "problemText": "Solve for x: x + 7 = 12",
    "correctAnswer": "x = 5"
  }'
```

**Expected Response**:
```json
{
  "problemId": "problem_1",
  "correct": true,
  "feedback": "Exactly! You correctly found that x = 5. Great work!",
  "explanation": "When x = 5, substituting back: 5 + 7 = 12 ✓",
  "hint": null,
  "gradedAt": "2026-03-05T14:21:00.000Z"
}
```

---

### 4. Incorrect Answer Grading

**Request: Grade an incorrect answer**
```bash
curl -X POST http://localhost:3000/api/problems/check-answer \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "problem_1",
    "userAnswer": "x = 12",
    "problemText": "Solve for x: x + 7 = 12",
    "correctAnswer": "x = 5"
  }'
```

**Expected Response**:
```json
{
  "problemId": "problem_1",
  "correct": false,
  "feedback": "Not quite. Let's check: if x = 12, then x + 7 = 19, not 12.",
  "explanation": "You need to find what number plus 7 equals 12. Try working backwards: 12 - 7 = ?",
  "hint": "Subtract 7 from both sides to isolate x.",
  "gradedAt": "2026-03-05T14:21:15.000Z"
}
```

---

### 5. Partially Correct Answer

**Request: Grade a partially correct but not fully simplified answer**
```bash
curl -X POST http://localhost:3000/api/problems/check-answer \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "problem_2",
    "userAnswer": "2x + 4",
    "problemText": "Simplify: 4x + 6 - 2x - 2",
    "correctAnswer": "2x + 4"
  }'
```

**Expected Response**:
```json
{
  "problemId": "problem_2",
  "correct": true,
  "feedback": "Perfect! You correctly combined like terms.",
  "explanation": "You grouped the x-terms (4x - 2x = 2x) and constants (6 - 2 = 4).",
  "gradedAt": "2026-03-05T14:21:30.000Z"
}
```

---

### 6. Alternative Answer Format

**Request: Multiple equivalent forms should all be accepted**
```bash
# Fraction form
curl -X POST http://localhost:3000/api/problems/check-answer \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "problem_3",
    "userAnswer": "3/4",
    "problemText": "Simplify 6/8",
    "correctAnswer": "3/4"
  }'

# Decimal form (equivalent)
curl -X POST http://localhost:3000/api/problems/check-answer \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "problem_3",
    "userAnswer": "0.75",
    "problemText": "Simplify 6/8",
    "correctAnswer": "3/4"
  }'
```

Both should return `correct: true`.

---

### 7. Answer with Units

**Request: Grade a geometry answer with units**
```bash
curl -X POST http://localhost:3000/api/problems/check-answer \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "problem_4",
    "userAnswer": "48 square inches",
    "problemText": "Find the area of a rectangle with length 8 inches and width 6 inches",
    "correctAnswer": "48 square inches"
  }'
```

**Note**: Units are flexible. Should also accept "48 sq in" or just "48".

---

### 8. Multiple Choice Answer

**Request: Generate and grade multiple choice problems**
```bash
# Generate
curl -X POST http://localhost:3000/api/problems/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Order of Operations",
    "count": 2,
    "difficultyLevel": "easy"
  }'

# Then if a problem is: "Evaluate: 2 + 3 × 4
# A) 20  B) 14  C) 9  D) 11"

# Grade as:
curl -X POST http://localhost:3000/api/problems/check-answer \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "problem_1",
    "userAnswer": "B",
    "problemText": "Evaluate: 2 + 3 × 4\nA) 20  B) 14  C) 9  D) 11",
    "correctAnswer": "B"
  }'
```

---

### 9. Edge Case: No Solution Answers

**Request: Problem with "no solution" as answer**
```bash
curl -X POST http://localhost:3000/api/problems/check-answer \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "problem_5",
    "userAnswer": "no solution",
    "problemText": "Solve: x + 5 = x + 7",
    "correctAnswer": "no solution"
  }'
```

---

### 10. Edge Case: Empty Answer

**Request: Submit without answer (validation error)**
```bash
curl -X POST http://localhost:3000/api/problems/check-answer \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "problem_1",
    "userAnswer": "",
    "problemText": "Solve for x: x + 7 = 12",
    "correctAnswer": "x = 5"
  }'
```

**Expected Response**:
```json
{
  "error": "UserAnswer is required and cannot be empty"
}
```

---

### 11. Edge Case: Invalid Difficulty

**Request: Invalid difficulty level (validation error)**
```bash
curl -X POST http://localhost:3000/api/problems/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Algebra",
    "count": 3,
    "difficultyLevel": "super_hard"
  }'
```

**Expected Response**:
```json
{
  "error": "DifficultyLevel must be \"easy\", \"medium\", or \"hard\""
}
```

---

### 12. Edge Case: Invalid Count

**Request: Count outside 3-5 range**
```bash
curl -X POST http://localhost:3000/api/problems/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Algebra",
    "count": 10,
    "difficultyLevel": "medium"
  }'
```

**Expected Response**:
```json
{
  "error": "Count must be an integer between 3 and 5"
}
```

---

## React Component Testing

### Basic Usage
```tsx
import ProblemSet from "./components/ProblemSet";

function TestApp() {
  return (
    <ProblemSet
      topic="Solving Quadratic Equations"
      count={3}
      difficultyLevel="medium"
      onComplete={(correct, total) => {
        console.log(`You got ${correct}/${total} correct!`);
      }}
    />
  );
}
```

### Testing Interactions
1. **Load**: Component loads problems (should see spinner, then problems)
2. **Answer**: Type in answer field, press Enter or click "Check Answer"
3. **Feedback**: See correct/incorrect feedback with explanation
4. **Hint**: Click hint button, see progressive hints
5. **Next**: Move to next problem
6. **Skip**: Skip a problem without answering (counts as wrong)
7. **Results**: After all problems, see score and % at bottom

### Browser DevTools Testing
```javascript
// In browser console:

// Test problem generation
fetch('/api/problems/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Fractions',
    count: 3,
    difficultyLevel: 'easy'
  })
}).then(r => r.json()).then(d => console.log(d));

// Test answer grading
fetch('/api/problems/check-answer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    problemId: 'problem_1',
    userAnswer: 'x = 5',
    problemText: 'Solve: x + 3 = 8',
    correctAnswer: 'x = 5'
  })
}).then(r => r.json()).then(d => console.log(d));
```

---

## Performance Baseline

Typical timings (Claude API response time):
- **Easy problems** (3-step): ~1.5s
- **Medium problems** (4-5 steps): ~2.5s
- **Hard problems** (6+ steps): ~3.5s
- **Grading** (simple answer): ~0.8s
- **Grading** (complex feedback): ~1.5s

---

## Topics to Test (Known Good Examples)

✓ **Linear Equations**: Solving one-step, two-step, multi-step
✓ **Quadratic Equations**: Factoring, quadratic formula, completing the square
✓ **Fractions**: Simplification, addition, subtraction, multiplication, division
✓ **Exponents**: Laws of exponents, scientific notation
✓ **Polynomials**: Addition, subtraction, multiplication, factoring
✓ **Systems of Equations**: Substitution, elimination
✓ **Geometry**: Area, perimeter, volume, angle relationships
✓ **Trigonometry**: SOHCAHTOA, exact values, inverse functions
✓ **Probability**: Combinations, permutations, basic probability
✓ **Sequences/Series**: Arithmetic, geometric, sums

---

## Debugging

### Problem Generation Fails
1. Check ANTHROPIC_API_KEY is set
2. Check Claude API has quota
3. Look at backend console for error
4. Try simpler topic (e.g., "Algebra" instead of "Solving Systems Using Matrix Methods")

### Grading Returns Generic Feedback
1. Ensure problemText and correctAnswer are clear
2. Try grading again (Claude may vary)
3. Check that answer is truly correct per problem statement

### React Component Won't Load Problems
1. Verify backend is running
2. Check browser console for network errors
3. Ensure CORS is configured if frontend/backend on different ports
4. Check that `/api/problems/generate` endpoint is mounted
