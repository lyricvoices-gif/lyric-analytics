"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const GOLD_SCALE = [
  "#c9a96e",
  "rgba(201,169,110,0.7)",
  "rgba(201,169,110,0.45)",
  "rgba(201,169,110,0.25)",
  "rgba(245,243,239,0.12)",
]

const C = {
  muted: "rgba(245,243,239,0.4)",
  text: "#f5f3ef",
  tooltipBg: "#35342f",
  tooltipBorder: "rgba(245,243,239,0.12)",
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: C.tooltipBg,
      border: `1px solid ${C.tooltipBorder}`,
      padding: "10px 14px",
    }}>
      <p style={{ fontSize: "12px", color: C.text, margin: "0 0 2px", fontWeight: 500 }}>{d.name}</p>
      <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>{Number(d.value).toLocaleString()} generations</p>
    </div>
  )
}

interface PlanDonutProps {
  data: Array<{ plan_tier: string; generations: number }>
  formatPlanName?: (name: string) => string
}

export function PlanDonut({ data, formatPlanName }: PlanDonutProps) {
  if (!data || data.length === 0) return null

  const chartData = data.map((d) => ({
    name: formatPlanName ? formatPlanName(d.plan_tier) : d.plan_tier,
    value: Number(d.generations),
  }))

  const total = chartData.reduce((a, b) => a + b.value, 0)

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={GOLD_SCALE[i % GOLD_SCALE.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {chartData.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
          return (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: GOLD_SCALE[i % GOLD_SCALE.length], flexShrink: 0 }} />
              <span style={{ fontSize: "12px", color: C.muted, minWidth: "60px" }}>{d.name}</span>
              <span style={{ fontSize: "12px", color: C.text, fontWeight: 500 }}>{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface RevenuePlanDonutProps {
  planCounts: Record<string, number>
  formatPlanName: (name: string) => string
}

export function RevenuePlanDonut({ planCounts, formatPlanName }: RevenuePlanDonutProps) {
  const chartData = Object.entries(planCounts).map(([plan, count]) => ({
    name: formatPlanName(plan),
    value: count,
  }))

  if (chartData.length === 0) return null

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={GOLD_SCALE[i % GOLD_SCALE.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {chartData.map((d, i) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: GOLD_SCALE[i % GOLD_SCALE.length], flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: C.muted, minWidth: "60px" }}>{d.name}</span>
            <span style={{ fontSize: "12px", color: C.text, fontWeight: 500 }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
