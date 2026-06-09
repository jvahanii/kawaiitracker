## Problem

The "Superuser" badge next to the user's name only appears when `currentTenant.role === 'superuser'`. That role string is returned by the `list_my_tenants()` SQL function, which uses:

```
coalesce(m.role, case when has_role(auth.uid(),'superuser') then 'superuser' end)
```

So if Pete is a superuser **and** an actual member of the workspace he's currently viewing, `m.role` wins and returns `'admin'` or `'member'`. The badge never shows on workspaces he's a member of — only on ones he isn't a member of. That's why you don't see it for Pete.

(Whether Pete is actually a superuser in the DB also needs verifying, but the badge logic is broken regardless.)

## Fix

Decouple the badge from the per-tenant role. Use the existing `isSuperuser()` server function (which calls `has_role(auth.uid(),'superuser')`) as the source of truth for the badge and the "Superusers" header link.

### Changes

1. **`src/routes/_authenticated.app.$tenantId.tsx`**
   - Add a `useQuery({ queryKey: ['is-superuser'], queryFn: isSuperuser })` near the existing tenant query.
   - Rename the local `isSuperuser` variable (currently `currentTenant?.role === 'superuser'`) to `isSuperuserHere` (kept only if still needed elsewhere) and introduce `isGlobalSuperuser = !!isSuperuserQ.data`.
   - Drive the badge (line ~325) and the "Superusers" header link (line ~362) off `isGlobalSuperuser`.
   - Keep `isAdmin = currentTenant?.role === 'admin' || isGlobalSuperuser` so admin powers still apply on member workspaces.

2. **Verify Pete in the DB** (no code change) — once switched to build mode I'll run:
   ```sql
   select u.email, ur.role
   from public.user_roles ur
   join auth.users u on u.id = ur.user_id
   where u.email ilike '%pete%';
   ```
   If Pete isn't in `user_roles` with role `'superuser'`, the badge will (correctly) still not show — in that case I'll ask which email to grant, or you can do it via the `/superusers` page from another superuser account.

No DB migration, no changes to `list_my_tenants` or `members`/`audit` pages (their admin checks already include `superuser` via `currentTenant.role`, and we'll keep that path working by also OR-ing the global flag where it matters — only `app.$tenantId.tsx` needs editing for the badge issue).
