import type { ReactNode } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export type RowActionsProps = {
  onEdit?: () => void
  onDelete?: () => void
  /** Extra items shown in the overflow menu. */
  extra?: { label: string; icon?: ReactNode; onSelect: () => void; destructive?: boolean }[]
}

/**
 * Edit and delete controls for a table row.
 * Icon buttons stay visible so the actions are discoverable without hovering;
 * anything extra collapses into an overflow menu.
 */
export function RowActions({ onEdit, onDelete, extra }: RowActionsProps) {
  const stop = (event: React.MouseEvent) => event.stopPropagation()

  return (
    <div className="flex items-center justify-end gap-0.5" onClick={stop}>
      {onEdit ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Edit"
              onClick={(event) => {
                event.stopPropagation()
                onEdit()
              }}
            >
              <Pencil className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
      ) : null}

      {onDelete ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              aria-label="Delete"
              onClick={(event) => {
                event.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      ) : null}

      {extra?.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" aria-label="More actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {extra.map((item, index) => (
              <div key={item.label}>
                {index > 0 && item.destructive ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem
                  variant={item.destructive ? 'destructive' : 'default'}
                  onSelect={(event) => {
                    event.stopPropagation()
                    item.onSelect()
                  }}
                >
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}
