import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ensureSupabase } from "@/lib/supabase/client";
import {
  grantSuperuserByEmail,
  grantSuperuserById,
  isSuperuser,
  listAllWorkspaceUsers,
  listSuperusers,
  revokeSuperuser,
} from "@/lib/api/superusers.functions";


export const Route = createFileRoute("/_authenticated/superusers")({
  head: () => ({ meta: [{ title: "Superusers — Tracker" }] }),
  component: SuperusersPage,
});

function SuperusersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isSuperFn = useServerFn(isSuperuser);
  const listFn = useServerFn(listSuperusers);
  const grantFn = useServerFn(grantSuperuserByEmail);
  const grantByIdFn = useServerFn(grantSuperuserById);
  const revokeFn = useServerFn(revokeSuperuser);
  const listAllFn = useServerFn(listAllWorkspaceUsers);

  const meQ = useQuery({
    queryKey: ["is-superuser"],
    queryFn: () => isSuperFn(),
    retry: 1,
  });

  const listQ = useQuery({
    queryKey: ["superusers"],
    queryFn: () => listFn(),
    enabled: meQ.data?.is === true,
  });

  const allUsersQ = useQuery({
    queryKey: ["all-workspace-users"],
    queryFn: () => listAllFn(),
    enabled: meQ.data?.is === true,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["superusers"] });
    qc.invalidateQueries({ queryKey: ["all-workspace-users"] });
  };

  const grantM = useMutation({
    mutationFn: (email: string) => grantFn({ data: { email } }),
    meta: { silent: true },
    onSuccess: (res) => {
      if (res && "ok" in res && res.ok === false) {
        toast.error(res.error);
        return;
      }
      toast.success(t("superusers.granted", "Superuser added"));
      invalidate();
      setEmail("");
    },
  });

  const revokeM = useMutation({
    mutationFn: (userId: string) => revokeFn({ data: { userId } }),
    onSuccess: invalidate,
  });

  const grantByIdM = useMutation({
    mutationFn: (userId: string) => grantByIdFn({ data: { userId } }),
    onSuccess: () => {
      toast.success(t("superusers.granted", "Superuser added"));
      invalidate();
    },
  });

  const [email, setEmail] = useState("");
  const [myUserId, setMyUserId] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sb = await ensureSupabase();
        const { data } = await sb.auth.getUser();
        if (!cancelled) setMyUserId(data.user?.id ?? null);
      } catch {
        /* noop */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (meQ.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">{t("common.loading")}</div>;
  }
  if (!meQ.data?.is) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h1 className="text-lg font-semibold">{t("common.notAuthorized", "Not authorized")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("superusers.onlySupers", "Only superusers can view this page.")}
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/onboarding" })}
          className="mt-4 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  const rows = listQ.data ?? [];
  const allUsers = allUsersQ.data ?? [];
  const superuserCount = rows.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/onboarding" className="rounded-md px-2 py-1 text-sm hover:bg-accent">
            ← {t("common.back")}
          </Link>
          <h1 className="text-lg font-semibold">{t("superusers.title", "Superusers")}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-base font-semibold">
            {t("superusers.addTitle", "Add superuser")}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t(
              "superusers.addBody",
              "The user must already have an account. They will gain access to every workspace.",
            )}
          </p>
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              if (!email.trim()) return;
              grantM.mutate(email.trim());
            }}
            className="mt-4 flex gap-2"
          >
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input h-9 flex-1 text-sm"
            />
            <button
              type="submit"
              disabled={grantM.isPending || !email.trim()}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {grantM.isPending ? t("common.saving") : t("common.add")}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-base font-semibold">
            {t("superusers.currentTitle", "Current superusers")}
          </h2>
          {listQ.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : rows.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {t("superusers.empty", "No superusers yet.")}
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {rows.map((r) => {
                const isSelf = r.userId === myUserId;
                const isLast = rows.length === 1;
                const blocked = isSelf && isLast;
                const handleClick = () => {
                  if (blocked) {
                    toast.error(
                      t(
                        "superusers.cannotRevokeLast",
                        "You are the last superuser — grant the role to someone else first.",
                      ),
                    );
                    return;
                  }
                  if (
                    isSelf &&
                    !window.confirm(
                      t(
                        "superusers.confirmSelfRevoke",
                        "Revoke your own superuser role? You will lose superuser access.",
                      ),
                    )
                  ) {
                    return;
                  }
                  revokeM.mutate(r.userId);
                };
                return (
                  <li key={r.userId} className="flex items-center justify-between py-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{r.displayName || r.email}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClick}
                      disabled={revokeM.isPending || blocked}
                      title={
                        blocked
                          ? t(
                              "superusers.cannotRevokeLast",
                              "You are the last superuser — grant the role to someone else first.",
                            )
                          : undefined
                      }
                      className="rounded-md px-2 py-1 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {t("superusers.revoke", "Revoke")}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-base font-semibold">
            {t("superusers.allUsersTitle", "All users")}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t(
              "superusers.allUsersBody",
              "All members across every workspace. Grant or revoke superuser directly.",
            )}
          </p>
          {allUsersQ.isLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : allUsers.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {t("superusers.allUsersEmpty", "No users found.")}
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {allUsers.map((u) => {
                const isSelf = u.userId === myUserId;
                const isLastSuper = u.isSuperuser && superuserCount <= 1;
                const blockSelfRevoke = isSelf && isLastSuper;
                const pending =
                  (revokeM.isPending && revokeM.variables === u.userId) ||
                  (grantByIdM.isPending && grantByIdM.variables === u.userId);

                const onAction = () => {
                  if (u.isSuperuser) {
                    if (blockSelfRevoke) {
                      toast.error(
                        t(
                          "superusers.cannotRevokeLast",
                          "You are the last superuser — grant the role to someone else first.",
                        ),
                      );
                      return;
                    }
                    if (
                      isSelf &&
                      !window.confirm(
                        t(
                          "superusers.confirmSelfRevoke",
                          "Revoke your own superuser role? You will lose superuser access.",
                        ),
                      )
                    ) {
                      return;
                    }
                    revokeM.mutate(u.userId);
                  } else {
                    grantByIdM.mutate(u.userId);
                  }
                };

                return (
                  <li
                    key={u.userId}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {u.displayName || u.email || u.userId}
                        </span>
                        {u.isSuperuser && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            {t("superusers.superuserBadge", "Superuser")}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {u.tenants.length === 0 ? (
                          <span className="text-[11px] italic text-muted-foreground">
                            {t("superusers.noWorkspaces", "No workspaces")}
                          </span>
                        ) : (
                          u.tenants.map((tn) => (
                            <span
                              key={tn.id}
                              className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] text-muted-foreground"
                            >
                              {tn.name}
                              <span className="ml-1 opacity-60">· {tn.role}</span>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onAction}
                      disabled={pending || blockSelfRevoke}
                      title={
                        blockSelfRevoke
                          ? t(
                              "superusers.cannotRevokeLast",
                              "You are the last superuser — grant the role to someone else first.",
                            )
                          : undefined
                      }
                      className={
                        u.isSuperuser
                          ? "rounded-md px-2 py-1 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                          : "rounded-md border border-border px-2 py-1 text-sm hover:bg-accent disabled:opacity-50"
                      }
                    >
                      {u.isSuperuser
                        ? t("superusers.revoke", "Revoke")
                        : t("superusers.grant", "Grant superuser")}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
