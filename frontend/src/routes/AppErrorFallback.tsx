import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

import { Button } from '@/components/ui/Button'

export function AppErrorFallback() {
  const err = useRouteError()
  const message = isRouteErrorResponse(err)
    ? err.statusText || 'Route error'
    : err instanceof Error
      ? err.message
      : 'Unexpected error'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-center">
      <h1 className="text-xl font-semibold text-white">Something broke</h1>
      <p className="max-w-md text-sm text-slate-400">{message}</p>
      <Button type="button" onClick={() => window.location.assign('/')}>
        Reload app
      </Button>
    </div>
  )
}
