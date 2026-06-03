alter table public.item_tasks add column if not exists sort_order integer not null default 0;

do $$
begin
  if not exists (select 1 from public.item_tasks where sort_order > 0 limit 1) then
    with ranked as (
      select id, row_number() over (partition by item_id order by created_at asc) - 1 as rn
      from public.item_tasks
    )
    update public.item_tasks t set sort_order = r.rn from ranked r where r.id = t.id;
  end if;
end $$;

create index if not exists item_tasks_item_sort_idx on public.item_tasks(item_id, sort_order);
