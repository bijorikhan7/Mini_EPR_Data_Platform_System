import clsx from 'clsx'
import { type InputHTMLAttributes, forwardRef } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, id, ...props },
  ref,
) {
  const inputId = id ?? props.name
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-400">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={clsx(
          'rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 placeholder:text-slate-500 focus:border-sky-500 focus:ring-2',
          error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30',
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </div>
  )
})
