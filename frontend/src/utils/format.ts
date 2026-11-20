export function formatNumber(n: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)
}

export function formatCurrency(amount: string | number): string {
  const n = typeof amount === 'string' ? Number(amount) : amount
  if (Number.isNaN(n)) return String(amount)
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function formatFactoryRef(factoryId: string | null | undefined): string {
  if (!factoryId) return 'Unassigned'
  return factoryId.slice(0, 8) + '...'
}
