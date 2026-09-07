import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { useThemeEffect } from '@/hooks/use-theme'
import { AppRoutes } from './routes'

export function App() {
  useThemeEffect()

  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={200}>
        <AppRoutes />
        <Toaster />
      </TooltipProvider>
    </BrowserRouter>
  )
}
