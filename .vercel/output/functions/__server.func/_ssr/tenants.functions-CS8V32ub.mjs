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
const FREE_MEMBER_LIMIT = 4;
const listMyTenants_createServerFn_handler = createServerRpc({
  id: "4540f78c53fd08d6321dedda6c7223975a6a64fa6696d8831854ac890d13b95d",
  name: "listMyTenants",
  filename: "src/lib/api/tenants.functions.ts"
}, (opts) => listMyTenants.__executeServer(opts));
const listMyTenants = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyTenants_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.rpc("list_my_tenants");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    joinCode: r.join_code,
    role: r.role
  }));
});
const getLastTenantId_createServerFn_handler = createServerRpc({
  id: "21f201a421dee5c0dd82c04c09e288ce5f91cf58a8a65171085c89a56f543283",
  name: "getLastTenantId",
  filename: "src/lib/api/tenants.functions.ts"
}, (opts) => getLastTenantId.__executeServer(opts));
const getLastTenantId = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getLastTenantId_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.from("profiles").select("last_tenant_id").eq("id", context.userId).maybeSingle();
  if (error) throw new Error(error.message);
  const lastId = data?.last_tenant_id ?? null;
  if (!lastId) return {
    id: null
  };
  const {
    data: member,
    error: mErr
  } = await context.supabase.from("tenant_members").select("tenant_id").eq("tenant_id", lastId).eq("user_id", context.userId).maybeSingle();
  if (mErr) throw new Error(mErr.message);
  return {
    id: member ? lastId : null
  };
});
const setLastTenantId_createServerFn_handler = createServerRpc({
  id: "5d5a620c71e5e605f484868666bb89534e36a498fdf080f17f5aa166fb7b6622",
  name: "setLastTenantId",
  filename: "src/lib/api/tenants.functions.ts"
}, (opts) => setLastTenantId.__executeServer(opts));
const setLastTenantId = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid()
}).parse(d)).handler(setLastTenantId_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("profiles").update({
    last_tenant_id: data.tenantId
  }).eq("id", context.userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const createTenant_createServerFn_handler = createServerRpc({
  id: "9736b5945c8dd222c092d8dba5a543adcbfb5412adb0c289dbfbcaab1ca94a1b",
  name: "createTenant",
  filename: "src/lib/api/tenants.functions.ts"
}, (opts) => createTenant.__executeServer(opts));
const createTenant = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  name: stringType().min(1).max(80)
}).parse(d)).handler(createTenant_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.rpc("create_tenant", {
    p_name: data.name
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) throw new Error("Failed to create tenant");
  return {
    id: row.id,
    joinCode: row.join_code
  };
});
const joinTenant_createServerFn_handler = createServerRpc({
  id: "bd13f4d0f5c2c280f5100f9203aa532168681facd86048b1e5a6f48dcfc7c4d4",
  name: "joinTenant",
  filename: "src/lib/api/tenants.functions.ts"
}, (opts) => joinTenant.__executeServer(opts));
const joinTenant = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  code: stringType().min(4).max(16)
}).parse(d)).handler(joinTenant_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.rpc("join_tenant_by_code", {
    p_code: data.code
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) return {
    ok: false,
    error: "No tenant found for that code"
  };
  return {
    ok: true,
    id: row.id,
    name: row.name
  };
});
const listTenantMembers_createServerFn_handler = createServerRpc({
  id: "82721b517f8269de8905fe49285b5197751937a288267c7425ee5f5e9bb7095d",
  name: "listTenantMembers",
  filename: "src/lib/api/tenants.functions.ts"
}, (opts) => listTenantMembers.__executeServer(opts));
const listTenantMembers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid()
}).parse(d)).handler(listTenantMembers_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.rpc("get_tenant_members", {
    p_tenant_id: data.tenantId
  });
  if (error) throw new Error(error.message);
  return (rows ?? []).map((r) => ({
    id: r.id,
    displayName: r.display_name,
    email: r.email ?? "",
    role: r.role
  }));
});
const updateMemberRole_createServerFn_handler = createServerRpc({
  id: "cb37c3b557957e5ea9d02ecfd4e5969521f3e39ad9f29bfdfae4a7755fe51456",
  name: "updateMemberRole",
  filename: "src/lib/api/tenants.functions.ts"
}, (opts) => updateMemberRole.__executeServer(opts));
const updateMemberRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid(),
  role: enumType(["admin", "member"])
}).parse(d)).handler(updateMemberRole_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: target,
    error: targetErr
  } = await context.supabase.from("tenant_members").select("role").eq("tenant_id", data.tenantId).eq("user_id", data.userId).maybeSingle();
  if (targetErr) throw new Error(targetErr.message);
  if (!target) throw new Error("User is not a member of this workspace");
  if (target.role === "admin" && data.userId !== context.userId) {
    throw new Error("You cannot change another admin's role");
  }
  if (data.role === "member" && data.userId === context.userId) {
    const {
      count,
      error: cntErr
    } = await context.supabase.from("tenant_members").select("user_id", {
      count: "exact",
      head: true
    }).eq("tenant_id", data.tenantId).eq("role", "admin");
    if (cntErr) throw new Error(cntErr.message);
    if ((count ?? 0) <= 1) throw new Error("Cannot remove the last admin");
  }
  const {
    error
  } = await context.supabase.rpc("update_member_role", {
    p_tenant_id: data.tenantId,
    p_user_id: data.userId,
    p_role: data.role
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const removeMember_createServerFn_handler = createServerRpc({
  id: "ae40b4f024255dfd6eb1ebe8571386e68fec401654f6842afe2ad4e20bd86d06",
  name: "removeMember",
  filename: "src/lib/api/tenants.functions.ts"
}, (opts) => removeMember.__executeServer(opts));
const removeMember = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid()
}).parse(d)).handler(removeMember_createServerFn_handler, async ({
  context,
  data
}) => {
  if (data.userId === context.userId) throw new Error("You cannot remove yourself");
  const {
    error
  } = await context.supabase.from("tenant_members").delete().eq("tenant_id", data.tenantId).eq("user_id", data.userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const updateMemberName_createServerFn_handler = createServerRpc({
  id: "24b7402e617fa5129341f3fad87e5d5b93fdece13dd4da99836090575abfec9d",
  name: "updateMemberName",
  filename: "src/lib/api/tenants.functions.ts"
}, (opts) => updateMemberName.__executeServer(opts));
const updateMemberName = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid(),
  displayName: stringType().trim().min(1).max(80)
}).parse(d)).handler(updateMemberName_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: meRow,
    error: meErr
  } = await context.supabase.from("tenant_members").select("role").eq("tenant_id", data.tenantId).eq("user_id", context.userId).maybeSingle();
  if (meErr) throw new Error(meErr.message);
  if (!meRow || meRow.role !== "admin") {
    throw new Error("Only admins can edit names.");
  }
  const {
    getSupabaseAdmin
  } = await import("./admin.server-DKcGORAI.mjs");
  const admin = getSupabaseAdmin();
  const {
    error
  } = await admin.from("profiles").update({
    display_name: data.displayName
  }).eq("id", data.userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const updateMemberEmail_createServerFn_handler = createServerRpc({
  id: "13fd0fd518fc71cb4436a64636c2b9d76930d1c6ace55bcce8739d5f71de9f26",
  name: "updateMemberEmail",
  filename: "src/lib/api/tenants.functions.ts"
}, (opts) => updateMemberEmail.__executeServer(opts));
const updateMemberEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid(),
  email: stringType().trim().toLowerCase().email().max(255)
}).parse(d)).handler(updateMemberEmail_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: meRow,
    error: meErr
  } = await context.supabase.from("tenant_members").select("role").eq("tenant_id", data.tenantId).eq("user_id", context.userId).maybeSingle();
  if (meErr) throw new Error(meErr.message);
  if (!meRow || meRow.role !== "admin") {
    throw new Error("Only admins can edit emails.");
  }
  const {
    data: target,
    error: tErr
  } = await context.supabase.from("tenant_members").select("user_id").eq("tenant_id", data.tenantId).eq("user_id", data.userId).maybeSingle();
  if (tErr) throw new Error(tErr.message);
  if (!target) throw new Error("User is not a member of this workspace");
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
const addMemberByEmail_createServerFn_handler = createServerRpc({
  id: "9eb6b40588f9856bf0d60403bfe76d60e91634812c1964c23e51a21e57f6e365",
  name: "addMemberByEmail",
  filename: "src/lib/api/tenants.functions.ts"
}, (opts) => addMemberByEmail.__executeServer(opts));
const addMemberByEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  email: stringType().email().max(255),
  role: enumType(["admin", "member"]).default("member"),
  redirectTo: stringType().url().max(500).optional()
}).parse(d)).handler(addMemberByEmail_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: meRow,
    error: meErr
  } = await context.supabase.from("tenant_members").select("role").eq("tenant_id", data.tenantId).eq("user_id", context.userId).maybeSingle();
  if (meErr) throw new Error(meErr.message);
  if (!meRow || meRow.role !== "admin") {
    throw new Error("Only admins can add users.");
  }
  const {
    getSupabaseAdmin
  } = await import("./admin.server-DKcGORAI.mjs");
  const admin = getSupabaseAdmin();
  const email = data.email.trim().toLowerCase();
  {
    const {
      data: isSuper
    } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "superuser"
    });
    if (!isSuper) {
      const {
        count,
        error: countErr
      } = await admin.from("tenant_members").select("user_id", {
        count: "exact",
        head: true
      }).eq("tenant_id", data.tenantId);
      if (countErr) throw new Error(countErr.message);
      if ((count ?? 0) >= FREE_MEMBER_LIMIT) {
        const {
          data: existing
        } = await admin.from("profiles").select("id").ilike("email", email).limit(1).maybeSingle();
        let alreadyMember = false;
        if (existing?.id) {
          const {
            data: tm
          } = await admin.from("tenant_members").select("user_id").eq("tenant_id", data.tenantId).eq("user_id", existing.id).maybeSingle();
          alreadyMember = !!tm;
        }
        if (!alreadyMember) {
          return {
            ok: false,
            error: "FREE_LIMIT_REACHED"
          };
        }
      }
    }
  }
  let userId = null;
  let lookupErr = null;
  try {
    const {
      data: profile,
      error: profileErr
    } = await admin.from("profiles").select("id").ilike("email", email).limit(1).maybeSingle();
    if (profileErr) lookupErr = profileErr.message;
    if (profile?.id) userId = profile.id;
  } catch (e) {
    lookupErr = e instanceof Error ? e.message : String(e);
  }
  let resolvedEmail = null;
  for (let page = 1; !userId && page <= 50; page += 1) {
    try {
      const {
        data: list,
        error: listErr
      } = await admin.auth.admin.listUsers({
        page,
        perPage: 1e3
      });
      if (listErr) {
        lookupErr = listErr.message;
        break;
      }
      const users = list?.users ?? [];
      const found = users.find((u) => (u.email ?? "").toLowerCase() === email);
      if (found) {
        userId = found.id;
        resolvedEmail = found.email ?? email;
        break;
      }
      if (users.length < 1e3) break;
    } catch (e) {
      lookupErr = e instanceof Error ? e.message : String(e);
      break;
    }
  }
  const wasExisting = !!userId;
  if (!userId) {
    try {
      const {
        data: invited,
        error: inviteErr
      } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: data.redirectTo
      });
      if (inviteErr) throw new Error(inviteErr.message);
      if (invited?.user) {
        userId = invited.user.id;
        resolvedEmail = invited.user.email ?? email;
      }
    } catch (e) {
      const inviteMsg = e instanceof Error ? e.message : String(e);
      const password = `${crypto.randomUUID()}-${crypto.randomUUID()}aA1!`;
      const {
        data: created,
        error: createErr
      } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: email.split("@")[0] || email
        }
      });
      if (createErr) {
        return {
          ok: false,
          error: lookupErr ? `${createErr.message} (${lookupErr}; ${inviteMsg})` : `${createErr.message} (${inviteMsg})`
        };
      }
      if (created?.user) {
        userId = created.user.id;
        resolvedEmail = created.user.email ?? email;
        if (data.redirectTo) {
          await context.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: data.redirectTo
          });
        }
      }
    }
  }
  if (!userId) {
    return {
      ok: false,
      error: "Failed to resolve user"
    };
  }
  await admin.from("profiles").upsert({
    id: userId,
    display_name: (resolvedEmail ?? email).split("@")[0] || resolvedEmail || email,
    email: resolvedEmail ?? email
  }, {
    onConflict: "id",
    ignoreDuplicates: true
  });
  const {
    error: insErr
  } = await admin.from("tenant_members").insert({
    tenant_id: data.tenantId,
    user_id: userId,
    role: data.role
  });
  if (insErr && !/duplicate|unique/i.test(insErr.message)) {
    throw new Error(insErr.message);
  }
  if (wasExisting && data.redirectTo) {
    await context.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: data.redirectTo
    });
  }
  return {
    ok: true,
    userId,
    alreadyMember: !!insErr
  };
});
const setMemberPassword_createServerFn_handler = createServerRpc({
  id: "bb364d580fa1e1599d14f3eb69d8bb118f2052322edc76e5e338820e48df44db",
  name: "setMemberPassword",
  filename: "src/lib/api/tenants.functions.ts"
}, (opts) => setMemberPassword.__executeServer(opts));
const setMemberPassword = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid(),
  password: stringType().min(8).max(72)
}).parse(d)).handler(setMemberPassword_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: meRow,
    error: meErr
  } = await context.supabase.from("tenant_members").select("role").eq("tenant_id", data.tenantId).eq("user_id", context.userId).maybeSingle();
  if (meErr) throw new Error(meErr.message);
  if (!meRow || meRow.role !== "admin") {
    throw new Error("Only admins can change passwords.");
  }
  const {
    data: targetRow,
    error: targetErr
  } = await context.supabase.from("tenant_members").select("user_id").eq("tenant_id", data.tenantId).eq("user_id", data.userId).maybeSingle();
  if (targetErr) throw new Error(targetErr.message);
  if (!targetRow) throw new Error("User is not a member of this workspace.");
  const {
    getSupabaseAdmin
  } = await import("./admin.server-DKcGORAI.mjs");
  const admin = getSupabaseAdmin();
  const {
    error
  } = await admin.auth.admin.updateUserById(data.userId, {
    password: data.password
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  addMemberByEmail_createServerFn_handler,
  createTenant_createServerFn_handler,
  getLastTenantId_createServerFn_handler,
  joinTenant_createServerFn_handler,
  listMyTenants_createServerFn_handler,
  listTenantMembers_createServerFn_handler,
  removeMember_createServerFn_handler,
  setLastTenantId_createServerFn_handler,
  setMemberPassword_createServerFn_handler,
  updateMemberEmail_createServerFn_handler,
  updateMemberName_createServerFn_handler,
  updateMemberRole_createServerFn_handler
};
