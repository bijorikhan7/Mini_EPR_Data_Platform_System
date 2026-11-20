import { apiClient } from '@/api/client'
import type { ListQueryParams, Paginated, ProcurementOrder } from '@/api/types'

export async function fetchProcurementPage(
  params: ListQueryParams,
): Promise<Paginated<ProcurementOrder>> {
  const { data } = await apiClient.get<Paginated<ProcurementOrder>>('/api/procurement/', { params })
  return data
}

export async function createProcurementOrder(body: {
  supplier: string
  product: string
  quantity: number
  cost: number
}): Promise<ProcurementOrder> {
  const { data } = await apiClient.post<ProcurementOrder>('/api/procurement/', body)
  return data
}

export async function updateProcurementOrder(
  id: string,
  body: Partial<Pick<ProcurementOrder, 'supplier' | 'product' | 'quantity' | 'cost'>>,
): Promise<ProcurementOrder> {
  const { data } = await apiClient.patch<ProcurementOrder>(`/api/procurement/${id}/`, body)
  return data
}

export async function deleteProcurementOrder(id: string): Promise<void> {
  await apiClient.delete(`/api/procurement/${id}/`)
}
