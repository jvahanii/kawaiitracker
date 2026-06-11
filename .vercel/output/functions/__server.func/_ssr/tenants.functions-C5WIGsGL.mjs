import { c as createSsrRpc } from "./createSsrRpc-D-xo_wI2.mjs";
import { c as createServerFn } from "./server-C1BuN9pZ.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-CgwmKKGY.mjs";
import { o as objectType, s as stringType, e as enumType } from "../_libs/zod.mjs";
const listMyTenants = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("4540f78c53fd08d6321dedda6c7223975a6a64fa6696d8831854ac890d13b95d"));
const getLastTenantId = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("21f201a421dee5c0dd82c04c09e288ce5f91cf58a8a65171085c89a56f543283"));
const setLastTenantId = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("5d5a620c71e5e605f484868666bb89534e36a498fdf080f17f5aa166fb7b6622"));
const createTenant = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  name: stringType().min(1).max(80)
}).parse(d)).handler(createSsrRpc("9736b5945c8dd222c092d8dba5a543adcbfb5412adb0c289dbfbcaab1ca94a1b"));
const joinTenant = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  code: stringType().min(4).max(16)
}).parse(d)).handler(createSsrRpc("bd13f4d0f5c2c280f5100f9203aa532168681facd86048b1e5a6f48dcfc7c4d4"));
const listTenantMembers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("82721b517f8269de8905fe49285b5197751937a288267c7425ee5f5e9bb7095d"));
const updateMemberRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid(),
  role: enumType(["admin", "member"])
}).parse(d)).handler(createSsrRpc("cb37c3b557957e5ea9d02ecfd4e5969521f3e39ad9f29bfdfae4a7755fe51456"));
const removeMember = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("ae40b4f024255dfd6eb1ebe8571386e68fec401654f6842afe2ad4e20bd86d06"));
const updateMemberName = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid(),
  displayName: stringType().trim().min(1).max(80)
}).parse(d)).handler(createSsrRpc("24b7402e617fa5129341f3fad87e5d5b93fdece13dd4da99836090575abfec9d"));
const updateMemberEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid(),
  email: stringType().trim().toLowerCase().email().max(255)
}).parse(d)).handler(createSsrRpc("13fd0fd518fc71cb4436a64636c2b9d76930d1c6ace55bcce8739d5f71de9f26"));
const addMemberByEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  email: stringType().email().max(255),
  role: enumType(["admin", "member"]).default("member"),
  redirectTo: stringType().url().max(500).optional()
}).parse(d)).handler(createSsrRpc("9eb6b40588f9856bf0d60403bfe76d60e91634812c1964c23e51a21e57f6e365"));
const setMemberPassword = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid(),
  password: stringType().min(8).max(72)
}).parse(d)).handler(createSsrRpc("bb364d580fa1e1599d14f3eb69d8bb118f2052322edc76e5e338820e48df44db"));
export {
  listTenantMembers as a,
  updateMemberName as b,
  createTenant as c,
  addMemberByEmail as d,
  updateMemberEmail as e,
  setLastTenantId as f,
  getLastTenantId as g,
  joinTenant as j,
  listMyTenants as l,
  removeMember as r,
  setMemberPassword as s,
  updateMemberRole as u
};
