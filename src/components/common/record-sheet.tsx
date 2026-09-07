import type { ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

/**
 * Side sheet used for create/edit forms across modules.
 * Full-width on mobile, panel on desktop — one pattern everywhere.
 */
export function RecordSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  wide = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={wide ? 'w-full sm:max-w-3xl' : 'w-full sm:max-w-lg'}
      >
        <SheetHeader className="border-b">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer ? <SheetFooter className="border-t">{footer}</SheetFooter> : null}
      </SheetContent>
    </Sheet>
  )
}
