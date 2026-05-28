import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { login } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — Tracker" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const loginFn = useServerFn(login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const m = useMutation({
    mutationFn: (data: { email: string; password: string }) => loginFn({ data }),
    onSuccess: () => navigate({ to: "/" }),
  });

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your workspace.">
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          m.mutate({ email, password });
        }}
        className="space-y-4"
      >
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            autoComplete="email"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            autoComplete="current-password"
          />
        </Field>
        {m.error ? (
          <p className="text-sm text-destructive">{(m.error as Error).message}</p>
        ) : null}
        <button
          type="submit"
          disabled={m.isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {m.isPending ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/signup" className="text-foreground underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Tracker
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
