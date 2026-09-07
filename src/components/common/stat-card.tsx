import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type StatCardProps = {
  label: string
  value: string
  hint?: string
  icon?: LucideIcon
  trend?: { value: number; label?: string }
  tone?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
  className?: string
}

const toneRing: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
}

export function StatCard({ label, value, hint, icon: Icon, trend, tone = 'default', className }: StatCardProps) {
  const TrendIcon = !trend || trend.value === 0 ? Minus : trend.value > 0 ? ArrowUpRight : ArrowDownRight
  const trendTone = !trend || trend.value === 0 ? 'text-muted-foreground' : trend.value > 0 ? 'text-success' : 'text-destructive'

  return (
    <Card className={cn('gap-0 py-4', className)}>
      <CardContent className="px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <p className="line-clamp-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
            <p className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">{value}</p>
          </div>
          {Icon ? (
            <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', toneRing[tone])}>
              <Icon className="size-4.5" aria-hidden />
            </span>
          ) : null}
        </div>
        {trend || hint ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {trend ? (
              <span className={cn('inline-flex items-center gap-0.5 font-medium tabular-nums', trendTone)}>
                <TrendIcon className="size-3.5" aria-hidden />
                {Math.abs(trend.value).toFixed(1)}%
              </span>
            ) : null}
            {hint || trend?.label ? (
              <span className="text-muted-foreground">{hint ?? trend?.label}</span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
