import { getToken } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function apiFetch(path: string, options: ApiOptions = {}): Promise<Response> {
  const { requireAuth = true, headers = {}, ...fetchOptions } = options;

  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authentication token if required
  if (requireAuth) {
    try {
      const token = await getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      // Continue without token, API will return 401 if auth is required
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  return response;
}

// Helper function for JSON responses
export async function apiJson<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await apiFetch(path, options);
  return response.json();
}

