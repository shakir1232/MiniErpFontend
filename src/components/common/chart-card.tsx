import type { ReactNode } from 'react'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
  height = 280,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  height?: number
}) {
  return (
    <Card className={cn('gap-4 py-4', className)}>
      <CardHeader className="px-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <div style={{ height }} className="w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
