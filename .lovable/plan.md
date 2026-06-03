## What's happening

After `signInWithPassword` succeeds, `login.tsx` navigates to `/`. The home page's `useRedirectIfSignedIn` effect then calls `listMyTenants` and re-navigates to `/onboarding` or `/app/$tenantId`. Both destinations live under `_authenticated`, whose `beforeLoad` calls `supabase.auth.getUser()` — a network call to Supabase Auth — and on any miss throws `redirect({ to: "/login" })`.

Two problems combine to produce the bounce:

1. **Racy two-hop redirect.** `signInWithPassword` writes the session to memory + localStorage, then we hop `login → / → _authenticated/...`. The intermediate landing-page effect adds latency and a second navigation. If `auth.getUser()` (network) is slow or the session isn't yet readable by the next route's `beforeLoad` callback, the gate falls through to `redirect({ to: "/login" })`.
2. **`_authenticated.tsx` gate has no fallback.** It only trusts `getUser()` (network). If that call throws (cold network, brief Supabase blip, missing publishable key surface) the user is kicked out even though `getSession()` would have returned the freshly stored token.

## Fix

### 1. `src/routes/login.tsx`
On `onSuccess`, do the tenant lookup inline and navigate directly to the final destination — no landing-page hop.

```ts
onSuccess: async () => {
  try {
    const tenants = await listMyTenants();
    if (tenants.length === 0) {
      navigate({ to: "/onboarding" });
    } else {
      navigate({ to: "/app/$tenantId", params: { tenantId: tenants[0].id } });
    }
  } catch {
    navigate({ to: "/onboarding" }); // safe fallback under _authenticated
  }
},
```

### 2. `src/routes/_authenticated.tsx`
Trust the persisted session first; only treat both missing as unauthenticated.

```ts
beforeLoad: async () => {
  const supabase = tryGetSupabase();
  if (!supabase) throw redirect({ to: "/login" });

  // Fast path: session in localStorage (set by signInWithPassword)
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw redirect({ to: "/login" });

  // Verify against Auth server; tolerate transient errors by trusting the session.
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user ?? sessionData.session.user;
  if (!user) throw redirect({ to: "/login" });

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      displayName:
        (user.user_metadata?.display_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "",
    },
  };
},
```

### 3. `src/routes/index.tsx`
Remove `useRedirectIfSignedIn` entirely. The landing page should just render content; signed-in users land at the right place from login/signup directly. This also kills the `listMyTenants`-from-public-route call that can 401 during SSR-then-hydration.

### 4. `src/routes/signup.tsx`
Apply the same `onSuccess` pattern as login (navigate directly to `/onboarding` after sign-up succeeds; new users always have zero tenants so a `listMyTenants` call isn't needed).

## Why this fixes the bounce

- Login no longer relies on a second route's effect to redirect; it goes straight to a route the gate knows about.
- The `_authenticated` gate now treats `getSession()` (synchronous, local) as the source of truth and only falls back to a network call as a verification step — eliminating the "just-logged-in but kicked out" race.
- Public `/` no longer issues an authenticated server fn during SSR/hydration.

## Files touched

- `src/routes/login.tsx`
- `src/routes/signup.tsx`
- `src/routes/_authenticated.tsx`
- `src/routes/index.tsx`

No DB or env changes.
