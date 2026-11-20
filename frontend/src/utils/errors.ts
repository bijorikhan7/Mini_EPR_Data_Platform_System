import { isAxiosError } from 'axios'

export type ApiErrorBody = {
  success?: boolean
  error?: string
  details?: unknown
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as ApiErrorBody | undefined
    if (data?.details) {
      if (Array.isArray(data.details) && typeof data.details[0] === 'string') return data.details[0]
      const d = data.details as Record<string, unknown>
      if (typeof d.detail === 'string') return d.detail
      const first = Object.values(d)[0]
      if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
      if (typeof first === 'string') return first
    }
    if (data?.error && typeof data.error === 'string') {
      return data.error
    }
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return fallback
}
