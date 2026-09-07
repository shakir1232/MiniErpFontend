import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { SectionCard } from '@/components/common/section-card'
import { DetailList } from '@/components/common/detail-list'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { initials } from '@/lib/format'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  if (!user) return null

  return (
    <PageContainer>
      <PageHeader title="My profile" description="Session details for the signed-in prototype user" />
      <SectionCard>
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary/12 text-lg font-semibold text-primary">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.designation}</p>
            <Badge variant="secondary" className="mt-1 capitalize">
              {user.role}
            </Badge>
          </div>
        </div>
        <div className="mt-6">
          <DetailList
            items={[
              { label: 'Email', value: user.email },
              { label: 'User ID', value: user.id },
              { label: 'Role', value: <span className="capitalize">{user.role}</span> },
            ]}
          />
        </div>
      </SectionCard>
    </PageContainer>
  )
}
