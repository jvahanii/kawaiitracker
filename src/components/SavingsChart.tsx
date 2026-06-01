import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bar,
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

type Goal = { amount: number | null; date: string | null };

function loadGoal(tenantId: string): Goal {
  if (typeof window === "undefined") return { amount: null, date: null };
  try {
    const raw = localStorage.getItem(`savings-goal:${tenantId}`);
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

export function SavingsChart({ tenantId }: { tenantId: string }) {
  const { t, i18n } = useTranslation();
  const [goal, setGoal] = useState<Goal>({ amount: null, date: null });

  useEffect(() => {
    setGoal(loadGoal(tenantId));
  }, [tenantId]);

  const saveGoal = (g: Goal) => {
    setGoal(g);
    try {
      localStorage.setItem(`savings-goal:${tenantId}`, JSON.stringify(g));
    } catch {
      /* ignore */
    }
  };

  const listFn = useServerFn(listAllEntries);
  const entriesQ = useQuery({
    queryKey: ["entries", tenantId],
    queryFn: () => listFn({ data: { tenantId } }),
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);
  const monthFmt = new Intl.DateTimeFormat(i18n.language, { month: "short", year: "2-digit" });

  const entries = entriesQ.data ?? [];
  const total = useMemo(() => entries.reduce((s, e) => s + e.amount, 0), [entries]);

  // Aggregate per month → cumulative across months
  const series = useMemo(() => {
    const byMonth = new Map<number, number>();
    for (const e of entries) {
      const k = monthKey(new Date(e.month));
      byMonth.set(k, (byMonth.get(k) ?? 0) + e.amount);
    }
    const months = Array.from(byMonth.entries()).sort((a, b) => a[0] - b[0]);
    let cum = 0;
    return months.map(([t, amount]) => {
      cum += amount;
      return { t, amount, cumulative: cum };
    });
  }, [entries]);

  const targetLine = useMemo(() => {
    if (!goal.amount || !goal.date) return null;
    const tEnd = monthKey(new Date(goal.date));
    if (Number.isNaN(tEnd)) return null;
    const tStart = series.length > 0 ? series[0].t : monthKey(new Date());
    if (tEnd <= tStart) return null;
    return { tStart, tEnd, amount: goal.amount };
  }, [goal, series]);

  const chartData = useMemo(() => {
    const map = new Map<
      number,
      { t: number; amount?: number; cumulative?: number; target?: number }
    >();
    for (const p of series)
      map.set(p.t, { t: p.t, amount: p.amount, cumulative: p.cumulative });
    if (targetLine) {
      map.set(targetLine.tStart, {
        ...(map.get(targetLine.tStart) ?? { t: targetLine.tStart }),
        target: 0,
      });
      map.set(targetLine.tEnd, {
        ...(map.get(targetLine.tEnd) ?? { t: targetLine.tEnd }),
        target: targetLine.amount,
      });
    }
    const rows = Array.from(map.values()).sort((a, b) => a.t - b.t);
    if (targetLine) {
      const { tStart, tEnd, amount } = targetLine;
      const span = tEnd - tStart;
      for (const r of rows) {
        if (r.target === undefined && r.t >= tStart && r.t <= tEnd) {
          r.target = ((r.t - tStart) / span) * amount;
        }
      }
    }
    return rows;
  }, [series, targetLine]);

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

      <div className="mb-3 flex flex-wrap gap-3 text-xs">
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
        <label className="flex items-center gap-1">
          <span className="text-muted-foreground">{t("workspace.goalDate")}</span>
          <input
            type="date"
            value={goal.date ?? ""}
            onChange={(e) => saveGoal({ ...goal, date: e.target.value || null })}
            className="input h-7 py-0 text-xs"
          />
        </label>
      </div>

      {!hasData ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          {t("workspace.chartEmpty")}
        </p>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="t"
                type="number"
                domain={["dataMin", "dataMax"]}
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
                formatter={(v: number, name: string) => [
                  fmt(Number(v)),
                  name === "cumulative"
                    ? t("workspace.chartTotal")
                    : name === "amount"
                    ? t("workspace.monthAmount")
                    : t("workspace.goalAmount"),
                ]}
              />
              <Bar
                dataKey="amount"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                barSize={18}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 4"
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
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
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
