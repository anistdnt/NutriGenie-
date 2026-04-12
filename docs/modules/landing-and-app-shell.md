# Landing and App Shell

Status: Implemented

## Scope

This module owns the public entry experience, root layout, global styling, and motion behavior that frame the rest of the product.

## Routes and Surfaces

- `/`
- root HTML metadata and icon configuration
- global CSS theme and motion primitives

## Key Files

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/landing/ScrollReveal.tsx`

## Current Behavior

- The root layout defines metadata, favicon assets, global fonts, and the global session and toast providers.
- The public landing page is a heavily branded marketing experience with large visual sections, animated motion, and CTA links into `/login` and `/dashboard`.
- `ScrollReveal` provides reusable intersection-observer-based entrance animations.
- `globals.css` defines the dark visual baseline plus the landing-page animation system.

## Dependencies

- `next/font/google`
- `lucide-react`
- `ToastProvider`
- `SessionProvider`

## Known Gaps

- The landing page markets advanced features such as wearable sync, biometric analysis, and broader ecosystem integrations that are not implemented elsewhere in the codebase.
- The public experience is visually rich, but there is no content-management path or documentation for keeping feature claims aligned with shipped functionality.

## Update This File When

- landing-page sections, CTA destinations, or brand messaging change
- root providers or layout composition change
- global theme, motion, or icon behavior changes
