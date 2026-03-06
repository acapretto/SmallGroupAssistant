/**
 * ProblemReview.tsx
 * Display and review problems attempted by the group
 */

import React, { useState } from "react";
import { Problem } from "../types/session";
import "./ProblemReview.css";

interface ProblemReviewProps {
  problems: Problem[];
}

type FilterType = "all" | "correct" | "incorrect";

export const ProblemReview: React.FC<ProblemReviewProps> = ({ problems }) => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredProblems = problems.filter((p) => {
    if (filter === "correct") return p.isCorrect;
    if (filter === "incorrect") return !p.isCorrect;
    return true;
  });

  const stats = {
    total: problems.length,
    correct: problems.filter((p) => p.isCorrect).length,
    incorrect: problems.filter((p) => !p.isCorrect).length,
    totalTime: problems.reduce((sum, p) => sum + p.timeSpentSeconds, 0),
    averageTime:
      problems.length > 0
        ? problems.reduce((sum, p) => sum + p.timeSpentSeconds, 0) /
          problems.length
        : 0,
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="problem-review">
      <div className="review-header">
        <h2>Problems Attempted</h2>

        <div className="review-stats">
          <div className="stat">
            <span className="stat-label">Total</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat correct">
            <span className="stat-label">Correct</span>
            <span className="stat-value">{stats.correct}</span>
          </div>
          <div className="stat incorrect">
            <span className="stat-label">Incorrect</span>
            <span className="stat-value">{stats.incorrect}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Avg. Time</span>
            <span className="stat-value">{formatTime(stats.averageTime)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Time</span>
            <span className="stat-value">{formatTime(stats.totalTime)}</span>
          </div>
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({problems.length})
          </button>
          <button
            className={`filter-btn ${filter === "correct" ? "active" : ""}`}
            onClick={() => setFilter("correct")}
          >
            ✓ Correct ({stats.correct})
          </button>
          <button
            className={`filter-btn ${filter === "incorrect" ? "active" : ""}`}
            onClick={() => setFilter("incorrect")}
          >
            ✗ Incorrect ({stats.incorrect})
          </button>
        </div>
      </div>

      <div className="problems-list">
        {filteredProblems.length === 0 ? (
          <div className="empty-state">
            <p>No problems in this filter.</p>
          </div>
        ) : (
          filteredProblems.map((problem) => (
            <div
              key={problem.id}
              className={`problem-card ${problem.isCorrect ? "correct" : "incorrect"}`}
            >
              <div className="problem-header">
                <div className="problem-number-status">
                  <span className="problem-number">
                    Problem {problem.problemNumber}
                  </span>
                  <span className={`problem-status ${problem.isCorrect ? "correct" : "incorrect"}`}>
                    {problem.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                </div>

                <div className="problem-meta">
                  <span className="difficulty">
                    {problem.difficulty
                      ? problem.difficulty.charAt(0).toUpperCase() +
                        problem.difficulty.slice(1)
                      : "Unknown"}
                  </span>
                  <span className="attempts">
                    {problem.attemptsCount} attempt{problem.attemptsCount !== 1 ? "s" : ""}
                  </span>
                  <span className="time">{formatTime(problem.timeSpentSeconds)}</span>
                  <button
                    className="expand-btn"
                    onClick={() => toggleExpand(problem.id)}
                  >
                    {expandedId === problem.id ? "−" : "+"}
                  </button>
                </div>
              </div>

              {expandedId === problem.id && (
                <div className="problem-details">
                  <div className="problem-section">
                    <h4>Problem</h4>
                    <p className="problem-text">{problem.text}</p>
                  </div>

                  <div className="problem-section">
                    <h4>Student Answer</h4>
                    <div className="answer-box student-answer">
                      {problem.studentAnswer}
                    </div>
                  </div>

                  {!problem.isCorrect && (
                    <div className="problem-section">
                      <h4>Correct Answer</h4>
                      <div className="answer-box correct-answer">
                        {problem.correctAnswer}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProblemReview;
