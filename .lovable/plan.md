## Plan: Automatic audit log retention

Prune `audit_log` rows older than **12 months** on a nightly schedule.

### 1. Database migration
New migration `supabase/migrations/<ts>_audit_log_retention.sql`:
- `prune_audit_log(retention_days int default 365)` SECURITY DEFINER function that deletes from `public.audit_log` where `created_at < now() - interval`. Returns row count.
- Enable `pg_cron` extension (if not already).
- Schedule nightly job `audit-log-prune` at `15 3 * * *` UTC calling `select public.prune_audit_log(365);`.

### 2. Manual trigger endpoint (optional fallback)
`src/routes/api/public/prune-audit-log.ts` — POST handler that:
- Verifies `x-cron-secret` header against `CRON_SECRET` env var.
- Calls `supabaseAdmin.rpc('prune_audit_log', { retention_days: 365 })`.
- Returns `{ deleted: <count> }`.

This gives a way to manually run pruning or use external schedulers if pg_cron is ever disabled. Requires adding `CRON_SECRET` to secrets.

### 3. Update `supabase-schema.sql`
Append the retention function + cron schedule to the reference schema file so it matches.

### Notes
- Retention: 12 months. Adjustable via the function arg if needed later.
- No UI changes; existing audit page already fetches latest 500 rows.
- No changes to triggers or `list_audit_log` RPC.

### Question
Skip the manual `/api/public` endpoint and rely solely on pg_cron? Saves adding a secret. Let me know — otherwise I'll include both.
