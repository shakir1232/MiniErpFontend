import { cn } from '@/lib/utils'
import { organizationInfo } from '@/features/projects/data/projects'

export function Brand({ collapsed = false, className }: { collapsed?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        {organizationInfo.logoText.slice(0, 2)}
      </span>
      {!collapsed ? (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold">{organizationInfo.shortName} MiniERP</span>
          <span className="block truncate text-[11px] text-muted-foreground">Finance Division</span>
        </span>
      ) : null}
    </div>
  )
}
