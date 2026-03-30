"use client"

import type { DashboardData } from "../types"

const C = {
  gold: "#c9a96e",
  text: "#f5f3ef",
  muted: "rgba(245,243,239,0.4)",
  faint: "rgba(245,243,239,0.06)",
  border: "rgba(245,243,239,0.08)",
  panelBg: "rgba(245,243,239,0.03)",
}

const VOICE_NAMES: Record<string, string> = {
  "morgan-anchor": "Morgan · The Anchor",
  "nova-intimist": "Nova · The Intimist",
  "atlas-guide": "Atlas · The Guide",
  "riven-narrator": "Riven · The Narrator",
  "hex-wildcard": "Hex · The Wildcard",
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
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
              background: C.panelBg,
              border: `1px solid ${C.border}`,
              padding: "24px 22px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top gold accent line */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "2px",
              background: `linear-gradient(90deg, rgba(201,169,110,${0.25 + 0.75 * share}), transparent 80%)`,
            }} />

            <p style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em",
              color: C.gold, textTransform: "uppercase", margin: "0 0 16px",
              fontFamily: "'Agrandir Narrow', sans-serif",
            }}>
              {VOICE_NAMES[voice.voice_id] ?? voice.voice_id}
            </p>

            <p style={{
              fontSize: "36px", fontWeight: 300, letterSpacing: "-0.03em",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontVariantNumeric: "lining-nums tabular-nums",
              color: C.text, margin: "0 0 2px", lineHeight: 1,
            }}>
              {fmtNum(gen)}
            </p>
            <p style={{
              fontSize: "10px", color: C.muted, margin: "0 0 16px",
              textTransform: "uppercase", letterSpacing: "0.1em",
              fontFamily: "'Agrandir Narrow', sans-serif",
            }}>
              generations
            </p>

            {/* Share bar */}
            <div style={{ height: "2px", background: C.faint, marginBottom: "20px" }}>
              <div style={{
                height: "100%", width: `${share * 100}%`,
                background: C.gold, opacity: 0.55,
                transition: "width 0.5s ease",
              }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: vVariants.length ? "20px" : 0 }}>
              {([
                ["Downloads", fmtNum(dl)],
                ["Users", fmtNum(users)],
                ["Avg Audio", fmtAudio(voice.avg_audio_s)],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label}>
                  <p style={{ fontSize: "15px", fontWeight: 500, color: C.text, margin: "0 0 3px" }}>{val}</p>
                  <p style={{ fontSize: "10px", color: C.muted, margin: 0, letterSpacing: "0.04em", fontFamily: "'Agrandir Narrow', sans-serif" }}>{label}</p>
                </div>
              ))}
            </div>

            {vVariants.length > 0 && (
              <div style={{ borderTop: `1px solid ${C.faint}`, paddingTop: "16px" }}>
                <p style={{
                  fontSize: "9px", fontWeight: 700, color: C.muted,
                  textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 10px",
                  fontFamily: "'Agrandir Narrow', sans-serif",
                }}>
                  Variants
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {vVariants.slice(0, 4).map((v) => (
                    <div key={v.variant}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
                        <span style={{ color: C.muted }}>{v.variant}</span>
                        <span style={{ color: C.text, fontWeight: 500 }}>{v.generations}</span>
                      </div>
                      <div style={{ height: "2px", background: C.faint }}>
                        <div style={{
                          height: "100%",
                          width: `${(v.generations / variantTotal) * 100}%`,
                          background: C.gold, opacity: 0.45,
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
