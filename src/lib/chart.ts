/** Chart palette bound to the theme tokens so charts follow light/dark. */
export const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export const axisProps = {
  stroke: 'var(--muted-foreground)',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const

export const gridProps = {
  stroke: 'var(--border)',
  strokeDasharray: '3 3',
  vertical: false,
} as const

export const tooltipStyle = {
  contentStyle: {
    background: 'var(--popover)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--popover-foreground)',
    fontSize: 12,
    boxShadow: '0 4px 16px rgb(0 0 0 / 0.08)',
  },
  labelStyle: { color: 'var(--popover-foreground)', fontWeight: 600, marginBottom: 4 },
  cursor: { fill: 'var(--muted)', opacity: 0.5 },
} as const
