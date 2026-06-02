import { Client } from "pg";

// Use a fresh Client per call. In the production Worker runtime TLS is managed
// by the socket layer, while the Node-based preview needs the Aiven self-signed
// chain bypass that Workers do not support.

export function isConnectionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /Connection terminated/i.test(msg) ||
    /timeout/i.test(msg) ||
    /ECONNRESET/i.test(msg) ||
    /ENOTFOUND/i.test(msg) ||
    /server closed the connection/i.test(msg) ||
    /Client has encountered a connection error/i.test(msg) ||
    /Client was closed/i.test(msg) ||
    /socket hang up/i.test(msg) ||
    /TLS/i.test(msg) ||
    /self-signed certificate/i.test(msg) ||
    /SELF_SIGNED_CERT_IN_CHAIN/i.test(msg)
  );
}

export class DatabaseUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Database temporarily unavailable");
    this.name = "DatabaseUnavailableError";
    if (cause) (this as { cause?: unknown }).cause = cause;
  }
}

const MAX_ATTEMPTS = 3;
const CONNECT_TIMEOUT_MS = 15_000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function describeError(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code;
    const errno = (err as { errno?: string | number }).errno;
    const severity = (err as { severity?: string }).severity;
    const parts = [err.name];
    if (code) parts.push(`code=${code}`);
    if (errno !== undefined) parts.push(`errno=${errno}`);
    if (severity) parts.push(`severity=${severity}`);
    return `${parts.join(" ")}: ${err.message}`;
  }
  return String(err);
}

type SslConfig = boolean | { ca?: string; rejectUnauthorized?: boolean };

function normalizeCaPem(raw: string): string {
  // Secrets UIs often collapse newlines or escape them as \n. Restore proper PEM.
  let s = raw.trim();
  if (s.includes("\\n")) s = s.replace(/\\n/g, "\n");
  if (!s.includes("\n") && s.includes("-----BEGIN")) {
    s = s
      .replace(/-----BEGIN CERTIFICATE-----/g, "\n-----BEGIN CERTIFICATE-----\n")
      .replace(/-----END CERTIFICATE-----/g, "\n-----END CERTIFICATE-----\n")
      .replace(/\s+/g, (m) => (m.includes("\n") ? "\n" : " "))
      .trim();
  }
  return s;
}

function getSslConfig(): SslConfig {
  const ca = process.env.AIVEN_CA_CERT;
  if (ca && ca.trim().length > 0) {
    return { ca: normalizeCaPem(ca), rejectUnauthorized: true };
  }
  // Fallback for dev/preview only — production should always have AIVEN_CA_CERT.
  return { rejectUnauthorized: false } as SslConfig;
}

function makeClient(): Client {
  const raw = process.env.AIVEN_DATABASE_URL;
  if (!raw) throw new Error("AIVEN_DATABASE_URL is not configured");
  const u = new URL(raw);
  return new Client({
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    ssl: getSslConfig() as never,
    connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
  });
}

function isUnsupportedRuntime(): boolean {
  // Cloudflare Workers identifies itself via navigator.userAgent. The Aiven
  // Postgres self-signed CA cannot be trusted by the Worker TLS layer, so
  // direct `pg` connections always fail in production.
  try {
    const ua = (globalThis as { navigator?: { userAgent?: string } }).navigator?.userAgent;
    return ua === "Cloudflare-Workers";
  } catch {
    return false;
  }
}

export async function query<T = unknown>(text: string, params: unknown[] = []) {
  if (isUnsupportedRuntime()) {
    console.error("[db] direct Postgres connections are not supported in this runtime");
    throw new DatabaseUnavailableError(
      new Error("Database is not reachable from the production runtime"),
    );
  }
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const client = makeClient();
    // Swallow async client errors so they don't crash the worker.
    client.on("error", (err) => {
      console.error("[db] client error:", describeError(err));
    });
    try {
      await client.connect();
      const res = await client.query<T extends Record<string, unknown> ? T : never>(
        text,
        params as unknown[],
      );
      return res.rows as T[];
    } catch (err) {
      lastErr = err;
      const desc = describeError(err);
      if (isConnectionError(err) && attempt < MAX_ATTEMPTS - 1) {
        console.warn(`[db] retrying after connection error (attempt ${attempt + 1}): ${desc}`);
        await sleep(150 * (attempt + 1));
        continue;
      }
      if (isConnectionError(err)) {
        console.error(`[db] connection error after retries: ${desc}`);
        throw new DatabaseUnavailableError(err);
      }
      console.error(`[db] query error: ${desc}`);
      throw err;
    } finally {
      try {
        await client.end();
      } catch {
        // ignore
      }
    }
  }
  console.error(`[db] exhausted retries: ${describeError(lastErr)}`);
  throw new DatabaseUnavailableError(lastErr);
}

export async function queryOne<T = unknown>(text: string, params: unknown[] = []) {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
