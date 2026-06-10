## Bug
In `SavingsChart.tsx`, the goal field's `onBlur` handler saves the raw input value as EUR without converting from the selected display currency. The debounced `scheduleAmountSave` path correctly calls `toEur(parsed)`, but `onBlur` bypasses it — so blurring the field after typing (e.g. 100 while USD is selected) stores 100 EUR instead of converting USD→EUR.

## Fix
In `src/components/SavingsChart.tsx` (lines 313–324), convert the parsed input to EUR before comparing with `goal.amount` and saving, matching the debounced path:

```ts
onBlur={() => {
  amountFocusedRef.current = false;
  if (amountTimerRef.current) {
    clearTimeout(amountTimerRef.current);
    amountTimerRef.current = null;
  }
  const v = amountDraft.trim();
  const parsed = v === "" ? null : Number(v.replace(",", "."));
  if (parsed !== null && Number.isNaN(parsed)) return;
  const nextEur = parsed === null ? null : Math.round(toEur(parsed) * 100) / 100;
  if (nextEur === goal.amount) return;
  saveGoal({ ...goal, amount: nextEur });
}}
```

No other call sites need changes.
