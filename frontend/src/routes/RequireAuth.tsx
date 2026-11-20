import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { FullPageSpinner } from '@/components/FullPageSpinner'
import { getAccessToken } from '@/api/authTokens'
import { useAuth } from '@/hooks/useAuth'
import { paths } from '@/routes/paths'

export function RequireAuth() {
  const location = useLocation()
  const { isAuthenticated, isBootstrapping } = useAuth()
  const token = getAccessToken()

  if (!token) {
    return <Navigate to={paths.login} replace state={{ from: location.pathname }} />
  }
  if (isBootstrapping) {
    return <FullPageSpinner label="Restoring session…" />
  }
  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace />
  }

  return <Outlet />
}
