import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { ALL_NAV_ITEMS, MODULES } from '@/config/navigation'
import { useUiStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'

export function CommandPalette() {
  const open = useUiStore((s) => s.commandOpen)
  const setOpen = useUiStore((s) => s.setCommandOpen)
  const can = useAuthStore((s) => s.can)
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!useUiStore.getState().commandOpen)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setOpen])

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  const allowedModules = MODULES.filter((m) => can(m.key))

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search MiniERP"
      description="Jump to any module or screen"
      className="sm:max-w-2xl"
    >
      <CommandInput placeholder="Search modules, screens and reports…" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>No match found.</CommandEmpty>
        <CommandGroup heading="Modules">
          {allowedModules.map((module) => {
            const Icon = module.icon
            return (
              <CommandItem key={module.key} value={`module ${module.title}`} onSelect={() => go(module.basePath)}>
                <Icon className="size-4" />
                {module.title}
              </CommandItem>
            )
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Screens">
          {ALL_NAV_ITEMS.filter((item) => can(item.module.key)).map((item) => (
            <CommandItem
              key={item.to}
              value={`${item.module.title} ${item.section} ${item.title}`}
              onSelect={() => go(item.to)}
            >
              <item.module.icon className="size-4 opacity-60" />
              <span className="truncate">{item.title}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">{item.module.short}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
