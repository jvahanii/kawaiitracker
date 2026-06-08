I can save and use external Supabase env variables for production. They are already present now: `EXT_SUPABASE_URL`, `EXT_SUPABASE_PUBLISHABLE_KEY`, and `EXT_SUPABASE_SERVICE_ROLE_KEY` exist as runtime secrets.

The remaining issue appears to be that production’s server-function endpoint for the Supabase config is returning a generic 500, while preview returns the config correctly. That can make login stay stuck at “logging in” because the browser waits for Supabase initialization or receives an unhandled bootstrap failure.

Plan:

1. Make Supabase config bootstrap production-safe
   - Keep using the saved runtime secrets.
   - Update the public config server function so it returns a structured, visible error instead of falling into the app-wide HTML 500 handler.
   - Add compatibility fallbacks for both the custom external names and the standard Supabase env names where safe.

2. Make login and password reset fail clearly instead of hanging
   - Wrap `ensureSupabase()` failures in login and forgot-password mutations with a clear user-facing error.
   - Ensure the submit button always leaves pending state when Supabase config loading fails.

3. Verify the published server function path
   - Test the production `_serverFn` config endpoint after the change.
   - Check published server logs if it still returns 500.

4. Deployment step
   - After implementation, republish/update the Lovable published app so the frontend bundle and server code are both on the latest version.

No Lovable Cloud database is required for this fix; this is about using your external Supabase project through saved production runtime secrets.