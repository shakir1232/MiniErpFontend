export type BudgetKind = 'DPP' | 'RDPP' | 'ADP' | 'RADP'
export type BudgetCategory = 'Revenue' | 'Capital'

export type BudgetItem = {
  id: string
  serial: string
  economicCode: string
  description: string
  category: BudgetCategory
  unit: string
  quantity: number
  unitRate: number
  /** Total approved cost for the item across the whole project, BDT. */
  totalCost: number
  gobAmount: number
  paAmount: number
  ownAmount: number
  groupId: string
}

export type YearlyAllocation = {
  id: string
  itemId: string
  fiscalYearId: string
  kind: BudgetKind
  allocation: number
  expenditure: number
}

export type AdbGroup = {
  id: string
  code: string
  name: string
  category: string
  description: string
}

export type GroupMapping = {
  id: string
  adbGroupId: string
  economicCode: string
  ledgerName: string
  remarks: string
}

export type Tranche = {
  id: string
  name: string
  fundSource: string
  fiscalYearId: string
  allocated: number
  released: number
  utilised: number
  status: 'active' | 'closed' | 'pending'
}

export type ExpenditureEntry = {
  id: string
  date: string
  itemId: string
  fiscalYearId: string
  fundSource: string
  amount: number
  voucherNo: string
  remarks: string
}

export type ProgressReport = {
  id: string
  fiscalYearId: string
  month: string
  financialTarget: number
  financialAchievement: number
  physicalTarget: number
  physicalAchievement: number
  cumulativeFinancial: number
  cumulativePhysical: number
}

export type ImplementationProblem = {
  id: string
  quarter: string
  problem: string
  measureTaken: string
  responsible: string
  status: 'open' | 'in review' | 'resolved'
}

export type ContractImplementation = {
  id: string
  packageNo: string
  description: string
  method: 'OTM' | 'RFQ' | 'DPM' | 'QCBS'
  contractValue: number
  contractor: string
  signedOn: string
  completionDate: string
  physicalProgress: number
  financialProgress: number
  status: 'ongoing' | 'completed' | 'tendering'
}

export type TrancheMapping = {
  id: string
  trancheId: string
  adbGroupId: string
  ceilingAmount: number
  claimedAmount: number
  remarks: string
}

export type AdbGroupCategory = {
  id: string
  code: string
  name: string
  description: string
  reportingOrder: number
}
