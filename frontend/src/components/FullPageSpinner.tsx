import { Spinner } from '@/components/ui/Spinner'

export function FullPageSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}
