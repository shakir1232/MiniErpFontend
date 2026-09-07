/** Shared display formatters. Prototype-wide currency is BDT. */

const nf = new Intl.NumberFormat('en-US')

export function formatNumber(value: number | null | undefined, fractionDigits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatCurrency(value: number | null | undefined, opts?: { compact?: boolean; symbol?: string }) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const symbol = opts?.symbol ?? '৳'
  if (opts?.compact) return `${symbol}${compactNumber(value)}`
  return `${symbol}${nf.format(Math.round(value))}`
}

/** Bangladeshi accounting shorthand: lakh / crore. */
export function compactNumber(value: number) {
  const abs = Math.abs(value)
  if (abs >= 1e7) return `${(value / 1e7).toFixed(2)} Cr`
  if (abs >= 1e5) return `${(value / 1e5).toFixed(2)} L`
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`
  return nf.format(value)
}

/** Amounts in reports are kept in lakh, matching the legacy ERP's budget sheets. */
export function formatLakh(value: number, fractionDigits = 2) {
  return formatNumber(value / 1e5, fractionDigits)
}

export function formatPercent(value: number | null | undefined, fractionDigits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${value.toFixed(fractionDigits)}%`
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '—'
  return `${formatDate(d)}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
