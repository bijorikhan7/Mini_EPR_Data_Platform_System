import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import type { ListQueryParams, Paginated } from '@/api/types'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'

export function usePaginatedList<T, P extends ListQueryParams = ListQueryParams>({
  queryKey,
  fetchPage,
  extraParams = {} as Partial<P>,
  debounceMs = 350,
}: {
  queryKey: readonly unknown[]
  fetchPage: (p: P) => Promise<Paginated<T>>
  extraParams?: Partial<P>
  debounceMs?: number
}) {
  const { page, pageSize, setPage, setPageSize, resetPage } = usePagination()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, debounceMs)

  const extraKey = JSON.stringify(extraParams)
  useEffect(() => {
    resetPage()
  }, [debouncedSearch, extraKey, resetPage])

  const query = useQuery({
    queryKey: [...queryKey, { page, pageSize, search: debouncedSearch, ...extraParams }],
    queryFn: () =>
      fetchPage({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        ...extraParams,
      } as P),
    placeholderData: keepPreviousData,
  })

  return {
    query,
    page,
    pageSize,
    setPage,
    setPageSize,
    search,
    setSearch,
    resetPage,
  }
}
