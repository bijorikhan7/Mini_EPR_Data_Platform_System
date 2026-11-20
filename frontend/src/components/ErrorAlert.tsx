import clsx from 'clsx'

export function ErrorAlert({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="alert"
      className={clsx(
        'rounded-lg border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-sm text-rose-100',
        className,
      )}
    >
      {message}
    </div>
  )
}
