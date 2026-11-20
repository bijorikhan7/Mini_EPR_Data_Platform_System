import { type QueryKey, type UseQueryOptions, type UseQueryResult, useQuery } from '@tanstack/react-query'

/**
 * Thin wrapper around React Query for consistent defaults across resource reads.
 */
export function useFetchData<TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 30_000,
    ...options,
  })
}
