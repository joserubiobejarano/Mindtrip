const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiOptions extends RequestInit {
  token?: string;
  method?: string;
  body?: any;
  headers?: HeadersInit;
}

export async function apiFetch(path: string, options: ApiOptions = {}): Promise<Response> {
  const { token, headers = {}, method, body, ...fetchOptions } = options;

  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authentication token if provided
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    method: method || fetchOptions.method || 'GET',
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : fetchOptions.body,
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

// Helper function to fetch trips
export async function fetchTrips(token?: string) {
  return apiJson<{ trips: any[] }>('/api/trips', { token });
}

