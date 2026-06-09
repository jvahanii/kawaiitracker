## Goal

Make monthly entry inputs (plan/actual per month, and the year-total editors) save the same way the goal amount does: live debounced save while typing, so each edit fires one mutation and shows one "Saved" toast — instead of only saving on blur.

## Changes

**File: `src/routes/_authenticated.app.$tenantId.tsx`**

1. `NumberInput` (used for each month's plan + actual cell):
   - Keep local `text` state, but additionally schedule `onCommit` ~600ms after the user stops typing (only if the parsed value differs from the current `value`).
   - Use a `useRef` timer; clear it on new keystrokes and on unmount.
   - On blur: flush immediately (clear timer + commit now if changed) so tabbing out still saves instantly.
   - Mirror the goal-input pattern from `SavingsChart.tsx` (focused ref + timer ref + `scheduleSave` helper).

2. `TotalEditor` (the "Planned:" / "Actual:" yearly totals): same treatment — debounce 600ms while typing, flush on blur.

No changes to the mutation itself — `upsertM` in `MonthlyEntries` already routes through the global `MutationCache` in `src/router.tsx`, so each committed mutation will surface one "Saved" toast automatically.

## Out of scope

- No changes to `entries.functions.ts`, `SavingsChart.tsx`, or the global toast wiring.
- No visual / layout changes to the monthly grid.
