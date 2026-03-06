import { useState } from 'react'
import './ExampleGenerator.css'

interface ExampleGeneratorProps {
  topic: string
  difficulty?: 'basic' | 'intermediate' | 'advanced'
}

export default function ExampleGenerator({ topic, difficulty = 'intermediate' }: ExampleGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [example, setExample] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateExample = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Placeholder example - replace with Claude API call
      const placeholders = {
        'Quadratic Equations': {
          basic: `Let's solve x² = 16

Step 1: Recognize this is a simple quadratic
Step 2: Take the square root of both sides
Step 3: x = ±4

So x = 4 or x = -4`,
          intermediate: `Solve x² + 5x + 6 = 0

Step 1: Factor the left side
We need two numbers that multiply to 6 and add to 5: 2 and 3

Step 2: Write as (x + 2)(x + 3) = 0

Step 3: Set each factor to zero
x + 2 = 0  →  x = -2
x + 3 = 0  →  x = -3

Answer: x = -2 or x = -3`,
          advanced: `Derive the quadratic formula from ax² + bx + c = 0

Complete the square:
a(x² + (b/a)x) + c = 0
a(x² + (b/a)x + (b/2a)²) - a(b/2a)² + c = 0
a(x + b/2a)² = (b² - 4ac)/4a
(x + b/2a)² = (b² - 4ac)/4a²
x + b/2a = ±√(b² - 4ac)/2a

Therefore: x = (-b ± √(b² - 4ac))/2a`,
        },
        'Systems of Equations': {
          basic: `Solve: x + y = 5 and x - y = 1

Step 1: Add the equations
(x + y) + (x - y) = 5 + 1
2x = 6
x = 3

Step 2: Substitute back
3 + y = 5
y = 2

Answer: (3, 2)`,
          intermediate: `Solve: 2x + 3y = 8 and x - y = 1

Method: Substitution
From equation 2: x = y + 1
Substitute into equation 1:
2(y + 1) + 3y = 8
2y + 2 + 3y = 8
5y = 6
y = 6/5

x = 6/5 + 1 = 11/5

Answer: (11/5, 6/5)`,
          advanced: `Solve using matrices:
[2  3] [x]   [8]
[1 -1] [y] = [1]

Using Cramer's rule or matrix inversion...
det(A) = -5
x = det([8  3; 1 -1])/det(A) = -11/-5 = 11/5
y = det([2  8; 1  1])/det(A) = -6/-5 = 6/5`,
        },
      }

      const examples = (placeholders as any)[topic] || placeholders['Quadratic Equations']
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      setExample(examples[difficulty])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate example')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="example-generator">
      <button
        className="example-btn"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen && !example) generateExample()
        }}
      >
        💡 Show Example
      </button>

      {isOpen && (
        <div className="example-panel">
          {isLoading && <p className="loading">Generating example...</p>}
          {error && <p className="error">{error}</p>}
          {example && (
            <div className="example-content">
              <pre>{example}</pre>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(example)
                }}
              >
                📋 Copy
              </button>
              <button className="refresh-btn" onClick={generateExample}>
                🔄 Generate Another
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
