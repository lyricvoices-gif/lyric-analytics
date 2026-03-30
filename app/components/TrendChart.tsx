"use client"

import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"
import type { DashboardData } from "../types"

const C = {
  gold: "#c9a96e",
  goldFaint: "rgba(201,169,110,0.15)",
  muted: "rgba(245,243,239,0.4)",
  accent: "rgba(245,243,239,0.55)",
  gridLine: "rgba(245,243,239,0.06)",
  tooltipBg: "#35342f",
  tooltipBorder: "rgba(245,243,239,0.12)",
  text: "#f5f3ef",
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: C.tooltipBg,
      border: `1px solid ${C.tooltipBorder}`,
      padding: "12px 16px",
      minWidth: "140px",
    }}>
      <p style={{ fontSize: "11px", color: C.muted, margin: "0 0 8px", fontFamily: "'Agrandir Narrow', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginBottom: "4px" }}>
          <span style={{ fontSize: "12px", color: C.muted }}>{entry.dataKey.replace("_", " ")}</span>
          <span style={{ fontSize: "12px", color: entry.color, fontWeight: 500 }}>{Number(entry.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export function TrendChart({ data }: { data: DashboardData["daily_trend"] }) {
  if (!data || data.length === 0) {
    return <p style={{ color: C.muted, fontSize: "12px", margin: "24px 0 0" }}>No trend data yet.</p>
  }

  const formatted = data.map((d) => ({
    ...d,
    label: formatDate(d.date),
    generations: Number(d.generations),
    downloads: Number(d.downloads),
    unique_users: Number(d.unique_users),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formatted} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.gold} stopOpacity={0.35} />
            <stop offset="100%" stopColor={C.gold} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: C.muted, fontFamily: "'Agrandir Narrow', sans-serif" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: C.muted, fontFamily: "'Agrandir Narrow', sans-serif" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(245,243,239,0.08)" }} />
        <Legend
          wrapperStyle={{ fontSize: "11px", paddingTop: "16px", fontFamily: "'Agrandir Narrow', sans-serif" }}
          formatter={(value: string) => <span style={{ color: C.muted, textTransform: "capitalize" }}>{value.replace("_", " ")}</span>}
        />
        <Area
          type="monotone"
          dataKey="generations"
          stroke={C.gold}
          strokeWidth={2}
          fill="url(#goldGradient)"
          dot={false}
          activeDot={{ r: 4, fill: C.gold, stroke: C.gold, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="downloads"
          stroke={C.muted}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="unique_users"
          stroke={C.accent}
          strokeWidth={1.5}
          strokeDasharray="4 2"
          dot={false}
          activeDot={{ r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
