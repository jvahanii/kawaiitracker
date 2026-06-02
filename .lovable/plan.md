## Goal
Replace the Aiven Postgres + iron-session + bcrypt stack with an external Supabase project. Use the secrets you just saved (`EXT_SUPABASE_URL`, `EXT_SUPABASE_PUBLISHABLE_KEY`, `EXT_SUPABASE_SERVICE_ROLE_KEY`). The `VITE_*` prefix is reserved by Lovable, so the browser supabase client is initialised at runtime from values exposed by a root-loader server fn (publishable key + URL are public; safe to ship).

## What I'll build

### 1. Supabase wiring (new files)
- `src/lib/supabase/admin.server.ts` — service-role client (server-only).
- `src/lib/supabase/client.ts` — browser client. Lazy-initialised via `initSupabase({url, publishableKey})`; throws if used before init.
- `src/lib/supabase/auth-middleware.ts` — `requireSupabaseAuth` server-fn middleware. Reads `Authorization: Bearer`, validates with `auth.getUser`, exposes `{ supabase, userId }`.
- `src/lib/supabase/auth-attacher.ts` — client server-fn middleware that attaches the current bearer token.
- `src/lib/supabase/config.functions.ts` — `getSupabaseConfig` server fn returning `{ url, publishableKey }` from `process.env.EXT_*`.

### 2. Schema (SQL the user runs in Supabase SQL editor)
```
profiles(id uuid pk → auth.users, display_name text, created_at timestamptz)
tenants(id uuid pk, name text, join_code text unique, created_by uuid, created_at)
tenant_members(tenant_id, user_id, role text check in ('admin','member'), pk(tenant_id,user_id))
items(id, tenant_id, name, created_by, created_at)
item_entries(id, item_id, month date, amount numeric, actual_amount numeric)
```
- Trigger to create profile on `auth.users` insert.
- `SECURITY DEFINER` helpers: `is_tenant_member(uuid)`, `is_tenant_admin(uuid)`.
- RPCs: `create_tenant(name)`, `join_tenant_by_code(code)`, `get_tenant_members(tenant_id)`.
- RLS on every table scoped via helpers; explicit `GRANT`s to `authenticated` + `service_role`.

I'll write this SQL to `supabase-schema.sql` at repo root for you to paste into your Supabase project's SQL editor. **No data migration** — Aiven data is abandoned.

### 3. Boot / shell changes
- `src/start.ts` — add `attachSupabaseAuth` to `functionMiddleware`.
- `src/router.tsx` — add `supabaseConfig` to router context (initially `null`, populated by root loader).
- `src/routes/__root.tsx` — `loader` calls `getSupabaseConfig`, returns `{ url, publishableKey }`; `RootComponent` calls `initSupabase(...)` synchronously on first render and registers `supabase.auth.onAuthStateChange` to invalidate router + queries.
- `src/routes/_authenticated.tsx` — change to `ssr: false`; `beforeLoad` calls `supabase.auth.getUser()` and redirects to `/login` if missing.

### 4. Auth routes (rewrite)
- `signup.tsx` → `supabase.auth.signUp({ email, password, options: { emailRedirectTo: origin, data: { display_name } } })`.
- `login.tsx` → `signInWithPassword`.
- `forgot-password.tsx` → `resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`.
- `reset-password.tsx` → on mount, parse recovery URL; on submit, `supabase.auth.updateUser({ password })`.
- Recommend: turn **Confirm email = OFF** in Supabase Auth settings for smooth dev.

### 5. Data server fns (rewrite under `requireSupabaseAuth`)
- `src/lib/api/tenants.functions.ts` — `listMyTenants`, `createTenant` (RPC), `joinTenant` (RPC), `getTenantMembers` (RPC).
- `src/lib/api/items.functions.ts` — `listItems`, `createItem`, `deleteItem` (all `supabase.from('items')`, RLS enforces tenant scoping).
- `src/lib/api/entries.functions.ts` — `listEntriesForItem`, `upsertEntry`, `deleteEntry`.
- Delete `src/lib/api/auth.functions.ts` (auth moves fully client-side via supabase-js).
- Delete `src/lib/db.server.ts`, `src/lib/auth.server.ts`, `src/lib/config.server.ts` (if only used for session secret).

### 6. Dependencies
- `bun add @supabase/supabase-js`
- `bun remove pg iron-session bcryptjs @types/pg @types/bcryptjs` (whichever are present)

### 7. Out of scope
- Google / Apple sign-in (can add later via `signInWithOAuth`).
- Migrating existing Aiven users/data.
- Email templates / SMTP customisation (Supabase defaults).

## What you do
1. Approve this plan.
2. After I finish, open `supabase-schema.sql`, paste it into Supabase → SQL Editor → Run.
3. In Supabase → Authentication → Providers → Email, turn off "Confirm email" (or keep it on if you want email confirmation).
4. Test signup → login → create tenant → add item.

## Risks
- Until you run the SQL, every protected page errors. The UI will still load; the data queries fail.
- Email confirmation on = signup returns a session-less user; you'll need to confirm via the email link before login works.
