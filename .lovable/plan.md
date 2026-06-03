## Ongelma

Tuotanto kaatuu 500-virheeseen joka sivulla. Server-lokit:

```
Error: Supabase config unavailable. Build-time env EXT_SUPABASE_URL / EXT_SUPABASE_PUBLISHABLE_KEY missing.
```

Edellisessä kierroksessa otimme käyttöön `vite.config.ts`:n `define`-plugin, joka lukee `process.env.EXT_SUPABASE_URL` build-ajalla. Nämä env-muuttujat eivät kuitenkaan ole saatavilla Lovable-build-pipelinessa, joten `__SUPABASE_URL__` korvautuu tyhjällä merkkijonolla, ja `initSupabase()` heittää virheen SSR:ssä → root-routen `errorComponent` renderöi koko sivun ajaksi.

Lisäksi `RootComponent` kutsuu `initSupabase()` synkronisesti myös SSR:ssä, mikä kaataa renderin vaikka beforeLoad on jo client-only-suojattu.

## Korjaus

Käytä Lovablen automaattisesti injektoimia `VITE_SUPABASE_URL` ja `VITE_SUPABASE_PUBLISHABLE_KEY`-muuttujia (jotka ovat aina saatavilla `import.meta.env`:ssa sekä client- että server-bundleissa) suoraan. Poistetaan oma `define`-konfiguraatio ja `EXT_*`-referenssit kokonaan.

### Muutokset

**`vite.config.ts`** — Poista `define`-blokki ja `EXT_*`-lukeminen. Palaa minimaaliseen `defineConfig`-kutsuun.

**`src/lib/supabase/client.ts`** — Korvaa `__SUPABASE_URL__` / `__SUPABASE_PUBLISHABLE_KEY__` referensseillä `import.meta.env.VITE_SUPABASE_URL` ja `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`. Poista `declare const` -rivit.

**`src/routes/__root.tsx`** — Poista synkroninen `initSupabase()`-kutsu `RootComponent`:n rungosta (tämä ajetaan myös SSR:ssä). Jätä client-only `beforeLoad`-kutsu, ja siirrä `RootComponent`:n init `useEffect`-koukkuun, jotta SSR-render ei riipu Supabase-klientistä.

### Miksi tämä toimii

- `VITE_SUPABASE_*` ovat Lovable Cloudin auto-injektoimia ja saatavilla joka buildissa (production, preview, dev).
- Ei tarvita server-fn-roundtrippiä → static preview toimii edelleen.
- SSR ei enää yritä alustaa Supabase-klienttiä, joten production renderöi sivun ilman 500-virhettä.

## Tiedostot

- `vite.config.ts`
- `src/lib/supabase/client.ts`
- `src/routes/__root.tsx`
