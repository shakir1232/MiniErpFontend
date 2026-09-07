import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
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
  approveAdjustment: (id: string) => void
  addContract: (contract: Omit<EmployeeContract, 'id'>) => void
  setRunStatus: (id: string, status: PayrollRun['status']) => void
  addChallan: (challan: Omit<Challan, 'id'>) => void
}

export const usePayrollStore = create<PayrollState>()((set) => ({
  payrollEmployees: seedPayrollEmployees,
  contracts: seedContracts,
  adjustments: seedAdjustments,
  runs: seedRuns,
  lines: seedLines,
  challans: seedChallans,

  addAdjustment: (adjustment) => set((s) => ({ adjustments: [{ ...adjustment, id: uid('adj') }, ...s.adjustments] })),
  approveAdjustment: (id) =>
    set((s) => ({ adjustments: s.adjustments.map((a) => (a.id === id ? { ...a, approved: true } : a)) })),
  addContract: (contract) => set((s) => ({ contracts: [{ ...contract, id: uid('ct') }, ...s.contracts] })),
  setRunStatus: (id, status) => set((s) => ({ runs: s.runs.map((r) => (r.id === id ? { ...r, status } : r)) })),
  addChallan: (challan) => set((s) => ({ challans: [{ ...challan, id: uid('chl') }, ...s.challans] })),
}))

export function useRunLines(runId: string | undefined) {
  const lines = usePayrollStore((s) => s.lines)
  return useMemo(() => (runId ? lines.filter((l) => l.runId === runId) : []), [lines, runId])
}

export function useChallansOfKind(kind: Challan['kind']) {
  const challans = usePayrollStore((s) => s.challans)
  return useMemo(() => challans.filter((c) => c.kind === kind), [challans, kind])
}
