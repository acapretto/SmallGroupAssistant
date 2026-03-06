/**
 * API Client Service
 * Handles all HTTP communication with the backend
 */

import {
  ExampleGeneratorRequest,
  ExampleGeneratorResponse,
  ApiResponse,
  ExampleGeneratorError,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return data;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred';

    return {
      success: false,
      error: {
        message,
        code: 'API_ERROR',
      },
    };
  }
}

/**
 * Generate a worked example
 */
export async function generateExample(
  request: ExampleGeneratorRequest
): Promise<ExampleGeneratorResponse | ExampleGeneratorError> {
  const response = await fetchApi<ExampleGeneratorResponse>('/examples', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  if (!response.success) {
    return {
      message: response.error?.message || 'Failed to generate example',
      code: (response.error?.code as ExampleGeneratorError['code']) || 'API_ERROR',
      details: response.error?.message,
    };
  }

  if (!response.data) {
    return {
      message: 'No data returned from API',
      code: 'API_ERROR',
    };
  }

  return response.data;
}

/**
 * Health check
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export default {
  generateExample,
  checkHealth,
};
