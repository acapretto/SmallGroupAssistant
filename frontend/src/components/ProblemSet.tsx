import { useState } from 'react'
import './ProblemSet.css'

interface Problem {
  id: string
  text: string
  correctAnswer: string
  hints: string[]
}

interface ProblemSetProps {
  topic?: string
  count?: number
}

export default function ProblemSet({ count = 3 }: ProblemSetProps = {}) {
  const allProblems: Problem[] = [
    {
      id: '1',
      text: 'Solve: x² - 5x + 6 = 0',
      correctAnswer: 'x = 2 or x = 3',
      hints: ['Try factoring first', 'What two numbers multiply to 6 and add to -5?', '(x - 2)(x - 3) = 0'],
    },
    {
      id: '2',
      text: 'Solve: 2x + 3 = 11',
      correctAnswer: 'x = 4',
      hints: ['Subtract 3 from both sides', '2x = 8', 'x = 4'],
    },
    {
      id: '3',
      text: 'Simplify: √(16x²)',
      correctAnswer: '4|x| or 4x (if x ≥ 0)',
      hints: ['√16 = 4', '√(x²) = |x|', 'Combine them'],
    },
  ]
  const [problems] = useState<Problem[]>(allProblems.slice(0, count))

  const [currentIndex, setCurrentIndex] = useState(0)
  const [, setAnswers] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, boolean>>({})
  const [showHint, setShowHint] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)

  const current = problems[currentIndex]
  const isAnswered = feedback[current.id] !== undefined

  const handleSubmitAnswer = (answer: string) => {
    const isCorrect = answer.toLowerCase().includes(current.correctAnswer.toLowerCase().split(' ')[0])
    setAnswers(prev => ({ ...prev, [current.id]: answer }))
    setFeedback(prev => ({ ...prev, [current.id]: isCorrect }))
  }

  const handleNextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowHint(false)
      setHintLevel(0)
    }
  }

  const handleShowHint = () => {
    if (hintLevel < current.hints.length) {
      setShowHint(true)
      setHintLevel(hintLevel + 1)
    }
  }

  const correct = Object.values(feedback).filter(v => v).length

  return (
    <div className="problem-set">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }} />
      </div>
      <p className="progress-text">
        {currentIndex + 1} of {problems.length} | Correct: {correct}
      </p>

      <div className="problem-card">
        <h3>Problem {currentIndex + 1}</h3>
        <p className="problem-text">{current.text}</p>

        {!isAnswered ? (
          <form
            onSubmit={e => {
              e.preventDefault()
              const input = (e.target as any).answer.value
              handleSubmitAnswer(input)
            }}
          >
            <input
              type="text"
              name="answer"
              placeholder="Enter your answer..."
              className="answer-input"
              autoFocus
            />
            <button type="submit" className="submit-btn">
              Submit
            </button>
          </form>
        ) : (
          <div className={`feedback ${feedback[current.id] ? 'correct' : 'incorrect'}`}>
            {feedback[current.id] ? '✅ Correct!' : '❌ Not quite right'}
            <p className="correct-answer">Correct answer: {current.correctAnswer}</p>
          </div>
        )}

        {!isAnswered && (
          <button className="hint-btn" onClick={handleShowHint}>
            💡 Get Hint ({hintLevel + 1}/3)
          </button>
        )}

        {showHint && (
          <div className="hint-box">
            <strong>Hint:</strong> {current.hints[hintLevel - 1]}
          </div>
        )}

        {isAnswered && currentIndex < problems.length - 1 && (
          <button className="next-btn" onClick={handleNextProblem}>
            Next Problem →
          </button>
        )}

        {isAnswered && currentIndex === problems.length - 1 && (
          <div className="completion">
            <h4>🎉 Done!</h4>
            <p>You got {correct}/{problems.length} correct</p>
            <p>{((correct / problems.length) * 100).toFixed(0)}% mastery</p>
          </div>
        )}
      </div>
    </div>
  )
}
