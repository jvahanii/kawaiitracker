## Tilanne
Superusers-näkymässä on jo "All users" -osio joka kutsuu palvelinfunktiota `listAllWorkspaceUsers`, joka taas kutsuu SQL-RPC:tä `public.list_all_workspace_users()`. Tämä RPC puuttuu tietokannasta (404 schema cache), joten lista on tyhjä.

## Korjaus
Lisää uusi migraatio joka luo RPC:n. Frontend ei vaadi muutoksia.

### Tiedosto
`supabase/migrations/20260609130000_list_all_workspace_users.sql`

### SQL (kuvaus)
- `create or replace function public.list_all_workspace_users()` palauttaa:
  - `user_id uuid`
  - `display_name text`
  - `email text`
  - `is_superuser boolean`
  - `tenants jsonb` (`[{id, name, role}, ...]`)
- `language sql security definer stable set search_path = public, auth`
- Pääsy: vain superuser saa kutsua → tarkistus heti aluksi `if not public.has_role(auth.uid(), 'superuser') then raise exception 'forbidden'; end if;` (toteutetaan plpgsql-wrapperilla joka kutsuu SQL-aggregointia).
- Lähde:
  - kaikki userit joko `public.tenant_members` tai `public.user_roles` -taulusta (UNION)
  - liitos `public.profiles` → `display_name`, `email`
  - aggregointi `tenant_members` + `tenants` → `tenants jsonb`
  - `is_superuser` = `exists(select 1 from user_roles where role = 'superuser' and user_id = u.id)`
- `revoke all on function ... from public; grant execute to authenticated;` (sisäinen tarkistus estää muut kuin superuserit).

### Toteutus tarkemmin (plpgsql + SQL CTE)
```sql
create or replace function public.list_all_workspace_users()
returns table (
  user_id uuid,
  display_name text,
  email text,
  is_superuser boolean,
  tenants jsonb
)
language plpgsql
security definer
stable
set search_path = public, auth
as $$
begin
  if not public.has_role(auth.uid(), 'superuser') then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
  with all_user_ids as (
    select tm.user_id from public.tenant_members tm
    union
    select ur.user_id from public.user_roles ur
    union
    select p.id from public.profiles p
  )
  select
    u.user_id,
    coalesce(p.display_name, '') as display_name,
    coalesce(p.email, '')        as email,
    exists(
      select 1 from public.user_roles ur
      where ur.user_id = u.user_id and ur.role = 'superuser'
    ) as is_superuser,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('id', t.id, 'name', t.name, 'role', tm.role)
          order by t.name
        )
        from public.tenant_members tm
        join public.tenants t on t.id = tm.tenant_id
        where tm.user_id = u.user_id
      ),
      '[]'::jsonb
    ) as tenants
  from all_user_ids u
  left join public.profiles p on p.id = u.user_id
  order by lower(coalesce(p.display_name, p.email, ''));
end;
$$;

revoke all on function public.list_all_workspace_users() from public;
grant execute on function public.list_all_workspace_users() to authenticated;
```

### Riskit / oletukset
- Oletetaan että `profiles(id, display_name, email)`, `tenants(id, name)`, `tenant_members(user_id, tenant_id, role)`, `user_roles(user_id, role)` ja `public.has_role(uuid, app_role)` ovat olemassa (käytetään muualla koodissa).
- Jos `profiles.email` puuttuu, haetaan tilalle `auth.users.email` — lisätään fallback `left join auth.users au on au.id = u.user_id` ja `coalesce(p.email, au.email)`.

## Ei muutoksia frontendiin
`_authenticated.superusers.tsx` ja `superusers.functions.ts` pysyvät ennallaan.
