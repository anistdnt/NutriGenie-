# NutriGenie

NutriGenie is a full-stack AI health and nutrition web application built with Next.js.
It helps users move from generic diet advice to personalized, practical, and trackable nutrition planning.

## What NutriGenie Does

NutriGenie combines secure user data, AI guidance, and meal planning tools into one platform.

Core user flow:
1. User signs up or logs in.
2. User completes health profile data (goals, preferences, basic health context).
3. User chats with AI coach "Dr. Genie" for guidance.
4. User receives personalized meal plans and recipe-oriented responses.
5. User reviews plans and profile in protected dashboard pages.

## Product Scope

NutriGenie currently includes:
1. Authentication with NextAuth (credentials + provider support in config).
2. Protected application routes (`/dashboard`, `/profile`, `/meal-plan`, `/onboarding`).
3. AI chat endpoint with tool-based behavior for meal plan and recipe flows.
4. MongoDB persistence for users, chats, and meal plans.
5. Health/profile-driven personalization context used by AI workflows.

## Feature Breakdown

### 1. Auth and Access Control
- NextAuth session management.
- JWT-based route protection through `proxy.ts`.
- Protected layouts and API authorization checks.

### 2. AI Chat and Nutrition Assistant
- Chat API (`/api/chat`) handles conversational nutrition support.
- Tool-driven responses for:
  - Meal plan generation.
  - Recipe details and structured nutrition outputs.
- Threaded chat history persistence in MongoDB.

### 3. Meal Planning and Profile Data
- Meal plan APIs and data models for daily planning and history.
- User profile APIs for account and health data retrieval.
- Health context is used to personalize AI responses.

### 4. Frontend Experience
- Next.js App Router with server-first rendering and client components where needed.
- Tailwind CSS v4 styling.
- Dashboard and auth flows designed for direct usability.

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Database: MongoDB + Mongoose
- Auth: NextAuth.js
- AI SDK: `ai`, `@ai-sdk/openai`, `@ai-sdk/react`
- Validation/Form: Zod + React Hook Form
- Styling: Tailwind CSS v4

## Project Structure

```text
src/
  app/
    (auth)/              public auth pages
    (protected)/         authenticated app pages
    api/                 route handlers (auth, chat, profile, meal plans)
  components/            UI and feature components
  lib/
    ai/                  AI config and prompts
    auth/                NextAuth options and auth helpers
    db/                  MongoDB/Mongoose connection utilities
    actions/             server actions and data operations
    validators/          Zod schemas
  models/                Mongoose models (User, Chat, MealPlan)
  proxy.ts               route access guard
```

## Environment Variables

Create `.env.local` from a local template and never commit real secrets:

```env
MONGODB_URI=<REQUIRED>
NEXTAUTH_SECRET=<REQUIRED>
NEXTAUTH_URL=<REQUIRED>
GOOGLE_CLIENT_ID=<REQUIRED>
GOOGLE_CLIENT_SECRET=<REQUIRED>
```

Important:
1. Do not put actual secret values in `README.md`.
2. Do not commit `.env.local`.
3. Rotate credentials immediately if any secret was ever exposed in git history.

For Vercel, set these in Project Settings for the correct environments (Production/Preview/Development).

## Run Locally

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Deployment Notes

NutriGenie is configured for server-side MongoDB and NextAuth usage:
1. Required runtime dependencies are in `package.json` (`mongoose`, `next-auth`).
2. Database/auth routes export `runtime = "nodejs"`.
3. Route protection uses `proxy.ts` (Next.js 16 convention).
4. Mongo DB connection code is server-only and uses connection caching.

## Documentation

- Architecture details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Project roadmap/status: [docs/PROJECT_STATUS_REPORT.md](docs/PROJECT_STATUS_REPORT.md)
