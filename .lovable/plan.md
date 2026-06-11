## Goal

Replace the generic "This page didn't load" fallback with a clear, actionable message whenever the app is deployed without Supabase environment variables (the most common Vercel-deploy failure). Real runtime errors keep the existing generic fallback so we don't leak stack traces.

## What the user will see

When `EXT_SUPABASE_URL` / `EXT_SUPABASE_PUBLISHABLE_KEY` (and the `VITE_*` pair) are missing on the server, every request renders a dedicated page titled **"Backend not configured"** that lists exactly which environment variables are missing and where to set them (Vercel → Project → Settings → Environment Variables), with a "Retry" button. HTTP status `503`.

When env vars are present but something else fails during SSR, the existing generic "This page didn't load" page is kept (no info leak).

## Changes

1. **`src/lib/error-page.ts`** — add a second exported function `renderMissingEnvPage(missing: string[])` that returns a self-contained HTML page (same styling as the current one) listing the missing variables and the fix steps. Keep `renderErrorPage()` unchanged.

2. **`src/lib/env-check.ts`** (new, dependency-free) — export `getMissingSupabaseEnv(): string[]` that checks `process.env` for `EXT_SUPABASE_URL`, `EXT_SUPABASE_PUBLISHABLE_KEY`, `EXT_SUPABASE_SERVICE_ROLE_KEY`, and `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, returning the missing names.

3. **`src/server.ts`** — at the top of `fetch`, before dispatching, call `getMissingSupabaseEnv()`. If non-empty, short-circuit with `renderMissingEnvPage(missing)` at status `503`. Otherwise behave exactly as today (lazy import handler, try/catch, normalize h3 500s).

4. **`src/routes/api/public/supabase-config.ts`** — keep the JSON 500 response but include the list of missing variable names so the client surface matches the SSR page.

## Out of scope

- No changes to Supabase client code, routes, or auth flow.
- No new dependencies.
- Does not fix the underlying deploy — the user still needs to set the env vars on Vercel. This change just makes the failure self-explanatory instead of a blank "didn't load" screen.

## Files touched

- edit `src/server.ts`
- edit `src/lib/error-page.ts`
- create `src/lib/env-check.ts`
- edit `src/routes/api/public/supabase-config.ts`
