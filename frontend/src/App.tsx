import { useState, useEffect } from 'react'
import './App.css'
import AuthView from './views/AuthView'
import RosterManagementView from './views/RosterManagementView'
import GroupManagementView from './views/GroupManagementView'
import ResourceSharingView from './views/ResourceSharingView'
import DashboardView from './views/DashboardView'

type ViewMode = 'auth' | 'roster' | 'groups' | 'resources' | 'dashboard'

interface TeacherSession {
  id: string
  email: string
  name: string
  canvasToken?: string
  canvasInstanceUrl?: string
}

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('auth')
  const [teacher, setTeacher] = useState<TeacherSession | null>(null)
  const [selectedRosterId, setSelectedRosterId] = useState<string | null>(null)

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sga_teacher')
    if (saved) {
      try {
        setTeacher(JSON.parse(saved))
        setCurrentView('roster')
      } catch (e) {
        localStorage.removeItem('sga_teacher')
      }
    }
  }, [])

  const handleLogin = (session: TeacherSession) => {
    setTeacher(session)
    localStorage.setItem('sga_teacher', JSON.stringify(session))
    setCurrentView('roster')
  }

  const handleLogout = () => {
    setTeacher(null)
    localStorage.removeItem('sga_teacher')
    setCurrentView('auth')
  }

  if (!teacher) {
    return <AuthView onLogin={handleLogin} />
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>SmallGroupAssistant</h1>
          <p>Collaborative resource sharing for small group work</p>
        </div>
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${currentView === 'roster' ? 'active' : ''}`}
            onClick={() => setCurrentView('roster')}
          >
            📋 Rosters
          </button>
          <button
            className={`nav-tab ${currentView === 'groups' ? 'active' : ''}`}
            onClick={() => setCurrentView('groups')}
            disabled={!selectedRosterId}
          >
            👥 Groups
          </button>
          <button
            className={`nav-tab ${currentView === 'resources' ? 'active' : ''}`}
            onClick={() => setCurrentView('resources')}
          >
            📁 Share Resource
          </button>
          <button
            className={`nav-tab ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button className="nav-tab logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {currentView === 'roster' && (
          <RosterManagementView
            teacherId={teacher.id}
            onRosterSelect={setSelectedRosterId}
          />
        )}
        {currentView === 'groups' && selectedRosterId && (
          <GroupManagementView rosterId={selectedRosterId} teacherId={teacher.id} />
        )}
        {currentView === 'resources' && <ResourceSharingView teacherId={teacher.id} />}
        {currentView === 'dashboard' && (
          <DashboardView teacherId={teacher.id} />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>SmallGroupAssistant | Faster Planning. Better Materials. Less Late Nights.</p>
      </footer>
    </div>
  )
}

export default App
