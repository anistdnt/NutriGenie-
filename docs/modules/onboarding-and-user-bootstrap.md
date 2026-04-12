# Onboarding and User Bootstrap

Status: Implemented

## Scope

This module owns first-run user profile capture and the redirect rules that keep incomplete users inside the onboarding flow.

## Routes and Surfaces

- `/onboarding`
- protected layout bootstrap checks

## Key Files

- `src/app/(protected)/layout.tsx`
- `src/app/(protected)/onboarding/page.tsx`
- `src/components/auth/OnboardingGuard.tsx`
- `src/lib/actions/user.actions.ts`
- `src/lib/validators/user.schema.ts`

## Current Behavior

- The protected layout resolves the current session, creates the user record if needed, and computes whether the profile is complete.
- `OnboardingGuard` performs client-side redirects so incomplete users are sent to `/onboarding` and completed users are sent back to `/dashboard`.
- The onboarding form captures age, gender, height, food preference, and cuisine preference.
- Submission is handled through a server action that validates the payload, updates the current user document, and revalidates the dashboard path.

## Dependencies

- NextAuth session state
- `User` model
- `getOrCreateUserByEmail`
- `onboardingSchema`

## Known Gaps

- Profile completeness is currently determined by `age`, `height`, and `gender` only, even though the onboarding form also requires food and cuisine preferences.
- Redirect enforcement is client-side after the protected layout loads; there is no server-side middleware rule specifically for `/onboarding`.
- The broader profile flow is split between server actions and API routes, so the update pattern is not yet fully consistent.

## Update This File When

- onboarding fields or completion rules change
- the protected layout bootstrap logic changes
- first-run redirect behavior changes
