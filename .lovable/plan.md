## Goal
Tee muutoshistoriasta luettavampi: jokaisessa rivissä näkyy aina kohteena olevan folderin tai itemin nimi — ei piilotettuna details-osiossa.

## Muutokset

Tiedosto: `src/routes/_authenticated.audit.$tenantId.tsx`

1. Lisää apuri `entityName(entry)` joka palauttaa nimen seuraavassa järjestyksessä:
   - `folders` → `rowData.name` tai `changes.name.new ?? changes.name.old`
   - `items` → `rowData.title` tai `changes.title.new ?? changes.title.old`
   - `item_tasks` → `rowData.title` tai `changes.title.*`
   - `item_entries` → `rowData.note`/`value` tai `changes.*`
   - `folder_visibility` / `item_assignees` / `tenant_members` → näytä user/role/folder-id viittaus
   - fallback: `recordId` lyhennettynä

2. Muuta rivin otsikkoa niin että nimi näkyy aina lihavoituna tyyppi-labelin jälkeen:
   `Matti  updated  Folder "Markkinointi"  · 2 fields`
   Jos nimi puuttuu, jätä lainausmerkit pois.

3. Säilytä "Show details" -toggle muuttuneille kentille (vanha→uusi taulukko), mutta itse nimi näkyy aina rivillä ilman avaamista.

4. Jos `item_tasks` / `item_entries` -rivillä on `item_id` rowData/changes-kohdassa, näytä lisäksi vanhemman itemin viite muodossa `on item <uuid lyhennetty>` — täydellinen item-nimen haku vaatisi erillisen RPC:n eikä kuulu tähän muutokseen.

## Ei muutoksia
- Backend / SQL pysyy ennallaan; data tulee jo `rowData` + `changes` kentissä.
- Suodattimet, lataus, reititys ennallaan.
