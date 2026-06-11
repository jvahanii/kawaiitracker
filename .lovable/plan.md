## Goal

Show the "free user limit" toast immediately when the admin clicks **Add user** in the invite dialog, instead of waiting for the backend round-trip. Superusers continue to bypass the limit.

## Changes

**`src/routes/_authenticated.members.$tenantId.tsx`**

1. Add a local constant `FREE_MEMBER_LIMIT = 4` near the top of `MembersPage`.
2. In the invite form's `onSubmit` (around line 755), before calling `addM.mutate(...)`:
   - If `!isSuper && members.length >= FREE_MEMBER_LIMIT`, call `toast.error(t("members.freeLimitReached"))` and `return` — do not call the server function.
3. Disable the submit button when the same condition is true (visual reinforcement), keeping the existing `disabled` logic for pending/empty email.

No backend, i18n, or other UI changes — the server-side check in `addMemberByEmail` stays as a safety net.

## Notes

- `isSuper` already comes from `isSuperQ` and `members` from `membersQ`, so no new data fetching is needed.
- Behaviour for existing-member email (already a tenant member) is unaffected because that path is only reachable after the server call; the limit check uses current tenant member count, matching the backend rule.