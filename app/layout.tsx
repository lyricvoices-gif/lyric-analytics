import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Lyric Voices Analytics",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&display=swap" rel="stylesheet" />
        <style>{`
          @font-face {
            font-family: "Agrandir";
            src: url("/fonts/Agrandir-Regular.otf") format("opentype");
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }
        `}</style>
      </head>
      <body style={{ margin: 0, background: "#2b2a25", color: "#f5f3ef", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
