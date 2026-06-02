## Plan

The production login failure is coming from the server-side database connection, not the login form. Preview/dev can bypass or tolerate the certificate chain, but production cannot reliably connect to the external Aiven Postgres over the current `pg` setup, which is why the published app keeps failing while iframe preview works.

### Fix approach

1. **Stop patching TLS flags for production**
   - Remove the fragile environment-specific `ssl` switching in `src/lib/db.server.ts`.
   - Treat the current Aiven connection path as incompatible with the production runtime unless a proper trusted CA is supplied.

2. **Use the Aiven CA certificate explicitly**
   - Add support for an `AIVEN_CA_CERT` secret/env value.
   - Configure `pg` with:
     - `ssl: { ca: AIVEN_CA_CERT, rejectUnauthorized: true }` when the CA is available.
     - keep a dev-only fallback only for local/preview if needed.
   - This resolves the `self-signed certificate in certificate chain` error correctly instead of disabling verification.

3. **Make failures user-safe**
   - Ensure TLS/connection errors are always converted into the existing friendly “Service is temporarily unavailable” response instead of crashing into a blank page.
   - Keep detailed server logs for diagnosis without leaking credentials or full email addresses.

4. **Fix the unrelated hydration mismatch while here**
   - The current runtime errors also show Finnish/English text mismatch during hydration.
   - Adjust i18n initialization so SSR and first client render use the same language, then apply browser-selected language after hydration.

5. **Verify**
   - Test the login server function in preview/dev.
   - After you add the Aiven CA certificate as a secret and publish, test the published login again and check production server logs.

### Required secret

You’ll need to add the Aiven PostgreSQL CA certificate as a secret named:

```text
AIVEN_CA_CERT
```

Use the full PEM certificate from Aiven, including:

```text
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
```

Without that certificate, production will continue to reject the self-signed chain or terminate the connection.