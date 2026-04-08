---
phase: 01-foundation-auth
plan: 03
subsystem: auth
tags: [react-hook-form, zod, shadcn, tanstack-router, magic-ui]

requires:
  - phase: 01-02
    provides: useLoginMutation, useRegisterMutation, QueryClientProvider, protected routes

provides:
  - Login page at /login — AnimatedGridPattern bg, ShimmerButton CTA, RHF+Zod validation, PT-BR copy
  - Register page at /register — 3-field form with confirmPassword refine validation
  - Authenticated users redirected away from /login and /register
  - Form component (src/components/ui/form.tsx) manually created (radix-luma preset missing it)

affects: [all future phases that use auth pages, e2e flows]

tech-stack:
  added: [react-hook-form, zod, @hookform/resolvers, @radix-ui/react-slot]
  patterns: [Zod schema + zodResolver + useForm, FormField render prop, mutateAsync in try/catch for server errors]

key-files:
  created:
    - src/routes/login.tsx
    - src/routes/register.tsx
    - src/components/ui/form.tsx
  modified: []

key-decisions:
  - "Form component created manually — radix-luma shadcn preset does not include it in registry (returns No files)"
  - "Used @radix-ui/react-slot manually installed for Slot in form.tsx"
  - "Login uses mutateAsync in try/catch for granular server error handling (vs onError callback)"
  - "Register sends only email+password to API (not confirmPassword)"

patterns-established:
  - "Auth page layout: relative min-h-screen flex + AnimatedGridPattern absolute -z-10 + Card max-w-[400px]"
  - "Server error pattern: useState serverError + Alert variant=destructive rendered above form"
  - "Loading state: isPending → Loader2 spinner + disabled form fields"
  - "Zod .refine() for cross-field password confirmation validation"
---

## Wave 3 Summary

Login (/login) and Register (/register) pages are complete. Both pages:
- Use AnimatedGridPattern as full-page background (opacity-30, masked radial gradient)
- Render an auth card (max-w-[400px], shadow-lg, rounded-xl, bg-card teal)
- Use React Hook Form + Zod for client-side validation with PT-BR error messages
- Use ShimmerButton as the primary CTA with loading state (Loader2 spinner)
- Show server errors in destructive Alert above the form
- Redirect already-authenticated users to / via beforeLoad

TypeScript compiles clean (0 errors). Route tree includes /login and /register.
