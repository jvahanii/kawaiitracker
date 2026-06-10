## Tavoite
Monthly entries -osion arvot (kuukausikohtaiset plan/actual-syötteet sekä Planned/Actual yhteissummat) näytetään ja syötetään valitussa valuutassa, mutta tallennetaan tietokantaan edelleen EUR-perustana — samalla logiikalla kuin tavoitearvo.

## Muutokset (vain `src/routes/_authenticated.app.$tenantId.tsx`)

1. **`MonthlyEntries`-komponentti**
   - Käytä `useCurrency()`-hookista myös `convert` ja `toEur` (nyt destrukturoidaan vain `format`).
   - Lasketaan `yearTotal` ja `actualTotal` edelleen EUR-arvoista, mutta annetaan `TotalEditor`ille `convert(total)` näyttöarvona.
   - `TotalEditor`in `onCommit` saa käyttäjän syöttämän arvon näyttövaluutassa → muunnetaan EUR:ksi `toEur(newTotal)` ennen kuin lasketaan `per = newTotal / 12` ja kutsutaan `upsertM.mutate`.
   - `MonthCell`ille välitetään `convert(amount)` ja `convert(actual)`, ja `onCommitAmount`/`onCommitActual`-callbackit kääritään niin että käyttäjän syöttämä luku muunnetaan `toEur(...)` ennen tallennusta.

2. **`TotalEditor`**
   - Lisätään `key`/effect-päivitys niin että kun näytettävä `total` (eli `convert(total)`) muuttuu valuutan vaihtuessa, input-kenttä päivittyy (nykyinen `useEffect([total, focused])` riittää, kun parent antaa jo muunnetun arvon).

3. **`MonthCell` / `NumberInput`**
   - Ei rakennemuutoksia; arvot tulevat jo valmiiksi muunnettuina parentista, ja onCommit-callback hoitaa toEur-muunnoksen ennen mutaatiota.

4. **Valuuttasymbolin näyttö (valinnainen, pidetään yhtenäisenä SavingsChartin kanssa)**
   - Lisätään pieni valuuttasymboli `Planned:`- ja `Actual:`-etikettien viereen samalla `Intl.NumberFormat`-tempulla, jota SavingsChart jo käyttää, jotta käyttäjä näkee minkä valuutan numerot tarkoittavat.

## Tekninen huomio
- Pyöristys: säilytetään nykyinen `Math.round(x * 100) / 100` -käytäntö EUR-puolella tallennettaessa, jotta tietokantaan ei kerry kelluvan pisteen roinaa.
- Mitään tietokanta- tai server function -muutoksia ei tarvita; muutos on puhtaasti esitysmuutos.
