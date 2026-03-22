"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import type { DashboardData } from "../types"
import { TrendChart } from "./TrendChart"

// ── Design tokens ───────────────────────────────────────────────────────────────

const C = {
  bg: "#2b2a25",
  card: "#f5f3ef",
  cardAlt: "#edeae4",
  border: "rgba(43,42,37,0.12)",
  borderStrong: "rgba(43,42,37,0.22)",
  gold: "#c9a96e",
  goldDim: "rgba(201,169,110,0.18)",
  text: "#2b2a25",
  muted: "rgba(43,42,37,0.45)",
  faint: "rgba(43,42,37,0.07)",
  inverse: "#f5f3ef",
  inverseMuted: "rgba(245,243,239,0.45)",
  error: "#b54a2e",
  good: "#4a7c59",
}

// ── Formatters ──────────────────────────────────────────────────────────────────

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

// ── Primitives ───────────────────────────────────────────────────────────────────

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      padding: "28px 32px",
      ...style,
    }}>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em",
      color: C.muted, textTransform: "uppercase", margin: "0 0 20px",
    }}>
      {children}
    </p>
  )
}

// ── Stat card ────────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent, display,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
  display?: boolean
}) {
  return (
    <Panel style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "110px" }}>
      <p style={{
        fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em",
        color: C.muted, textTransform: "uppercase", margin: 0,
      }}>
        {label}
      </p>
      <div>
        <p style={{
          fontSize: display ? "52px" : "30px",
          fontWeight: display ? 300 : 500,
          fontFamily: display ? "'Cormorant Garamond', Georgia, serif" : "inherit",
          letterSpacing: display ? "-0.02em" : "-0.02em",
          color: accent ? C.gold : C.text,
          margin: 0, lineHeight: 1,
        }}>
          {value}
        </p>
        {sub && <p style={{ fontSize: "11px", color: C.muted, margin: "6px 0 0" }}>{sub}</p>}
      </div>
    </Panel>
  )
}

// ── Range toggle ─────────────────────────────────────────────────────────────────

function RangeToggle({ current }: { current: number }) {
  const router = useRouter()
  return (
    <div style={{ display: "flex", gap: "2px", background: "rgba(245,243,239,0.1)", padding: "3px" }}>
      {[7, 30, 90].map((n) => (
        <button
          key={n}
          onClick={() => router.push(`/?range=${n}`)}
          style={{
            padding: "4px 12px",
            border: "none",
            background: n === current ? C.inverse : "transparent",
            color: n === current ? C.text : C.inverseMuted,
            fontSize: "11px", fontWeight: n === current ? 600 : 400,
            letterSpacing: "0.04em",
            cursor: "pointer",
          }}
        >
          {n}d
        </button>
      ))}
    </div>
  )
}

// ── Tab nav ──────────────────────────────────────────────────────────────────────

const TABS = ["Overview", "Voices", "Trial", "Revenue", "Voice Genome"] as const
type Tab = typeof TABS[number]

function TabNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div style={{ display: "flex", gap: "0", borderBottom: `1px solid rgba(245,243,239,0.12)`, marginBottom: "0" }}>
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            padding: "14px 20px",
            border: "none",
            borderBottom: active === tab ? `2px solid ${C.gold}` : "2px solid transparent",
            background: "transparent",
            color: active === tab ? C.inverse : C.inverseMuted,
            fontSize: "12px",
            fontWeight: active === tab ? 600 : 400,
            letterSpacing: "0.04em",
            cursor: "pointer",
            marginBottom: "-1px",
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

// ── Overview tab ─────────────────────────────────────────────────────────────────

function OverviewTab({ data, range }: { data: DashboardData; range: number }) {
  const { overview, latency } = data
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", gap: "10px" }}>
        <StatCard label="Generations" value={fmtNum(overview.total_generations)} display accent={false} />
        <StatCard label="Downloads" value={fmtNum(overview.total_downloads)} />
        <StatCard label="Unique Users" value={fmtNum(overview.unique_users)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
        <StatCard label="Audio Generated" value={fmtAudio(overview.total_audio_seconds)} />
        <StatCard label="Characters" value={fmtNum(overview.total_characters)} />
        <StatCard
          label="Median Latency"
          value={fmtMs(latency.p50_ms)}
          sub={latency.p95_ms ? `p95 ${fmtMs(latency.p95_ms)}` : undefined}
        />
      </div>

      {/* Trend */}
      <Panel>
        <Label>Daily trend · last {range}d</Label>
        <TrendChart data={data.daily_trend} />
      </Panel>

      {/* Plan breakdown */}
      {data.plan_breakdown.length > 0 && (
        <Panel>
          <Label>By plan</Label>
          <div style={{ display: "flex", gap: "40px" }}>
            {data.plan_breakdown.map((row) => (
              <div key={row.plan_tier} style={{ flex: 1 }}>
                <p style={{
                  fontSize: "10px", fontWeight: 700, color: C.gold,
                  textTransform: "capitalize", letterSpacing: "0.1em", margin: "0 0 14px",
                }}>
                  {row.plan_tier}
                </p>
                {([
                  ["Generations", fmtNum(row.generations)],
                  ["Downloads", fmtNum(row.downloads)],
                  ["Users", fmtNum(row.unique_users)],
                ] as [string, string][]).map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", color: C.muted }}>{l}</span>
                    <span style={{ fontSize: "12px", color: C.text, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Latency footnote */}
      <div style={{ display: "flex", gap: "24px", justifyContent: "flex-end", paddingRight: "2px", paddingTop: "4px" }}>
        {([["avg", latency.avg_ms], ["p50", latency.p50_ms], ["p95", latency.p95_ms]] as [string, number | null][]).map(([l, v]) => (
          <span key={l} style={{ fontSize: "11px", color: C.inverseMuted }}>
            {l} <strong style={{ color: C.inverse, fontWeight: 500 }}>{fmtMs(v)}</strong>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Voices tab ────────────────────────────────────────────────────────────────────

function VoicesTab({ data }: { data: DashboardData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Voice performance */}
      <Panel>
        <Label>Voice performance</Label>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Voice", "Generations", "Downloads", "Unique Users", "Avg Duration"].map((h) => (
                <th key={h} style={{
                  textAlign: "left", fontSize: "9px", fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: C.muted, paddingBottom: "12px",
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.voices.map((row) => (
              <tr key={row.voice_id}>
                {[
                  row.voice_id,
                  fmtNum(row.generations),
                  fmtNum(row.downloads),
                  fmtNum(row.unique_users),
                  fmtAudio(row.avg_audio_s),
                ].map((val, i) => (
                  <td key={i} style={{
                    fontSize: "13px", padding: "10px 0",
                    color: i === 0 ? C.text : C.muted,
                    fontWeight: i === 0 ? 500 : 400,
                    borderBottom: `1px solid ${C.faint}`,
                  }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {/* Variants */}
      {data.variants.length > 0 && (
        <Panel>
          <Label>Variants</Label>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Voice", "Variant", "Generations"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", fontSize: "9px", fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: C.muted, paddingBottom: "12px",
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.variants.map((row, i) => (
                <tr key={i}>
                  {[row.voice_id, row.voice_variant, fmtNum(row.generations)].map((val, j) => (
                    <td key={j} style={{
                      fontSize: "13px", padding: "10px 0",
                      color: j === 0 ? C.text : C.muted,
                      fontWeight: j === 0 ? 500 : 400,
                      borderBottom: `1px solid ${C.faint}`,
                    }}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {/* Emotional directions */}
      {data.emotional_directions.length > 0 && (
        <Panel>
          <Label>Emotional directions</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.emotional_directions.map((row) => (
              <div key={row.emotional_direction}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: C.text, fontWeight: 500 }}>{row.emotional_direction}</span>
                  <span style={{ fontSize: "12px", color: C.muted }}>
                    {fmtNum(row.uses)} uses · {fmtNum(row.unique_users)} users · {fmtPct(row.pct)}
                  </span>
                </div>
                <div style={{ height: "2px", background: C.faint }}>
                  <div style={{ height: "100%", width: `${row.pct}%`, background: C.gold }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Funnel */}
      {funnel && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
          {([
            ["Trials", fmtNum(funnel.total_trials), false],
            ["Converted", fmtNum(funnel.converted), true],
            ["Cancelled", fmtNum(funnel.cancelled), false],
            ["Expired", fmtNum(funnel.expired), false],
            ["Conv. Rate", fmtPct(funnel.conversion_rate), true],
          ] as [string, string, boolean][]).map(([label, value, accent]) => (
            <StatCard key={label} label={label} value={value} accent={accent} />
          ))}
        </div>
      )}

      {/* Intent breakdown */}
      {trial.intent_breakdown && trial.intent_breakdown.length > 0 && (
        <Panel>
          <Label>Conversion by intent</Label>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Intent", "Users", "Converted", "Conv. Rate"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", fontSize: "9px", fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: C.muted, paddingBottom: "12px",
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trial.intent_breakdown.map((row) => (
                <tr key={row.onboarding_intent}>
                  {[
                    row.onboarding_intent,
                    fmtNum(row.total_users),
                    fmtNum(row.converted),
                    fmtPct(row.conversion_rate),
                  ].map((val, i) => (
                    <td key={i} style={{
                      fontSize: "13px", padding: "10px 0",
                      color: i === 0 ? C.text : i === 3 ? C.good : C.muted,
                      fontWeight: i === 0 ? 500 : 400,
                      borderBottom: `1px solid ${C.faint}`,
                    }}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {/* Voice affinity */}
      {trial.voice_affinity && trial.voice_affinity.length > 0 && (
        <Panel>
          <Label>Conversion by onboarding voice</Label>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Voice", "Variant", "Users", "Converted", "Conv. Rate"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", fontSize: "9px", fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: C.muted, paddingBottom: "12px",
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trial.voice_affinity.map((row, i) => (
                <tr key={i}>
                  {[
                    row.onboarding_voice,
                    row.onboarding_variant ?? "—",
                    fmtNum(row.total_users),
                    fmtNum(row.converted),
                    fmtPct(row.conversion_rate),
                  ].map((val, j) => (
                    <td key={j} style={{
                      fontSize: "13px", padding: "10px 0",
                      color: j === 0 ? C.text : j === 4 ? C.good : C.muted,
                      fontWeight: j === 0 ? 500 : 400,
                      borderBottom: `1px solid ${C.faint}`,
                    }}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  )
}

// ── Revenue tab ───────────────────────────────────────────────────────────────────

function RevenueTab({ data }: { data: DashboardData }) {
  const { stripe, clerk } = data

  function eventLabel(type: string): string {
    return type.replace("customer.subscription.", "").replace(/_/g, " ")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* MRR + subs */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", gap: "10px" }}>
        <StatCard label="MRR" value={fmtMoney(stripe.mrr)} display accent />
        <StatCard label="Active Subscriptions" value={fmtNum(stripe.active_subscriptions)} />
        <StatCard label="Revenue Last 30d" value={fmtMoney(stripe.revenue_last_30d)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {/* Plan counts */}
        {stripe.plan_counts && Object.keys(stripe.plan_counts).length > 0 && (
          <Panel>
            <Label>Active by plan</Label>
            {Object.entries(stripe.plan_counts).map(([plan, count]) => (
              <div key={plan} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: C.text, fontWeight: 500, textTransform: "capitalize" }}>{plan}</span>
                <span style={{ fontSize: "13px", color: C.muted }}>{count}</span>
              </div>
            ))}
          </Panel>
        )}

        {/* Recent events */}
        {stripe.recent_events && stripe.recent_events.length > 0 && (
          <Panel>
            <Label>Recent subscription events</Label>
            {stripe.recent_events.slice(0, 8).map((ev, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{
                  fontSize: "12px", fontWeight: 500,
                  color: ev.type.includes("deleted") ? C.error : ev.type.includes("created") ? C.good : C.muted,
                }}>
                  {eventLabel(ev.type)}
                </span>
                <span style={{ fontSize: "11px", color: C.muted }}>{timeAgo(ev.created)}</span>
              </div>
            ))}
          </Panel>
        )}
      </div>

      {/* Clerk users */}
      {!clerk.error && (
        <Panel>
          <Label>Users · Clerk</Label>
          <div style={{ display: "flex", gap: "48px", alignItems: "flex-end", marginBottom: "24px" }}>
            <div>
              <p style={{
                fontSize: "52px", fontWeight: 300, letterSpacing: "-0.02em",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                color: C.text, margin: "0 0 4px", lineHeight: 1,
              }}>
                {fmtNum(clerk.total_users)}
              </p>
              <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>total users</p>
            </div>
            <div style={{ paddingBottom: "4px" }}>
              <p style={{ fontSize: "28px", fontWeight: 400, letterSpacing: "-0.02em", color: C.text, margin: "0 0 4px", lineHeight: 1 }}>
                +{fmtNum(clerk.new_users_last_30d)}
              </p>
              <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>last 30d</p>
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
              unknown: C.faint,
            }
            return (
              <>
                <div style={{ display: "flex", height: "3px", gap: "2px", marginBottom: "14px" }}>
                  {planOrder.filter((p) => dist[p]).map((p) => (
                    <div key={p} style={{ flex: dist[p] / total, background: planColor[p] }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  {planOrder.filter((p) => dist[p]).map((p) => (
                    <span key={p} style={{ fontSize: "11px", color: C.muted }}>
                      <span style={{ color: planColor[p], marginRight: "5px" }}>●</span>
                      {p} <strong style={{ color: C.text, fontWeight: 500 }}>{dist[p]}</strong>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Download + regen performance */}
      {genome.download_performance && genome.download_performance.length > 0 && (
        <Panel>
          <Label>Download &amp; regeneration rate by voice</Label>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Voice", "Variant", "Generations", "Downloads", "DL Rate", "Regens", "Regen Rate"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", fontSize: "9px", fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: C.muted, paddingBottom: "12px",
                    borderBottom: `1px solid ${C.border}`,
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
                    row.voice_id,
                    row.variant,
                    fmtNum(row.total_generations),
                    fmtNum(row.downloads),
                    fmtPct(row.download_rate),
                    fmtNum(row.regenerations),
                    fmtPct(row.regeneration_rate),
                  ].map((val, j) => (
                    <td key={j} style={{
                      fontSize: "13px", padding: "10px 0",
                      color: j === 0 ? C.text : j === 4 ? C.good : j === 6 ? C.error : C.muted,
                      fontWeight: j === 0 ? 500 : 400,
                      borderBottom: `1px solid ${C.faint}`,
                    }}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {/* Use case breakdown */}
      {genome.use_case_breakdown && genome.use_case_breakdown.length > 0 && (
        <Panel>
          <Label>Use case breakdown</Label>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Voice", "Variant", "Use Case", "Gens", "DL Rate", "Avg Marks", "Avg Script", "Avg Duration"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", fontSize: "9px", fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: C.muted, paddingBottom: "12px",
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {genome.use_case_breakdown.map((row, i) => (
                <tr key={i}>
                  {[
                    row.voice_id,
                    row.variant,
                    row.use_case,
                    fmtNum(row.total_generations),
                    fmtPct(row.download_rate),
                    row.avg_direction_marks != null ? Number(row.avg_direction_marks).toFixed(1) : "—",
                    row.avg_script_length != null ? fmtNum(Math.round(Number(row.avg_script_length))) : "—",
                    fmtAudio(row.avg_audio_duration != null ? Number(row.avg_audio_duration) : null),
                  ].map((val, j) => (
                    <td key={j} style={{
                      fontSize: "13px", padding: "10px 0",
                      color: j === 0 ? C.text : C.muted,
                      fontWeight: j === 0 ? 500 : 400,
                      borderBottom: `1px solid ${C.faint}`,
                    }}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
        <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", color: C.inverseMuted, textTransform: "uppercase", marginBottom: "20px" }}>
          Lyric Analytics
        </p>
        <p style={{ fontSize: "18px", color: C.inverse, marginBottom: "10px", letterSpacing: "-0.01em" }}>
          Failed to load dashboard data
        </p>
        <p style={{ fontSize: "13px", color: C.inverseMuted, lineHeight: 1.6 }}>
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
        borderBottom: `1px solid rgba(245,243,239,0.08)`,
        padding: "0 48px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "56px",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "20px", fontWeight: 400, letterSpacing: "0.02em",
              color: C.gold,
            }}>
              lyric
            </span>
            <span style={{
              fontSize: "11px", fontWeight: 400, letterSpacing: "0.1em",
              color: C.inverseMuted, textTransform: "uppercase",
            }}>
              analytics
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span style={{ fontSize: "11px", color: C.inverseMuted }}>
              {timeAgo(data.generated_at)}
            </span>
            <RangeToggle current={range} />
          </div>
        </div>
        <TabNav active={activeTab} onChange={setActiveTab} />
      </div>

      <div style={{ maxWidth: "1360px", margin: "0 auto", padding: "32px 48px 0" }}>
        {activeTab === "Overview"     && <OverviewTab data={data} range={range} />}
        {activeTab === "Voices"       && <VoicesTab data={data} />}
        {activeTab === "Trial"        && <TrialTab data={data} />}
        {activeTab === "Revenue"      && <RevenueTab data={data} />}
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
