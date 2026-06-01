import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { listItems } from "@/lib/api/items.functions";
import { listAllEntries, upsertEntry } from "@/lib/api/entries.functions";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function currentMonthIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function monthInputToIso(m: string): string {
  return `${m.slice(0, 7)}-01`;
}

export function SavingsTable({ tenantId }: { tenantId: string }) {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();

  const itemsFn = useServerFn(listItems);
  const entriesFn = useServerFn(listAllEntries);
  const upsertFn = useServerFn(upsertEntry);

  const itemsQ = useQuery({
    queryKey: ["items", tenantId],
    queryFn: () => itemsFn({ data: { tenantId } }),
  });
  const entriesQ = useQuery({
    queryKey: ["entries", tenantId],
    queryFn: () => entriesFn({ data: { tenantId } }),
  });

  const upsertM = useMutation({
    mutationFn: (v: { itemId: string; month: string; amount: number }) =>
      upsertFn({ data: { tenantId, ...v } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entries", tenantId] });
      qc.invalidateQueries({ queryKey: ["entries-item", tenantId] });
    },
  });

  const [extraMonths, setExtraMonths] = useState<string[]>([currentMonthIso()]);

  const items = itemsQ.data ?? [];
  const entries = entriesQ.data ?? [];

  const monthFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { year: "numeric", month: "long" }),
    [i18n.language],
  );
  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);

  // Build lookup: month -> itemId -> amount
  const byMonth = useMemo(() => {
    const m = new Map<string, Map<string, number>>();
    for (const e of entries) {
      if (!m.has(e.month)) m.set(e.month, new Map());
      m.get(e.month)!.set(e.itemId, e.amount);
    }
    return m;
  }, [entries]);

  const months = useMemo(() => {
    const set = new Set<string>([...byMonth.keys(), ...extraMonths]);
    return Array.from(set).sort();
  }, [byMonth, extraMonths]);

  const totals = useMemo(() => {
    const perItem = new Map<string, number>();
    let grand = 0;
    for (const e of entries) {
      perItem.set(e.itemId, (perItem.get(e.itemId) ?? 0) + e.amount);
      grand += e.amount;
    }
    return { perItem, grand };
  }, [entries]);

  const [newMonth, setNewMonth] = useState(currentMonthIso().slice(0, 7));

  if (items.length === 0) return null;

  return (
    <section className="border-b border-border bg-card/40 px-4 py-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{t("workspace.savingsTableTitle")}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newMonth) return;
            const iso = monthInputToIso(newMonth);
            setExtraMonths((prev) => (prev.includes(iso) ? prev : [...prev, iso]));
          }}
          className="flex items-center gap-2"
        >
          <input
            type="month"
            value={newMonth}
            onChange={(e) => setNewMonth(e.target.value)}
            className="input h-8 py-0 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
          >
            {t("workspace.addMonth")}
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[8rem]">{t("workspace.monthAmount")}</TableHead>
              {items.map((it) => (
                <TableHead key={it.id} className="min-w-[8rem] text-right">
                  {it.title}
                </TableHead>
              ))}
              <TableHead className="min-w-[8rem] text-right">{t("workspace.chartTotal")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {months.length === 0 ? (
              <TableRow>
                <TableCell colSpan={items.length + 2} className="text-muted-foreground">
                  {t("workspace.noEntries")}
                </TableCell>
              </TableRow>
            ) : (
              months.map((month) => {
                const rowMap = byMonth.get(month);
                const rowTotal = items.reduce(
                  (s, it) => s + (rowMap?.get(it.id) ?? 0),
                  0,
                );
                return (
                  <TableRow key={month}>
                    <TableCell className="font-medium">
                      {monthFmt.format(new Date(month))}
                    </TableCell>
                    {items.map((it) => (
                      <TableCell key={it.id} className="text-right">
                        <MoneyCell
                          value={rowMap?.get(it.id) ?? null}
                          onCommit={(amount) =>
                            upsertM.mutate({ itemId: it.id, month, amount })
                          }
                        />
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {rowTotal ? fmt(rowTotal) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-semibold">{t("workspace.chartTotal")}</TableCell>
              {items.map((it) => (
                <TableCell key={it.id} className="text-right font-mono text-xs">
                  {fmt(totals.perItem.get(it.id) ?? 0)}
                </TableCell>
              ))}
              <TableCell className="text-right font-mono text-sm font-semibold">
                {fmt(totals.grand)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </section>
  );
}

function MoneyCell({
  value,
  onCommit,
}: {
  value: number | null;
  onCommit: (amount: number) => void;
}) {
  const [text, setText] = useState(value === null ? "" : String(value));
  const [focused, setFocused] = useState(false);

  // Sync external value updates when not actively editing
  if (!focused && (value === null ? "" : String(value)) !== text && document.activeElement?.tagName !== "INPUT") {
    // Note: setState during render is allowed for derived sync as React no-ops if equal
  }

  return (
    <input
      type="number"
      inputMode="decimal"
      step="0.01"
      value={text}
      onFocus={() => setFocused(true)}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        setFocused(false);
        const parsed = Number(text.replace(",", "."));
        const original = value ?? 0;
        if (text === "" && value === null) return;
        if (!Number.isFinite(parsed)) return;
        if (parsed === original) return;
        onCommit(parsed);
      }}
      placeholder="0"
      className="input h-8 w-full py-0 text-right font-mono text-sm"
    />
  );
}
