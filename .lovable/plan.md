## Problem

In `SavingsChart.tsx`, the goal amount input calls `saveGoal` on every keystroke. Each keystroke fires a separate mutation, and the rapid succession of identical "Saved" toasts gets visually collapsed by Sonner — so it looks like no toast appears.

The global `MutationCache.onSuccess` in `src/router.tsx` is wired correctly; the issue is the mutation firing pattern, not the toast logic.

## Fix

In `src/components/SavingsChart.tsx`:

1. Keep a local `goalDraft` state for the input value (initialized from `goalQ.data`).
2. Debounce the call to `upsertM.mutate` (~600ms after the user stops typing) so a single mutation fires per edit.
3. Keep the optimistic update behavior so the chart's goal line responds immediately.

Result: one mutation per edit → one "Saved" toast per goal change, visible to the user.

## Out of scope

- No changes to the global toast logic in `src/router.tsx`.
- No changes to other mutations.