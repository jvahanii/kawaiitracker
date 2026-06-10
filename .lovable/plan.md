# Valuutanvaihto työtilan headeriin

## Tavoite
Käyttäjäkohtainen valuuttavalinta (selaimen `localStorage`) työtilan oikealle puolelle. Summat näytetään valitussa valuutassa, muunnettuna EUR-pohjaisilta kursseilta.

## Käytettävät valuutat
EUR (perusvaluutta), USD, GBP, SEK, NOK. Helppo laajentaa myöhemmin.

## Kurssilähde
[frankfurter.dev](https://frankfurter.dev) — ilmainen, ECB-kurssit, ei API-avainta. Endpoint: `https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,GBP,SEK,NOK`. Cachetetaan TanStack Queryllä 12 h, fallback 1:1-kurssit jos haku epäonnistuu.

## Tekninen toteutus

**Uusi `src/lib/currency.tsx`**
- `CurrencyProvider` Reactin contextilla; valittu valuutta `localStorage`-avaimessa `keywi.currency`, oletus `EUR`.
- `useCurrency()` palauttaa `{ currency, setCurrency, rates, convert(eurAmount), format(eurAmount) }`.
- `convert` kertoo EUR-summan kurssilla; `format` käyttää `Intl.NumberFormat(undefined, { style: "currency", currency })`.
- Kurssit haetaan `useQuery({ queryKey: ['fx', currency], staleTime: 12h })`-kutsulla, mutta kaikki kurssit haetaan kerralla (base=EUR), niin yksi haku riittää.

**`src/routes/__root.tsx`**
- Wrapataan `<CurrencyProvider>` olemassa olevan provider-pinon sisään.

**`src/routes/_authenticated.app.$tenantId.tsx`**
- Lisätään `<CurrencySwitcher />` headerin oikealle puolelle, `<LanguageSwitcher />` viereen (rivi ~360).
- Korvataan rivin 1016 paikallinen `fmt` `useCurrency().format`-funktiolla.

**`src/components/SavingsChart.tsx`**
- Korvataan rivin 147 paikallinen `fmt` `useCurrency().format`-funktiolla. Kaaviot ja tooltipit päivittyvät automaattisesti.

**Syöttökentät pysyvät EUR:ssa**
- Tallennettu data säilyy EUR-pohjaisena. Syöttökenttien labelit (`fi.json` "Säästöjen määrä (€)", "Tavoite (€)") jätetään EUR:iin, jottei pyöristysvirheitä synny tallennuskierroksilla. Lisätään pieni huomautus käyttöliittymään: "Syötetään aina EUR-määränä". (Jos haluat syöttökenttienkin muuttuvan, kerro — vaatii erillisen muunnoksen tallennuksessa.)

**i18n**
- Lisätään `fi.json` / `en.json` avaimet: `workspace.currency`, `workspace.inputAlwaysEur`.

## Ulkopuolelle jää
- Ei muutoksia tietokantaan.
- Ei historian kurssimuutoksia — käytetään aina viimeisintä kurssia kaikkiin summiin.
- Ei admin-tason työtilakohtaista valintaa (käyttäjäkohtainen, kuten valittiin).
