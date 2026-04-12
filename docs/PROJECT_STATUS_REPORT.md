# NutriGenie Project Status Report

Last reviewed: 2026-04-12

This report is based on the current codebase in `src/` and the active documentation audit completed on the same date. It reflects implemented behavior, partial work, and known gaps instead of roadmap-only marketing claims.

## Executive Summary

NutriGenie already has a usable end-to-end core product:

- public landing page and branded app shell
- Google and credentials-based sign-in through NextAuth
- protected dashboard with chat workspace
- AI-assisted chat with meal-plan and recipe tool flows
- MongoDB persistence for users, chats, and meal plans
- onboarding and profile management flows
- meal-plan library, delete flows, and simple dashboard analytics

The project is not yet feature-complete in authentication and production hardening. The biggest functional gap is that credentials registration is not implemented even though the UI exists. The biggest product/docs mismatch is that the landing page advertises capabilities such as wearable sync and biometric analysis that are not implemented in the application.

## Status Snapshot

| Module | Status | Notes |
| --- | --- | --- |
| Landing and app shell | Implemented | Strong visual identity, responsive landing page, global styling and motion system are in place. |
| Authentication and access control | Partial | Sign-in works, but the signup API is still a stub so credentials registration is incomplete. |
| Onboarding | Implemented | First-run profile bootstrap and redirect guard are working. |
| Dashboard and chat workspace | Implemented | Thread list, rename flow, starter prompts, and non-streaming request/response chat are live. |
| AI orchestration | Implemented beta | OpenRouter-backed chat route with tool-based meal plan and recipe flows is live. |
| Meal plans and lightweight analytics | Implemented with caveats | Save, list, and delete work; analytics are client-derived from saved plans. |
| Profile and account management | Implemented | General profile, health profile, avatar upload, and account deletion are present. |
| Data and persistence | Implemented | MongoDB adapter, Mongoose models, and connection helpers are in place. |
| Testing and release hardening | Not started | No automated tests or deployment runbooks are present in the repo. |

## What Has Been Completed

- Established a Next.js 16 App Router application with public, auth, and protected route groups.
- Added global providers for session state and toast notifications.
- Wired NextAuth with Google provider, credentials provider, JWT session callbacks, and MongoDB adapter persistence.
- Added route protection with `src/proxy.ts` for key protected surfaces.
- Created persistent MongoDB models for `User`, `MealPlan`, and `Chat`.
- Implemented onboarding to collect baseline demographic and food-preference data.
- Built a protected dashboard composed of a chat workspace and stats sidebar.
- Implemented `/api/chat` with thread persistence, thread rename, and tool-driven meal plan/recipe responses.
- Implemented `/api/meal-plan` and `/api/meal-plan/[id]` for list, create, and delete operations.
- Added meal-plan UI surfaces for inline AI results, library browsing, and quick deletion.
- Added `/api/profile` for read, patch, and destructive account deletion behavior.
- Added a detailed profile page for general account data, health preferences, and recent meal plans.

## Partial Work and Known Gaps

- `src/app/api/auth/signup/route.ts` is a stub. The register page exists, but credentials signup does not create users yet.
- The credentials login flow queries `User.findOne({ email })` directly, so email-case differences may behave inconsistently compared with the case-insensitive helper used elsewhere.
- The AI meal-plan tool already persists a meal plan during chat generation, while `MealPlanCard` also exposes a manual save button. This can create duplicate saved plans.
- `/api/meal-plan` accepts broad payloads without a dedicated server-side schema for the full persisted shape.
- Analytics in `StatsOverview` are derived client-side from saved meal plans only. There is no separate analytics model or trend history.
- `src/components/ui/Button.tsx` and `src/components/ui/Input.tsx` are currently empty placeholders.
- `src/app/layout.tsx` and `src/app/(protected)/layout.tsx` both mount `SessionProvider`, which is redundant and should be simplified.
- `src/app/api/test-db/route.ts` and `src/app/api/test-model/route.ts` are diagnostic placeholders, not production-facing features.
- No automated test suite, seed flow, migration strategy, or deployment checklist is present in the repository.
- The landing page markets advanced integrations and biometric intelligence that are not backed by the implemented system.

## Recommended Next Priorities

1. Implement real credentials signup in `src/app/api/auth/signup/route.ts`, including password hashing and duplicate-user handling.
2. Decide on one meal-plan persistence path: auto-save during tool execution or explicit user-triggered save, then remove the duplicate path.
3. Add server-side validation for persisted meal-plan payloads and tighten API contracts.
4. Align landing-page claims with actual product capability or clearly label future features.
5. Add a basic test baseline for auth, chat, meal-plan, and profile routes.
6. Remove redundant provider nesting and clean up placeholder or unused files.

## Documentation Map

- System architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Module index and source mapping: [modules/README.md](./modules/README.md)
- Landing and shell: [modules/landing-and-app-shell.md](./modules/landing-and-app-shell.md)
- Authentication: [modules/auth-and-access-control.md](./modules/auth-and-access-control.md)
- Onboarding: [modules/onboarding-and-user-bootstrap.md](./modules/onboarding-and-user-bootstrap.md)
- Dashboard and chat: [modules/dashboard-and-chat-workspace.md](./modules/dashboard-and-chat-workspace.md)
- Meal plans and analytics: [modules/meal-plans-and-analytics.md](./modules/meal-plans-and-analytics.md)
- Profile and account management: [modules/profile-and-account-management.md](./modules/profile-and-account-management.md)
- AI orchestration: [modules/ai-orchestration.md](./modules/ai-orchestration.md)
- Data layer: [modules/data-and-persistence.md](./modules/data-and-persistence.md)
- Shared UI and providers: [modules/shared-ui-and-providers.md](./modules/shared-ui-and-providers.md)

## Documentation Update Workflow

After any future feature or refactor:

1. Update the relevant file in `docs/modules/`.
2. Update `docs/ARCHITECTURE.md` if routes, data flow, models, or provider composition changed.
3. Update this report if module status, known gaps, or delivery priorities changed.
