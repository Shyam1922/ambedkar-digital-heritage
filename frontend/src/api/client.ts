import { getAuthToken, removeAuthToken } from './auth';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  /** Attach the stored admin bearer token, and clear it on a 401 response. */
  auth?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth, headers: optionHeaders, body, ...rest } = options;
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  const url = BASE_URL + cleanPath;

  const headers: Record<string, string> = { ...(optionHeaders as Record<string, string> | undefined) };

  // Let the browser set the multipart boundary itself for FormData bodies;
  // only declare JSON when we are actually sending a JSON string body.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && body !== null && !isFormData && !('Content-Type' in headers)) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...rest, body, headers });

  if (auth && response.status === 401) {
    // Token missing/expired/invalid — drop it so the UI can send the user back to login.
    removeAuthToken();
  }

  if (!response.ok) {
    let errorDetail = 'The archival server encountered an error.';
    let errorData = null;
    try {
      errorData = await response.json();
      if (typeof errorData?.detail === 'string') {
        errorDetail = errorData.detail;
      } else if (Array.isArray(errorData?.detail)) {
        errorDetail = errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      }
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new ApiError(errorDetail, response.status, errorData);
  }

  return response.json();
}
