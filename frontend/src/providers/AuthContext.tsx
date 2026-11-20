import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { fetchProfile, login as loginRequest } from '@/api/auth.api'
import { clearTokens, getAccessToken, setTokens } from '@/api/authTokens'
import type { UserProfile } from '@/api/types'
import { queryKeys } from '@/lib/queryKeys'

type AuthContextValue = {
  user: UserProfile | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [hasToken, setHasToken] = useState(() => Boolean(getAccessToken()))

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfile,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    const onExpired = () => {
      clearTokens()
      setHasToken(false)
      queryClient.removeQueries({ queryKey: queryKeys.profile })
    }
    window.addEventListener('erp:auth-expired', onExpired)
    return () => window.removeEventListener('erp:auth-expired', onExpired)
  }, [queryClient])

  useEffect(() => {
    if (profileQuery.isError && hasToken) {
      clearTokens()
      setHasToken(false)
      queryClient.removeQueries({ queryKey: queryKeys.profile })
    }
  }, [profileQuery.isError, hasToken, queryClient])

  const login = useCallback(
    async (username: string, password: string) => {
      const tokens = await loginRequest(username, password)
      setTokens(tokens)
      setHasToken(true)
      await queryClient.refetchQueries({ queryKey: queryKeys.profile })
    },
    [queryClient],
  )

  const logout = useCallback(() => {
    clearTokens()
    setHasToken(false)
    queryClient.clear()
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: profileQuery.data ?? null,
      isAuthenticated: Boolean(profileQuery.isSuccess && profileQuery.data),
      isBootstrapping: Boolean(hasToken && profileQuery.isPending),
      login,
      logout,
    }),
    [hasToken, profileQuery.data, profileQuery.isPending, profileQuery.isSuccess, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
