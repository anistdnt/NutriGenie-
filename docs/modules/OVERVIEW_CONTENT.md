# NutriGenie Module Documentation Index

Last reviewed: 2026-04-12

This folder groups the codebase into maintainable documentation modules. The goal is simple: after any future change, we update the module doc that owns the affected files, then update the architecture or status report only if the change crosses module boundaries or changes delivery status.

## Module List

- [Landing and App Shell](./landing-and-app-shell.md)
- [Auth and Access Control](./auth-and-access-control.md)
- [Onboarding and User Bootstrap](./onboarding-and-user-bootstrap.md)
- [Dashboard and Chat Workspace](./dashboard-and-chat-workspace.md)
- [Meal Plans and Analytics](./meal-plans-and-analytics.md)
- [Profile and Account Management](./profile-and-account-management.md)
- [AI Orchestration](./ai-orchestration.md)
- [Data and Persistence](./data-and-persistence.md)
- [Shared UI and Providers](./shared-ui-and-providers.md)

## Update Rules

1. Update the owning module doc whenever one of its mapped files changes.
2. Update `docs/ARCHITECTURE.md` when routing, provider composition, API flow, or model relationships change.
3. Update `docs/PROJECT_STATUS_REPORT.md` when module status, priority, or major risks change.

## Source Mapping

### Landing and App Shell

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/icon.png`
- `src/components/landing/ScrollReveal.tsx`

### Auth and Access Control

- `src/proxy.ts`
- `src/types/next-auth.d.ts`
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

### Onboarding and User Bootstrap

- `src/app/(protected)/layout.tsx`
- `src/app/(protected)/onboarding/page.tsx`
- `src/components/auth/OnboardingGuard.tsx`
- `src/lib/actions/user.actions.ts`
- `src/lib/validators/user.schema.ts`

### Dashboard and Chat Workspace

- `src/app/(protected)/dashboard/page.tsx`
- `src/components/chat/ChatWindow.tsx`
- `src/components/chat/MessageBubble.tsx`
- `src/components/chat/RecipeCard.tsx`

### Meal Plans and Analytics

- `src/app/(protected)/meal-plan/page.tsx`
- `src/app/api/meal-plan/route.ts`
- `src/app/api/meal-plan/[id]/route.ts`
- `src/components/chat/MealPlanCard.tsx`
- `src/components/dashboard/StatsOverview.tsx`
- `src/lib/actions/mealplan.actions.ts`

### Profile and Account Management

- `src/app/(protected)/profile/page.tsx`
- `src/app/api/profile/route.ts`
- `src/lib/actions/health.actions.ts`
- `src/lib/validators/health.schema.ts`

### AI Orchestration

- `src/app/api/chat/route.ts`
- `src/lib/ai/config.ts`

### Data and Persistence

- `src/lib/db/mongo.ts`
- `src/lib/db/mongoClient.ts`
- `src/lib/db/user.ts`
- `src/models/User.ts`
- `src/models/MealPlan.ts`
- `src/models/Chat.ts`
- `src/app/api/test-db/route.ts`
- `src/app/api/test-model/route.ts`

### Shared UI and Providers

- `src/components/layout/Navbar.tsx`
- `src/components/providers/SessionProvider.tsx`
- `src/components/providers/ToastProvider.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/lib/utils.ts`
- `next.config.ts`
