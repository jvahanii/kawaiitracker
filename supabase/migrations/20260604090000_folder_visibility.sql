alter table public.folders add column if not exists restricted boolean not null default false;

create table if not exists public.folder_visibility (
  folder_id uuid not null references public.folders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (folder_id, user_id)
);

grant select, insert, update, delete on public.folder_visibility to authenticated;
grant all on public.folder_visibility to service_role;

alter table public.folder_visibility enable row level security;

create unique index if not exists folder_visibility_folder_user_idx
  on public.folder_visibility(folder_id, user_id);
create index if not exists folder_visibility_folder_id_idx on public.folder_visibility(folder_id);
create index if not exists folder_visibility_user_id_idx on public.folder_visibility(user_id);

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

drop policy if exists "folders: members rw" on public.folders;
drop policy if exists "folders: read by visibility" on public.folders;
create policy "folders: read by visibility" on public.folders for select to authenticated
  using (public.is_tenant_member(tenant_id) and public.can_user_see_folder(id, auth.uid()));

drop policy if exists "folders: members insert" on public.folders;
create policy "folders: members insert" on public.folders for insert to authenticated
  with check (public.is_tenant_member(tenant_id));

drop policy if exists "folders: members update" on public.folders;
create policy "folders: members update" on public.folders for update to authenticated
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

drop policy if exists "folders: members delete" on public.folders;
create policy "folders: members delete" on public.folders for delete to authenticated
  using (public.is_tenant_member(tenant_id));

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
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

drop policy if exists "items: members delete" on public.items;
create policy "items: members delete" on public.items for delete to authenticated
  using (public.is_tenant_member(tenant_id));
