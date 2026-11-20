import { apiClient } from '@/api/client'
import type { TokenPair, UserProfile } from '@/api/types'

export async function login(username: string, password: string): Promise<TokenPair> {
  const { data } = await apiClient.post<TokenPair>(
    '/api/auth/token/',
    { username, password },
    { skipAuth: true },
  )
  return data
}

export async function fetchProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>('/api/auth/me/')
  return data
}
