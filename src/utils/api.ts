import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiOptions extends RequestInit {
  body?: any;
}

/**
 * Standardized API client for CampusBook Demo.
 * Handles Authorization headers and provides graceful error fallbacks.
 */
export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const { token } = useAuthStore.getState();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, config);
    
    // Handle 401/403 specifically for the demo
    if (response.status === 401 || response.status === 403) {
      console.warn(`Auth error on ${endpoint}: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    return { status: 'error', message: 'Network connection failed', data: {} };
  }
}
