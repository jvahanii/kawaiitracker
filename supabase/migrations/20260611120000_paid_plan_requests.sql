-- Track which users have clicked "Contact me for a paid plan"
create table if not exists public.paid_plan_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  requested_at timestamptz not null default now()
);

create index if not exists paid_plan_requests_user_id_idx
  on public.paid_plan_requests(user_id);

grant select, insert on public.paid_plan_requests to authenticated;
grant all on public.paid_plan_requests to service_role;

alter table public.paid_plan_requests enable row level security;

create policy "Users insert own paid plan requests"
on public.paid_plan_requests
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users select own paid plan requests"
on public.paid_plan_requests
for select
to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(), 'superuser'));
