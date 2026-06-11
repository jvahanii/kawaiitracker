# Fix Google Sign-In

## Problem

After picking a Google account the app lands on `/auth/callback` and shows **"Missing authorization code."** No user is created.

Root cause: `GoogleSignInButton` calls `supabase.auth.signInWithOAuth({ provider: "google" })` directly. In Lovable Cloud, Google OAuth must go through the **Lovable broker** (`lovable.auth.signInWithOAuth("google", ...)`). The broker doesn't return a PKCE `?code=` to our `/auth/callback`, so the callback's `params.get("code")` is always null — hence the error and no session.

Additionally, the Google provider must be enabled in Supabase Auth (the broker doesn't do that for us).

## Fix

1. **`src/components/GoogleSignInButton.tsx`** — replace the raw Supabase call with the Lovable broker:
   ```ts
   import { lovable } from "@/integrations/lovable";
   await lovable.auth.signInWithOAuth("google", {
     redirect_uri: window.location.origin,
   });
   ```
   Drop the `/auth/callback` redirect — the broker hands the session straight back to the origin and the supabase client persists it.

2. **Delete `src/routes/auth.callback.tsx`** — no longer reached by the broker flow. (If we keep a route for safety, make it just redirect home once a session is detected, but removing it is cleaner.)

3. **Enable Google in Supabase Auth** via `supabase--configure_social_auth` for the `google` provider, so the broker's token exchange actually succeeds server-side.

4. After sign-in, the existing root `onAuthStateChange` handler / `_authenticated` gate will route the user; if you want the "go to last tenant or onboarding" logic that lived in the callback, move it into a small effect on the landing route (e.g. `/` or `/app`) that runs once when a session is present.

## Verification

- Click "Continue with Google" → Google account picker → returns to app origin already signed in, redirected to last tenant or `/onboarding`. No "Missing authorization code" screen.
- New Google users appear in Lovable Cloud → Users.
