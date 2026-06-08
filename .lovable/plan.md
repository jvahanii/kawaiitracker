## Goal
Two independent fixes in one pass:
1. Production login on `kawaiitracker.lovable.app` is broken because the **Production** secret store is missing the Supabase env vars.
2. After login, `/onboarding` briefly flashes the "Create / Join workspace" form before redirecting users who already have a tenant.

## Step 1 — Production Supabase secrets
Trigger the secure secrets form for the **Production** environment and have the user paste values for:
- `EXT_SUPABASE_URL`
- `EXT_SUPABASE_PUBLISHABLE_KEY`
- `EXT_SUPABASE_SERVICE_ROLE_KEY`

Same values used for Preview (from Supabase → Project Settings → API). Then user clicks **Publish → Update** to redeploy production with the new env.

## Step 2 — Eliminate onboarding flash
Edit `src/routes/_authenticated.onboarding.tsx`:
- While `tenantsQ.isLoading` (or not yet `isFetched`), render a centered loading state instead of the Create/Join form.
- Only render the Create/Join form once the query has resolved AND `tenantsQ.data` is empty.
- Keep the existing `useEffect` redirect to `/app/$tenantId` for users who already have a tenant — but because we no longer render the form during loading, no flash is possible.

No changes to API, business logic, or styling beyond the loading state.

## Out of scope
- No schema changes, no auth flow changes.
- Not touching `login.tsx` — the redirect target stays `/onboarding`; onboarding itself handles the decision.

## Verification
- Preview: log in with an account that already has a tenant → should go straight to `/app/$tenantId` with a brief spinner, no Create/Join form flash.
- Production: after secrets + republish, hard-refresh `kawaiitracker.lovable.app` and log in successfully.
