import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { tryGetSupabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const supabase = tryGetSupabase();
    if (!supabase) throw redirect({ to: "/login" });

    // Fast path: trust the persisted session written by signInWithPassword.
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw redirect({ to: "/login" });

    // Verify with Auth server; tolerate transient network errors by falling
    // back to the session's user instead of bouncing to /login.
    let user = sessionData.session.user;
    try {
      const { data: userData, error } = await supabase.auth.getUser();
      if (!error && userData.user) user = userData.user;
    } catch {
      // keep session user
    }
    if (!user) throw redirect({ to: "/login" });

    return {
      user: {
        id: user.id,
        email: user.email ?? "",
        displayName:
          (user.user_metadata?.display_name as string | undefined) ??
          user.email?.split("@")[0] ??
          "",
      },
    };
  },
  component: () => <Outlet />,
});
