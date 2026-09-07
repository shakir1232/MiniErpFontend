import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/empty-state'
import { PageContainer } from '@/components/common/page-container'

export function NotFoundPage() {
  return (
    <PageContainer>
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="The screen you asked for is not part of this prototype."
        action={
          <Button asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    </PageContainer>
  )
}
