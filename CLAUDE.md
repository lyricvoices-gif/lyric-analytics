# Lyric Analytics — CLAUDE.md

## What This Is
Internal analytics dashboard for the Lyric platform. Displays usage, voice performance, trial funnel, revenue, and voice genome behavioral data. Not public-facing — access controlled by `ANALYTICS_SECRET`.

**GitHub:** `github.com/lyricvoices-gif/lyric-analytics` (private)
**Production:** `https://analytics.lyricvoices.com` (Vercel, auto-deploys from `main`)
**Dev:** `npm run dev` → `http://localhost:3001`

Data source: `lyric-composer`'s `/api/analytics/dashboard` endpoint (proxied, authenticated via `ANALYTICS_SECRET`).

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js App Router (TypeScript) |
| Charts | Recharts (LineChart, Line) |
| Fonts | Cormorant Garamond (Google Fonts, loaded in layout.tsx) |
| Hosting | Vercel |

---

## Design System

```ts
bg:           "#2b2a25"   // page background
card:         "#f5f3ef"   // panel/card background (cream)
cardAlt:      "#edeae4"
gold:         "#c9a96e"   // accent, MRR display, active tab
text:         "#2b2a25"   // dark text on cream
muted:        "rgba(43,42,37,0.45)"
faint:        "rgba(43,42,37,0.07)"
inverse:      "#f5f3ef"   // light text on dark bg
inverseMuted: "rgba(245,243,239,0.45)"
error:        "#b54a2e"
good:         "#4a7c59"
```

**Panel component:** Sharp corners (no border-radius), `background: card`, `border: 1px solid border`, `padding: 28px 32px`.
**Display numbers:** Cormorant Garamond, 52px, weight 300, `fontVariantNumeric: "lining-nums tabular-nums"` (prevents I-shaped 1s).
**Tab nav:** Gold 2px bottom border on active tab.

---

## File Structure

```
app/
  layout.tsx          — Cormorant Garamond Google Fonts link tags, body background #2b2a25
  page.tsx            — Server component: fetches dashboard data, passes to <Dashboard>
  types.ts            — DashboardData, all row interfaces

components/
  Dashboard.tsx       — Main dashboard UI (5-tab layout)
  TrendChart.tsx      — Recharts wrapper for daily trend line chart
```

---

## Dashboard Tabs

### Overview
- Stat cards: Generations, Downloads, Unique Users, Audio Generated, Characters, Median Latency
- Daily trend line chart (7d / 30d / 90d toggle)
- By plan breakdown

### Voices
- Voice performance table (generations, downloads, unique users, avg duration)
- Variants table
- Emotional directions bar chart

### Trial
- Funnel stat cards: Trials, Converted, Cancelled, Expired, Conv. Rate
- Conversion by intent table
- Conversion by onboarding voice table

### Revenue
- Stat cards: MRR (gold display), Active Subscriptions, Revenue Last 30d
- Active by plan (Stripe plan_counts — mapped from price IDs to plan names)
- Recent subscription events (last 8)
- Users · Clerk (total users, +last 30d, plan distribution bar + legend)

### Voice Genome
- Download & regeneration rate by voice table
- Use case breakdown table (voice + variant + use case + dl rate + avg marks + avg script + avg duration)

---

## Key Helpers in Dashboard.tsx

```ts
// Voice ID → display name
function formatVoiceName(voiceId: string): string
// Maps: morgan-anchor → "Morgan · The Anchor", etc.

// Plan ID / price ID → plan name
function formatPlanName(planId: string): string
// Maps Stripe price IDs → "Creator" etc.
// "unknown" or missing → "Trial"
```

**Voice name map:**
```ts
"morgan-anchor"  → "Morgan · The Anchor"
"nova-intimist"  → "Nova · The Intimist"
"atlas-guide"    → "Atlas · The Guide"
"riven-narrator" → "Riven · The Narrator"
"hex-wildcard"   → "Hex · The Wildcard"
```

**Price ID map:**
```ts
"Price_1Ss1jqRr73DR28HOvpgtZDC" → "Creator"
// Add Studio price ID when available
```

---

## Environment Variables

```
COMPOSER_API_URL=https://composer.lyricvoices.com
ANALYTICS_SECRET=<shared secret — must match lyric-composer>
```

---

## Deploy

```bash
vercel --prod
```
Vercel auto-deploys on push to `main`.
