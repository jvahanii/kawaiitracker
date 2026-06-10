## Issue

In `MonthlyEntries` (src/routes/_authenticated.app.$tenantId.tsx:973), the selected year is local component state initialised to the current year (`useState(new Date().getFullYear())`, line 1011). When the user clicks another item the component remounts, so any change like 2027 resets back to 2026.

## Fix

Persist the selected year so it survives item switches (and page reloads).

- Replace the `useState(new Date().getFullYear())` on line 1011 with a small persisted state hook backed by `localStorage` under a stable key, e.g. `keywi.monthlyEntries.year`.
- On mount: read the stored value, fall back to `new Date().getFullYear()` if missing or invalid.
- On `setYear`: write the new year to `localStorage` (guarded for SSR with `typeof window !== "undefined"`).
- No other behaviour changes — `months`, totals, and queries already derive from `year`, so they update automatically.

This makes the year a user-level preference shared across all items in the workspace, matching the request that 2027 stays selected when navigating to another item.

## Out of scope

- No backend / schema changes.
- No UI redesign of the year switcher.
- Not storing a different year per item (interpretation: user wants the chosen year to stick, not a separate year per item).
