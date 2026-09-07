import { useEffect } from 'react'
import { resolveTheme, useUiStore } from '@/stores/ui-store'

/** Applies the resolved theme to <html> and follows the OS when set to `system`. */
export function useThemeEffect() {
  const theme = useUiStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    const apply = () => root.classList.toggle('dark', resolveTheme(theme) === 'dark')
    apply()

    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
}
