import { Handler } from '@netlify/functions'

interface CoursesRequest {
  token: string
  instanceUrl: string
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
    const { token, instanceUrl } = JSON.parse(event.body || '{}') as CoursesRequest

    if (!token || !instanceUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing token or instanceUrl' }),
      }
    }

    const response = await fetch(`${instanceUrl}/api/v1/courses?state=available`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid Canvas token' }),
      }
    }

    const courses = await response.json()
    return {
      statusCode: 200,
      body: JSON.stringify({ courses }),
    }
  } catch (error) {
    console.error('Canvas courses error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch courses' }),
    }
  }
}

export { handler }
