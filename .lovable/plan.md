Havainto tuotantolokeista:
- Julkaisun jälkeen `POST /_serverFn/...login → 0` — Worker kaatuu kokonaan ennen vastausta. Tämä tarkoittaa, että `postgres.js`-paketti (postgres@3) ei käynnisty siististi Cloudflare Workersin ajossa.
- Preview toimii, koska siellä koodi pyörii Node-sandboxissa, jossa Workers-rajoituksia ei ole.
- Aiempi `pg`-virhe oli `Connection terminated unexpectedly`, joka on tunnettu Cloudflare Workers ↔ Aiven TLS-ongelma, ei ajurin kaatuminen.

Suunnitelma:

1. Palauta `pg`-ajuri (`Client` per pyyntö)
   - `postgres.js` kaataa Workerin → emme voi käyttää sitä tuotannossa.
   - Otetaan käyttöön takaisin vanha pg-pohjainen `query()`/`queryOne()` (yksi Client per kysely, retry, DatabaseUnavailableError) — sama rajapinta kuin nyt, joten muu sovellus ei muutu.

2. Lisää tarkka virhediagnostiikka
   - Lokitan tuotannossa virhekoodin (`err.code`), virhetyypin ja koko viestin, jotta erottuvat:
     - TLS-virhe (sertifikaatti, CA)
     - TCP-katkos (verkko, Aiven palomuuri)
     - Autentikaatiovirhe (käyttäjätunnukset)
   - Käyttäjälle näkyvä viesti pysyy ystävällisenä.

3. Selvitä juurisyy ennen seuraavaa korjausta
   - Julkaisun jälkeen tehdään yksi kirjautumisyritys ja katsotaan tuotantolokeista tarkka virheviesti.
   - Sen pohjalta valitaan oikea pitkän aikavälin ratkaisu (esim. Aivenin CA:n hyväksyntä, sertifikaatin tarkistuksen kierto Workersissa, tai siirtymä Lovable Cloudiin / Supabaseen, joka on suunniteltu serverless-käyttöön).

Tekniset tiedot:
- Muokattava: `src/lib/db.server.ts` (palautus + parempi logitus).
- Ei muutoksia auth.functions.ts:ään tai käyttöliittymään.
- Tämä ei vielä lopullisesti korjaa tuotantoa, vaan palauttaa Workerin toimintakuntoiseksi ja kertoo tarkan virheen, jolla pääsemme eteenpäin.