## Summary
Replace the back button on the Help page (`/help`) so it returns the user to the previous page in browser history instead of always navigating to `/`.

## Current behaviour
- The Help page header has a "Back" link hardcoded to `/`.
- This means a user coming from a workspace (`/app/$tenantId`) is sent to the landing page instead of back to the workspace.

## Proposed change
1. In `src/routes/help.tsx`, import `useRouter` from `@tanstack/react-router`.
2. Replace the `<Link to="/">` element with a `<button>` that calls `router.history.back()` on click.
3. Keep the existing `kawaii-button-soft text-sm` classes and `tr("common.back")` label so the styling and text remain identical.

No other files need to change.