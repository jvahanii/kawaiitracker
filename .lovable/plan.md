## Multi-Tenant Item Tracker

A workspace app where each tenant has its own items and members. Users sign in, create or join a tenant via a shareable code, and manage items in a two-pane layout.

### Auth & tenancy
- Lovable Cloud auth: email/password + Google.
- On first sign-in, user lands on a "Create or join tenant" screen.
  - **Create tenant**: name + auto-generated 8-char code; creator becomes `admin`.
  - **Join tenant**: enter code → added as `member`.
- Users can belong to multiple tenants; active tenant stored in URL/local state with a switcher in the header.

### Roles
- `admin`: manage tenant settings, view/rotate join code, manage members (remove, promote), CRUD all items.
- `member`: CRUD items, view members.
- Roles stored in a separate `tenant_members` table (never on profiles), enforced via a `has_tenant_role` security-definer function to avoid RLS recursion.

### Item model
- `title` (required), `status` (todo / in_progress / done), `assignee_id` (nullable, must be tenant member), `notes` (rich text / markdown textarea), timestamps, `created_by`.

### UI layout
- Top bar: app name, tenant switcher, user menu.
- Main: split pane.
  - **Left**: items list (filter by status/assignee, search, "+ New item" button). Selecting an item highlights it.
  - **Right**: selected item detail — editable title, status dropdown, assignee picker (tenant members), notes editor, delete button. Empty state when nothing selected.
- Separate `/members` page for admins (invite code display + member list).

### Routes
```
/                       → redirects to /app or /login
/login                  → email/password + Google
/onboarding             → create or join tenant (no active tenant)
/_authenticated/
  app/$tenantId/        → split-pane items view
  app/$tenantId/members → members + join code (admin-gated)
```

### Technical details
- TanStack Start file-based routes; `_authenticated` layout gates with `beforeLoad` + `supabase.auth.getUser()`.
- Data fetched via `createServerFn` + `requireSupabaseAuth`, wrapped in TanStack Query (`ensureQueryData` in loader, `useSuspenseQuery` in component).
- Tables (Supabase, all with explicit GRANTs + RLS):
  - `tenants(id, name, join_code unique, created_at)`
  - `tenant_members(id, tenant_id, user_id, role app_role, unique(tenant_id, user_id))`
  - `items(id, tenant_id, title, status, assignee_id, notes, created_by, created_at, updated_at)`
- Security-definer fn `has_tenant_role(_user, _tenant, _role)` and `is_tenant_member(_user, _tenant)` for policies.
- RLS: members can read/write items in their tenants; only admins mutate `tenants` row and view full member list management actions.
- Realtime subscription on `items` for live list updates (nice-to-have, low cost).
- Zod validation on all server-fn inputs.
- Design: clean, minimal workspace aesthetic (Linear-inspired); semantic tokens in `src/styles.css`.

### Out of scope (can add later)
- Email invites, attachments, comments, activity log, item ordering/drag.
