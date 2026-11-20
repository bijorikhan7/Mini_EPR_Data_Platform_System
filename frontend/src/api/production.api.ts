import { apiClient } from '@/api/client'
import type { Paginated, ProductionListParams, ProductionRecord } from '@/api/types'

function cleanParams(params: ProductionListParams): Record<string, string | number | undefined> {
  const out: Record<string, string | number | undefined> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === '') continue
    out[k] = v
  }
  return out
}

export async function fetchProductionPage(
  params: ProductionListParams,
): Promise<Paginated<ProductionRecord>> {
  const { data } = await apiClient.get<Paginated<ProductionRecord>>('/api/production/', {
    params: cleanParams(params),
  })
  return data
}

export async function createProduction(body: {
  product: string
  quantity: number
  date: string
  factory_id?: string
}): Promise<ProductionRecord> {
  const { data } = await apiClient.post<ProductionRecord>('/api/production/', body)
  return data
}

export async function updateProduction(
  id: string,
  body: Partial<Pick<ProductionRecord, 'product' | 'quantity' | 'date'>> & { factory_id?: string },
): Promise<ProductionRecord> {
  const { data } = await apiClient.patch<ProductionRecord>(`/api/production/${id}/`, body)
  return data
}

export async function deleteProduction(id: string): Promise<void> {
  await apiClient.delete(`/api/production/${id}/`)
}

export async function downloadProductionExport(params: ProductionListParams): Promise<void> {
  const { data } = await apiClient.get<Blob>('/api/production/export-csv/', {
    params: cleanParams(params),
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = 'production_records.csv'
  a.click()
  window.URL.revokeObjectURL(url)
}

export async function importProductionCsv(file: File): Promise<{ created_records: number }> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post<{ created_records: number }>('/api/production/import-csv/', form)
  return data
}
