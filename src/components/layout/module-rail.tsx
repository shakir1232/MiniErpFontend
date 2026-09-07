import { NavLink, useLocation } from 'react-router-dom'
import { MODULES, findModuleByPath } from '@/config/navigation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

/** Icon rail: one entry per ERP module, mirroring the legacy module sidebars. */
export function ModuleRail() {
  const { pathname } = useLocation()
  const active = findModuleByPath(pathname)
  const can = useAuthStore((s) => s.can)

  return (
    <nav
      aria-label="Modules"
      className="hidden w-[68px] shrink-0 flex-col items-center gap-1 border-r bg-sidebar py-3 md:flex"
    >
      {MODULES.filter((m) => can(m.key)).map((module) => {
        const Icon = module.icon
        const isActive = active?.key === module.key
        return (
          <Tooltip key={module.key}>
            <TooltipTrigger asChild>
              <NavLink
                to={module.basePath}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group flex w-14 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none',
                  isActive
                    ? 'bg-sidebar-primary/12 text-sidebar-primary'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="w-full truncate text-center leading-tight">{module.short}</span>
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="font-medium">{module.title}</p>
              <p className="max-w-52 text-xs opacity-80">{module.description}</p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </nav>
  )
}
