import { getToken } from "./auth";

const DEFAULT_API_ORIGIN = "https://conecta-bairro-api.vercel.app";
const API_PREFIX = "/api/v1";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiRequestOptions = Omit<RequestInit, "body" | "method"> & {
  method?: ApiMethod;
  body?: unknown;
};

type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: unknown;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, payload?: ApiErrorPayload) {
    super(payload?.message || "Erro ao comunicar com a API.");
    this.name = "ApiError";
    this.status = status;
    this.code = payload?.code;
    this.details = payload?.details;
  }
}

function normalizeApiBaseUrl(value?: string) {
  const raw = value?.trim() || DEFAULT_API_ORIGIN;
  const withoutTrailingSlash = raw.replace(/\/$/, "");

  if (withoutTrailingSlash.endsWith(API_PREFIX)) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}${API_PREFIX}`;
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined;

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method: options.method || "GET",
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as T | ApiErrorPayload)
    : null;

  if (!response.ok) {
    throw new ApiError(response.status, (payload as ApiErrorPayload | null) || undefined);
  }

  return payload as T;
}