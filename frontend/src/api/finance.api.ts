import { apiClient } from '@/api/client'
import type { FinanceTransaction, ListQueryParams, Paginated } from '@/api/types'

export async function fetchFinancePage(
  params: ListQueryParams,
): Promise<Paginated<FinanceTransaction>> {
  const { data } = await apiClient.get<Paginated<FinanceTransaction>>('/api/finance/', { params })
  return data
}

export async function createFinanceTransaction(body: {
  type: string
  amount: number
  date: string
}): Promise<FinanceTransaction> {
  const { data } = await apiClient.post<FinanceTransaction>('/api/finance/', body)
  return data
}

export async function updateFinanceTransaction(
  id: string,
  body: Partial<Pick<FinanceTransaction, 'type' | 'amount' | 'date'>>,
): Promise<FinanceTransaction> {
  const { data } = await apiClient.patch<FinanceTransaction>(`/api/finance/${id}/`, body)
  return data
}

export async function deleteFinanceTransaction(id: string): Promise<void> {
  await apiClient.delete(`/api/finance/${id}/`)
}
