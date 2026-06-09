# Supabase SQL — Superusers Page RPCs

Paste this into the Supabase SQL Editor of your external project. It is idempotent (safe to re-run). It assumes the schema already present in this project: `public.profiles(id, display_name, email)`, `public.user_roles(user_id, role app_role)`, `public.tenants(id, name)`, `public.tenant_members(tenant_id, user_id, role)`, and the `has_role(_user_id uuid, _role app_role)` helper. Adjust column names if yours differ.

## What this creates

RPCs called from `src/lib/api/superusers.functions.ts`:
- `list_superusers()` — rows shown in the Superusers list
- `list_all_workspace_users()` — every user with tenants + superuser flag
- `grant_superuser(p_user_id uuid)` — promote a user (superuser-only)
- `revoke_superuser(p_user_id uuid)` — demote (superuser-only, can't demote self if last)

It also ensures `'superuser'` exists on the `app_role` enum and that `has_role` is callable by `authenticated`.

## SQL

```sql
-- 1. Ensure 'superuser' value exists on the app_role enum
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'app_role' and e.enumlabel = 'superuser'
  ) then
    alter type public.app_role add value 'superuser';
  end if;
end $$;

-- 2. list_superusers()
create or replace function public.list_superusers()
returns table (
  user_id uuid,
  display_name text,
  email text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ur.user_id,
    coalesce(p.display_name, '') as display_name,
    coalesce(p.email, u.email)   as email,
    ur.created_at
  from public.user_roles ur
  left join public.profiles p on p.id = ur.user_id
  left join auth.users     u on u.id = ur.user_id
  where ur.role = 'superuser'
    and public.has_role(auth.uid(), 'superuser')
  order by ur.created_at desc;
$$;

-- 3. list_all_workspace_users()
create or replace function public.list_all_workspace_users()
returns table (
  user_id       uuid,
  display_name  text,
  email         text,
  is_superuser  boolean,
  tenants       jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    u.id as user_id,
    coalesce(p.display_name, '')          as display_name,
    coalesce(p.email, u.email, '')        as email,
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = u.id and ur.role = 'superuser'
    ) as is_superuser,
    coalesce(
      (
        select jsonb_agg(jsonb_build_object(
          'id',   t.id,
          'name', t.name,
          'role', tm.role
        ) order by t.name)
        from public.tenant_members tm
        join public.tenants t on t.id = tm.tenant_id
        where tm.user_id = u.id
      ),
      '[]'::jsonb
    ) as tenants
  from auth.users u
  left join public.profiles p on p.id = u.id
  where public.has_role(auth.uid(), 'superuser')
  order by coalesce(p.display_name, u.email);
$$;

-- 4. grant_superuser(p_user_id)
create or replace function public.grant_superuser(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'superuser') then
    raise exception 'Only superusers can grant superuser';
  end if;
  insert into public.user_roles (user_id, role)
  values (p_user_id, 'superuser')
  on conflict (user_id, role) do nothing;
end;
$$;

-- 5. revoke_superuser(p_user_id)
create or replace function public.revoke_superuser(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'superuser') then
    raise exception 'Only superusers can revoke superuser';
  end if;
  if p_user_id = auth.uid()
     and (select count(*) from public.user_roles where role = 'superuser') <= 1
  then
    raise exception 'Cannot remove the last remaining superuser';
  end if;
  delete from public.user_roles
   where user_id = p_user_id and role = 'superuser';
end;
$$;

-- 6. Grants so PostgREST can call them as the signed-in user
grant execute on function public.has_role(uuid, public.app_role)        to authenticated;
grant execute on function public.list_superusers()                      to authenticated;
grant execute on function public.list_all_workspace_users()             to authenticated;
grant execute on function public.grant_superuser(uuid)                  to authenticated;
grant execute on function public.revoke_superuser(uuid)                 to authenticated;
```

## Bootstrap your first superuser

Until at least one user has the `superuser` role, every RPC above returns empty / refuses. Run once, replacing the email:

```sql
insert into public.user_roles (user_id, role)
select id, 'superuser' from auth.users where email = 'you@example.com'
on conflict do nothing;
```

## After running

Reload `/superusers` — `list_all_workspace_users` should now resolve and the page will populate. If you get `column "..." does not exist`, your `profiles` / `tenant_members` columns differ from the assumed names; tell me which columns you actually have and I'll adjust.
