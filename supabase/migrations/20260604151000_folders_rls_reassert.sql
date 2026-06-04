alter table public.folders enable row level security;

drop policy if exists "folders: members rw" on public.folders;
drop policy if exists "folders: read by visibility" on public.folders;
drop policy if exists "folders: members insert" on public.folders;
drop policy if exists "folders: members update" on public.folders;
drop policy if exists "folders: members delete" on public.folders;

create policy "folders: read by visibility"
  on public.folders for select to authenticated
  using (
    public.is_tenant_member(tenant_id)
    and public.can_user_see_folder(id, auth.uid())
  );

create policy "folders: members insert"
  on public.folders for insert to authenticated
  with check (public.is_tenant_member(tenant_id));

create policy "folders: members update"
  on public.folders for update to authenticated
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

create policy "folders: members delete"
  on public.folders for delete to authenticated
  using (public.is_tenant_member(tenant_id));
