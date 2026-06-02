Havainto: julkaistun sivun lokit näyttävät edelleen `db unavailable` ja `[db] connection error after retries: Connection terminated unexpectedly` kirjautumisen aikana. Tämä ei ole enää salasanavirhe eikä julkaisun välimuistiongelma, vaan tuotantoympäristön tietokantayhteys katkeaa ennen kyselyn valmistumista.

Suunnitelma:

1. Vaihda PostgreSQL-ajuri Workers-yhteensopivaan ratkaisuun
   - Nykyinen `pg`/TCP-yhteys katkeaa tuotannossa SSL/TCP-tasolla.
   - Korvaan sen `postgres`-ajurilla ja konfiguroin sen serverless-käyttöön ilman pitkäikäisiä idle-yhteyksiä.
   - Säilytän nykyisen `query()` ja `queryOne()` rajapinnan, jotta muu sovellus ei tarvitse laajaa refaktorointia.

2. Paranna tietokantavirheen diagnostiikkaa
   - Lokitan varsinaisen virheviestin ja virhekoodin turvallisesti ilman henkilötietoja.
   - Pidän käyttäjälle näkyvän virheen ystävällisenä: “Service is temporarily unavailable…”
   - Näin seuraava tuotantotesti kertoo heti, onko kyse SSL:stä, verkosta, tunnuksista vai ajurista.

3. Varmista kirjautumisvirta
   - Testaan serverifunktion/tuotantolokit korjauksen jälkeen.
   - Jos yhteys toimii, kirjautumisen pitäisi siirtyä seuraavaan vaiheeseen: salasanan tarkistus ja session luonti.
   - En muuta käyttäjiä, salasanoja tai käyttöliittymää tässä korjauksessa.

Tekniset tiedot:
- Muokattava pääfile: `src/lib/db.server.ts`
- Mahdollinen riippuvuusmuutos: lisää `postgres` ja poista/ohita `pg`, jos sitä ei enää tarvita.
- Nykyiset API-tiedostot voivat jäädä samoiksi, koska ne käyttävät vain `query`/`queryOne`-apufunktioita.