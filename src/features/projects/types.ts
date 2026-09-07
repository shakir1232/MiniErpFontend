export type ProjectStatus = 'active' | 'closing' | 'closed' | 'pipeline'

export type Project = {
  id: string
  code: string
  name: string
  shortName: string
  status: ProjectStatus
  ministry: string
  implementingAgency: string
  fundingAgencies: string[]
  sector: string
  projectType: string
  startDate: string
  endDate: string
  /** Total approved cost, BDT. */
  approvedCost: number
  gobShare: number
  paShare: number
  ownFund: number
  cumulativeExpenditure: number
  currentRdppRevision: number
  projectDirector: string
  pdPhone: string
  pdEmail: string
  districts: number
  description: string
}

export type ProjectDirector = {
  id: string
  projectId: string
  name: string
  designation: string
  phone: string
  email: string
  fromDate: string
  toDate: string | null
  current: boolean
}

export type ProjectBankAccount = {
  id: string
  projectId: string
  accountName: string
  accountNo: string
  bank: string
  branch: string
  currency: string
  fundSource: string
  openingBalance: number
  currentBalance: number
  status: 'active' | 'closed'
}

export type ProjectSourceOfFund = {
  id: string
  projectId: string
  source: string
  fundingAgency: string
  category: 'GoB' | 'PA (Loan)' | 'PA (Grant)' | 'Own Fund'
  currency: string
  allocated: number
  released: number
  utilised: number
}

export type ImplementationAgency = {
  id: string
  projectId: string
  name: string
  type: 'Government' | 'Private' | 'Association' | 'NGO'
  focalPerson: string
  contact: string
  contractedTrainees: number
  certifiedTrainees: number
  status: 'active' | 'suspended' | 'completed'
}

export type OrganizationInfo = {
  id: string
  name: string
  shortName: string
  ministry: string
  address: string
  phone: string
  email: string
  website: string
  logoText: string
}
