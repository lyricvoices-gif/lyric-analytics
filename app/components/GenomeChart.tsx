"use client"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import type { DashboardData } from "../types"

const C = {
  gold: "#c9a96e",
  good: "#4a7c59",
  error: "#b54a2e",
  errorMuted: "rgba(181,74,46,0.5)",
  muted: "rgba(245,243,239,0.4)",
  faint: "rgba(245,243,239,0.06)",
  text: "#f5f3ef",
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
function GenomeTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: C.tooltipBg,
      border: `1px solid ${C.tooltipBorder}`,
      padding: "12px 16px",
    }}>
      <p style={{ fontSize: "12px", color: C.text, margin: "0 0 6px", fontWeight: 500 }}>{d.fullName}</p>
      <p style={{ fontSize: "11px", color: C.good, margin: "0 0 2px" }}>Download rate: {d.download_rate ?? 0}%</p>
      <p style={{ fontSize: "11px", color: C.errorMuted, margin: 0 }}>Regen rate: {d.regeneration_rate ?? 0}%</p>
    </div>
  )
}

interface GenomeBarProps {
  data: NonNullable<NonNullable<DashboardData["genome"]>["download_performance"]>
}

export function GenomeBarChart({ data }: GenomeBarProps) {
  if (!data || data.length === 0) return null

  // Aggregate by voice_id (combine variants)
  const byVoice: Record<string, { gens: number; dls: number; regens: number }> = {}
  for (const row of data) {
    const key = row.voice_id
    if (!byVoice[key]) byVoice[key] = { gens: 0, dls: 0, regens: 0 }
    byVoice[key].gens += Number(row.total_generations)
    byVoice[key].dls += Number(row.downloads)
    byVoice[key].regens += Number(row.regenerations)
  }

  const chartData = Object.entries(byVoice).map(([voiceId, v]) => ({
    name: VOICE_NAMES[voiceId] ?? voiceId,
    fullName: voiceId,
    download_rate: v.gens > 0 ? Math.round((v.dls / v.gens) * 100) : 0,
    regeneration_rate: v.gens > 0 ? Math.round((v.regens / v.gens) * 100) : 0,
  })).sort((a, b) => b.download_rate - a.download_rate)

  return (
    <ResponsiveContainer width="100%" height={chartData.length * 64 + 40}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
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
          tick={{ fontSize: 13, fill: C.text, fontFamily: "'Agrandir', sans-serif", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip content={<GenomeTooltip />} cursor={{ fill: "rgba(245,243,239,0.03)" }} />
        <Legend
          wrapperStyle={{ fontSize: "11px", paddingTop: "12px", fontFamily: "'Agrandir Narrow', sans-serif" }}
          formatter={(value: string) => <span style={{ color: C.muted }}>{value === "download_rate" ? "Download rate" : "Regen rate"}</span>}
        />
        <Bar dataKey="download_rate" fill={C.good} fillOpacity={0.7} radius={[0, 4, 4, 0]} barSize={18} />
        <Bar dataKey="regeneration_rate" fill={C.errorMuted} fillOpacity={0.7} radius={[0, 4, 4, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface UseCaseHeatmapProps {
  data: NonNullable<NonNullable<DashboardData["genome"]>["use_case_breakdown"]>
  formatVoiceName: (id: string) => string
}

export function UseCaseHeatmap({ data, formatVoiceName }: UseCaseHeatmapProps) {
  if (!data || data.length === 0) return null

  // Build matrix: rows = use cases, cells = voices
  const useCases = [...new Set(data.map((d) => d.use_case))]
  const voices = [...new Set(data.map((d) => d.voice_id))]
  const maxDlRate = Math.max(...data.map((d) => Number(d.download_rate) || 0), 1)

  const lookup: Record<string, typeof data[number]> = {}
  for (const row of data) {
    lookup[`${row.use_case}::${row.voice_id}`] = row
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{
              textAlign: "left", fontSize: "10px", fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: C.muted, padding: "0 12px 14px 0",
              fontFamily: "'Agrandir Narrow', sans-serif",
            }}>
              Use Case
            </th>
            {voices.map((v) => (
              <th key={v} style={{
                textAlign: "center", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: C.muted, padding: "0 8px 14px",
                fontFamily: "'Agrandir Narrow', sans-serif",
              }}>
                {VOICE_NAMES[v] ?? v}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {useCases.map((uc) => (
            <tr key={uc}>
              <td style={{
                fontSize: "13px", color: C.text, fontWeight: 500,
                padding: "10px 12px 10px 0",
                borderBottom: `1px solid ${C.faint}`,
                fontFamily: "'Agrandir', sans-serif",
              }}>
                {uc}
              </td>
              {voices.map((v) => {
                const row = lookup[`${uc}::${v}`]
                const dlRate = row ? Number(row.download_rate) || 0 : 0
                const gens = row ? Number(row.total_generations) : 0
                const intensity = dlRate / maxDlRate
                return (
                  <td key={v} style={{
                    textAlign: "center",
                    padding: "10px 8px",
                    borderBottom: `1px solid ${C.faint}`,
                    background: gens > 0 ? `rgba(201,169,110,${0.04 + 0.2 * intensity})` : "transparent",
                  }}>
                    {gens > 0 ? (
                      <div>
                        <span style={{ fontSize: "14px", color: C.text, fontWeight: 500 }}>{dlRate}%</span>
                        <br />
                        <span style={{ fontSize: "10px", color: C.muted }}>{gens.toLocaleString()} gen</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: "11px", color: "rgba(245,243,239,0.15)" }}>—</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
