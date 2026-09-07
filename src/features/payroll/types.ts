export type SalaryStructure = {
  basic: number
  houseRent: number
  medical: number
  conveyance: number
  other: number
  gross: number
}

export type Deductions = {
  incomeTax: number
  vat: number
  providentFund: number
  advanceAdjustment: number
  revenueStamp: number
  total: number
}

export type PayrollEmployee = {
  id: string
  employeeId: string
  contractType: 'Regular' | 'Individual Consultant' | 'Deputation'
  structure: SalaryStructure
  taxRate: number
  vatApplicable: boolean
  pfApplicable: boolean
  status: 'active' | 'inactive'
}

export type EmployeeContract = {
  id: string
  employeeId: string
  contractNo: string
  startDate: string
  endDate: string
  monthlyRemuneration: number
  incrementPercent: number
  renewalCount: number
  status: 'active' | 'expired' | 'draft'
}

export type SalaryAdjustment = {
  id: string
  employeeId: string
  month: string
  type: 'Arrear' | 'Deduction' | 'Bonus' | 'Leave without pay'
  amount: number
  remarks: string
  approved: boolean
}

export type PayrollRunStatus = 'draft' | 'processing' | 'approved' | 'paid'

export type PayrollRun = {
  id: string
  month: string
  label: string
  employeeCount: number
  grossTotal: number
  deductionTotal: number
  netTotal: number
  status: PayrollRunStatus
  processedOn: string
  processedBy: string
}

export type PayrollLine = {
  id: string
  runId: string
  employeeId: string
  structure: SalaryStructure
  deductions: Deductions
  net: number
}

export type Challan = {
  id: string
  challanNo: string
  kind: 'tax' | 'vat'
  month: string
  depositDate: string
  bank: string
  branch: string
  amount: number
  employeeCount: number
  economicCode: string
  status: 'draft' | 'submitted' | 'cleared'
}
