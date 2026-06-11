import { b as QueryClient, c as MutationCache } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider, u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { U as redirect, o as isRedirect } from "../_libs/tanstack__router-core.mjs";
import { t as toast, T as Toaster$1 } from "../_libs/sonner.mjs";
import { i as instance } from "../_libs/i18next.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { c as createSsrRpc } from "./createSsrRpc-B-oggCnm.mjs";
import { c as createServerFn } from "./server-ACSZmim3.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-CAaNNUN6.mjs";
import { e as ensureSupabase, t as tryGetSupabase } from "./client-F9s_q744.mjs";
import { i as initReactI18next, u as useTranslation } from "../_libs/react-i18next.mjs";
import { o as objectType, e as enumType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/use-sync-external-store.mjs";
function useServerFn(serverFn) {
  const router2 = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router2.stores.location.get();
        return router2.navigate(router2.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router2, serverFn]);
}
const common$1 = { "appName": " ", "language": "Language", "english": "English", "finnish": "Finnish", "logout": "Log out", "back": "Back", "loading": "Loading…", "saving": "Saving…", "saved": "Saved", "unsaved": "Unsaved changes", "delete": "Delete", "cancel": "Cancel", "create": "Create", "creating": "Creating…", "join": "Join", "joining": "Joining…", "help": "User guide", "add": "Add" };
const landing$1 = { "title": "Kawaii — Multi-tenant item tracker", "description": "Track savings and income. Create or join a workspace with a code.", "login": "Log in", "signup": "Sign up", "heading": "Track savings and income across workstreams.", "sub": "Create a workspace, share an 8-character join code, and manage savings and income together to reach your financial targets", "getStarted": "Get started", "haveAccount": "I have an account" };
const login$1 = { "metaTitle": "Log in — Tracker", "title": "Welcome back", "subtitle": "Log in to your workspace.", "email": "Email", "password": "Password", "submit": "Log in", "submitting": "Logging in…", "forgotPassword": "Forgot password?", "rememberMe": "Remember me", "newHere": "New here?", "createAccount": "Create an account", "showPassword": "Show password", "hidePassword": "Hide password" };
const signup$1 = { "metaTitle": "Sign up — Kawaii", "title": "Create your account", "subtitle": "One account, many workspaces.", "name": "Your name", "email": "Email", "password": "Password (8+ characters)", "submit": "Create account", "submitting": "Creating…", "haveAccount": "Already have an account?", "loginLink": "Log in" };
const onboarding$1 = { "metaTitle": "Get started — Tracker", "heading": "Get started", "sub": "Create a new workspace, or join one with an 8-character code.", "createTitle": "Create a workspace", "joinTitle": "Join with a code", "namePlaceholder": "Acme Inc.", "codePlaceholder": "ABCD2345" };
const workspace$1 = { "metaTitle": "Workspace — Tracker", "currency": "Currency", "newWorkspace": "+ Workspace", "joinCode": "Join code:", "joinCodeTitle": "Share this code so teammates can join the workspace. Click to copy.", "addUser": "+ Add user", "inviteTitle": "Invite a user to this workspace", "inviteBody": "Share this join code with the person you want to invite. They can sign up and enter the code on the onboarding page to join.", "copyCode": "Copy code", "copied": "Copied!", "close": "Close", "onlyAdmins": "Only admins can invite new users.", "searchPlaceholder": "Search savings and income…", "newItemPlaceholder": "New savings or income title…", "noItems": "No savings and income yet.", "selectOrCreate": "Select a savings or income entry, or create a new one.", "assignee": "Assignee", "assignees": "Assignees", "unassigned": "Unassigned", "notesPlaceholder": "Notes…", "amount": "Savings amount (€)", "amountPlaceholder": "0.00", "chartTitle": "Savings breakdown", "chartEmpty": "Add monthly entries to see the chart.", "chartTotal": "Plan", "actual": "Actual", "planned": "Planned", "actualPlan": "Actual / Plan", "byItem": "By item", "byAssignee": "By assignee", "monthAmount": "Month", "monthlyEntries": "Monthly entries", "noEntries": "No monthly entries yet.", "savingsTableTitle": "Savings table", "addMonth": "Add month", "goalAmount": "Goal", "goalDate": "Target date", "goalDateShort": "Target", "daysLeft": "{{count}} days left", "updated": "Updated {{when}}", "confirmDelete": "Delete this entry?", "tasks": "Tasks", "newTask": "New task…", "dragToReorder": "Drag to reorder", "clickToEdit": "Click to edit", "edit": "Edit", "folder": "Folder", "folders": "Folders", "newFolder": "New folder", "newFolderPrompt": "Folder name", "folderCreated": "Folder created", "addSubfolder": "Add subfolder", "renameFolder": "Rename folder", "confirmDeleteFolder": "Delete this folder? Items will become uncategorized.", "uncategorized": "Uncategorized", "folderVisibility": "Visibility", "folderVisibilityTitle": "Folder visibility", "folderVisibilityBody": "Restrict who can see this folder and the items inside it. Admins always have access. Subfolders inherit unless they have their own restriction.", "restrictAccess": "Restrict access", "allowedMembers": "Allowed members", "save": "Save", "manageUsers": "Users", "changeHistory": "Audit log" };
const forgot$1 = { "title": "Reset your password", "subtitle": "Enter your email and we'll send you a reset link.", "submit": "Send reset link" };
const reset$1 = { "title": "Set a new password", "subtitle": "Enter a new password for your account.", "submit": "Update password", "doneTitle": "Password updated", "doneSubtitle": "Redirecting you to log in…", "linkInvalid": "This reset link is invalid or has expired.", "requestNew": "Request a new link" };
const members$1 = { "title": "Users", "empty": "No users.", "admin": "Admin", "member": "Member", "remove": "Remove", "confirmRemove": "Remove {{name}} from this workspace?", "lastAdmin": "A workspace must have at least one admin.", "peerAdmin": "You cannot change another admin's role.", "addDirectTitle": "Add user by email", "addDirectBody": "If the user already has an account, they're added directly. Otherwise, an invite email is sent.", "addDirectBtn": "Add", "addedOk": "User added.", "alreadyMember": "User is already a member of this workspace.", "freeLimitReached": "Free user limit (4) reached. Upgrade to a paid plan to add more users. Our team will contact you.", "freeLimitTitle": "Free user limit reached", "freeLimitOk": "Ok", "freeLimitContact": "Contact me for a paid plan", "paidPlanRequested": "Thanks — our team will contact you soon.", "paidPlanBadge": "Paid plan requested", "paidPlanRequestedAt": "Requested {{when}}", "editName": "Edit name", "editEmail": "Edit email", "emailUpdated": "Email updated.", "otherUsersTitle": "Other users", "otherUsersBody": "All users across other workspaces. As superuser you can change their workspace roles, remove them from workspaces, and grant or revoke superuser.", "otherUsersEmpty": "No other users.", "removeFromWorkspace": "Remove", "noWorkspaces": "No workspaces", "grantSuperuser": "Grant superuser", "revokeSuperuser": "Revoke superuser", "superuserBadge": "Superuser", "cannotRevokeLast": "You are the last superuser — grant the role to someone else first.", "confirmSelfRevoke": "Revoke your own superuser role? You will lose superuser access.", "deleteUser": "Delete user", "deleteUserConfirmTitle": "Permanently delete this user?", "deleteUserConfirmBody": "{{name}} will be removed from authentication, all workspaces, and their data will be deleted. This cannot be undone.", "deleteUserSuccess": "User deleted.", "cannotDeleteSelf": "You cannot delete your own account here.", "cannotDeleteLastSuperuser": "Cannot delete the last superuser." };
const en = {
  common: common$1,
  landing: landing$1,
  login: login$1,
  signup: signup$1,
  onboarding: onboarding$1,
  workspace: workspace$1,
  forgot: forgot$1,
  reset: reset$1,
  members: members$1
};
const common = { "appName": " ", "language": "Kieli", "english": "Englanti", "finnish": "Suomi", "logout": "Kirjaudu ulos", "back": "Takaisin", "loading": "Ladataan…", "saving": "Tallennetaan…", "saved": "Tallennettu", "unsaved": "Tallentamattomia muutoksia", "delete": "Poista", "cancel": "Peruuta", "create": "Luo", "creating": "Luodaan…", "join": "Liity", "joining": "Liitytään…", "help": "Käyttöohje", "add": "Lisää" };
const landing = { "title": "Kawaii — Säästöjen ja tulojen seurantatyökalu", "description": "Seuraa säästöjä ja tuloja. Luo työtila tai liity koodilla.", "login": "Kirjaudu", "signup": "Rekisteröidy", "heading": "Seuraa porukkasi säästöjä\nja tuloja 💕", "sub": "Luo työtila, jaa 8-merkkinen liittymiskoodi ja hallitse säästöjä ja tuloja yhdessä saavuttaaksesi tavoitteesi", "getStarted": "Aloita", "haveAccount": "Minulla on tili" };
const login = { "metaTitle": "Kirjaudu — Seuranta", "title": "Tervetuloa takaisin", "subtitle": "Kirjaudu työtilaasi.", "email": "Sähköposti", "password": "Salasana", "submit": "Kirjaudu", "submitting": "Kirjaudutaan…", "forgotPassword": "Unohditko salasanasi?", "rememberMe": "Muista minut", "newHere": "Uusi käyttäjä?", "createAccount": "Luo tili", "showPassword": "Näytä salasana", "hidePassword": "Piilota salasana" };
const signup = { "metaTitle": "Rekisteröidy — Seuranta", "title": "Luo tili", "subtitle": "Yksi tili, useita työtiloja.", "name": "Nimesi", "email": "Sähköposti", "password": "Salasana (vähintään 8 merkkiä)", "submit": "Luo tili", "submitting": "Luodaan…", "haveAccount": "Onko sinulla jo tili?", "loginLink": "Kirjaudu" };
const onboarding = { "metaTitle": "Aloita — Seuranta", "heading": "Aloita", "sub": "Luo uusi työtila tai liity olemassa olevaan 8-merkkisellä koodilla.", "createTitle": "Luo työtila", "joinTitle": "Liity koodilla", "namePlaceholder": "Acme Oy", "codePlaceholder": "ABCD2345" };
const workspace = { "metaTitle": "Työtila — Seuranta", "currency": "Valuutta", "newWorkspace": "+ Työtila", "joinCode": "Liittymiskoodi:", "joinCodeTitle": "Jaa tämä koodi, jotta tiimisi voi liittyä. Kopioi klikkaamalla.", "addUser": "+ Lisää käyttäjä", "inviteTitle": "Kutsu käyttäjä tähän työtilaan", "inviteBody": "Jaa tämä liittymiskoodi henkilölle, jonka haluat kutsua. Hän voi rekisteröityä ja syöttää koodin liittymissivulla.", "copyCode": "Kopioi koodi", "copied": "Kopioitu!", "close": "Sulje", "onlyAdmins": "Vain ylläpitäjät voivat kutsua uusia käyttäjiä.", "searchPlaceholder": "Etsi säästöjä ja tuloja…", "newItemPlaceholder": "Uuden säästön tai tulonlähteen otsikko…", "noItems": "Ei vielä säästöjä eikä tuloja.", "selectOrCreate": "Valitse säästö- tai tulo tai luo uusi.", "assignee": "Vastuuhenkilö", "assignees": "Vastuuhenkilöt", "unassigned": "Ei vastuuhenkilöä", "notesPlaceholder": "Muistiinpanot…", "amount": "Säästöjen määrä (€)", "amountPlaceholder": "0,00", "chartTitle": "Säästöjen jakauma", "chartEmpty": "Lisää kuukausimerkintöjä nähdäksesi diagrammin.", "chartTotal": "Suunnitelma", "actual": "Toteuma", "planned": "Suunniteltu", "actualPlan": "Toteuma / Suunnitelma", "byItem": "Kohteittain", "byAssignee": "Vastuuhenkilöittäin", "monthAmount": "Kuukausi", "monthlyEntries": "Kuukausimerkinnät", "noEntries": "Ei vielä kuukausimerkintöjä.", "savingsTableTitle": "Säästötaulukko", "addMonth": "Lisää kuukausi", "goalAmount": "Tavoite", "goalDate": "Tavoiteaika", "goalDateShort": "Tavoite", "daysLeft": "{{count}} päivää jäljellä", "updated": "Päivitetty {{when}}", "confirmDelete": "Poistetaanko tämä?", "tasks": "Tehtävät", "newTask": "Uusi tehtävä…", "dragToReorder": "Järjestä vetämällä", "clickToEdit": "Klikkaa muokataksesi", "edit": "Muokkaa", "folder": "Kansio", "folders": "Kansiot", "newFolder": "Uusi kansio", "newFolderPrompt": "Kansion nimi", "folderCreated": "Kansio luotu", "addSubfolder": "Lisää alikansio", "renameFolder": "Nimeä kansio uudelleen", "confirmDeleteFolder": "Poistetaanko tämä kansio? Sen kohteet siirtyvät kategorisoimattomiksi.", "uncategorized": "Kategorisoimattomat", "folderVisibility": "Näkyvyys", "folderVisibilityTitle": "Kansion näkyvyys", "folderVisibilityBody": "Rajaa, ketkä näkevät tämän kansion ja sen kohteet. Ylläpitäjillä on aina pääsy. Alikansiot perivät säännön, ellei niillä ole omaa rajoitusta.", "restrictAccess": "Rajaa näkyvyyttä", "allowedMembers": "Sallitut jäsenet", "save": "Tallenna", "manageUsers": "Käyttäjät", "changeHistory": "Muutoshistoria" };
const forgot = { "title": "Nollaa salasanasi", "subtitle": "Syötä sähköpostisi, niin lähetämme nollauslinkin.", "submit": "Lähetä nollauslinkki" };
const reset = { "title": "Aseta uusi salasana", "subtitle": "Syötä tilillesi uusi salasana.", "submit": "Päivitä salasana", "doneTitle": "Salasana päivitetty", "doneSubtitle": "Sinut ohjataan kirjautumissivulle…", "linkInvalid": "Tämä nollauslinkki on virheellinen tai vanhentunut.", "requestNew": "Pyydä uusi linkki" };
const members = { "title": "Käyttäjät", "empty": "Ei käyttäjiä.", "admin": "Ylläpitäjä", "member": "Jäsen", "remove": "Poista", "confirmRemove": "Poistetaanko käyttäjä {{name}} työtilasta?", "lastAdmin": "Työtilassa on oltava vähintään yksi ylläpitäjä.", "peerAdmin": "Et voi muuttaa toisen ylläpitäjän roolia.", "addDirectTitle": "Lisää käyttäjä sähköpostilla", "addDirectBody": "Jos käyttäjällä on jo tili, hänet lisätään suoraan. Muussa tapauksessa hänelle lähetetään kutsu sähköpostitse.", "addDirectBtn": "Lisää", "addedOk": "Käyttäjä lisätty.", "alreadyMember": "Käyttäjä on jo tämän työtilan jäsen.", "freeLimitReached": "Ilmaisten käyttäjien maksimimäärä (4) saavutettu. Lisätäksesi käyttäjiä, ota maksullinen suunnitelma käyttöön. Tiimimme ottaa sinuun yhteyttä.", "freeLimitTitle": "Ilmaisten käyttäjien raja saavutettu", "freeLimitOk": "Ok", "freeLimitContact": "Ota yhteyttä maksullisesta suunnitelmasta", "paidPlanRequested": "Kiitos — tiimimme ottaa sinuun pian yhteyttä.", "paidPlanBadge": "Maksullinen suunnitelma pyydetty", "paidPlanRequestedAt": "Pyydetty {{when}}", "editName": "Muokkaa nimeä", "editEmail": "Muokkaa sähköpostia", "emailUpdated": "Sähköposti päivitetty.", "otherUsersTitle": "Muut käyttäjät", "otherUsersBody": "Kaikki käyttäjät muista työtiloista. Pääkäyttäjänä voit muuttaa heidän rooliaan, poistaa heidät työtiloista ja myöntää tai peruuttaa pääkäyttäjäoikeudet.", "otherUsersEmpty": "Ei muita käyttäjiä.", "removeFromWorkspace": "Poista", "noWorkspaces": "Ei työtiloja", "grantSuperuser": "Myönnä pääkäyttäjä", "revokeSuperuser": "Peruuta pääkäyttäjä", "superuserBadge": "Pääkäyttäjä", "cannotRevokeLast": "Olet viimeinen pääkäyttäjä — myönnä rooli ensin jollekin toiselle.", "confirmSelfRevoke": "Peruutetaanko oma pääkäyttäjärooli? Menetät pääkäyttäjäoikeudet.", "deleteUser": "Tuhoa käyttäjä", "deleteUserConfirmTitle": "Tuhotaanko käyttäjä pysyvästi?", "deleteUserConfirmBody": "{{name}} poistetaan kirjautumisesta ja kaikista työtiloista, ja kaikki hänen tietonsa tuhotaan. Tätä ei voi peruuttaa.", "deleteUserSuccess": "Käyttäjä tuhottu.", "cannotDeleteSelf": "Et voi tuhota omaa tiliäsi täältä.", "cannotDeleteLastSuperuser": "Viimeistä pääkäyttäjää ei voi tuhota." };
const fi = {
  common,
  landing,
  login,
  signup,
  onboarding,
  workspace,
  forgot,
  reset,
  members
};
if (!instance.isInitialized) {
  instance.use(initReactI18next).init({
    resources: { en: { translation: en }, fi: { translation: fi } },
    lng: "en",
    fallbackLng: "en",
    supportedLngs: ["en", "fi"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false }
  });
}
if (instance.language !== "en") {
  instance.changeLanguage("en");
}
function applyDetectedLanguage() {
  if (typeof window === "undefined") return;
  try {
    const stored = window.localStorage.getItem("lang");
    const nav = window.navigator.language?.toLowerCase() ?? "";
    const detected = stored || (nav.startsWith("fi") ? "fi" : "en");
    const lang = detected.startsWith("fi") ? "fi" : "en";
    if (instance.language !== lang) {
      instance.changeLanguage(lang);
    }
  } catch {
  }
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const currencySchema = enumType(["EUR", "USD", "GBP", "SEK", "NOK"]);
const getMyPreferredCurrency = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("1d037c2863d1446ad303aea281b3cc9b6294ee86eaa880a0bcae088e5d58b6a1"));
const updateMyPreferredCurrency = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  currency: currencySchema
}).parse(d)).handler(createSsrRpc("f7fb519415a24b7b7f1b6371f65c0ff7a223dbfb994c57c4df6bd0eef4a0aab7"));
const SUPPORTED_CURRENCIES = ["EUR", "USD", "GBP", "SEK", "NOK"];
const STORAGE_KEY = "keywi.currency";
const FALLBACK_RATES = {
  EUR: 1,
  USD: 1,
  GBP: 1,
  SEK: 1,
  NOK: 1
};
const CurrencyContext = reactExports.createContext(null);
function isCurrency(value) {
  return typeof value === "string" && SUPPORTED_CURRENCIES.includes(value);
}
async function fetchRates() {
  const symbols = SUPPORTED_CURRENCIES.filter((c) => c !== "EUR").join(",");
  const res = await fetch(
    `https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${symbols}`
  );
  if (!res.ok) throw new Error("FX fetch failed");
  const json = await res.json();
  const rates = { ...FALLBACK_RATES };
  for (const c of SUPPORTED_CURRENCIES) {
    if (c === "EUR") continue;
    if (typeof json.rates[c] === "number") rates[c] = json.rates[c];
  }
  return rates;
}
function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = reactExports.useState("EUR");
  const [userId, setUserId] = reactExports.useState(null);
  const queryClient = useQueryClient();
  reactExports.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isCurrency(stored)) setCurrencyState(stored);
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    const client = tryGetSupabase();
    if (!client) return;
    let mounted = true;
    client.auth.getUser().then(({ data }) => {
      if (mounted) setUserId(data.user?.id ?? null);
    });
    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  const fetchPreferred = useServerFn(getMyPreferredCurrency);
  const prefQ = useQuery({
    queryKey: ["preferred-currency", userId],
    queryFn: () => fetchPreferred(),
    enabled: !!userId,
    staleTime: 1e3 * 60 * 5
  });
  reactExports.useEffect(() => {
    const pref = prefQ.data?.currency;
    if (isCurrency(pref)) {
      setCurrencyState(pref);
      try {
        window.localStorage.setItem(STORAGE_KEY, pref);
      } catch {
      }
    }
  }, [prefQ.data]);
  const updatePreferred = useServerFn(updateMyPreferredCurrency);
  const updateMutation = useMutation({
    mutationFn: (c) => updatePreferred({ data: { currency: c } })
  });
  const setCurrency = reactExports.useCallback(
    (c) => {
      setCurrencyState(c);
      try {
        window.localStorage.setItem(STORAGE_KEY, c);
      } catch {
      }
      if (userId) {
        queryClient.setQueryData(["preferred-currency", userId], { currency: c });
        updateMutation.mutate(c);
      }
    },
    [userId, updateMutation, queryClient]
  );
  const ratesQ = useQuery({
    queryKey: ["fx", "EUR"],
    queryFn: fetchRates,
    staleTime: 1e3 * 60 * 60 * 12,
    // 12h
    gcTime: 1e3 * 60 * 60 * 24,
    retry: 1
  });
  const rates = ratesQ.data ?? FALLBACK_RATES;
  const value = reactExports.useMemo(() => {
    const rate = rates[currency] ?? 1;
    const convert = (eur) => eur * rate;
    const toEur = (disp) => rate ? disp / rate : disp;
    const format = (eur) => {
      try {
        return new Intl.NumberFormat(void 0, {
          style: "currency",
          currency
        }).format(convert(eur));
      } catch {
        return `${convert(eur).toFixed(2)} ${currency}`;
      }
    };
    return { currency, setCurrency, rates, convert, toEur, format };
  }, [currency, setCurrency, rates]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CurrencyContext.Provider, { value, children });
}
function useCurrency() {
  const ctx = reactExports.useContext(CurrencyContext);
  if (!ctx) {
    const convert = (eur) => eur;
    const toEur = (disp) => disp;
    return {
      currency: "EUR",
      setCurrency: () => {
      },
      rates: FALLBACK_RATES,
      convert,
      toEur,
      format: (eur) => new Intl.NumberFormat(void 0, { style: "currency", currency: "EUR" }).format(eur)
    };
  }
  return ctx;
}
const appCss = "/assets/styles-GChpjJpZ.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset: reset2 }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset2();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$c = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Keywi is the app for planning and tracking savings and income, from one person to a huge global enterprise" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Keywi is the app for planning and tracking savings and income, from one person to a huge global enterprise" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "twitter:description", content: "Keywi is the app for planning and tracking savings and income, from one person to a huge global enterprise" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0d8a6c92-8cf6-4721-873d-6fc5ed8f8ad8/id-preview-94859058--81d75f47-0994-4548-a216-bf2d97a3d0e8.lovable.app-1780035257012.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0d8a6c92-8cf6-4721-873d-6fc5ed8f8ad8/id-preview-94859058--81d75f47-0994-4548-a216-bf2d97a3d0e8.lovable.app-1780035257012.png" }
    ],
    links: [
      {
        rel: "icon",
        href: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ctext%20y%3D%22.9em%22%20font-size%3D%2290%22%3E%F0%9F%A5%9D%3C%2Ftext%3E%3C%2Fsvg%3E"
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap"
      },
      { rel: "stylesheet", href: appCss }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$c.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CurrencyProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SupabaseAuthSync, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, {})
  ] }) });
}
function SupabaseAuthSync() {
  const router2 = useRouter();
  const queryClient = useQueryClient();
  reactExports.useEffect(() => {
    let unsub;
    let cancelled = false;
    ensureSupabase().then((supabase) => {
      if (cancelled) return;
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED" && event !== "PASSWORD_RECOVERY") {
          return;
        }
        if (event === "SIGNED_OUT") {
          try {
            localStorage.removeItem("lastTenantId");
          } catch {
          }
          queryClient.cancelQueries();
          queryClient.clear();
          router2.invalidate();
        } else if (event === "PASSWORD_RECOVERY") {
          router2.navigate({ to: "/reset-password" });
        } else {
          queryClient.invalidateQueries();
          router2.invalidate();
        }
      });
      unsub = () => data.subscription.unsubscribe();
    }).catch((err) => console.error("Supabase init failed", err));
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [router2, queryClient]);
  return null;
}
const $$splitComponentImporter$a = () => import("./signup-imFHyCs8.mjs");
const Route$b = createFileRoute("/signup")({
  head: () => ({
    meta: [{
      title: "Sign up — Tracker"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./reset-password-YCvtPoie.mjs");
const Route$a = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{
      title: "Set new password — Tracker"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
function FlagGB({ className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 60 30", className, "aria-hidden": "true", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("clipPath", { id: "gb-c", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M0,0 v30 h60 v-30 z" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M0,0 v30 h60 v-30 z", fill: "#012169" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M0,0 L60,30 M60,0 L0,30", stroke: "#fff", strokeWidth: "6", clipPath: "url(#gb-c)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        d: "M0,0 L60,30 M60,0 L0,30",
        stroke: "#C8102E",
        strokeWidth: "4",
        clipPath: "url(#gb-c)"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M30,0 v30 M0,15 h60", stroke: "#fff", strokeWidth: "10" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M30,0 v30 M0,15 h60", stroke: "#C8102E", strokeWidth: "6" })
  ] });
}
function FlagFI({ className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 18 11", className, "aria-hidden": "true", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "18", height: "11", fill: "#fff" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "0", y: "4", width: "18", height: "3", fill: "#003580" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "0", width: "3", height: "11", fill: "#003580" })
  ] });
}
function LanguageSwitcher({ className = "" }) {
  const { i18n: i18n2, t } = useTranslation();
  const current = (i18n2.resolvedLanguage ?? i18n2.language ?? "en").startsWith("fi") ? "fi" : "en";
  const next = current === "fi" ? "en" : "fi";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: () => {
        try {
          window.localStorage.setItem("lang", next);
        } catch {
        }
        i18n2.changeLanguage(next);
      },
      "aria-label": t("common.language"),
      title: t("common.language"),
      className: `inline-flex h-8 w-10 items-center justify-center overflow-hidden rounded-md border border-border bg-background ${className}`,
      children: current === "fi" ? /* @__PURE__ */ jsxRuntimeExports.jsx(FlagFI, { className: "h-5 w-auto" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FlagGB, { className: "h-5 w-auto" })
    }
  );
}
const kawaiiKiwi = "/assets/kawaii-kiwi-Cgi5z5-s.png";
function KawaiiKey({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 64 64",
      xmlns: "http://www.w3.org/2000/svg",
      className,
      "aria-hidden": true,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "29", y: "26", width: "6", height: "22", rx: "3", fill: "#FFD23F", stroke: "#3a2a14", strokeWidth: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "35", y: "38", width: "7", height: "4", rx: "1.5", fill: "#FFD23F", stroke: "#3a2a14", strokeWidth: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "35", y: "44", width: "5", height: "4", rx: "1.5", fill: "#FFD23F", stroke: "#3a2a14", strokeWidth: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "32", cy: "20", r: "13", fill: "#FFD23F", stroke: "#3a2a14", strokeWidth: "2.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "32", cy: "20", r: "3", fill: "#fff7d6", stroke: "#3a2a14", strokeWidth: "1.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "27", cy: "22", r: "1.3", fill: "#3a2a14" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "37", cy: "22", r: "1.3", fill: "#3a2a14" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M28.5 25.5 Q32 28 35.5 25.5", stroke: "#3a2a14", strokeWidth: "1.4", strokeLinecap: "round", fill: "none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "24.5", cy: "24.5", r: "1.6", fill: "#ff9bb3", opacity: "0.85" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "39.5", cy: "24.5", r: "1.6", fill: "#ff9bb3", opacity: "0.85" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "25", cy: "15", r: "1", fill: "#fff" })
      ]
    }
  );
}
function KiwiWithKey({
  className,
  imgClassName,
  keyClassName,
  alt = "",
  width = 160,
  height = 160
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `relative inline-block ${className ?? ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: kawaiiKiwi,
        alt,
        width,
        height,
        className: imgClassName
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      KawaiiKey,
      {
        className: `pointer-events-none absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 rotate-180 drop-shadow-sm ${keyClassName ?? ""}`
      }
    )
  ] });
}
const $$splitComponentImporter$8 = () => import("./login-CBNrc8F_.mjs");
const Route$9 = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Log in — Tracker"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
function AuthShell({
  title,
  subtitle,
  children
}) {
  const {
    t
  } = useTranslation();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-screen items-center justify-center px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 overflow-hidden text-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-[8%] top-[12%] animate-pulse", children: "🌸" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-[10%] top-[18%]", children: "✨" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-[14%] bottom-[18%]", children: "🍡" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-[12%] bottom-[14%] animate-pulse", children: "💖" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-[45%] top-[6%]", children: "☁️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KiwiWithKey, { className: "absolute -left-6 bottom-10 h-28 w-28 rotate-[-12deg] opacity-90 sm:left-[6%] sm:h-36 sm:w-36", imgClassName: "h-full w-full", keyClassName: "h-6 w-6 sm:h-8 sm:w-8" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KiwiWithKey, { className: "absolute -right-4 top-24 h-24 w-24 rotate-[18deg] opacity-90 sm:right-[6%] sm:h-32 sm:w-32", imgClassName: "h-full w-full", keyClassName: "h-5 w-5 sm:h-7 sm:w-7" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "kawaii-card relative w-full max-w-sm p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-10 left-1/2 -translate-x-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KiwiWithKey, { alt: "Kawaii kiwi", width: 96, height: 96, className: "h-16 w-16 drop-shadow-md", imgClassName: "h-full w-full", keyClassName: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-sm text-muted-foreground hover:text-foreground", children: t("common.back") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LanguageSwitcher, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-5 text-center text-3xl font-bold tracking-tight text-foreground", children: [
        title,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block", children: "🥝" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-center text-sm text-muted-foreground", children: subtitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children })
    ] })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1 block text-sm font-medium", children: label }),
    children
  ] });
}
const $$splitComponentImporter$7 = () => import("./help-CBKac3s6.mjs");
const Route$8 = createFileRoute("/help")({
  head: () => ({
    meta: [{
      title: "User guide — Keywi"
    }, {
      name: "description",
      content: "User guide for Keywi: workspaces, savings, monthly entries, goals, currency, admin and superuser features."
    }, {
      property: "og:title",
      content: "User guide — Keywi"
    }, {
      property: "og:description",
      content: "User guide for Keywi."
    }, {
      property: "og:url",
      content: "https://kawaiitracker.lovable.app/help"
    }],
    links: [{
      rel: "canonical",
      href: "https://kawaiitracker.lovable.app/help"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./forgot-password-B-0JkV71.mjs");
const Route$7 = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{
      title: "Reset password — Tracker"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("../_authenticated-BFsOu0JM.mjs");
const Route$6 = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") {
      return {
        user: {
          id: "",
          email: "",
          displayName: ""
        }
      };
    }
    const supabase = await ensureSupabase().catch(() => null);
    if (!supabase) throw redirect({
      to: "/login"
    });
    const {
      data: sessionData
    } = await supabase.auth.getSession();
    if (!sessionData.session) throw redirect({
      to: "/login"
    });
    let user = sessionData.session.user;
    try {
      const {
        data: userData,
        error
      } = await supabase.auth.getUser();
      if (!error && userData.user) user = userData.user;
    } catch {
    }
    if (!user) throw redirect({
      to: "/login"
    });
    return {
      user: {
        id: user.id,
        email: user.email ?? "",
        displayName: user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? ""
      }
    };
  },
  head: (ctx) => {
    const name = ctx.match.context?.user?.displayName;
    return {
      meta: [{
        title: name ? `${name} — Keywi` : "Keywi"
      }]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./index-Bfaz_D2C.mjs");
const Route$5 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Keywi - savings and income tracker"
    }, {
      name: "description",
      content: "Track savings across initiatives. Create or join a workspace with a code."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("../_authenticated.onboarding-DfUNML-k.mjs");
const Route$4 = createFileRoute("/_authenticated/onboarding")({
  head: (ctx) => {
    const name = ctx.match.context?.user?.displayName;
    return {
      meta: [{
        title: `${name ? name + " — " : ""}Get started — Tracker`
      }]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const Route$3 = createFileRoute("/api/public/supabase-config")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.EXT_SUPABASE_URL;
        const publishableKey = process.env.EXT_SUPABASE_PUBLISHABLE_KEY;
        if (!url || !publishableKey) {
          return new Response(
            JSON.stringify({
              error: "Supabase env missing on server. Set EXT_SUPABASE_URL and EXT_SUPABASE_PUBLISHABLE_KEY in project secrets."
            }),
            { status: 500, headers: { "content-type": "application/json" } }
          );
        }
        return new Response(JSON.stringify({ url, publishableKey }), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "cache-control": "public, max-age=60"
          }
        });
      }
    }
  }
});
const $$splitNotFoundComponentImporter$1 = () => import("../_authenticated.members._tenantId-BeH5QMOz.mjs");
const $$splitErrorComponentImporter$1 = () => import("../_authenticated.members._tenantId-D5P2WYVp.mjs");
const $$splitComponentImporter$2 = () => import("../_authenticated.members._tenantId-BD_7fw9-.mjs");
const Route$2 = createFileRoute("/_authenticated/members/$tenantId")({
  head: (ctx) => {
    const name = ctx.match.context?.user?.displayName;
    return {
      meta: [{
        title: `${name ? name + " — " : ""}Users — Tracker`
      }]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$2, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$1, "notFoundComponent")
});
const $$splitNotFoundComponentImporter = () => import("../_authenticated.audit._tenantId-C0daWVX0.mjs");
const $$splitErrorComponentImporter = () => import("../_authenticated.audit._tenantId-D5P2WYVp.mjs");
const $$splitComponentImporter$1 = () => import("../_authenticated.audit._tenantId-0hNEkHBE.mjs");
const Route$1 = createFileRoute("/_authenticated/audit/$tenantId")({
  head: (ctx) => {
    const name = ctx.match.context?.user?.displayName;
    return {
      meta: [{
        title: `${name ? name + " — " : ""}Muutoshistoria — Tracker`
      }]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$1, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
const $$splitComponentImporter = () => import("../_authenticated.app._tenantId-B7uzK6KC.mjs");
const Route = createFileRoute("/_authenticated/app/$tenantId")({
  head: (ctx) => {
    const name = ctx.match.context?.user?.displayName;
    return {
      meta: [{
        title: `${name ? name + " — " : ""}Workspace — Tracker`
      }]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SignupRoute = Route$b.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$c
});
const ResetPasswordRoute = Route$a.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$c
});
const LoginRoute = Route$9.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$c
});
const HelpRoute = Route$8.update({
  id: "/help",
  path: "/help",
  getParentRoute: () => Route$c
});
const ForgotPasswordRoute = Route$7.update({
  id: "/forgot-password",
  path: "/forgot-password",
  getParentRoute: () => Route$c
});
const AuthenticatedRoute = Route$6.update({
  id: "/_authenticated",
  getParentRoute: () => Route$c
});
const IndexRoute = Route$5.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$c
});
const AuthenticatedOnboardingRoute = Route$4.update({
  id: "/onboarding",
  path: "/onboarding",
  getParentRoute: () => AuthenticatedRoute
});
const ApiPublicSupabaseConfigRoute = Route$3.update({
  id: "/api/public/supabase-config",
  path: "/api/public/supabase-config",
  getParentRoute: () => Route$c
});
const AuthenticatedMembersTenantIdRoute = Route$2.update({
  id: "/members/$tenantId",
  path: "/members/$tenantId",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedAuditTenantIdRoute = Route$1.update({
  id: "/audit/$tenantId",
  path: "/audit/$tenantId",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedAppTenantIdRoute = Route.update({
  id: "/app/$tenantId",
  path: "/app/$tenantId",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedRouteChildren = {
  AuthenticatedOnboardingRoute,
  AuthenticatedAppTenantIdRoute,
  AuthenticatedAuditTenantIdRoute,
  AuthenticatedMembersTenantIdRoute
};
const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  ForgotPasswordRoute,
  HelpRoute,
  LoginRoute,
  ResetPasswordRoute,
  SignupRoute,
  ApiPublicSupabaseConfigRoute
};
const routeTree = Route$c._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: (_data, _vars, _ctx, mutation) => {
        const meta = mutation.meta;
        if (meta?.silent) return;
        const msg = meta?.toast ?? instance.t("common.saved");
        toast.success(msg);
      },
      onError: (error, _vars, _ctx, mutation) => {
        const meta = mutation.meta;
        if (meta?.silent) return;
        toast.error(error instanceof Error ? error.message : String(error));
      }
    })
  });
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  AuthShell as A,
  Field as F,
  KiwiWithKey as K,
  LanguageSwitcher as L,
  Route$2 as R,
  SUPPORTED_CURRENCIES as S,
  applyDetectedLanguage as a,
  Route$1 as b,
  useCurrency as c,
  Route as d,
  router as r,
  useServerFn as u
};
