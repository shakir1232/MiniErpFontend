import { NavLink, useLocation } from 'react-router-dom'
import { findModuleByPath, MODULES } from '@/config/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/** Second-level menu for whichever module the current route belongs to. */
export function ModuleNav({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const { pathname } = useLocation()
  const module = findModuleByPath(pathname) ?? MODULES[0]
  const Icon = module.icon

  return (
    <div className={cn('flex min-h-0 flex-col bg-sidebar', className)}>
      <div className="flex items-start gap-2.5 border-b px-4 py-3.5">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-sidebar-primary/12 text-sidebar-primary">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{module.title}</p>
          <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">{module.description}</p>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 px-3 py-3">
          {module.sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors',
                          'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none',
                          isActive
                            ? 'bg-sidebar-primary/12 font-medium text-sidebar-primary'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        )
                      }
                    >
                      <span className="min-w-0 truncate">{item.title}</span>
                      {item.planned ? (
                        <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                          soon
                        </Badge>
                      ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
