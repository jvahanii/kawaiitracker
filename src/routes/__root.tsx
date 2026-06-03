import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import "@/lib/i18n";
import { initSupabase } from "@/lib/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Supabase public config is inlined at build time (see vite.config.ts) so
  // the browser client can be initialised without a server-fn roundtrip. This
  // is required for the static preview build which has no server runtime.
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      initSupabase();
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Säästösika is a multi-tenant item tracking application for managing shared inventories." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Säästösika is a multi-tenant item tracking application for managing shared inventories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "twitter:description", content: "Säästösika is a multi-tenant item tracking application for managing shared inventories." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0d8a6c92-8cf6-4721-873d-6fc5ed8f8ad8/id-preview-94859058--81d75f47-0994-4548-a216-bf2d97a3d0e8.lovable.app-1780035257012.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0d8a6c92-8cf6-4721-873d-6fc5ed8f8ad8/id-preview-94859058--81d75f47-0994-4548-a216-bf2d97a3d0e8.lovable.app-1780035257012.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Initialise the Supabase browser client synchronously from embedded config
  // (safe to call repeatedly).
  initSupabase();

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthSync />
      <Outlet />
    </QueryClientProvider>
  );
}

function SupabaseAuthSync() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Language detection runs from the landing route's effect to avoid
  // hydration mismatches on SSR'd public routes.


  useEffect(() => {
    // Lazy import to avoid SSR window access
    import("@/lib/supabase/client").then(({ tryGetSupabase }) => {
      const supabase = tryGetSupabase();
      if (!supabase) return;
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") {
          // Drop cached data without refetching — there's no token, so
          // refetches would all 401. The _authenticated gate handles redirect.
          queryClient.cancelQueries();
          queryClient.clear();
        } else {
          queryClient.invalidateQueries();
        }
        router.invalidate();
      });
      (SupabaseAuthSync as unknown as { _unsub?: () => void })._unsub = () =>
        data.subscription.unsubscribe();
    });
    return () => {
      const ref = SupabaseAuthSync as unknown as { _unsub?: () => void };
      ref._unsub?.();
    };
  }, [router, queryClient]);

  return null;
}
