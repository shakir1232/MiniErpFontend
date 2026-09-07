import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type DetailItem = { label: string; value: ReactNode; span?: boolean }

/** Label/value pairs — one column on mobile, two from `sm` up. */
export function DetailList({ items, className }: { items: DetailItem[]; className?: string }) {
  return (
    <dl className={cn('grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2', className)}>
      {items.map((item) => (
        <div key={item.label} className={cn('min-w-0 space-y-0.5', item.span && 'sm:col-span-2')}>
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{item.label}</dt>
          <dd className="text-sm break-words">{item.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}
