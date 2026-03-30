"use client"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import type { DashboardData } from "../types"

const C = {
  gold: "#c9a96e",
  good: "#4a7c59",
  error: "#b54a2e",
  muted: "rgba(245,243,239,0.4)",
  faint: "rgba(245,243,239,0.12)",
  text: "#f5f3ef",
  tooltipBg: "#35342f",
  tooltipBorder: "rgba(245,243,239,0.12)",
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function SimpleTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: C.tooltipBg,
      border: `1px solid ${C.tooltipBorder}`,
      padding: "10px 14px",
    }}>
      <p style={{ fontSize: "12px", color: C.text, margin: "0 0 2px", fontWeight: 500 }}>{d.name}</p>
      <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>{Number(d.value).toLocaleString()}</p>
    </div>
  )
}

function RateTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: C.tooltipBg,
      border: `1px solid ${C.tooltipBorder}`,
      padding: "10px 14px",
    }}>
      <p style={{ fontSize: "12px", color: C.text, margin: "0 0 4px", fontWeight: 500 }}>{d.name}</p>
      <p style={{ fontSize: "11px", color: C.muted, margin: "0 0 2px" }}>Conv. rate: <strong style={{ color: C.good }}>{d.rate}%</strong></p>
      <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>{d.converted} of {d.total} users</p>
    </div>
  )
}

interface FunnelProps {
  funnel: NonNullable<DashboardData["trial"]["funnel"]>
}

export function TrialFunnelChart({ funnel }: FunnelProps) {
  const data = [
    { name: "Trials", value: funnel.total_trials, color: C.gold },
    { name: "Converted", value: funnel.converted, color: C.good },
    { name: "Cancelled", value: funnel.cancelled, color: C.faint },
    { name: "Expired", value: funnel.expired, color: C.error },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: C.muted, fontFamily: "'Agrandir Narrow', sans-serif" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: C.muted, fontFamily: "'Agrandir Narrow', sans-serif" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<SimpleTooltip />} cursor={{ fill: "rgba(245,243,239,0.03)" }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={48}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} fillOpacity={d.color === C.faint ? 1 : 0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

interface IntentBarProps {
  data: NonNullable<DashboardData["trial"]["intent_breakdown"]>
}

export function IntentBarChart({ data }: IntentBarProps) {
  if (!data || data.length === 0) return null

  const chartData = data.map((d) => ({
    name: d.onboarding_intent,
    rate: Number(d.conversion_rate) || 0,
    converted: d.converted,
    total: d.total_users,
  }))

  return (
    <ResponsiveContainer width="100%" height={data.length * 52 + 20}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="intentGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.good} stopOpacity={0.7} />
            <stop offset="100%" stopColor={C.good} stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: C.muted, fontFamily: "'Agrandir Narrow', sans-serif" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: C.text, fontFamily: "'Agrandir', sans-serif" }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip content={<RateTooltip />} cursor={{ fill: "rgba(245,243,239,0.03)" }} />
        <Bar dataKey="rate" fill="url(#intentGradient)" radius={[0, 4, 4, 0]} barSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface VoiceAffinityBarProps {
  data: NonNullable<DashboardData["trial"]["voice_affinity"]>
  formatVoiceName: (id: string) => string
}

export function VoiceAffinityBarChart({ data, formatVoiceName }: VoiceAffinityBarProps) {
  if (!data || data.length === 0) return null

  const chartData = data.map((d) => ({
    name: formatVoiceName(d.onboarding_voice),
    rate: Number(d.conversion_rate) || 0,
    converted: d.converted,
    total: d.total_users,
  }))

  return (
    <ResponsiveContainer width="100%" height={data.length * 52 + 20}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="affinityGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.gold} stopOpacity={0.7} />
            <stop offset="100%" stopColor={C.gold} stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: C.muted, fontFamily: "'Agrandir Narrow', sans-serif" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: C.text, fontFamily: "'Agrandir', sans-serif" }}
          axisLine={false}
          tickLine={false}
          width={160}
        />
        <Tooltip content={<RateTooltip />} cursor={{ fill: "rgba(245,243,239,0.03)" }} />
        <Bar dataKey="rate" fill="url(#affinityGradient)" radius={[0, 4, 4, 0]} barSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}
