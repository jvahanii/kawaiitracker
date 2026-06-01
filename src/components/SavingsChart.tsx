import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { listAllEntries } from "@/lib/api/entries.functions";
import { listItems } from "@/lib/api/items.functions";

type Goal = { amount: number | null; date: string | null };

function loadGoal(tenantId: string, year: number): Goal {
  if (typeof window === "undefined") return { amount: null, date: null };
  try {
    const raw = localStorage.getItem(`savings-goal:${tenantId}:${year}`);
    if (!raw) return { amount: null, date: null };
    const v = JSON.parse(raw) as Goal;
    return { amount: v.amount ?? null, date: v.date ?? null };
  } catch {
    return { amount: null, date: null };
  }
}

function monthKey(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

// Deterministic OKLCH color per item id
function colorFor(id: string, idx: number): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  const hue = (h + idx * 47) % 360;
  return `oklch(0.72 0.15 ${hue})`;
}
function darkColorFor(id: string, idx: number): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  const hue = (h + idx * 47) % 360;
  return `oklch(0.42 0.17 ${hue})`;
}

export function SavingsChart({ tenantId }: { tenantId: string }) {
  const { t, i18n } = useTranslation();
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [goal, setGoal] = useState<Goal>({ amount: null, date: null });

  useEffect(() => {
    setGoal(loadGoal(tenantId, year));
  }, [tenantId, year]);

  const saveGoal = (g: Goal) => {
    setGoal(g);
    try {
      localStorage.setItem(`savings-goal:${tenantId}:${year}`, JSON.stringify(g));
    } catch {
      /* ignore */
    }
  };

  const listFn = useServerFn(listAllEntries);
  const itemsFn = useServerFn(listItems);
  const entriesQ = useQuery({
    queryKey: ["entries", tenantId],
    queryFn: () => listFn({ data: { tenantId } }),
  });
  const itemsQ = useQuery({
    queryKey: ["items", tenantId],
    queryFn: () => itemsFn({ data: { tenantId } }),
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);
  const monthFmt = new Intl.DateTimeFormat(i18n.language, { month: "short" });

  const allEntries = entriesQ.data ?? [];
  const entries = useMemo(
    () => allEntries.filter((e) => new Date(e.month).getFullYear() === year),
    [allEntries, year],
  );
  const items = itemsQ.data ?? [];
  const total = useMemo(() => entries.reduce((s, e) => s + e.amount, 0), [entries]);
  const actualTotal = useMemo(() => entries.reduce((s, e) => s + (e.actual ?? 0), 0), [entries]);

  // Build cumulative-per-item series across all months present in entries
  const { chartData, itemKeys } = useMemo(() => {
    const months: number[] = [];
    for (let m = 0; m < 12; m++) months.push(monthKey(new Date(year, m, 1)));

    // per-item per-month sum (planned + actual) and per-month total actual
    const perItemMonth = new Map<string, Map<number, number>>();
    const perItemMonthActual = new Map<string, Map<number, number>>();
    const actualPerMonth = new Map<number, number>();
    for (const e of entries) {
      const k = monthKey(new Date(e.month));
      let m = perItemMonth.get(e.itemId);
      if (!m) {
        m = new Map();
        perItemMonth.set(e.itemId, m);
      }
      m.set(k, (m.get(k) ?? 0) + e.amount);
      let ma = perItemMonthActual.get(e.itemId);
      if (!ma) {
        ma = new Map();
        perItemMonthActual.set(e.itemId, ma);
      }
      ma.set(k, (ma.get(k) ?? 0) + (e.actual ?? 0));
      actualPerMonth.set(k, (actualPerMonth.get(k) ?? 0) + (e.actual ?? 0));
    }

    const ids = Array.from(perItemMonth.keys());
    const cum = new Map<string, number>(ids.map((id) => [id, 0]));
    const cumA = new Map<string, number>(ids.map((id) => [id, 0]));
    let cumActual = 0;
    const now = monthKey(new Date());
    const rows: Array<Record<string, number | undefined>> = months.map((tm) => {
      const row: Record<string, number | undefined> = { t: tm };
      for (const id of ids) {
        const add = perItemMonth.get(id)?.get(tm) ?? 0;
        cum.set(id, (cum.get(id) ?? 0) + add);
        row[id] = cum.get(id) ?? 0;
        if (tm <= now) {
          const addA = perItemMonthActual.get(id)?.get(tm) ?? 0;
          cumA.set(id, (cumA.get(id) ?? 0) + addA);
          row[`${id}__a`] = cumA.get(id) ?? 0;
        }
      }
      if (tm <= now) {
        cumActual += actualPerMonth.get(tm) ?? 0;
        row.__actual = cumActual;
      }
      return row;
    });

    // Target trajectory: linear from Jan (0) to Dec (goal.amount) of selected year
    const goalAmt = goal.amount;
    if (goalAmt && rows.length > 0) {
      const tStart = rows[0].t!;
      const tEnd = rows[rows.length - 1].t!;
      const span = tEnd - tStart;
      if (span > 0) {
        for (const r of rows) {
          r.target = ((r.t! - tStart) / span) * goalAmt;
        }
      }
    }


    return { chartData: rows, itemKeys: ids };
  }, [entries, goal.amount, goal.date, year]);


  const itemTitle = (id: string) => items.find((i) => i.id === id)?.title ?? "—";

  const today = Date.now();
  const daysLeft =
    goal.date && !Number.isNaN(new Date(goal.date).getTime())
      ? Math.max(0, Math.ceil((new Date(goal.date).getTime() - today) / (1000 * 60 * 60 * 24)))
      : null;
  const pct =
    goal.amount && goal.amount > 0 ? Math.min(100, Math.round((total / goal.amount) * 100)) : null;

  const hasData = chartData.length > 0;

  return (
    <section className="border-b border-border bg-card/40 px-4 py-3">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">{t("workspace.chartTitle")}</h2>
        <span className="text-xs text-muted-foreground">
          {t("workspace.chartTotal")}:{" "}
          <span className="font-mono font-semibold text-foreground">{fmt(total)}</span>
          <span className="ml-2">
            · Toteuma:{" "}
            <span className="font-mono font-semibold text-foreground">{fmt(actualTotal)}</span>
          </span>
          {pct !== null ? (
            <span className="ml-2">
              ({pct}% / {fmt(goal.amount ?? 0)})
            </span>
          ) : null}
          {daysLeft !== null ? (
            <span className="ml-2">· {t("workspace.daysLeft", { count: daysLeft })}</span>
          ) : null}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setYear((y) => y - 1)}
            className="rounded px-2 py-0.5 hover:bg-accent"
            aria-label="Previous year"
          >
            ‹
          </button>
          <span className="font-mono font-semibold text-foreground">{year}</span>
          <button
            type="button"
            onClick={() => setYear((y) => y + 1)}
            className="rounded px-2 py-0.5 hover:bg-accent"
            aria-label="Next year"
          >
            ›
          </button>
        </div>
        <label className="flex items-center gap-1">
          <span className="text-muted-foreground">{t("workspace.goalAmount")}</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={goal.amount === null ? "" : String(goal.amount)}
            onChange={(e) => {
              const v = e.target.value.trim();
              saveGoal({ ...goal, amount: v === "" ? null : Number(v.replace(",", ".")) });
            }}
            placeholder="0,00"
            className="input h-7 w-28 py-0 text-xs"
          />
        </label>
      </div>

      {!hasData ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          {t("workspace.chartEmpty")}
        </p>
      ) : (
        <>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={[monthKey(new Date(year, 0, 1)), monthKey(new Date(year, 11, 1))]}
                  allowDataOverflow
                  scale="time"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => monthFmt.format(new Date(Number(v)))}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => fmt(Number(v))}
                  width={70}
                />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--accent))" }}
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(v) => monthFmt.format(new Date(Number(v)))}
                  formatter={(v: number, name: string) => {
                    const key = String(name);
                    if (key === "__actual") return [fmt(Number(v)), "Toteuma (yht.)"];
                    if (key === "target") return [fmt(Number(v)), t("workspace.goalAmount")];
                    if (key.endsWith("__a"))
                      return [fmt(Number(v)), `${itemTitle(key.slice(0, -3))} (toteuma)`];
                    return [fmt(Number(v)), `${itemTitle(key)} (suunn.)`];
                  }}
                />
                {itemKeys.map((id, idx) => {
                  const c = colorFor(id, idx);
                  return (
                    <Area
                      key={id}
                      type="monotone"
                      dataKey={id}
                      name={id}
                      stackId="plan"
                      stroke={c}
                      fill={c}
                      fillOpacity={0.35}
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      isAnimationActive={false}
                    />
                  );
                })}
                {itemKeys.map((id, idx) => {
                  const c = darkColorFor(id, idx);
                  return (
                    <Area
                      key={`${id}__a`}
                      type="monotone"
                      dataKey={`${id}__a`}
                      name={`${id}__a`}
                      stackId="actual"
                      stroke={c}
                      fill={c}
                      fillOpacity={0.85}
                      strokeWidth={1.5}
                      isAnimationActive={false}
                    />
                  );
                })}
                {goal.amount ? (
                  <ReferenceLine
                    y={goal.amount}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="5 4"
                    label={{
                      value: t("workspace.goalAmount"),
                      fill: "hsl(var(--destructive))",
                      fontSize: 11,
                      position: "insideTopRight",
                    }}
                  />
                ) : null}
                {goal.date && !Number.isNaN(new Date(goal.date).getTime()) ? (
                  <ReferenceLine
                    x={monthKey(new Date(goal.date))}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="2 4"
                    label={{
                      value: t("workspace.goalDateShort"),
                      fill: "hsl(var(--destructive))",
                      fontSize: 11,
                      position: "top",
                    }}
                  />
                ) : null}
                {goal.amount ? (
                  <Line
                    type="linear"
                    dataKey="target"
                    name="target"
                    stroke="#ef4444"
                    strokeDasharray="5 4"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                ) : null}
                <Line
                  type="monotone"
                  dataKey="__actual"
                  name="__actual"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: "hsl(var(--foreground))" }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-0.5 w-4 bg-foreground" />
              <span className="text-muted-foreground">Toteuma (yht.)</span>
            </span>
              {itemKeys.map((id, idx) => (
                <span key={id} className="inline-flex items-center gap-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: colorFor(id, idx) }}
                  />
                  <span className="text-muted-foreground">{itemTitle(id)}</span>
                </span>
              ))}
            </div>

        </>
      )}
    </section>
  );
}
