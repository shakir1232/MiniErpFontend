import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StatusTone = 'neutral' | 'success' | 'warning' | 'destructive' | 'info' | 'primary'

const toneClass: Record<StatusTone, string> = {
  neutral: 'bg-muted text-muted-foreground border-transparent',
  success: 'bg-success/12 text-success border-success/25',
  warning: 'bg-warning/18 text-warning border-warning/30',
  destructive: 'bg-destructive/12 text-destructive border-destructive/25',
  info: 'bg-info/12 text-info border-info/25',
  primary: 'bg-primary/12 text-primary border-primary/25',
}

/** Central status vocabulary so the same word looks identical in every module. */
const REGISTRY: Record<string, StatusTone> = {
  active: 'success',
  approved: 'success',
  posted: 'success',
  paid: 'success',
  completed: 'success',
  certified: 'success',
  received: 'success',
  cleared: 'success',
  draft: 'neutral',
  pipeline: 'neutral',
  closed: 'neutral',
  inactive: 'neutral',
  returned: 'neutral',
  pending: 'warning',
  closing: 'warning',
  processing: 'warning',
  'in review': 'warning',
  submitted: 'warning',
  suspended: 'warning',
  'partially released': 'warning',
  rejected: 'destructive',
  cancelled: 'destructive',
  overdue: 'destructive',
  bounced: 'destructive',
  expired: 'destructive',
  new: 'info',
  issued: 'info',
  dispatched: 'info',
  transferred: 'info',
  assigned: 'info',
  revised: 'primary',
}

export function StatusBadge({
  status,
  tone,
  className,
}: {
  status: string
  tone?: StatusTone
  className?: string
}) {
  const resolved = tone ?? REGISTRY[status.toLowerCase()] ?? 'neutral'
  return (
    <Badge variant="outline" className={cn('capitalize font-medium', toneClass[resolved], className)}>
      {status}
    </Badge>
  )
}
