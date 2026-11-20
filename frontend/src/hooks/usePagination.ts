import { useCallback, useMemo, useState } from 'react'

export interface UsePaginationResult {
  page: number
  pageSize: number
  setPage: (p: number) => void
  setPageSize: (s: number) => void
  resetPage: () => void
  offset: number
}

export function usePagination(initialPageSize = 20): UsePaginationResult {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const resetPage = useCallback(() => setPage(1), [])

  const setPageSize = useCallback((s: number) => {
    setPageSizeState(s)
    setPage(1)
  }, [])

  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize])

  return { page, pageSize, setPage, setPageSize, resetPage, offset }
}
