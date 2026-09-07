import { Bell, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useUiStore } from '@/stores/ui-store'
import { Breadcrumbs } from './breadcrumbs'
import { MobileNav } from './mobile-nav'
import { ScopeSwitcher } from './scope-switcher'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

export function Topbar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const setCommandOpen = useUiStore((s) => s.setCommandOpen)

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-2 backdrop-blur sm:px-4">
      <MobileNav />
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="hidden md:inline-flex"
        aria-label={collapsed ? 'Show module menu' : 'Hide module menu'}
      >
        {collapsed ? <PanelLeftOpen className="size-4.5" /> : <PanelLeftClose className="size-4.5" />}
      </Button>

      <Separator orientation="vertical" className="mx-0.5 hidden !h-5 md:block" />
      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setCommandOpen(true)}
        className="hidden gap-2 text-muted-foreground lg:inline-flex"
      >
        <Search className="size-4" />
        <span>Search…</span>
        <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">⌘K</kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCommandOpen(true)}
        className="lg:hidden"
        aria-label="Search"
      >
        <Search className="size-4.5" />
      </Button>

      <ScopeSwitcher />

      <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex" aria-label="Notifications">
        <Bell className="size-4.5" />
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
      </Button>
      <ThemeToggle />
      <UserMenu />
    </header>
  )
}
