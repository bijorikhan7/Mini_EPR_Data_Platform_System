import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { fetchDashboard } from '@/api/dashboard.api'
import { fetchSalesPage } from '@/api/sales.api'
import type { DashboardData } from '@/api/types'
import { Card } from '@/components/Card'
import { ErrorAlert } from '@/components/ErrorAlert'
import { PageHeader } from '@/components/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { queryKeys } from '@/lib/queryKeys'
import { mergeTrendSeries, salesQuantityByDay } from '@/utils/charts'
import { formatCurrency, formatDate, formatNumber } from '@/utils/format'

export default function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboard,
  })

  const salesSampleQuery = useQuery({
    queryKey: ['sales', 'dashboard-chart'] as const,
    queryFn: () => fetchSalesPage({ page_size: 100, ordering: '-created_at' }),
  })

  if (dashboardQuery.isError) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Factory-wide KPIs and trends." />
        <ErrorAlert message="Could not load dashboard metrics." />
      </div>
    )
  }

  const data = dashboardQuery.data as DashboardData | undefined
  const salesTrend = salesSampleQuery.data ? salesQuantityByDay(salesSampleQuery.data.results) : []
  const merged =
    data && salesSampleQuery.data
      ? mergeTrendSeries(data.trends, salesTrend).map((row) => ({
          ...row,
          label: formatDate(row.date),
        }))
      : []

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Production, sales, inventory, and financial performance for your factory scope."
      />

      {!data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total production" value={formatNumber(data.total_production)} hint="Units recorded" />
          <MetricCard label="Total sales" value={formatNumber(data.total_sales)} hint="Order count" />
          <MetricCard label="Inventory on hand" value={formatNumber(data.total_inventory)} hint="Sum of quantities" />
          <MetricCard
            label="Profit / loss"
            value={formatCurrency(data.total_profit_loss)}
            hint="Finance module summary"
          />
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card title="Production trend" subtitle="Daily output from production records">
          {!data ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <ChartFrame>
              <LineChart data={data.trends.map((t) => ({ ...t, label: formatDate(String(t.date)) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                <Legend />
                <Line type="monotone" dataKey="total_production" name="Production" stroke="#38bdf8" dot={false} />
              </LineChart>
            </ChartFrame>
          )}
        </Card>

        <Card title="Sales vs production" subtitle="Sales quantity by order date vs production trend">
          {salesSampleQuery.isLoading || !data ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <ChartFrame>
              <LineChart data={merged}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="production"
                  name="Production"
                  stroke="#38bdf8"
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Sales qty"
                  stroke="#a78bfa"
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ChartFrame>
          )}
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/20">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

function ChartFrame({ children }: { children: ReactNode }) {
  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}
