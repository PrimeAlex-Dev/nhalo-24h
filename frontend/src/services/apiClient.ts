/**
 * Generic API Client wrapper around Fetch API
 * Directly handles request formatting, JSON parsing, and Spring Boot ErrorResponse handling
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const TOKEN_STORAGE_KEY = 'nhalo24h_access_token';
export const USER_STORAGE_KEY = 'nhalo24h_auth_user';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export function removeAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  errorCode?: string;
  message?: string;
  path?: string;
  details?: Array<{ field: string; message: string }>;
}

export class ApiError extends Error {
  status: number;
  errorCode?: string;
  details?: Array<{ field: string; message: string }>;

  constructor(status: number, message: string, errorCode?: string, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const token = getAuthToken();
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token && !requestHeaders['Authorization']) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: requestHeaders,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Lỗi kết nối mạng';
    throw new ApiError(0, `Không thể kết nối đến máy chủ (${errMessage}). Vui lòng kiểm tra xem backend đã được khởi chạy chưa.`);
  }

  // Handle No Content (204)
  if (response.status === 204) {
    return {} as T;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      removeAuthToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nhalo24h:unauthorized'));
      }
    }
    const errorData = data as ApiErrorResponse;
    const errorMessage = errorData?.message || `Yêu cầu thất bại với mã lỗi HTTP ${response.status}`;
    throw new ApiError(response.status, errorMessage, errorData?.errorCode, errorData?.details);
  }

  return data as T;
}
