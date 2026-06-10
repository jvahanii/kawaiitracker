## Goal
On the Users page (`/_authenticated/members/$tenantId`), let admins edit the email of members in their workspace, and let superusers edit the email of any user (including those in the "Other users" section).

## Backend — new server functions

In `src/lib/api/tenants.functions.ts`:

- `updateMemberEmail({ tenantId, userId, email })`
  - Auth: caller must be `admin` of `tenantId` (same check as `updateMemberName`).
  - Validate email with Zod, normalize lowercase.
  - Use `getSupabaseAdmin()` to:
    1. `admin.auth.admin.updateUserById(userId, { email, email_confirm: true })` — updates the auth login email without sending a confirmation email (admin-set, mirroring existing `setMemberPassword` UX).
    2. Update `profiles.email` to keep it in sync.
  - Handle the "email already in use" error from Auth and return a friendly message.

In `src/lib/api/superusers.functions.ts`:

- `superuserUpdateUserEmail({ userId, email })`
  - Auth: caller must be superuser (reuse the existing superuser guard used by `superuserUpdateMemberRole` / `grantSuperuserById`).
  - Same admin-side update as above; no tenant scoping.

Both return `{ ok: true }` on success or throw a readable error.

## Frontend — Users page

In `src/routes/_authenticated.members.$tenantId.tsx`:

1. Wire the new server fns with `useServerFn` + `useMutation`, invalidating `["members", tenantId]` and `["all-workspace-users"]`.
2. Members list (current workspace):
   - Add an "Edit email" affordance next to the existing email line, shown only when `isAdmin`.
   - Reuse the existing inline-edit pattern (like `editingId` / `editingName`): add `editingEmailId` + `editingEmail` state; on submit call `updateMemberEmail`.
   - Show toast on success/error; on "email already in use" show the server's error message.
3. Superuser "Other users" section:
   - Add an "Edit email" button per user that opens the same inline edit, calling `superuserUpdateUserEmail`.
   - For users who are also members of the current tenant, the workspace-admin edit applies; for users in the Other users list, the superuser fn applies.
4. i18n: add `members.editEmail`, `members.emailInUse`, `members.emailUpdated` to the existing translation files used on this page.

## Out of scope
- No email confirmation flow / "verify new email" round-trip — admin/superuser sets it directly, matching the existing `setMemberPassword` behavior.
- No self-service email change for non-admins.
- No schema changes.
