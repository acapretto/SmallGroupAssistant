import { Handler } from '@netlify/functions'

interface EnrollmentsRequest {
  token: string
  instanceUrl: string
  courseId: string | number
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
    const { token, instanceUrl, courseId } = JSON.parse(event.body || '{}') as EnrollmentsRequest

    if (!token || !instanceUrl || !courseId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      }
    }

    const response = await fetch(
      `${instanceUrl}/api/v1/courses/${courseId}/enrollments?per_page=100`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!response.ok) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Failed to fetch enrollments' }),
      }
    }

    const enrollments = await response.json()
    return {
      statusCode: 200,
      body: JSON.stringify({ enrollments }),
    }
  } catch (error) {
    console.error('Canvas enrollments error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch enrollments' }),
    }
  }
}

export { handler }
