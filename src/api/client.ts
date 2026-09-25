import { ApiResponse } from '../types';

const API_BASE_URL = '/api';

export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code: string = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('swipe_x_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set default JSON Content-Type if body is not FormData
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data: ApiResponse<T> = await res.json().catch(() => ({
      success: false,
      error: { code: 'PARSE_ERROR', message: 'Failed to parse JSON response from server' }
    }));

    if (!res.ok || !data.success) {
      const code = data.error?.code || `HTTP_${res.status}`;
      let msg = data.error?.message || `Request failed with status ${res.status}`;
      if (
        endpoint.includes('/auth/login') &&
        (msg.includes('is not valid JSON') || msg.includes('Unexpected token') || code === 'PARSE_ERROR')
      ) {
        msg = 'Invalid email or password';
      }
      throw new ApiError(msg, code, data.error?.details);
    }

    return data.data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network error, please check connection', 'NETWORK_ERROR');
  }
}
