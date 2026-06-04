-- Audit log retention: prune entries older than 12 months nightly

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

do $$
begin
  if exists (select 1 from cron.job where jobname = 'audit-log-prune') then
    perform cron.unschedule('audit-log-prune');
  end if;
end $$;

select cron.schedule(
  'audit-log-prune',
  '15 3 * * *',
  $$select public.prune_audit_log(365);$$
);
