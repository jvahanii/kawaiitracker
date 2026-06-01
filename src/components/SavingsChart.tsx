import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

import type { ItemRow } from "@/lib/api/items.functions";

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

export function SavingsChart({ items, tenantId }: { items: ItemRow[]; tenantId: string }) {
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

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);

  const total = useMemo(
    () => items.reduce((s, i) => s + (i.amount ?? 0), 0),
    [items],
  );

  // Build cumulative time series from item createdAt + amount
  const series = useMemo(() => {
    const points = items
      .filter((i) => i.amount !== null && i.amount !== 0)
      .map((i) => ({ t: new Date(i.createdAt).getTime(), amount: Number(i.amount) }))
      .sort((a, b) => a.t - b.t);

    let cum = 0;
    const data = points.map((p) => {
      cum += p.amount;
      return { t: p.t, cumulative: cum };
    });

    // Add target endpoint if goal date set
    if (goal.date) {
      const tEnd = new Date(goal.date).getTime();
      if (!Number.isNaN(tEnd) && (data.length === 0 || tEnd > data[data.length - 1].t)) {
        data.push({ t: tEnd, cumulative: cum });
      }
    }
    return data;
  }, [items, goal.date]);

  // Target line: linear from (tStart, 0) to (goal.date, goal.amount)
  const targetLine = useMemo(() => {
    if (!goal.amount || !goal.date) return null;
    const tEnd = new Date(goal.date).getTime();
    if (Number.isNaN(tEnd)) return null;
    const tStart = series.length > 0 ? series[0].t : Date.now();
    if (tEnd <= tStart) return null;
    return { tStart, tEnd, amount: goal.amount };
  }, [goal, series]);

  const chartData = useMemo(() => {
    const map = new Map<number, { t: number; cumulative?: number; target?: number }>();
    for (const p of series) map.set(p.t, { t: p.t, cumulative: p.cumulative });
    if (targetLine) {
      map.set(targetLine.tStart, { ...(map.get(targetLine.tStart) ?? { t: targetLine.tStart }), target: 0 });
      map.set(targetLine.tEnd, { ...(map.get(targetLine.tEnd) ?? { t: targetLine.tEnd }), target: targetLine.amount });
    }
    const rows = Array.from(map.values()).sort((a, b) => a.t - b.t);
    // Interpolate target across every point so the line draws continuously
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


  const dateFmt = new Intl.DateTimeFormat(i18n.language, {
    month: "short",
    day: "numeric",
  });

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
                tickFormatter={(v) => dateFmt.format(new Date(Number(v)))}
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
                labelFormatter={(v) => dateFmt.format(new Date(Number(v)))}
                formatter={(v: number, name: string) => [
                  fmt(Number(v)),
                  name === "cumulative" ? t("workspace.chartTotal") : t("workspace.goalAmount"),
                ]}
              />
              <Bar
                dataKey="cumulative"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                barSize={18}
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
                  x={new Date(goal.date).getTime()}
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
                <ReferenceLine
                  y={goal.amount}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="2 4"
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
