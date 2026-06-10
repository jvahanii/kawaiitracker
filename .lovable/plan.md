# Make per-user currency persistence reliable

## What I verified

- The `preferred_currency` column exists, and the server calls work: your recent changes (NOK → USD → EUR) were all saved to the database. The DB currently holds **EUR** — your last selection.
- The published site (kawaiitracker.lovable.app) still runs **old code** (it stores currency in auth metadata, where your old "GBP" choice still lives). If you tested there, it will not work until you re-publish.

## Remaining bugs to fix

1. **Stale cache can revert your choice.** After saving a new currency, the cached "preferred currency" query still holds the old value. Any refetch or auth event can re-apply the stale value and visually flip the selector back.
2. **One-shot apply logic is fragile.** The provider applies the DB value only once per login; edge cases (empty value, refetches) can leave the UI out of sync with the database.
3. **Global cache invalidation fires too often.** The root auth listener invalidates all queries on every auth event, including the one that fires on every page load and on hourly token refreshes — causing needless refetches that interact badly with bug 1.

## Changes

**`src/lib/currency.tsx`**
- On save, immediately write the new value into the React Query cache (`setQueryData`) so refetches/remounts can never re-apply an old value.
- Treat the database as the source of truth: always reflect the loaded DB value (instead of the once-per-user flag), keep localStorage only as an instant pre-login fallback.

**`src/routes/__root.tsx`**
- Filter the auth listener to only react to real sign-in/sign-out/user-update events, ignoring page-load and token-refresh events.

## Verification

- Change currency, confirm the DB row updates, reload the preview and switch items/pages, confirm the choice sticks.

## After implementation

Re-publish the app so the live site (kawaiitracker.lovable.app) gets the new database-backed behavior — until then, the published site will keep using the old logic.