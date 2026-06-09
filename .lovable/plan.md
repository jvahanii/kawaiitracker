## Tavoite

Super users -näkymään (`/superusers`) lisätään nykyisten osioiden alle uusi "All users" -lista, jossa näytetään kaikki työtilojen jäsenet kaikista työtiloista. Jokaisella rivillä on Grant- tai Revoke superuser -nappi.

## Muutokset

### 1. Tietokanta (`supabase-schema.sql` + migraatio)

Lisätään uusi security-definer RPC, jota vain superuser voi kutsua:

```sql
create or replace function public.list_all_workspace_users()
returns table (
  user_id uuid,
  display_name text,
  email text,
  is_superuser boolean,
  tenants jsonb  -- [{ id, name, role }]
)
language sql stable security definer set search_path = public as $$
  select p.id,
         p.display_name,
         p.email,
         public.has_role(p.id, 'superuser'),
         coalesce(
           (select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'role', m.role)
                             order by t.name)
              from public.tenant_members m
              join public.tenants t on t.id = m.tenant_id
             where m.user_id = p.id),
           '[]'::jsonb)
  from public.profiles p
  where public.has_role(auth.uid(), 'superuser')
    and (
      exists (select 1 from public.tenant_members m where m.user_id = p.id)
      or public.has_role(p.id, 'superuser')
    )
  order by p.display_name nulls last, p.email
$$;

grant execute on function public.list_all_workspace_users() to authenticated;
```

Lisäksi `revoke_superuser` muutetaan sallimaan itse-revoke kun on muita superusereita jäljellä (aiemmin sovittu).

### 2. Server function (`src/lib/api/superusers.functions.ts`)

Lisätään uusi server fn:

```ts
export type WorkspaceUserRow = {
  userId: string;
  displayName: string;
  email: string;
  isSuperuser: boolean;
  tenants: { id: string; name: string; role: string }[];
};

export const listAllWorkspaceUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("list_all_workspace_users");
    if (error) throw new Error(error.message);
    return (data ?? []).map<WorkspaceUserRow>(/* map snake_case */);
  });

export const grantSuperuserById = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("grant_superuser", { p_user_id: data.userId });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
```

### 3. UI (`src/routes/_authenticated.superusers.tsx`)

Lisätään nykyisten osioiden alle uusi `<section>` "All users":

- `useQuery({ queryKey: ["all-workspace-users"], queryFn: listAllWorkspaceUsersFn })`, enabled when superuser.
- Taulukko / lista jokaiselle käyttäjälle:
  - Nimi + email
  - Lista chip-tyylisistä työtila-merkeistä: `{tenantName} · {role}`
  - "Superuser" -badge jos on
  - Toimintonappi:
    - Jos `isSuperuser` → "Revoke superuser" (käyttää nykyistä `revokeSuperuser` mutationia, sama "last superuser" -tarkistus)
    - Muuten → "Grant superuser" (uusi `grantSuperuserById` mutation)
- Onnistumisen jälkeen invalidoidaan sekä `["superusers"]` että `["all-workspace-users"]`.

### 4. Käännökset

Uudet i18n-avaimet (fi + en):
- `superusers.allUsersTitle` — "All users"
- `superusers.allUsersBody` — kuvausteksti
- `superusers.grant` — "Grant superuser"
- `superusers.revoke` säilyy
- `superusers.superuserBadge` — "Superuser"
- `superusers.noWorkspaces` — "No workspaces"

## Tekniset huomiot

- RPC suodattaa pääsyn `has_role(auth.uid(), 'superuser')` ‑tarkistuksella, joten muut käyttäjät eivät pääse listaan vaikka grant olisi olemassa.
- Lista palauttaa kaikki profiilit, joilla on vähintään yksi `tenant_members`-rivi (tai jotka ovat superusereita ilman työtilaa) — ei näytetä orpoja auth-tilejä joilla ei ole profiilia.
- UI ei tee migraation kirjoitusta itse (Lovable Cloud ei käytössä). Toimitan SQL:n erikseen ajettavaksi Supabasen SQL-editoriin samassa vastauksessa, kun toteutus on tehty.
