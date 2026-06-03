import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  addMemberByEmail,
  listMyTenants,
  listTenantMembers,
  removeMember,
  updateMemberRole,
} from "@/lib/api/tenants.functions";

export const Route = createFileRoute("/_authenticated/members/$tenantId")({
  head: () => ({ meta: [{ title: "Käyttäjät — Tracker" }] }),
  beforeLoad: async ({ params }) => {
    const tenants = await listMyTenants();
    const current = tenants.find((t) => t.id === params.tenantId);
    if (!current) throw redirect({ to: "/onboarding" });
    if (current.role !== "admin") {
      throw redirect({ to: "/app/$tenantId", params: { tenantId: current.id } });
    }
    return { currentTenant: current };
  },
  component: MembersPage,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-6 text-sm">Ei löytynyt.</div>,
});

function MembersPage() {
  const { t } = useTranslation();
  const { tenantId } = Route.useParams();
  const { currentTenant } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const listFn = useServerFn(listTenantMembers);
  const updateRoleFn = useServerFn(updateMemberRole);
  const removeFn = useServerFn(removeMember);
  const addByEmailFn = useServerFn(addMemberByEmail);

  const membersQ = useQuery({
    queryKey: ["members", tenantId],
    queryFn: () => listFn({ data: { tenantId } }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["members", tenantId] });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<"admin" | "member">("member");

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard?.writeText(currentTenant.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const updateM = useMutation({
    mutationFn: (v: { userId: string; role: "admin" | "member" }) =>
      updateRoleFn({ data: { tenantId, ...v } }),
    onSuccess: invalidate,
    onError: (e: unknown) => alert(e instanceof Error ? e.message : String(e)),
  });

  const removeM = useMutation({
    mutationFn: (userId: string) => removeFn({ data: { tenantId, userId } }),
    onSuccess: invalidate,
    onError: (e: unknown) => alert(e instanceof Error ? e.message : String(e)),
  });

  const addM = useMutation({
    mutationFn: (v: { email: string; role: "admin" | "member" }) =>
      addByEmailFn({ data: { tenantId, ...v } }),
    onSuccess: (res) => {
      invalidate();
      setAddEmail("");
      setAddRole("member");
      if (res?.alreadyMember) alert(t("members.alreadyMember"));
      else alert(t("members.addedOk"));
    },
    onError: (e: unknown) => alert(e instanceof Error ? e.message : String(e)),
  });

  const members = membersQ.data ?? [];
  const adminCount = members.filter((m) => m.role === "admin").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate({ to: "/app/$tenantId", params: { tenantId } })
            }
            className="rounded-md px-2 py-1 text-sm hover:bg-accent"
          >
            ← {t("common.back")}
          </button>
          <h1 className="text-lg font-semibold">
            {t("members.title")} · {currentTenant.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("workspace.addUser")}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-6">
        {membersQ.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("members.empty")}</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {members.map((m) => {
              const isLastAdmin = m.role === "admin" && adminCount <= 1;
              return (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{m.displayName}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={m.role}
                      disabled={isLastAdmin || updateM.isPending}
                      onChange={(e) =>
                        updateM.mutate({
                          userId: m.id,
                          role: e.target.value as "admin" | "member",
                        })
                      }
                      className="input h-8 py-0 text-sm"
                      title={isLastAdmin ? t("members.lastAdmin") : undefined}
                    >
                      <option value="admin">{t("members.admin")}</option>
                      <option value="member">{t("members.member")}</option>
                    </select>
                    <button
                      type="button"
                      disabled={removeM.isPending}
                      onClick={() => {
                        if (confirm(t("members.confirmRemove", { name: m.displayName }))) {
                          removeM.mutate(m.id);
                        }
                      }}
                      className="rounded-md px-2 py-1 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {t("members.remove")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 text-xs text-muted-foreground">
          <Link
            to="/app/$tenantId"
            params={{ tenantId }}
            className="hover:underline"
          >
            ← {t("common.back")}
          </Link>
        </div>
      </main>

      {inviteOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setInviteOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-semibold">{t("workspace.inviteTitle")}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{t("workspace.inviteBody")}</p>
            <div className="mb-4 flex items-center gap-2">
              <code className="flex-1 rounded bg-accent px-3 py-2 text-center font-mono text-lg font-semibold tracking-widest">
                {currentTenant.joinCode}
              </code>
              <button
                type="button"
                onClick={copyJoinCode}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {copied ? t("workspace.copied") : t("workspace.copyCode")}
              </button>
            </div>

            <div className="mb-4 border-t border-border pt-4">
              <h3 className="mb-2 text-sm font-semibold">{t("members.addDirectTitle")}</h3>
              <p className="mb-3 text-xs text-muted-foreground">
                {t("members.addDirectBody")}
              </p>
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!addEmail.trim()) return;
                  addM.mutate({ email: addEmail.trim(), role: addRole });
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="input h-9 text-sm"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as "admin" | "member")}
                    className="input h-9 py-0 text-sm"
                  >
                    <option value="member">{t("members.member")}</option>
                    <option value="admin">{t("members.admin")}</option>
                  </select>
                  <button
                    type="submit"
                    disabled={addM.isPending || !addEmail.trim()}
                    className="ml-auto rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {addM.isPending ? t("common.saving") : t("members.addDirectBtn")}
                  </button>
                </div>
              </form>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-md px-3 py-1.5 text-sm hover:bg-accent"
              >
                {t("workspace.close")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
