import type { SalesOrder } from '@/api/types'

export type TrendPoint = { date: string; value: number }

/** Aggregate sales orders by calendar day (uses created_at). */
export function salesQuantityByDay(orders: SalesOrder[], maxPoints = 60): TrendPoint[] {
  const map = new Map<string, number>()
  for (const o of orders) {
    const day = o.created_at.slice(0, 10)
    map.set(day, (map.get(day) ?? 0) + o.quantity)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-maxPoints)
    .map(([date, value]) => ({ date, value }))
}

export function mergeTrendSeries(
  production: { date: string; total_production: number }[],
  sales: TrendPoint[],
): { date: string; production: number | null; sales: number | null }[] {
  const dates = new Set<string>()
  production.forEach((p) => dates.add(String(p.date).slice(0, 10)))
  sales.forEach((s) => dates.add(s.date))
  const sorted = [...dates].sort((a, b) => a.localeCompare(b))
  const prodMap = new Map(production.map((p) => [String(p.date).slice(0, 10), p.total_production]))
  const saleMap = new Map(sales.map((s) => [s.date, s.value]))
  return sorted.map((date) => ({
    date,
    production: prodMap.get(date) ?? null,
    sales: saleMap.get(date) ?? null,
  }))
}
