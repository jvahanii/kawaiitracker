import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  exportWorkspace,
  importWorkspace,
  type WorkspaceBackup,
} from "@/lib/api/backup.functions";

export function WorkspaceBackupControls({
  tenantId,
  workspaceName,
}: {
  tenantId: string;
  workspaceName: string;
}) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const exportFn = useServerFn(exportWorkspace);
  const importFn = useServerFn(importWorkspace);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pending, setPending] = useState<WorkspaceBackup | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);

  const exportM = useMutation({
    mutationFn: () => exportFn({ data: { tenantId } }),
    onSuccess: (payload) => {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const slug = (workspaceName || "workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      a.href = url;
      a.download = `tracker-${slug}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("backup.exportDone"));
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : String(e)),
  });

  const importM = useMutation({
    mutationFn: (mode: "replace" | "append") =>
      importFn({ data: { tenantId, mode, payload: pending! } }),
    onSuccess: (r) => {
      setPending(null);
      setConfirmReplace(false);
      qc.invalidateQueries({ queryKey: ["items", tenantId] });
      qc.invalidateQueries({ queryKey: ["folders", tenantId] });
      qc.invalidateQueries({ queryKey: ["entries", tenantId] });
      qc.invalidateQueries({ queryKey: ["goal", tenantId] });
      qc.invalidateQueries({ queryKey: ["tasks", tenantId] });
      toast.success(
        t("backup.importDone", {
          folders: r.folders,
          items: r.items,
          tasks: r.tasks,
        }),
      );
    },
    onError: (e: unknown) => {
      setConfirmReplace(false);
      toast.error(e instanceof Error ? e.message : String(e));
    },
  });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as WorkspaceBackup;
      if (parsed?.format !== "kawaii-tracker-workspace" || parsed?.version !== 1) {
        toast.error(t("backup.invalidFile"));
        return;
      }
      setPending(parsed);
    } catch {
      toast.error(t("backup.invalidFile"));
    }
  };

  const counts = pending
    ? {
        folders: pending.folders?.length ?? 0,
        items: pending.items?.length ?? 0,
        tasks: (pending.items ?? []).reduce((n, i) => n + (i.tasks?.length ?? 0), 0),
      }
    : { folders: 0, items: 0, tasks: 0 };

  return (
    <>
      <button
        type="button"
        onClick={() => exportM.mutate()}
        disabled={exportM.isPending}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
      >
        <Download className="h-3.5 w-3.5" />
        {t("backup.export")}
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-accent"
      >
        <Upload className="h-3.5 w-3.5" />
        {t("backup.import")}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <Dialog open={!!pending && !confirmReplace} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("backup.importTitle")}</DialogTitle>
            <DialogDescription>
              {t("backup.importSummary", counts)}
              {pending?.workspaceName ? ` — ${pending.workspaceName}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{t("backup.importHelp")}</p>
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setPending(null)}
              className="rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="button"
              disabled={importM.isPending}
              onClick={() => importM.mutate("append")}
              className="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground disabled:opacity-50"
            >
              {t("backup.modeAppend")}
            </button>
            <button
              type="button"
              disabled={importM.isPending}
              onClick={() => setConfirmReplace(true)}
              className="rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-50"
            >
              {t("backup.modeReplace")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmReplace} onOpenChange={setConfirmReplace}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("backup.replaceTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("backup.replaceBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                importM.mutate("replace");
              }}
            >
              {t("backup.replaceConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
