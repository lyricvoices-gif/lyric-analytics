import { Dashboard } from "./components/Dashboard"
import type { DashboardData } from "./types"

interface PageProps {
  searchParams: Promise<{ range?: string }>
}

async function fetchDashboard(range: number): Promise<DashboardData | null> {
  const base = process.env.COMPOSER_API_URL ?? "https://composer.lyricvoices.ai"
  const secret = process.env.ANALYTICS_SECRET ?? ""
  try {
    const res = await fetch(`${base}/api/analytics/dashboard?range=${range}`, {
      headers: { Authorization: `Bearer ${secret}` },
      next: { revalidate: 300 }, // 5-minute cache
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const range = parseInt(params.range ?? "30", 10)
  const data = await fetchDashboard(range)

  return <Dashboard data={data} range={range} />
}
