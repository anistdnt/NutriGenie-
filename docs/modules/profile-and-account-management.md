# Profile and Account Management

Status: Implemented

## Scope

This module owns general user details, health profile data, avatar handling, recent saved plans on the profile screen, and destructive account deletion.

## Routes and Surfaces

- `/profile`
- `/api/profile`

## Key Files

- `src/app/(protected)/profile/page.tsx`
- `src/app/api/profile/route.ts`
- `src/lib/actions/health.actions.ts`
- `src/lib/validators/health.schema.ts`

## Current Behavior

- The profile screen fetches both user data and meal-plan data on load.
- General profile updates call `PATCH /api/profile` and currently support name and image changes.
- Avatar uploads are resized client-side and stored as a data URL in the user document.
- Health profile updates use a server action with Zod validation and support arrays for allergies, conditions, medications, restrictions, and goals.
- The profile screen shows a recent saved-plan list with quick deletion.
- Account deletion requires explicit email and `DELETE` confirmation and removes the user plus associated plans, chats, adapter accounts, and adapter sessions.

## Dependencies

- `User`, `MealPlan`, and `Chat` models
- `updateHealthProfile`
- profile API route
- toast provider
- NextAuth session update and sign-out flows

## Known Gaps

- Images are stored directly on the user document rather than in object storage.
- There is no password-management UI for credentials users.
- General profile changes are handled through an API route, while health-profile changes use server actions, so the module mixes mutation styles.
- There is no audit trail or soft-delete flow for destructive account removal.

## Update This File When

- profile fields or form behavior change
- avatar storage strategy changes
- account deletion behavior changes
