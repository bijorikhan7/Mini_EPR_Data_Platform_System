import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { FullPageSpinner } from '@/components/FullPageSpinner'
import { AppLayout } from '@/layouts/AppLayout'
import { paths } from '@/routes/paths'
import { AppErrorFallback } from '@/routes/AppErrorFallback'
import { RequireAuth } from '@/routes/RequireAuth'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ProductionPage = lazy(() => import('@/pages/ProductionPage'))
const InventoryPage = lazy(() => import('@/pages/InventoryPage'))
const SalesPage = lazy(() => import('@/pages/SalesPage'))
const ProcurementPage = lazy(() => import('@/pages/ProcurementPage'))
const FinancePage = lazy(() => import('@/pages/FinancePage'))
const FactoriesPage = lazy(() => import('@/pages/FactoriesPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))

function SuspensePage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<FullPageSpinner />}>{children}</Suspense>
}

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <AppErrorFallback />,
    children: [
      {
        path: paths.login,
        element: (
          <SuspensePage>
            <LoginPage />
          </SuspensePage>
        ),
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to={paths.dashboard} replace /> },
              {
                path: paths.dashboard,
                element: (
                  <SuspensePage>
                    <DashboardPage />
                  </SuspensePage>
                ),
              },
              {
                path: paths.production,
                element: (
                  <SuspensePage>
                    <ProductionPage />
                  </SuspensePage>
                ),
              },
              {
                path: paths.inventory,
                element: (
                  <SuspensePage>
                    <InventoryPage />
                  </SuspensePage>
                ),
              },
              {
                path: paths.sales,
                element: (
                  <SuspensePage>
                    <SalesPage />
                  </SuspensePage>
                ),
              },
              {
                path: paths.procurement,
                element: (
                  <SuspensePage>
                    <ProcurementPage />
                  </SuspensePage>
                ),
              },
              {
                path: paths.finance,
                element: (
                  <SuspensePage>
                    <FinancePage />
                  </SuspensePage>
                ),
              },
              {
                path: paths.factories,
                element: (
                  <SuspensePage>
                    <FactoriesPage />
                  </SuspensePage>
                ),
              },
              {
                path: paths.reports,
                element: (
                  <SuspensePage>
                    <ReportsPage />
                  </SuspensePage>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
