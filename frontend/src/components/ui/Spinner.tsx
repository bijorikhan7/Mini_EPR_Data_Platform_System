import clsx from 'clsx'

export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-slate-600 border-t-sky-400',
        dim,
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
