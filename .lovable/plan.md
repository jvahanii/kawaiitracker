The onboarding page (`src/routes/_authenticated.onboarding.tsx`) currently auto-redirects to `/app/$tenantId` as soon as `listMyTenants` returns any workspace. This prevents users who already have a workspace from ever reaching the Create / Join forms — the page flashes then jumps away.

Since the user wants to always be able to create another workspace from here, remove that redirect guard.

### Changes

1. **Remove the auto-redirect `useEffect`** in `src/routes/_authenticated.onboarding.tsx`.
2. **Remove `hasTenant` from the loader condition** (`showLoader`) so the forms are visible once `isLoading` is false, regardless of whether the user already has workspaces.
3. **Add a "Your workspaces" section** above the Create/Join cards when the user already has one or more tenants. Each workspace shows its name as a link to `/app/$tenantId`.
4. **Keep the Create and Join forms always rendered** below the workspace list (or in place if none exist).

This ensures the onboarding page is always accessible and functional, allowing multi-workspace creation without being bounced out.