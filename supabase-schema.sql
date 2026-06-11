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
drop policy if exists "profiles: read same-tenant users" on public.profiles;
create policy "profiles: read same-tenant users"
  on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.has_role(auth.uid(), 'superuser')
    or exists (
      select 1
      from public.tenant_members my_m
      join public.tenant_members their_m
        on my_m.tenant_id = their_m.tenant_id
      where my_m.user_id = auth.uid()
        and their_m.user_id = profiles.id
    )
  );

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
  v_target_role text;
  v_admin_count int;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if not public.is_tenant_admin(p_tenant_id) then
    raise exception 'Only admins can change roles';
  end if;
  if p_role not in ('admin','member') then
    raise exception 'Invalid role';
  end if;

  select role into v_target_role
    from public.tenant_members
    where tenant_id = p_tenant_id and user_id = p_user_id;
  if v_target_role is null then
    raise exception 'User is not a member of this workspace';
  end if;

  -- Admins cannot modify another admin's role.
  if v_target_role = 'admin' and p_user_id <> v_uid then
    raise exception 'You cannot change another admin''s role';
  end if;

  -- Last admin cannot demote themselves.
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

-- ============ ITEM TASKS ============
create table if not exists public.item_tasks (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  title text not null default '',
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists item_tasks_item_id_idx on public.item_tasks(item_id);
create index if not exists item_tasks_user_id_idx on public.item_tasks(user_id);

grant select, insert, update, delete on public.item_tasks to authenticated;
grant all on public.item_tasks to service_role;

alter table public.item_tasks enable row level security;

drop policy if exists "item_tasks: members rw" on public.item_tasks;
create policy "item_tasks: members rw"
  on public.item_tasks for all to authenticated
  using (public.is_item_in_my_tenant(item_id))
  with check (public.is_item_in_my_tenant(item_id));

-- ============ DRAG & DROP SORT ORDER ============

-- Add sort_order to items
alter table public.items add column if not exists sort_order integer not null default 0;

-- Backfill items sort_order to match existing updated_at DESC order per tenant
-- (only runs when all values are still at the default 0, i.e. before any reordering)
do $$ begin
  if not exists (select 1 from public.items where sort_order > 0 limit 1) then
    with ranked as (
      select id, (row_number() over (partition by tenant_id order by updated_at desc) - 1)::integer as rn
      from public.items
    )
    update public.items set sort_order = ranked.rn from ranked where public.items.id = ranked.id;
  end if;
end $$;

-- Add sort_order to item_tasks
alter table public.item_tasks add column if not exists sort_order integer not null default 0;

-- Backfill item_tasks sort_order to match existing created_at ASC order per item
do $$ begin
  if not exists (select 1 from public.item_tasks where sort_order > 0 limit 1) then
    with ranked as (
      select id, (row_number() over (partition by item_id order by created_at asc) - 1)::integer as rn
      from public.item_tasks
    )
    update public.item_tasks set sort_order = ranked.rn from ranked where public.item_tasks.id = ranked.id;
  end if;
end $$;


-- ============ FOLDERS (nested) ============
create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  parent_id uuid references public.folders(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists folders_tenant_id_idx on public.folders(tenant_id);
create index if not exists folders_parent_id_idx on public.folders(parent_id);

grant select, insert, update, delete on public.folders to authenticated;
grant all on public.folders to service_role;

alter table public.folders enable row level security;

drop policy if exists "folders: members rw" on public.folders;
create policy "folders: members rw"
  on public.folders for all to authenticated
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

-- items.folder_id: null = uncategorized (root)
alter table public.items add column if not exists folder_id uuid
  references public.folders(id) on delete set null;

create index if not exists items_folder_id_idx on public.items(folder_id);


-- ============ FOLDER VISIBILITY ============
alter table public.folders add column if not exists restricted boolean not null default false;

create table if not exists public.folder_visibility (
  folder_id uuid not null references public.folders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (folder_id, user_id)
);

create index if not exists folder_visibility_folder_id_idx on public.folder_visibility(folder_id);

grant select, insert, update, delete on public.folder_visibility to authenticated;
grant all on public.folder_visibility to service_role;

alter table public.folder_visibility enable row level security;

create or replace function public.can_user_see_folder(p_folder_id uuid, p_user_id uuid)
returns boolean
language plpgsql stable security definer set search_path = public as $$
declare
  v_tenant_id uuid;
  v_cur uuid := p_folder_id;
  v_parent uuid;
  v_restricted boolean;
  v_allowed boolean;
  v_is_admin boolean;
  v_guard int := 0;
begin
  if p_folder_id is null then return true; end if;
  if p_user_id is null then return false; end if;
  select tenant_id into v_tenant_id from public.folders where id = p_folder_id;
  if v_tenant_id is null then return false; end if;
  select exists (
    select 1 from public.tenant_members
    where tenant_id = v_tenant_id and user_id = p_user_id and role = 'admin'
  ) into v_is_admin;
  if v_is_admin then return true; end if;
  while v_cur is not null and v_guard < 64 loop
    v_guard := v_guard + 1;
    select parent_id, restricted into v_parent, v_restricted
      from public.folders where id = v_cur;
    if v_restricted then
      select exists (
        select 1 from public.folder_visibility
        where folder_id = v_cur and user_id = p_user_id
      ) into v_allowed;
      return v_allowed;
    end if;
    v_cur := v_parent;
  end loop;
  return true;
end;
$$;

grant execute on function public.can_user_see_folder(uuid, uuid) to authenticated;

drop policy if exists "fv: members read" on public.folder_visibility;
create policy "fv: members read" on public.folder_visibility for select to authenticated
  using (
    exists (select 1 from public.folders f
      where f.id = folder_id and public.is_tenant_member(f.tenant_id))
  );

drop policy if exists "fv: admins write" on public.folder_visibility;
create policy "fv: admins write" on public.folder_visibility for all to authenticated
  using (
    exists (select 1 from public.folders f
      where f.id = folder_id and public.is_tenant_admin(f.tenant_id))
  )
  with check (
    exists (select 1 from public.folders f
      where f.id = folder_id and public.is_tenant_admin(f.tenant_id))
  );

-- Replace folders policies: SELECT filters by visibility; writes by any member
drop policy if exists "folders: members rw" on public.folders;
drop policy if exists "folders: read by visibility" on public.folders;
create policy "folders: read by visibility" on public.folders for select to authenticated
  using (public.is_tenant_member(tenant_id) and public.can_user_see_folder(id, auth.uid()));
drop policy if exists "folders: members insert" on public.folders;
create policy "folders: members insert" on public.folders for insert to authenticated
  with check (public.is_tenant_member(tenant_id));
drop policy if exists "folders: members update" on public.folders;
create policy "folders: members update" on public.folders for update to authenticated
  using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
drop policy if exists "folders: members delete" on public.folders;
create policy "folders: members delete" on public.folders for delete to authenticated
  using (public.is_tenant_member(tenant_id));

-- Update items: SELECT enforces folder visibility; writes by any member
drop policy if exists "items: members rw" on public.items;
drop policy if exists "items: read by visibility" on public.items;
create policy "items: read by visibility" on public.items for select to authenticated
  using (
    public.is_tenant_member(tenant_id)
    and (folder_id is null or public.can_user_see_folder(folder_id, auth.uid()))
  );
drop policy if exists "items: members insert" on public.items;
create policy "items: members insert" on public.items for insert to authenticated
  with check (public.is_tenant_member(tenant_id));
drop policy if exists "items: members update" on public.items;
create policy "items: members update" on public.items for update to authenticated
  using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
drop policy if exists "items: members delete" on public.items;
create policy "items: members delete" on public.items for delete to authenticated
  using (public.is_tenant_member(tenant_id));

-- ============ AUDIT LOG ============
create table if not exists public.audit_log (
  id bigserial primary key,
  tenant_id uuid references public.tenants(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  table_name text not null,
  record_id text,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  changes jsonb,
  row_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_tenant_idx on public.audit_log(tenant_id, created_at desc);
create index if not exists audit_log_actor_idx on public.audit_log(actor_id);

grant select on public.audit_log to authenticated;
grant all on public.audit_log to service_role;

alter table public.audit_log enable row level security;

drop policy if exists "audit_log: admins read" on public.audit_log;
create policy "audit_log: admins read"
  on public.audit_log for select to authenticated
  using (tenant_id is not null and public.is_tenant_admin(tenant_id));

create or replace function public.fn_audit_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_tenant uuid;
  v_record text;
  v_old jsonb;
  v_new jsonb;
  v_changes jsonb := '{}'::jsonb;
  v_key text;
begin
  if tg_op = 'DELETE' then
    v_old := to_jsonb(old); v_new := null;
  elsif tg_op = 'INSERT' then
    v_old := null; v_new := to_jsonb(new);
  else
    v_old := to_jsonb(old); v_new := to_jsonb(new);
  end if;

  if tg_table_name in ('items','folders','tenant_members') then
    v_tenant := coalesce((v_new->>'tenant_id')::uuid, (v_old->>'tenant_id')::uuid);
  elsif tg_table_name in ('item_tasks','item_entries','item_assignees') then
    select i.tenant_id into v_tenant from public.items i
      where i.id = coalesce((v_new->>'item_id')::uuid, (v_old->>'item_id')::uuid);
  elsif tg_table_name = 'folder_visibility' then
    select f.tenant_id into v_tenant from public.folders f
      where f.id = coalesce((v_new->>'folder_id')::uuid, (v_old->>'folder_id')::uuid);
  end if;

  if tg_op = 'UPDATE' then
    for v_key in select jsonb_object_keys(v_new) loop
      if v_key = 'updated_at' then continue; end if;
      if (v_new->v_key) is distinct from (v_old->v_key) then
        v_changes := v_changes || jsonb_build_object(v_key, jsonb_build_object('old', v_old->v_key, 'new', v_new->v_key));
      end if;
    end loop;
    if v_changes = '{}'::jsonb then return null; end if;
  end if;

  v_record := coalesce(v_new->>'id', v_old->>'id', v_new->>'item_id', v_old->>'item_id');

  insert into public.audit_log (tenant_id, actor_id, table_name, record_id, action, changes, row_data)
  values (v_tenant, auth.uid(), tg_table_name, v_record, tg_op,
          case when tg_op = 'UPDATE' then v_changes else null end,
          case when tg_op = 'INSERT' then v_new
               when tg_op = 'DELETE' then v_old
               else null end);
  return null;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['items','item_tasks','item_entries','item_assignees','folders','folder_visibility','tenant_members']
  loop
    execute format('drop trigger if exists trg_audit_%I on public.%I', t, t);
    execute format('create trigger trg_audit_%I after insert or update or delete on public.%I for each row execute function public.fn_audit_trigger()', t, t);
  end loop;
end $$;

create or replace function public.list_audit_log(p_tenant_id uuid, p_limit int default 200)
returns table (
  id bigint, created_at timestamptz, actor_id uuid, actor_name text, actor_email text,
  table_name text, record_id text, action text, changes jsonb, row_data jsonb
) language plpgsql stable security definer set search_path = public as $fn$
declare
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_is_member boolean;
  v_limit int := greatest(1, least(coalesce(p_limit, 200), 1000));
begin
  if v_uid is null then return; end if;
  v_is_admin := public.is_tenant_admin(p_tenant_id);
  v_is_member := public.is_tenant_member(p_tenant_id);
  if not v_is_member then return; end if;

  if v_is_admin then
    return query
      select a.id, a.created_at, a.actor_id, p.display_name, p.email,
             a.table_name, a.record_id, a.action, a.changes, a.row_data
      from public.audit_log a
      left join public.profiles p on p.id = a.actor_id
      where a.tenant_id = p_tenant_id
      order by a.created_at desc
      limit v_limit;
    return;
  end if;

  return query
    with src as (
      select a.* from public.audit_log a
      where a.tenant_id = p_tenant_id
      order by a.created_at desc
      limit 5000
    ),
    resolved as (
      select s.*,
        case
          when s.table_name = 'folders' then nullif(s.record_id,'')::uuid
          when s.table_name = 'items' then coalesce(
            (select i.folder_id from public.items i where i.id = nullif(s.record_id,'')::uuid),
            nullif(s.row_data->>'folder_id','')::uuid)
          when s.table_name in ('item_tasks','item_entries','item_assignees') then (
            select i.folder_id from public.items i
            where i.id = coalesce(
              nullif(s.row_data->>'item_id','')::uuid,
              (select t.item_id from public.item_tasks t where t.id = nullif(s.record_id,'')::uuid),
              (select e.item_id from public.item_entries e where e.id = nullif(s.record_id,'')::uuid)))
          when s.table_name = 'folder_visibility' then nullif(s.row_data->>'folder_id','')::uuid
          else null end as ctx_folder_id,
        case when s.table_name in ('tenant_members','folder_visibility','item_assignees')
          then nullif(s.row_data->>'user_id','')::uuid else null end as ctx_user_id
      from src s
    )
    select r.id, r.created_at, r.actor_id, p.display_name, p.email,
           r.table_name, r.record_id, r.action, r.changes, r.row_data
    from resolved r
    left join public.profiles p on p.id = r.actor_id
    where case r.table_name
      when 'tenant_members' then r.ctx_user_id = v_uid
      when 'folder_visibility' then r.ctx_user_id = v_uid
        or (r.ctx_folder_id is not null and public.can_user_see_folder(r.ctx_folder_id, v_uid))
      when 'item_assignees' then r.ctx_user_id = v_uid
        or (r.ctx_folder_id is not null and public.can_user_see_folder(r.ctx_folder_id, v_uid))
      when 'folders' then r.ctx_folder_id is not null and public.can_user_see_folder(r.ctx_folder_id, v_uid)
      when 'items' then r.ctx_folder_id is null or public.can_user_see_folder(r.ctx_folder_id, v_uid)
      when 'item_tasks' then r.ctx_folder_id is null or public.can_user_see_folder(r.ctx_folder_id, v_uid)
      when 'item_entries' then r.ctx_folder_id is null or public.can_user_see_folder(r.ctx_folder_id, v_uid)
      else false end
    order by r.created_at desc
    limit v_limit;
end;
$fn$;

grant execute on function public.list_audit_log(uuid, int) to authenticated;

-- ============================================================
-- Audit log retention (nightly prune via pg_cron)
-- ============================================================

create extension if not exists pg_cron;

create or replace function public.prune_audit_log(retention_days int default 365)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.audit_log
  where created_at < now() - (retention_days || ' days')::interval;
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.prune_audit_log(int) from public;
grant execute on function public.prune_audit_log(int) to service_role;

-- Schedule nightly at 03:15 UTC
select cron.schedule(
  'audit-log-prune',
  '15 3 * * *',
  $$select public.prune_audit_log(365);$$
);

-- ============================================================
-- Per-workspace savings goal (shared by all tenant members)
-- ============================================================
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

drop policy if exists "savings_goals: members read" on public.savings_goals;
create policy "savings_goals: members read"
  on public.savings_goals for select to authenticated
  using (public.is_tenant_member(tenant_id));

drop policy if exists "savings_goals: members write" on public.savings_goals;
create policy "savings_goals: members write"
  on public.savings_goals for all to authenticated
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.savings_goals;
    exception when duplicate_object then null;
    end;
  end if;
end$$;

-- ============================================================
-- Per-user last visited workspace (for cross-device login routing)
-- ============================================================
alter table public.profiles
  add column if not exists last_tenant_id uuid
    references public.tenants(id) on delete set null;


-- ============================================================
-- SUPERUSER ROLE (cross-workspace administrator)
-- ============================================================
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

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

drop policy if exists "user_roles: read own" on public.user_roles;
create policy "user_roles: read own"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_roles: superusers read all" on public.user_roles;
create policy "user_roles: superusers read all"
  on public.user_roles for select to authenticated
  using (public.has_role(auth.uid(), 'superuser'));

create or replace function public.is_tenant_member(p_tenant_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'superuser')
      or exists (
        select 1 from public.tenant_members
        where tenant_id = p_tenant_id and user_id = auth.uid()
      )
$$;

create or replace function public.is_tenant_admin(p_tenant_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'superuser')
      or exists (
        select 1 from public.tenant_members
        where tenant_id = p_tenant_id and user_id = auth.uid() and role = 'admin'
      )
$$;

create or replace function public.list_my_tenants()
returns table (id uuid, name text, join_code text, role text)
language sql stable security definer set search_path = public as $$
  select t.id,
         t.name,
         case
           when m.role = 'admin' then t.join_code
           when public.has_role(auth.uid(), 'superuser') then t.join_code
           else null
         end as join_code,
         coalesce(m.role,
                  case when public.has_role(auth.uid(), 'superuser')
                       then 'superuser' end) as role
  from public.tenants t
  left join public.tenant_members m
    on m.tenant_id = t.id and m.user_id = auth.uid()
  where m.user_id = auth.uid()
     or public.has_role(auth.uid(), 'superuser')
  order by t.created_at asc
$$;

create or replace function public.grant_superuser(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'superuser') then
    raise exception 'Only superusers can grant superuser';
  end if;
  insert into public.user_roles (user_id, role)
  values (p_user_id, 'superuser')
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

-- Bootstrap (run manually once):
-- insert into public.user_roles (user_id, role) values ('<your-auth-uid>', 'superuser');
