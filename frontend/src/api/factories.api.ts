import { apiClient } from '@/api/client'
import type { Factory, ListQueryParams, Paginated } from '@/api/types'

export async function fetchFactoriesPage(params: ListQueryParams): Promise<Paginated<Factory>> {
  const { data } = await apiClient.get<Paginated<Factory>>('/api/factories/', { params })
  return data
}

export async function fetchAllFactories(): Promise<Factory[]> {
  const { data } = await apiClient.get<Paginated<Factory>>('/api/factories/', {
    params: { page_size: 100 },
  })
  return data.results
}

export async function createFactory(body: {
  name: string
  location: string
  code: string
}): Promise<Factory> {
  const { data } = await apiClient.post<Factory>('/api/factories/', body)
  return data
}

export async function updateFactory(
  id: string,
  body: Partial<Pick<Factory, 'name' | 'location' | 'code'>>,
): Promise<Factory> {
  const { data } = await apiClient.patch<Factory>(`/api/factories/${id}/`, body)
  return data
}

export async function deleteFactory(id: string): Promise<void> {
  await apiClient.delete(`/api/factories/${id}/`)
}
