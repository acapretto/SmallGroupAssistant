import { useState } from 'react'
import '../styles/AuthView.css'

interface AuthViewProps {
  onLogin: (session: {
    id: string
    email: string
    name: string
    canvasToken?: string
    canvasInstanceUrl?: string
  }) => void
}

export default function AuthView({ onLogin }: AuthViewProps) {
  const [tab, setTab] = useState<'email' | 'canvas'>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [canvasToken, setCanvasToken] = useState('')
  const [canvasInstanceUrl, setCanvasInstanceUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email || !name) {
        setError('Please enter your email and name')
        return
      }

      // For now, create a simple session with email/name
      // In production, this would verify with a backend
      onLogin({
        id: `teacher_${Date.now()}`,
        email,
        name,
      })
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCanvasLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email || !canvasToken || !canvasInstanceUrl) {
        setError('Please fill in all Canvas fields')
        return
      }

      // Validate Canvas token by making a test API call
      const response = await fetch(
        `${canvasInstanceUrl}/api/v1/users/self`,
        {
          headers: { Authorization: `Bearer ${canvasToken}` },
        }
      )

      if (!response.ok) {
        setError('Invalid Canvas token or instance URL')
        return
      }

      const user = await response.json()

      onLogin({
        id: `teacher_${Date.now()}`,
        email,
        name: user.name || email,
        canvasToken, // Stored locally only
        canvasInstanceUrl,
      })
    } catch (err) {
      setError('Failed to connect to Canvas. Check your instance URL.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>SmallGroupAssistant</h1>
          <p>Collaborative resource sharing for small group work</p>
          <p className="tagline">Faster Planning. Better Materials. Less Late Nights.</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'email' ? 'active' : ''}`}
            onClick={() => setTab('email')}
          >
            📧 Email Login
          </button>
          <button
            className={`auth-tab ${tab === 'canvas' ? 'active' : ''}`}
            onClick={() => setTab('canvas')}
          >
            📚 Canvas Login
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {tab === 'email' && (
          <form onSubmit={handleEmailLogin} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <p className="help-text">
              ℹ️ Email login uses manual roster upload. To import from Canvas, use Canvas Login.
            </p>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {tab === 'canvas' && (
          <form onSubmit={handleCanvasLogin} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Canvas Instance URL</label>
              <input
                type="text"
                placeholder="https://canvas.instructure.com"
                value={canvasInstanceUrl}
                onChange={(e) => setCanvasInstanceUrl(e.target.value)}
                disabled={loading}
              />
              <span className="form-help">
                Your Canvas domain (e.g., canvas.example.edu)
              </span>
            </div>
            <div className="form-group">
              <label>Canvas API Token</label>
              <input
                type="password"
                placeholder="Your Canvas API token"
                value={canvasToken}
                onChange={(e) => setCanvasToken(e.target.value)}
                disabled={loading}
              />
              <span className="form-help">
                🔒 Stored locally only. Never sent to our servers.{' '}
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Get your token →
                </a>
              </span>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Connecting to Canvas...' : 'Login with Canvas'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Your Canvas token is stored locally on your device only and never sent to our servers.
          </p>
        </div>
      </div>
    </div>
  )
}
