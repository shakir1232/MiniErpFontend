import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
import {
  adbGroups as seedAdbGroups,
  budgetItems as seedItems,
  contractImplementations as seedContracts,
  expenditureEntries as seedExpenditure,
  groupMappings as seedMappings,
  implementationProblems as seedProblems,
  progressReports as seedProgress,
  tranches as seedTranches,
  yearlyAllocations as seedAllocations,
} from './data/budget'
import type {
  AdbGroup,
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
  mappings: GroupMapping[]
  tranches: Tranche[]
  expenditure: ExpenditureEntry[]
  progress: ProgressReport[]
  problems: ImplementationProblem[]
  contracts: ContractImplementation[]

  addItem: (item: Omit<BudgetItem, 'id'>) => void
  addAdbGroup: (group: Omit<AdbGroup, 'id'>) => void
  addMapping: (mapping: Omit<GroupMapping, 'id'>) => void
  addTranche: (tranche: Omit<Tranche, 'id'>) => void
  addExpenditure: (entry: Omit<ExpenditureEntry, 'id'>) => void
  addProblem: (problem: Omit<ImplementationProblem, 'id'>) => void
}

export const useBudgetStore = create<BudgetState>()((set) => ({
  items: seedItems,
  allocations: seedAllocations,
  adbGroups: seedAdbGroups,
  mappings: seedMappings,
  tranches: seedTranches,
  expenditure: seedExpenditure,
  progress: seedProgress,
  problems: seedProblems,
  contracts: seedContracts,

  addItem: (item) => set((s) => ({ items: [...s.items, { ...item, id: uid('bi') }] })),
  addAdbGroup: (group) => set((s) => ({ adbGroups: [...s.adbGroups, { ...group, id: uid('adb') }] })),
  addMapping: (mapping) => set((s) => ({ mappings: [{ ...mapping, id: uid('gm') }, ...s.mappings] })),
  addTranche: (tranche) => set((s) => ({ tranches: [...s.tranches, { ...tranche, id: uid('tr') }] })),
  addExpenditure: (entry) => set((s) => ({ expenditure: [{ ...entry, id: uid('exp') }, ...s.expenditure] })),
  addProblem: (problem) => set((s) => ({ problems: [{ ...problem, id: uid('ip') }, ...s.problems] })),
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
