import{u as j,h as g,r as v,i as w,k as f,j as e,L as b,f as x}from"./index-BYwRPXxN.js";const A=`# User Guide

This is the user guide for Keywi. The app is a multi-tenant savings and income tracker where workspace members can plan, record, and follow their savings together.

## 1. Getting started

### Sign up
1. Open the landing page and choose **Sign up**.
2. Enter your name, email, and a password (8+ characters).
3. Confirm with **Create account**.

### Log in
1. From the landing page, choose **Log in**.
2. Enter your email and password.
3. Tick **Remember me** to keep the session on this device.

### Reset password
- On the login page choose **Forgot password?** and enter your email.
- You will receive a one-time reset link by email.
- Use the link to set a new password.

### Change language
Use the language switcher in the top corner to switch between Finnish (FI) and English (EN). The choice is stored in your browser.

### Change currency
The workspace view has a **Currency** picker at the top. The selected currency drives how the goal, the savings table, the chart, and the monthly entries are displayed. Values are always stored internally in EUR and converted for display. When you type a value (goal, monthly entry), the input is interpreted in the **selected currency** and converted to EUR for storage.

## 2. Workspaces

### Create a workspace
1. After your first login you are taken to the **Get started** page.
2. Name the workspace (e.g. "Household") and press **Create**.
3. You become the workspace **admin** automatically.

### Join an existing workspace
1. Ask the workspace admin for an 8-character join code.
2. On Get started, type the code into the field and press **Join**.

### Switch between workspaces
The top bar shows the current workspace. You can create a new workspace with **+ Workspace**.

## 3. Savings and income (end user)

### Create a savings or income entry
- In the left panel, use the **New savings or income title…** field, type a name and press Enter.
- Use the search field to find existing entries.

### Edit an entry
Pick an entry from the list. On the right you can:
- Edit the title by clicking it.
- Add notes in the **Notes…** field.
- Assign one or more **assignees** from workspace members.
- Delete the entry with the **Delete** button.

### Folders
Entries can be organized into folders and subfolders.
- Create a new folder with **New folder**.
- Add a subfolder under an existing folder.
- Rename or delete a folder. Deleted folders' entries move to **Uncategorized**.
- Reorder by dragging.

### Monthly entries
Each entry has a **Monthly entries** section.
- **Add month** appends the next month.
- Each month has two values: **Planned** and **Actual**.
- Values are shown in the selected currency and stored in EUR.
- You can edit individual months and the totals. Editing a total spreads the value evenly across 12 months.

### Goal
- Set a **Goal** amount and **Target date**.
- The app shows how many days remain to the target.
- When the currency changes, the goal is shown converted; new input is interpreted in the selected currency.

### Savings breakdown (chart)
The **Savings breakdown** chart can be grouped:
- **By item** or **By assignee**
- Compared as **Actual / Plan**

### Save status
The top of the view shows a status indicator: **Saving…**, **Saved**, or **Unsaved changes**. Changes are saved automatically.

## 4. Admin features

### Invite users with a join code
The **Join code** in the top bar is click-to-copy. Share it with someone you want to invite. They can sign up and enter the code on the Get started page.

### Add a user by email
1. Open the **Users** page.
2. Use the **Add user by email** form.
3. If the user already has an account, they are added directly. Otherwise an invite email is sent.

### Role management
Each member is either an **Admin** or a **Member**. Admins can:
- Invite and remove users
- Change other members' roles (not another admin's role)
- Manage folder visibility
- Read the audit log

A workspace must always have at least one admin.

### Remove a user
On the Users page, **Remove** removes the user from the workspace after confirmation.

### Folder visibility
A folder's **Visibility** setting lets you restrict which members can see the folder and its entries. Admins always have access. Subfolders inherit unless they have their own restriction.

### Audit log
The **Audit log** page lists workspace changes in chronological order: who made the change, what entry, and when.

### Free plan user limit
A workspace on the free plan can have up to **4 members**. When the limit is reached, pressing **Add user** opens a dialog with two options:
- **Ok** — closes the dialog.
- **Contact me for a paid plan** — sends a request to the Keywi team. The dialog closes and your interest is recorded. Superusers see your request in the Users view (see below).

Superusers bypass this limit entirely and can keep adding members.

## 5. Superuser features

A superuser has system-wide privileges.

### Other users
On the Users page, a superuser sees an **Other users** section listing every user across every workspace.

### Manage roles and memberships
A superuser can:
- Change a user's role in any workspace
- Remove a user from a workspace
- Grant or revoke superuser privileges

### Paid plan requests
When a non-superuser hits the free member limit and clicks **Contact me for a paid plan**, a request is logged for that user. On the Users page, superusers see an amber **Paid plan requested** badge next to the user's name (both in the members list and in **Other users**), along with the time of the latest request.

### Safeguards
- You cannot revoke your own superuser role if you are the last superuser — grant the role to someone else first.
- Revoking your own superuser role requires confirmation.

## 6. Tips

- **Click to edit**: most fields can be edited inline by clicking.
- **Drag to reorder**: list order can be changed by dragging.
- **Quick copy join code**: click the code at the top of the workspace view to copy.
- **Auto-save**: changes save automatically; watch the save status indicator.
- **Currency**: all values are stored in EUR, so changing the currency does not alter stored data — only how it is displayed.
`,K=`# Käyttöohje

Tämä on Keywi-sovelluksen käyttöohje. Sovellus on monikäyttäjäinen säästöjen ja tulojen seurantatyökalu, jossa työtilan jäsenet voivat suunnitella, kirjata ja seurata säästöjä yhdessä.

## 1. Aloittaminen

### Rekisteröityminen
1. Avaa etusivu ja valitse **Rekisteröidy**.
2. Syötä nimi, sähköposti ja vähintään 8 merkin salasana.
3. Vahvista painamalla **Luo tili**.

### Kirjautuminen
1. Valitse etusivulta **Kirjaudu**.
2. Syötä sähköposti ja salasana.
3. Voit valita **Muista minut**, jolloin istunto säilyy laitteella.

### Salasanan nollaus
- Kirjautumissivulla valitse **Unohditko salasanasi?** ja syötä sähköpostisi.
- Saat sähköpostiin nollauslinkin. Linkki on kertakäyttöinen ja vanhenee.
- Linkin kautta voit asettaa uuden salasanan.

### Kielen vaihto
Yläkulman kielivalitsimesta voit vaihtaa kielen suomen (FI) ja englannin (EN) välillä. Valinta tallennetaan selaimeen.

### Valuutan vaihto
Työtilanäkymän yläosassa on **Valuutta**-valitsin. Valittu valuutta vaikuttaa siihen, missä yksikössä tavoite, säästötaulukko, diagrammi ja kuukausimerkinnät näytetään. Arvot tallennetaan sisäisesti aina euroina ja muunnetaan näytettäväksi valitussa valuutassa. Kun syötät arvoja (tavoite, kuukausimerkintä), syöte tulkitaan **valitussa valuutassa** ja muunnetaan euroiksi tallennusta varten.

## 2. Työtilat

### Työtilan luominen
1. Ensimmäisen kirjautumisen jälkeen sinut ohjataan **Aloita**-sivulle.
2. Anna työtilalle nimi (esim. "Kotitalous") ja paina **Luo**.
3. Sinusta tulee automaattisesti tämän työtilan **ylläpitäjä**.

### Liittyminen olemassa olevaan työtilaan
1. Pyydä työtilan ylläpitäjältä 8-merkkinen liittymiskoodi.
2. Aloita-sivulla syötä koodi kenttään ja paina **Liity**.

### Työtilojen välillä vaihtaminen
Yläpalkista löydät nykyisen työtilan nimen. Voit luoda uuden työtilan painamalla **+ Työtila**.

## 3. Säästöt ja tulot (loppukäyttäjä)

### Säästö- tai tulokohteen luominen
- Vasemmasta paneelista valitse **Uuden säästön tai tulonlähteen otsikko…** -kenttä, syötä nimi ja paina Enter.
- Voit etsiä olemassa olevia kohteita hakukentästä.

### Kohteen muokkaus
Valitse kohde listasta. Oikealla puolella voit:
- Muokata otsikkoa klikkaamalla sitä.
- Lisätä muistiinpanoja **Muistiinpanot…**-kenttään.
- Asettaa yhden tai useita **vastuuhenkilöitä** työtilan jäsenistä.
- Poistaa kohteen **Poista**-painikkeella.

### Kansiot
Kohteet voi järjestää kansioihin ja alikansioihin.
- Luo uusi kansio **Uusi kansio** -painikkeella.
- Lisää alikansio aiemmin luodun kansion alle.
- Nimeä kansio uudelleen tai poista se. Jos poistat kansion, sen kohteet siirtyvät **Kategorisoimattomat**-ryhmään.
- Listan järjestystä voi muuttaa vetämällä.

### Kuukausimerkinnät
Kohteen alta löytyy **Kuukausimerkinnät**-osio.
- **Lisää kuukausi** lisää seuraavan kuukauden riville.
- Jokaisella kuukaudella on kaksi arvoa: **Suunniteltu** ja **Toteuma**.
- Arvot näytetään valitussa valuutassa ja tallennetaan euroina.
- Voit muokata sekä yksittäisen kuukauden että kokonaissummia. Kokonaissumman muokkaus jakaa arvon tasaisesti 12 kuukaudelle.

### Tavoite (Goal)
- Aseta **Tavoite**-summa ja **Tavoiteaika**.
- Sovellus näyttää montako päivää tavoitepäivään on jäljellä.
- Jos valuutta vaihtuu, tavoitearvo näytetään muunnettuna; uudet syötteet tulkitaan valitussa valuutassa.

### Säästöjen jakauma (diagrammi)
**Säästöjen jakauma** -diagrammi näyttää säästöt:
- **Kohteittain** tai **Vastuuhenkilöittäin**
- **Toteuma / Suunnitelma** -vertailuna

### Tallennuksen tila
Yläosassa näkyy ilmaisin: **Tallennetaan…**, **Tallennettu** tai **Tallentamattomia muutoksia**. Muutokset tallentuvat automaattisesti.

## 4. Ylläpitäjän toiminnot (Admin)

### Käyttäjien kutsuminen liittymiskoodilla
Yläpalkin **Liittymiskoodi**-kenttä on klikkaamalla kopioitavissa. Jaa koodi henkilölle, jonka haluat kutsua. Hän voi rekisteröityä ja syöttää koodin Aloita-sivulla.

### Käyttäjän lisääminen sähköpostilla
1. Avaa **Käyttäjät**-sivu.
2. Käytä **Lisää käyttäjä sähköpostilla** -lomaketta.
3. Jos käyttäjällä on jo tili, hänet lisätään suoraan. Muuten hänelle lähetetään kutsu sähköpostitse.

### Roolien hallinta
Jokainen jäsen on joko **Ylläpitäjä** tai **Jäsen**. Ylläpitäjät voivat:
- Kutsua ja poistaa käyttäjiä
- Muuttaa muiden jäsenten rooleja (ei toisen ylläpitäjän roolia)
- Hallita kansion näkyvyyttä
- Lukea muutoshistoriaa

Työtilassa on aina oltava vähintään yksi ylläpitäjä.

### Käyttäjän poistaminen
Käyttäjät-sivulta **Poista** poistaa käyttäjän työtilasta. Häneltä pyydetään vahvistus.

### Kansion näkyvyyden rajaaminen
Kansion **Näkyvyys**-asetuksesta voit rajata, ketkä jäsenet näkevät kansion ja sen kohteet. Ylläpitäjillä on aina pääsy. Alikansiot perivät säännön, ellei niillä ole omaa rajoitusta.

### Muutoshistoria (Audit log)
**Muutoshistoria**-sivu näyttää työtilan muutokset aikajärjestyksessä: kuka teki muutoksen, mihin kohteeseen ja milloin.

### Ilmaisversion käyttäjäraja
Ilmaisversion työtilassa voi olla enintään **4 jäsentä**. Kun raja täyttyy, **Lisää käyttäjä** -painikkeen painaminen avaa valintaikkunan, jossa on kaksi vaihtoehtoa:
- **Ok** — sulkee ikkunan.
- **Contact me for a paid plan** — lähettää pyynnön Keywi-tiimille. Ikkuna sulkeutuu ja kiinnostuksesi kirjataan. Pääkäyttäjät näkevät pyyntösi Käyttäjät-sivulla (ks. alla).

Pääkäyttäjät ohittavat tämän rajan ja voivat jatkaa jäsenten lisäämistä.

## 5. Pääkäyttäjän toiminnot (Superuser)

Pääkäyttäjällä on järjestelmänlaajuiset oikeudet.

### Muut käyttäjät
Käyttäjät-sivulla pääkäyttäjä näkee **Muut käyttäjät** -osion, jossa listataan kaikki käyttäjät kaikista työtiloista.

### Roolien ja jäsenyyksien muokkaus
Pääkäyttäjä voi:
- Muuttaa käyttäjän roolia missä tahansa työtilassa
- Poistaa käyttäjän työtilasta
- Myöntää tai peruuttaa pääkäyttäjäoikeuksia

### Maksullisen version pyynnöt
Kun ei-pääkäyttäjä törmää ilmaisversion jäsenrajaan ja painaa **Contact me for a paid plan**, kyseiselle käyttäjälle kirjataan pyyntö. Käyttäjät-sivulla pääkäyttäjät näkevät käyttäjän nimen vieressä keltaisen **Maksullista versiota pyydetty** -merkin (sekä jäsenlistassa että **Muut käyttäjät** -osiossa) ja viimeisimmän pyynnön ajankohdan.

### Suojaukset
- Et voi peruuttaa omaa pääkäyttäjärooliasi, jos olet viimeinen pääkäyttäjä – myönnä rooli ensin jollekin toiselle.
- Oman pääkäyttäjäroolin peruutus vaatii vahvistuksen.

## 6. Vinkit

- **Klikkaa muokataksesi**: useimpia kenttiä voi muokata suoraan klikkaamalla niitä.
- **Vetämällä järjestäminen**: listojen järjestystä voi muuttaa raahaamalla.
- **Liittymiskoodin pikakopiointi**: klikkaa työtilanäkymän yläosan koodia kopioidaksesi.
- **Automaattitallennus**: muutokset tallentuvat itsestään; tarkkaile tallennuksen tilailmaisinta.
- **Valuutta**: kaikki arvot tallennetaan euroina, joten valuutan vaihto ei muuta tallennettua dataa – vain näyttöyksikön.
`;function T(c){const y=c.split(`
`),a=[];let t=null,s=null,l=0;const r=o=>{const n=[],d=/\*\*([^*]+)\*\*|`([^`]+)`/g;let h=0,i,p=0;for(;(i=d.exec(o))!==null;)i.index>h&&n.push(o.slice(h,i.index)),i[1]?n.push(e.jsx("strong",{children:i[1]},`b${p++}`)):i[2]&&n.push(e.jsx("code",{className:"rounded bg-muted px-1 py-0.5 text-sm",children:i[2]},`c${p++}`)),h=i.index+i[0].length;return h<o.length&&n.push(o.slice(h)),n},m=()=>{t&&(a.push(e.jsx("ul",{className:"my-3 ml-6 list-disc space-y-1",children:t.map((o,n)=>e.jsx("li",{children:r(o)},n))},`ul-${l++}`)),t=null)},u=()=>{s&&(a.push(e.jsx("p",{className:"my-3 leading-relaxed",children:r(s.join(" "))},`p-${l++}`)),s=null)},k=()=>{m(),u()};for(const o of y){const n=o.trimEnd();if(!n.trim()){k();continue}if(n.startsWith("# ")){k(),a.push(e.jsx("h1",{className:"mt-6 mb-4 text-4xl font-bold",children:r(n.slice(2))},`h-${l++}`));continue}if(n.startsWith("## ")){k(),a.push(e.jsx("h2",{className:"mt-8 mb-3 text-2xl font-semibold",children:r(n.slice(3))},`h-${l++}`));continue}if(n.startsWith("### ")){k(),a.push(e.jsx("h3",{className:"mt-5 mb-2 text-lg font-semibold",children:r(n.slice(4))},`h-${l++}`));continue}const d=n.match(/^\d+\.\s+(.*)$/);if(d){u(),t||(t=[]),t.push(d[1]);continue}if(n.startsWith("- ")){u(),t||(t=[]),t.push(n.slice(2));continue}m(),s||(s=[]),s.push(n.trim())}return k(),a}function E(){const{t:c,i18n:y}=j(),a=g(),[t,s]=v.useState(!1);v.useEffect(()=>{s(!0),w()},[]);const l=t?c:f.getFixedT("en"),m=(t?y.language:"en")?.toLowerCase().startsWith("fi")?K:A,u=()=>{t&&a.history.canGoBack()?a.history.back():a.navigate({to:"/"})};return e.jsxs("div",{className:"min-h-screen bg-background text-foreground",children:[e.jsx("header",{className:"border-b border-border",children:e.jsxs("div",{className:"mx-auto flex max-w-3xl items-center justify-between px-6 py-4",children:[e.jsx(b,{to:"/",className:"text-lg font-bold tracking-tight",style:{fontFamily:"Fredoka, sans-serif"},children:"🌸 Keywi"}),e.jsxs("div",{className:"flex items-center gap-3",children:[t?e.jsx(x,{}):e.jsx("span",{className:"inline-block h-8 w-10"}),e.jsx("button",{type:"button",onClick:u,className:"kawaii-button-soft text-sm",children:l("common.back")})]})]})}),e.jsx("main",{className:"mx-auto max-w-3xl px-6 py-10",children:e.jsx("article",{className:"prose-like",children:T(m)})})]})}export{E as component};
