import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
import { dropById, patchById } from '@/lib/collection'
import {
  adbGroupCategories as seedAdbGroupCategories,
  adbGroups as seedAdbGroups,
  budgetItems as seedItems,
  contractImplementations as seedContracts,
  expenditureEntries as seedExpenditure,
  groupMappings as seedMappings,
  implementationProblems as seedProblems,
  progressReports as seedProgress,
  tranches as seedTranches,
  trancheMappings as seedTrancheMappings,
  yearlyAllocations as seedAllocations,
} from './data/budget'
import type {
  AdbGroup,
  AdbGroupCategory,
  TrancheMapping,
  BudgetItem,
  ContractImplementation,
  ExpenditureEntry,
  GroupMapping,
  ImplementationProblem,
  ProgressReport,
  Tranche,
  YearlyAllocation,
} from './types'

type BudgetState = {
  items: BudgetItem[]
  allocations: YearlyAllocation[]
  adbGroups: AdbGroup[]
  adbGroupCategories: AdbGroupCategory[]
  trancheMappings: TrancheMapping[]
  mappings: GroupMapping[]
  tranches: Tranche[]
  expenditure: ExpenditureEntry[]
  progress: ProgressReport[]
  problems: ImplementationProblem[]
  contracts: ContractImplementation[]

  addItem: (item: Omit<BudgetItem, 'id'>) => void
  updateItem: (id: string, patch: Partial<BudgetItem>) => void
  removeItem: (id: string) => void

  addAdbGroup: (group: Omit<AdbGroup, 'id'>) => void
  updateAdbGroup: (id: string, patch: Partial<AdbGroup>) => void
  removeAdbGroup: (id: string) => void

  addMapping: (mapping: Omit<GroupMapping, 'id'>) => void
  updateMapping: (id: string, patch: Partial<GroupMapping>) => void
  removeMapping: (id: string) => void

  addTranche: (tranche: Omit<Tranche, 'id'>) => void
  updateTranche: (id: string, patch: Partial<Tranche>) => void
  removeTranche: (id: string) => void

  addExpenditure: (entry: Omit<ExpenditureEntry, 'id'>) => void
  updateExpenditure: (id: string, patch: Partial<ExpenditureEntry>) => void
  removeExpenditure: (id: string) => void

  addProblem: (problem: Omit<ImplementationProblem, 'id'>) => void
  updateProblem: (id: string, patch: Partial<ImplementationProblem>) => void
  removeProblem: (id: string) => void

  addAdbGroupCategory: (category: Omit<AdbGroupCategory, 'id'>) => void
  updateAdbGroupCategory: (id: string, patch: Partial<AdbGroupCategory>) => void
  removeAdbGroupCategory: (id: string) => void

  addTrancheMapping: (mapping: Omit<TrancheMapping, 'id'>) => void
  updateTrancheMapping: (id: string, patch: Partial<TrancheMapping>) => void
  removeTrancheMapping: (id: string) => void
}

export const useBudgetStore = create<BudgetState>()((set) => ({
  items: seedItems,
  allocations: seedAllocations,
  adbGroups: seedAdbGroups,
  adbGroupCategories: seedAdbGroupCategories,
  trancheMappings: seedTrancheMappings,
  mappings: seedMappings,
  tranches: seedTranches,
  expenditure: seedExpenditure,
  progress: seedProgress,
  problems: seedProblems,
  contracts: seedContracts,

  addItem: (item) => set((s) => ({ items: [...s.items, { ...item, id: uid('bi') }] })),
  updateItem: (id, patch) => set((s) => ({ items: patchById(s.items, id, patch) })),
  removeItem: (id) => set((s) => ({ items: dropById(s.items, id) })),

  addAdbGroup: (group) => set((s) => ({ adbGroups: [...s.adbGroups, { ...group, id: uid('adb') }] })),
  updateAdbGroup: (id, patch) => set((s) => ({ adbGroups: patchById(s.adbGroups, id, patch) })),
  removeAdbGroup: (id) => set((s) => ({ adbGroups: dropById(s.adbGroups, id) })),

  addMapping: (mapping) => set((s) => ({ mappings: [{ ...mapping, id: uid('gm') }, ...s.mappings] })),
  updateMapping: (id, patch) => set((s) => ({ mappings: patchById(s.mappings, id, patch) })),
  removeMapping: (id) => set((s) => ({ mappings: dropById(s.mappings, id) })),

  addTranche: (tranche) => set((s) => ({ tranches: [...s.tranches, { ...tranche, id: uid('tr') }] })),
  updateTranche: (id, patch) => set((s) => ({ tranches: patchById(s.tranches, id, patch) })),
  removeTranche: (id) => set((s) => ({ tranches: dropById(s.tranches, id) })),

  addExpenditure: (entry) => set((s) => ({ expenditure: [{ ...entry, id: uid('exp') }, ...s.expenditure] })),
  updateExpenditure: (id, patch) => set((s) => ({ expenditure: patchById(s.expenditure, id, patch) })),
  removeExpenditure: (id) => set((s) => ({ expenditure: dropById(s.expenditure, id) })),

  addProblem: (problem) => set((s) => ({ problems: [{ ...problem, id: uid('ip') }, ...s.problems] })),
  updateProblem: (id, patch) => set((s) => ({ problems: patchById(s.problems, id, patch) })),
  removeProblem: (id) => set((s) => ({ problems: dropById(s.problems, id) })),

  addAdbGroupCategory: (category) =>
    set((s) => ({ adbGroupCategories: [...s.adbGroupCategories, { ...category, id: uid('agc') }] })),
  updateAdbGroupCategory: (id, patch) =>
    set((s) => ({ adbGroupCategories: patchById(s.adbGroupCategories, id, patch) })),
  removeAdbGroupCategory: (id) => set((s) => ({ adbGroupCategories: dropById(s.adbGroupCategories, id) })),

  addTrancheMapping: (mapping) =>
    set((s) => ({ trancheMappings: [{ ...mapping, id: uid('tm') }, ...s.trancheMappings] })),
  updateTrancheMapping: (id, patch) => set((s) => ({ trancheMappings: patchById(s.trancheMappings, id, patch) })),
  removeTrancheMapping: (id) => set((s) => ({ trancheMappings: dropById(s.trancheMappings, id) })),
}))

export function useBudgetItemLookup() {
  const items = useBudgetStore((s) => s.items)
  return useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items])
}

export function useAdbGroupLookup() {
  const groups = useBudgetStore((s) => s.adbGroups)
  return useMemo(() => Object.fromEntries(groups.map((g) => [g.id, g])), [groups])
}

/** Allocation and expenditure per budget item for one fiscal year. */
export function useYearlyRows(fiscalYearId: string) {
  const items = useBudgetStore((s) => s.items)
  const allocations = useBudgetStore((s) => s.allocations)

  return useMemo(() => {
    const byItem = new Map(allocations.filter((a) => a.fiscalYearId === fiscalYearId).map((a) => [a.itemId, a]))
    return items.map((item) => {
      const allocation = byItem.get(item.id)
      const allocated = allocation?.allocation ?? 0
      const spent = allocation?.expenditure ?? 0
      return {
        ...item,
        allocation: allocated,
        expenditure: spent,
        balance: allocated - spent,
        utilisation: allocated ? (spent / allocated) * 100 : 0,
      }
    })
  }, [items, allocations, fiscalYearId])
}
