import { createServerFn } from "@tanstack/react-start";
import { useSession, getRequestHost } from "@tanstack/react-start/server";
import { z } from "zod";

import { query, queryOne, DatabaseUnavailableError } from "../db.server";
import { getSessionConfig, hashPassword, verifyPassword, type SessionData } from "../auth.server";

type UserRow = { id: string; email: string; display_name: string };

const signupInput = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
  displayName: z.string().min(1).max(80),
});

export const signup = createServerFn({ method: "POST" })
  .inputValidator(signupInput)
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase().trim();
    const existing = await queryOne<UserRow>(
      "select id from app_users where email = $1",
      [email],
    );
    if (existing) {
      return { ok: false as const, error: "An account with this email already exists" };
    }
    const passwordHash = await hashPassword(data.password);
    const user = await queryOne<UserRow>(
      `insert into app_users (email, password_hash, display_name)
       values ($1, $2, $3)
       returning id, email, display_name`,
      [email, passwordHash, data.displayName.trim()],
    );
    if (!user) return { ok: false as const, error: "Failed to create account" };
    const session = await useSession<SessionData>(getSessionConfig());
    await session.update({ userId: user.id });
    return {
      ok: true as const,
      user: { id: user.id, email: user.email, displayName: user.display_name },
    };
  });

const loginInput = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});

export const login = createServerFn({ method: "POST" })
  .inputValidator(loginInput)
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase().trim();
    const row = await queryOne<{ id: string; password_hash: string; display_name: string; email: string }>(
      "select id, password_hash, display_name, email from app_users where email = $1",
      [email],
    );
    if (!row) return { ok: false as const, error: "Invalid email or password" };
    const ok = await verifyPassword(data.password, row.password_hash);
    if (!ok) return { ok: false as const, error: "Invalid email or password" };
    const session = await useSession<SessionData>(getSessionConfig());
    await session.update({ userId: row.id });
    return {
      ok: true as const,
      user: { id: row.id, email: row.email, displayName: row.display_name },
    };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<SessionData>(getSessionConfig());
  await session.clear();
  return { ok: true };
});

export const getMe = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<SessionData>(getSessionConfig());
  const userId = session.data.userId;
  if (!userId) return null;
  const row = await queryOne<UserRow>(
    "select id, email, display_name from app_users where id = $1",
    [userId],
  );
  if (!row) return null;
  return { id: row.id, email: row.email, displayName: row.display_name };
});

// ---------- Password reset ----------

async function ensureResetTable() {
  await query(
    `create table if not exists password_resets (
      token text primary key,
      user_id uuid not null references app_users(id) on delete cascade,
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    )`,
  );
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const requestResetInput = z.object({ email: z.string().email().max(254) });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator(requestResetInput)
  .handler(async ({ data }) => {
    await ensureResetTable();
    const email = data.email.toLowerCase().trim();
    const user = await queryOne<{ id: string }>(
      "select id from app_users where email = $1",
      [email],
    );
    if (!user) return { ok: true as const, url: null };
    const token = randomToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await query(
      "insert into password_resets (token, user_id, expires_at) values ($1, $2, $3)",
      [token, user.id, expires.toISOString()],
    );
    let origin = "";
    try {
      origin = `https://${getRequestHost()}`;
    } catch {
      origin = "";
    }
    const url = `${origin}/reset-password?token=${token}`;
    return { ok: true as const, url };
  });

const resetInput = z.object({
  token: z.string().min(10).max(200),
  password: z.string().min(8).max(200),
});

export const resetPassword = createServerFn({ method: "POST" })
  .inputValidator(resetInput)
  .handler(async ({ data }) => {
    await ensureResetTable();
    const row = await queryOne<{ user_id: string; expires_at: string }>(
      "select user_id, expires_at from password_resets where token = $1",
      [data.token],
    );
    if (!row) return { ok: false as const, error: "Invalid or expired reset link" };
    if (new Date(row.expires_at).getTime() < Date.now()) {
      await query("delete from password_resets where token = $1", [data.token]);
      return { ok: false as const, error: "Invalid or expired reset link" };
    }
    const passwordHash = await hashPassword(data.password);
    await query("update app_users set password_hash = $1 where id = $2", [
      passwordHash,
      row.user_id,
    ]);
    await query("delete from password_resets where token = $1", [data.token]);
    return { ok: true as const };
  });
