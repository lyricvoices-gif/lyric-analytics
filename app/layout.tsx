import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Lyric Voices Analytics",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @font-face {
            font-family: "Agrandir";
            src: url("/fonts/Agrandir-GrandHeavy.otf") format("opentype");
            font-weight: 800;
            font-style: normal;
            font-display: swap;
          }
        `}</style>
      </head>
      <body style={{ margin: 0, background: "#12100f", color: "#faf9f7", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
