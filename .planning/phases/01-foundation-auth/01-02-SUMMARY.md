---
phase: 01-foundation-auth
plan: 02
subsystem: auth
tags: [react-query, tanstack-router, auth, localStorage]

requires:
  - phase: 01-01
    provides: TanStack Start scaffold, shadcn, React Query installed

provides:
  - Auth token utilities (getToken, setToken, clearToken, isAuthenticated) — SSR-safe
  - React Query mutations: useLoginMutation, useRegisterMutation
  - Logout hook: useLogout (clears token + navigate to /login)
  - QueryClientProvider wrapping the entire app from __root.tsx
  - Protected layout route _authenticated.tsx with beforeLoad redirect
  - Home page moved to _authenticated/ (protected)

affects: [03-auth-pages, all future phases using useLoginMutation/useRegisterMutation]

tech-stack:
  added: []
  patterns: [localStorage token persistence, TanStack Router beforeLoad guard, React Query mutations for auth]

key-files:
  created:
    - src/lib/auth.ts
    - src/hooks/use-auth.ts
    - src/routes/_authenticated.tsx
    - src/routes/_authenticated/index.tsx
    - src/routes/login.tsx (placeholder — full UI in plan 03)
    - .env
  modified:
    - src/routes/__root.tsx

key-decisions:
  - "Module-level QueryClient in __root.tsx — acceptable for SPA, avoids SSR hydration complexity in Phase 1"
  - "Login route /login created as placeholder to satisfy TypeScript route types before Plan 03 builds full UI"
  - "useLogout is imperative (not a mutation) — calls clearToken() then router.navigate"

patterns-established:
  - "SSR guard: typeof window === 'undefined' check in getToken() before localStorage access"
  - "Protected layout route: createFileRoute('/_authenticated') with beforeLoad + throw redirect"
  - "Auth hooks: useMutation with onSuccess calling setToken(data.token)"
---

## Wave 2 Summary

Auth infrastructure layer is complete. Token utilities are SSR-safe. React Query mutations for login/register are wired to `VITE_API_URL`. QueryClientProvider wraps the app. Home route is protected behind `_authenticated` layout route.

TypeScript compiles clean (0 errors). Route tree regenerated to include `/_authenticated`, `/_authenticated/`, and `/login`.
