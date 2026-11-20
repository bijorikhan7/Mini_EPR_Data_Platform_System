import { apiClient } from '@/api/client'
import type { DashboardData } from '@/api/types'

export async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardData>('/api/dashboard/')
  return data
}
