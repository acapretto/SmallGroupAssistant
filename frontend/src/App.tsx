import { useState, useEffect } from 'react'
import './App.css'

// Component imports (will be created in next step)
// import TutorChat from './components/TutorChat'
// import ExampleGenerator from './components/ExampleGenerator'
// import ProblemSet from './components/ProblemSet'
// import HintSystem from './components/HintSystem'
// import SessionViewer from './components/SessionViewer'

interface Group {
  id: string
  name: string
  members: string[]
  topic: string
}

interface Session {
  id: string
  groupId: string
  topic: string
  startTime: Date
  messages: Array<{ role: string; content: string; timestamp: number }>
  problemsAttempted: number
  score: { correct: number; total: number }
  status: 'active' | 'paused' | 'completed'
}

type ViewMode = 'groups' | 'tutor' | 'sessions'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('groups')
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)

  // Initialize with sample groups
  useEffect(() => {
    const sampleGroups: Group[] = [
      {
        id: 'group-1',
        name: 'Algebra 1 - Period 3',
        members: ['Alice', 'Bob', 'Charlie', 'Diana'],
        topic: 'Quadratic Equations',
      },
      {
        id: 'group-2',
        name: 'Algebra 2 - Period 5',
        members: ['Eve', 'Frank'],
        topic: 'Systems of Linear Equations',
      },
    ]
    setGroups(sampleGroups)

    // Load sessions from localStorage
    const saved = localStorage.getItem('smallgroup_sessions')
    if (saved) {
      setSessions(JSON.parse(saved))
    }
  }, [])

  const handleStartSession = (groupId: string) => {
    const group = groups.find(g => g.id === groupId)
    if (!group) return

    const newSession: Session = {
      id: `session_${Date.now()}`,
      groupId,
      topic: group.topic,
      startTime: new Date(),
      messages: [],
      problemsAttempted: 0,
      score: { correct: 0, total: 0 },
      status: 'active',
    }

    setCurrentSession(newSession)
    setSelectedGroupId(groupId)
    setViewMode('tutor')
  }

  const handleEndSession = () => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        status: 'completed' as const,
      }
      setSessions([...sessions, updatedSession])

      // Save to localStorage
      localStorage.setItem('smallgroup_sessions', JSON.stringify([...sessions, updatedSession]))

      setCurrentSession(null)
      setViewMode('sessions')
    }
  }

  return (
    <div className="app">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>SmallGroupAssistant</h1>
          <p>AI-powered tutoring for collaborative learning</p>
        </div>
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${viewMode === 'groups' ? 'active' : ''}`}
            onClick={() => setViewMode('groups')}
          >
            📚 Groups
          </button>
          <button
            className={`nav-tab ${viewMode === 'tutor' ? 'active' : ''}`}
            onClick={() => setViewMode('tutor')}
            disabled={!currentSession}
          >
            🎓 Tutor
          </button>
          <button
            className={`nav-tab ${viewMode === 'sessions' ? 'active' : ''}`}
            onClick={() => setViewMode('sessions')}
          >
            📊 Sessions
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {/* Groups View */}
        {viewMode === 'groups' && (
          <section className="view groups-view">
            <h2>Select a Group to Start</h2>
            <div className="groups-grid">
              {groups.map(group => (
                <div key={group.id} className="group-card">
                  <h3>{group.name}</h3>
                  <p className="topic">Topic: {group.topic}</p>
                  <div className="members">
                    <strong>Members:</strong> {group.members.join(', ')}
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => handleStartSession(group.id)}
                  >
                    Start Tutoring Session
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tutor View */}
        {viewMode === 'tutor' && currentSession && (
          <section className="view tutor-view">
            <div className="tutor-header">
              <h2>
                {groups.find(g => g.id === currentSession.groupId)?.name}
              </h2>
              <p className="topic-info">Topic: {currentSession.topic}</p>
              <button className="btn-danger" onClick={handleEndSession}>
                End Session
              </button>
            </div>

            {/* Placeholder for integrated components */}
            <div className="components-placeholder">
              <div className="placeholder-box">
                <h3>🎓 AI Tutor Chat</h3>
                <p>TutorChat component will render here</p>
              </div>
              <div className="placeholder-box">
                <h3>💡 Examples & Problems</h3>
                <p>ExampleGenerator & ProblemSet will render here</p>
              </div>
              <div className="placeholder-box">
                <h3>🔍 Hints & Support</h3>
                <p>HintSystem will render here</p>
              </div>
            </div>

            <div className="session-info">
              <p>Session ID: {currentSession.id}</p>
              <p>Duration: {Math.round((Date.now() - currentSession.startTime.getTime()) / 1000)}s</p>
              <p>Score: {currentSession.score.correct}/{currentSession.score.total}</p>
            </div>
          </section>
        )}

        {/* Sessions View */}
        {viewMode === 'sessions' && (
          <section className="view sessions-view">
            <h2>Session History</h2>
            {sessions.length === 0 ? (
              <p className="empty-state">No sessions yet. Start one from the Groups tab!</p>
            ) : (
              <div className="sessions-list">
                {sessions.map(session => (
                  <div key={session.id} className="session-card">
                    <h3>
                      {groups.find(g => g.id === session.groupId)?.name}
                    </h3>
                    <p>Topic: {session.topic}</p>
                    <p>Date: {new Date(session.startTime).toLocaleString()}</p>
                    <p>Score: {session.score.correct}/{session.score.total}</p>
                    <p>Status: {session.status}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>SmallGroupAssistant V0.1 | Build something great together</p>
      </footer>
    </div>
  )
}

export default App
