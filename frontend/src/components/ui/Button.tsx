import clsx from 'clsx'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary:
    'bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50 shadow-sm shadow-sky-900/40',
  secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-600 disabled:opacity-50',
  ghost: 'bg-transparent text-slate-200 hover:bg-slate-800 disabled:opacity-50',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
})
