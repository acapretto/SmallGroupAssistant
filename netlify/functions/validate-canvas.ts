import { Handler } from '@netlify/functions'

interface ValidateRequest {
  token: string
  instanceUrl: string
}

interface CanvasUser {
  id: number
  name: string
  email: string
}

const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { token, instanceUrl } = JSON.parse(event.body || '{}') as ValidateRequest

    if (!token || !instanceUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing token or instanceUrl' }),
      }
    }

    // Call Canvas API (server-side, no CORS issues)
    const response = await fetch(`${instanceUrl}/api/v1/users/self`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid Canvas token or instance URL' }),
      }
    }

    const user = (await response.json()) as CanvasUser

    // Return user info (but NOT the token)
    // Token stays only in localStorage on client
    return {
      statusCode: 200,
      body: JSON.stringify({
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      }),
    }
  } catch (error) {
    console.error('Canvas validation error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to validate Canvas token' }),
    }
  }
}

export { handler }
