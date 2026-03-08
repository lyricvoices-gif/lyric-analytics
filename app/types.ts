export interface DashboardData {
  range_days: number
  generated_at: string
  overview: {
    total_generations: number
    total_downloads: number
    total_previews: number
    unique_users: number
    total_audio_seconds: number
    total_characters: number
  }
  voices: Array<{
    voice_id: string
    generations: number
    downloads: number
    unique_users: number
    avg_audio_s: number
  }>
  variants: Array<{
    voice_id: string
    voice_variant: string
    generations: number
  }>
  emotional_directions: Array<{
    emotional_direction: string
    uses: number
    unique_users: number
    pct: number
  }>
  plan_breakdown: Array<{
    plan_tier: string
    generations: number
    downloads: number
    unique_users: number
  }>
  daily_trend: Array<{
    date: string
    generations: number
    downloads: number
    unique_users: number
  }>
  latency: {
    avg_ms: number
    p50_ms: number
    p95_ms: number
  }
  clerk: {
    total_users?: number
    new_users_last_30d?: number
    plan_distribution?: Record<string, number>
    error?: string
  }
  stripe: {
    mrr?: number
    active_subscriptions?: number
    revenue_last_30d?: number
    plan_counts?: Record<string, number>
    recent_events?: Array<{ type: string; created: string }>
    error?: string
  }
}
