"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import type { DashboardData } from "../types"
import { TrendChart } from "./TrendChart"
import { VoiceChart } from "./VoiceChart"
import { EmotionalChart } from "./EmotionalChart"
import { PlanDonut, RevenuePlanDonut } from "./PlanDonut"
import { VoiceBarChart } from "./VoiceBarChart"
import { TrialFunnelChart, IntentBarChart, VoiceAffinityBarChart } from "./FunnelChart"
import { GenomeBarChart, UseCaseHeatmap } from "./GenomeChart"
import { ErrorBoundary } from "./ErrorBoundary"

// ── Design tokens (dark-first) ──────────────────────────────────────────────────

const C = {
  bg: "#2b2a25",
  panel: "rgba(245,243,239,0.03)",
  panelHero: "rgba(245,243,239,0.06)",
  border: "rgba(245,243,239,0.08)",
  borderStrong: "rgba(245,243,239,0.14)",
  gold: "#c9a96e",
  goldDim: "rgba(201,169,110,0.18)",
  goldGlow: "rgba(201,169,110,0.12)",
  text: "#f5f3ef",
  muted: "rgba(245,243,239,0.5)",
  faint: "rgba(245,243,239,0.06)",
  error: "#b54a2e",
  good: "#4a7c59",
}

// ── Voice name mapping ────────────────────────────────────────────────────────────

const VOICE_NAMES: Record<string, string> = {
  "morgan-anchor":  "Morgan · The Anchor",
  "nova-intimist":  "Nova · The Intimist",
  "atlas-guide":    "Atlas · The Guide",
  "riven-narrator": "Riven · The Narrator",
  "hex-wildcard":   "Hex · The Wildcard",
}

function formatVoiceName(voiceId: string): string {
  return VOICE_NAMES[voiceId] ?? voiceId
}

// ── Price ID mapping ──────────────────────────────────────────────────────────────

const PRICE_ID_TO_PLAN: Record<string, string> = {
  "Price_1Ss1jqRr73DR28HOvpgtZDC": "Creator",
}

function formatPlanName(planId: string): string {
  if (!planId || planId === "unknown") return "Trial"
  return PRICE_ID_TO_PLAN[planId] ?? planId
}

// ── Formatters ────────────────────────────────────────────────────────────────────

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

function fmtPct(n: number | undefined | null): string {
  if (n == null) return "—"
  return `${n}%`
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

// ── Primitives ────────────────────────────────────────────────────────────────────

function Panel({ children, style, glow }: { children: React.ReactNode; style?: React.CSSProperties; glow?: boolean }) {
  return (
    <div style={{
      background: glow ? C.panelHero : C.panel,
      border: `1px solid ${glow ? C.borderStrong : C.border}`,
      borderLeft: glow ? `3px solid ${C.gold}` : `1px solid ${glow ? C.borderStrong : C.border}`,
      padding: "32px 36px",
      boxShadow: glow ? `0 0 40px ${C.goldGlow}, inset 0 1px 0 rgba(245,243,239,0.04)` : `inset 0 1px 0 rgba(245,243,239,0.02)`,
      ...style,
    }}>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em",
      color: C.muted, textTransform: "uppercase", margin: "0 0 24px",
      fontFamily: "'Agrandir Narrow', sans-serif",
    }}>
      {children}
    </p>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: "18px", fontWeight: 400, letterSpacing: "-0.01em",
      color: C.text, margin: "8px 0 20px",
      fontFamily: "'Agrandir', sans-serif",
    }}>
      {children}
    </h3>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent, display, glow,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
  display?: boolean
  glow?: boolean
}) {
  return (
    <Panel glow={glow} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "120px" }}>
      <p style={{
        fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em",
        color: C.muted, textTransform: "uppercase", margin: 0,
        fontFamily: "'Agrandir Narrow', sans-serif",
      }}>
        {label}
      </p>
      <div>
        <p style={{
          fontSize: display ? "52px" : "32px",
          fontWeight: display ? 300 : 500,
          fontFamily: display ? "'Cormorant Garamond', Georgia, serif" : "'Agrandir', sans-serif",
          fontVariantNumeric: display ? "lining-nums tabular-nums" : "inherit",
          letterSpacing: display ? "-0.02em" : "-0.01em",
          color: accent ? C.gold : C.text,
          margin: 0, lineHeight: 1,
        }}>
          {value}
        </p>
        {sub && <p style={{ fontSize: "12px", color: C.muted, margin: "8px 0 0", fontFamily: "'Agrandir Narrow', sans-serif" }}>{sub}</p>}
      </div>
    </Panel>
  )
}

// ── Range toggle ──────────────────────────────────────────────────────────────────

function RangeToggle({ current }: { current: number }) {
  const router = useRouter()
  return (
    <div style={{ display: "flex", gap: "2px", background: "rgba(245,243,239,0.06)", padding: "3px" }}>
      {[7, 30, 90].map((n) => (
        <button
          key={n}
          onClick={() => router.push(`/?range=${n}`)}
          style={{
            padding: "5px 14px",
            border: "none",
            background: n === current ? "rgba(245,243,239,0.12)" : "transparent",
            color: n === current ? C.text : C.muted,
            fontSize: "11px", fontWeight: n === current ? 600 : 400,
            letterSpacing: "0.04em",
            cursor: "pointer",
            fontFamily: "'Agrandir Narrow', sans-serif",
          }}
        >
          {n}d
        </button>
      ))}
    </div>
  )
}

// ── Tab nav ───────────────────────────────────────────────────────────────────────

const TABS = ["Overview", "Voices", "Trial", "Revenue", "Voice Genome"] as const
type Tab = typeof TABS[number]

function TabNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div style={{ display: "flex", gap: "0", borderBottom: `1px solid rgba(245,243,239,0.08)`, marginBottom: "0" }}>
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            padding: "16px 22px",
            border: "none",
            borderBottom: active === tab ? `2px solid ${C.gold}` : "2px solid transparent",
            background: "transparent",
            color: active === tab ? C.text : C.muted,
            fontSize: "12px",
            fontWeight: active === tab ? 600 : 400,
            letterSpacing: "0.06em",
            cursor: "pointer",
            marginBottom: "-1px",
            fontFamily: "'Agrandir', sans-serif",
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

// ── Overview tab ──────────────────────────────────────────────────────────────────

function OverviewTab({ data, range }: { data: DashboardData; range: number }) {
  const { overview, latency } = data
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", gap: "12px" }}>
        <StatCard label="Generations" value={fmtNum(overview.total_generations)} display accent glow />
        <StatCard label="Downloads" value={fmtNum(overview.total_downloads)} />
        <StatCard label="Unique Users" value={fmtNum(overview.unique_users)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        <StatCard label="Audio Generated" value={fmtAudio(overview.total_audio_seconds)} />
        <StatCard label="Characters" value={fmtNum(overview.total_characters)} />
        <StatCard
          label="Median Latency"
          value={fmtMs(latency.p50_ms)}
          sub={latency.p95_ms ? `p95 ${fmtMs(latency.p95_ms)}` : undefined}
        />
      </div>

      {/* Trend chart */}
      <Panel>
        <Label>Daily trend · last {range}d</Label>
        <TrendChart data={data.daily_trend} />
      </Panel>

      {/* Plan breakdown donut */}
      {data.plan_breakdown.length > 0 && (
        <Panel>
          <Label>Generations by plan</Label>
          <PlanDonut data={data.plan_breakdown} formatPlanName={(t) => t} />
        </Panel>
      )}

      {/* Latency footnote */}
      <div style={{ display: "flex", gap: "24px", justifyContent: "flex-end", paddingRight: "2px", paddingTop: "4px" }}>
        {([["avg", latency.avg_ms], ["p50", latency.p50_ms], ["p95", latency.p95_ms]] as [string, number | null][]).map(([l, v]) => (
          <span key={l} style={{ fontSize: "11px", color: C.muted, fontFamily: "'Agrandir Narrow', sans-serif" }}>
            {l} <strong style={{ color: C.text, fontWeight: 500 }}>{fmtMs(v)}</strong>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Voices tab ────────────────────────────────────────────────────────────────────

function VoicesTab({ data }: { data: DashboardData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Voice generation comparison */}
      {data.voices.length > 0 && (
        <Panel>
          <Label>Voice performance</Label>
          <VoiceBarChart data={data.voices} />
        </Panel>
      )}

      {/* Voice detail cards */}
      <SectionHeader>Voice details</SectionHeader>
      <VoiceChart data={data.voices} variants={data.variants} />

      {/* Emotional directions */}
      {data.emotional_directions.length > 0 && (
        <div style={{ marginTop: "8px" }}>
          <Panel>
            <Label>Emotional directions</Label>
            <EmotionalChart data={data.emotional_directions} />
          </Panel>
        </div>
      )}
    </div>
  )
}

// ── Trial tab ─────────────────────────────────────────────────────────────────────

function TrialTab({ data }: { data: DashboardData }) {
  const { trial } = data
  if (trial.error) {
    return <Panel><p style={{ fontSize: "13px", color: C.error }}>{trial.error}</p></Panel>
  }

  const funnel = trial.funnel
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Funnel stat cards */}
      {funnel && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
          {([
            ["Trials", fmtNum(funnel.total_trials), false, false],
            ["Converted", fmtNum(funnel.converted), true, true],
            ["Cancelled", fmtNum(funnel.cancelled), false, false],
            ["Expired", fmtNum(funnel.expired), false, false],
            ["Conv. Rate", fmtPct(funnel.conversion_rate), true, true],
          ] as [string, string, boolean, boolean][]).map(([label, value, accent, glow]) => (
            <StatCard key={label} label={label} value={value} accent={accent} glow={glow} />
          ))}
        </div>
      )}

      {/* Visual funnel chart */}
      {funnel && (
        <Panel>
          <Label>Trial funnel</Label>
          <TrialFunnelChart funnel={funnel} />
        </Panel>
      )}

      {/* Intent conversion bars */}
      {trial.intent_breakdown && trial.intent_breakdown.length > 0 && (
        <Panel>
          <Label>Conversion rate by intent</Label>
          <IntentBarChart data={trial.intent_breakdown} />
        </Panel>
      )}

      {/* Voice affinity bars */}
      {trial.voice_affinity && trial.voice_affinity.length > 0 && (
        <Panel>
          <Label>Conversion by onboarding voice</Label>
          <VoiceAffinityBarChart data={trial.voice_affinity} formatVoiceName={formatVoiceName} />
        </Panel>
      )}
    </div>
  )
}

// ── Revenue tab ───────────────────────────────────────────────────────────────────

function RevenueTab({ data }: { data: DashboardData }) {
  const { stripe, clerk } = data

  function eventLabel(type: string): string {
    return (type ?? "").replace("customer.subscription.", "").replace(/_/g, " ")
  }

  function eventColor(type: string): string {
    if (!type) return C.muted
    if (type.includes("deleted")) return C.error
    if (type.includes("created")) return C.good
    return C.muted
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* MRR hero + subs */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", gap: "12px" }}>
        <StatCard label="MRR" value={fmtMoney(stripe?.mrr)} display accent glow />
        <StatCard label="Active Subscriptions" value={fmtNum(stripe?.active_subscriptions)} />
        <StatCard label="Revenue Last 30d" value={fmtMoney(stripe?.revenue_last_30d)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {/* Plan distribution donut */}
        {stripe?.plan_counts && Object.keys(stripe.plan_counts).length > 0 && (
          <Panel>
            <Label>Active by plan</Label>
            <ErrorBoundary>
              <RevenuePlanDonut planCounts={stripe.plan_counts} formatPlanName={formatPlanName} />
            </ErrorBoundary>
          </Panel>
        )}

        {/* Subscription events timeline */}
        {stripe?.recent_events && stripe.recent_events.length > 0 && (
          <Panel>
            <Label>Recent subscription events</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {stripe.recent_events.slice(0, 8).map((ev, i) => {
                if (!ev) return null
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 0",
                    borderBottom: i < 7 ? `1px solid ${C.faint}` : "none",
                  }}>
                    {/* Colored dot */}
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: eventColor(ev.type),
                      flexShrink: 0,
                      boxShadow: ev.type?.includes("created") ? `0 0 8px rgba(74,124,89,0.4)` : ev.type?.includes("deleted") ? `0 0 8px rgba(181,74,46,0.3)` : "none",
                    }} />
                    <span style={{
                      fontSize: "13px", fontWeight: 500, flex: 1,
                      color: C.text,
                      fontFamily: "'Agrandir', sans-serif",
                      textTransform: "capitalize",
                    }}>
                      {eventLabel(ev.type)}
                    </span>
                    <span style={{ fontSize: "11px", color: C.muted, fontFamily: "'Agrandir Narrow', sans-serif" }}>
                      {ev.created ? timeAgo(ev.created) : ""}
                    </span>
                  </div>
                )
              })}
            </div>
          </Panel>
        )}
      </div>

      {/* Stripe error note */}
      {stripe?.error && (
        <div style={{ padding: "4px 0" }}>
          <p style={{ fontSize: "11px", color: C.muted, fontStyle: "italic" }}>
            Note: Some Stripe data may be incomplete — {stripe.error}
          </p>
        </div>
      )}

      {/* Clerk users */}
      {clerk && !clerk.error && (
        <Panel>
          <Label>Users · Clerk</Label>
          <div style={{ display: "flex", gap: "48px", alignItems: "flex-end", marginBottom: "28px" }}>
            <div>
              <p style={{
                fontSize: "52px", fontWeight: 300, letterSpacing: "-0.02em",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontVariantNumeric: "lining-nums tabular-nums",
                color: C.text, margin: "0 0 4px", lineHeight: 1,
              }}>
                {fmtNum(clerk.total_users)}
              </p>
              <p style={{ fontSize: "12px", color: C.muted, margin: 0, fontFamily: "'Agrandir Narrow', sans-serif" }}>total users</p>
            </div>
            <div style={{ paddingBottom: "4px" }}>
              <p style={{
                fontSize: "28px", fontWeight: 400, letterSpacing: "-0.02em",
                color: C.good, margin: "0 0 4px", lineHeight: 1,
                fontFamily: "'Agrandir', sans-serif",
              }}>
                +{fmtNum(clerk.new_users_last_30d)}
              </p>
              <p style={{ fontSize: "12px", color: C.muted, margin: 0, fontFamily: "'Agrandir Narrow', sans-serif" }}>last 30d</p>
            </div>
          </div>

          {clerk.plan_distribution && (() => {
            const dist = clerk.plan_distribution!
            const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1
            const planOrder = ["enterprise", "studio", "creator", "unknown"]
            const planColor: Record<string, string> = {
              enterprise: C.gold,
              studio: "rgba(201,169,110,0.65)",
              creator: "rgba(201,169,110,0.35)",
              unknown: "rgba(245,243,239,0.12)",
            }
            return (
              <>
                <div style={{ display: "flex", height: "4px", gap: "2px", marginBottom: "16px" }}>
                  {planOrder.filter((p) => dist[p]).map((p) => (
                    <div key={p} style={{ flex: dist[p] / total, background: planColor[p], borderRadius: "2px" }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  {planOrder.filter((p) => dist[p]).map((p) => (
                    <span key={p} style={{ fontSize: "12px", color: C.muted, fontFamily: "'Agrandir Narrow', sans-serif" }}>
                      <span style={{ color: planColor[p], marginRight: "6px" }}>●</span>
                      {formatPlanName(p)} <strong style={{ color: C.text, fontWeight: 500 }}>{dist[p]}</strong>
                    </span>
                  ))}
                </div>
              </>
            )
          })()}
        </Panel>
      )}
    </div>
  )
}

// ── Voice Genome tab ──────────────────────────────────────────────────────────────

function VoiceGenomeTab({ data }: { data: DashboardData }) {
  const genome = data.genome
  if (!genome || genome.error) {
    return (
      <Panel>
        <p style={{ fontSize: "13px", color: C.muted }}>
          {genome?.error ?? "No genome data yet — data will appear after the first generation."}
        </p>
      </Panel>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Download vs Regen rate chart */}
      {genome.download_performance && genome.download_performance.length > 0 && (
        <Panel>
          <Label>Download vs regeneration rate by voice</Label>
          <GenomeBarChart data={genome.download_performance} />
        </Panel>
      )}

      {/* Detail table */}
      {genome.download_performance && genome.download_performance.length > 0 && (
        <Panel>
          <Label>Performance detail</Label>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Voice", "Variant", "Generations", "Downloads", "DL Rate", "Regens", "Regen Rate"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", fontSize: "10px", fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: C.muted, paddingBottom: "14px",
                      borderBottom: `1px solid ${C.border}`,
                      fontFamily: "'Agrandir Narrow', sans-serif",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {genome.download_performance.map((row, i) => (
                  <tr key={i}>
                    {[
                      formatVoiceName(row.voice_id),
                      row.variant,
                      fmtNum(row.total_generations),
                      fmtNum(row.downloads),
                      fmtPct(row.download_rate),
                      fmtNum(row.regenerations),
                      fmtPct(row.regeneration_rate),
                    ].map((val, j) => (
                      <td key={j} style={{
                        fontSize: "13px", padding: "14px 8px 14px 0",
                        color: j === 0 ? C.text : j === 4 ? C.good : j === 6 ? C.error : C.muted,
                        fontWeight: j === 0 ? 500 : 400,
                        borderBottom: `1px solid ${C.faint}`,
                        fontFamily: j === 0 ? "'Agrandir', sans-serif" : "inherit",
                      }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Use case heatmap */}
      {genome.use_case_breakdown && genome.use_case_breakdown.length > 0 && (
        <Panel>
          <Label>Use case × voice performance</Label>
          <UseCaseHeatmap data={genome.use_case_breakdown} formatVoiceName={formatVoiceName} />
        </Panel>
      )}

      {(!genome.download_performance?.length && !genome.use_case_breakdown?.length) && (
        <Panel>
          <p style={{ fontSize: "13px", color: C.muted, margin: 0 }}>
            No genome data yet — data will appear after the first generation.
          </p>
        </Panel>
      )}
    </div>
  )
}

// ── Error state ───────────────────────────────────────────────────────────────────

function ErrorState() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <div style={{ textAlign: "center", maxWidth: "360px" }}>
        <p style={{
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em",
          color: C.muted, textTransform: "uppercase", marginBottom: "24px",
          fontFamily: "'Agrandir Narrow', sans-serif",
        }}>
          Lyric Analytics
        </p>
        <p style={{
          fontSize: "20px", color: C.text, marginBottom: "12px",
          letterSpacing: "-0.01em", fontFamily: "'Agrandir', sans-serif",
        }}>
          Failed to load dashboard data
        </p>
        <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.7 }}>
          Check that COMPOSER_API_URL and ANALYTICS_SECRET are set correctly.
        </p>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────────

function DashboardInner({ data, range }: { data: DashboardData; range: number }) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview")

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: "80px" }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: C.bg,
        borderBottom: `1px solid rgba(245,243,239,0.06)`,
        padding: "0 48px",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "60px",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "22px", fontWeight: 400, letterSpacing: "0.02em",
              color: C.gold,
            }}>
              lyric
            </span>
            <span style={{
              fontSize: "11px", fontWeight: 400, letterSpacing: "0.12em",
              color: C.muted, textTransform: "uppercase",
              fontFamily: "'Agrandir Narrow', sans-serif",
            }}>
              analytics
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span style={{ fontSize: "11px", color: C.muted, fontFamily: "'Agrandir Narrow', sans-serif" }}>
              {timeAgo(data.generated_at)}
            </span>
            <RangeToggle current={range} />
          </div>
        </div>
        <TabNav active={activeTab} onChange={setActiveTab} />
      </div>

      <div style={{ maxWidth: "1360px", margin: "0 auto", padding: "36px 48px 0" }}>
        {activeTab === "Overview"     && <OverviewTab data={data} range={range} />}
        {activeTab === "Voices"       && <VoicesTab data={data} />}
        {activeTab === "Trial"        && <TrialTab data={data} />}
        {activeTab === "Revenue"      && <ErrorBoundary><RevenueTab data={data} /></ErrorBoundary>}
        {activeTab === "Voice Genome" && <VoiceGenomeTab data={data} />}
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
