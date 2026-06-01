import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ItemRow } from "@/lib/api/items.functions";

export function SavingsChart({ items }: { items: ItemRow[] }) {
  const { t } = useTranslation();
  const data = items
    .filter((i) => i.amount !== null && i.amount !== 0)
    .map((i) => ({ name: i.title, amount: Number(i.amount) }))
    .sort((a, b) => b.amount - a.amount);

  const total = data.reduce((s, d) => s + d.amount, 0);
  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);

  return (
    <section className="border-b border-border bg-card/40 px-4 py-3">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-tight">{t("workspace.chartTitle")}</h2>
        <span className="text-xs text-muted-foreground">
          {t("workspace.chartTotal")}:{" "}
          <span className="font-mono font-semibold text-foreground">{fmt(total)}</span>
        </span>
      </div>
      {data.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          {t("workspace.chartEmpty")}
        </p>
      ) : (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                interval={0}
                height={40}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => fmt(Number(v))}
                width={70}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--accent))", opacity: 0.3 }}
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => fmt(Number(v))}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
