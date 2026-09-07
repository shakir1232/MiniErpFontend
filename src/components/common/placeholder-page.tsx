import { Construction } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { EmptyState } from '@/components/common/empty-state'
import { Card } from '@/components/ui/card'
import { findModuleByPath, findNavItemByPath } from '@/config/navigation'

/** Keeps every nav entry reachable while modules are being built out. */
export function PlaceholderPage() {
  const { pathname } = useLocation()
  const match = findNavItemByPath(pathname)
  const module = findModuleByPath(pathname)
  const title = match?.item.title ?? module?.title ?? 'Screen'

  return (
    <PageContainer>
      <PageHeader title={title} description={module?.description} />
      <Card>
        <EmptyState
          icon={Construction}
          title="Screen not built yet"
          description={`“${title}” is mapped in the navigation and will be implemented in a later prototype pass.`}
        />
      </Card>
    </PageContainer>
  )
}
