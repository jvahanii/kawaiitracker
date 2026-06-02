Production logs confirm this is no longer a login-form bug: published login reaches the server function, then every database attempt fails with `Connection terminated unexpectedly`, while preview succeeds. The current production runtime is rejecting/closing the direct PostgreSQL TLS socket to Aiven; patching `pg` TLS options and adding `AIVEN_CA_CERT` is not enough there.

## Plan

1. **Stop relying on direct Aiven `pg` sockets in production**
   - Treat `src/lib/db.server.ts` as the failing boundary.
   - Remove the fragile production path that tries to make `pg` + custom CA work in the published runtime.

2. **Move the app database to Lovable Cloud**
   - Enable Lovable Cloud for the project.
   - Create the existing app tables there: `app_users`, `tenants`, `tenant_members`, `items`, `item_entries`, and `password_resets`.
   - Add the needed grants/RLS-safe policies for the app’s server-side access.

3. **Switch server functions to the Cloud database**
   - Update the database helper so auth, tenants, items, and entries use Lovable Cloud from server code instead of external Aiven TCP.
   - Keep the public server function API unchanged so the UI does not need a rewrite.

4. **Preserve user-safe error handling**
   - Keep login returning a friendly “Service is temporarily unavailable” message for real backend outages.
   - Avoid blank production pages on server errors.

5. **Verify production behavior**
   - Re-test the login server function after the change.
   - Check production server logs for successful login or normal invalid-password responses instead of database connection failures.
   - You’ll still need to click **Publish / Update** so the frontend uses the new server function bundle on the live site.

## Technical notes

- The important finding is from production logs: `Connection terminated unexpectedly` on every `pg` connection attempt, while sandbox logs show successful login.
- This points to the published server runtime’s outbound PostgreSQL/TLS socket compatibility, not bad credentials or wrong login code.
- The durable fix is to use the platform-native database path instead of an external Aiven raw PostgreSQL socket from production.