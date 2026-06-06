import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { setToken, clearToken, setCurrentUser } from "../lib/auth";
import { apiRequest } from "../lib/api";

interface AuthResponse {
  token: string;
  user?: {
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
}

interface LoginVars {
  email: string;
  password: string;
}

interface RegisterVars {
  name: string;
  email: string;
  password: string;
  bairro: string;
  cep: string;
  cidade: string;
}

type RawAuthResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: AuthResponse["user"];
  data?: {
    token?: string;
    accessToken?: string;
    jwt?: string;
    user?: AuthResponse["user"];
  };
};

function normalizeAuthResponse(payload: RawAuthResponse): AuthResponse {
  const token =
    payload.token ||
    payload.accessToken ||
    payload.jwt ||
    payload.data?.token ||
    payload.data?.accessToken ||
    payload.data?.jwt;

  if (!token) {
    throw new Error("A API de autenticação não retornou um token.");
  }

  return {
    token,
    user: payload.user || payload.data?.user,
  };
}

async function loginFn(vars: LoginVars): Promise<AuthResponse> {
  const response = await apiRequest<RawAuthResponse>("/auth/login", {
    method: "POST",
    body: vars,
  });

  return normalizeAuthResponse(response);
}

async function registerFn(vars: RegisterVars): Promise<AuthResponse> {
  const response = await apiRequest<RawAuthResponse>("/auth/register", {
    method: "POST",
    body: vars,
  });

  return normalizeAuthResponse(response);
}

/** Mutation: log in with email + password. Sets token on success. */
export function useLoginMutation() {
  return useMutation({
    mutationFn: loginFn,
    onSuccess: (data) => {
      setToken(data.token);
      if (data.user) {
        setCurrentUser(data.user);
      }
    },
  });
}

/** Mutation: register with email + password. Sets token on success. */
export function useRegisterMutation() {
  return useMutation({
    mutationFn: registerFn,
    onSuccess: (data) => {
      setToken(data.token);
      if (data.user) {
        setCurrentUser(data.user);
      }
    },
  });
}

/** Imperative logout: clears token and navigates to /login. */
export function useLogout() {
  const router = useRouter();
  return function logout() {
    clearToken();
    router.navigate({ to: "/login" });
  };
}
