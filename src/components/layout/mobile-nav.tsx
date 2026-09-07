import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { MODULES, findModuleByPath } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Brand } from './brand'
import { cn } from '@/lib/utils'

/** Full navigation tree for phones — every module in one scrollable accordion. */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const activeModule = findModuleByPath(pathname)
  const can = useAuthStore((s) => s.can)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Brand />
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <nav className="flex flex-col gap-1 p-3" aria-label="Main">
            {MODULES.filter((m) => can(m.key)).map((module) => {
              const Icon = module.icon
              const isActiveModule = activeModule?.key === module.key
              return (
                <Collapsible key={module.key} defaultOpen={isActiveModule}>
                  <CollapsibleTrigger
                    className={cn(
                      'group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                      isActiveModule
                        ? 'bg-sidebar-primary/12 font-medium text-sidebar-primary'
                        : 'hover:bg-sidebar-accent',
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-left">{module.title}</span>
                    <ChevronDown className="size-4 shrink-0 opacity-60 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden">
                    <div className="mt-0.5 ml-4 space-y-2 border-l pl-3">
                      {module.sections.map((section) => (
                        <div key={section.title} className="space-y-0.5 pt-1">
                          <p className="px-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                            {section.title}
                          </p>
                          {section.items.map((item) => (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              end
                              onClick={() => setOpen(false)}
                              className={({ isActive }) =>
                                cn(
                                  'block truncate rounded-md px-2 py-1.5 text-[13px]',
                                  isActive
                                    ? 'bg-sidebar-primary/12 font-medium text-sidebar-primary'
                                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent',
                                )
                              }
                            >
                              {item.title}
                            </NavLink>
                          ))}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
