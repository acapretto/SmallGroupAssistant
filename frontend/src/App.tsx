import { useState, useEffect } from 'react'
import './App.css'

// Component imports
import TutorChat from './components/TutorChat'
import ExampleGenerator from './components/ExampleGenerator'
import ProblemSet from './components/ProblemSet'
import HintSystem from './components/HintSystem'
import SessionViewer from './components/SessionViewer'

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

type ViewMode = 'groups' | 'tutor' | 'examples' | 'problems' | 'hints' | 'sessions'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('groups')
  const [groups, setGroups] = useState<Group[]>([])
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
      {
        id: 'group-3',
        name: 'Pre-Calculus - Period 7',
        members: ['Grace', 'Henry', 'Ivy'],
        topic: 'Polynomial Functions',
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
    setViewMode('tutor')
  }

  const handleEndSession = () => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        status: 'completed' as const,
      }
      const updatedSessions = [...sessions, updatedSession]
      setSessions(updatedSessions)
      localStorage.setItem('smallgroup_sessions', JSON.stringify(updatedSessions))
      setCurrentSession(null)
      setViewMode('sessions')
    }
  }

  const currentTopic = currentSession?.topic || 'Quadratic Equations'
  const hasActiveSession = currentSession !== null

  return (
    <div className="app">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>Small Group Assistant</h1>
          <p>AI-powered math tutoring for collaborative learning</p>
        </div>
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${viewMode === 'groups' ? 'active' : ''}`}
            onClick={() => setViewMode('groups')}
          >
            Groups
          </button>
          <button
            className={`nav-tab ${viewMode === 'tutor' ? 'active' : ''}`}
            onClick={() => setViewMode('tutor')}
            disabled={!hasActiveSession}
          >
            Tutor Chat
          </button>
          <button
            className={`nav-tab ${viewMode === 'examples' ? 'active' : ''}`}
            onClick={() => setViewMode('examples')}
            disabled={!hasActiveSession}
          >
            Examples
          </button>
          <button
            className={`nav-tab ${viewMode === 'problems' ? 'active' : ''}`}
            onClick={() => setViewMode('problems')}
            disabled={!hasActiveSession}
          >
            Problems
          </button>
          <button
            className={`nav-tab ${viewMode === 'hints' ? 'active' : ''}`}
            onClick={() => setViewMode('hints')}
            disabled={!hasActiveSession}
          >
            Hints
          </button>
          <button
            className={`nav-tab ${viewMode === 'sessions' ? 'active' : ''}`}
            onClick={() => setViewMode('sessions')}
          >
            Sessions
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

        {/* Tutor Chat View */}
        {viewMode === 'tutor' && currentSession && (
          <section className="view tutor-view">
            <div className="tutor-header">
              <div>
                <h2>{groups.find(g => g.id === currentSession.groupId)?.name}</h2>
                <p className="topic-info">Topic: {currentSession.topic}</p>
              </div>
              <button className="btn-danger" onClick={handleEndSession}>
                End Session
              </button>
            </div>
            <div className="component-panel">
              <TutorChat
                groupId={currentSession.groupId}
                topic={currentSession.topic}
              />
            </div>
          </section>
        )}

        {/* Example Generator View */}
        {viewMode === 'examples' && hasActiveSession && (
          <section className="view">
            <div className="view-header">
              <h2>Worked Examples</h2>
              <p className="view-subtitle">Generate step-by-step examples for {currentTopic}</p>
            </div>
            <div className="component-panel">
              <ExampleGenerator
                topic={currentTopic}
                difficulty="intermediate"
              />
            </div>
          </section>
        )}

        {/* Problem Set View */}
        {viewMode === 'problems' && hasActiveSession && (
          <section className="view">
            <div className="view-header">
              <h2>Practice Problems</h2>
              <p className="view-subtitle">Test your understanding of {currentTopic}</p>
            </div>
            <div className="component-panel">
              <ProblemSet
                topic={currentTopic}
                count={3}
              />
            </div>
          </section>
        )}

        {/* Hint System View */}
        {viewMode === 'hints' && hasActiveSession && (
          <section className="view">
            <div className="view-header">
              <h2>Hint System</h2>
              <p className="view-subtitle">Get progressive hints when you are stuck</p>
            </div>
            <div className="component-panel">
              <HintSystem
                problemId="current"
                problemText={`Practice problem for ${currentTopic}`}
              />
            </div>
          </section>
        )}

        {/* Sessions View */}
        {viewMode === 'sessions' && (
          <section className="view sessions-view">
            <SessionViewer
              onSessionSelect={(sessionId) => {
                console.log('Selected session:', sessionId)
              }}
            />
          </section>
        )}

        {/* No active session messaging for disabled tabs */}
        {!hasActiveSession && ['tutor', 'examples', 'problems', 'hints'].includes(viewMode) && (
          <section className="view">
            <div className="empty-state">
              <h3>No Active Session</h3>
              <p>Start a tutoring session from the Groups tab to access this feature.</p>
              <button className="btn-primary" style={{ maxWidth: '300px', margin: '1rem auto' }} onClick={() => setViewMode('groups')}>
                Go to Groups
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Small Group Assistant v0.9 | AI-Powered Math Tutoring | Built with Claude</p>
      </footer>
    </div>
  )
}

export default App
