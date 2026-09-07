import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Standard page gutter + vertical rhythm used by every module screen. */
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-5 p-4 sm:gap-6 sm:p-6', className)}>{children}</div>
}
