import type { ProductionListParams } from '@/api/types'

export const queryKeys = {
  profile: ['profile'] as const,
  dashboard: ['dashboard'] as const,
  factories: ['factories'] as const,
  reports: {
    all: ['reports'] as const,
    list: (p: Record<string, unknown>) => ['reports', 'list', p] as const,
  },
  production: {
    all: ['production'] as const,
    list: (p: ProductionListParams) => ['production', 'list', p] as const,
  },
  inventory: {
    list: (p: Record<string, unknown>) => ['inventory', 'list', p] as const,
  },
  sales: {
    list: (p: Record<string, unknown>) => ['sales', 'list', p] as const,
  },
  procurement: {
    list: (p: Record<string, unknown>) => ['procurement', 'list', p] as const,
  },
  finance: {
    list: (p: Record<string, unknown>) => ['finance', 'list', p] as const,
  },
}
