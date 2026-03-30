"use client"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import type { DashboardData } from "../types"

const C = {
  gold: "#c9a96e",
  muted: "rgba(245,243,239,0.4)",
  text: "#f5f3ef",
  tooltipBg: "#35342f",
  tooltipBorder: "rgba(245,243,239,0.12)",
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: C.tooltipBg,
      border: `1px solid ${C.tooltipBorder}`,
      padding: "10px 14px",
    }}>
      <p style={{ fontSize: "12px", color: C.text, margin: "0 0 4px", fontWeight: 500 }}>{d.name}</p>
      <p style={{ fontSize: "11px", color: C.muted, margin: "0 0 2px" }}>{Number(d.uses).toLocaleString()} uses · {Number(d.unique_users).toLocaleString()} users</p>
      <p style={{ fontSize: "11px", color: C.gold, margin: 0 }}>{d.pct}%</p>
    </div>
  )
}

export function EmotionalChart({ data }: { data: DashboardData["emotional_directions"] }) {
  if (!data || data.length === 0) {
    return <p style={{ color: C.muted, fontSize: "12px", margin: "8px 0 0" }}>No direction data yet.</p>
  }

  const maxUses = Math.max(...data.map((d) => Number(d.uses)), 1)

  const chartData = data.map((d) => ({
    name: d.emotional_direction,
    uses: Number(d.uses),
    unique_users: Number(d.unique_users),
    pct: Number(d.pct),
    intensity: Number(d.uses) / maxUses,
  }))

  return (
    <ResponsiveContainer width="100%" height={data.length * 44 + 16}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
        <defs>
          {chartData.map((d, i) => (
            <linearGradient key={i} id={`emoBar-${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={C.gold} stopOpacity={0.3 + 0.6 * d.intensity} />
              <stop offset="100%" stopColor={C.gold} stopOpacity={0.08 + 0.2 * d.intensity} />
            </linearGradient>
          ))}
        </defs>
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: C.muted, fontFamily: "'Agrandir Narrow', sans-serif" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: C.text, fontFamily: "'Agrandir', sans-serif" }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(245,243,239,0.03)" }} />
        <Bar dataKey="uses" radius={[0, 4, 4, 0]} barSize={22}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={`url(#emoBar-${i})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
