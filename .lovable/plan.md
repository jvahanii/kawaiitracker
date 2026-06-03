## Plan

1. **Stop the root route from crashing public pages**
   - Remove the eager `initSupabase()` call from the root `beforeLoad`.
   - Root `beforeLoad` currently throws when public auth config is missing, so clicking **Login** shows the global error page before `/login` can render.

2. **Restore a runtime config fallback for the browser auth client**
   - Reintroduce the existing `getSupabaseConfig` server function as a fallback only when `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` are absent.
   - Initialize the client in a safe client-only component/effect, not during SSR.

3. **Make auth routes wait for initialization instead of throwing**
   - Update `/login` (and shared auth pages that use `getSupabase`) so they initialize Supabase config before calling auth methods.
   - Keep login form behavior the same.

4. **Verify the actual failure path**
   - Re-check browser console/runtime signals after the change to confirm the missing-config error no longer appears and `/login` renders.

## Technical details

- The confirmed error is: `Supabase config unavailable. VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY missing.`
- It is thrown from `src/routes/__root.tsx` line 79 via `initSupabase()` during router `beforeLoad`.
- The fix is not a UI change; it is an auth initialization flow fix.