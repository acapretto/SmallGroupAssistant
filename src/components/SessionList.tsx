/**
 * SessionList.tsx
 * Teacher dashboard showing all sessions with filtering
 */

import React, { useState, useMemo, useEffect } from "react";
import { Session } from "../types/session";
import "./SessionList.css";

interface SessionListProps {
  sessions: Session[];
  onSessionSelect: (session: Session) => void;
  selectedSessionId?: string;
}

type SortType = "date" | "topic" | "group" | "score";

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  onSessionSelect,
  selectedSessionId,
}) => {
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("date");

  // Get unique topics and groups for filter dropdowns
  const topics = useMemo(
    () => [...new Set(sessions.map((s) => s.topic))],
    [sessions]
  );

  const groups = useMemo(
    () => [...new Set(sessions.map((s) => s.groupId))],
    [sessions]
  );

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let result = [...sessions];

    if (filterStatus !== "all") {
      result = result.filter((s) => s.status === filterStatus);
    }

    if (filterTopic) {
      result = result.filter((s) => s.topic === filterTopic);
    }

    if (filterGroup) {
      result = result.filter((s) => s.groupId === filterGroup);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.startTime).getTime() -
            new Date(a.startTime).getTime()
          );
        case "topic":
          return a.topic.localeCompare(b.topic);
        case "group":
          return a.groupId.localeCompare(b.groupId);
        case "score":
          const scoreA = a.score.total > 0 ? a.score.correct / a.score.total : 0;
          const scoreB = b.score.total > 0 ? b.score.correct / b.score.total : 0;
          return scoreB - scoreA;
        default:
          return 0;
      }
    });

    return result;
  }, [sessions, filterStatus, filterTopic, filterGroup, sortBy]);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getScorePercentage = (session: Session): number => {
    return session.score.total > 0
      ? Math.round((session.score.correct / session.score.total) * 100)
      : 0;
  };

  return (
    <div className="session-list">
      <div className="list-header">
        <h2>Sessions</h2>
        <span className="total-count">{filteredSessions.length} sessions</span>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "active" | "completed")
            }
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="topic-filter">Topic</label>
          <select
            id="topic-filter"
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
          >
            <option value="">All Topics</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="group-filter">Group</label>
          <select
            id="group-filter"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="">All Groups</option>
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-filter">Sort By</label>
          <select
            id="sort-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
          >
            <option value="date">Newest First</option>
            <option value="topic">Topic A-Z</option>
            <option value="group">Group A-Z</option>
            <option value="score">Highest Score</option>
          </select>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="empty-state">
          <p>No sessions found matching your filters.</p>
        </div>
      ) : (
        <div className="sessions-table">
          <div className="table-header">
            <div className="col-date">Date</div>
            <div className="col-topic">Topic</div>
            <div className="col-group">Group</div>
            <div className="col-students">Students</div>
            <div className="col-score">Score</div>
            <div className="col-status">Status</div>
          </div>

          <div className="table-body">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`table-row ${selectedSessionId === session.id ? "selected" : ""}`}
                onClick={() => onSessionSelect(session)}
              >
                <div className="col-date">{formatDate(session.startTime)}</div>
                <div className="col-topic">{session.topic}</div>
                <div className="col-group">{session.groupName}</div>
                <div className="col-students">
                  <span className="student-count">
                    {session.studentNames.length}
                  </span>
                </div>
                <div className="col-score">
                  <span
                    className={`score-badge ${
                      getScorePercentage(session) >= 80
                        ? "good"
                        : getScorePercentage(session) >= 60
                          ? "fair"
                          : "poor"
                    }`}
                  >
                    {getScorePercentage(session)}%
                  </span>
                </div>
                <div className="col-status">
                  <span className={`status-badge ${session.status}`}>
                    {session.status === "active"
                      ? "🔴 Active"
                      : session.status === "paused"
                        ? "⏸ Paused"
                        : "✓ Done"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionList;
