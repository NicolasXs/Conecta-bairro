const TOKEN_KEY = "cnb_auth_token";
const USER_KEY = "cnb_auth_user";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  bairro?: string | null;
  cep?: string | null;
  cidade?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

/** Returns the stored auth token, or null if unavailable (SSR-safe). */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Persists the auth token to localStorage. */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Removes the auth token from localStorage. */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Returns true if a token is currently stored. */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/** Persists the authenticated user payload. */
export function setCurrentUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Returns the cached authenticated user payload. */
export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Gets the authenticated user id from cache or JWT payload. */
export function getAuthenticatedUserId(): string | null {
  const cached = getCurrentUser();
  if (cached?.id) return cached.id;

  const token = getToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const id = payload.id || payload.userId || payload.sub;
  return typeof id === "string" ? id : null;
}
