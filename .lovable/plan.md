## Goal

Your database is missing pieces that already exist in `supabase-schema.sql` (committed but never applied). The `/superusers` page fails because `tenant_members`, the `app_role` enum, and `list_all_workspace_users()` aren't there. Plan is to ship one migration that brings the DB in line with the schema file — no new tables invented.

## Migration: `supabase/migrations/<ts>_superusers_backfill.sql`

Idempotent (`if not exists` / `do $$ ... duplicate_object`), safe to re-run. Mirrors `supabase-schema.sql` exactly.

1. **`public.tenants`** — table + grants (`select` to authenticated, `all` to service_role) + RLS enable.
2. **`public.tenant_members`** — table (`tenant_id`, `user_id`, `role` check `'admin'|'member'`, pk `(tenant_id,user_id)`) + grants + RLS enable.
3. **Tenant helpers** — `is_tenant_member(uuid)` and `is_tenant_admin(uuid)` security-definer functions + execute grants + RLS policies on `tenants` and `tenant_members` from the schema file.
4. **`profiles.last_tenant_id`** — `add column if not exists` referencing `tenants(id)`. (`display_name` already exists per schema.)
5. **`app_role` enum** — created in a `do $$ ... duplicate_object` block with value `'superuser'`. If the enum already exists without `'superuser'`, also run `alter type public.app_role add value if not exists 'superuser'` in its own statement (Postgres requires enum-add outside a transaction with other DDL, so this goes in a second migration file if needed — see Technical Notes).
6. **`public.user_roles`** — table + grants + RLS + `read own` and `superusers read all` policies.
7. **`has_role(uuid, app_role)`** — security-definer function + execute grant.
8. **Re-define `is_tenant_member` / `is_tenant_admin`** to the superuser-aware versions (lines 784–800 of schema).
9. **`list_all_workspace_users()`** — security-definer RPC returning `user_id, display_name, email, is_superuser, tenants jsonb`, gated by `has_role(auth.uid(),'superuser')`. Plus `grant_superuser`, `revoke_superuser`, `grant_superuser_by_email`, `list_superuser` RPCs that `superusers.functions.ts` already calls (verify which already exist; only add missing ones).

## Technical notes

- Postgres won't let `alter type ... add value` run in the same transaction as the type's creation if the type just got created. Solution: put enum creation in migration A, and anything that references the new label in migration B. If we know `app_role` is brand-new for your DB, the single-file approach works; otherwise split into two migration files (`..._enum.sql` then `..._rest.sql`).
- All `GRANT` statements are required (public-schema grants rule) — they're already in the schema file, the migration just replays them.
- No data changes; purely structural. Existing rows untouched.
- After the migration runs, the `/superusers` page should load without `42P01` or `22P02` errors.

## What I will NOT do

- Not create any table that isn't in `supabase-schema.sql`.
- Not touch `items`, `folders`, `audit_log`, etc. — confirmed present from earlier errors only referencing the tenant/role pieces.
- Not change app code; `superusers.functions.ts` already matches the schema's RPC signatures.

## Verification after apply

1. Reload `/superusers` — list should render.
2. Spot-check in SQL editor: `select * from public.tenant_members limit 1;` and `select public.has_role(auth.uid(),'superuser'::public.app_role);`.
