## Tavoite
Kun työtilassa on jo 4 jäsentä ja yritetään lisätä 5., palautuu selkeä virheviesti: "Ilmaisten käyttäjien maksimimäärä (4) saavutettu. Lisää käyttäjiä varten ota maksullinen suunnitelma käyttöön." Superuser saa ohittaa rajan.

## Backend
**`src/lib/api/tenants.functions.ts` — `addMemberByEmail`**
- Lisätään vakio `FREE_MEMBER_LIMIT = 4` tiedoston alkuun.
- Caller-tarkistuksen jälkeen, ennen käyttäjän hakua/luontia:
  1. Tarkistetaan `has_role(caller, 'superuser')` RPC:llä. Jos true → ohitetaan raja.
  2. Muuten lasketaan `tenant_members`-rivit `tenant_id = data.tenantId` (admin-clientilla `count: 'exact', head: true`).
  3. Jos `count >= 4` → palautetaan `{ ok: false, error: 'FREE_LIMIT_REACHED' }` (sentineli-merkkijono, käännetään frontissa).
- Olemassa olevan jäsenen uudelleenlisäys (duplicate insert) ei kasvata määrää — koska teemme tarkistuksen ennen, lisätään pieni huomio: jos haettava email kuuluu jo tenantin jäseneen, ohitetaan raja (ei estetä uudelleenkutsua). Tämä toteutetaan tarkistamalla raja vasta `userId`:n resolvoinnin jälkeen ja katsomalla onko `userId` jo `tenant_members`-listassa.

## Frontend
**`src/routes/_authenticated.members.$tenantId.tsx`**
- Lisätään-mutaation `onSuccess`/`onError`-käsittelyyn: jos `res.error === 'FREE_LIMIT_REACHED'`, näytetään `toast.error(t('freeLimitReached'))` tavallisen virheen sijaan.

## i18n
**`src/lib/locales/en.json` & `fi.json`**
- `freeLimitReached`:
  - fi: "Ilmaisten käyttäjien maksimimäärä (4) saavutettu. Lisätäksesi käyttäjiä, ota maksullinen suunnitelma käyttöön."
  - en: "Free user limit (4) reached. Upgrade to a paid plan to add more users."

## Ei muutoksia
- Ei maksuintegraatiota tässä vaiheessa (käyttäjän valinta).
- Ei muutoksia muihin rooleihin tai poistoihin.
