# Replace free-limit toast with a dialog (Ok + Contact me)

## Goal
When a non-superuser tries to add a 5th member, show a modal dialog instead of a toast. The dialog has two buttons: **Ok** and **Contact me for a paid plan**.

## Where the change happens
`src/routes/_authenticated.members.$tenantId.tsx` — the invite form's client-side check and the `addM.onSuccess` server fallback.

## Plan

### 1. New i18n keys
Add to `src/lib/locales/en.json` and `fi.json` under `members`:
- `freeLimitTitle` — dialog title
- `freeLimitOk` — "Ok"
- `freeLimitContact` — "Contact me for a paid plan" / "Ota yhteyttä maksullisen suunnitelman saamiseksi"

### 2. Component state
Add `const [limitDialogOpen, setLimitDialogOpen] = useState(false);`

### 3. Trigger the dialog instead of toast
- **Client-side** (invite form `onSubmit`): replace `toast.error(...)` with `setLimitDialogOpen(true)` and still `return` before `addM.mutate(...)`.
- **Server-side fallback** (`addM.onSuccess` when `res.error === "FREE_LIMIT_REACHED"`): replace `toast.error(...)` with `setLimitDialogOpen(true)`.

### 4. Render the dialog
Add an `<AlertDialog>` (already imported in the file) with:
- `open={limitDialogOpen}`
- Title from `members.freeLimitTitle`
- Description from the existing `members.freeLimitReached` text
- Footer with two buttons side by side:
  1. **Ok** — `setLimitDialogOpen(false)` (closes dialog, leaves invite modal open)
  2. **Contact me for a paid plan** — `setLimitDialogOpen(false)` (closes dialog; no payment infrastructure exists, so it acts as a dismiss-with-intent button)

### 5. Keep existing behavior
- Superusers bypass the check entirely (unchanged).
- The invite modal stays open behind the dialog so the user can continue after dismissing.

## Technical notes
- Uses the already-imported `AlertDialog` primitives from `@/components/ui/alert-dialog`.
- No backend or payment-provider changes — still notification-only as previously decided.