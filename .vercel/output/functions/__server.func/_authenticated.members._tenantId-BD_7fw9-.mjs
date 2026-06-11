import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate, L as Link } from "./_libs/tanstack__react-router.mjs";
import { R as Route$2, u as useServerFn } from "./_ssr/router-CLHUrko-.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { e as ensureSupabase } from "./_ssr/client-F9s_q744.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { i as isSuperuser, l as listAllWorkspaceUsers, g as grantSuperuserById, r as revokeSuperuser, s as superuserUpdateMemberRole, a as superuserRemoveMember, b as superuserUpdateUserEmail, c as superuserDeleteUser, d as requestPaidPlan, e as listPaidPlanRequests, A as AlertDialog, f as AlertDialogContent, h as AlertDialogHeader, j as AlertDialogTitle, k as AlertDialogFooter, m as AlertDialogCancel, n as AlertDialogAction, o as AlertDialogDescription } from "./_ssr/superusers.functions-DpZBuD_J.mjs";
import { l as listMyTenants, a as listTenantMembers, u as updateMemberRole, b as updateMemberName, r as removeMember, d as addMemberByEmail, s as setMemberPassword, e as updateMemberEmail } from "./_ssr/tenants.functions-Cd6k6oiM.mjs";
import "./_libs/i18next.mjs";
import "./_libs/seroval.mjs";
import { u as useTranslation } from "./_libs/react-i18next.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_ssr/createSsrRpc-B-oggCnm.mjs";
import "./_ssr/server-ACSZmim3.mjs";
import "node:async_hooks";
import "./_libs/h3-v2.mjs";
import "./_libs/rou3.mjs";
import "./_libs/srvx.mjs";
import "./_ssr/auth-middleware-CAaNNUN6.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/zod.mjs";
import "./_libs/use-sync-external-store.mjs";
import "./_libs/radix-ui__react-alert-dialog.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/radix-ui__react-dialog.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/class-variance-authority.mjs";
const FREE_MEMBER_LIMIT = 4;
function MembersPage() {
  const {
    t
  } = useTranslation();
  const {
    tenantId
  } = Route$2.useParams();
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
  const isSuperSF = useServerFn(isSuperuser);
  const listAllSF = useServerFn(listAllWorkspaceUsers);
  const grantSuperSF = useServerFn(grantSuperuserById);
  const revokeSuperSF = useServerFn(revokeSuperuser);
  const suRoleSF = useServerFn(superuserUpdateMemberRole);
  const suRemoveSF = useServerFn(superuserRemoveMember);
  const suEmailSF = useServerFn(superuserUpdateUserEmail);
  const suDeleteSF = useServerFn(superuserDeleteUser);
  const requestPaidSF = useServerFn(requestPaidPlan);
  const listPaidReqSF = useServerFn(listPaidPlanRequests);
  const tenantsQ = useQuery({
    queryKey: ["my-tenants"],
    queryFn: () => tenantsFn(),
    retry: 1
  });
  const currentTenant = tenantsQ.data?.find((t2) => t2.id === tenantId) ?? null;
  reactExports.useEffect(() => {
    if (!tenantsQ.data) return;
    if (tenantsQ.data.length === 0) {
      navigate({
        to: "/onboarding",
        replace: true
      });
      return;
    }
    if (!currentTenant) {
      navigate({
        to: "/app/$tenantId",
        params: {
          tenantId: tenantsQ.data[0].id
        },
        replace: true
      });
    }
  }, [currentTenant, navigate, tenantsQ.data]);
  const isAdmin = currentTenant?.role === "admin" || currentTenant?.role === "superuser";
  const membersQ = useQuery({
    queryKey: ["members", tenantId],
    queryFn: () => listFn({
      data: {
        tenantId
      }
    }),
    enabled: !!currentTenant
  });
  const invalidate = () => qc.invalidateQueries({
    queryKey: ["members", tenantId]
  });
  const [inviteOpen, setInviteOpen] = reactExports.useState(false);
  const [copied, setCopied] = reactExports.useState(false);
  const [addEmail, setAddEmail] = reactExports.useState("");
  const [addRole, setAddRole] = reactExports.useState("member");
  const [editingId, setEditingId] = reactExports.useState(null);
  const [editingName, setEditingName] = reactExports.useState("");
  const [editingEmailId, setEditingEmailId] = reactExports.useState(null);
  const [editingEmail, setEditingEmail] = reactExports.useState("");
  const [editingEmailScope, setEditingEmailScope] = reactExports.useState("tenant");
  const [pwUserId, setPwUserId] = reactExports.useState(null);
  const [pwValue, setPwValue] = reactExports.useState("");
  const [currentUserId, setCurrentUserId] = reactExports.useState(null);
  const [removeId, setRemoveId] = reactExports.useState(null);
  const [deleteUserId, setDeleteUserId] = reactExports.useState(null);
  const [limitDialogOpen, setLimitDialogOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const sb = await ensureSupabase();
        const {
          data
        } = await sb.auth.getUser();
        if (active) setCurrentUserId(data.user?.id ?? null);
      } catch {
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
    }
  };
  const updateM = useMutation({
    mutationFn: (v) => updateRoleFn({
      data: {
        tenantId,
        ...v
      }
    }),
    onSuccess: invalidate
  });
  const removeM = useMutation({
    mutationFn: (userId) => removeFn({
      data: {
        tenantId,
        userId
      }
    }),
    onSuccess: () => {
      invalidate();
      setRemoveId(null);
    },
    onError: () => {
      setRemoveId(null);
    }
  });
  const renameM = useMutation({
    mutationFn: (v) => updateNameFn({
      data: {
        tenantId,
        ...v
      }
    }),
    onSuccess: () => {
      setEditingId(null);
      setEditingName("");
      invalidate();
    }
  });
  const addM = useMutation({
    mutationFn: (v) => addByEmailFn({
      data: {
        tenantId,
        ...v,
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : void 0
      }
    }),
    meta: {
      silent: true
    },
    onSuccess: (res) => {
      if (res?.ok === false) {
        if (res.error === "FREE_LIMIT_REACHED") {
          setLimitDialogOpen(true);
        } else {
          toast.error(res.error);
        }
        return;
      }
      invalidate();
      setAddEmail("");
      setAddRole("member");
      if (res?.alreadyMember) toast.success(t("members.alreadyMember"));
      else toast.success(t("members.addedOk"));
    }
  });
  const setPwM = useMutation({
    mutationFn: (v) => setPasswordFn({
      data: {
        tenantId,
        ...v
      }
    }),
    meta: {
      silent: true
    },
    onSuccess: () => {
      setPwUserId(null);
      setPwValue("");
      toast.success("Password updated.");
    }
  });
  const updateEmailM = useMutation({
    mutationFn: (v) => updateEmailFn({
      data: {
        tenantId,
        ...v
      }
    }),
    meta: {
      silent: true
    },
    onSuccess: () => {
      setEditingEmailId(null);
      setEditingEmail("");
      toast.success(t("members.emailUpdated"));
      qc.invalidateQueries({
        queryKey: ["members", tenantId]
      });
      qc.invalidateQueries({
        queryKey: ["all-workspace-users"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const suEmailM = useMutation({
    mutationFn: (v) => suEmailSF({
      data: v
    }),
    meta: {
      silent: true
    },
    onSuccess: () => {
      setEditingEmailId(null);
      setEditingEmail("");
      toast.success(t("members.emailUpdated"));
      qc.invalidateQueries({
        queryKey: ["all-workspace-users"]
      });
      qc.invalidateQueries({
        queryKey: ["members", tenantId]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const isSuperQ = useQuery({
    queryKey: ["is-superuser"],
    queryFn: () => isSuperSF(),
    retry: 1
  });
  const isSuper = !!isSuperQ.data?.is;
  const allUsersQ = useQuery({
    queryKey: ["all-workspace-users"],
    queryFn: () => listAllSF(),
    enabled: isSuper
  });
  const paidReqQ = useQuery({
    queryKey: ["paid-plan-requests"],
    queryFn: () => listPaidReqSF(),
    enabled: isSuper
  });
  const paidReqMap = new Map((paidReqQ.data ?? []).map((r) => [r.userId, r.requestedAt]));
  const requestPaidM = useMutation({
    mutationFn: () => requestPaidSF({
      data: {
        tenantId
      }
    })
  });
  const invalidateSuper = () => {
    qc.invalidateQueries({
      queryKey: ["all-workspace-users"]
    });
    qc.invalidateQueries({
      queryKey: ["members", tenantId]
    });
  };
  const grantSuperM = useMutation({
    mutationFn: (userId) => grantSuperSF({
      data: {
        userId
      }
    }),
    onSuccess: () => {
      toast.success(t("members.grantSuperuser"));
      invalidateSuper();
    }
  });
  const revokeSuperM = useMutation({
    mutationFn: (userId) => revokeSuperSF({
      data: {
        userId
      }
    }),
    onSuccess: invalidateSuper
  });
  const suRoleM = useMutation({
    mutationFn: (v) => suRoleSF({
      data: v
    }),
    onSuccess: invalidateSuper
  });
  const suRemoveM = useMutation({
    mutationFn: (v) => suRemoveSF({
      data: v
    }),
    onSuccess: invalidateSuper
  });
  const suDeleteM = useMutation({
    mutationFn: (userId) => suDeleteSF({
      data: {
        userId
      }
    }),
    onSuccess: () => {
      toast.success(t("members.deleteUserSuccess"));
      setDeleteUserId(null);
      invalidateSuper();
    },
    onError: (e) => toast.error(e.message)
  });
  const members = membersQ.data ?? [];
  const allUsersById = new Map((allUsersQ.data ?? []).map((u) => [u.userId, u]));
  const adminCount = members.filter((m) => m.role === "admin").length;
  const otherUsers = (allUsersQ.data ?? []).filter((u) => !u.tenants.some((tn) => tn.id === tenantId));
  const superuserCount = (allUsersQ.data ?? []).filter((u) => u.isSuperuser).length;
  const pageError = tenantsQ.error ?? membersQ.error;
  if (pageError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-destructive", children: pageError instanceof Error ? pageError.message : String(pageError) });
  }
  if (tenantsQ.isLoading || !currentTenant) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: t("common.loading") });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between border-b border-border px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate({
          to: "/app/$tenantId",
          params: {
            tenantId
          }
        }), className: "rounded-md px-2 py-1 text-sm hover:bg-accent", children: [
          "← ",
          t("common.back")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-lg font-semibold", children: [
          t("members.title"),
          " · ",
          currentTenant.name
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
        if (!isSuper && members.length >= FREE_MEMBER_LIMIT) {
          setLimitDialogOpen(true);
          return;
        }
        setInviteOpen(true);
      }, className: "rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90", children: t("workspace.addUser") }) : null })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl p-6", children: [
      membersQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("common.loading") }) : members.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("members.empty") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border rounded-md border border-border", children: members.map((m) => {
        const isSelf = currentUserId === m.id;
        const memberIsSuper = !!allUsersById.get(m.id)?.isSuperuser;
        const isLastSuper = memberIsSuper && superuserCount > 0 && superuserCount <= 1;
        const blockSelfSuperRevoke = isSelf && isLastSuper;
        const isLastAdmin = m.role === "admin" && adminCount <= 1;
        const roleLocked = m.role === "admin" && !isSelf || isSelf && isLastAdmin;
        const roleLockReason = roleLocked ? isSelf ? t("members.lastAdmin") : t("members.peerAdmin") : void 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-wrap items-center justify-between gap-3 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 flex-1", children: isAdmin && editingId === m.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
            e.preventDefault();
            const name = editingName.trim();
            if (!name) return;
            renameM.mutate({
              userId: m.id,
              displayName: name
            });
          }, className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, value: editingName, onChange: (e) => setEditingName(e.target.value), className: "input h-8 flex-1 text-sm", maxLength: 80 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: renameM.isPending || !editingName.trim(), className: "rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50", children: renameM.isPending ? t("common.saving") : t("common.saved") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
              setEditingId(null);
              setEditingName("");
            }, className: "rounded-md px-2 py-1 text-xs hover:bg-accent", children: t("common.cancel") })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: m.displayName }),
              isSuper && paidReqMap.has(m.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: t("members.paidPlanRequestedAt", {
                when: new Date(paidReqMap.get(m.id)).toLocaleString()
              }), className: "rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400", children: t("members.paidPlanBadge") }) : null,
              isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                setEditingId(m.id);
                setEditingName(m.displayName);
              }, className: "rounded-md px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent", children: t("members.editName") }) : null
            ] }),
            isAdmin && editingEmailId === m.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
              e.preventDefault();
              const email = editingEmail.trim();
              if (!email) return;
              if (editingEmailScope === "super") {
                suEmailM.mutate({
                  userId: m.id,
                  email
                });
              } else {
                updateEmailM.mutate({
                  userId: m.id,
                  email
                });
              }
            }, className: "mt-1 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, type: "email", value: editingEmail, onChange: (e) => setEditingEmail(e.target.value), className: "input h-7 flex-1 text-xs", maxLength: 255, required: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: updateEmailM.isPending || suEmailM.isPending || !editingEmail.trim(), className: "rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50", children: updateEmailM.isPending || suEmailM.isPending ? t("common.saving") : t("common.saved") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                setEditingEmailId(null);
                setEditingEmail("");
              }, className: "rounded-md px-2 py-1 text-xs hover:bg-accent", children: t("common.cancel") })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: m.email }),
              isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                setEditingEmailId(m.id);
                setEditingEmail(m.email);
                setEditingEmailScope("tenant");
              }, className: "rounded-md px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-accent", children: t("members.editEmail") }) : null
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: m.role, disabled: roleLocked || updateM.isPending, onChange: (e) => updateM.mutate({
              userId: m.id,
              role: e.target.value
            }), className: "input h-8 py-0 text-sm", title: roleLockReason, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "admin", children: t("members.admin") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "member", children: t("members.member") })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-accent px-2 py-1 text-xs font-medium", children: m.role === "admin" ? t("members.admin") : t("members.member") }),
            isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              isSuper ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                if (memberIsSuper) {
                  if (blockSelfSuperRevoke) {
                    toast.error(t("members.cannotRevokeLast"));
                    return;
                  }
                  if (isSelf && !window.confirm(t("members.confirmSelfRevoke"))) return;
                  revokeSuperM.mutate(m.id);
                } else {
                  grantSuperM.mutate(m.id);
                }
              }, disabled: blockSelfSuperRevoke || grantSuperM.isPending || revokeSuperM.isPending, title: blockSelfSuperRevoke ? t("members.cannotRevokeLast") : void 0, className: memberIsSuper ? "rounded-md px-2 py-1 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50" : "rounded-md border border-border px-2 py-1 text-sm hover:bg-accent disabled:opacity-50", children: memberIsSuper ? t("members.revokeSuperuser") : t("members.grantSuperuser") }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                setPwUserId(m.id);
                setPwValue("");
              }, className: "rounded-md px-2 py-1 text-sm hover:bg-accent", children: "Set password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: removeM.isPending, onClick: () => setRemoveId(m.id), className: "rounded-md px-2 py-1 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50", children: t("members.remove") })
            ] }) : null
          ] })
        ] }, m.id);
      }) }),
      isSuper ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8 rounded-xl border border-border bg-background p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: t("members.otherUsersTitle") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: t("members.otherUsersBody") }),
        allUsersQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: t("common.loading") }) : otherUsers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: t("members.otherUsersEmpty") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 divide-y divide-border", children: otherUsers.map((u) => {
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
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-wrap items-center justify-between gap-3 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: u.displayName || u.email || u.userId }),
                u.isSuperuser && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary", children: t("members.superuserBadge") }),
                paidReqMap.has(u.userId) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: t("members.paidPlanRequestedAt", {
                  when: new Date(paidReqMap.get(u.userId)).toLocaleString()
                }), className: "rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400", children: t("members.paidPlanBadge") }) : null
              ] }),
              editingEmailId === u.userId && editingEmailScope === "super" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
                e.preventDefault();
                const email = editingEmail.trim();
                if (!email) return;
                suEmailM.mutate({
                  userId: u.userId,
                  email
                });
              }, className: "mt-1 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, type: "email", value: editingEmail, onChange: (e) => setEditingEmail(e.target.value), className: "input h-7 flex-1 text-xs", maxLength: 255, required: true }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: suEmailM.isPending || !editingEmail.trim(), className: "rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50", children: suEmailM.isPending ? t("common.saving") : t("common.saved") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                  setEditingEmailId(null);
                  setEditingEmail("");
                }, className: "rounded-md px-2 py-1 text-xs hover:bg-accent", children: t("common.cancel") })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: u.email }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                  setEditingEmailId(u.userId);
                  setEditingEmail(u.email);
                  setEditingEmailScope("super");
                }, className: "rounded-md px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-accent", children: t("members.editEmail") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: u.tenants.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] italic text-muted-foreground", children: t("members.noWorkspaces") }) : u.tenants.map((tn) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tn.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: tn.role, onChange: (e) => suRoleM.mutate({
                  tenantId: tn.id,
                  userId: u.userId,
                  role: e.target.value
                }), disabled: suRoleM.isPending, className: "input h-6 py-0 text-[11px]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "admin", children: t("members.admin") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "member", children: t("members.member") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => suRemoveM.mutate({
                  tenantId: tn.id,
                  userId: u.userId
                }), disabled: suRemoveM.isPending, className: "rounded px-1 text-destructive hover:bg-destructive/10 disabled:opacity-50", title: t("members.removeFromWorkspace"), children: "×" })
              ] }, tn.id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onSuperClick, disabled: blockSelfRevoke || grantSuperM.isPending || revokeSuperM.isPending, title: blockSelfRevoke ? t("members.cannotRevokeLast") : void 0, className: u.isSuperuser ? "rounded-md px-2 py-1 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50" : "rounded-md border border-border px-2 py-1 text-sm hover:bg-accent disabled:opacity-50", children: u.isSuperuser ? t("members.revokeSuperuser") : t("members.grantSuperuser") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                if (isSelf) {
                  toast.error(t("members.cannotDeleteSelf"));
                  return;
                }
                if (isLastSuper) {
                  toast.error(t("members.cannotDeleteLastSuperuser"));
                  return;
                }
                setDeleteUserId(u.userId);
              }, disabled: isSelf || isLastSuper || suDeleteM.isPending, className: "rounded-md border border-destructive/40 px-2 py-1 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50", children: t("members.deleteUser") })
            ] })
          ] }, u.userId);
        }) })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app/$tenantId", params: {
        tenantId
      }, className: "hover:underline", children: [
        "← ",
        t("common.back")
      ] }) })
    ] }),
    inviteOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", onClick: () => setInviteOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-lg font-semibold", children: t("workspace.inviteTitle") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: t("workspace.inviteBody") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "flex-1 rounded bg-accent px-3 py-2 text-center font-mono text-lg font-semibold tracking-widest", children: currentTenant.joinCode }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: copyJoinCode, className: "rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90", children: copied ? t("workspace.copied") : t("workspace.copyCode") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 border-t border-border pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-semibold", children: t("members.addDirectTitle") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: t("members.addDirectBody") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "flex flex-col gap-2", onSubmit: (e) => {
          e.preventDefault();
          if (!addEmail.trim()) return;
          if (!isSuper && members.length >= FREE_MEMBER_LIMIT) {
            setLimitDialogOpen(true);
            return;
          }
          addM.mutate({
            email: addEmail.trim(),
            role: addRole
          });
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", required: true, placeholder: "name@example.com", value: addEmail, onChange: (e) => setAddEmail(e.target.value), className: "input h-9 text-sm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: addRole, onChange: (e) => setAddRole(e.target.value), className: "input h-9 py-0 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "member", children: t("members.member") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "admin", children: t("members.admin") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: addM.isPending || !addEmail.trim() || !isSuper && members.length >= FREE_MEMBER_LIMIT, className: "ml-auto rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50", children: addM.isPending ? t("common.saving") : t("members.addDirectBtn") })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setInviteOpen(false), className: "rounded-md px-3 py-1.5 text-sm hover:bg-accent", children: t("workspace.close") }) })
    ] }) }) : null,
    pwUserId ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", onClick: () => setPwUserId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-lg", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-lg font-semibold", children: "Set password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: members.find((m) => m.id === pwUserId)?.email }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        if (pwValue.length < 8) {
          toast.error("Password must be at least 8 characters.");
          return;
        }
        setPwM.mutate({
          userId: pwUserId,
          password: pwValue
        });
      }, className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", autoFocus: true, value: pwValue, onChange: (e) => setPwValue(e.target.value), placeholder: "New password (min 8 chars)", className: "input h-9 text-sm", minLength: 8, maxLength: 72 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPwUserId(null), className: "rounded-md px-3 py-1.5 text-sm hover:bg-accent", children: t("common.cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: setPwM.isPending || pwValue.length < 8, className: "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50", children: setPwM.isPending ? t("common.saving") : "Save" })
        ] })
      ] })
    ] }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!removeId, onOpenChange: (open) => !open && setRemoveId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: removeId ? t("members.confirmRemove", {
        name: members.find((m) => m.id === removeId)?.displayName ?? ""
      }) : "" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { onClick: () => setRemoveId(null), children: t("common.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", onClick: () => {
          if (removeId) removeM.mutate(removeId);
        }, children: t("common.delete") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleteUserId, onOpenChange: (open) => !open && setDeleteUserId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: t("members.deleteUserConfirmTitle") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: t("members.deleteUserConfirmBody", {
          name: (allUsersQ.data ?? []).find((u) => u.userId === deleteUserId)?.displayName || (allUsersQ.data ?? []).find((u) => u.userId === deleteUserId)?.email || ""
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { onClick: () => setDeleteUserId(null), children: t("common.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", onClick: () => {
          if (deleteUserId) suDeleteM.mutate(deleteUserId);
        }, children: t("members.deleteUser") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: limitDialogOpen, onOpenChange: setLimitDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: t("members.freeLimitTitle") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: t("members.freeLimitReached") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { onClick: () => setLimitDialogOpen(false), children: t("members.freeLimitOk") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => {
          requestPaidM.mutate(void 0, {
            onSuccess: () => {
              toast.success(t("members.paidPlanRequested"));
              qc.invalidateQueries({
                queryKey: ["paid-plan-requests"]
              });
            },
            onError: (e) => toast.error(e.message)
          });
          setLimitDialogOpen(false);
        }, children: t("members.freeLimitContact") })
      ] })
    ] }) })
  ] });
}
export {
  MembersPage as component
};
