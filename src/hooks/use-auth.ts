// External API contract (assumed — to be confirmed with backend team):
// POST /auth/login    → body: { email, password }    → 200: { token: string, user: { id, email } }
// POST /auth/register → body: { email, password }    → 201: { token: string, user: { id, email } }
// 401 → wrong credentials / email taken
// 422 → validation error

import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { setToken, clearToken } from '../lib/auth';

const API_URL = import.meta.env.VITE_API_URL;

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

interface LoginVars {
  email: string;
  password: string;
}

interface RegisterVars {
  email: string;
  password: string;
}

async function loginFn(vars: LoginVars): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vars),
  });
  if (!res.ok) {
    const error = new Error('Login failed') as Error & { status: number };
    error.status = res.status;
    throw error;
  }
  return res.json();
}

async function registerFn(vars: RegisterVars): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vars),
  });
  if (!res.ok) {
    const error = new Error('Register failed') as Error & { status: number };
    error.status = res.status;
    throw error;
  }
  return res.json();
}

/** Mutation: log in with email + password. Sets token on success. */
export function useLoginMutation() {
  return useMutation({
    mutationFn: loginFn,
    onSuccess: (data) => {
      setToken(data.token);
    },
  });
}

/** Mutation: register with email + password. Sets token on success. */
export function useRegisterMutation() {
  return useMutation({
    mutationFn: registerFn,
    onSuccess: (data) => {
      setToken(data.token);
    },
  });
}

/** Imperative logout: clears token and navigates to /login. */
export function useLogout() {
  const router = useRouter();
  return function logout() {
    clearToken();
    router.navigate({ to: '/login' });
  };
}
