import type { ReactNode } from 'react'
import { Download, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/features/projects/store'
import { useActiveFiscalYear, useActiveProject } from '@/stores/app-store'

/**
 * Standard wrapper for statutory report screens: filter bar, printable
 * letterhead block and the report body.
 */
export function ReportShell({
  title,
  description,
  period,
  filters,
  children,
  notes,
}: {
  title: string
  description?: string
  period?: string
  filters?: ReactNode
  children: ReactNode
  notes?: ReactNode
}) {
  const organization = useProjectStore((s) => s.organization)
  const project = useActiveProject()
  const fy = useActiveFiscalYear()

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => toast.info('Excel export is not wired in the prototype.')}>
              <Download className="size-4" /> Excel
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" /> Print
            </Button>
          </>
        }
      />

      {filters ? <Card className="gap-0 p-3 sm:p-4">{filters}</Card> : null}

      <Card className="gap-4 py-5">
        <header className="space-y-0.5 border-b px-4 pb-4 text-center sm:px-6">
          <p className="text-xs text-muted-foreground">Government of the People's Republic of Bangladesh</p>
          <p className="text-sm font-semibold">{organization.name}</p>
          <p className="text-xs text-muted-foreground">{organization.ministry}</p>
          <p className="pt-2 text-base font-bold">{title}</p>
          <p className="text-xs text-muted-foreground">
            {project.shortName} ({project.code}) · {period ?? fy.label}
          </p>
        </header>
        <div className="px-2 sm:px-4">{children}</div>
        {notes ? <footer className="border-t px-4 pt-3 text-xs text-muted-foreground sm:px-6">{notes}</footer> : null}
      </Card>
    </PageContainer>
  )
}
