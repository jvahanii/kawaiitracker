import "tslib";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { ensureSupabase } from "@/lib/supabase/client";
import { getLastTenantId } from "@/lib/api/tenants.functions";
import { safeErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({ meta: [{ title: "Signing you in… — Keywi" }] }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const getLastTenantFn = useServerFn(getLastTenantId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const query = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(
          window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "",
        );

        const oauthError =
          query.get("error_description") ??
          query.get("error") ??
          hash.get("error_description") ??
          hash.get("error");
        if (oauthError) {
          if (!cancelled) setError(oauthError);
          return;
        }

        const supabase = await ensureSupabase();

        const code = query.get("code");
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (code) {
          // PKCE flow
          const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchErr) throw new Error(exchErr.message);
        } else if (accessToken && refreshToken) {
          // Implicit flow — tokens come back in the URL hash.
          const { error: setErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (setErr) throw new Error(setErr.message);
          // Clean tokens out of the URL.
          history.replaceState(null, "", window.location.pathname);
        } else {
          // Maybe the session is already set (e.g. broker handled it).
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            if (!cancelled) setError("Missing authorization code.");
            return;
          }
        }

        // Best-effort: figure out where to go. Never let this block the redirect.
        let lastTenantId: string | null = null;
        try {
          const r = await getLastTenantFn();
          lastTenantId = r?.id ?? null;
        } catch (e) {
          console.error("getLastTenantId failed during OAuth callback", e);
        }
        if (!lastTenantId) {
          try {
            lastTenantId = localStorage.getItem("lastTenantId");
          } catch {
            // ignore
          }
        }

        if (cancelled) return;
        if (lastTenantId) {
          navigate({ to: "/app/$tenantId", params: { tenantId: lastTenantId }, replace: true });
        } else {
          navigate({ to: "/onboarding", replace: true });
        }
      } catch (e) {
        console.error("OAuth callback failed", e);
        if (!cancelled) setError(safeErrorMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, getLastTenantFn]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Sign-in didn't complete
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
