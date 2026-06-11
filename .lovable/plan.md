## Problem

After Google's "authenticating… authenticated" handshake, the browser is redirected to `/?code=...&state=...` (the `redirectTo` we set in `GoogleSignInButton`). Two things then break the user:

1. **The PKCE code is never exchanged.** `src/lib/supabase/client.ts` initialises the Supabase client with `detectSessionInUrl: false`, so the `?code=...` sitting on the landing URL is never traded for a session. The user is, in fact, not signed in even though Google said they were.
2. **The landing route SSR runs against `/?code=...`.** Because there is no dedicated callback handler, the OAuth return hits an SSR'd public page that also re-renders during the next navigation, and the worker surfaces this as the generic "This page didn't load" error (matches the `h3 swallowed SSR error` symptom in the user's report). There is no `/auth/callback` route in the repo today — the bundler-level `tslib` work we already did is in place, but the OAuth flow has nowhere safe to land.

The user's prompt asks specifically: make the callback SSR-safe, wrap profile work in try/catch, ensure `tslib` is imported. The repo has no callback route, so we add one.

## Fix

### 1. New route: `src/routes/auth.callback.tsx`

- `ssr: false` — the PKCE exchange must run in the browser where `localStorage` and the code-verifier live; SSR'ing this route is what produces the swallowed 500.
- Top of file: `import "tslib";` for parity with the other Supabase entry points already importing it.
- Component:
  - Reads `code` / `error` / `error_description` from `window.location.search` inside a `useEffect`.
  - If `error` is present → show a friendly message + "Back to login" link, do not throw.
  - If `code` is present → `await supabase.auth.exchangeCodeForSession(code)` inside a strict `try / catch`.
  - On success: best-effort `ensureProfile()` call (see step 2) wrapped in its own `try / catch` so a profile failure NEVER blocks navigation; then navigate to the user's last tenant (`getLastTenantId`) or `/onboarding`.
  - On failure: render an inline error card with the Supabase error message and a "Try again" link to `/login`. No throws escape to the route boundary.
- Render a small "Signing you in…" spinner while the exchange is in flight so the user sees progress instead of a blank flash.

### 2. Idempotent profile bootstrap (optional, defensive)

If a `profiles` table is in play for Google users, add a tiny server fn `ensureProfile` (in `src/lib/api/profile.functions.ts`) using `requireSupabaseAuth` that upserts `{ id: userId, email }` and returns `{ ok: true }`. Wrap the call site in `try / catch` and only `console.error` on failure — callback must succeed even if the upsert errors. If no `profiles` table exists yet, skip this step entirely; the route still works.

### 3. Point Google at the new callback

In `src/components/GoogleSignInButton.tsx` change:

```ts
options: { redirectTo: `${window.location.origin}/auth/callback` }
```

so the OAuth return lands on the dedicated handler instead of the SSR'd landing page.

### 4. Supabase Auth provider redirect URL

Add `https://kawaiitracker.lovable.app/auth/callback` and the preview origin's `/auth/callback` to the Supabase Auth "Additional Redirect URLs" list. (User-side action — flagged in the closing message; not a code change.)

### 5. Leave `detectSessionInUrl: false` as-is

Intentional — `src/routes/reset-password.tsx` already relies on exchanging its own PKCE code without a race. The new callback route does the same explicit exchange for OAuth.

## Files touched

- **add** `src/routes/auth.callback.tsx` — client-only PKCE exchange + safe profile bootstrap + navigation.
- **edit** `src/components/GoogleSignInButton.tsx` — redirect to `/auth/callback`.
- **add (optional)** `src/lib/api/profile.functions.ts` — only if a `profiles` table needs upserting; otherwise omit.

## Out of scope

- No change to `_authenticated.tsx`, `__root.tsx`'s `SupabaseAuthSync`, or the server entry / `tslib` plumbing — those are already correct.
- No change to email/password login, reset-password, or signup flows.
