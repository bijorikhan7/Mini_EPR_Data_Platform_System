import { storageGet, storageRemove, storageSet } from '@/utils/storage'

const ACCESS = 'access_token'
const REFRESH = 'refresh_token'

export function getAccessToken(): string | null {
  return storageGet(ACCESS)
}

export function getRefreshToken(): string | null {
  return storageGet(REFRESH)
}

export function setTokens(tokens: { access: string; refresh: string }): void {
  storageSet(ACCESS, tokens.access)
  storageSet(REFRESH, tokens.refresh)
}

export function setAccessToken(access: string): void {
  storageSet(ACCESS, access)
}

export function clearTokens(): void {
  storageRemove(ACCESS)
  storageRemove(REFRESH)
}
