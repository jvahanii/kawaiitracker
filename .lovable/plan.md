# Fix: Google sign-in lands on home page, no tenant created

## Root cause

After Google consent, Supabase Auth redirects to **Site URL** (`/`) instead of `/auth/callback`, because `${origin}/auth/callback` is not in the Auth "Redirect URLs" allow‑list. The code‑exchange + onboarding redirect in `src/routes/auth.callback.tsx` therefore never runs, so the new user has no tenant and the landing page (logged‑out view) renders.

## Changes

1. **Add allowed redirect URLs in Supabase Auth** (via `supabase--configure_social_auth` / auth config) for every origin the app runs on:
   - `https://kawaiitracker.lovable.app/auth/callback`
   - `https://id-preview--81d75f47-0994-4548-a216-bf2d97a3d0e8.lovable.app/auth/callback`
   - `http://localhost:*/auth/callback` (dev, if applicable)

2. **Safety net in `src/routes/index.tsx`**: on mount, if `window.location.search` contains `code=` or the hash contains `access_token=`, immediately `navigate({ to: "/auth/callback", search: …, hash: … })` preserving params. This way even a misconfigured Site URL still completes sign‑in instead of stranding the user.

3. **Verify** by signing in with a fresh Google account: should land on `/onboarding` with the user belonging to no tenant yet (expected), able to create or join one.

No changes to auth.callback logic, GoogleSignInButton, or tenants functions.
