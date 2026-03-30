"use client"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts"
import type { DashboardData } from "../types"

const C = {
  gold: "#c9a96e",
  muted: "rgba(245,243,239,0.4)",
  text: "#f5f3ef",
  gridLine: "rgba(245,243,239,0.06)",
  tooltipBg: "#35342f",
  tooltipBorder: "rgba(245,243,239,0.12)",
}

const VOICE_NAMES: Record<string, string> = {
  "morgan-anchor": "Morgan",
  "nova-intimist": "Nova",
  "atlas-guide": "Atlas",
  "riven-narrator": "Riven",
  "hex-wildcard": "Hex",
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: C.tooltipBg,
      border: `1px solid ${C.tooltipBorder}`,
      padding: "12px 16px",
    }}>
      <p style={{ fontSize: "12px", color: C.text, margin: "0 0 6px", fontWeight: 500 }}>{d.fullName}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <span style={{ fontSize: "11px", color: C.muted }}>Generations: <strong style={{ color: C.text }}>{Number(d.generations).toLocaleString()}</strong></span>
        <span style={{ fontSize: "11px", color: C.muted }}>Downloads: <strong style={{ color: C.text }}>{Number(d.downloads).toLocaleString()}</strong></span>
        <span style={{ fontSize: "11px", color: C.muted }}>Users: <strong style={{ color: C.text }}>{Number(d.unique_users).toLocaleString()}</strong></span>
      </div>
    </div>
  )
}

const VOICE_NAMES_FULL: Record<string, string> = {
  "morgan-anchor": "Morgan · The Anchor",
  "nova-intimist": "Nova · The Intimist",
  "atlas-guide": "Atlas · The Guide",
  "riven-narrator": "Riven · The Narrator",
  "hex-wildcard": "Hex · The Wildcard",
}

export function VoiceBarChart({ data }: { data: DashboardData["voices"] }) {
  if (!data || data.length === 0) return null

  const maxGen = Math.max(...data.map((v) => Number(v.generations)), 1)

  const chartData = data
    .map((v) => ({
      name: VOICE_NAMES[v.voice_id] ?? v.voice_id,
      fullName: VOICE_NAMES_FULL[v.voice_id] ?? v.voice_id,
      generations: Number(v.generations),
      downloads: Number(v.downloads),
      unique_users: Number(v.unique_users),
      intensity: Number(v.generations) / maxGen,
    }))
    .sort((a, b) => b.generations - a.generations)

  return (
    <ResponsiveContainer width="100%" height={data.length * 56 + 20}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
        <defs>
          {chartData.map((d, i) => (
            <linearGradient key={i} id={`voiceBar-${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={C.gold} stopOpacity={0.25 + 0.75 * d.intensity} />
              <stop offset="100%" stopColor={C.gold} stopOpacity={0.08 + 0.3 * d.intensity} />
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
          tick={{ fontSize: 13, fill: C.text, fontFamily: "'Agrandir', sans-serif", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(245,243,239,0.03)" }} />
        <Bar dataKey="generations" radius={[0, 4, 4, 0]} barSize={28}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={`url(#voiceBar-${i})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
