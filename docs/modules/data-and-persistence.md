# Data and Persistence

Status: Implemented

## Scope

This module owns database connections, domain models, user lookup helpers, and diagnostic persistence endpoints.

## Key Files

- `src/lib/db/mongo.ts`
- `src/lib/db/mongoClient.ts`
- `src/lib/db/user.ts`
- `src/models/User.ts`
- `src/models/MealPlan.ts`
- `src/models/Chat.ts`
- `src/app/api/test-db/route.ts`
- `src/app/api/test-model/route.ts`

## Current Behavior

- `mongo.ts` caches the shared Mongoose connection and is used across product routes and server actions.
- `mongoClient.ts` provides the native MongoDB client promise required by the NextAuth adapter.
- `findUserByEmailInsensitive` and `getOrCreateUserByEmail` provide user bootstrap and tolerant email lookup behavior for most app flows.
- The `User` model stores account identity, onboarding fields, and extended health profile data.
- The `MealPlan` model stores user-owned meal plans with nested meal blocks and nutrient totals.
- The `Chat` model stores chat threads, messages, and tool call metadata.
- The profile deletion flow reaches into raw adapter collections to remove auth-related data tied to the user.

## Dependencies

- MongoDB
- Mongoose
- NextAuth adapter collections

## Known Gaps

- The credentials authorize path does not use the case-insensitive user helper.
- There is no migration framework, seed script, or backup/export strategy documented in the repo.
- Mixing Mongoose model writes with direct raw collection access is necessary here but should remain tightly controlled.
- The test routes are placeholders and do not provide production-grade health checks.

## Update This File When

- model schema changes
- connection strategy changes
- adapter collection cleanup logic changes
