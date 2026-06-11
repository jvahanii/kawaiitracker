Muokataan selaimen välilehden (tab) otsikkoa niin, että kirjautuneen käyttäjän nimi näkyy aina alussa kaikilla suojatuilla sivuilla.

Nykyisellään `_authenticated` layout-reitti palauttaa `beforeLoad`-vaiheessa käyttäjän tiedot (`user.displayName`). Jokainen authenticated-alireitti asettaa kuitenkin oman staattisen `title`-nsä, joka ylikirjoittaa vanhemman otsikon. TanStack Routerissa lehtireitin `title` voittaa aina, joten pelkkä `_authenticated.tsx`:n `head`-funktion lisääminen ei riitä.

Toteutus:
1. Lisätään `_authenticated.tsx`:n `head`-funktiolle fallback-otsikko muodossa "{displayName} — Keywi".
2. Päivitetään jokaisen authenticated-alireitin (`_authenticated.app.$tenantId`, `_authenticated.audit.$tenantId`, `_authenticated.members.$tenantId`, `_authenticated.onboarding`) `head`-funktio niin, että se lukee `ctx.context.user.displayName` ja liittää sen otsikon alkuun: `{displayName} — <nykyinen otsikko>`.

Muokattavat tiedostot:
- `src/routes/_authenticated.tsx` — lisätään `head`
- `src/routes/_authenticated.app.$tenantId.tsx` — päivitetään `head`
- `src/routes/_authenticated.audit.$tenantId.tsx` — päivitetään `head`
- `src/routes/_authenticated.members.$tenantId.tsx` — päivitetään `head`
- `src/routes/_authenticated.onboarding.tsx` — päivitetään `head`