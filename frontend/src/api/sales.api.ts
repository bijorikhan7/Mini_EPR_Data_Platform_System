import { apiClient } from '@/api/client'
import type { ListQueryParams, Paginated, SalesOrder } from '@/api/types'

export async function fetchSalesPage(params: ListQueryParams): Promise<Paginated<SalesOrder>> {
  const { data } = await apiClient.get<Paginated<SalesOrder>>('/api/sales/', { params })
  return data
}

export async function createSalesOrder(body: {
  customer: string
  product: string
  quantity: number
  status: string
}): Promise<SalesOrder> {
  const { data } = await apiClient.post<SalesOrder>('/api/sales/', body)
  return data
}

export async function updateSalesOrder(
  id: string,
  body: Partial<Pick<SalesOrder, 'customer' | 'product' | 'quantity' | 'status'>>,
): Promise<SalesOrder> {
  const { data } = await apiClient.patch<SalesOrder>(`/api/sales/${id}/`, body)
  return data
}

export async function deleteSalesOrder(id: string): Promise<void> {
  await apiClient.delete(`/api/sales/${id}/`)
}
