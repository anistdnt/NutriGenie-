# Meal Plans and Analytics

Status: Implemented with caveats

## Scope

This module owns meal-plan persistence, saved-plan browsing, deletion flows, and the lightweight analytics surfaced on the dashboard.

## Routes and Surfaces

- `/meal-plan`
- `/api/meal-plan`
- `/api/meal-plan/[id]`
- dashboard stats sidebar
- inline meal-plan cards

## Key Files

- `src/app/(protected)/meal-plan/page.tsx`
- `src/app/api/meal-plan/route.ts`
- `src/app/api/meal-plan/[id]/route.ts`
- `src/components/chat/MealPlanCard.tsx`
- `src/components/dashboard/StatsOverview.tsx`
- `src/lib/actions/mealplan.actions.ts`

## Current Behavior

- Users can fetch all of their saved plans through `GET /api/meal-plan`.
- Users can save a plan through `POST /api/meal-plan`.
- Users can delete their own plans through `DELETE /api/meal-plan/[id]`.
- The meal-plan library page loads plans client-side, shows empty/loading states, and supports deletion.
- `MealPlanCard` normalizes partial payloads, computes fallback nutrient totals, and offers a save action.
- `StatsOverview` computes average calories, protein, carbs, fat, and total plan count from saved meal plans.
- Custom browser events keep dashboard, profile, and library UIs in sync after saves and deletes.

## Dependencies

- `MealPlan` model
- auth session
- toast provider
- router refresh flows

## Known Gaps

- The chat tool already saves generated meal plans to MongoDB, while `MealPlanCard` also exposes a manual save action. That can create duplicate plans.
- There is no edit or update flow for saved plans.
- The persistence API validates the title but does not enforce a full schema for meals and nutrient totals.
- Analytics are derived from saved plans only and do not represent real intake tracking or longer-term trends.

## Update This File When

- save or delete behavior changes
- analytics cards or derived metrics change
- meal-plan schema or route contracts change
