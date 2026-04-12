# Auth and Access Control

Status: Partial

## Scope

This module owns sign-in, session shaping, route protection, and auth-related validation.

## Routes and Surfaces

- `/login`
- `/register`
- `/api/auth/[...nextauth]`
- `/api/auth/signup`

## Key Files

- `src/proxy.ts`
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/signup/route.ts`
- `src/components/auth/AuthCard.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/RegisterForm.tsx`
- `src/components/auth/SocialAuth.tsx`
- `src/lib/auth/auth-options.ts`
- `src/lib/auth/requireAuth.ts`
- `src/lib/validators/auth.schema.ts`
- `src/types/next-auth.d.ts`

## Current Behavior

- NextAuth is configured with Google OAuth and credentials login.
- Credentials login validates input with Zod and compares passwords with bcrypt.
- Session callbacks enrich the session token with user id, email, name, and a database-backed image fallback.
- `src/proxy.ts` redirects unauthenticated visitors away from `/dashboard`, `/profile`, and `/meal-plan`, and redirects authenticated users away from `/login` and `/register`.
- The auth pages use a shared card layout plus optional Google sign-in.

## Dependencies

- NextAuth
- MongoDB adapter
- `User` model
- auth validators
- MongoDB and Mongoose connection helpers

## Known Gaps

- `src/app/api/auth/signup/route.ts` is still a stub, so credentials registration is not actually implemented.
- The register page assumes signup exists and therefore fails after form submission when it tries to log in a user that was never created.
- The credentials authorize logic uses direct `User.findOne({ email })` instead of the case-insensitive helper used in the rest of the app.
- There is no password reset, email verification, rate limiting, or login-attempt protection.

## Update This File When

- auth providers change
- signup behavior is implemented or redesigned
- route protection rules change
- session shape or auth validation changes
