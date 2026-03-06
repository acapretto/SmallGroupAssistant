import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Validate Canvas token (server-side to avoid CORS)
app.post('/api/auth/validate-canvas', async (req, res) => {
  try {
    const { token, instanceUrl } = req.body

    if (!token || !instanceUrl) {
      return res.status(400).json({ error: 'Missing token or instanceUrl' })
    }

    // Call Canvas API (server-side, no CORS issues)
    const response = await fetch(`${instanceUrl}/api/v1/users/self`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid Canvas token or instance URL' })
    }

    const user = await response.json() as { id: number; name: string; email: string }

    // Return user info (but NOT the token)
    // Token stays only in localStorage on client
    res.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Canvas validation error:', error)
    res.status(500).json({ error: 'Failed to validate Canvas token' })
  }
})

// Get Canvas courses (if token is valid)
app.post('/api/canvas/courses', async (req, res) => {
  try {
    const { token, instanceUrl } = req.body

    if (!token || !instanceUrl) {
      return res.status(400).json({ error: 'Missing token or instanceUrl' })
    }

    const response = await fetch(`${instanceUrl}/api/v1/courses?state=available`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid Canvas token' })
    }

    const courses = await response.json()
    res.json({ courses })
  } catch (error) {
    console.error('Canvas courses error:', error)
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})

// Get Canvas course enrollments
app.post('/api/canvas/enrollments', async (req, res) => {
  try {
    const { token, instanceUrl, courseId } = req.body

    if (!token || !instanceUrl || !courseId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const response = await fetch(
      `${instanceUrl}/api/v1/courses/${courseId}/enrollments?per_page=100`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!response.ok) {
      return res.status(401).json({ error: 'Failed to fetch enrollments' })
    }

    const enrollments = await response.json()
    res.json({ enrollments })
  } catch (error) {
    console.error('Canvas enrollments error:', error)
    res.status(500).json({ error: 'Failed to fetch enrollments' })
  }
})

app.listen(PORT, () => {
  console.log(`✅ SmallGroupAssistant backend running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
})
