"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"
import type { DashboardData } from "../types"

const C = {
  brand: "#B8955A",
  muted: "rgba(248,246,243,0.35)",
  accent: "rgba(248,246,243,0.6)",
  gridLine: "rgba(255,255,255,0.05)",
  tooltipBg: "#1e1c1a",
  tooltipBorder: "rgba(255,255,255,0.08)",
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
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
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={formatted} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: C.muted }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: C.muted }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: C.tooltipBg, border: `1px solid ${C.tooltipBorder}`, borderRadius: "10px", fontSize: "12px" }}
          labelStyle={{ color: "#faf9f7", marginBottom: "4px" }}
          itemStyle={{ color: C.muted }}
        />
        <Legend
          wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
          formatter={(value) => <span style={{ color: C.muted }}>{value}</span>}
        />
        <Line
          type="monotone"
          dataKey="generations"
          stroke={C.brand}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: C.brand }}
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
      </LineChart>
    </ResponsiveContainer>
  )
}
