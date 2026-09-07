import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
import { dropById, patchById } from '@/lib/collection'
import {
  challans as seedChallans,
  employeeContracts as seedContracts,
  payrollEmployees as seedPayrollEmployees,
  payrollLines as seedLines,
  payrollRuns as seedRuns,
  salaryAdjustments as seedAdjustments,
} from './data/payroll'
import type { Challan, EmployeeContract, PayrollEmployee, PayrollLine, PayrollRun, SalaryAdjustment } from './types'

type PayrollState = {
  payrollEmployees: PayrollEmployee[]
  contracts: EmployeeContract[]
  adjustments: SalaryAdjustment[]
  runs: PayrollRun[]
  lines: PayrollLine[]
  challans: Challan[]

  addAdjustment: (adjustment: Omit<SalaryAdjustment, 'id'>) => void
  updateAdjustment: (id: string, patch: Partial<SalaryAdjustment>) => void
  removeAdjustment: (id: string) => void
  approveAdjustment: (id: string) => void

  addContract: (contract: Omit<EmployeeContract, 'id'>) => void
  updateContract: (id: string, patch: Partial<EmployeeContract>) => void
  removeContract: (id: string) => void

  setRunStatus: (id: string, status: PayrollRun['status']) => void

  addChallan: (challan: Omit<Challan, 'id'>) => void
  updateChallan: (id: string, patch: Partial<Challan>) => void
  removeChallan: (id: string) => void
}

export const usePayrollStore = create<PayrollState>()((set) => ({
  payrollEmployees: seedPayrollEmployees,
  contracts: seedContracts,
  adjustments: seedAdjustments,
  runs: seedRuns,
  lines: seedLines,
  challans: seedChallans,

  addAdjustment: (adjustment) => set((s) => ({ adjustments: [{ ...adjustment, id: uid('adj') }, ...s.adjustments] })),
  updateAdjustment: (id, patch) => set((s) => ({ adjustments: patchById(s.adjustments, id, patch) })),
  removeAdjustment: (id) => set((s) => ({ adjustments: dropById(s.adjustments, id) })),
  approveAdjustment: (id) => set((s) => ({ adjustments: patchById(s.adjustments, id, { approved: true }) })),

  addContract: (contract) => set((s) => ({ contracts: [{ ...contract, id: uid('ct') }, ...s.contracts] })),
  updateContract: (id, patch) => set((s) => ({ contracts: patchById(s.contracts, id, patch) })),
  removeContract: (id) => set((s) => ({ contracts: dropById(s.contracts, id) })),

  setRunStatus: (id, status) => set((s) => ({ runs: patchById(s.runs, id, { status }) })),

  addChallan: (challan) => set((s) => ({ challans: [{ ...challan, id: uid('chl') }, ...s.challans] })),
  updateChallan: (id, patch) => set((s) => ({ challans: patchById(s.challans, id, patch) })),
  removeChallan: (id) => set((s) => ({ challans: dropById(s.challans, id) })),
}))

export function useRunLines(runId: string | undefined) {
  const lines = usePayrollStore((s) => s.lines)
  return useMemo(() => (runId ? lines.filter((l) => l.runId === runId) : []), [lines, runId])
}

export function useChallansOfKind(kind: Challan['kind']) {
  const challans = usePayrollStore((s) => s.challans)
  return useMemo(() => challans.filter((c) => c.kind === kind), [challans, kind])
}
