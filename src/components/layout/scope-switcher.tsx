import { Check, ChevronsUpDown, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fiscalYears } from '@/config/fiscal'
import { projects } from '@/features/projects/data/projects'
import { useActiveProject, useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'

/** Project + fiscal year scope. Every module reads this from the app store. */
export function ScopeSwitcher() {
  const activeProject = useActiveProject()
  const setActiveProject = useAppStore((s) => s.setActiveProject)
  const fiscalYearId = useAppStore((s) => s.activeFiscalYearId)
  const setFiscalYear = useAppStore((s) => s.setActiveFiscalYear)

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="max-w-[9.5rem] justify-between gap-1.5 sm:max-w-56">
            <FolderKanban className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{activeProject.shortName}</span>
            <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[min(22rem,90vw)]">
          <DropdownMenuLabel>Active project</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onSelect={() => setActiveProject(project.id)}
              className="items-start gap-2"
            >
              <Check
                className={cn('mt-0.5 size-4 shrink-0', project.id === activeProject.id ? 'opacity-100' : 'opacity-0')}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{project.shortName}</span>
                <span className="block truncate text-xs text-muted-foreground">{project.code}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Select value={fiscalYearId} onValueChange={setFiscalYear}>
        <SelectTrigger size="sm" className="hidden w-[7.75rem] lg:flex" aria-label="Fiscal year">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {fiscalYears.map((fy) => (
            <SelectItem key={fy.id} value={fy.id}>
              {fy.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
