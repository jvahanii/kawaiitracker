import { MutationCache, QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: (_data, _vars, _ctx, mutation) => {
        const meta = mutation.meta as { silent?: boolean; toast?: string } | undefined;
        if (meta?.silent) return;
        const msg = meta?.toast ?? i18n.t("common.saved");
        toast.success(msg);
      },
      onError: (error, _vars, _ctx, mutation) => {
        const meta = mutation.meta as { silent?: boolean } | undefined;
        if (meta?.silent) return;
        toast.error(error instanceof Error ? error.message : String(error));
      },
    }),
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
