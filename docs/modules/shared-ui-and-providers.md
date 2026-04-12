# Shared UI and Providers

Status: Implemented

## Scope

This module owns cross-cutting UI infrastructure such as the navbar, session provider, toast provider, helper utilities, and shared primitive placeholders.

## Key Files

- `src/components/layout/Navbar.tsx`
- `src/components/providers/SessionProvider.tsx`
- `src/components/providers/ToastProvider.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/lib/utils.ts`
- `next.config.ts`

## Current Behavior

- `Navbar` provides the protected-app header, session-aware user menu, avatar handling, and sign-out entry point.
- `SessionProvider` wraps client components that need NextAuth session state.
- `ToastProvider` exposes global success and error toasts through a React context hook.
- `cn` wraps `clsx` and `tailwind-merge` for class composition.
- `next.config.ts` enables broad remote image patterns and configures Turbopack root resolution.

## Known Gaps

- `src/components/ui/Button.tsx` and `src/components/ui/Input.tsx` are empty placeholders and are not yet part of an actual shared design system.
- `SessionProvider` is mounted both in the root layout and again in the protected layout, which is redundant.
- Shared primitives are not consistently used across auth, profile, chat, and meal-plan surfaces yet.

## Update This File When

- provider composition changes
- navbar behavior changes
- shared primitive components are implemented or adopted
- framework config changes affect shared UI behavior
