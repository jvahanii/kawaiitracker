import { c as createSsrRpc } from "./createSsrRpc-CPX7Wu6L.mjs";
import { c as createServerFn } from "./server-dMKqlv5F.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-BH87DBXq.mjs";
import { o as objectType, s as stringType, a as arrayType, n as numberType, e as enumType } from "../_libs/zod.mjs";
const listItems = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("45233f116d49806098c1a49b803c065945c6dbdca81c16da69c01ddb596bf421"));
const createItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  title: stringType().min(1).max(200),
  folderId: stringType().uuid().nullable().optional()
}).parse(d)).handler(createSsrRpc("68a0fbc7cd6036c7e9a35bcd14da7f0806a9f12fdcf4b1f0124e088e1262053c"));
const updateInput = objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid(),
  title: stringType().min(1).max(200).optional(),
  status: enumType(["todo", "in_progress", "done"]).optional(),
  assigneeIds: arrayType(stringType().uuid()).max(50).optional(),
  notes: stringType().max(2e4).optional(),
  amount: numberType().min(-1e9).max(1e9).nullable().optional(),
  folderId: stringType().uuid().nullable().optional()
});
const updateItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => updateInput.parse(d)).handler(createSsrRpc("d61c819a56f07f98da1bdf6a012b63f2ba3dfd88bcef0aafa57f6d40990bb447"));
const deleteItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("6b7f7738e0120134f88e67a23dd529b17f81c92d94e6b6a69a985769999f1f2c"));
const reorderItems = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  orderedIds: arrayType(stringType().uuid()).max(500)
}).parse(d)).handler(createSsrRpc("1196b94331e65ad27539c528701e15159bada85e5e19b11342dd4dd2f1d8d508"));
const monthSchema = stringType().regex(/^\d{4}-\d{2}(-\d{2})?$/).transform((v) => `${v.slice(0, 7)}-01`);
const listEntriesForItem = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  itemId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d3ad3fd59dfcaf506859645b3b54787310ba7eeace7a17356763619254b0976a"));
const listAllEntries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d003bf6838687d2f074d2ed6cc2f13926efeca2a18070c0ffe2b2be0007cdaa4"));
const upsertEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  itemId: stringType().uuid(),
  month: monthSchema,
  amount: numberType().min(-1e9).max(1e9).optional(),
  actual: numberType().min(-1e9).max(1e9).optional()
}).parse(d)).handler(createSsrRpc("fb1317980c588af0bd3a8d986fa860ac709045c138fbe29280bd8a6f29b3e9c3"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d3d7fc87956bc5bb4be58bb6e6c521bff4202f3924d34f12cc3b6ebe1f7585a7"));
const pad = (n) => n.toString().padStart(2, "0");
function formatDate(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return "";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function formatDateTime(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return "";
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export {
  listAllEntries as a,
  listEntriesForItem as b,
  createItem as c,
  deleteItem as d,
  upsertEntry as e,
  formatDateTime as f,
  listItems as l,
  reorderItems as r,
  updateItem as u
};
