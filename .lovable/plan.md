## Goal

When the signed-in user is a superuser, the Users page (`/members/$tenantId`) gains a second section listing every user who is **not** in the current workspace. The superuser can: grant/revoke superuser, change that user's role in any workspace they belong to, and remove them from any workspace. The dedicated `/superusers` page goes away and the header's "Superuser" badge links to the Users page.

## UI changes — `src/routes/_authenticated.members.$tenantId.tsx`

1. Detect superuser via `isSuperuser` server fn (already exists). Only fetch the extra data when `is === true`.
2. Fetch `listAllWorkspaceUsers` and filter out anyone whose `tenants[]` includes the current `tenantId` — those already appear in the existing members list above.
3. Render a new section below the current members list: **"Other users" / "Muut käyttäjät"**. Each row shows:
   - Display name + email
   - "Superuser" badge if applicable
   - List of workspace chips: `{name} · {role}` with a role `<select>` (admin/member) and a small "Remove" button per chip
   - A right-side "Grant superuser" / "Revoke" button
4. Self-row safety: hide the revoke action when revoking would leave zero superusers (reuse existing `cannotRevokeLast` logic).
5. Empty state: "No other users." / "Ei muita käyttäjiä."
6. Non-superusers see no change to the page.

## Header badge — `src/routes/_authenticated.app.$tenantId.tsx`

Change the `Superuser` badge `<Link>` target from `/superusers` to `/members/$tenantId` (current tenant). The badge already only renders for superusers.

## Server functions — `src/lib/api/superusers.functions.ts`

Add two superuser-only server fns (RPC-backed, mirroring existing `grant_superuser` pattern; admin client used to bypass per-tenant RLS after verifying caller is a superuser):

- `superuserUpdateMemberRole({ tenantId, userId, role })` — verify caller `has_role('superuser')`, then update `tenant_members.role`. Reject demoting the last admin of that tenant.
- `superuserRemoveMember({ tenantId, userId })` — verify caller is superuser, then delete the row. Reject removing the last admin of that tenant; reject removing self via this path (use existing flow).

Both use `getSupabaseAdmin()` from `@/lib/supabase/admin.server` after the `has_role` check.

## Route removal

- Delete `src/routes/_authenticated.superusers.tsx`. The TanStack Router Vite plugin regenerates `routeTree.gen.ts`.
- Search for any remaining `<Link to="/superusers">` and remove/redirect (header badge is the known one; the in-page back link inside the deleted file goes away with the file).

## i18n keys to add (en + fi)

- `members.otherUsersTitle` — "Other users" / "Muut käyttäjät"
- `members.otherUsersBody` — short helper text for superusers
- `members.otherUsersEmpty` — empty state
- `members.removeFromWorkspace` — "Remove from workspace" / "Poista työtilasta"
- Reuse existing `superusers.grant`, `superusers.revoke`, `superusers.superuserBadge`, `superusers.cannotRevokeLast`.

## Out of scope

- No DB schema changes — relies on existing `has_role`, `list_all_workspace_users`, `grant_superuser`, `revoke_superuser` RPCs plus admin-client writes to `tenant_members`.
- No change to the regular admin flow on the existing members list.
