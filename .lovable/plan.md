## Goal

Drop Aiven + custom session-cookie auth. Connect to **your existing external Supabase project** (not Lovable Cloud) and use Supabase Auth + Postgres via the JS SDK. This fixes production (Supabase TLS uses a publicly-trusted cert, so Cloudflare Workers can reach it) and removes all `pg`/iron-session code.

## What you'll need to provide

Three values from your Supabase project (Settings → API):
- `SUPABASE_URL` (e.g. `https://xxxx.supabase.co`)
- `SUPABASE_PUBLISHABLE_KEY` (anon/publishable key — safe in browser)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; used only if needed)

I'll add them via the secrets tool. I'll also mirror the public ones to `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` for the browser client.

## What changes

### 1. Supabase client wiring (manual, since we're not enabling Lovable Cloud)
Create:
- `src/integrations/supabase/client.ts` — browser client (publishable key, localStorage session).
- `src/integrations/supabase/client.server.ts` — admin client (service role, server-only).
- `src/integrations/supabase/auth-middleware.ts` — `requireSupabaseAuth` server-fn middleware that verifies the bearer token via `supabase.auth.getUser()` and injects an authed client + `userId`.
- `src/integrations/supabase/auth-attacher.ts` — client middleware that attaches `Authorization: Bearer <token>` to every server-fn call.
- Wire `attachSupabaseAuth` into `src/start.ts` `functionMiddleware`.

### 2. Schema (you run the SQL in your Supabase SQL editor)
I'll generate a single SQL script for you to paste:
- `profiles` (id uuid PK → auth.users, display_name, created_at) + `handle_new_user` trigger pulling `display_name` from signup metadata.
- `tenants`, `tenant_members` (role enum admin/member), `items`, `item_entries`.
- RLS on every table. SECURITY DEFINER helpers `is_tenant_member(uuid)` / `is_tenant_admin(uuid)` to avoid recursive RLS.
- SECURITY DEFINER RPCs: `create_tenant(name)`, `join_tenant_by_code(code)`, `get_tenant_members(tenant_id)`.
- Explicit `GRANT`s to `authenticated` / `service_role`.

### 3. Auth — Supabase Auth replaces iron-session + bcrypt
- `/signup`: `supabase.auth.signUp({ email, password, options: { data: { display_name } } })`.
- `/login`: `supabase.auth.signInWithPassword`.
- `/forgot-password`: `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`.
- `/reset-password`: detects recovery token from URL hash, calls `supabase.auth.updateUser({ password })`.
- Root `__root.tsx`: subscribe to `onAuthStateChange` → `router.invalidate()` + `queryClient.invalidateQueries()`.
- `_authenticated` layout becomes `ssr: false` + `beforeLoad` calling `supabase.auth.getUser()` → redirect to `/login`.

### 4. Server functions rewrite
Every `query/queryOne` call in `src/lib/api/{tenants,items,entries}.functions.ts` becomes a Supabase query under `requireSupabaseAuth`. RLS enforces membership/admin, so manual `requireMembership` helpers go away. `create_tenant`, `joinTenant`, and member listing call the RPCs.

`src/lib/api/auth.functions.ts` is deleted (auth is fully client-side).

### 5. Delete
- `src/lib/db.server.ts`
- `src/lib/auth.server.ts`
- `pg`, `iron-session`, `bcryptjs` deps
- Aiven secrets remain in env but unused — you can remove them later.

## Email confirmation

By default Supabase requires email confirmation on signup. For the smoothest dev flow I recommend you turn **"Confirm email" OFF** in Supabase Dashboard → Authentication → Providers → Email (you can re-enable later). Otherwise users need to click an email link before the first login works.

## Data migration

**None.** Aiven data is not copied. Users re-sign-up and re-create tenants/items. (You said don't migrate earlier — confirm still OK now that we're moving providers entirely.)

## What I need from you before I start building

1. Confirm: provide Supabase URL + anon + service-role keys via the secrets prompt I'll send.
2. Confirm: you'll run the schema SQL I generate in your Supabase SQL editor (or want me to attempt it via your DB connection if you give me `DATABASE_URL`).
3. Confirm: no data migration.

## Out of scope

Google/Apple sign-in (add later if you want).
