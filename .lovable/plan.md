## Mitä on rikki

Et pääse kirjautumaan koska `/login` näyttää tyhjältä / kaatuu hydraatioon. Konsolissa näkyy React-virhe #418 ("Hydration failed… server rendered text didn't match the client"). Ero on juuri i18n-tekstissä:

```
+ Takaisin   ← klientti (suomi)
- Back       ← serveri (englanti)
```

Mitä tapahtuu:

1. `src/lib/i18n.ts` alustaa i18next kielelle `en` ja pakottaa serverillä englannin niin että SSR-HTML on englanniksi ("Back", "Log in", …).
2. `applyDetectedLanguage()` ajetaan `__root.tsx`:n `useEffect`issa heti hydraation jälkeen. Se vaihtaa kielen `fi`-arvoon `setTimeout(…, 0)`:n kautta.
3. `/login` on **lazy route** (oma chunk). Kun chunk latautuu ja React hydratoi sen, i18nextin kieli on jo ehtinyt vaihtua `fi`-arvoksi → ensimmäinen renderöinty teksti on suomi, mutta SSR-HTML on englanti → hydraatio epäonnistuu → koko `/login`-puu räjähtää ja ruutu jää valkoiseksi.

Tämä ei liity Supabase-autentikointiin sinänsä — kirjautumislomaketta ei pääse koskaan klikkaamaan koska sivu kaatuu hydraatioon.

## Korjaus

Poista SSR auth-sivuilta. Ne ovat täysin selainpuolisia (lomake + Supabase-istunto `localStorage`:ssa); SSR:stä ei ole hyötyä eikä SEO:lle väliä. Sama temppu kuin `_authenticated`-layoutissa.

Lisää `ssr: false` näihin reitteihin:

- `src/routes/login.tsx`
- `src/routes/signup.tsx`
- `src/routes/forgot-password.tsx`
- `src/routes/reset-password.tsx`

```ts
export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Log in — Tracker" }] }),
  component: LoginPage,
});
```

Kun reitti ei SSR:ää, ei ole serveri-HTML:ää johon klientin tulisi täsmätä → ei hydraatiomismatchia → lomake näkyy, painikkeen klikkaus toimii, ja jo aikaisemmin tehty `onSuccess` (suora navigointi `/onboarding` tai `/app/$tenantId`) johdattaa työpöydälle.

Landing-sivua (`/`) ei kosketa — se on englanniksi sekä serverillä että klientillä ennen kielen vaihtoa, ja ainoat erot ovat `LanguageSwitcher` + linkkitekstit. Jos sieltä ilmestyy hydraatiovaroituksia jatkossa, fiksataan vasta sitten (esim. lykätään `applyDetectedLanguage` Suspense-flushin yli tai renderöidään käännetty teksti vasta `mounted`-flagin jälkeen).

## Tiedostot

- `src/routes/login.tsx` — lisää `ssr: false`
- `src/routes/signup.tsx` — lisää `ssr: false`
- `src/routes/forgot-password.tsx` — lisää `ssr: false`
- `src/routes/reset-password.tsx` — lisää `ssr: false`

Ei DB- eikä env-muutoksia.
