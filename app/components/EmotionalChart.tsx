"use client"

import type { DashboardData } from "../types"

const C = {
  brand: "#B8955A",
  muted: "rgba(248,246,243,0.35)",
  text: "#faf9f7",
  bar: "rgba(184,149,90,",
}

export function EmotionalChart({ data }: { data: DashboardData["emotional_directions"] }) {
  if (!data || data.length === 0) {
    return <p style={{ color: C.muted, fontSize: "12px", margin: "8px 0 0" }}>No direction data yet.</p>
  }

  const maxUses = Math.max(...data.map((d) => Number(d.uses)), 1)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
      {data.map((item) => {
        const uses = Number(item.uses)
        const pct = Number(item.pct)
        const fill = `${C.bar}${0.3 + 0.7 * (uses / maxUses)})`
        return (
          <div key={item.emotional_direction}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", color: C.text, fontWeight: 500 }}>
                {item.emotional_direction}
              </span>
              <span style={{ fontSize: "11px", color: C.muted }}>
                {uses.toLocaleString()} · {pct}%
              </span>
            </div>
            <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
              <div style={{
                height: "100%",
                width: `${pct}%`,
                background: fill,
                borderRadius: "3px",
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
