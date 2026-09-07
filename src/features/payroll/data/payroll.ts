import { employees } from '@/features/hr/data/hr'
import type { Challan, EmployeeContract, PayrollEmployee, PayrollLine, PayrollRun, SalaryAdjustment, SalaryStructure } from '../types'

/** SEIP remuneration split: 60 / 25 / 8 / 7 of the consolidated gross. */
export function splitSalary(gross: number): SalaryStructure {
  const basic = Math.round(gross * 0.6)
  const houseRent = Math.round(gross * 0.25)
  const medical = Math.round(gross * 0.08)
  const conveyance = Math.round(gross * 0.07)
  return { basic, houseRent, medical, conveyance, other: gross - basic - houseRent - medical - conveyance, gross }
}

const CONTRACT_TYPES: PayrollEmployee['contractType'][] = ['Regular', 'Individual Consultant', 'Deputation']

export const payrollEmployees: PayrollEmployee[] = employees.map((employee, i) => {
  const contractType = CONTRACT_TYPES[i % 3]
  return {
    id: `pe-${String(i + 1).padStart(3, '0')}`,
    employeeId: employee.id,
    contractType,
    structure: splitSalary(employee.grossSalary),
    taxRate: employee.grossSalary > 1_20_000 ? 15 : employee.grossSalary > 70_000 ? 10 : 5,
    vatApplicable: contractType === 'Individual Consultant',
    pfApplicable: contractType === 'Regular',
    status: employee.status === 'active' ? 'active' : 'inactive',
  }
})

export const employeeContracts: EmployeeContract[] = employees.map((employee, i) => ({
  id: `ct-${String(i + 1).padStart(3, '0')}`,
  employeeId: employee.id,
  contractNo: `SEIP/HR/CON/${2020 + (i % 7)}/${String(100 + i)}`,
  startDate: employee.joiningDate,
  endDate: employee.contractEndDate,
  monthlyRemuneration: employee.grossSalary,
  incrementPercent: [0, 5, 7.5, 10][i % 4],
  renewalCount: i % 5,
  status: employee.status === 'expired' ? 'expired' : employee.status === 'inactive' ? 'draft' : 'active',
}))

export const salaryAdjustments: SalaryAdjustment[] = employees.slice(0, 14).map((employee, i) => ({
  id: `adj-${String(i + 1).padStart(3, '0')}`,
  employeeId: employee.id,
  month: '2026-08',
  type: (['Arrear', 'Deduction', 'Bonus', 'Leave without pay'] as const)[i % 4],
  amount: [12_000, 4_500, 25_000, 8_200][i % 4] + i * 137,
  remarks: [
    'Increment arrear for July 2026',
    'Excess conveyance recovered',
    'Eid festival bonus',
    'Two days leave without pay',
  ][i % 4],
  approved: i % 3 !== 0,
}))

const RUN_MONTHS: [string, string][] = [
  ['2026-08', 'August 2026'],
  ['2026-07', 'July 2026'],
  ['2026-06', 'June 2026'],
  ['2026-05', 'May 2026'],
  ['2026-04', 'April 2026'],
  ['2026-03', 'March 2026'],
]

function buildLines(runId: string): PayrollLine[] {
  return payrollEmployees
    .filter((pe) => pe.status === 'active')
    .map((pe, i) => {
      const incomeTax = Math.round((pe.structure.gross * pe.taxRate) / 100)
      const vat = pe.vatApplicable ? Math.round(pe.structure.gross * 0.15) : 0
      const providentFund = pe.pfApplicable ? Math.round(pe.structure.basic * 0.1) : 0
      const advanceAdjustment = i % 11 === 0 ? 5_000 : 0
      const revenueStamp = 10
      const total = incomeTax + vat + providentFund + advanceAdjustment + revenueStamp
      return {
        id: `${runId}-${pe.employeeId}`,
        runId,
        employeeId: pe.employeeId,
        structure: pe.structure,
        deductions: { incomeTax, vat, providentFund, advanceAdjustment, revenueStamp, total },
        net: pe.structure.gross - total,
      }
    })
}

export const payrollLines: PayrollLine[] = RUN_MONTHS.flatMap(([month]) => buildLines(`run-${month}`))

export const payrollRuns: PayrollRun[] = RUN_MONTHS.map(([month, label], i) => {
  const lines = payrollLines.filter((l) => l.runId === `run-${month}`)
  const grossTotal = lines.reduce((s, l) => s + l.structure.gross, 0)
  const deductionTotal = lines.reduce((s, l) => s + l.deductions.total, 0)
  return {
    id: `run-${month}`,
    month,
    label,
    employeeCount: lines.length,
    grossTotal,
    deductionTotal,
    netTotal: grossTotal - deductionTotal,
    status: i === 0 ? 'approved' : i === 1 ? 'paid' : 'paid',
    processedOn: `${month}-28`,
    processedBy: 'Tanvir Hossain',
  }
})

export const challans: Challan[] = RUN_MONTHS.flatMap(([month, label], i) => {
  const lines = payrollLines.filter((l) => l.runId === `run-${month}`)
  const tax = lines.reduce((s, l) => s + l.deductions.incomeTax, 0)
  const vat = lines.reduce((s, l) => s + l.deductions.vat, 0)
  return [
    {
      id: `chl-tax-${month}`,
      challanNo: `TR-${2026}${String(12 - i).padStart(2, '0')}-${4471000 + i}`,
      kind: 'tax' as const,
      month: label,
      depositDate: `${month}-30`,
      bank: 'Sonali Bank PLC',
      branch: 'Ramna Corporate Branch',
      amount: tax,
      employeeCount: lines.length,
      economicCode: '1-1141-0001-0111',
      status: i === 0 ? ('submitted' as const) : ('cleared' as const),
    },
    {
      id: `chl-vat-${month}`,
      challanNo: `VR-${2026}${String(12 - i).padStart(2, '0')}-${5582000 + i}`,
      kind: 'vat' as const,
      month: label,
      depositDate: `${month}-30`,
      bank: 'Sonali Bank PLC',
      branch: 'Ramna Corporate Branch',
      amount: vat,
      employeeCount: lines.filter((l) => l.deductions.vat > 0).length,
      economicCode: '1-1133-0010-0311',
      status: i === 0 ? ('draft' as const) : ('cleared' as const),
    },
  ]
})
