import { MONTHS } from '@/config/fiscal'

export type MonthlyFlow = {
  month: string
  allocation: number
  expenditure: number
  disbursement: number
}

export type FundSplit = { name: string; value: number; released: number }

export type TrainingProgress = {
  sector: string
  target: number
  enrolled: number
  certified: number
  employed: number
}

export type ActivityEntry = {
  id: string
  actor: string
  action: string
  target: string
  module: string
  at: string
}

export type PendingTask = {
  id: string
  title: string
  module: string
  due: string
  priority: 'high' | 'medium' | 'low'
}

/** FY 2026-27 monthly plan vs actuals, BDT. */
export const monthlyFlow: MonthlyFlow[] = [
  { month: 'Jul', allocation: 6_20_00_000, expenditure: 5_41_20_000, disbursement: 6_00_00_000 },
  { month: 'Aug', allocation: 6_20_00_000, expenditure: 6_08_75_000, disbursement: 5_80_00_000 },
  { month: 'Sep', allocation: 7_10_00_000, expenditure: 6_92_40_000, disbursement: 7_00_00_000 },
  { month: 'Oct', allocation: 7_10_00_000, expenditure: 5_88_10_000, disbursement: 6_40_00_000 },
  { month: 'Nov', allocation: 6_80_00_000, expenditure: 7_02_30_000, disbursement: 7_20_00_000 },
  { month: 'Dec', allocation: 8_40_00_000, expenditure: 8_11_60_000, disbursement: 8_00_00_000 },
  { month: 'Jan', allocation: 6_90_00_000, expenditure: 6_35_90_000, disbursement: 6_60_00_000 },
  { month: 'Feb', allocation: 6_50_00_000, expenditure: 6_18_45_000, disbursement: 6_20_00_000 },
  { month: 'Mar', allocation: 7_40_00_000, expenditure: 7_51_10_000, disbursement: 7_10_00_000 },
  { month: 'Apr', allocation: 7_00_00_000, expenditure: 6_44_20_000, disbursement: 6_90_00_000 },
  { month: 'May', allocation: 7_20_00_000, expenditure: 6_98_35_000, disbursement: 7_00_00_000 },
  { month: 'Jun', allocation: 9_20_00_000, expenditure: 8_87_65_000, disbursement: 9_10_00_000 },
]

export const fundSplit: FundSplit[] = [
  { name: 'ADB Loan 3140-BAN', value: 2_80_00_00_000, released: 2_31_00_00_000 },
  { name: 'ADB Grant 0387-BAN', value: 55_20_00_000, released: 48_90_00_000 },
  { name: 'SDC Grant TF-0912', value: 30_00_00_000, released: 26_40_00_000 },
  { name: 'GoB Development Budget', value: 1_12_30_00_000, released: 97_10_00_000 },
  { name: 'Own Fund', value: 21_00_00_000, released: 8_40_00_000 },
]

export const trainingProgress: TrainingProgress[] = [
  { sector: 'RMG & Textile', target: 52_000, enrolled: 49_880, certified: 43_112, employed: 36_910 },
  { sector: 'Leather & Footwear', target: 20_000, enrolled: 18_640, certified: 16_990, employed: 14_002 },
  { sector: 'Light Engineering', target: 16_500, enrolled: 15_220, certified: 13_401, employed: 10_884 },
  { sector: 'ICT', target: 14_000, enrolled: 12_770, certified: 10_442, employed: 8_119 },
  { sector: 'Construction', target: 12_000, enrolled: 11_540, certified: 9_988, employed: 8_450 },
  { sector: 'Agro-food', target: 9_500, enrolled: 8_760, certified: 7_612, employed: 5_930 },
]

export const activityFeed: ActivityEntry[] = [
  {
    id: 'act-01',
    actor: 'Farhana Akter',
    action: 'posted Debit Voucher',
    target: 'DV-2609-0184',
    module: 'Accounting',
    at: '2026-09-07T10:24:00',
  },
  {
    id: 'act-02',
    actor: 'Tanvir Hossain',
    action: 'processed payroll for',
    target: 'August 2026 — 412 employees',
    module: 'Payroll',
    at: '2026-09-07T09:12:00',
  },
  {
    id: 'act-03',
    actor: 'Md. Shafiqul Islam',
    action: 'approved RADP revision',
    target: 'FY 2026-27 (Rev. 1)',
    module: 'Budget',
    at: '2026-09-06T16:40:00',
  },
  {
    id: 'act-04',
    actor: 'Rina Chowdhury',
    action: 'dispatched letter',
    target: 'SEIP/ADM/2026/0912',
    module: 'Letters',
    at: '2026-09-06T14:05:00',
  },
  {
    id: 'act-05',
    actor: 'Kamal Uddin',
    action: 'assigned asset',
    target: 'Laptop — DELL/LT/0442',
    module: 'Assets',
    at: '2026-09-05T11:48:00',
  },
  {
    id: 'act-06',
    actor: 'Farhana Akter',
    action: 'issued cheque',
    target: 'CHQ-4471129 — ৳48,20,000',
    module: 'Accounting',
    at: '2026-09-05T10:02:00',
  },
  {
    id: 'act-07',
    actor: 'Nasrin Sultana',
    action: 'submitted IMED monthly report',
    target: 'August 2026',
    module: 'Budget',
    at: '2026-09-04T17:30:00',
  },
  {
    id: 'act-08',
    actor: 'Sabbir Ahmed',
    action: 'received store items',
    target: 'GRN-2609-0033 — 12 lines',
    module: 'Store',
    at: '2026-09-04T12:15:00',
  },
]

export const pendingTasks: PendingTask[] = [
  { id: 'tsk-01', title: '11 vouchers awaiting approval', module: 'Accounting', due: '2026-09-08', priority: 'high' },
  { id: 'tsk-02', title: 'September payroll not yet processed', module: 'Payroll', due: '2026-09-25', priority: 'medium' },
  { id: 'tsk-03', title: 'IMED quarterly report (Q1) due', module: 'Budget', due: '2026-10-10', priority: 'high' },
  { id: 'tsk-04', title: '6 letters pending dispatch', module: 'Letters', due: '2026-09-09', priority: 'medium' },
  { id: 'tsk-05', title: '3 employee contracts expiring this month', module: 'HR', due: '2026-09-30', priority: 'medium' },
  { id: 'tsk-06', title: 'Fixed asset verification for Q1', module: 'Assets', due: '2026-10-15', priority: 'low' },
]

export const fullMonthLabels = MONTHS
