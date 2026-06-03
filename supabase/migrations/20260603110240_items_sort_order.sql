alter table public.items add column if not exists sort_order integer not null default 0;

do $$
begin
  if not exists (select 1 from public.items where sort_order > 0 limit 1) then
    with ranked as (
      select id, row_number() over (partition by tenant_id order by updated_at desc) - 1 as rn
      from public.items
    )
    update public.items i set sort_order = r.rn from ranked r where r.id = i.id;
  end if;
end $$;

create index if not exists items_tenant_sort_idx on public.items(tenant_id, sort_order);
