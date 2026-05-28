import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { createTenant, joinTenant } from "@/lib/api/tenants.functions";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Get started — Tracker" }] }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const createFn = useServerFn(createTenant);
  const joinFn = useServerFn(joinTenant);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const createM = useMutation({
    mutationFn: (n: string) => createFn({ data: { name: n } }),
    onSuccess: (r) => navigate({ to: "/app/$tenantId", params: { tenantId: r.id } }),
  });
  const joinM = useMutation({
    mutationFn: (c: string) => joinFn({ data: { code: c } }),
    onSuccess: (r) => navigate({ to: "/app/$tenantId", params: { tenantId: r.id } }),
  });

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Get started</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new workspace, or join one with an 8-character code.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <section className="rounded-xl border border-border bg-background p-6">
            <h2 className="text-base font-semibold">Create a workspace</h2>
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                createM.mutate(name);
              }}
              className="mt-4 space-y-3"
            >
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Inc."
                className="input"
              />
              {createM.error ? (
                <p className="text-sm text-destructive">{(createM.error as Error).message}</p>
              ) : null}
              <button
                type="submit"
                disabled={createM.isPending}
                className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {createM.isPending ? "Creating…" : "Create"}
              </button>
            </form>
          </section>
          <section className="rounded-xl border border-border bg-background p-6">
            <h2 className="text-base font-semibold">Join with a code</h2>
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                joinM.mutate(code);
              }}
              className="mt-4 space-y-3"
            >
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABCD2345"
                maxLength={16}
                className="input font-mono tracking-widest"
              />
              {joinM.error ? (
                <p className="text-sm text-destructive">{(joinM.error as Error).message}</p>
              ) : null}
              <button
                type="submit"
                disabled={joinM.isPending}
                className="w-full rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
              >
                {joinM.isPending ? "Joining…" : "Join"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
