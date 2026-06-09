## Goal
Add a "superuser" role that automatically has access to every workspace and the same rights as a workspace admin everywhere. Per project rules, roles live in a separate `public.user_roles` table (never on `profiles`). Because every RLS policy and RPC in the app routes through `public.is_tenant_member(uuid)` and `public.is_tenant_admin(uuid)`, we extend those two helpers and the rest of the app inherits the access automatically.

## 1. Database migration (you run in Supabase SQL editor)

```sql
-- Role enum + table
do $$ begin
  create type public.app_role as enum ('superuser');
exception when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

-- Security-definer helper (no recursion)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- RLS: a user can see their own row; superusers can see all
create policy "user_roles: read own" on public.user_roles
  for select to authenticated using (user_id = auth.uid());
create policy "user_roles: superusers read all" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'superuser'));
-- No insert/update/delete policies — only the RPCs below can mutate.

-- Extend tenant gates with superuser bypass
create or replace function public.is_tenant_member(p_tenant_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'superuser')
      or exists (select 1 from public.tenant_members
                  where tenant_id = p_tenant_id and user_id = auth.uid())
$$;
create or replace function public.is_tenant_admin(p_tenant_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'superuser')
      or exists (select 1 from public.tenant_members
                  where tenant_id = p_tenant_id and user_id = auth.uid() and role = 'admin')
$$;

-- list_my_tenants: superusers see ALL tenants with role 'superuser'
create or replace function public.list_my_tenants()
returns table (id uuid, name text, join_code text, role text)
language sql stable security definer set search_path = public as $$
  select t.id, t.name, t.join_code,
         case when public.has_role(auth.uid(), 'superuser') and m.role is null
              then 'superuser' else m.role end as role
  from public.tenants t
  left join public.tenant_members m
    on m.tenant_id = t.id and m.user_id = auth.uid()
  where m.user_id = auth.uid()
     or public.has_role(auth.uid(), 'superuser')
  order by t.created_at asc
$$;

-- Manage superusers (callable only by an existing superuser)
create or replace function public.grant_superuser(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'superuser') then
    raise exception 'Only superusers can grant superuser';
  end if;
  insert into public.user_roles (user_id, role) values (p_user_id, 'superuser')
  on conflict do nothing;
end $$;

create or replace function public.revoke_superuser(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'superuser') then
    raise exception 'Only superusers can revoke superuser';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Refusing to revoke your own superuser role';
  end if;
  delete from public.user_roles where user_id = p_user_id and role = 'superuser';
end $$;

create or replace function public.list_superusers()
returns table (user_id uuid, display_name text, email text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select ur.user_id, p.display_name, p.email, ur.created_at
  from public.user_roles ur
  join public.profiles p on p.id = ur.user_id
  where ur.role = 'superuser'
    and public.has_role(auth.uid(), 'superuser')
  order by p.display_name
$$;

grant execute on function public.grant_superuser(uuid)  to authenticated;
grant execute on function public.revoke_superuser(uuid) to authenticated;
grant execute on function public.list_superusers()      to authenticated;
```

**Bootstrap the first superuser** (one-time, in the SQL editor):
```sql
insert into public.user_roles (user_id, role)
values ('<your-auth-uid>', 'superuser');
```

I'll also append the same SQL to `supabase-schema.sql` for repeatability.

## 2. Server functions
New file `src/lib/api/superusers.functions.ts`:
- `isSuperuser()` — `has_role(auth.uid(),'superuser')` via supabase RPC.
- `listSuperusers()` — wraps `list_superusers`.
- `grantSuperuserByEmail({ email })` — looks up user via admin (existing pattern in `addMemberByEmail`), then calls `grant_superuser`.
- `revokeSuperuser({ userId })` — wraps `revoke_superuser`.

Update `TenantSummary.role` type to `'admin' | 'member' | 'superuser'`.

## 3. UI changes
- `src/routes/_authenticated.app.$tenantId.tsx`: treat `role === 'superuser'` like admin everywhere (`isAdmin` flag, header buttons for join code / change history / manage users). Show a "Superuser" badge in the workspace switcher when the role is superuser. Show a "Superusers" link in the header for superusers only.
- `src/routes/_authenticated.members.$tenantId.tsx`: same admin-equivalence treatment for the action buttons.
- New route `src/routes/_authenticated.superusers.tsx`:
  - Loads `isSuperuser()`; if false, renders "Not authorized".
  - Lists current superusers with revoke button (disabled for self).
  - Form to add a superuser by email.
- `src/routes/_authenticated.onboarding.tsx`: no code change needed — `listMyTenants` now returns every workspace for superusers, so the "Your workspaces" list shows them all automatically.

## Notes
- No RLS recursion: `has_role` queries `user_roles`, not `tenant_members`, and is SECURITY DEFINER.
- No audit changes (per your choice).
- Superuser actions are audited under the existing audit pipeline because they go through the same RPCs/tables.
