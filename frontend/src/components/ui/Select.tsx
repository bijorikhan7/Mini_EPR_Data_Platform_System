import clsx from 'clsx'
import { type SelectHTMLAttributes, forwardRef } from 'react'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, error, id, children, ...props },
  ref,
) {
  const selectId = id ?? props.name
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={selectId} className="text-xs font-medium text-slate-400">
          {label}
        </label>
      ) : null}
      <select
        ref={ref}
        id={selectId}
        className={clsx(
          'rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2',
          error && 'border-rose-500',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </div>
  )
})
