/**
 * Dependency-free check for required Supabase env vars on the server.
 * Returns the list of missing variable names (empty if all present).
 */
const REQUIRED = [
  "EXT_SUPABASE_URL",
  "EXT_SUPABASE_PUBLISHABLE_KEY",
  "EXT_SUPABASE_SERVICE_ROLE_KEY",
] as const;

export function getMissingSupabaseEnv(): string[] {
  const env = (typeof process !== "undefined" ? process.env : {}) as Record<
    string,
    string | undefined
  >;
  return REQUIRED.filter((name) => !env[name]);
}
