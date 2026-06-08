## Goal

Move the savings goal from `localStorage` to the database so it's shared across all members of a workspace and updates in all open windows in real time.

## Changes

### 1. Database (`supabase-schema.sql`)

Add a new `savings_goals` table, one row per `(tenant_id, year)`:

```sql
create table if not exists public.savings_goals (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  year int not null,
  amount numeric,
  goal_date date,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key (tenant_id, year)
);

grant select, insert, update, delete on public.savings_goals to authenticated;
grant all on public.savings_goals to service_role;

alter table public.savings_goals enable row level security;
```

RLS: members of the tenant can read and write (reuse existing `is_tenant_member(tenant_id, auth.uid())` helper, same pattern as `entries`/`items`).

Enable realtime:
```sql
alter publication supabase_realtime add table public.savings_goals;
```

### 2. Server functions (`src/lib/api/goals.functions.ts`, new)

- `getGoal({ tenantId, year })` → `{ amount, date }` (uses `requireSupabaseAuth`).
- `upsertGoal({ tenantId, year, amount, date })` → upserts row, returns updated value.

### 3. `SavingsChart.tsx`

- Replace `loadGoal`/`saveGoal` localStorage with `useQuery(['goal', tenantId, year], getGoal)` and a `useMutation` for `upsertGoal`.
- Inputs become controlled by query data; on change, call mutation and `queryClient.invalidate(['goal', tenantId, year])` on success.
- Add a Supabase realtime subscription on `savings_goals` filtered by `tenant_id=eq.<tenantId>` that invalidates the goal query, so other windows update instantly without refresh.

### 4. One-time migration note

Existing per-browser localStorage values won't be migrated automatically — each workspace just sets the goal once via the UI and it then syncs everywhere.

## Out of scope

- Per-user goals (this is per workspace, shared by all members).
- Historical audit log for goal edits (only `updated_at`/`updated_by` are tracked).

## What you'll need to do after

Re-run `supabase-schema.sql` in the Supabase SQL Editor to create the table, RLS, and realtime publication.
