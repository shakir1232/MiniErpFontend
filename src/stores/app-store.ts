import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { currentFiscalYear, fiscalYears } from '@/config/fiscal'
import { projects } from '@/features/projects/data/projects'

type AppState = {
  /** Project + fiscal year scope every module reads from. */
  activeProjectId: string
  activeFiscalYearId: string
  setActiveProject: (id: string) => void
  setActiveFiscalYear: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeProjectId: projects[0].id,
      activeFiscalYearId: currentFiscalYear.id,
      setActiveProject: (activeProjectId) => set({ activeProjectId }),
      setActiveFiscalYear: (activeFiscalYearId) => set({ activeFiscalYearId }),
    }),
    { name: 'minierp.app' },
  ),
)

export function useActiveProject() {
  const id = useAppStore((s) => s.activeProjectId)
  return projects.find((p) => p.id === id) ?? projects[0]
}

export function useActiveFiscalYear() {
  const id = useAppStore((s) => s.activeFiscalYearId)
  return fiscalYears.find((f) => f.id === id) ?? currentFiscalYear
}
