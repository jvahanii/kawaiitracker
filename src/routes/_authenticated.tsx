import { createFileRoute, Outlet, redirect, isRedirect } from "@tanstack/react-router";

import { getMe } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    try {
      const me = await getMe();
      if (!me) throw redirect({ to: "/login" });
      return { user: me };
    } catch (err) {
      if (isRedirect(err)) throw err;
      console.error("[_authenticated beforeLoad] error, redirecting to login:", err);
      throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />,
});
