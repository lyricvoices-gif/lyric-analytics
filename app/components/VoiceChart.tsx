"use client"

import type { DashboardData } from "../types"

const C = {
  brand: "#B8955A",
  text: "#f5f3f0",
  muted: "rgba(245,243,240,0.4)",
  faint: "rgba(245,243,240,0.07)",
  border: "rgba(255,255,255,0.07)",
}

function fmtNum(n: number | string | undefined | null): string {
  if (n == null) return "—"
  return Number(n).toLocaleString()
}

function fmtAudio(s: number | string | undefined | null): string {
  if (!s) return "—"
  const sec = Number(s)
  if (sec < 60) return `${sec.toFixed(1)}s`
  return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`
}

export function VoiceChart({
  data,
  variants,
}: {
  data: DashboardData["voices"]
  variants: DashboardData["variants"]
}) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: "48px 0", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: C.muted, letterSpacing: "0.02em" }}>
          No voice data yet — generate something in the composer.
        </p>
      </div>
    )
  }

  const maxGen = Math.max(...data.map((v) => Number(v.generations)), 1)

  const variantsByVoice: Record<string, Array<{ variant: string; generations: number }>> = {}
  for (const v of variants) {
    if (!variantsByVoice[v.voice_id]) variantsByVoice[v.voice_id] = []
    variantsByVoice[v.voice_id].push({ variant: v.voice_variant, generations: Number(v.generations) })
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
      {data.map((voice) => {
        const gen = Number(voice.generations)
        const dl = Number(voice.downloads)
        const users = Number(voice.unique_users)
        const share = gen / maxGen
        const vVariants = (variantsByVoice[voice.voice_id] ?? []).sort((a, b) => b.generations - a.generations)
        const variantTotal = vVariants.reduce((a, b) => a + b.generations, 0) || 1

        return (
          <div
            key={voice.voice_id}
            style={{
              background: C.faint,
              border: `1px solid ${C.border}`,
              borderRadius: "14px",
              padding: "22px 20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top accent */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "2px",
              background: `linear-gradient(90deg, rgba(184,149,90,${0.25 + 0.75 * share}), transparent 80%)`,
            }} />

            <p style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em",
              color: C.brand, textTransform: "uppercase", margin: "0 0 14px",
            }}>
              {voice.voice_id}
            </p>

            <p style={{
              fontSize: "34px", fontWeight: 300, letterSpacing: "-0.03em",
              color: C.text, margin: "0 0 2px", lineHeight: 1,
            }}>
              {fmtNum(gen)}
            </p>
            <p style={{
              fontSize: "10px", color: C.muted, margin: "0 0 14px",
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}>
              generations
            </p>

            <div style={{ height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "1px", marginBottom: "18px" }}>
              <div style={{
                height: "100%", width: `${share * 100}%`,
                background: C.brand, borderRadius: "1px", opacity: 0.55,
                transition: "width 0.5s ease",
              }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: vVariants.length ? "18px" : 0 }}>
              {([
                ["Downloads", fmtNum(dl)],
                ["Users", fmtNum(users)],
                ["Avg Audio", fmtAudio(voice.avg_audio_s)],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label}>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: C.text, margin: "0 0 3px" }}>{val}</p>
                  <p style={{ fontSize: "10px", color: C.muted, margin: 0, letterSpacing: "0.04em" }}>{label}</p>
                </div>
              ))}
            </div>

            {vVariants.length > 0 && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
                <p style={{
                  fontSize: "9px", fontWeight: 700, color: C.muted,
                  textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 8px",
                }}>
                  Variants
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {vVariants.slice(0, 4).map((v) => (
                    <div key={v.variant}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
                        <span style={{ color: C.muted }}>{v.variant}</span>
                        <span style={{ color: C.text, fontWeight: 500 }}>{v.generations}</span>
                      </div>
                      <div style={{ height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "1px" }}>
                        <div style={{
                          height: "100%",
                          width: `${(v.generations / variantTotal) * 100}%`,
                          background: C.brand, borderRadius: "1px", opacity: 0.45,
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
