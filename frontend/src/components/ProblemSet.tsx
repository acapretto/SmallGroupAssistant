/**
 * ProblemSet.tsx - React component for displaying and managing practice problems
 * Displays problems one at a time, collects answers, auto-grades, and tracks progress
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Problem,
  ProblemGenerationRequest,
  CheckAnswerResponse,
  ProblemSetState,
} from "../types/problem";

interface ProblemSetProps {
  topic?: string;
  count?: number;
  difficultyLevel?: string;
  onComplete?: (score: number, totalProblems: number) => void;
}

interface GradeResult {
  problemId: string;
  correct: boolean;
  feedback: string;
  explanation?: string;
  hint?: string;
}

const ProblemSet: React.FC<ProblemSetProps> = ({
  topic = "Algebra",
  count = 3,
  difficultyLevel = "medium",
  onComplete,
}) => {
  const [state, setState] = useState<ProblemSetState>({
    problems: [],
    currentIndex: 0,
    userAnswers: new Map(),
    scores: new Map(),
    isLoading: true,
    totalCorrect: 0,
  });

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [hintIndex, setHintIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Generate problems on component mount
   */
  useEffect(() => {
    generateProblems();
  }, [topic, count, difficultyLevel]);

  const generateProblems = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
    try {
      const request: ProblemGenerationRequest = {
        topic,
        count: Math.max(3, Math.min(5, count)),
        difficultyLevel,
      };

      const response = await fetch("/api/problems/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate problems");
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        problems: data.problems,
        isLoading: false,
        currentIndex: 0,
        userAnswers: new Map(),
        scores: new Map(),
        totalCorrect: 0,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  };

  const checkAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert("Please enter an answer before submitting.");
      return;
    }

    const problem = state.problems[state.currentIndex];
    if (!problem) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/problems/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          userAnswer: currentAnswer,
          problemText: problem.problemText,
          correctAnswer: problem.correctAnswer,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to grade answer");
      }

      const result: CheckAnswerResponse & { problemId: string } =
        await response.json();

      const isCorrect = result.correct;
      setGradeResult({
        problemId: problem.id,
        correct: isCorrect,
        feedback: result.feedback,
        explanation: result.explanation,
        hint: result.hint,
      });

      // Update scores
      setState((prev) => {
        const newScores = new Map(prev.scores);
        newScores.set(problem.id, isCorrect);

        const totalCorrect = Array.from(newScores.values()).filter(
          (v) => v
        ).length;

        return {
          ...prev,
          scores: newScores,
          totalCorrect,
        };
      });

      // Store answer
      setState((prev) => {
        const newAnswers = new Map(prev.userAnswers);
        newAnswers.set(problem.id, currentAnswer);
        return { ...prev, userAnswers: newAnswers };
      });

      setShowHint(false);
      setHintIndex(0);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to grade answer";
      setState((prev) => ({ ...prev, error: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (state.currentIndex < state.problems.length - 1) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));
      resetProblemState();
    } else {
      // All problems completed
      if (onComplete) {
        onComplete(state.totalCorrect, state.problems.length);
      }
    }
  };

  const handleSkip = () => {
    // Store skip as incorrect
    const problem = state.problems[state.currentIndex];
    setState((prev) => {
      const newScores = new Map(prev.scores);
      newScores.set(problem.id, false);
      return {
        ...prev,
        scores: newScores,
      };
    });
    handleNext();
  };

  const handleHint = () => {
    const problem = state.problems[state.currentIndex];
    if (!problem || !problem.hints) return;

    if (hintIndex < problem.hints.length) {
      setShowHint(true);
      setHintIndex((prev) => Math.min(prev + 1, problem.hints.length));
    }
  };

  const handleReset = () => {
    resetProblemState();
    setGradeResult(null);
  };

  const resetProblemState = () => {
    setCurrentAnswer("");
    setShowHint(false);
    setHintIndex(0);
    setGradeResult(null);
  };

  const handleRegenerateTopic = () => {
    generateProblems();
    resetProblemState();
  };

  // Loading state
  if (state.isLoading) {
    return (
      <div className="problem-set loading">
        <div className="spinner"></div>
        <p>Generating practice problems on {topic}...</p>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="problem-set error">
        <h2>Error</h2>
        <p>{state.error}</p>
        <button onClick={handleRegenerateTopic}>Try Again</button>
      </div>
    );
  }

  // Empty state
  if (!state.problems || state.problems.length === 0) {
    return (
      <div className="problem-set empty">
        <p>No problems available.</p>
        <button onClick={generateProblems}>Generate Problems</button>
      </div>
    );
  }

  const problem = state.problems[state.currentIndex];
  const isLastProblem = state.currentIndex === state.problems.length - 1;
  const hasAnswered = state.scores.has(problem.id);
  const isCorrect = state.scores.get(problem.id);

  return (
    <div className="problem-set">
      {/* Progress bar */}
      <div className="progress-section">
        <div className="progress-info">
          <span className="problem-counter">
            Problem {state.currentIndex + 1} of {state.problems.length}
          </span>
          <span className="score">
            Score: {state.totalCorrect}/{state.problems.length}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((state.currentIndex + 1) / state.problems.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Problem display */}
      <div className="problem-container">
        <div className="problem-header">
          <h2>Problem</h2>
          <span className="difficulty-badge">{difficultyLevel}</span>
        </div>

        <div className="problem-text">
          <p>{problem.problemText}</p>
        </div>

        {/* Input section */}
        {!hasAnswered ? (
          <div className="input-section">
            <label htmlFor="answer-input">Your Answer:</label>
            <input
              id="answer-input"
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Enter your answer..."
              disabled={isSubmitting}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isSubmitting) {
                  checkAnswer();
                }
              }}
            />

            {/* Hint button and display */}
            {hintIndex < (problem.hints?.length || 0) && (
              <button
                className="hint-button"
                onClick={handleHint}
                disabled={isSubmitting}
              >
                💡 Hint ({hintIndex + 1}/{problem.hints?.length || 0})
              </button>
            )}

            {showHint && hintIndex > 0 && (
              <div className="hint-box">
                <p>{problem.hints?.[hintIndex - 1]}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="action-buttons">
              <button
                className="submit-button"
                onClick={checkAnswer}
                disabled={isSubmitting || !currentAnswer.trim()}
              >
                {isSubmitting ? "Checking..." : "Check Answer"}
              </button>

              {!hasAnswered && (
                <button
                  className="skip-button"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Feedback section */
          <div
            className={`feedback-section ${isCorrect ? "correct" : "incorrect"}`}
          >
            <div className="feedback-icon">
              {isCorrect ? "✓" : "✗"}
            </div>
            <h3>{isCorrect ? "Correct!" : "Not quite right."}</h3>
            <p className="feedback-text">{gradeResult?.feedback}</p>

            {gradeResult?.explanation && (
              <div className="explanation">
                <p>
                  <strong>Explanation:</strong> {gradeResult.explanation}
                </p>
              </div>
            )}

            {gradeResult?.hint && (
              <div className="next-hint">
                <p>
                  <strong>Next hint:</strong> {gradeResult.hint}
                </p>
              </div>
            )}

            <div className="feedback-actions">
              <button
                className="reset-button"
                onClick={handleReset}
              >
                Try Again
              </button>

              <button
                className={`next-button ${isLastProblem ? "complete" : ""}`}
                onClick={handleNext}
              >
                {isLastProblem ? "View Results" : "Next Problem"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results summary (shown at end) */}
      {isLastProblem && hasAnswered && (
        <div className="results-summary">
          <h3>Session Summary</h3>
          <p>
            You got <strong>{state.totalCorrect}</strong> out of{" "}
            <strong>{state.problems.length}</strong> problems correct.
          </p>
          <div className="results-percentage">
            {Math.round((state.totalCorrect / state.problems.length) * 100)}%
          </div>
          <button onClick={handleRegenerateTopic} className="regenerate-button">
            Generate New Problems
          </button>
        </div>
      )}
    </div>
  );
};

export default ProblemSet;
