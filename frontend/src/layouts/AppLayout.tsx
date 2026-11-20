import clsx from 'clsx'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { paths } from '@/routes/paths'
import { formatFactoryRef } from '@/utils/format'

const nav = [
  { to: paths.dashboard, label: 'Dashboard' },
  { to: paths.production, label: 'Production' },
  { to: paths.inventory, label: 'Inventory' },
  { to: paths.sales, label: 'Sales' },
  { to: paths.procurement, label: 'Procurement' },
  { to: paths.finance, label: 'Finance' },
  { to: paths.factories, label: 'Factories' },
  { to: paths.reports, label: 'Reports' },
] as const

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="hidden w-60 shrink-0 border-r border-slate-800 bg-slate-900/80 lg:block">
        <div className="flex h-14 items-center border-b border-slate-800 px-4">
          <span className="text-sm font-semibold tracking-wide text-sky-400">ERP Console</span>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sky-600/20 text-sky-300'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/60 px-4 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <span className="text-sm font-semibold text-sky-400">ERP</span>
          </div>
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-400">
            <span className="hidden sm:inline">
              {user?.username}
              {user?.factory ? (
                <span className="text-slate-500"> · Factory {formatFactoryRef(user.factory)}</span>
              ) : null}
            </span>
            <Button
              type="button"
              variant="ghost"
              className="!px-2 !py-1 text-xs"
              onClick={() => {
                logout()
                navigate(paths.login, { replace: true })
              }}
            >
              Log out
            </Button>
          </div>
        </header>

        <div className="border-b border-slate-800 bg-slate-900/40 px-2 py-2 lg:hidden">
          <div className="flex gap-1 overflow-x-auto">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium',
                    isActive ? 'bg-sky-600/30 text-sky-200' : 'text-slate-400',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
