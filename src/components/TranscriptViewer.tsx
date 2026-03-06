/**
 * TranscriptViewer.tsx
 * Display and search conversation transcript between AI and students
 */

import React, { useState, useMemo } from "react";
import { Message } from "../types/session";
import "./TranscriptViewer.css";

interface TranscriptViewerProps {
  messages: Message[];
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  messages,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter messages based on search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;

    const query = searchQuery.toLowerCase();
    return messages.filter(
      (msg) =>
        msg.content.toLowerCase().includes(query) ||
        (msg.senderName?.toLowerCase().includes(query) ?? false)
    );
  }, [messages, searchQuery]);

  const formatTime = (date: Date): string => {
    const d = new Date(date);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDuration = (prev: Date | null, curr: Date): string => {
    if (!prev) return "0s";
    const diffSeconds = Math.floor(
      (new Date(curr).getTime() - new Date(prev).getTime()) / 1000
    );
    if (diffSeconds < 60) return `${diffSeconds}s`;
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes}m`;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="transcript-viewer">
      <div className="transcript-header">
        <h2>Conversation Transcript</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search messages by text or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="message-count">
            {filteredMessages.length} / {messages.length} messages
          </span>
        </div>
      </div>

      <div className="transcript-timeline">
        {filteredMessages.length === 0 ? (
          <div className="empty-state">
            <p>No messages match your search.</p>
          </div>
        ) : (
          filteredMessages.map((msg, idx) => {
            const prevMsg = idx > 0 ? filteredMessages[idx - 1] : null;
            const duration = formatDuration(
              prevMsg ? new Date(prevMsg.timestamp) : null,
              msg.timestamp
            );

            return (
              <div
                key={msg.id}
                className={`transcript-message ${msg.sender} ${msg.type || "text"}`}
              >
                <div className="message-meta">
                  <span className="sender-badge">
                    {msg.sender === "ai" ? "🤖 AI" : `👤 ${msg.senderName || "Student"}`}
                  </span>
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                  {idx > 0 && <span className="duration">Δ {duration}</span>}
                  <span className={`message-type ${msg.type || "text"}`}>
                    {msg.type || "message"}
                  </span>
                </div>

                <div className="message-content">
                  {msg.content.length > 300 ? (
                    <>
                      <p
                        className={expandedId === msg.id ? "expanded" : "collapsed"}
                      >
                        {msg.content}
                      </p>
                      <button
                        className="expand-toggle"
                        onClick={() => toggleExpand(msg.id)}
                      >
                        {expandedId === msg.id ? "Show less" : "Show more"}
                      </button>
                    </>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TranscriptViewer;
