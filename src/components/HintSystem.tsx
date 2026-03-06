import React, { useState } from "react";
import { useHints } from "../hooks/useHints";
import "./HintSystem.css";

interface HintSystemProps {
  problemText: string;
  problemId: string;
  groupId: string;
  studentName: string;
  onHintRequested?: (level: number) => void;
}

/**
 * HintSystem Component
 * Provides progressive hint levels for students stuck on a problem.
 * - Level 1: Open questions (reframe thinking)
 * - Level 2: Guided hints (name strategies)
 * - Level 3: Detailed explanation (edge of answer)
 */
export const HintSystem: React.FC<HintSystemProps> = ({
  problemText,
  problemId,
  groupId,
  studentName,
  onHintRequested,
}) => {
  const [userAttempt, setUserAttempt] = useState("");
  const [visibleHintLevels, setVisibleHintLevels] = useState<number[]>([]);
  const { getHint, hints, loading, error } = useHints();

  // Request a hint at a specific level
  const handleRequestHint = async (level: 1 | 2 | 3) => {
    if (!userAttempt.trim()) {
      alert("Please describe what you've tried so far first.");
      return;
    }

    try {
      await getHint({
        problemText,
        userAttempt,
        hintLevel: level,
      });

      // Track hint usage
      trackHintUsage(level);

      // Show the hint level
      if (!visibleHintLevels.includes(level)) {
        setVisibleHintLevels([...visibleHintLevels, level].sort());
      }

      // Callback for parent components (e.g., logging)
      if (onHintRequested) {
        onHintRequested(level);
      }
    } catch (err) {
      console.error("Failed to get hint:", err);
    }
  };

  // Track hint usage for teacher analytics
  const trackHintUsage = (level: 1 | 2 | 3) => {
    fetch("/api/hints/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId,
        studentName,
        problemId,
        hintLevel: level,
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => console.warn("Failed to track hint usage:", err));
  };

  // Get hint for a specific level
  const getHintText = (level: 1 | 2 | 3) => {
    return hints[level] || null;
  };

  // Check if a hint has been retrieved
  const hasHint = (level: 1 | 2 | 3) => {
    return Boolean(hints[level]);
  };

  // Determine if a hint button should be disabled (throttling)
  const isButtonDisabled = (level: 1 | 2 | 3) => {
    return loading || hasHint(level) || !userAttempt.trim();
  };

  return (
    <div className="hint-system">
      <div className="hint-system__section">
        <label htmlFor="user-attempt" className="hint-system__label">
          What have you tried so far?
        </label>
        <textarea
          id="user-attempt"
          className="hint-system__textarea"
          value={userAttempt}
          onChange={(e) => setUserAttempt(e.target.value)}
          placeholder="Describe your attempt, what you tried, or where you got stuck..."
          rows={3}
        />
      </div>

      <div className="hint-system__buttons">
        <button
          className="hint-system__button hint-system__button--level-1"
          onClick={() => handleRequestHint(1)}
          disabled={isButtonDisabled(1)}
          title="Get a gentle question to restart your thinking"
        >
          {hasHint(1) ? "Level 1 ✓" : "Need a hint?"}
        </button>

        <button
          className="hint-system__button hint-system__button--level-2"
          onClick={() => handleRequestHint(2)}
          disabled={!hasHint(1) || isButtonDisabled(2)}
          title="Get guidance on a strategy or property"
        >
          {hasHint(2) ? "Level 2 ✓" : "Go deeper"}
        </button>

        <button
          className="hint-system__button hint-system__button--level-3"
          onClick={() => handleRequestHint(3)}
          disabled={!hasHint(2) || isButtonDisabled(3)}
          title="Get detailed explanation (but not the answer)"
        >
          {hasHint(3) ? "Level 3 ✓" : "Full guidance"}
        </button>
      </div>

      {loading && <div className="hint-system__loading">Getting your hint...</div>}

      {error && (
        <div className="hint-system__error">
          Could not retrieve hint. Please try again.
        </div>
      )}

      {/* Display retrieved hints */}
      {[1, 2, 3].map((level) => {
        const hint = getHintText(level as 1 | 2 | 3);
        if (!hint) return null;

        return (
          <div
            key={level}
            className={`hint-system__hint hint-system__hint--level-${level}`}
          >
            <div className="hint-system__hint-header">
              <h4>
                {level === 1 && "💭 Restart Your Thinking"}
                {level === 2 && "🎯 Strategic Guidance"}
                {level === 3 && "📖 Detailed Walkthrough"}
              </h4>
              <span className="hint-system__hint-type">{hint.type}</span>
            </div>

            <p className="hint-system__hint-text">{hint.hint}</p>

            {hint.keyMessage && (
              <p className="hint-system__hint-key">
                <strong>Key idea:</strong> {hint.keyMessage}
              </p>
            )}
          </div>
        );
      })}

      {visibleHintLevels.length > 0 && visibleHintLevels.length < 3 && (
        <p className="hint-system__encouragement">
          You're thinking this through. Great job!
        </p>
      )}
    </div>
  );
};

export default HintSystem;
