import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { tryGetSupabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const supabase = tryGetSupabase();
    if (!supabase) throw redirect({ to: "/login" });
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? "",
        displayName:
          (data.user.user_metadata?.display_name as string | undefined) ??
          data.user.email?.split("@")[0] ??
          "",
      },
    };
  },
  component: () => <Outlet />,
});
