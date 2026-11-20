import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { getAccessToken } from '@/api/authTokens'
import { Card } from '@/components/Card'
import { Form } from '@/components/Form'
import { ErrorAlert } from '@/components/ErrorAlert'
import { FullPageSpinner } from '@/components/FullPageSpinner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { paths } from '@/routes/paths'
import { getErrorMessage } from '@/utils/errors'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isBootstrapping } = useAuth()
  const from = (location.state as { from?: string } | null)?.from ?? paths.dashboard

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (getAccessToken() && isBootstrapping) {
    return <FullPageSpinner label="Signing in…" />
  }
  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">Multi-factory ERP</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in with your operator credentials.</p>
        </div>
        <Card>
          {error ? (
            <div className="mb-4">
              <ErrorAlert message={error} />
            </div>
          ) : null}
          <Form onSubmit={onSubmit}>
            <Input
              label="Username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  )
}
