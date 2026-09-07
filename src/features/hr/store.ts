import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
import { designationGroups as seedGroups, designations as seedDesignations, employeeGroups as seedEmployeeGroups, employees as seedEmployees } from './data/hr'
import type { Designation, DesignationGroup, Employee, EmployeeGroup } from './types'

type HrState = {
  employees: Employee[]
  designations: Designation[]
  designationGroups: DesignationGroup[]
  employeeGroups: EmployeeGroup[]

  addEmployee: (employee: Omit<Employee, 'id'>) => Employee
  updateEmployee: (id: string, patch: Partial<Employee>) => void
  removeEmployee: (id: string) => void

  addDesignation: (designation: Omit<Designation, 'id'>) => void
  removeDesignation: (id: string) => void

  addDesignationGroup: (group: Omit<DesignationGroup, 'id'>) => void
  removeDesignationGroup: (id: string) => void

  addEmployeeGroup: (group: Omit<EmployeeGroup, 'id'>) => void
  removeEmployeeGroup: (id: string) => void
}

export const useHrStore = create<HrState>()((set) => ({
  employees: seedEmployees,
  designations: seedDesignations,
  designationGroups: seedGroups,
  employeeGroups: seedEmployeeGroups,

  addEmployee: (employee) => {
    const created = { ...employee, id: uid('emp') }
    set((s) => ({ employees: [created, ...s.employees] }))
    return created
  },
  updateEmployee: (id, patch) =>
    set((s) => ({ employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
  removeEmployee: (id) => set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),

  addDesignation: (designation) => set((s) => ({ designations: [{ ...designation, id: uid('des') }, ...s.designations] })),
  removeDesignation: (id) => set((s) => ({ designations: s.designations.filter((d) => d.id !== id) })),

  addDesignationGroup: (group) => set((s) => ({ designationGroups: [{ ...group, id: uid('dg') }, ...s.designationGroups] })),
  removeDesignationGroup: (id) => set((s) => ({ designationGroups: s.designationGroups.filter((g) => g.id !== id) })),

  addEmployeeGroup: (group) => set((s) => ({ employeeGroups: [{ ...group, id: uid('eg') }, ...s.employeeGroups] })),
  removeEmployeeGroup: (id) => set((s) => ({ employeeGroups: s.employeeGroups.filter((g) => g.id !== id) })),
}))

/**
 * Denormalised lookups used by tables in HR and Payroll.
 * Memoised so the selector never returns a fresh object to React.
 */
export function useDesignationLookup() {
  const designations = useHrStore((s) => s.designations)
  return useMemo(() => Object.fromEntries(designations.map((d) => [d.id, d])), [designations])
}

export function useEmployeeGroupLookup() {
  const groups = useHrStore((s) => s.employeeGroups)
  return useMemo(() => Object.fromEntries(groups.map((g) => [g.id, g])), [groups])
}

export function useDesignationGroupLookup() {
  const groups = useHrStore((s) => s.designationGroups)
  return useMemo(() => Object.fromEntries(groups.map((g) => [g.id, g])), [groups])
}

export function useEmployeeLookup() {
  const employees = useHrStore((s) => s.employees)
  return useMemo(() => Object.fromEntries(employees.map((e) => [e.id, e])), [employees])
}
