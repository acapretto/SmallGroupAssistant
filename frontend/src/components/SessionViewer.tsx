import { useState, useEffect } from 'react'
import './SessionViewer.css'

interface Session {
  id: string
  groupId: string
  topic: string
  startTime: Date
  messages: Array<{ role: string; content: string }>
  problemsAttempted: number
  score: { correct: number; total: number }
  status: string
}

interface SessionViewerProps {
  onSessionSelect?: (sessionId: string) => void
}

export default function SessionViewer({ onSessionSelect }: SessionViewerProps) {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('smallgroup_sessions')
    if (saved) {
      setSessions(JSON.parse(saved))
    }
  }, [])

  return (
    <div className="session-viewer">
      <h2>Session History</h2>

      {sessions.length === 0 ? (
        <p className="empty-state">No sessions recorded yet.</p>
      ) : (
        <div className="sessions-grid">
          {sessions.map(session => (
            <div key={session.id} className="session-card" onClick={() => onSessionSelect?.(session.id)}>
              <h3>{session.topic}</h3>
              <p className="group-info">Group: {session.groupId}</p>
              <p className="date">
                {new Date(session.startTime).toLocaleDateString()}
              </p>
              <div className="score">
                Score: {session.score.correct}/{session.score.total}
              </div>
              <span className={`status status-${session.status}`}>{session.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
