import { fiscalYears } from '@/config/fiscal'
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
} from '../types'

export const adbGroups: AdbGroup[] = [
  { id: 'adb-01', code: 'A', name: 'Civil Works', category: 'Capital', description: 'Construction and renovation of training facilities' },
  { id: 'adb-02', code: 'B', name: 'Equipment & Furniture', category: 'Capital', description: 'Training equipment, IT hardware and furniture' },
  { id: 'adb-03', code: 'C', name: 'Training & Workshop', category: 'Revenue', description: 'Skills training grants, stipends and assessment' },
  { id: 'adb-04', code: 'D', name: 'Consulting Services', category: 'Revenue', description: 'Individual and firm consultancy' },
  { id: 'adb-05', code: 'E', name: 'Project Management', category: 'Revenue', description: 'PMU salaries, operating and administrative cost' },
  { id: 'adb-06', code: 'F', name: 'Contingency', category: 'Revenue', description: 'Physical and price contingency' },
]

export const groupMappings: GroupMapping[] = [
  { id: 'gm-01', adbGroupId: 'adb-03', economicCode: '3821-0001', ledgerName: 'Training Grant to Institutes', remarks: 'Mapped to CoA 4131' },
  { id: 'gm-02', adbGroupId: 'adb-03', economicCode: '3821-0002', ledgerName: 'Trainee Stipend', remarks: 'Mapped to CoA 4132' },
  { id: 'gm-03', adbGroupId: 'adb-03', economicCode: '3821-0003', ledgerName: 'Assessment & Certification Fee', remarks: 'Mapped to CoA 4133' },
  { id: 'gm-04', adbGroupId: 'adb-04', economicCode: '3255-0004', ledgerName: 'Consultancy & Professional Fee', remarks: 'Firm and individual consultants' },
  { id: 'gm-05', adbGroupId: 'adb-05', economicCode: '3111-0001', ledgerName: 'Officers Pay', remarks: 'PMU and PIU staff' },
  { id: 'gm-06', adbGroupId: 'adb-05', economicCode: '3211-0011', ledgerName: 'Office Rent & Utilities', remarks: '' },
  { id: 'gm-07', adbGroupId: 'adb-02', economicCode: '6813-0002', ledgerName: 'Purchase of Computer & Accessories', remarks: 'Capital' },
  { id: 'gm-08', adbGroupId: 'adb-02', economicCode: '6815-0001', ledgerName: 'Purchase of Vehicle', remarks: 'Capital' },
]

type ItemSeed = [string, string, string, 'Revenue' | 'Capital', string, number, number, string]

const ITEM_SEED: ItemSeed[] = [
  ['1', '3111-0001', 'Officers Pay (PMU & PIU)', 'Revenue', 'Person-month', 4_800, 96_000, 'adb-05'],
  ['2', '3111-0002', 'Staff Pay', 'Revenue', 'Person-month', 5_200, 52_000, 'adb-05'],
  ['3', '3211-0001', 'House Rent Allowance', 'Revenue', 'Person-month', 10_000, 34_000, 'adb-05'],
  ['4', '3211-0002', 'Medical Allowance', 'Revenue', 'Person-month', 10_000, 11_000, 'adb-05'],
  ['5', '3211-0011', 'Office Rent & Utilities', 'Revenue', 'Month', 144, 12_50_000, 'adb-05'],
  ['6', '3231-0001', 'Travelling & Transfer Expense', 'Revenue', 'Lump sum', 1, 4_20_00_000, 'adb-05'],
  ['7', '3244-0001', 'Petrol, Oil & Lubricants', 'Revenue', 'Month', 144, 1_80_000, 'adb-05'],
  ['8', '3255-0001', 'Printing & Stationery', 'Revenue', 'Lump sum', 1, 2_40_00_000, 'adb-05'],
  ['9', '3255-0004', 'Consulting Services (Firm)', 'Revenue', 'Package', 12, 1_45_00_000, 'adb-04'],
  ['10', '3255-0005', 'Consulting Services (Individual)', 'Revenue', 'Person-month', 960, 1_80_000, 'adb-04'],
  ['11', '3821-0001', 'Training Grant to Institutes', 'Revenue', 'Trainee', 8_20_000, 26_500, 'adb-03'],
  ['12', '3821-0002', 'Trainee Stipend', 'Revenue', 'Trainee', 6_40_000, 9_600, 'adb-03'],
  ['13', '3821-0003', 'Assessment & Certification Fee', 'Revenue', 'Trainee', 7_10_000, 1_450, 'adb-03'],
  ['14', '3821-0004', 'Job Placement Incentive', 'Revenue', 'Trainee', 3_20_000, 2_100, 'adb-03'],
  ['15', '3258-0001', 'Repair & Maintenance', 'Revenue', 'Lump sum', 1, 1_80_00_000, 'adb-05'],
  ['16', '6813-0002', 'Computer & Accessories', 'Capital', 'Number', 640, 95_000, 'adb-02'],
  ['17', '6815-0001', 'Motor Vehicle', 'Capital', 'Number', 22, 68_00_000, 'adb-02'],
  ['18', '6821-0001', 'Furniture & Fixtures', 'Capital', 'Lot', 48, 6_20_000, 'adb-02'],
  ['19', '7011-0001', 'Renovation of Training Centres', 'Capital', 'Centre', 36, 42_00_000, 'adb-01'],
  ['20', '9111-0001', 'Physical Contingency', 'Revenue', 'Lump sum', 1, 8_40_00_000, 'adb-06'],
  ['21', '9112-0001', 'Price Contingency', 'Revenue', 'Lump sum', 1, 6_20_00_000, 'adb-06'],
]

export const budgetItems: BudgetItem[] = ITEM_SEED.map(([serial, economicCode, description, category, unit, quantity, unitRate, groupId], i) => {
  const totalCost = quantity * unitRate
  const gobShare = category === 'Capital' ? 0.4 : 0.22
  const gobAmount = Math.round(totalCost * gobShare)
  const ownAmount = i % 7 === 0 ? Math.round(totalCost * 0.03) : 0
  return {
    id: `bi-${serial.padStart(2, '0')}`,
    serial,
    economicCode,
    description,
    category,
    unit,
    quantity,
    unitRate,
    totalCost,
    gobAmount,
    paAmount: totalCost - gobAmount - ownAmount,
    ownAmount,
    groupId,
  }
})

/** Spread each item's cost across the five fiscal years with a realistic S-curve. */
const YEAR_WEIGHTS = [0.14, 0.2, 0.24, 0.23, 0.19]

export const yearlyAllocations: YearlyAllocation[] = budgetItems.flatMap((item) =>
  fiscalYears.map((fy, index) => {
    const allocation = Math.round(item.totalCost * YEAR_WEIGHTS[index])
    const spendRatio = index < 3 ? 0.97 : index === 3 ? 0.88 : 0.31
    return {
      id: `ya-${item.id}-${fy.id}`,
      itemId: item.id,
      fiscalYearId: fy.id,
      kind: 'RADP' as const,
      allocation,
      expenditure: Math.round(allocation * spendRatio),
    }
  }),
)

export const tranches: Tranche[] = [
  { id: 'tr-01', name: 'Tranche 1', fundSource: 'ADB Loan 3140-BAN', fiscalYearId: 'fy-2022-23', allocated: 68_00_00_000, released: 68_00_00_000, utilised: 66_12_00_000, status: 'closed' },
  { id: 'tr-02', name: 'Tranche 2', fundSource: 'ADB Loan 3140-BAN', fiscalYearId: 'fy-2023-24', allocated: 74_00_00_000, released: 74_00_00_000, utilised: 72_44_00_000, status: 'closed' },
  { id: 'tr-03', name: 'Tranche 3', fundSource: 'ADB Loan 3140-BAN', fiscalYearId: 'fy-2024-25', allocated: 62_00_00_000, released: 62_00_00_000, utilised: 58_90_00_000, status: 'closed' },
  { id: 'tr-04', name: 'Tranche 4', fundSource: 'ADB Loan 3140-BAN', fiscalYearId: 'fy-2025-26', allocated: 46_00_00_000, released: 27_00_00_000, utilised: 24_18_00_000, status: 'active' },
  { id: 'tr-05', name: 'Tranche 5', fundSource: 'ADB Loan 3140-BAN', fiscalYearId: 'fy-2026-27', allocated: 30_00_00_000, released: 0, utilised: 0, status: 'pending' },
  { id: 'tr-06', name: 'Grant Tranche A', fundSource: 'ADB Grant 0387-BAN', fiscalYearId: 'fy-2025-26', allocated: 24_00_00_000, released: 24_00_00_000, utilised: 22_18_00_000, status: 'closed' },
  { id: 'tr-07', name: 'Grant Tranche B', fundSource: 'ADB Grant 0387-BAN', fiscalYearId: 'fy-2026-27', allocated: 31_20_00_000, released: 24_90_00_000, utilised: 22_00_33_500, status: 'active' },
  { id: 'tr-08', name: 'SDC Instalment 4', fundSource: 'SDC Grant TF-0912', fiscalYearId: 'fy-2026-27', allocated: 8_00_00_000, released: 6_40_00_000, utilised: 5_71_09_800, status: 'active' },
]

const FUND_SOURCES = ['ADB Loan 3140-BAN', 'ADB Grant 0387-BAN', 'GoB Development Budget', 'SDC Grant TF-0912']

export const expenditureEntries: ExpenditureEntry[] = Array.from({ length: 40 }, (_, i) => {
  const item = budgetItems[i % budgetItems.length]
  const month = 9 - Math.floor(i / 14)
  return {
    id: `exp-${String(i + 1).padStart(3, '0')}`,
    date: `2026-${String(Math.max(month, 7)).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
    itemId: item.id,
    fiscalYearId: 'fy-2026-27',
    fundSource: FUND_SOURCES[i % FUND_SOURCES.length],
    amount: 4_00_000 + ((i * 918_233) % 92_00_000),
    voucherNo: `DV-2609-${String(200 + i)}`,
    remarks: ['Against 2nd instalment', 'Monthly bill', 'Final settlement', 'Advance adjustment'][i % 4],
  }
})

const MONTH_NAMES = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June']

export const progressReports: ProgressReport[] = MONTH_NAMES.map((month, i) => {
  const financialTarget = 6_00_00_000 + i * 22_00_000
  const financialAchievement = Math.round(financialTarget * (0.82 + ((i * 7) % 20) / 100))
  const physicalTarget = 7 + i * 0.6
  const physicalAchievement = physicalTarget * (0.85 + ((i * 5) % 18) / 100)
  return {
    id: `pr-${i + 1}`,
    fiscalYearId: 'fy-2026-27',
    month,
    financialTarget,
    financialAchievement: i < 3 ? financialAchievement : 0,
    physicalTarget: Number(physicalTarget.toFixed(1)),
    physicalAchievement: i < 3 ? Number(physicalAchievement.toFixed(1)) : 0,
    cumulativeFinancial: 0,
    cumulativePhysical: 0,
  }
}).map((report, i, all) => ({
  ...report,
  cumulativeFinancial: all.slice(0, i + 1).reduce((s, r) => s + r.financialAchievement, 0),
  cumulativePhysical: Number(all.slice(0, i + 1).reduce((s, r) => s + r.physicalAchievement, 0).toFixed(1)),
}))

export const implementationProblems: ImplementationProblem[] = [
  {
    id: 'ip-01',
    quarter: 'Q1 FY 2026-27',
    problem: 'Delay in signing contracts with two industry associations due to pending board approval.',
    measureTaken: 'Follow-up letters issued; PD held a coordination meeting on 22 August 2026.',
    responsible: 'Deputy Project Director (Training)',
    status: 'in review',
  },
  {
    id: 'ip-02',
    quarter: 'Q1 FY 2026-27',
    problem: 'Stipend disbursement delayed for trainees in three divisional centres because of incomplete bank account data.',
    measureTaken: 'MIS unit ran a data-cleaning drive; 94% of accounts validated by 5 September 2026.',
    responsible: 'MIS Officer',
    status: 'resolved',
  },
  {
    id: 'ip-03',
    quarter: 'Q4 FY 2025-26',
    problem: 'Slow release of GoB allocation in the fourth quarter constrained operating expenditure.',
    measureTaken: 'Request placed with Finance Division; partial release received in June 2026.',
    responsible: 'Assistant Director (Finance)',
    status: 'open',
  },
  {
    id: 'ip-04',
    quarter: 'Q4 FY 2025-26',
    problem: 'Assessment capacity shortfall in the light engineering sector.',
    measureTaken: 'Two additional assessment centres accredited with BTEB.',
    responsible: 'M&E Specialist',
    status: 'resolved',
  },
]

export const contractImplementations: ContractImplementation[] = [
  { id: 'ci-01', packageNo: 'SEIP/G-01/2025', description: 'Supply of computer and IT accessories for 36 training centres', method: 'OTM', contractValue: 6_08_00_000, contractor: 'Smart Technologies (BD) Ltd.', signedOn: '2025-11-12', completionDate: '2026-05-30', physicalProgress: 100, financialProgress: 96, status: 'completed' },
  { id: 'ci-02', packageNo: 'SEIP/G-02/2026', description: 'Procurement of 8 double-cabin pickups', method: 'OTM', contractValue: 5_44_00_000, contractor: 'Uttara Motors Ltd.', signedOn: '2026-02-18', completionDate: '2026-11-30', physicalProgress: 62, financialProgress: 45, status: 'ongoing' },
  { id: 'ci-03', packageNo: 'SEIP/W-03/2026', description: 'Renovation of 12 divisional training centres', method: 'OTM', contractValue: 5_04_00_000, contractor: 'M/s Karim Enterprise', signedOn: '2026-04-02', completionDate: '2027-01-31', physicalProgress: 38, financialProgress: 30, status: 'ongoing' },
  { id: 'ci-04', packageNo: 'SEIP/S-04/2026', description: 'M&E and tracer study consultancy firm', method: 'QCBS', contractValue: 3_60_00_000, contractor: 'Development Insight Ltd.', signedOn: '2026-06-20', completionDate: '2027-06-30', physicalProgress: 18, financialProgress: 15, status: 'ongoing' },
  { id: 'ci-05', packageNo: 'SEIP/G-05/2026', description: 'Supply of training equipment for leather sector', method: 'OTM', contractValue: 4_20_00_000, contractor: '—', signedOn: '—', completionDate: '2027-03-31', physicalProgress: 0, financialProgress: 0, status: 'tendering' },
]

export const adbGroupCategories: AdbGroupCategory[] = [
  { id: 'agc-01', code: 'CAP', name: 'Capital Expenditure', description: 'Civil works, equipment and vehicles', reportingOrder: 1 },
  { id: 'agc-02', code: 'REV', name: 'Recurrent Expenditure', description: 'Salaries, operating cost and consumables', reportingOrder: 2 },
  { id: 'agc-03', code: 'TRN', name: 'Training & Grant', description: 'Training grants, stipends and certification', reportingOrder: 3 },
  { id: 'agc-04', code: 'CON', name: 'Consulting Services', description: 'Firm and individual consultancy', reportingOrder: 4 },
  { id: 'agc-05', code: 'CTG', name: 'Contingency', description: 'Physical and price contingency', reportingOrder: 5 },
]

export const trancheMappings: TrancheMapping[] = tranches.flatMap((tranche, ti) =>
  adbGroups.slice(0, 4).map((group, gi) => {
    const ceiling = Math.round(tranche.allocated * [0.12, 0.18, 0.5, 0.2][gi])
    return {
      id: `tm-${tranche.id}-${group.id}`,
      trancheId: tranche.id,
      adbGroupId: group.id,
      ceilingAmount: ceiling,
      claimedAmount: tranche.status === 'pending' ? 0 : Math.round(ceiling * (0.7 + ((ti * 7 + gi * 3) % 28) / 100)),
      remarks: tranche.status === 'pending' ? 'Awaiting first withdrawal application' : '',
    }
  }),
)
