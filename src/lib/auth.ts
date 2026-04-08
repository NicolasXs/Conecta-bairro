const TOKEN_KEY = 'cnb_auth_token';

/** Returns the stored auth token, or null if unavailable (SSR-safe). */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Persists the auth token to localStorage. */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Removes the auth token from localStorage. */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Returns true if a token is currently stored. */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}
