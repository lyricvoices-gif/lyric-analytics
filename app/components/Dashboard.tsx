"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import type { DashboardData } from "../types"
import { TrendChart } from "./TrendChart"
import { VoiceChart } from "./VoiceChart"
import { EmotionalChart } from "./EmotionalChart"

// ── Tokens ────────────────────────────────────────────────────────────────────

const C = {
  bg: "#12100f",
  card: "#1e1c1a",
  cardBorder: "rgba(255,255,255,0.07)",
  brand: "#B8955A",
  brandMuted: "rgba(184,149,90,0.3)",
  text: "#faf9f7",
  muted: "rgba(248,246,243,0.45)",
  subtle: "rgba(248,246,243,0.12)",
  error: "#c4722a",
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAudio(seconds: number): string {
  if (!seconds) return "—"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function fmtNum(n: number | undefined | null): string {
  if (n == null) return "—"
  return n.toLocaleString()
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

function eventLabel(type: string): string {
  return type.replace("customer.subscription.", "").replace("_", " ")
}

// ── Card ──────────────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: "14px",
      padding: "20px 24px", ...style,
    }}>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: C.muted, textTransform: "uppercase", margin: "0 0 8px" }}>
      {children}
    </p>
  )
}

function Big({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.02em", color: C.text, margin: 0 }}>{children}</p>
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: "12px", color: C.muted, margin: "4px 0 0" }}>{children}</p>
}

// ── Range toggle ──────────────────────────────────────────────────────────────

function RangeToggle({ current }: { current: number }) {
  const router = useRouter()
  const options = [7, 30, 90]
  return (
    <div style={{ display: "flex", gap: "4px", background: C.subtle, borderRadius: "8px", padding: "3px" }}>
      {options.map((n) => (
        <button
          key={n}
          onClick={() => router.push(`/?range=${n}`)}
          style={{
            padding: "4px 12px", borderRadius: "6px", border: "none",
            background: n === current ? C.card : "transparent",
            color: n === current ? C.text : C.muted,
            fontSize: "12px", fontWeight: n === current ? 500 : 400,
            cursor: "pointer", transition: "all 0.12s",
          }}
        >
          {n}d
        </button>
      ))}
    </div>
  )
}

// ── Overview bar ──────────────────────────────────────────────────────────────

function OverviewBar({ data }: { data: DashboardData }) {
  const { overview, latency } = data
  const stats = [
    { label: "Generations", value: fmtNum(overview.total_generations) },
    { label: "Downloads", value: fmtNum(overview.total_downloads) },
    { label: "Previews", value: fmtNum(overview.total_previews) },
    { label: "Unique Users", value: fmtNum(overview.unique_users) },
    { label: "Audio Generated", value: fmtAudio(overview.total_audio_seconds) },
    { label: "Median Gen Time", value: fmtMs(latency.p50_ms) },
  ]
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px" }}>
      {stats.map(({ label, value }) => (
        <Card key={label}>
          <Label>{label}</Label>
          <Big>{value}</Big>
        </Card>
      ))}
    </div>
  )
}

// ── Clerk card ────────────────────────────────────────────────────────────────

function ClerkCard({ clerk }: { clerk: DashboardData["clerk"] }) {
  if (clerk.error) {
    return <Card><Label>Users (Clerk)</Label><Sub style={{ color: C.error } as React.CSSProperties}>{clerk.error}</Sub></Card>
  }
  const dist = clerk.plan_distribution ?? {}
  const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1
  const planOrder = ["enterprise", "studio", "creator", "unknown"]
  const planColor: Record<string, string> = {
    enterprise: "#B8955A",
    studio: "rgba(184,149,90,0.65)",
    creator: "rgba(184,149,90,0.35)",
    unknown: "rgba(248,246,243,0.15)",
  }
  return (
    <Card>
      <Label>Users · Clerk</Label>
      <div style={{ display: "flex", gap: "32px", marginBottom: "16px" }}>
        <div>
          <Big>{fmtNum(clerk.total_users)}</Big>
          <Sub>total users</Sub>
        </div>
        <div>
          <Big style={{ fontSize: "22px" } as React.CSSProperties}>{fmtNum(clerk.new_users_last_30d)}</Big>
          <Sub>new last 30d</Sub>
        </div>
      </div>
      {/* Plan distribution bar */}
      <div style={{ display: "flex", borderRadius: "4px", overflow: "hidden", height: "6px", marginBottom: "10px" }}>
        {planOrder.filter(p => dist[p]).map(p => (
          <div key={p} style={{ width: `${(dist[p] / total) * 100}%`, background: planColor[p] ?? C.subtle }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {planOrder.filter(p => dist[p]).map(p => (
          <span key={p} style={{ fontSize: "11px", color: C.muted }}>
            <span style={{ color: planColor[p] ?? C.muted, marginRight: "4px" }}>●</span>
            {p} <strong style={{ color: C.text }}>{dist[p]}</strong>
          </span>
        ))}
      </div>
    </Card>
  )
}

// ── Stripe card ───────────────────────────────────────────────────────────────

function StripeCard({ stripe }: { stripe: DashboardData["stripe"] }) {
  if (stripe.error) {
    return <Card><Label>Revenue · Stripe</Label><Sub style={{ color: C.error } as React.CSSProperties}>{stripe.error}</Sub></Card>
  }
  return (
    <Card>
      <Label>Revenue · Stripe</Label>
      <div style={{ display: "flex", gap: "32px", marginBottom: "16px" }}>
        <div>
          <p style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.03em", color: C.brand, margin: 0 }}>
            {fmtMoney(stripe.mrr)}
          </p>
          <Sub>MRR</Sub>
        </div>
        <div>
          <Big style={{ fontSize: "22px" } as React.CSSProperties}>{fmtNum(stripe.active_subscriptions)}</Big>
          <Sub>active subs</Sub>
        </div>
        <div>
          <Big style={{ fontSize: "22px" } as React.CSSProperties}>{fmtMoney(stripe.revenue_last_30d)}</Big>
          <Sub>revenue last 30d</Sub>
        </div>
      </div>
      {/* Plan counts */}
      {stripe.plan_counts && Object.keys(stripe.plan_counts).length > 0 && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          {Object.entries(stripe.plan_counts).map(([plan, count]) => (
            <span key={plan} style={{ fontSize: "11px", color: C.muted }}>
              {plan} <strong style={{ color: C.text }}>{count}</strong>
            </span>
          ))}
        </div>
      )}
      {/* Recent events */}
      {stripe.recent_events && stripe.recent_events.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {stripe.recent_events.slice(0, 5).map((ev, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
              <span style={{
                color: ev.type.includes("deleted") ? C.error : ev.type.includes("created") ? C.brand : C.muted,
                fontWeight: 500,
              }}>
                {eventLabel(ev.type)}
              </span>
              <span style={{ color: C.muted }}>{timeAgo(ev.created)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ── Variant table ─────────────────────────────────────────────────────────────

function VariantTable({ voices, variants }: { voices: DashboardData["voices"]; variants: DashboardData["variants"] }) {
  // Group variants by voice
  const byVoice: Record<string, Array<{ variant: string; generations: number }>> = {}
  for (const v of variants) {
    if (!byVoice[v.voice_id]) byVoice[v.voice_id] = []
    byVoice[v.voice_id].push({ variant: v.voice_variant, generations: v.generations })
  }

  return (
    <Card style={{ marginTop: "12px" }}>
      <Label>Variant Breakdown</Label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
        {voices.map((voice) => {
          const voiceVariants = byVoice[voice.voice_id] ?? []
          const total = voiceVariants.reduce((a, v) => a + v.generations, 0) || 1
          return (
            <div key={voice.voice_id}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: C.text, margin: "0 0 8px", textTransform: "capitalize" }}>
                {voice.voice_id}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {voiceVariants.sort((a, b) => b.generations - a.generations).map((v) => (
                  <div key={v.variant}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "2px" }}>
                      <span style={{ color: C.muted }}>{v.variant}</span>
                      <span style={{ color: C.text, fontWeight: 500 }}>{v.generations}</span>
                    </div>
                    <div style={{ height: "3px", background: C.subtle, borderRadius: "2px" }}>
                      <div style={{ height: "100%", width: `${(v.generations / total) * 100}%`, background: C.brand, borderRadius: "2px" }} />
                    </div>
                  </div>
                ))}
                {voiceVariants.length === 0 && <span style={{ fontSize: "11px", color: C.muted }}>No data</span>}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── Error state ───────────────────────────────────────────────────────────────

function ErrorState() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", color: C.muted, textTransform: "uppercase", marginBottom: "16px" }}>
          Lyric Analytics
        </p>
        <p style={{ fontSize: "16px", color: C.text, marginBottom: "8px" }}>Failed to load dashboard data</p>
        <p style={{ fontSize: "13px", color: C.muted }}>Check that COMPOSER_API_URL and ANALYTICS_SECRET are set correctly.</p>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function DashboardInner({ data, range }: { data: DashboardData; range: number }) {
  return (
    <div style={{ minHeight: "100vh", padding: "0 0 80px" }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(18,16,15,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "56px",
      }}>
        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", color: C.text, textTransform: "uppercase" }}>
          Lyric Analytics
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "11px", color: C.muted }}>
            Updated {timeAgo(data.generated_at)}
          </span>
          <RangeToggle current={range} />
        </div>
      </div>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 32px 0" }}>

        {/* Overview */}
        <OverviewBar data={data} />

        {/* Trend chart */}
        <Card style={{ marginTop: "24px" }}>
          <Label>Daily Trend · Last {range}d</Label>
          <TrendChart data={data.daily_trend} />
        </Card>

        {/* Clerk + Stripe */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
          <ClerkCard clerk={data.clerk} />
          <StripeCard stripe={data.stripe} />
        </div>

        {/* Voice breakdown */}
        <Card style={{ marginTop: "16px" }}>
          <Label>Voice Breakdown</Label>
          <VoiceChart data={data.voices} />
        </Card>

        <VariantTable voices={data.voices} variants={data.variants} />

        {/* Emotional directions */}
        <Card style={{ marginTop: "12px" }}>
          <Label>Emotional Directions</Label>
          <EmotionalChart data={data.emotional_directions} />
        </Card>

        {/* Plan breakdown */}
        <Card style={{ marginTop: "12px" }}>
          <Label>Plan Breakdown</Label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
            {data.plan_breakdown.map((row) => (
              <div key={row.plan_tier}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: C.brand, textTransform: "capitalize", margin: "0 0 6px" }}>{row.plan_tier}</p>
                <div style={{ fontSize: "12px", color: C.muted, display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span>Generations: <strong style={{ color: C.text }}>{fmtNum(row.generations)}</strong></span>
                  <span>Downloads: <strong style={{ color: C.text }}>{fmtNum(row.downloads)}</strong></span>
                  <span>Users: <strong style={{ color: C.text }}>{fmtNum(row.unique_users)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Latency footer */}
        <div style={{ display: "flex", gap: "24px", marginTop: "16px", justifyContent: "flex-end" }}>
          {[
            ["avg latency", fmtMs(data.latency.avg_ms)],
            ["p50", fmtMs(data.latency.p50_ms)],
            ["p95", fmtMs(data.latency.p95_ms)],
          ].map(([label, val]) => (
            <span key={label} style={{ fontSize: "11px", color: C.muted }}>
              {label} <strong style={{ color: C.text }}>{val}</strong>
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
