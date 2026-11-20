import { apiClient } from '@/api/client'
import type { InventoryItem, ListQueryParams, Paginated } from '@/api/types'

export async function fetchInventoryPage(params: ListQueryParams): Promise<Paginated<InventoryItem>> {
  const { data } = await apiClient.get<Paginated<InventoryItem>>('/api/inventory/', { params })
  return data
}

export async function createInventoryItem(body: {
  product: string
  quantity: number
}): Promise<InventoryItem> {
  const { data } = await apiClient.post<InventoryItem>('/api/inventory/', body)
  return data
}

export async function updateInventoryItem(
  id: string,
  body: Partial<Pick<InventoryItem, 'product' | 'quantity'>>,
): Promise<InventoryItem> {
  const { data } = await apiClient.patch<InventoryItem>(`/api/inventory/${id}/`, body)
  return data
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await apiClient.delete(`/api/inventory/${id}/`)
}
