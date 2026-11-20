import { apiClient } from '@/api/client'
import type { ListQueryParams, Paginated, ReportExport } from '@/api/types'

export async function fetchReportsPage(params: ListQueryParams): Promise<Paginated<ReportExport>> {
  const { data } = await apiClient.get<Paginated<ReportExport>>('/api/reports/exports/', { params })
  return data
}

export async function createReportExport(body: {
  report_name: string
  file_path: string
}): Promise<ReportExport> {
  const { data } = await apiClient.post<ReportExport>('/api/reports/exports/', body)
  return data
}

export async function updateReportExport(
  id: string,
  body: Partial<Pick<ReportExport, 'report_name' | 'file_path'>>,
): Promise<ReportExport> {
  const { data } = await apiClient.patch<ReportExport>(`/api/reports/exports/${id}/`, body)
  return data
}

export async function deleteReportExport(id: string): Promise<void> {
  await apiClient.delete(`/api/reports/exports/${id}/`)
}
