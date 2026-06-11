import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ensureSupabase } from "@/lib/supabase/client";

import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  addMemberByEmail,
  listMyTenants,
  listTenantMembers,
  removeMember,
  setMemberPassword,
  updateMemberEmail,
  updateMemberName,
  updateMemberRole,
} from "@/lib/api/tenants.functions";
import {
  grantSuperuserById,
  isSuperuser as isSuperuserFn,
  listAllWorkspaceUsers,
  revokeSuperuser,
  superuserDeleteUser,
  superuserRemoveMember,
  superuserUpdateMemberRole,
  superuserUpdateUserEmail,
} from "@/lib/api/superusers.functions";

export const Route = createFileRoute("/_authenticated/members/$tenantId")({
  head: () => ({ meta: [{ title: "Users — Tracker" }] }),
  component: MembersPage,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-6 text-sm">Ei löytynyt.</div>,
});

function MembersPage() {
  const { t } = useTranslation();
  const { tenantId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const tenantsFn = useServerFn(listMyTenants);
  const listFn = useServerFn(listTenantMembers);
  const updateRoleFn = useServerFn(updateMemberRole);
  const updateNameFn = useServerFn(updateMemberName);
  const removeFn = useServerFn(removeMember);
  const addByEmailFn = useServerFn(addMemberByEmail);
  const setPasswordFn = useServerFn(setMemberPassword);
  const updateEmailFn = useServerFn(updateMemberEmail);
  const isSuperSF = useServerFn(isSuperuserFn);
  const listAllSF = useServerFn(listAllWorkspaceUsers);
  const grantSuperSF = useServerFn(grantSuperuserById);
  const revokeSuperSF = useServerFn(revokeSuperuser);
  const suRoleSF = useServerFn(superuserUpdateMemberRole);
  const suRemoveSF = useServerFn(superuserRemoveMember);
  const suEmailSF = useServerFn(superuserUpdateUserEmail);
  const suDeleteSF = useServerFn(superuserDeleteUser);

  const tenantsQ = useQuery({
    queryKey: ["my-tenants"],
    queryFn: () => tenantsFn(),
    retry: 1,
  });
  const currentTenant = tenantsQ.data?.find((t) => t.id === tenantId) ?? null;

  useEffect(() => {
    if (!tenantsQ.data) return;
    if (tenantsQ.data.length === 0) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    if (!currentTenant) {
      navigate({ to: "/app/$tenantId", params: { tenantId: tenantsQ.data[0].id }, replace: true });
    }
  }, [currentTenant, navigate, tenantsQ.data]);

  const isAdmin = currentTenant?.role === "admin" || currentTenant?.role === "superuser";

  const membersQ = useQuery({
    queryKey: ["members", tenantId],
    queryFn: () => listFn({ data: { tenantId } }),
    enabled: !!currentTenant,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["members", tenantId] });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<"admin" | "member">("member");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState("");
  const [editingEmailScope, setEditingEmailScope] = useState<"tenant" | "super">("tenant");
  const [pwUserId, setPwUserId] = useState<string | null>(null);
  const [pwValue, setPwValue] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const sb = await ensureSupabase();
        const { data } = await sb.auth.getUser();
        if (active) setCurrentUserId(data.user?.id ?? null);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard?.writeText(currentTenant?.joinCode ?? "");
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
  });

  const removeM = useMutation({
    mutationFn: (userId: string) => removeFn({ data: { tenantId, userId } }),
    onSuccess: () => {
      invalidate();
      setRemoveId(null);
    },
    onError: () => {
      setRemoveId(null);
    },
  });

  const renameM = useMutation({
    mutationFn: (v: { userId: string; displayName: string }) =>
      updateNameFn({ data: { tenantId, ...v } }),
    onSuccess: () => {
      setEditingId(null);
      setEditingName("");
      invalidate();
    },
  });

  const addM = useMutation({
    mutationFn: (v: { email: string; role: "admin" | "member" }) =>
      addByEmailFn({
        data: {
          tenantId,
          ...v,
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/reset-password`
              : undefined,
        },
      }),
    meta: { silent: true },
    onSuccess: (res) => {
      if (res?.ok === false) {
        toast.error(res.error);
        return;
      }
      invalidate();
      setAddEmail("");
      setAddRole("member");
      if (res?.alreadyMember) toast.success(t("members.alreadyMember"));
      else toast.success(t("members.addedOk"));
    },
  });

  const setPwM = useMutation({
    mutationFn: (v: { userId: string; password: string }) =>
      setPasswordFn({ data: { tenantId, ...v } }),
    meta: { silent: true },
    onSuccess: () => {
      setPwUserId(null);
      setPwValue("");
      toast.success("Password updated.");
    },
  });

  const updateEmailM = useMutation({
    mutationFn: (v: { userId: string; email: string }) =>
      updateEmailFn({ data: { tenantId, ...v } }),
    meta: { silent: true },
    onSuccess: () => {
      setEditingEmailId(null);
      setEditingEmail("");
      toast.success(t("members.emailUpdated"));
      qc.invalidateQueries({ queryKey: ["members", tenantId] });
      qc.invalidateQueries({ queryKey: ["all-workspace-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const suEmailM = useMutation({
    mutationFn: (v: { userId: string; email: string }) => suEmailSF({ data: v }),
    meta: { silent: true },
    onSuccess: () => {
      setEditingEmailId(null);
      setEditingEmail("");
      toast.success(t("members.emailUpdated"));
      qc.invalidateQueries({ queryKey: ["all-workspace-users"] });
      qc.invalidateQueries({ queryKey: ["members", tenantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });



  const isSuperQ = useQuery({
    queryKey: ["is-superuser"],
    queryFn: () => isSuperSF(),
    retry: 1,
  });
  const isSuper = !!isSuperQ.data?.is;

  const allUsersQ = useQuery({
    queryKey: ["all-workspace-users"],
    queryFn: () => listAllSF(),
    enabled: isSuper,
  });

  const invalidateSuper = () => {
    qc.invalidateQueries({ queryKey: ["all-workspace-users"] });
    qc.invalidateQueries({ queryKey: ["members", tenantId] });
  };

  const grantSuperM = useMutation({
    mutationFn: (userId: string) => grantSuperSF({ data: { userId } }),
    onSuccess: () => {
      toast.success(t("members.grantSuperuser"));
      invalidateSuper();
    },
  });
  const revokeSuperM = useMutation({
    mutationFn: (userId: string) => revokeSuperSF({ data: { userId } }),
    onSuccess: invalidateSuper,
  });
  const suRoleM = useMutation({
    mutationFn: (v: { tenantId: string; userId: string; role: "admin" | "member" }) =>
      suRoleSF({ data: v }),
    onSuccess: invalidateSuper,
  });
  const suRemoveM = useMutation({
    mutationFn: (v: { tenantId: string; userId: string }) => suRemoveSF({ data: v }),
    onSuccess: invalidateSuper,
  });
  const suDeleteM = useMutation({
    mutationFn: (userId: string) => suDeleteSF({ data: { userId } }),
    onSuccess: () => {
      toast.success(t("members.deleteUserSuccess"));
      setDeleteUserId(null);
      invalidateSuper();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const members = membersQ.data ?? [];
  const adminCount = members.filter((m) => m.role === "admin").length;
  const otherUsers = (allUsersQ.data ?? []).filter(
    (u) => !u.tenants.some((tn) => tn.id === tenantId),
  );
  const superuserCount = (allUsersQ.data ?? []).filter((u) => u.isSuperuser).length;
  const pageError = tenantsQ.error ?? membersQ.error;

  if (pageError) {
    return <div className="p-6 text-sm text-destructive">{pageError instanceof Error ? pageError.message : String(pageError)}</div>;
  }

  if (tenantsQ.isLoading || !currentTenant) {
    return <div className="p-6 text-sm text-muted-foreground">{t("common.loading")}</div>;
  }

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
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("workspace.addUser")}
            </button>
          ) : null}
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
              const isSelf = currentUserId === m.id;
              const isLastAdmin = m.role === "admin" && adminCount <= 1;
              // Admins cannot modify another admin; last admin cannot demote self.
              const roleLocked =
                (m.role === "admin" && !isSelf) || (isSelf && isLastAdmin);
              const roleLockReason = roleLocked
                ? isSelf
                  ? t("members.lastAdmin")
                  : t("members.peerAdmin")
                : undefined;
              return (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    {isAdmin && editingId === m.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const name = editingName.trim();
                          if (!name) return;
                          renameM.mutate({ userId: m.id, displayName: name });
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="input h-8 flex-1 text-sm"
                          maxLength={80}
                        />
                        <button
                          type="submit"
                          disabled={renameM.isPending || !editingName.trim()}
                          className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          {renameM.isPending ? t("common.saving") : t("common.saved")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName("");
                          }}
                          className="rounded-md px-2 py-1 text-xs hover:bg-accent"
                        >
                          {t("common.cancel")}
                        </button>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{m.displayName}</div>
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(m.id);
                                setEditingName(m.displayName);
                              }}
                              className="rounded-md px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent"
                            >
                              {t("members.editName")}
                            </button>
                          ) : null}
                        </div>
                        {isAdmin && editingEmailId === m.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const email = editingEmail.trim();
                              if (!email) return;
                              if (editingEmailScope === "super") {
                                suEmailM.mutate({ userId: m.id, email });
                              } else {
                                updateEmailM.mutate({ userId: m.id, email });
                              }
                            }}
                            className="mt-1 flex items-center gap-2"
                          >
                            <input
                              autoFocus
                              type="email"
                              value={editingEmail}
                              onChange={(e) => setEditingEmail(e.target.value)}
                              className="input h-7 flex-1 text-xs"
                              maxLength={255}
                              required
                            />
                            <button
                              type="submit"
                              disabled={
                                updateEmailM.isPending ||
                                suEmailM.isPending ||
                                !editingEmail.trim()
                              }
                              className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                              {updateEmailM.isPending || suEmailM.isPending
                                ? t("common.saving")
                                : t("common.saved")}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEmailId(null);
                                setEditingEmail("");
                              }}
                              className="rounded-md px-2 py-1 text-xs hover:bg-accent"
                            >
                              {t("common.cancel")}
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">{m.email}</div>
                            {isAdmin ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingEmailId(m.id);
                                  setEditingEmail(m.email);
                                  setEditingEmailScope("tenant");
                                }}
                                className="rounded-md px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-accent"
                              >
                                {t("members.editEmail")}
                              </button>
                            ) : null}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <select
                        value={m.role}
                        disabled={roleLocked || updateM.isPending}
                        onChange={(e) =>
                          updateM.mutate({
                            userId: m.id,
                            role: e.target.value as "admin" | "member",
                          })
                        }
                        className="input h-8 py-0 text-sm"
                        title={roleLockReason}
                      >
                        <option value="admin">{t("members.admin")}</option>
                        <option value="member">{t("members.member")}</option>
                      </select>
                    ) : (
                      <span className="rounded-md bg-accent px-2 py-1 text-xs font-medium">
                        {m.role === "admin" ? t("members.admin") : t("members.member")}
                      </span>
                    )}
                    {isAdmin ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setPwUserId(m.id);
                            setPwValue("");
                          }}
                          className="rounded-md px-2 py-1 text-sm hover:bg-accent"
                        >
                          Set password
                        </button>
                        <button
                          type="button"
                          disabled={removeM.isPending}
                          onClick={() => setRemoveId(m.id)}
                          className="rounded-md px-2 py-1 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                          {t("members.remove")}
                        </button>
                      </>
                    ) : null}
                  </div>


                </li>
              );
            })}
          </ul>
        )}

        {isSuper ? (
          <section className="mt-8 rounded-xl border border-border bg-background p-4">
            <h2 className="text-base font-semibold">{t("members.otherUsersTitle")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("members.otherUsersBody")}</p>
            {allUsersQ.isLoading ? (
              <p className="mt-3 text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : otherUsers.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{t("members.otherUsersEmpty")}</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {otherUsers.map((u) => {
                  const isSelf = u.userId === currentUserId;
                  const isLastSuper = u.isSuperuser && superuserCount <= 1;
                  const blockSelfRevoke = isSelf && isLastSuper;
                  const onSuperClick = () => {
                    if (u.isSuperuser) {
                      if (blockSelfRevoke) {
                        toast.error(t("members.cannotRevokeLast"));
                        return;
                      }
                      if (isSelf && !window.confirm(t("members.confirmSelfRevoke"))) return;
                      revokeSuperM.mutate(u.userId);
                    } else {
                      grantSuperM.mutate(u.userId);
                    }
                  };
                  return (
                    <li key={u.userId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {u.displayName || u.email || u.userId}
                          </span>
                          {u.isSuperuser && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                              {t("members.superuserBadge")}
                            </span>
                          )}
                        </div>
                        {editingEmailId === u.userId && editingEmailScope === "super" ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const email = editingEmail.trim();
                              if (!email) return;
                              suEmailM.mutate({ userId: u.userId, email });
                            }}
                            className="mt-1 flex items-center gap-2"
                          >
                            <input
                              autoFocus
                              type="email"
                              value={editingEmail}
                              onChange={(e) => setEditingEmail(e.target.value)}
                              className="input h-7 flex-1 text-xs"
                              maxLength={255}
                              required
                            />
                            <button
                              type="submit"
                              disabled={suEmailM.isPending || !editingEmail.trim()}
                              className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                              {suEmailM.isPending ? t("common.saving") : t("common.saved")}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEmailId(null);
                                setEditingEmail("");
                              }}
                              className="rounded-md px-2 py-1 text-xs hover:bg-accent"
                            >
                              {t("common.cancel")}
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEmailId(u.userId);
                                setEditingEmail(u.email);
                                setEditingEmailScope("super");
                              }}
                              className="rounded-md px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-accent"
                            >
                              {t("members.editEmail")}
                            </button>
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {u.tenants.length === 0 ? (
                            <span className="text-[11px] italic text-muted-foreground">
                              {t("members.noWorkspaces")}
                            </span>
                          ) : (
                            u.tenants.map((tn) => (
                              <span
                                key={tn.id}
                                className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] text-muted-foreground"
                              >
                                <span>{tn.name}</span>
                                <select
                                  value={tn.role}
                                  onChange={(e) =>
                                    suRoleM.mutate({
                                      tenantId: tn.id,
                                      userId: u.userId,
                                      role: e.target.value as "admin" | "member",
                                    })
                                  }
                                  disabled={suRoleM.isPending}
                                  className="input h-6 py-0 text-[11px]"
                                >
                                  <option value="admin">{t("members.admin")}</option>
                                  <option value="member">{t("members.member")}</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() =>
                                    suRemoveM.mutate({ tenantId: tn.id, userId: u.userId })
                                  }
                                  disabled={suRemoveM.isPending}
                                  className="rounded px-1 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                  title={t("members.removeFromWorkspace")}
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={onSuperClick}
                          disabled={
                            blockSelfRevoke || grantSuperM.isPending || revokeSuperM.isPending
                          }
                          title={blockSelfRevoke ? t("members.cannotRevokeLast") : undefined}
                          className={
                            u.isSuperuser
                              ? "rounded-md px-2 py-1 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                              : "rounded-md border border-border px-2 py-1 text-sm hover:bg-accent disabled:opacity-50"
                          }
                        >
                          {u.isSuperuser
                            ? t("members.revokeSuperuser")
                            : t("members.grantSuperuser")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (isSelf) {
                              toast.error(t("members.cannotDeleteSelf"));
                              return;
                            }
                            if (isLastSuper) {
                              toast.error(t("members.cannotDeleteLastSuperuser"));
                              return;
                            }
                            setDeleteUserId(u.userId);
                          }}
                          disabled={isSelf || isLastSuper || suDeleteM.isPending}
                          className="rounded-md border border-destructive/40 px-2 py-1 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                          {t("members.deleteUser")}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ) : null}

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

      {pwUserId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPwUserId(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-semibold">Set password</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              {members.find((m) => m.id === pwUserId)?.email}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (pwValue.length < 8) {
                  toast.error("Password must be at least 8 characters.");
                  return;
                }
                setPwM.mutate({ userId: pwUserId, password: pwValue });
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                autoFocus
                value={pwValue}
                onChange={(e) => setPwValue(e.target.value)}
                placeholder="New password (min 8 chars)"
                className="input h-9 text-sm"
                minLength={8}
                maxLength={72}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPwUserId(null)}
                  className="rounded-md px-3 py-1.5 text-sm hover:bg-accent"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={setPwM.isPending || pwValue.length < 8}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {setPwM.isPending ? t("common.saving") : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <AlertDialog open={!!removeId} onOpenChange={(open) => !open && setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {removeId
                ? t("members.confirmRemove", {
                    name: members.find((m) => m.id === removeId)?.displayName ?? "",
                  })
                : ""}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveId(null)}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (removeId) removeM.mutate(removeId);
              }}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
