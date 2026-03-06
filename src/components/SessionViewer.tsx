/**
 * SessionViewer.tsx
 * Main session review component - displays complete session details
 */

import React, { useState, useEffect } from "react";
import { Session, calculateSessionStats, SessionStats } from "../types/session";
import TranscriptViewer from "./TranscriptViewer";
import ProblemReview from "./ProblemReview";
import "./SessionViewer.css";

interface SessionViewerProps {
  session: Session;
  onClose?: () => void;
}

type TabType = "overview" | "transcript" | "problems" | "notes";

export const SessionViewer: React.FC<SessionViewerProps> = ({
  session,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [notes, setNotes] = useState(session.notes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    const calculatedStats = calculateSessionStats(session);
    setStats(calculatedStats);
  }, [session]);

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (minutes < 60) return `${minutes}m ${secs}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat([], {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const exportAsJSON = (): void => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `session-${session.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!stats) {
    return <div className="session-viewer loading">Loading...</div>;
  }

  return (
    <div className="session-viewer">
      <div className="session-header">
        <div className="session-title-area">
          <h1>{session.topic}</h1>
          <p className="session-date">{formatDate(session.startTime)}</p>
        </div>

        <div className="session-actions">
          <button className="export-btn" onClick={exportAsJSON}>
            📥 Export JSON
          </button>
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="session-info-strip">
        <div className="info-item">
          <span className="label">Group</span>
          <span className="value">{session.groupName}</span>
        </div>
        <div className="info-item">
          <span className="label">Students</span>
          <span className="value">{session.studentNames.join(", ")}</span>
        </div>
        <div className="info-item">
          <span className="label">Status</span>
          <span className={`value status-${session.status}`}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
        </div>
        <div className="info-item">
          <span className="label">Duration</span>
          <span className="value">{formatDuration(stats.totalDuration)}</span>
        </div>
      </div>

      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "transcript" ? "active" : ""}`}
          onClick={() => setActiveTab("transcript")}
        >
          Transcript ({stats.messagesCount})
        </button>
        <button
          className={`tab-btn ${activeTab === "problems" ? "active" : ""}`}
          onClick={() => setActiveTab("problems")}
        >
          Problems ({stats.problemsCount})
        </button>
        <button
          className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => setActiveTab("notes")}
        >
          Notes
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Engagement</h3>
                <div className="stat-item">
                  <span className="stat-name">Messages Exchanged</span>
                  <span className="stat-val-lg">{stats.messagesCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-name">Hints Requested</span>
                  <span className="stat-val-lg">{stats.hintsUsedCount}</span>
                </div>
              </div>

              <div className="stat-card">
                <h3>Problem Solving</h3>
                <div className="stat-item">
                  <span className="stat-name">Problems Attempted</span>
                  <span className="stat-val-lg">{stats.problemsCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-name">Correct Answers</span>
                  <span className="stat-val-lg stat-correct">
                    {stats.correctProblems}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-name">Score</span>
                  <span className="stat-val-lg">
                    {Math.round(stats.scorePercentage)}%
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <h3>Timing</h3>
                <div className="stat-item">
                  <span className="stat-name">Session Duration</span>
                  <span className="stat-val-lg">
                    {formatDuration(stats.totalDuration)}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-name">Avg. Time per Problem</span>
                  <span className="stat-val-lg">
                    {formatDuration(stats.averageTimePerProblem)}
                  </span>
                </div>
              </div>
            </div>

            <div className="performance-section">
              <h3>Performance Summary</h3>
              <div className="score-display">
                <div className="score-circle">
                  <div className="score-number">
                    {Math.round(stats.scorePercentage)}%
                  </div>
                  <div className="score-label">Accuracy</div>
                </div>
                <div className="score-breakdown">
                  <p>
                    The group solved <strong>{stats.correctProblems}</strong> of{" "}
                    <strong>{stats.problemsCount}</strong> problems correctly.
                  </p>
                  <p>
                    Average time per problem was{" "}
                    <strong>{formatDuration(stats.averageTimePerProblem)}</strong>
                    , with the group requesting{" "}
                    <strong>{stats.hintsUsedCount}</strong> hint
                    {stats.hintsUsedCount !== 1 ? "s" : ""}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "transcript" && (
          <TranscriptViewer messages={session.messages} />
        )}

        {activeTab === "problems" && (
          <ProblemReview problems={session.problemsAttempted} />
        )}

        {activeTab === "notes" && (
          <div className="notes-tab">
            <div className="notes-editor">
              <h3>Teacher Notes</h3>
              {isEditingNotes ? (
                <div className="notes-input-area">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add observations about group progress, engagement, misconceptions, next steps..."
                    rows={8}
                  />
                  <div className="notes-actions">
                    <button
                      className="btn-primary"
                      onClick={() => setIsEditingNotes(false)}
                    >
                      Save Notes
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setNotes(session.notes || "");
                        setIsEditingNotes(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="notes-display">
                  {notes ? (
                    <p className="notes-content">{notes}</p>
                  ) : (
                    <p className="notes-empty">No notes yet.</p>
                  )}
                  <button
                    className="btn-edit"
                    onClick={() => setIsEditingNotes(true)}
                  >
                    ✎ Edit Notes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionViewer;
