# Dashboard and Chat Workspace

Status: Implemented

## Scope

This module owns the main protected workspace where the user chats with Dr. Genie and manages conversation threads.

## Routes and Surfaces

- `/dashboard`
- chat thread sidebar
- chat composer and message timeline

## Key Files

- `src/app/(protected)/dashboard/page.tsx`
- `src/components/chat/ChatWindow.tsx`
- `src/components/chat/MessageBubble.tsx`
- `src/components/chat/RecipeCard.tsx`

## Current Behavior

- The dashboard is a two-panel workspace with a resizable stats sidebar and a main chat area.
- The chat workspace can bootstrap the latest thread, load saved threads, start a new chat, and rename an existing thread.
- Chat messages are sent to `/api/chat` and rendered as regular assistant text plus structured tool output when available.
- Starter prompts help guide first-use behavior.
- The chat composer is disabled for unauthenticated users and supports multiline input with enter-to-send behavior.
- `MessageBubble` remains as a legacy component, but `ChatWindow` now renders messages directly.

## Dependencies

- `/api/chat`
- `MealPlanCard`
- `RecipeCard`
- `StatsOverview`
- `useSession`

## Known Gaps

- Responses are request/response based and not streamed.
- Thread management currently supports load and rename, but not delete, archive, pin, or search.
- Rich-text rendering is intentionally simple and only supports basic bold parsing and line breaks.
- Chat state is held in client memory for the active session; there is no optimistic reconciliation or offline support.

## Update This File When

- thread behavior changes
- chat rendering or composer behavior changes
- dashboard layout or panel composition changes
