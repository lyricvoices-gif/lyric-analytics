"use client"

import { useRouter } from "next/navigation"
import { Suspense } from "react"
import type { DashboardData } from "../types"
import { TrendChart } from "./TrendChart"
import { VoiceChart } from "./VoiceChart"
import { EmotionalChart } from "./EmotionalChart"

// ── Tokens ─────────────────────────────────────────────────────────────────────

const C = {
  bg: "#0d0b0a",
  card: "#181614",
  cardBorder: "rgba(255,255,255,0.07)",
  cardBorderStrong: "rgba(255,255,255,0.11)",
  brand: "#B8955A",
  brandDim: "rgba(184,149,90,0.12)",
  brandMid: "rgba(184,149,90,0.45)",
  text: "#f5f3f0",
  muted: "rgba(245,243,240,0.4)",
  faint: "rgba(245,243,240,0.07)",
  divider: "rgba(255,255,255,0.06)",
  error: "#c4722a",
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtAudio(seconds: number | undefined | null): string {
  if (!seconds) return "—"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function fmtNum(n: number | string | undefined | null): string {
  if (n == null) return "—"
  return Number(n).toLocaleString()
}

function fmtMs(ms: number | undefined | null): string {
  if (ms == null) return "—"
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`
}

function fmtMoney(n: number | undefined | null): string {
  if (n == null) return "—"
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Primitives ─────────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.cardBorder}`,
      borderRadius: "16px",
      padding: "24px 28px",
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em",
      color: C.muted, textTransform: "uppercase", margin: "0 0 20px",
    }}>
      {children}
    </p>
  )
}

// ── Range toggle ───────────────────────────────────────────────────────────────

function RangeToggle({ current }: { current: number }) {
  const router = useRouter()
  return (
    <div style={{ display: "flex", gap: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "9px", padding: "3px" }}>
      {[7, 30, 90].map((n) => (
        <button
          key={n}
          onClick={() => router.push(`/?range=${n}`)}
          style={{
            padding: "5px 14px", borderRadius: "7px", border: "none",
            background: n === current ? C.card : "transparent",
            boxShadow: n === current ? `0 0 0 1px ${C.cardBorder}` : "none",
            color: n === current ? C.text : C.muted,
            fontSize: "12px", fontWeight: n === current ? 500 : 400,
            cursor: "pointer", transition: "all 0.15s ease",
          }}
        >
          {n}d
        </button>
      ))}
    </div>
  )
}

// ── Overview ───────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
  large,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
  large?: boolean
}) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: large ? "120px" : "100px" }}>
      <p style={{
        fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em",
        color: C.muted, textTransform: "uppercase", margin: 0,
      }}>
        {label}
      </p>
      <div>
        <p style={{
          fontSize: large ? "44px" : "28px",
          fontWeight: large ? 300 : 500,
          letterSpacing: large ? "-0.04em" : "-0.02em",
          color: accent ? C.brand : C.text,
          margin: 0, lineHeight: 1,
        }}>
          {value}
        </p>
        {sub && <p style={{ fontSize: "11px", color: C.muted, margin: "6px 0 0" }}>{sub}</p>}
      </div>
    </Card>
  )
}

function OverviewSection({ data }: { data: DashboardData }) {
  const { overview, latency, stripe } = data
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Primary row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: "10px" }}>
        <StatCard label="Generations" value={fmtNum(overview.total_generations)} large accent={false} />
        <StatCard label="Downloads" value={fmtNum(overview.total_downloads)} />
        <StatCard label="Unique Users" value={fmtNum(overview.unique_users)} />
      </div>
      {/* Secondary row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
        <StatCard label="Audio Generated" value={fmtAudio(overview.total_audio_seconds)} />
        <StatCard label="Median Latency" value={fmtMs(latency.p50_ms)} sub={latency.p95_ms ? `p95 ${fmtMs(latency.p95_ms)}` : undefined} />
        <StatCard label="MRR" value={fmtMoney(stripe.mrr)} accent sub={stripe.active_subscriptions ? `${stripe.active_subscriptions} active subs` : undefined} />
      </div>
    </div>
  )
}

// ── Clerk card ─────────────────────────────────────────────────────────────────

function ClerkCard({ clerk }: { clerk: DashboardData["clerk"] }) {
  if (clerk.error) {
    return (
      <Card>
        <SectionLabel>Users · Clerk</SectionLabel>
        <p style={{ fontSize: "12px", color: C.error }}>{clerk.error}</p>
      </Card>
    )
  }

  const dist = clerk.plan_distribution ?? {}
  const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1
  const planOrder = ["enterprise", "studio", "creator", "unknown"]
  const planColor: Record<string, string> = {
    enterprise: "#B8955A",
    studio: "rgba(184,149,90,0.65)",
    creator: "rgba(184,149,90,0.35)",
    unknown: "rgba(245,243,240,0.12)",
  }

  return (
    <Card>
      <SectionLabel>Users · Clerk</SectionLabel>
      <div style={{ display: "flex", gap: "36px", marginBottom: "24px", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: "44px", fontWeight: 300, letterSpacing: "-0.04em", color: C.text, margin: "0 0 4px", lineHeight: 1 }}>
            {fmtNum(clerk.total_users)}
          </p>
          <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>total users</p>
        </div>
        <div style={{ paddingBottom: "4px" }}>
          <p style={{ fontSize: "24px", fontWeight: 400, letterSpacing: "-0.02em", color: C.text, margin: "0 0 4px", lineHeight: 1 }}>
            +{fmtNum(clerk.new_users_last_30d)}
          </p>
          <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>last 30d</p>
        </div>
      </div>

      {/* Plan bar */}
      <div style={{ display: "flex", borderRadius: "3px", overflow: "hidden", height: "4px", marginBottom: "12px", gap: "2px" }}>
        {planOrder.filter(p => dist[p]).map(p => (
          <div key={p} style={{
            flex: dist[p] / total,
            background: planColor[p] ?? C.faint,
            borderRadius: "2px",
          }} />
        ))}
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {planOrder.filter(p => dist[p]).map(p => (
          <span key={p} style={{ fontSize: "11px", color: C.muted }}>
            <span style={{ color: planColor[p] ?? C.muted, marginRight: "5px" }}>●</span>
            {p} <strong style={{ color: C.text, fontWeight: 500 }}>{dist[p]}</strong>
          </span>
        ))}
      </div>
    </Card>
  )
}

// ── Stripe card ────────────────────────────────────────────────────────────────

function eventLabel(type: string): string {
  return type.replace("customer.subscription.", "").replace(/_/g, " ")
}

function StripeCard({ stripe }: { stripe: DashboardData["stripe"] }) {
  if (stripe.error) {
    return (
      <Card>
        <SectionLabel>Revenue · Stripe</SectionLabel>
        <p style={{ fontSize: "12px", color: C.error }}>{stripe.error}</p>
      </Card>
    )
  }

  return (
    <Card>
      <SectionLabel>Revenue · Stripe</SectionLabel>
      <div style={{ display: "flex", gap: "36px", marginBottom: "24px", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: "44px", fontWeight: 300, letterSpacing: "-0.04em", color: C.brand, margin: "0 0 4px", lineHeight: 1 }}>
            {fmtMoney(stripe.mrr)}
          </p>
          <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>monthly recurring</p>
        </div>
        <div style={{ paddingBottom: "4px" }}>
          <p style={{ fontSize: "24px", fontWeight: 400, letterSpacing: "-0.02em", color: C.text, margin: "0 0 4px", lineHeight: 1 }}>
            {fmtMoney(stripe.revenue_last_30d)}
          </p>
          <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>revenue last 30d</p>
        </div>
        <div style={{ paddingBottom: "4px" }}>
          <p style={{ fontSize: "24px", fontWeight: 400, letterSpacing: "-0.02em", color: C.text, margin: "0 0 4px", lineHeight: 1 }}>
            {fmtNum(stripe.active_subscriptions)}
          </p>
          <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>active subs</p>
        </div>
      </div>

      {stripe.recent_events && stripe.recent_events.length > 0 && (
        <>
          <div style={{ height: "1px", background: C.divider, marginBottom: "16px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {stripe.recent_events.slice(0, 5).map((ev, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontSize: "12px", fontWeight: 500,
                  color: ev.type.includes("deleted") ? C.error : ev.type.includes("created") ? C.brand : C.muted,
                }}>
                  {eventLabel(ev.type)}
                </span>
                <span style={{ fontSize: "11px", color: C.muted }}>{timeAgo(ev.created)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}

// ── Error state ────────────────────────────────────────────────────────────────

function ErrorState() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <div style={{ textAlign: "center", maxWidth: "360px" }}>
        <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", color: C.muted, textTransform: "uppercase", marginBottom: "20px" }}>
          Lyric Analytics
        </p>
        <p style={{ fontSize: "18px", color: C.text, marginBottom: "10px", letterSpacing: "-0.01em" }}>
          Failed to load dashboard data
        </p>
        <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.6 }}>
          Check that COMPOSER_API_URL and ANALYTICS_SECRET are set correctly.
        </p>
      </div>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

function DashboardInner({ data, range }: { data: DashboardData; range: number }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: "80px" }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(13,11,10,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.divider}`,
        padding: "0 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "60px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
          <span style={{
            fontSize: "13px", fontWeight: 700, letterSpacing: "0.18em",
            color: C.brand, textTransform: "uppercase",
          }}>
            Lyric
          </span>
          <span style={{
            fontSize: "13px", fontWeight: 300, letterSpacing: "0.06em",
            color: C.muted,
          }}>
            Analytics
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "11px", color: C.muted }}>
            {timeAgo(data.generated_at)}
          </span>
          <RangeToggle current={range} />
        </div>
      </div>

      <div style={{ maxWidth: "1360px", margin: "0 auto", padding: "36px 40px 0" }}>

        {/* Overview */}
        <OverviewSection data={data} />

        {/* Trend */}
        <Card style={{ marginTop: "12px" }}>
          <SectionLabel>Daily Trend · Last {range}d</SectionLabel>
          <TrendChart data={data.daily_trend} />
        </Card>

        {/* Voices */}
        <div style={{ marginTop: "12px" }}>
          <Card>
            <SectionLabel>Voice Breakdown</SectionLabel>
            <VoiceChart data={data.voices} variants={data.variants} />
          </Card>
        </div>

        {/* Emotional directions */}
        <Card style={{ marginTop: "12px" }}>
          <SectionLabel>Emotional Directions</SectionLabel>
          <EmotionalChart data={data.emotional_directions} />
        </Card>

        {/* Clerk + Stripe */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
          <ClerkCard clerk={data.clerk} />
          <StripeCard stripe={data.stripe} />
        </div>

        {/* Plan breakdown */}
        {data.plan_breakdown.length > 0 && (
          <Card style={{ marginTop: "12px" }}>
            <SectionLabel>By Plan</SectionLabel>
            <div style={{ display: "flex", gap: "0", flexWrap: "wrap" }}>
              {data.plan_breakdown.map((row, i) => (
                <div key={row.plan_tier} style={{
                  flex: "1", minWidth: "140px",
                  paddingRight: "24px",
                  borderRight: i < data.plan_breakdown.length - 1 ? `1px solid ${C.divider}` : "none",
                  marginRight: i < data.plan_breakdown.length - 1 ? "24px" : 0,
                }}>
                  <p style={{
                    fontSize: "10px", fontWeight: 700, color: C.brand,
                    textTransform: "capitalize", letterSpacing: "0.1em", margin: "0 0 12px",
                  }}>
                    {row.plan_tier}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {([
                      ["Generations", fmtNum(row.generations)],
                      ["Downloads", fmtNum(row.downloads)],
                      ["Users", fmtNum(row.unique_users)],
                    ] as [string, string][]).map(([label, val]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: C.muted }}>{label}</span>
                        <span style={{ fontSize: "12px", color: C.text, fontWeight: 500 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Latency footnote */}
        <div style={{ display: "flex", gap: "28px", marginTop: "20px", justifyContent: "flex-end", paddingRight: "4px" }}>
          {([
            ["avg", data.latency.avg_ms],
            ["p50", data.latency.p50_ms],
            ["p95", data.latency.p95_ms],
          ] as [string, number | null][]).map(([label, val]) => (
            <span key={label} style={{ fontSize: "11px", color: C.muted }}>
              {label} <strong style={{ color: C.text, fontWeight: 500 }}>{fmtMs(val)}</strong>
            </span>
          ))}
        </div>

      </div>
    </div>
  )
}

export function Dashboard({ data, range }: { data: DashboardData | null; range: number }) {
  if (!data) return <ErrorState />
  return (
    <Suspense>
      <DashboardInner data={data} range={range} />
    </Suspense>
  )
}
