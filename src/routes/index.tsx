import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import { getMe } from "@/lib/api/auth.functions";
import { listMyTenants } from "@/lib/api/tenants.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tracker — Multi-tenant item tracker" },
      { name: "description", content: "Track items across teams. Create or join a workspace with a code." },
    ],
  }),
  beforeLoad: async () => {
    const me = await getMe();
    if (!me) return;
    const tenants = await listMyTenants();
    if (tenants.length === 0) throw redirect({ to: "/onboarding" });
    throw redirect({ to: "/app/$tenantId", params: { tenantId: tenants[0].id } });
  },
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-lg font-semibold tracking-tight">Tracker</span>
          <div className="flex gap-2">
            <Link to="/login" className="rounded-md px-3 py-1.5 text-sm hover:bg-accent">
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-balance text-5xl font-semibold tracking-tight">
          Track items across teams.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-muted-foreground">
          Create a workspace, share an 8-character join code, and manage items
          together. Statuses, assignees, and notes — nothing more.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link
            to="/signup"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            I have an account
          </Link>
        </div>
      </main>
    </div>
  );
}
