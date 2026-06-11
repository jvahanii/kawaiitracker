export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

export function renderMissingEnvPage(missing: string[]): string {
  const items = missing.map((n) => `<li><code>${escapeHtml(n)}</code></li>`).join("");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Backend not configured</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 36rem; width: 100%; padding: 2rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1rem; }
      ol { color: #4b5563; padding-left: 1.25rem; margin: 0 0 1rem; }
      ul { background: #f3f4f6; border-radius: 0.375rem; padding: 0.75rem 1rem 0.75rem 2rem; margin: 0 0 1rem; }
      li { margin: 0.125rem 0; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
      .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }
      button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; background: #111; color: #fff; border: 1px solid transparent; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Backend not configured</h1>
      <p>This deployment is missing required Supabase environment variables, so the app cannot start.</p>
      <p><strong>Missing variables:</strong></p>
      <ul>${items}</ul>
      <p><strong>How to fix on Vercel:</strong></p>
      <ol>
        <li>Open your project in Vercel &rarr; <em>Settings</em> &rarr; <em>Environment Variables</em>.</li>
        <li>Add each variable above for the <em>Production</em> and <em>Preview</em> environments. Use the same Supabase project URL for both <code>EXT_SUPABASE_URL</code> and <code>VITE_SUPABASE_URL</code>.</li>
        <li>Redeploy &mdash; <code>VITE_*</code> values are baked in at build time, so a rebuild is required.</li>
      </ol>
      <div class="actions">
        <button onclick="location.reload()">Retry</button>
      </div>
    </div>
  </body>
</html>`;
}
