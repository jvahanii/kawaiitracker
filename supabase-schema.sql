-- Run this in your Supabase SQL Editor.
-- Idempotent: safe to re-run.

-- ============ PROFILES ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email text,
  created_at timestamptz not null default now()
);

grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

drop policy if exists "profiles: read all authenticated" on public.profiles;
create policy "profiles: read all authenticated"
  on public.profiles for select to authenticated using (true);

drop policy if exists "profiles: update self" on public.profiles;
create policy "profiles: update self"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create profile on new auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ TENANTS ============
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

grant select on public.tenants to authenticated;
grant all on public.tenants to service_role;

alter table public.tenants enable row level security;

create table if not exists public.tenant_members (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','member')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

grant select, delete on public.tenant_members to authenticated;
grant all on public.tenant_members to service_role;

alter table public.tenant_members enable row level security;

-- Helper functions (SECURITY DEFINER so RLS doesn't recurse)
create or replace function public.is_tenant_member(p_tenant_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.tenant_members
    where tenant_id = p_tenant_id and user_id = auth.uid()
  )
$$;

create or replace function public.is_tenant_admin(p_tenant_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.tenant_members
    where tenant_id = p_tenant_id and user_id = auth.uid() and role = 'admin'
  )
$$;

grant execute on function public.is_tenant_member(uuid) to authenticated;
grant execute on function public.is_tenant_admin(uuid) to authenticated;

drop policy if exists "tenants: members can read" on public.tenants;
create policy "tenants: members can read"
  on public.tenants for select to authenticated
  using (public.is_tenant_member(id));

drop policy if exists "tenants: admins can update" on public.tenants;
create policy "tenants: admins can update"
  on public.tenants for update to authenticated
  using (public.is_tenant_admin(id)) with check (public.is_tenant_admin(id));

drop policy if exists "members: members can read same tenant" on public.tenant_members;
create policy "members: members can read same tenant"
  on public.tenant_members for select to authenticated
  using (public.is_tenant_member(tenant_id));

drop policy if exists "members: admins delete any, self can leave" on public.tenant_members;
create policy "members: admins delete any, self can leave"
  on public.tenant_members for delete to authenticated
  using (public.is_tenant_admin(tenant_id) or user_id = auth.uid());

-- ============ ITEMS ============
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  assignee_id uuid references auth.users(id) on delete set null,
  notes text not null default '',
  amount numeric,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_tenant_id_idx on public.items(tenant_id);

grant select, insert, update, delete on public.items to authenticated;
grant all on public.items to service_role;

alter table public.items enable row level security;

drop policy if exists "items: members rw" on public.items;
create policy "items: members rw"
  on public.items for all to authenticated
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- ============ ITEM ENTRIES ============
create table if not exists public.item_entries (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  month date not null,
  amount numeric,
  actual_amount numeric,
  updated_at timestamptz not null default now(),
  unique (item_id, month)
);

-- Migration: make amount/actual_amount nullable for existing installations
do $$ begin
  begin
    alter table public.item_entries alter column amount drop not null;
  exception when others then null; end;
  begin
    alter table public.item_entries alter column amount drop default;
  exception when others then null; end;
  begin
    alter table public.item_entries alter column actual_amount drop not null;
  exception when others then null; end;
  begin
    alter table public.item_entries alter column actual_amount drop default;
  exception when others then null; end;
end $$;

create index if not exists item_entries_item_id_idx on public.item_entries(item_id);

grant select, insert, update, delete on public.item_entries to authenticated;
grant all on public.item_entries to service_role;

alter table public.item_entries enable row level security;

create or replace function public.is_item_in_my_tenant(p_item_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.items i
    where i.id = p_item_id and public.is_tenant_member(i.tenant_id)
  )
$$;

grant execute on function public.is_item_in_my_tenant(uuid) to authenticated;

drop policy if exists "entries: members rw" on public.item_entries;
create policy "entries: members rw"
  on public.item_entries for all to authenticated
  using (public.is_item_in_my_tenant(item_id))
  with check (public.is_item_in_my_tenant(item_id));

-- ============ RPCS ============

-- Random short join code (8 chars, no ambiguous)
create or replace function public.generate_join_code()
returns text language plpgsql as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := '';
  i int;
begin
  for i in 1..8 loop
    code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return code;
end;
$$;

create or replace function public.create_tenant(p_name text)
returns table (id uuid, join_code text)
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_id uuid;
  v_attempts int := 0;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if length(trim(p_name)) = 0 then raise exception 'Name required'; end if;

  loop
    v_attempts := v_attempts + 1;
    v_code := public.generate_join_code();
    begin
      insert into public.tenants (name, join_code, created_by)
      values (trim(p_name), v_code, v_uid)
      returning tenants.id into v_id;
      exit;
    exception when unique_violation then
      if v_attempts > 6 then raise; end if;
    end;
  end loop;

  insert into public.tenant_members (tenant_id, user_id, role)
  values (v_id, v_uid, 'admin');

  return query select v_id, v_code;
end;
$$;

create or replace function public.join_tenant_by_code(p_code text)
returns table (id uuid, name text)
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_tenant public.tenants%rowtype;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select * into v_tenant from public.tenants where join_code = upper(trim(p_code));
  if not found then return; end if;

  insert into public.tenant_members (tenant_id, user_id, role)
  values (v_tenant.id, v_uid, 'member')
  on conflict (tenant_id, user_id) do nothing;

  return query select v_tenant.id, v_tenant.name;
end;
$$;

create or replace function public.list_my_tenants()
returns table (id uuid, name text, join_code text, role text)
language sql stable security definer set search_path = public as $$
  select t.id, t.name, t.join_code, m.role
  from public.tenants t
  join public.tenant_members m on m.tenant_id = t.id
  where m.user_id = auth.uid()
  order by t.created_at asc
$$;

create or replace function public.get_tenant_members(p_tenant_id uuid)
returns table (id uuid, display_name text, email text, role text)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.email, m.role
  from public.tenant_members m
  join public.profiles p on p.id = m.user_id
  where m.tenant_id = p_tenant_id
    and public.is_tenant_member(p_tenant_id)
  order by p.display_name asc
$$;

create or replace function public.update_member_role(
  p_tenant_id uuid, p_user_id uuid, p_role text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_admin_count int;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if not public.is_tenant_admin(p_tenant_id) then
    raise exception 'Only admins can change roles';
  end if;
  if p_role not in ('admin','member') then
    raise exception 'Invalid role';
  end if;
  if p_role = 'member' and p_user_id = v_uid then
    select count(*) into v_admin_count
      from public.tenant_members where tenant_id = p_tenant_id and role = 'admin';
    if v_admin_count <= 1 then raise exception 'Cannot remove the last admin'; end if;
  end if;
  update public.tenant_members
    set role = p_role
    where tenant_id = p_tenant_id and user_id = p_user_id;
end;
$$;

grant execute on function public.create_tenant(text) to authenticated;
grant execute on function public.join_tenant_by_code(text) to authenticated;
grant execute on function public.list_my_tenants() to authenticated;
grant execute on function public.get_tenant_members(uuid) to authenticated;
grant execute on function public.update_member_role(uuid, uuid, text) to authenticated;

-- ============ ITEM ASSIGNEES (multiple per item) ============
create table if not exists public.item_assignees (
  item_id uuid not null references public.items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (item_id, user_id)
);

create index if not exists item_assignees_user_id_idx on public.item_assignees(user_id);

grant select, insert, update, delete on public.item_assignees to authenticated;
grant all on public.item_assignees to service_role;

alter table public.item_assignees enable row level security;

drop policy if exists "item_assignees: members rw" on public.item_assignees;
create policy "item_assignees: members rw"
  on public.item_assignees for all to authenticated
  using (
    exists (
      select 1 from public.items i
      where i.id = item_id and public.is_tenant_member(i.tenant_id)
    )
  )
  with check (
    exists (
      select 1 from public.items i
      where i.id = item_id and public.is_tenant_member(i.tenant_id)
    )
  );

-- Backfill from legacy single assignee_id column (idempotent)
insert into public.item_assignees (item_id, user_id)
  select id, assignee_id from public.items where assignee_id is not null
  on conflict do nothing;

