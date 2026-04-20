"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

const GOLD = "#c9a96e"
const ERROR = "#b54a2e"
const TEXT = "#f5f3ef"
const MUTED = "rgba(245,243,239,0.5)"
const BORDER = "rgba(245,243,239,0.08)"

function formatDate(d: string) {
  const date = new Date(d)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function ErrorTrendChart({ data }: { data: Array<{ date: string; errors: number }> }) {
  if (!data?.length) {
    return <p style={{ fontSize: "13px", color: MUTED, margin: 0 }}>No errors in selected range.</p>
  }
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ERROR} stopOpacity={0.5} />
              <stop offset="100%" stopColor={ERROR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={BORDER} strokeDasharray="2 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke={MUTED}
            tick={{ fill: MUTED, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis stroke={MUTED} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#1f1e1a", border: `1px solid ${BORDER}`, color: TEXT, fontSize: 12 }}
            labelFormatter={formatDate}
          />
          <Area type="monotone" dataKey="errors" stroke={ERROR} strokeWidth={2} fill="url(#errGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DAUChart({ data }: { data: Array<{ date: string; active_users: number }> }) {
  if (!data?.length) {
    return <p style={{ fontSize: "13px", color: MUTED, margin: 0 }}>No session data yet.</p>
  }
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GOLD} stopOpacity={0.5} />
              <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={BORDER} strokeDasharray="2 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke={MUTED}
            tick={{ fill: MUTED, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis stroke={MUTED} tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#1f1e1a", border: `1px solid ${BORDER}`, color: TEXT, fontSize: 12 }}
            labelFormatter={formatDate}
          />
          <Area type="monotone" dataKey="active_users" stroke={GOLD} strokeWidth={2} fill="url(#dauGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface OnboardingFunnelProps {
  step_1: number
  step_2: number
  step_3: number
  step_4: number
  step_5: number
  completed: number
}

export function OnboardingFunnelChart({ data }: { data: OnboardingFunnelProps }) {
  const rows = [
    { label: "Step 1 · Welcome",         value: data.step_1 },
    { label: "Step 2 · How it works",    value: data.step_2 },
    { label: "Step 3 · Use case",        value: data.step_3 },
    { label: "Step 4 · Voice",           value: data.step_4 },
    { label: "Step 5 · Variant",         value: data.step_5 },
    { label: "Completed",                value: data.completed },
  ]
  const max = Math.max(...rows.map((r) => r.value), 1)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {rows.map((row, i) => {
        const pct = (row.value / max) * 100
        const isLast = i === rows.length - 1
        const retention = i === 0 || rows[0].value === 0 ? 100 : Math.round((row.value / rows[0].value) * 100)
        return (
          <div key={row.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
              <span style={{ color: TEXT, fontFamily: "'Agrandir', sans-serif" }}>{row.label}</span>
              <span style={{ color: MUTED }}>
                <strong style={{ color: TEXT, fontWeight: 500 }}>{row.value.toLocaleString()}</strong>
                {i > 0 && <span style={{ marginLeft: "12px" }}>{retention}%</span>}
              </span>
            </div>
            <div style={{ height: "8px", background: "rgba(245,243,239,0.06)", borderRadius: "2px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: isLast ? GOLD : `rgba(201,169,110,${0.35 + i * 0.08})`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface CheckoutFunnelProps {
  started: number
  completed: number
  completion_rate: number | null
}

export function CheckoutFunnelChart({ data }: { data: CheckoutFunnelProps }) {
  const abandoned = Math.max(0, (data.started ?? 0) - (data.completed ?? 0))
  const startedPct = 100
  const completedPct = data.started ? ((data.completed ?? 0) / data.started) * 100 : 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
          <span style={{ color: TEXT, fontFamily: "'Agrandir', sans-serif" }}>Checkout started</span>
          <span style={{ color: TEXT, fontWeight: 500 }}>{(data.started ?? 0).toLocaleString()}</span>
        </div>
        <div style={{ height: "10px", background: "rgba(245,243,239,0.06)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${startedPct}%`, background: "rgba(201,169,110,0.35)" }} />
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
          <span style={{ color: TEXT, fontFamily: "'Agrandir', sans-serif" }}>Checkout completed</span>
          <span style={{ color: TEXT, fontWeight: 500 }}>{(data.completed ?? 0).toLocaleString()}</span>
        </div>
        <div style={{ height: "10px", background: "rgba(245,243,239,0.06)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${completedPct}%`, background: GOLD }} />
        </div>
      </div>

      {abandoned > 0 && (
        <p style={{ fontSize: "11px", color: MUTED, margin: "4px 0 0", fontFamily: "'Agrandir Narrow', sans-serif" }}>
          {abandoned.toLocaleString()} abandoned · {data.completion_rate != null ? `${data.completion_rate}%` : "—"} completion rate
        </p>
      )}
    </div>
  )
}
