import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useRouter, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as applyDetectedLanguage, L as LanguageSwitcher } from "./router-CLHUrko-.mjs";
import { i as instance } from "../_libs/i18next.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { u as useTranslation } from "../_libs/react-i18next.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./createSsrRpc-B-oggCnm.mjs";
import "./server-ACSZmim3.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-CAaNNUN6.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./client-F9s_q744.mjs";
import "../_libs/zod.mjs";
import "../_libs/use-sync-external-store.mjs";
const guideEn = `# User Guide

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
`;
const guideFi = '# Käyttöohje\n\nTämä on Keywi-sovelluksen käyttöohje. Sovellus on monikäyttäjäinen säästöjen ja tulojen seurantatyökalu, jossa työtilan jäsenet voivat suunnitella, kirjata ja seurata säästöjä yhdessä.\n\n## 1. Aloittaminen\n\n### Rekisteröityminen\n1. Avaa etusivu ja valitse **Rekisteröidy**.\n2. Syötä nimi, sähköposti ja vähintään 8 merkin salasana.\n3. Vahvista painamalla **Luo tili**.\n\n### Kirjautuminen\n1. Valitse etusivulta **Kirjaudu**.\n2. Syötä sähköposti ja salasana.\n3. Voit valita **Muista minut**, jolloin istunto säilyy laitteella.\n\n### Salasanan nollaus\n- Kirjautumissivulla valitse **Unohditko salasanasi?** ja syötä sähköpostisi.\n- Saat sähköpostiin nollauslinkin. Linkki on kertakäyttöinen ja vanhenee.\n- Linkin kautta voit asettaa uuden salasanan.\n\n### Kielen vaihto\nYläkulman kielivalitsimesta voit vaihtaa kielen suomen (FI) ja englannin (EN) välillä. Valinta tallennetaan selaimeen.\n\n### Valuutan vaihto\nTyötilanäkymän yläosassa on **Valuutta**-valitsin. Valittu valuutta vaikuttaa siihen, missä yksikössä tavoite, säästötaulukko, diagrammi ja kuukausimerkinnät näytetään. Arvot tallennetaan sisäisesti aina euroina ja muunnetaan näytettäväksi valitussa valuutassa. Kun syötät arvoja (tavoite, kuukausimerkintä), syöte tulkitaan **valitussa valuutassa** ja muunnetaan euroiksi tallennusta varten.\n\n## 2. Työtilat\n\n### Työtilan luominen\n1. Ensimmäisen kirjautumisen jälkeen sinut ohjataan **Aloita**-sivulle.\n2. Anna työtilalle nimi (esim. "Kotitalous") ja paina **Luo**.\n3. Sinusta tulee automaattisesti tämän työtilan **ylläpitäjä**.\n\n### Liittyminen olemassa olevaan työtilaan\n1. Pyydä työtilan ylläpitäjältä 8-merkkinen liittymiskoodi.\n2. Aloita-sivulla syötä koodi kenttään ja paina **Liity**.\n\n### Työtilojen välillä vaihtaminen\nYläpalkista löydät nykyisen työtilan nimen. Voit luoda uuden työtilan painamalla **+ Työtila**.\n\n## 3. Säästöt ja tulot (loppukäyttäjä)\n\n### Säästö- tai tulokohteen luominen\n- Vasemmasta paneelista valitse **Uuden säästön tai tulonlähteen otsikko…** -kenttä, syötä nimi ja paina Enter.\n- Voit etsiä olemassa olevia kohteita hakukentästä.\n\n### Kohteen muokkaus\nValitse kohde listasta. Oikealla puolella voit:\n- Muokata otsikkoa klikkaamalla sitä.\n- Lisätä muistiinpanoja **Muistiinpanot…**-kenttään.\n- Asettaa yhden tai useita **vastuuhenkilöitä** työtilan jäsenistä.\n- Poistaa kohteen **Poista**-painikkeella.\n\n### Kansiot\nKohteet voi järjestää kansioihin ja alikansioihin.\n- Luo uusi kansio **Uusi kansio** -painikkeella.\n- Lisää alikansio aiemmin luodun kansion alle.\n- Nimeä kansio uudelleen tai poista se. Jos poistat kansion, sen kohteet siirtyvät **Kategorisoimattomat**-ryhmään.\n- Listan järjestystä voi muuttaa vetämällä.\n\n### Kuukausimerkinnät\nKohteen alta löytyy **Kuukausimerkinnät**-osio.\n- **Lisää kuukausi** lisää seuraavan kuukauden riville.\n- Jokaisella kuukaudella on kaksi arvoa: **Suunniteltu** ja **Toteuma**.\n- Arvot näytetään valitussa valuutassa ja tallennetaan euroina.\n- Voit muokata sekä yksittäisen kuukauden että kokonaissummia. Kokonaissumman muokkaus jakaa arvon tasaisesti 12 kuukaudelle.\n\n### Tavoite (Goal)\n- Aseta **Tavoite**-summa ja **Tavoiteaika**.\n- Sovellus näyttää montako päivää tavoitepäivään on jäljellä.\n- Jos valuutta vaihtuu, tavoitearvo näytetään muunnettuna; uudet syötteet tulkitaan valitussa valuutassa.\n\n### Säästöjen jakauma (diagrammi)\n**Säästöjen jakauma** -diagrammi näyttää säästöt:\n- **Kohteittain** tai **Vastuuhenkilöittäin**\n- **Toteuma / Suunnitelma** -vertailuna\n\n### Tallennuksen tila\nYläosassa näkyy ilmaisin: **Tallennetaan…**, **Tallennettu** tai **Tallentamattomia muutoksia**. Muutokset tallentuvat automaattisesti.\n\n## 4. Ylläpitäjän toiminnot (Admin)\n\n### Käyttäjien kutsuminen liittymiskoodilla\nYläpalkin **Liittymiskoodi**-kenttä on klikkaamalla kopioitavissa. Jaa koodi henkilölle, jonka haluat kutsua. Hän voi rekisteröityä ja syöttää koodin Aloita-sivulla.\n\n### Käyttäjän lisääminen sähköpostilla\n1. Avaa **Käyttäjät**-sivu.\n2. Käytä **Lisää käyttäjä sähköpostilla** -lomaketta.\n3. Jos käyttäjällä on jo tili, hänet lisätään suoraan. Muuten hänelle lähetetään kutsu sähköpostitse.\n\n### Roolien hallinta\nJokainen jäsen on joko **Ylläpitäjä** tai **Jäsen**. Ylläpitäjät voivat:\n- Kutsua ja poistaa käyttäjiä\n- Muuttaa muiden jäsenten rooleja (ei toisen ylläpitäjän roolia)\n- Hallita kansion näkyvyyttä\n- Lukea muutoshistoriaa\n\nTyötilassa on aina oltava vähintään yksi ylläpitäjä.\n\n### Käyttäjän poistaminen\nKäyttäjät-sivulta **Poista** poistaa käyttäjän työtilasta. Häneltä pyydetään vahvistus.\n\n### Kansion näkyvyyden rajaaminen\nKansion **Näkyvyys**-asetuksesta voit rajata, ketkä jäsenet näkevät kansion ja sen kohteet. Ylläpitäjillä on aina pääsy. Alikansiot perivät säännön, ellei niillä ole omaa rajoitusta.\n\n### Muutoshistoria (Audit log)\n**Muutoshistoria**-sivu näyttää työtilan muutokset aikajärjestyksessä: kuka teki muutoksen, mihin kohteeseen ja milloin.\n\n### Ilmaisversion käyttäjäraja\nIlmaisversion työtilassa voi olla enintään **4 jäsentä**. Kun raja täyttyy, **Lisää käyttäjä** -painikkeen painaminen avaa valintaikkunan, jossa on kaksi vaihtoehtoa:\n- **Ok** — sulkee ikkunan.\n- **Contact me for a paid plan** — lähettää pyynnön Keywi-tiimille. Ikkuna sulkeutuu ja kiinnostuksesi kirjataan. Pääkäyttäjät näkevät pyyntösi Käyttäjät-sivulla (ks. alla).\n\nPääkäyttäjät ohittavat tämän rajan ja voivat jatkaa jäsenten lisäämistä.\n\n## 5. Pääkäyttäjän toiminnot (Superuser)\n\nPääkäyttäjällä on järjestelmänlaajuiset oikeudet.\n\n### Muut käyttäjät\nKäyttäjät-sivulla pääkäyttäjä näkee **Muut käyttäjät** -osion, jossa listataan kaikki käyttäjät kaikista työtiloista.\n\n### Roolien ja jäsenyyksien muokkaus\nPääkäyttäjä voi:\n- Muuttaa käyttäjän roolia missä tahansa työtilassa\n- Poistaa käyttäjän työtilasta\n- Myöntää tai peruuttaa pääkäyttäjäoikeuksia\n\n### Maksullisen version pyynnöt\nKun ei-pääkäyttäjä törmää ilmaisversion jäsenrajaan ja painaa **Contact me for a paid plan**, kyseiselle käyttäjälle kirjataan pyyntö. Käyttäjät-sivulla pääkäyttäjät näkevät käyttäjän nimen vieressä keltaisen **Maksullista versiota pyydetty** -merkin (sekä jäsenlistassa että **Muut käyttäjät** -osiossa) ja viimeisimmän pyynnön ajankohdan.\n\n### Suojaukset\n- Et voi peruuttaa omaa pääkäyttäjärooliasi, jos olet viimeinen pääkäyttäjä – myönnä rooli ensin jollekin toiselle.\n- Oman pääkäyttäjäroolin peruutus vaatii vahvistuksen.\n\n## 6. Vinkit\n\n- **Klikkaa muokataksesi**: useimpia kenttiä voi muokata suoraan klikkaamalla niitä.\n- **Vetämällä järjestäminen**: listojen järjestystä voi muuttaa raahaamalla.\n- **Liittymiskoodin pikakopiointi**: klikkaa työtilanäkymän yläosan koodia kopioidaksesi.\n- **Automaattitallennus**: muutokset tallentuvat itsestään; tarkkaile tallennuksen tilailmaisinta.\n- **Valuutta**: kaikki arvot tallennetaan euroina, joten valuutan vaihto ei muuta tallennettua dataa – vain näyttöyksikön.\n';
function renderMarkdown(src) {
  const lines = src.split("\n");
  const out = [];
  let list = null;
  let para = null;
  let key = 0;
  const inline = (text) => {
    const parts = [];
    const re = /\*\*([^*]+)\*\*|`([^`]+)`/g;
    let last = 0;
    let m;
    let i = 0;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      if (m[1]) parts.push(/* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: m[1] }, `b${i++}`));
      else if (m[2]) parts.push(/* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-1 py-0.5 text-sm", children: m[2] }, `c${i++}`));
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };
  const flushList = () => {
    if (list) {
      out.push(/* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "my-3 ml-6 list-disc space-y-1", children: list.map((li, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: inline(li) }, i)) }, `ul-${key++}`));
      list = null;
    }
  };
  const flushPara = () => {
    if (para) {
      out.push(/* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "my-3 leading-relaxed", children: inline(para.join(" ")) }, `p-${key++}`));
      para = null;
    }
  };
  const flushAll = () => {
    flushList();
    flushPara();
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushAll();
      continue;
    }
    if (line.startsWith("# ")) {
      flushAll();
      out.push(/* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-6 mb-4 text-4xl font-bold", children: inline(line.slice(2)) }, `h-${key++}`));
      continue;
    }
    if (line.startsWith("## ")) {
      flushAll();
      out.push(/* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-8 mb-3 text-2xl font-semibold", children: inline(line.slice(3)) }, `h-${key++}`));
      continue;
    }
    if (line.startsWith("### ")) {
      flushAll();
      out.push(/* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-5 mb-2 text-lg font-semibold", children: inline(line.slice(4)) }, `h-${key++}`));
      continue;
    }
    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ol) {
      flushPara();
      if (!list) list = [];
      list.push(ol[1]);
      continue;
    }
    if (line.startsWith("- ")) {
      flushPara();
      if (!list) list = [];
      list.push(line.slice(2));
      continue;
    }
    flushList();
    if (!para) para = [];
    para.push(line.trim());
  }
  flushAll();
  return out;
}
function HelpPage() {
  const {
    t,
    i18n: i18nHook
  } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
    applyDetectedLanguage();
  }, []);
  const tr = mounted ? t : instance.getFixedT("en");
  const lang = mounted ? i18nHook.language : "en";
  const content = lang?.toLowerCase().startsWith("fi") ? guideFi : guideEn;
  const handleBack = () => {
    if (mounted && router.history.canGoBack()) {
      router.history.back();
    } else {
      router.navigate({
        to: "/"
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-3xl items-center justify-between px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-lg font-bold tracking-tight", style: {
        fontFamily: "Fredoka, sans-serif"
      }, children: "🌸 Keywi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        mounted ? /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageSwitcher, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-8 w-10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleBack, className: "kawaii-button-soft text-sm", children: tr("common.back") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-3xl px-6 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "prose-like", children: renderMarkdown(content) }) })
  ] });
}
export {
  HelpPage as component
};
