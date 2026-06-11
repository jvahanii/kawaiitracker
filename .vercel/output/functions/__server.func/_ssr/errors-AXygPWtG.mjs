const UNSAFE_PATTERNS = [
  /\bpg[_\s]/i,
  /\bERROR:/,
  /\brelation\b/i,
  /\bcolumn\b/i,
  /\bconstraint\b/i,
  /\bsyntax\b/i,
  /\bviolates\b/i,
  /\bduplicate key\b/i,
  /\bpermission denied\b/i,
  /\brow[- ]level\b/i,
  /\bpolicy\b/i,
  /\bschema\b/i,
  /\btenant_members\b/i,
  /\bprofiles\b/i,
  /\bauth\.users\b/i,
  /\buuid\b/i,
  /\bnull value\b/i,
  /\bJWT\b/,
  /\bSQL\b/,
  /\n\s+at\s/
  // stack traces
];
function safeErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (!err) return fallback;
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const msg = raw.trim();
  if (!msg || msg.length > 200) return fallback;
  if (UNSAFE_PATTERNS.some((re) => re.test(msg))) return fallback;
  return msg;
}
export {
  safeErrorMessage as s
};
