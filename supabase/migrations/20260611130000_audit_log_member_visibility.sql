-- Extend list_audit_log to return rows visible to non-admin members,
-- filtered by folder visibility for items/tasks/entries/assignees/folders,
-- and to own rows for tenant_members/folder_visibility/item_assignees.

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
  if v_uid is null then
    return;
  end if;

  v_is_admin := public.is_tenant_admin(p_tenant_id);
  v_is_member := public.is_tenant_member(p_tenant_id);

  if not v_is_member then
    return;
  end if;

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

  -- Non-admin member: filter by visibility.
  return query
    with src as (
      select a.*
      from public.audit_log a
      where a.tenant_id = p_tenant_id
      order by a.created_at desc
      limit 5000
    ),
    resolved as (
      select
        s.*,
        case
          when s.table_name = 'folders' then nullif(s.record_id,'')::uuid
          when s.table_name = 'items' then coalesce(
            (select i.folder_id from public.items i where i.id = nullif(s.record_id,'')::uuid),
            nullif(s.row_data->>'folder_id','')::uuid
          )
          when s.table_name in ('item_tasks','item_entries','item_assignees') then (
            select i.folder_id from public.items i
            where i.id = coalesce(
              nullif(s.row_data->>'item_id','')::uuid,
              (select t.item_id from public.item_tasks t where t.id = nullif(s.record_id,'')::uuid),
              (select e.item_id from public.item_entries e where e.id = nullif(s.record_id,'')::uuid)
            )
          )
          when s.table_name = 'folder_visibility' then nullif(s.row_data->>'folder_id','')::uuid
          else null
        end as ctx_folder_id,
        case
          when s.table_name in ('tenant_members','folder_visibility','item_assignees')
            then nullif(s.row_data->>'user_id','')::uuid
          else null
        end as ctx_user_id
      from src s
    )
    select r.id, r.created_at, r.actor_id, p.display_name, p.email,
           r.table_name, r.record_id, r.action, r.changes, r.row_data
    from resolved r
    left join public.profiles p on p.id = r.actor_id
    where
      case r.table_name
        when 'tenant_members' then r.ctx_user_id = v_uid
        when 'folder_visibility' then
          r.ctx_user_id = v_uid
          or (r.ctx_folder_id is not null and public.can_user_see_folder(r.ctx_folder_id, v_uid))
        when 'item_assignees' then
          r.ctx_user_id = v_uid
          or (r.ctx_folder_id is not null and public.can_user_see_folder(r.ctx_folder_id, v_uid))
        when 'folders' then
          r.ctx_folder_id is not null and public.can_user_see_folder(r.ctx_folder_id, v_uid)
        when 'items' then
          r.ctx_folder_id is null or public.can_user_see_folder(r.ctx_folder_id, v_uid)
        when 'item_tasks' then
          r.ctx_folder_id is null or public.can_user_see_folder(r.ctx_folder_id, v_uid)
        when 'item_entries' then
          r.ctx_folder_id is null or public.can_user_see_folder(r.ctx_folder_id, v_uid)
        else false
      end
    order by r.created_at desc
    limit v_limit;
end;
$fn$;

grant execute on function public.list_audit_log(uuid, int) to authenticated;
