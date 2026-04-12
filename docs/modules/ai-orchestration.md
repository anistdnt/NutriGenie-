# AI Orchestration

Status: Implemented beta

## Scope

This module owns the chat route, model configuration, health-context injection, tool routing, and chat-thread persistence behavior.

## Routes and Surfaces

- `/api/chat`

## Key Files

- `src/app/api/chat/route.ts`
- `src/lib/ai/config.ts`

## Current Behavior

- The chat route requires an authenticated session.
- Before calling the model, the route loads sanitized health context from the current user profile and appends it to the system prompt.
- Intent inference is regex-based and currently distinguishes between meal-plan requests and recipe requests.
- `generateText` is used with an OpenRouter-backed model.
- Two tools are exposed:
  - `generateMealPlan`
  - `getRecipeDetails`
- Chat threads are persisted in the `Chat` collection with both assistant text and tool metadata.
- `GET /api/chat` supports:
  - latest thread fetch
  - single-thread fetch
  - thread summary list
- `PATCH /api/chat` renames a thread title.

## Dependencies

- OpenRouter via `@ai-sdk/openai`
- AI SDK `generateText`
- `getHealthContext`
- `Chat` and `MealPlan` models
- auth session state

## Known Gaps

- The route is not streaming assistant output.
- Intent inference is heuristic and can miss ambiguous requests.
- The base prompt in `src/lib/ai/config.ts` still describes meal-plan support as a future capability, while the route already uses it.
- Tool execution and persistence are tightly coupled, especially for meal-plan generation.
- There is no explicit moderation, citation system, or escalation logic beyond prompt instructions.
- The model is fixed to one OpenRouter model string in code.

## Update This File When

- prompts, model choice, or tool behavior change
- thread lifecycle changes
- health-context injection rules change
