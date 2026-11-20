import type { ReactNode } from 'react'

import { Input } from '@/components/ui/Input'

export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  children,
}: {
  search: string
  onSearchChange: (v: string) => void
  searchPlaceholder?: string
  children?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full max-w-md">
        <Input
          label="Search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          name="search"
        />
      </div>
      {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
    </div>
  )
}
