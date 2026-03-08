"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts"
import type { DashboardData } from "../types"

const C = {
  brand: "#B8955A",
  muted: "rgba(248,246,243,0.35)",
  gridLine: "rgba(255,255,255,0.05)",
  tooltipBg: "#1e1c1a",
  tooltipBorder: "rgba(255,255,255,0.08)",
}

export function VoiceChart({ data }: { data: DashboardData["voices"] }) {
  if (!data || data.length === 0) {
    return <p style={{ color: C.muted, fontSize: "12px", margin: "24px 0 0" }}>No voice data yet.</p>
  }

  const formatted = data.map((v) => ({
    name: v.voice_id,
    generations: Number(v.generations),
    downloads: Number(v.downloads),
    unique_users: Number(v.unique_users),
  }))

  const maxVal = Math.max(...formatted.map((v) => v.generations), 1)

  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={formatted} margin={{ top: 8, right: 16, left: -8, bottom: 0 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: C.muted }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: C.muted }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ background: C.tooltipBg, border: `1px solid ${C.tooltipBorder}`, borderRadius: "10px", fontSize: "12px" }}
            labelStyle={{ color: "#faf9f7", marginBottom: "4px" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="generations" radius={[4, 4, 0, 0]}>
            {formatted.map((entry, i) => (
              <Cell
                key={i}
                fill={`rgba(184,149,90,${0.4 + 0.6 * (entry.generations / maxVal)})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Stats row under chart */}
      <div style={{ display: "flex", gap: "4px", marginTop: "12px", flexWrap: "wrap" }}>
        {data.map((v) => (
          <div key={v.voice_id} style={{
            flex: "1", minWidth: "100px",
            background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px 12px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#faf9f7", margin: "0 0 4px", textTransform: "capitalize" }}>
              {v.voice_id}
            </p>
            <p style={{ fontSize: "10px", color: C.muted, margin: 0, lineHeight: 1.7 }}>
              {v.generations} gen · {v.downloads} dl<br />
              {v.unique_users} users · {v.avg_audio_s ? `${v.avg_audio_s}s avg` : "—"}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
