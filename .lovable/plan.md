
# Käyttöohje suomeksi ja englanniksi

Luodaan kattava käyttöohje nykyisen toiminnallisuuden pohjalta (säästöjen ja tulojen seuranta, työtilat, kuukausimerkinnät, tavoite, valuutta, käyttäjähallinta, audit log, pääkäyttäjätoiminnot). Ohje toimitetaan kahdessa muodossa: pysyvinä Markdown-tiedostoina repossa ja sovelluksen sisäisenä `/help`-sivuna molemmilla kielillä.

## Sisältö (sama molemmilla kielillä)

Ohje jaetaan rooliin perustuviin osioihin:

1. **Aloittaminen** — Rekisteröityminen, kirjautuminen, salasanan nollaus, kielen ja valuutan vaihto.
2. **Työtilat** — Työtilan luominen, liittyminen 8-merkkisellä koodilla, työtilojen välillä vaihtaminen, uusien työtilojen luonti.
3. **Loppukäyttäjä — säästöt ja tulot**
   - Säästö- tai tulokohteen luominen, nimeäminen, muistiinpanot
   - Vastuuhenkilön asettaminen
   - Kansiot: luominen, alikansiot, kategorisoimattomat
   - Kuukausimerkinnät: suunniteltu ja toteuma, kuukauden lisääminen
   - Tavoite (Goal): summa + tavoitepäivä, jäljellä olevat päivät
   - Säästötaulukko ja diagrammi (kohteittain / vastuuhenkilöittäin, Toteuma/Suunnitelma)
   - Etsintä ja järjestäminen (vetämällä)
   - Valuutan vaihto: arvot tallennetaan euroina ja näytetään valitussa valuutassa; goal- ja kuukausimerkintä-syötteet tulkitaan valitussa valuutassa
4. **Ylläpitäjä (Admin)**
   - Käyttäjien kutsuminen liittymiskoodilla tai sähköpostilla
   - Roolien hallinta (Admin / Member)
   - Käyttäjän poisto työtilasta
   - Kansion näkyvyyden rajaaminen (Folder visibility) sallituille jäsenille
   - Muutoshistoria (Audit log)
5. **Pääkäyttäjä (Superuser)**
   - "Muut käyttäjät" -näkymä: kaikkien työtilojen käyttäjät
   - Roolien muuttaminen muissa työtiloissa
   - Pääkäyttäjäoikeuksien myöntäminen ja peruuttaminen
   - Viimeisen pääkäyttäjän suoja
6. **Vinkit ja huomiot** — Tallennuksen tilailmaisin (Tallennetaan / Tallennettu / Tallentamattomat muutokset), pikakopiointi liittymiskoodille, klikkaa muokataksesi, vetämällä järjestäminen.

## Toimitettavat muutokset

### Markdown-tiedostot
- `docs/USER_GUIDE.fi.md` — koko ohje suomeksi
- `docs/USER_GUIDE.en.md` — koko ohje englanniksi

### Sovelluksen sisäinen /help-sivu
- Uusi reitti `src/routes/help.tsx` (julkinen, ei vaadi kirjautumista) — TanStack Start `createFileRoute("/help")` head()-metatiedoilla
- Sivu lukee samaa sisältöä i18n:n kautta valitulla kielellä (fi/en) käyttäen olemassa olevaa `LanguageSwitcher`-komponenttia ylhäällä
- Sisältö renderöidään suoraan komponentissa (otsikot + kappaleet), ei runtime-markdown-parseria — yksinkertainen, ei lisäriippuvuuksia
- Lisätään uusi `help`-namespace molempiin `src/lib/locales/en.json` ja `src/lib/locales/fi.json` (otsikot, kappaleet, osioiden tekstit)
- Lisätään diskreetti linkki "Käyttöohje / Help" sovelluksen footeriin tai työtilanäkymän yläpalkkiin (sopiva sijoitus tarkennetaan toteutuksessa olemassa olevan UI:n perusteella)

### Tekninen huomio
- Sivu noudattaa olemassa olevaa TanStack Start -konventiota (`createFileRoute`, `head()` meta)
- Reitti on julkinen (ei `_authenticated`-etuliitettä), jotta ohjeen voi jakaa myös kirjautumattomille
- Ei muutoksia tietokantaan tai serverifunktioihin

## Ulkopuolella

- Ei käännetä jokaista käyttöliittymän nappia uudestaan — käytetään ohjeessa samoja termejä kuin nykyisissä lokaaleissa
- Ei lisätä kuvakaappauksia (voidaan lisätä myöhemmin)
- Ei muutoksia nykyisiin toiminnallisuuksiin
