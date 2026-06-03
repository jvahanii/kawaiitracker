## Mistä on kyse

Tuotannossa (`kawaiitracker.lovable.app`) login toimii, koska siellä pyörii oikea server-runtime ja `getSupabaseConfig` server-funktio palauttaa Supabase URL+publishable keyn.

Preview-ympäristössä (`id-preview--…lovable.app`) sivusto on **staattinen prerender-build**. Siellä ei ole server-runtimea, joten `getSupabaseConfig`-kutsu epäonnistuu virheellä:

```
Invariant failed: expected content-type header to be set
  at getResponse (serverFnFetcher)
  at __root.tsx beforeLoad
```

Tämä kaataa root-routen `beforeLoad`:n ennen kuin Supabase-klientti ehditään alustaa → login-sivu ei latautua eikä autentikointia voi tehdä.

## Korjaus

Injektoi Supabasen julkinen URL ja publishable key client-bundleen build-ajalla, jolloin selain ei tarvitse server-roundtrippiä alustaakseen klientin. Server-funktio jää varmuusvaraksi mutta sitä ei enää tarvita normaalireitillä.

### Muutokset

**`vite.config.ts`**
- Lue build-ajalla `process.env.EXT_SUPABASE_URL` ja `process.env.EXT_SUPABASE_PUBLISHABLE_KEY`.
- Inline ne client-bundleen `define`-optiolla (esim. `__SUPABASE_URL__` ja `__SUPABASE_PUBLISHABLE_KEY__`). Nämä ovat julkisia arvoja, joten injektointi on turvallista.

**`src/lib/supabase/client.ts`**
- Lisää `getEmbeddedConfig()` joka palauttaa build-ajan vakiot kun ne ovat saatavilla.
- `initSupabase(config?)` hyväksyy myös undefinedin: jos parametri puuttuu, käyttää embedded-arvoja.

**`src/routes/__root.tsx`**
- Poista `beforeLoad`-server-fn-kutsu `getSupabaseConfig`:lle. Alusta Supabase-klientti suoraan embedded-vakioilla heti `beforeLoad`:ssa (client-puolella) ja `RootComponent`:ssa.
- `loader` voi palauttaa embedded-configin (tai poistaa kokonaan jos ei käytetä).

**`src/lib/supabase/config.functions.ts`**
- Jää olemaan, ettei muut moduulit hajoa, mutta sitä ei enää kutsuta bootstrapissa.

### Miksi tämä toimii

- Static preview ja production saavat saman embedded-configin → ei server-roundtrippiä → ei `content-type`-virhettä.
- URL + publishable key ovat samat julkiset arvot jotka Supabase paljastaa joka tapauksessa selaimelle, joten bundlaaminen ei tuo uutta tietovuotoa.
- SSR-koodi (server-side renderöinti tuotannossa) toimii myös, koska `process.env.EXT_SUPABASE_*` on saatavilla server-runtimessa, ja `define` korvataan client-buildissä.

## Tiedostot

- `vite.config.ts`
- `src/lib/supabase/client.ts`
- `src/routes/__root.tsx`

Ei DB- eikä uusia env-muutoksia.
