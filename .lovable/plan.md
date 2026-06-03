## Fix red goal line in SavingsChart

**Problems**
1. The line doesn't render. The chart wraps the destructive token as `hsl(var(--destructive))`, but in `src/styles.css` `--destructive` is defined as `oklch(...)`. Wrapping an oklch value in `hsl(...)` yields an invalid color, so Recharts draws nothing. (The existing goal-date `ReferenceLine` has the same bug but is less visible.)
2. The current implementation draws a diagonal "target pace" `<Line dataKey="__target">` from 0 → goal across the year. The user wants a horizontal line at the goal amount.

**Changes (only `src/components/SavingsChart.tsx`)**

1. Remove the diagonal target line:
   - Drop the `__target` computation in the `useMemo` (lines ~149–153 `goalTime`/`targetSpan` and lines ~171–174 `row.__target = …`).
   - Remove the `<Line dataKey="__target" …>` block (lines ~457–469).

2. Add a horizontal `<ReferenceLine y={goal.amount}>` inside the `ComposedChart`, rendered only when `goal.amount > 0`:
   ```tsx
   <ReferenceLine
     y={goal.amount}
     stroke="var(--destructive)"
     strokeDasharray="4 4"
     strokeWidth={1.5}
     ifOverflow="extendDomain"
     label={{
       value: t("workspace.goalAmountShort") ?? "Goal",
       fill: "var(--destructive)",
       fontSize: 11,
       position: "insideTopRight",
     }}
   />
   ```
   `ifOverflow="extendDomain"` ensures the line is visible even when the goal exceeds the current Y max.

3. Fix the existing goal-date `ReferenceLine` stroke/label to use `var(--destructive)` instead of `hsl(var(--destructive))` so it also renders correctly.

No other files or business logic touched.