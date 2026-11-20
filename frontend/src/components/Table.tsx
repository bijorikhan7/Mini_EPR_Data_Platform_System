import clsx from 'clsx'
import type { ReactNode } from 'react'

import { Skeleton } from '@/components/ui/Skeleton'
import { Spinner } from '@/components/ui/Spinner'

export type Column<T> = {
  id: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

type TableProps<T> = {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  isLoading?: boolean
  emptyText?: string
}

export function Table<T>({ columns, rows, getRowId, isLoading, emptyText = 'No rows.' }: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-8">
        <Spinner />
        <p className="text-sm text-slate-400">Loading…</p>
        <div className="mt-4 w-full space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-10 text-center text-sm text-slate-400">
        {emptyText}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead className="bg-slate-900/80">
          <tr>
            {columns.map((c) => (
              <th
                key={c.id}
                scope="col"
                className={clsx('px-4 py-3 font-medium text-slate-400', c.className)}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950/40">
          {rows.map((row) => (
            <tr key={getRowId(row)} className="hover:bg-slate-900/60">
              {columns.map((c) => (
                <td key={c.id} className={clsx('px-4 py-3 text-slate-200', c.className)}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
