/**
 * API client for authentication endpoints
 * Task 03: Create auth API client for Python backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  token_type?: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface ApiError {
  error: string;
  detail?: string;
}

/**
 * Login user with email/username and password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for JWT-in-cookie flow
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: 'Failed to login',
    }));
    throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: 'Failed to logout',
    }));
    throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
  }
}

/**
 * Fetch current user from session
 */
export async function fetchCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for JWT-in-cookie flow
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    const errorData: ApiError = await response.json().catch(() => ({
      error: 'Failed to fetch user',
    }));
    throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

