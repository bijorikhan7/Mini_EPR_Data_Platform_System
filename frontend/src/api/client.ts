import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from '@/api/authTokens'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean
  }
}

const baseURL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null
  const { data } = await axios.post<{ access: string }>(
    `${baseURL}/api/auth/token/refresh/`,
    { refresh },
    { headers: { 'Content-Type': 'application/json' } },
  )
  setAccessToken(data.access)
  return data.access
}

apiClient.interceptors.request.use((config) => {
  if (!config.skipAuth) {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (!original || original.skipAuth) return Promise.reject(error)
    const url = original.url ?? ''
    if (status === 401 && !original._retry && !url.includes('/auth/token/')) {
      original._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }
        const access = await refreshPromise
        if (!access) {
          clearTokens()
          window.dispatchEvent(new CustomEvent('erp:auth-expired'))
          return Promise.reject(error)
        }
        original.headers.Authorization = `Bearer ${access}`
        return apiClient(original)
      } catch {
        clearTokens()
        window.dispatchEvent(new CustomEvent('erp:auth-expired'))
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  },
)
