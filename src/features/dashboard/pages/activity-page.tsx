import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { SectionCard } from '@/components/common/section-card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDateTime, initials } from '@/lib/format'
import { activityFeed } from '../data/dashboard'

export function ActivityPage() {
  return (
    <PageContainer>
      <PageHeader title="Activity feed" description="Recent actions recorded across every module" />
      <SectionCard contentClassName="divide-y p-0">
        {activityFeed.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <Avatar className="mt-0.5 size-8 shrink-0">
              <AvatarFallback className="bg-muted text-[11px] font-semibold">{initials(entry.actor)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-medium">{entry.actor}</span>{' '}
                <span className="text-muted-foreground">{entry.action}</span>{' '}
                <span className="font-medium break-words">{entry.target}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(entry.at)}</p>
            </div>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {entry.module}
            </Badge>
          </div>
        ))}
      </SectionCard>
    </PageContainer>
  )
}
