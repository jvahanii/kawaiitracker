## Goal
Add cute kawaii-style kiwi fruits to the landing page and login page, and use a kiwi emoji as the favicon.

## Changes

### 1. Favicon — kiwi emoji (🥝)
In `src/routes/__root.tsx`, add an SVG-emoji favicon link (data URL) so no asset file is needed:
```
{ rel: "icon", href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥝</text></svg>" }
```

### 2. Landing page (`src/routes/index.tsx`)
Generate one kawaii kiwi illustration (cute face, blushing cheeks, transparent PNG) via imagegen and place it prominently in the hero area, plus sprinkle 🥝 emoji into the existing decorative emoji clusters (alongside 🍡🌷🐰, not replacing them).

### 3. Login page (`src/routes/login.tsx`)
Reuse the same kawaii kiwi PNG as a decorative element near the login card (e.g., top-right or peeking from a corner), and add a small 🥝 next to the heading.

## Assets
- `src/assets/kawaii-kiwi.png` — generated via imagegen (transparent background, kawaii style: round kiwi slice with a smiling face, pink cheeks, sparkles).

## Out of scope
No layout/copy changes, no logic changes, no signup/forgot-password decorations (user specified landing + login).
