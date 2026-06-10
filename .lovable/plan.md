## Goal
Make currency selection remembered per user account (follows them across devices/browsers), instead of one shared localStorage value per browser.

## Changes

### 1. New table `public.user_settings`
Migration adds:
- `user_id uuid PK references auth.users(id) on delete cascade`
- `preferred_currency text not null default 'EUR'` (check constraint: EUR/USD/GBP/SEK/NOK)
- `updated_at timestamptz default now()`
- GRANTs to `authenticated` and `service_role`
- RLS: user can select/insert/update only their own row (`auth.uid() = user_id`)

### 2. Server functions (`src/lib/api/user-settings.functions.ts`)
- `getMySettings` — returns `{ preferred_currency }`, creating row on first read
- `updateMyCurrency({ currency })` — upserts the row
Both use `requireSupabaseAuth` middleware.

### 3. `src/lib/currency.tsx`
- Load initial currency via `useQuery(getMySettings)` once auth session is available; fall back to existing localStorage value while loading (avoids flicker), then to `"EUR"`.
- `setCurrency` updates local state immediately, mirrors to localStorage (cache for next load), and fires `updateMyCurrency` mutation.
- When user is not signed in (e.g. /auth pages), keep current localStorage-only behaviour.

### 4. No UI changes
The existing currency switcher continues to call `setCurrency`.

## Out of scope
- Per-tenant currency
- Currency history/audit
- Migration of existing localStorage values into the DB (they'll be used as the first-write seed naturally)
