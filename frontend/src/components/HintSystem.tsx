import { useState } from 'react'
import './HintSystem.css'

interface HintSystemProps {
  problemId?: string
  problemText?: string
}

export default function HintSystem({}: HintSystemProps = {}) {
  const [hintLevel, setHintLevel] = useState(0)
  const [showHints, setShowHints] = useState(false)

  const hints = [
    '💭 What have you tried so far? Sometimes restating the problem helps.',
    '🎯 Think about which mathematical property or rule might apply here.',
    '📖 Remember: Take it step by step. What\'s the first thing you\'d do?',
  ]

  const handleGetHint = () => {
    if (hintLevel < hints.length) {
      setHintLevel(hintLevel + 1)
      setShowHints(true)
    }
  }

  return (
    <div className="hint-system">
      <button
        className="hint-request-btn"
        onClick={handleGetHint}
        disabled={hintLevel >= hints.length}
      >
        🆘 I'm Stuck ({hintLevel}/3)
      </button>

      {showHints && hintLevel > 0 && (
        <div className="hints-display">
          {hints.slice(0, hintLevel).map((hint, idx) => (
            <div key={idx} className={`hint-box level-${idx + 1}`}>
              <p>{hint}</p>
            </div>
          ))}

          {hintLevel >= hints.length && (
            <div className="hint-box level-3 final">
              <p>You've seen all the hints! Give it another try. You've got this! 💪</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
