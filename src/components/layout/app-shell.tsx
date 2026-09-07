import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useUiStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import { CommandPalette } from './command-palette'
import { ModuleNav } from './module-nav'
import { ModuleRail } from './module-rail'
import { Topbar } from './topbar'

export function AppShell() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  // Scroll the content pane, not the window, when the route changes.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background">
      <ModuleRail />
      <ModuleNav
        className={cn(
          'hidden w-64 shrink-0 border-r md:flex',
          collapsed && 'md:hidden',
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main ref={mainRef} id="main" className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
