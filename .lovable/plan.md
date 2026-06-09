## Goal
After login, send users to their last-used workspace instead of the onboarding/create page. Fall back to onboarding only when there is no remembered workspace or it's no longer accessible.

## Changes

1. **Track last workspace** in `src/routes/_authenticated.app.$tenantId.tsx`
   - In a `useEffect`, write `localStorage.setItem("lastTenantId", tenantId)` whenever the route mounts with a valid tenantId.

2. **Redirect on login** in `src/routes/login.tsx`
   - After successful `signInWithPassword`, read `localStorage.getItem("lastTenantId")`.
   - If present, navigate to `/app/$tenantId` with that id. Otherwise navigate to `/onboarding` (current behavior).
   - If that workspace turns out to be invalid, the `_authenticated.app.$tenantId` route's existing error/redirect handling kicks in (we'll ensure it routes back to `/onboarding` and clears the stale `lastTenantId`).

3. **Stale-id cleanup** in `src/routes/_authenticated.app.$tenantId.tsx`
   - When the tenant lookup fails (user no longer a member / tenant missing), remove `lastTenantId` from localStorage and redirect to `/onboarding`.

4. **Clear on sign-out** in `src/routes/__root.tsx` `SupabaseAuthSync`
   - On `SIGNED_OUT`, also `localStorage.removeItem("lastTenantId")` so a different user signing in on the same browser doesn't inherit it.

## Notes
- No backend changes; this is purely a client-side preference.
- Onboarding page stays as the fallback and remains directly reachable via `/onboarding` (per previous change, it always renders the create/join forms).
