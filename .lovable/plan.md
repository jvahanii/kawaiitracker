Syy näyttää olevan tämä: eilinen korjaus paransi vain tietokantayhteyden uudelleenyrityksiä, mutta kirjautumisvirta on edelleen täysin riippuvainen tietokannasta jokaisessa vaiheessa.

Teknisesti login tekee näin:
1. `login()` hakee käyttäjän `app_users`-taulusta.
2. Onnistuneen kirjautumisen jälkeen sivu ohjataan `/`-reitille.
3. `/`-reitin `beforeLoad` kutsuu heti `getMe()` ja `listMyTenants()`.
4. Myös `_authenticated`-reitit kutsuvat `getMe()` ennen kuin sivu näytetään.

Jos tietokantayhteys pätkii missä tahansa näistä kohdista, kirjautuminen voi näyttää epäonnistuneelta, vaikka salasana olisi oikein. Eilinen muutos ei vielä estänyt tätä, koska virheet pääsevät edelleen kaatamaan reitin tai palautumaan geneerisenä palvelinvirheenä.

Toteutussuunnitelma:

1. Tee tietokantavirheistä hallittuja auth-virheitä
   - Lisää auth-funktioihin yhteinen virheenkäsittely tietokantaongelmille.
   - `login()` ei enää saa kaatua geneeriseen 500-virheeseen, vaan palauttaa selkeän viestin kuten “Palvelu on hetkellisesti ruuhkautunut, yritä uudelleen.”
   - Väärä salasana pysyy edelleen normaalina “Invalid email or password” -virheenä.

2. Estä etusivun reittivahti rikkomasta kirjautumista
   - Päivitä `/`-reitin `beforeLoad`, jotta `getMe()` / `listMyTenants()` -tietokantavirhe ei kaada koko sivua.
   - Jos istuntoa ei voida varmistaa tietokantaongelman takia, näytetään kirjautumis-/etusivu eikä virhesivua.
   - Jos käyttäjä on oikeasti kirjautunut ja tietokanta toimii, nykyinen ohjaus workspaceen säilyy.

3. Tee suojattu reitti vikasietoisemmaksi
   - Päivitä `_authenticated`-reitin auth-tarkistus käsittelemään tietokantakatkos hallitusti.
   - Katkos ohjaa käyttäjän takaisin login-sivulle tai näyttää hallitun virhetilan sen sijaan, että sovellus hajoaa.

4. Lisää parempi lokitus ilman arkaluonteisia tietoja
   - Kirjaa palvelinpuolella, missä auth-vaiheessa tietokanta epäonnistui.
   - Älä lokita salasanoja, sessioita tai käyttäjän arkaluonteista dataa.

5. Vahvista korjaus
   - Testaa selaimessa, että virheellinen salasana palauttaa normaalin virheen.
   - Testaa, ettei login-sivu tai etusivu kaadu, vaikka auth-funktio palauttaa tietokantaongelman.
   - Tarkista server function -lokit, ettei 500/HTTPError enää synny kirjautumisvirrassa.