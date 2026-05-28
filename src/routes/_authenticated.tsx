import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getMe } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const me = await getMe();
    if (!me) throw redirect({ to: "/login" });
    return { user: me };
  },
  component: () => <Outlet />,
});
