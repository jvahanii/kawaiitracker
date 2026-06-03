import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
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
  const [groupBy, setGroupBy] = useState<"item" | "assignee">("item");

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
  const total = useMemo(() => entries.reduce((s, e) => s + (e.amount ?? 0), 0), [entries]);
  const actualTotal = useMemo(() => entries.reduce((s, e) => s + (e.actual ?? 0), 0), [entries]);

  // Map from itemId -> list of assignee ids (or ["__unassigned"]) for splitting
  const itemAssigneeMap = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const it of items) {
      const ids = it.assignees.map((a) => a.id);
      m.set(it.id, ids.length > 0 ? ids : ["__unassigned"]);
    }
    return m;
  }, [items]);

  const assigneeName = useMemo(() => {
    const m = new Map<string, string>();
    for (const it of items) for (const a of it.assignees) m.set(a.id, a.name);
    m.set("__unassigned", t("workspace.unassigned"));
    return m;
  }, [items, t]);

  // Build cumulative series across all months for the selected grouping
  const { chartData, seriesKeys } = useMemo(() => {
    const months: number[] = [];
    for (let m = 0; m < 12; m++) months.push(monthKey(new Date(year, m, 1)));

    // resolve which series-keys an entry belongs to (splitting equally for assignee mode)
    const keysFor = (itemId: string): { key: string; weight: number }[] => {
      if (groupBy === "item") return [{ key: itemId, weight: 1 }];
      const ids = itemAssigneeMap.get(itemId) ?? ["__unassigned"];
      const w = 1 / ids.length;
      return ids.map((id) => ({ key: id, weight: w }));
    };

    const perKeyMonth = new Map<string, Map<number, number>>();
    const perKeyMonthActual = new Map<string, Map<number, number>>();
    const actualPerMonth = new Map<number, number>();
    for (const e of entries) {
      const k = monthKey(new Date(e.month));
      for (const { key, weight } of keysFor(e.itemId)) {
        let m = perKeyMonth.get(key);
        if (!m) { m = new Map(); perKeyMonth.set(key, m); }
        m.set(k, (m.get(k) ?? 0) + (e.amount ?? 0) * weight);
        let ma = perKeyMonthActual.get(key);
        if (!ma) { ma = new Map(); perKeyMonthActual.set(key, ma); }
        ma.set(k, (ma.get(k) ?? 0) + (e.actual ?? 0) * weight);
      }
      actualPerMonth.set(k, (actualPerMonth.get(k) ?? 0) + (e.actual ?? 0));
    }

    const ids = Array.from(perKeyMonth.keys());
    const cum = new Map<string, number>(ids.map((id) => [id, 0]));
    const cumA = new Map<string, number>(ids.map((id) => [id, 0]));
    let cumActual = 0;
    const now = monthKey(new Date());
    const rows: Array<Record<string, number | undefined>> = months.map((tm) => {
      const row: Record<string, number | undefined> = { t: tm };
      for (const id of ids) {
        const add = perKeyMonth.get(id)?.get(tm) ?? 0;
        cum.set(id, (cum.get(id) ?? 0) + add);
        row[id] = cum.get(id) ?? 0;
        if (tm <= now) {
          const addA = perKeyMonthActual.get(id)?.get(tm) ?? 0;
          cumA.set(id, (cumA.get(id) ?? 0) + addA);
          row[`${id}__a`] = cumA.get(id) ?? 0;
        }
      }
      if (tm <= now) {
        cumActual += actualPerMonth.get(tm) ?? 0;
        row.__actual = cumActual;
      }
      row.__plan = ids.reduce((s, id) => s + (row[id] ?? 0), 0);
      return row;
    });

    return { chartData: rows, seriesKeys: ids };
  }, [entries, groupBy, itemAssigneeMap, year]);


  const seriesTitle = (id: string) =>
    groupBy === "item"
      ? items.find((i) => i.id === id)?.title ?? "—"
      : assigneeName.get(id) ?? "—";

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
        <div className="ml-auto inline-flex overflow-hidden rounded border border-border">
          <button
            type="button"
            onClick={() => setGroupBy("item")}
            className={`px-2 py-0.5 text-xs ${groupBy === "item" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"}`}
          >
            Kohteittain
          </button>
          <button
            type="button"
            onClick={() => setGroupBy("assignee")}
            className={`px-2 py-0.5 text-xs ${groupBy === "assignee" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"}`}
          >
            Vastuuhenkilöittäin
          </button>
        </div>
      </div>

      {!hasData ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          {t("workspace.chartEmpty")}
        </p>
      ) : (
        <>
          <div className="flex gap-3">
            <div className="h-36 flex-1">
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
                    domain={[0, (dataMax: number) => dataMax * 1.1]}
                  />
                  <Tooltip
                    cursor={{ stroke: "hsl(var(--accent))" }}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    labelFormatter={(v) => monthFmt.format(new Date(Number(v)))}
                    content={({ payload, label }) => {
                      if (!payload || payload.length === 0) return null;
                      const row = payload[0]?.payload as Record<string, number | undefined> | undefined;
                      const totalPlan = row?.__plan ?? 0;
                      const totalActual = row?.__actual;
                      const rows: { name: string; value: string }[] = [];
                      for (const id of seriesKeys) {
                        const plan = row?.[id];
                        const actual = row?.[`${id}__a`];
                        if (plan === undefined && actual === undefined) continue;
                        const name = seriesTitle(id);
                        if (actual !== undefined && plan !== undefined) {
                          rows.push({ name, value: `${fmt(actual)} / ${fmt(plan)}` });
                        } else if (actual !== undefined) {
                          rows.push({ name: `${name} (toteuma)`, value: fmt(actual) });
                        } else if (plan !== undefined) {
                          rows.push({ name: `${name} (suunnitelma)`, value: fmt(plan) });
                        }
                      }
                      return (
                        <div
                          style={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                            padding: "8px 12px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          }}
                        >
                          <div style={{ fontWeight: 600, marginBottom: 6 }}>
                            {monthFmt.format(new Date(Number(label)))}
                          </div>
                          <div style={{ fontWeight: 700, marginBottom: rows.length > 0 ? 4 : 0, paddingBottom: rows.length > 0 ? 4 : 0, borderBottom: rows.length > 0 ? "1px solid var(--border)" : "none" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, lineHeight: 1.6 }}>
                              <span style={{ color: "hsl(var(--muted-foreground))" }}>Toteuma / Suunnitelma</span>
                              <span style={{ fontFamily: "monospace", fontWeight: 700 }}>
                                {totalActual !== undefined ? fmt(totalActual) : "—"} / {fmt(totalPlan)}
                              </span>
                            </div>
                          </div>
                          {rows.map((r) => (
                            <div key={r.name} style={{ display: "flex", justifyContent: "space-between", gap: 16, lineHeight: 1.6 }}>
                              <span style={{ color: "hsl(var(--muted-foreground))" }}>{r.name}</span>
                              <span style={{ fontFamily: "monospace", fontWeight: 500 }}>{r.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  {seriesKeys.map((id, idx) => {
                    const c = colorFor(id, idx);
                    const dc = darkColorFor(id, idx);
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
                      >
                        <LabelList
                          dataKey={id}
                          content={(props: {
                            x?: number | string;
                            y?: number | string;
                            width?: number | string;
                            index?: number;
                            value?: number | string;
                          }) => {
                            const i = props.index ?? -1;
                            // Place one label per series, near the middle of the chart
                            const target = Math.max(0, Math.min(chartData.length - 1, Math.floor(chartData.length / 2)));
                            if (i !== target) return null;
                            const x = Number(props.x ?? 0);
                            const y = Number(props.y ?? 0);
                            const w = Number(props.width ?? 0);
                            const label = seriesTitle(id);
                            if (!label || label === "—") return null;
                            return (
                              <text
                                x={x + w / 2}
                                y={y + 10}
                                textAnchor="middle"
                                fontSize={10}
                                fontWeight={600}
                                fill={dc}
                                style={{ paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 3, strokeLinejoin: "round" }}
                              >
                                {label}
                              </text>
                            );
                          }}
                        />
                      </Area>
                    );
                  })}

                  {seriesKeys.map((id, idx) => {
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
          </div>

        </>
      )}
    </section>
  );
}
