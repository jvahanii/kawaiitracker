## Plan

1. **Make the superuser badge clickable** — wrap the existing "Superuser" badge `<span>` in the app header with `<Link to="/superusers">` so it navigates to the superusers page.

2. **Remove the separate superusers navigation link** — delete the standalone "Superusers" `<Link>` that currently appears in the header next to the badge.

File to edit: `src/routes/_authenticated.app.$tenantId.tsx`