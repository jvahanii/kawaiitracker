
## Tavoite

Normikäyttäjä näkee Muutoshistoria-näkymän, mutta vain ne tapahtumat, jotka koskevat asioita joihin hänellä on käyttöoikeus (esim. kansiot joihin on `folder_visibility`, niiden alla olevat itemit, tehtävät ja entryt). Adminin näkymä säilyy ennallaan (näkee kaiken).

## Muutokset

### 1. Tietokanta (uusi migraatio)

Päivitetään `public.list_audit_log(p_tenant_id, p_limit)` siten, että se palauttaa:

- **Admin/superuser**: kaikki tenantin audit-rivit (nykyinen käytös).
- **Member**: rivit, jotka kuuluvat käyttäjän näkyvyysalueeseen.
- **Muu**: tyhjä.

Funktio pysyy `security definer`. Rivien suodatus per `table_name`:

```text
folders            -> can_user_see_folder(record_id::uuid, auth.uid())
items              -> resolve folder_id (items.folder_id, fallback row_data->>'folder_id')
                       -> can_user_see_folder(folder_id, auth.uid())
item_tasks         -> resolve item_id -> item.folder_id -> visibility check
item_entries       -> resolve item_id -> item.folder_id -> visibility check
item_assignees     -> resolve item_id -> item.folder_id -> visibility check;
                       lisäksi näytetään aina rivit, joissa user_id = auth.uid()
folder_visibility  -> folder_id row_datasta -> visibility check;
                       lisäksi rivit, joissa user_id = auth.uid()
tenant_members     -> vain rivit, joissa user_id = auth.uid()
```

Poistettuja kohteita varten käytetään `row_data`-jsonbia kun base-taulun rivi ei enää löydy. RLS-policy `audit_log` pysyy admin-only (varmistus, ettei suoraa Data API -kyselyä voi tehdä); käyttäjät pääsevät käsiksi vain RPC:n kautta.

### 2. Backend (server function)

`src/lib/api/audit.functions.ts` säilyy ennallaan — kutsuu samaa RPC:tä `list_audit_log`. Ei muutoksia.

### 3. Frontend

`src/routes/_authenticated.app.$tenantId.tsx`:
- Näytetään "Muutoshistoria"-linkki kaikille tenantin jäsenille (poistetaan `isAdmin`-ehto linkin osalta; pidetään `joinCode` adminilla).

`src/routes/_authenticated.audit.$tenantId.tsx`:
- Poistetaan admin-pakko: `allowed`-tarkistus → riittää että käyttäjä on tenantin jäsen (`member`/`admin`/`superuser`).
- Poistetaan "Admin access required" -lohko.
- `useQuery`:t (`audit`, `items`, `entries-all`) sallitaan kaikille jäsenille.

Filtterit (käyttäjä, tyyppi) toimivat sellaisenaan rajatun datan päällä.

## Tekninen huomio

- `can_user_see_folder` palauttaa adminille aina `true`, joten samaa funktiota voi käyttää myös admin-haaralle, mutta säilytetään erillinen `is_tenant_admin`-pikareitti suorituskyvyn vuoksi.
- Käytetään `row_data`-jsonbia tallessa olevana lähteenä poistetuille riveille, jotta historiaa ei katoa silloin kun item/folder on poistettu.
- Migraation polku: `supabase/migrations/2026MMDDHHMMSS_audit_log_member_visibility.sql`. `supabase-schema.sql`:n vastaava funktio päivitetään myös.
