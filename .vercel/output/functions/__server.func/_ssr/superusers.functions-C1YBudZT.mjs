import { c as createServerRpc } from "./createServerRpc-u5LCtV_C.mjs";
import { c as createServerFn } from "./server-ACSZmim3.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-CAaNNUN6.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, e as enumType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const isSuperuser_createServerFn_handler = createServerRpc({
  id: "ed927828b35765e5adf95229ff31f2114da55079729b90f8cd84bfbe2af92136",
  name: "isSuperuser",
  filename: "src/lib/api/superusers.functions.ts"
}, (opts) => isSuperuser.__executeServer(opts));
const isSuperuser = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(isSuperuser_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "superuser"
  });
  if (error) throw new Error(error.message);
  return {
    is: !!data
  };
});
const listSuperusers_createServerFn_handler = createServerRpc({
  id: "4345bb7bcdd84c5bf05f04bc9fd6715116468d24e61063b1c4e49a9a37399bcb",
  name: "listSuperusers",
  filename: "src/lib/api/superusers.functions.ts"
}, (opts) => listSuperusers.__executeServer(opts));
const listSuperusers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listSuperusers_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.rpc("list_superusers");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    userId: r.user_id,
    displayName: r.display_name,
    email: r.email ?? "",
    createdAt: r.created_at
  }));
});
const listAllWorkspaceUsers_createServerFn_handler = createServerRpc({
  id: "3a9ec4c6a5f96a1d925b0a97e8cf14c3b41d2d8affff3ff833a64b3aa9a9dea6",
  name: "listAllWorkspaceUsers",
  filename: "src/lib/api/superusers.functions.ts"
}, (opts) => listAllWorkspaceUsers.__executeServer(opts));
const listAllWorkspaceUsers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listAllWorkspaceUsers_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.rpc("list_all_workspace_users");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    userId: r.user_id,
    displayName: r.display_name ?? "",
    email: r.email ?? "",
    isSuperuser: !!r.is_superuser,
    tenants: r.tenants ?? []
  }));
});
const grantSuperuserById_createServerFn_handler = createServerRpc({
  id: "b865fe55dee2d02166fa7e26cd7c682973c1129037a7bb53f5059fec05e221fb",
  name: "grantSuperuserById",
  filename: "src/lib/api/superusers.functions.ts"
}, (opts) => grantSuperuserById.__executeServer(opts));
const grantSuperuserById = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid()
}).parse(d)).handler(grantSuperuserById_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.rpc("grant_superuser", {
    p_user_id: data.userId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const revokeSuperuser_createServerFn_handler = createServerRpc({
  id: "0dc34336f508a18abb4c18c2ff00b5f36b0a71f0c369b1f9224375593f1ac9d6",
  name: "revokeSuperuser",
  filename: "src/lib/api/superusers.functions.ts"
}, (opts) => revokeSuperuser.__executeServer(opts));
const revokeSuperuser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid()
}).parse(d)).handler(revokeSuperuser_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.rpc("revoke_superuser", {
    p_user_id: data.userId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const grantSuperuserByEmail_createServerFn_handler = createServerRpc({
  id: "8c56128b3989bea8cf2e5136b7a200cea85e25a865b63af586ad7b0e6cfe212a",
  name: "grantSuperuserByEmail",
  filename: "src/lib/api/superusers.functions.ts"
}, (opts) => grantSuperuserByEmail.__executeServer(opts));
const grantSuperuserByEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  email: stringType().email().max(255)
}).parse(d)).handler(grantSuperuserByEmail_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: amSuper,
    error: roleErr
  } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "superuser"
  });
  if (roleErr) throw new Error(roleErr.message);
  if (!amSuper) throw new Error("Only superusers can grant superuser");
  const {
    getSupabaseAdmin
  } = await import("./admin.server-DKcGORAI.mjs");
  const admin = getSupabaseAdmin();
  const email = data.email.trim().toLowerCase();
  let userId = null;
  const {
    data: profile
  } = await admin.from("profiles").select("id").ilike("email", email).limit(1).maybeSingle();
  if (profile?.id) userId = profile.id;
  if (!userId) {
    for (let page = 1; !userId && page <= 50; page += 1) {
      const {
        data: list,
        error: listErr
      } = await admin.auth.admin.listUsers({
        page,
        perPage: 1e3
      });
      if (listErr) break;
      const users = list?.users ?? [];
      const found = users.find((u) => (u.email ?? "").toLowerCase() === email);
      if (found) {
        userId = found.id;
        break;
      }
      if (users.length < 1e3) break;
    }
  }
  if (!userId) {
    return {
      ok: false,
      error: "No user found for that email"
    };
  }
  const {
    error
  } = await context.supabase.rpc("grant_superuser", {
    p_user_id: userId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true,
    userId
  };
});
const superuserUpdateMemberRole_createServerFn_handler = createServerRpc({
  id: "4185eaf9ba152191ce3a46d1d83417b3b317ebcd40beec64bd9bc75fc912638f",
  name: "superuserUpdateMemberRole",
  filename: "src/lib/api/superusers.functions.ts"
}, (opts) => superuserUpdateMemberRole.__executeServer(opts));
const superuserUpdateMemberRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid(),
  role: enumType(["admin", "member"])
}).parse(d)).handler(superuserUpdateMemberRole_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: amSuper,
    error: roleErr
  } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "superuser"
  });
  if (roleErr) throw new Error(roleErr.message);
  if (!amSuper) throw new Error("Only superusers can perform this action");
  const {
    getSupabaseAdmin
  } = await import("./admin.server-DKcGORAI.mjs");
  const admin = getSupabaseAdmin();
  const {
    data: target,
    error: tErr
  } = await admin.from("tenant_members").select("role").eq("tenant_id", data.tenantId).eq("user_id", data.userId).maybeSingle();
  if (tErr) throw new Error(tErr.message);
  if (!target) throw new Error("User is not a member of this workspace");
  if (target.role === "admin" && data.role === "member") {
    const {
      count,
      error: cErr
    } = await admin.from("tenant_members").select("user_id", {
      count: "exact",
      head: true
    }).eq("tenant_id", data.tenantId).eq("role", "admin");
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) <= 1) throw new Error("Cannot demote the last admin");
  }
  const {
    error
  } = await admin.from("tenant_members").update({
    role: data.role
  }).eq("tenant_id", data.tenantId).eq("user_id", data.userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const superuserRemoveMember_createServerFn_handler = createServerRpc({
  id: "4d18776b9396bfefb3f802662724ff4222f70c157f7b9e1d005af863cb82ef83",
  name: "superuserRemoveMember",
  filename: "src/lib/api/superusers.functions.ts"
}, (opts) => superuserRemoveMember.__executeServer(opts));
const superuserRemoveMember = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid()
}).parse(d)).handler(superuserRemoveMember_createServerFn_handler, async ({
  context,
  data
}) => {
  if (data.userId === context.userId) {
    throw new Error("Use the workspace member controls to remove yourself");
  }
  const {
    data: amSuper,
    error: roleErr
  } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "superuser"
  });
  if (roleErr) throw new Error(roleErr.message);
  if (!amSuper) throw new Error("Only superusers can perform this action");
  const {
    getSupabaseAdmin
  } = await import("./admin.server-DKcGORAI.mjs");
  const admin = getSupabaseAdmin();
  const {
    data: target,
    error: tErr
  } = await admin.from("tenant_members").select("role").eq("tenant_id", data.tenantId).eq("user_id", data.userId).maybeSingle();
  if (tErr) throw new Error(tErr.message);
  if (!target) return {
    ok: true
  };
  if (target.role === "admin") {
    const {
      count,
      error: cErr
    } = await admin.from("tenant_members").select("user_id", {
      count: "exact",
      head: true
    }).eq("tenant_id", data.tenantId).eq("role", "admin");
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) <= 1) throw new Error("Cannot remove the last admin");
  }
  const {
    error
  } = await admin.from("tenant_members").delete().eq("tenant_id", data.tenantId).eq("user_id", data.userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const superuserUpdateUserEmail_createServerFn_handler = createServerRpc({
  id: "fed37a2110dbcbeec8548cd47e21ede4a52d967bcc444961cccb135b0125ef44",
  name: "superuserUpdateUserEmail",
  filename: "src/lib/api/superusers.functions.ts"
}, (opts) => superuserUpdateUserEmail.__executeServer(opts));
const superuserUpdateUserEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid(),
  email: stringType().trim().toLowerCase().email().max(255)
}).parse(d)).handler(superuserUpdateUserEmail_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: amSuper,
    error: roleErr
  } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "superuser"
  });
  if (roleErr) throw new Error(roleErr.message);
  if (!amSuper) throw new Error("Only superusers can perform this action");
  const {
    getSupabaseAdmin
  } = await import("./admin.server-DKcGORAI.mjs");
  const admin = getSupabaseAdmin();
  const {
    error: authErr
  } = await admin.auth.admin.updateUserById(data.userId, {
    email: data.email,
    email_confirm: true
  });
  if (authErr) {
    const msg = /already|registered|exists|duplicate/i.test(authErr.message) ? "That email is already in use." : authErr.message;
    throw new Error(msg);
  }
  const {
    error: profErr
  } = await admin.from("profiles").update({
    email: data.email
  }).eq("id", data.userId);
  if (profErr) throw new Error(profErr.message);
  return {
    ok: true
  };
});
const superuserDeleteUser_createServerFn_handler = createServerRpc({
  id: "731f39104cb64db47fffa8ca24ab6c764aa95b4c4f66265ef34e55ee883df45b",
  name: "superuserDeleteUser",
  filename: "src/lib/api/superusers.functions.ts"
}, (opts) => superuserDeleteUser.__executeServer(opts));
const superuserDeleteUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid()
}).parse(d)).handler(superuserDeleteUser_createServerFn_handler, async ({
  context,
  data
}) => {
  if (data.userId === context.userId) {
    throw new Error("You cannot delete your own account here.");
  }
  const {
    data: amSuper,
    error: roleErr
  } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "superuser"
  });
  if (roleErr) throw new Error(roleErr.message);
  if (!amSuper) throw new Error("Only superusers can perform this action");
  const {
    getSupabaseAdmin
  } = await import("./admin.server-DKcGORAI.mjs");
  const admin = getSupabaseAdmin();
  const {
    data: targetIsSuper,
    error: tErr
  } = await context.supabase.rpc("has_role", {
    _user_id: data.userId,
    _role: "superuser"
  });
  if (tErr) throw new Error(tErr.message);
  if (targetIsSuper) {
    const {
      count,
      error: cErr
    } = await admin.from("user_roles").select("user_id", {
      count: "exact",
      head: true
    }).eq("role", "superuser");
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) <= 1) throw new Error("Cannot delete the last superuser");
  }
  const {
    error: delErr
  } = await admin.auth.admin.deleteUser(data.userId);
  if (delErr) throw new Error(delErr.message);
  return {
    ok: true
  };
});
const requestPaidPlan_createServerFn_handler = createServerRpc({
  id: "49f9b21d77eb90091e38c3ee6de066c9e9bb9d1252ad2bfb322f608854327ee9",
  name: "requestPaidPlan",
  filename: "src/lib/api/superusers.functions.ts"
}, (opts) => requestPaidPlan.__executeServer(opts));
const requestPaidPlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid().optional()
}).parse(d ?? {})).handler(requestPaidPlan_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("paid_plan_requests").insert({
    user_id: context.userId,
    tenant_id: data.tenantId ?? null
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listPaidPlanRequests_createServerFn_handler = createServerRpc({
  id: "182cea73b96365f89681faba8e4d6e8c86ec2498e3330013cb06fab3068cb2a7",
  name: "listPaidPlanRequests",
  filename: "src/lib/api/superusers.functions.ts"
}, (opts) => listPaidPlanRequests.__executeServer(opts));
const listPaidPlanRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listPaidPlanRequests_createServerFn_handler, async ({
  context
}) => {
  const {
    data: amSuper,
    error: roleErr
  } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "superuser"
  });
  if (roleErr) throw new Error(roleErr.message);
  if (!amSuper) throw new Error("Only superusers can view paid plan requests");
  const {
    data,
    error
  } = await context.supabase.from("paid_plan_requests").select("user_id, requested_at").order("requested_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  const latest = /* @__PURE__ */ new Map();
  for (const row of data ?? []) {
    if (!latest.has(row.user_id)) latest.set(row.user_id, row.requested_at);
  }
  return Array.from(latest.entries()).map(([userId, requestedAt]) => ({
    userId,
    requestedAt
  }));
});
export {
  grantSuperuserByEmail_createServerFn_handler,
  grantSuperuserById_createServerFn_handler,
  isSuperuser_createServerFn_handler,
  listAllWorkspaceUsers_createServerFn_handler,
  listPaidPlanRequests_createServerFn_handler,
  listSuperusers_createServerFn_handler,
  requestPaidPlan_createServerFn_handler,
  revokeSuperuser_createServerFn_handler,
  superuserDeleteUser_createServerFn_handler,
  superuserRemoveMember_createServerFn_handler,
  superuserUpdateMemberRole_createServerFn_handler,
  superuserUpdateUserEmail_createServerFn_handler
};
