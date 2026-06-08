## Goal
Fix login on `kawaiitracker.lovable.app` by populating the **Production** secret store with your Supabase credentials. Preview already works because those values exist in the Dev store; Production has its own isolated store that is still missing/stale.

## Steps
1. Switch to build mode.
2. Trigger the secure secrets form for the Production environment with these three names:
   - `EXT_SUPABASE_URL`
   - `EXT_SUPABASE_PUBLISHABLE_KEY`
   - `EXT_SUPABASE_SERVICE_ROLE_KEY`
3. You paste the same values you used for preview (from Supabase → Project Settings → API).
4. In Supabase → Authentication → URL Configuration, confirm:
   - Site URL: `https://kawaiitracker.lovable.app`
   - Redirect URLs include both `https://kawaiitracker.lovable.app` and the preview URL.
5. Click **Publish → Update** so production picks up the new env.
6. Hard-refresh the published site and log in to verify.

## Out of scope
- No code changes. The integration already reads `EXT_SUPABASE_*` from `process.env` per request.
- No data migration.

## Notes
- Make sure the Lovable secrets form is on the **Production** environment toggle when you submit — submitting on Dev would overwrite preview instead.
- `EXT_SUPABASE_SERVICE_ROLE_KEY` is server-only and never shipped to the browser.
