# NutriGenie System Architecture

Last reviewed: 2026-04-12

## Overview

NutriGenie is a monolithic Next.js 16 application built on the App Router. Public pages, protected product pages, API routes, AI orchestration, authentication, and MongoDB persistence all live in the same codebase.

The system uses:

- Next.js App Router for routing and rendering
- React client components for interactive product surfaces
- NextAuth for session management and provider integration
- MongoDB for application data and auth adapter data
- Mongoose for domain models and native MongoDB client for the NextAuth adapter
- OpenRouter through the AI SDK for assistant responses and tool calls

## High-Level Architecture

```mermaid
graph TD
    User[Browser] --> App[Next.js 16 App Router]

    App --> Public[Public routes<br/>/]
    App --> AuthUI[Auth routes<br/>/login /register]
    App --> Protected[Protected routes<br/>/dashboard /profile /meal-plan /onboarding]
    App --> API[Route handlers<br/>/api/*]
    App --> Proxy[proxy.ts route guard]

    API --> NextAuth[NextAuth]
    API --> ChatAPI[/api/chat]
    API --> ProfileAPI[/api/profile]
    API --> MealAPI[/api/meal-plan]

    NextAuth --> Adapter[MongoDB Adapter]
    NextAuth --> SessionJWT[JWT session callbacks]

    ChatAPI --> OpenRouter[OpenRouter model]
    ChatAPI --> HealthContext[Health context lookup]
    ChatAPI --> ChatModel[Chat model]
    ChatAPI --> MealModel[MealPlan model]

    ProfileAPI --> UserModel[User model]
    ProfileAPI --> ChatModel
    ProfileAPI --> MealModel

    MealAPI --> MealModel

    Adapter --> Mongo[(MongoDB)]
    UserModel --> Mongo
    ChatModel --> Mongo
    MealModel --> Mongo
```

## Route Layout

### Public routes

- `/` is the public marketing landing page.

### Auth routes

- `/login`
- `/register`

### Protected routes

- `/dashboard`
- `/meal-plan`
- `/profile`
- `/onboarding`

### API routes

- `/api/auth/[...nextauth]`
- `/api/auth/signup`
- `/api/chat`
- `/api/profile`
- `/api/meal-plan`
- `/api/meal-plan/[id]`
- `/api/test-db`
- `/api/test-model`

## Rendering and Composition

- `src/app/layout.tsx` is the root layout. It defines metadata, global fonts, and wraps the tree in session and toast providers.
- `src/app/(auth)/layout.tsx` provides the auth-page visual shell.
- `src/app/(protected)/layout.tsx` adds the navbar, resolves the current user, creates the user record if needed, and computes onboarding completeness before rendering protected content.
- `src/components/auth/OnboardingGuard.tsx` performs client-side redirect enforcement between `/onboarding` and the rest of the protected area.

## Authentication Flow

1. The browser enters through `/login`, `/register`, or a protected page.
2. `src/proxy.ts` checks for a NextAuth token on selected routes and redirects unauthenticated users to `/login`.
3. `/api/auth/[...nextauth]` uses `authOptions` from `src/lib/auth/auth-options.ts`.
4. NextAuth supports:
   - Google OAuth
   - credentials login with Zod validation and bcrypt password comparison
5. Session data is stored with JWT strategy, while adapter collections are persisted in MongoDB.
6. Session callbacks enrich the session with user id, email, name, and a database-backed avatar fallback.

## Data Layer

### Connections

- `src/lib/db/mongo.ts` manages the shared Mongoose connection for app models.
- `src/lib/db/mongoClient.ts` manages the native MongoDB client required by the NextAuth adapter.

### Models

- `User`
  Stores account metadata, onboarding fields, health-profile fields, and avatar data.
- `MealPlan`
  Stores saved meal plans with meals, nutrients, and user ownership.
- `Chat`
  Stores chat threads, message history, tool call metadata, and timestamps.

### Helper functions

- `findUserByEmailInsensitive`
  Case-insensitive user lookup helper used by most product flows.
- `getOrCreateUserByEmail`
  Ensures a user document exists for an authenticated session.

## Chat and AI Flow

1. `ChatWindow` loads thread summaries from `GET /api/chat?threads=1`.
2. Opening a thread fetches persisted messages from `GET /api/chat?threadId=...`.
3. Sending a message posts the message history to `POST /api/chat`.
4. The chat route:
   - checks authentication
   - fetches sanitized health context from the user profile
   - composes the system prompt
   - infers whether the user wants a meal plan or recipe
   - calls the OpenRouter-backed model through `generateText`
   - optionally executes a tool
   - persists the assistant response and tool metadata into the `Chat` collection
5. Tool behaviors:
   - `generateMealPlan` returns a structured meal plan and also saves it to MongoDB
   - `getRecipeDetails` returns structured recipe data for UI rendering
6. The frontend renders plain chat text plus structured `MealPlanCard` or `RecipeCard` content when tool output is present.

## Profile and Meal Plan Flow

### Onboarding

1. A newly authenticated user lands in the protected layout.
2. The server checks whether `age`, `height`, and `gender` exist.
3. If not, `OnboardingGuard` redirects the user to `/onboarding`.
4. The onboarding form uses a server action to update the user document and then sends the user to `/dashboard`.

### Profile management

1. `/profile` fetches both `/api/profile` and `/api/meal-plan`.
2. General profile updates call `PATCH /api/profile`.
3. Health-profile updates use the `updateHealthProfile` server action.
4. Account deletion calls `DELETE /api/profile`, which removes the user document plus related meal plans, chats, adapter accounts, and adapter sessions.

### Meal-plan library

1. `/meal-plan` loads plans from `GET /api/meal-plan`.
2. Inline save actions call `POST /api/meal-plan`.
3. Delete actions call `DELETE /api/meal-plan/[id]`.
4. `StatsOverview` derives dashboard averages from the same saved meal-plan dataset.

## Current Architectural Constraints

- Credentials signup is not implemented yet even though the credentials login path is present.
- The base AI config prompt still says meal plans are a future capability, while the chat route already enables them.
- Meal-plan creation currently happens in two places:
  - inside the chat tool execution
  - from the explicit save button on `MealPlanCard`
- Root layout and protected layout both mount `SessionProvider`, which is redundant.
- Test routes exist but are placeholders rather than monitored operational probes.
- The landing page is more aspirational than the actual platform architecture.

## Environment Requirements

The current architecture depends on these runtime values:

- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OPENROUTER_API_KEY`

## Documentation Links

- Project status: [PROJECT_STATUS_REPORT.md](./PROJECT_STATUS_REPORT.md)
- Module index: [modules/README.md](./modules/README.md)
