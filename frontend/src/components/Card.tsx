import clsx from 'clsx'
import type { ReactNode } from 'react'

export function Card({
  title,
  subtitle,
  children,
  className,
  actions,
}: {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  actions?: ReactNode
}) {
  return (
    <section
      className={clsx(
        'rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/20 backdrop-blur-sm',
        className,
      )}
    >
      {(title || subtitle || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-lg font-semibold text-slate-100">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  )
}
