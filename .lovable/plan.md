## Goal
Place a simple key icon in the center of each kawaii kiwi image (landing hero kiwi, the two decorative kiwis on landing, the two decorative kiwis on login, and the small kiwi badge above the login card).

## Approach
Overlay a `lucide-react` `Key` icon on top of the kiwi `<img>` using a relative wrapper — keeps the generated PNG untouched and easy to tweak.

Create a small reusable component `src/components/KiwiWithKey.tsx`:
```tsx
import { Key } from "lucide-react";
import kawaiiKiwi from "@/assets/kawaii-kiwi.png";

export function KiwiWithKey({ className, imgClassName, keyClassName, alt = "" }) {
  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      <img src={kawaiiKiwi} alt={alt} className={imgClassName} />
      <Key
        aria-hidden
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground ${keyClassName ?? ""}`}
      />
    </span>
  );
}
```

Replace each existing `<img src={kawaiiKiwi} … />` in `src/routes/index.tsx` and `src/routes/login.tsx` with `<KiwiWithKey …/>`, preserving size/rotation classes, and pick a `Key` size proportional to each kiwi (e.g. ~40% of the kiwi dimensions).

## Out of scope
- Favicon (stays as the 🥝 emoji)
- No changes to the kiwi PNG itself
- No color/layout changes elsewhere
