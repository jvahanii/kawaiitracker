## Goal
Switch the app from the current Supabase project to yours by swapping credentials only. No code changes — the integration already reads custom env vars (`EXT_SUPABASE_*`).

## Why login is stuck
`ensureSupabase()` calls the server fn `getSupabaseConfig`, which throws if `EXT_SUPABASE_URL` / `EXT_SUPABASE_PUBLISHABLE_KEY` are missing or wrong. The login button stays on "Logging in…" because the client never initializes. Updating the secrets fixes it.

## Steps
1. Prompt you (secure form) to enter/update three secrets:
   - `EXT_SUPABASE_URL` — e.g. `https://<your-project-ref>.supabase.co`
   - `EXT_SUPABASE_PUBLISHABLE_KEY` — anon/publishable key from Supabase → Project Settings → API
   - `EXT_SUPABASE_SERVICE_ROLE_KEY` — service role key from the same page (server-only, never shipped to browser)
2. You apply the existing migrations from `supabase/migrations/` to your Supabase project (Dashboard → SQL editor, or `supabase db push` locally). This is required so tables, RLS, and triggers exist.
3. In your Supabase project, configure Auth:
   - Authentication → URL Configuration: set Site URL to `https://kawaiitracker.lovable.app` and add `https://id-preview--81d75f47-0994-4548-a216-bf2d97a3d0e8.lovable.app` to Redirect URLs.
   - Enable Email provider; enable Google if you want social sign-in.
4. Restart preview; verify login works in preview and production.

## Out of scope
- No code edits.
- Data is not migrated from the current Supabase to yours — you start with an empty database (plus whatever the migrations seed).