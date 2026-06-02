Toteutan korjauksen näin:

1. **Lisään turvallisen kirjautumisen diagnostiikan**
   - Kirjaan palvelinpuolella, osuuko kirjautumisessa `app_users`-riviin vai epäonnistuuko salasanan hash-verifiointi.
   - Lokit eivät sisällä salasanaa tai koko sähköpostia; käytän vain rajattua tunnistetta, jotta ongelma voidaan todentaa ilman arkaluonteista dataa.

2. **Tarkistan tuotantotietokannan tilanteen**
   - Varmistan löytyykö `pete.skeittari@gmail.com` tuotannon `app_users`-taulusta.
   - Tarkistan onko `password_hash` PBKDF2-muodossa (`pbkdf2$...`) ja onko käyttäjällä tenant-jäsenyys.
   - En muuta tietoja tässä vaiheessa, ellei tarkistus osoita selvästi rikkoutunutta dataa tai pyydät salasanan nollausta.

3. **Korjaan mahdollisen hash-/salasanayhteensopivuuden ongelman**
   - Jos hash-formaatti on vanha tai rikkoutunut, lisään hallitun migraatiopolun tai nollauslogiikan.
   - Jos hash on kunnossa mutta kaikkien tilien kirjautuminen hylätään, keskityn Web Crypto / base64 -verifioinnin tuotantoympäristöeroihin.

4. **Korjaan hydration-virheen kielivalinnasta**
   - Nykyinen SSR renderöi englanniksi ja selain vaihtaa suomeksi liian aikaisin, mikä aiheuttaa `Back` vs `Takaisin` mismatchin.
   - Teen kielestä SSR/client-yhteensopivan: ensirenderi pysyy samana, ja kieli vaihtuu vasta hydraation jälkeen ilman React-mismatchia.

5. **Parannan login-jälkeisen ohjauksen luotettavuutta**
   - Varmistan, että onnistunut login ei näytä virheellisesti etusivua tai login-sivua, vaan odottaa istunnon tallennuksen ja ohjaa oikein.
   - Tarvittaessa lisään selkeämmän virheilmoituksen tilanteisiin, joissa tili löytyy mutta salasana ei täsmää.

6. **Vahvistan korjauksen**
   - Tarkistan palvelinlokit ja login-serverifunktion vasteen.
   - Varmistan, ettei hydration mismatch toistu login-sivulla.
   - Raportoin, löytyikö Peten tili ja mikä kirjautumisen varsinainen syy oli.