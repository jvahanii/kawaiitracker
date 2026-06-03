## Mistä on kyse

Kirjautuminen toimii — Supabase palauttaa 200:n ja sessionin tallentuu. Toinen 400-virhe logissa oli pelkkä kirjoitusvirhe salasanassa.

Käyttäjän kokema "login fails" on todellisuudessa **landing-sivun (`/`) hydration-kraschi**, joka tekee ruudusta tyhjän ennen kuin ehtii klikata "Kirjaudu"-linkkiä.

### Juurisyy

1. `/` on SSR-reitti. Server renderöi sen englanniksi (i18n on pakotettu `en`-kieleen `src/lib/i18n.ts`:ssä).
2. `__root.tsx`:n `SupabaseAuthSync` ajaa `applyDetectedLanguage()`:n useEffectissa heti hydration jälkeen.
3. `applyDetectedLanguage()` vaihtaa kielen `fi`:hin `setTimeout(…, 0)`:lla.
4. Landing-puu ehtii rerenderöidä suomeksi ennen kuin React on saanut hydration valmiiksi → SSR-HTML (englanti) ≠ klientti (suomi) → **React error #418** → koko sivu räjähtää valkoiseksi.

Tämä on sama bugi kuin aikaisempi `/login`-bugi, joka korjattiin `ssr: false`:lla. Landing-sivulla ei voi käyttää samaa ratkaisua, koska se on julkinen sivu jonka pitää SEO:n vuoksi SSR:ää.

## Korjaus

Renderöi käännetyt tekstit landing-sivulla vasta kun komponentti on mountattu klientillä. SSR-HTML pidetään deterministisenä (englanti), ja sama englanti renderöidään ensimmäisellä klientti-renderöinnillä, jonka jälkeen kieli saa vaihtua.

### Muutokset

**`src/lib/i18n.ts`**
- Älä vaihda kieltä heti — paljasta `applyDetectedLanguage()` ilman `setTimeout`-kikkailua. Kutsuja päättää koska se on turvallista.

**`src/routes/__root.tsx`**
- Poista `applyDetectedLanguage()`-kutsu `SupabaseAuthSync`:n useEffectistä, tai siirrä se ajettavaksi vasta kun `mounted`-flagi on `true` ensimmäisen renderöinnin jälkeen. Tämä takaa että hydration ehtii valmiiksi englanniksi ennen kielen vaihtoa.

**`src/routes/index.tsx`** (landing)
- Lisää `useEffect` + `useState`-mounted-flagi. Renderöi `t(...)`-tekstit vasta kun `mounted === true`; ennen sitä renderöi sama englanninkielinen teksti minkä server tuotti. Tämä eliminoi mismatchin vaikka i18nextin sisäinen tila ehtisi vaihtua.

Vaihtoehto (yksinkertaisempi): Kutsu `i18n.changeLanguage(detectedLang)` vasta `requestAnimationFrame` + yhden tickin viiveellä `SupabaseAuthSync`:ssä, **eikä koskaan** ensimmäisen commitin aikana. Yhdistettynä siihen että `applyDetectedLanguage` ajetaan vasta `mounted`-tilassa, hydration on aina deterministinen.

## Tiedostot

- `src/lib/i18n.ts`
- `src/routes/__root.tsx`
- (mahdollisesti `src/routes/index.tsx` jos halutaan ekstra-vakuutus)

Ei DB- eikä env-muutoksia. Auth-reitit ovat jo `ssr: false` ja niitä ei kosketa.
