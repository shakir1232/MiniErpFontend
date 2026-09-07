import type {
  AccountGroup,
  AdviceRegisterEntry,
  AdvanceRegisterEntry,
  ChequeRegisterEntry,
  Ledger,
  Voucher,
  VoucherLine,
} from '../types'

export const accountGroups: AccountGroup[] = [
  { id: 'g-1', code: '1000', name: 'Assets', nature: 'asset', parentId: null, level: 0 },
  { id: 'g-11', code: '1100', name: 'Current Assets', nature: 'asset', parentId: 'g-1', level: 1 },
  { id: 'g-111', code: '1110', name: 'Cash & Bank', nature: 'asset', parentId: 'g-11', level: 2 },
  { id: 'g-112', code: '1120', name: 'Advances & Receivables', nature: 'asset', parentId: 'g-11', level: 2 },
  { id: 'g-12', code: '1200', name: 'Fixed Assets', nature: 'asset', parentId: 'g-1', level: 1 },

  { id: 'g-2', code: '2000', name: 'Liabilities', nature: 'liability', parentId: null, level: 0 },
  { id: 'g-21', code: '2100', name: 'Current Liabilities', nature: 'liability', parentId: 'g-2', level: 1 },
  { id: 'g-22', code: '2200', name: 'Fund & Reserves', nature: 'liability', parentId: 'g-2', level: 1 },

  { id: 'g-3', code: '3000', name: 'Income', nature: 'income', parentId: null, level: 0 },
  { id: 'g-31', code: '3100', name: 'Fund Received', nature: 'income', parentId: 'g-3', level: 1 },

  { id: 'g-4', code: '4000', name: 'Expenditure', nature: 'expense', parentId: null, level: 0 },
  { id: 'g-41', code: '4100', name: 'Revenue Expenditure', nature: 'expense', parentId: 'g-4', level: 1 },
  { id: 'g-411', code: '4110', name: 'Pay & Allowances', nature: 'expense', parentId: 'g-41', level: 2 },
  { id: 'g-412', code: '4120', name: 'Supplies & Services', nature: 'expense', parentId: 'g-41', level: 2 },
  { id: 'g-413', code: '4130', name: 'Training & Stipend', nature: 'expense', parentId: 'g-41', level: 2 },
  { id: 'g-42', code: '4200', name: 'Capital Expenditure', nature: 'expense', parentId: 'g-4', level: 1 },
]

type LedgerSeed = [string, string, string, string, number, number, number, boolean]

const LEDGER_SEED: LedgerSeed[] = [
  // code, name, groupId, economicCode, opening, debit, credit, isSubsidiary
  ['1111', 'Cash in Hand', 'g-111', '4501-0001', 2_50_000, 84_50_000, 82_10_000, false],
  ['1112', 'Sonali Bank — GoB Account', 'g-111', '4501-0002', 8_50_00_000, 62_40_00_000, 67_78_00_000, false],
  ['1113', 'Sonali Bank — Convertible Taka Account', 'g-111', '4501-0003', 42_00_00_000, 88_20_00_000, 1_19_10_00_000, false],
  ['1114', 'Agrani Bank — Stipend Account', 'g-111', '4501-0004', 6_00_00_000, 34_10_00_000, 39_20_00_000, false],
  ['1121', 'Advance to Training Institutes', 'g-112', '4601-0011', 3_20_00_000, 28_40_00_000, 26_10_00_000, true],
  ['1122', 'Advance to Staff', 'g-112', '4601-0012', 12_00_000, 1_84_00_000, 1_66_00_000, true],
  ['1123', 'Advance Income Tax', 'g-112', '4601-0013', 0, 2_44_00_000, 2_30_00_000, false],
  ['1211', 'Office Equipment', 'g-12', '6813-0001', 4_80_00_000, 1_22_00_000, 0, false],
  ['1212', 'Motor Vehicles', 'g-12', '6815-0001', 7_20_00_000, 88_00_000, 0, false],
  ['1213', 'Furniture & Fixtures', 'g-12', '6821-0001', 1_44_00_000, 32_00_000, 0, false],

  ['2111', 'Income Tax Payable', 'g-21', '1141-0001', 0, 4_20_00_000, 4_46_00_000, false],
  ['2112', 'VAT Payable', 'g-21', '1133-0010', 0, 1_18_00_000, 1_31_00_000, false],
  ['2113', 'Security Deposit — Contractors', 'g-21', '8631-0001', 68_00_000, 22_00_000, 41_00_000, true],
  ['2114', 'Salary Payable', 'g-21', '3111-0001', 0, 28_60_00_000, 28_98_00_000, false],
  ['2211', 'Project Fund — GoB', 'g-22', '8511-0001', 0, 0, 97_10_00_000, false],
  ['2212', 'Project Fund — ADB Loan', 'g-22', '8511-0002', 0, 0, 2_31_00_00_000, false],
  ['2213', 'Project Fund — ADB Grant', 'g-22', '8511-0003', 0, 0, 48_90_00_000, false],
  ['2214', 'Project Fund — SDC Grant', 'g-22', '8511-0004', 0, 0, 26_40_00_000, false],

  ['3111', 'Fund Received — GoB', 'g-31', '8511-0001', 0, 0, 97_10_00_000, false],
  ['3112', 'Fund Received — Project Aid', 'g-31', '8511-0002', 0, 0, 3_06_30_00_000, false],
  ['3113', 'Interest on Bank Deposit', 'g-31', '1451-0001', 0, 0, 3_82_00_000, false],
  ['3114', 'Training Fee Income', 'g-31', '1462-0001', 0, 0, 6_00_00_000, false],

  ['4111', 'Officers Pay', 'g-411', '3111-0001', 0, 18_44_00_000, 0, false],
  ['4112', 'Staff Pay', 'g-411', '3111-0002', 0, 10_16_00_000, 0, false],
  ['4113', 'House Rent Allowance', 'g-411', '3211-0001', 0, 8_12_00_000, 0, false],
  ['4114', 'Medical Allowance', 'g-411', '3211-0002', 0, 2_60_00_000, 0, false],
  ['4115', 'Festival Bonus', 'g-411', '3211-0009', 0, 2_44_00_000, 0, false],
  ['4121', 'Travelling & Transfer Expense', 'g-412', '3231-0001', 0, 3_18_00_000, 0, false],
  ['4122', 'Petrol, Oil & Lubricants', 'g-412', '3244-0001', 0, 1_92_00_000, 0, false],
  ['4123', 'Printing & Stationery', 'g-412', '3255-0001', 0, 1_08_00_000, 0, false],
  ['4124', 'Office Rent & Utilities', 'g-412', '3211-0011', 0, 4_46_00_000, 0, false],
  ['4125', 'Consultancy & Professional Fee', 'g-412', '3255-0004', 0, 12_88_00_000, 0, false],
  ['4126', 'Repair & Maintenance', 'g-412', '3258-0001', 0, 1_36_00_000, 0, false],
  ['4131', 'Training Grant to Institutes', 'g-413', '3821-0001', 0, 1_88_40_00_000, 0, true],
  ['4132', 'Trainee Stipend', 'g-413', '3821-0002', 0, 48_60_00_000, 0, false],
  ['4133', 'Assessment & Certification Fee', 'g-413', '3821-0003', 0, 9_44_00_000, 0, false],
  ['4134', 'Job Placement Incentive', 'g-413', '3821-0004', 0, 6_18_00_000, 0, false],
  ['4211', 'Purchase of Computer & Accessories', 'g-42', '6813-0002', 0, 1_22_00_000, 0, false],
  ['4212', 'Purchase of Vehicle', 'g-42', '6815-0001', 0, 88_00_000, 0, false],
]

export const ledgers: Ledger[] = LEDGER_SEED.map(([code, name, groupId, economicCode, opening, debit, credit, isSubsidiary], i) => ({
  id: `led-${code}`,
  code,
  name,
  groupId,
  economicCode,
  openingBalance: opening,
  debit,
  credit,
  isSubsidiary,
  status: i % 19 === 18 ? 'inactive' : 'active',
}))

const PAYEES = [
  'BGMEA Training Institute',
  'BKMEA Skills Centre',
  'LFMEAB Training Academy',
  'UCEP Bangladesh',
  'Sonali Bank PLC',
  'Bangladesh Computer Council',
  'Rahman Traders',
  'Uttara Motors Ltd.',
  'Padma Printing Press',
  'Grameenphone Ltd.',
  'Dhaka WASA',
  'M/s Karim Enterprise',
]

const NARRATIONS = [
  'Payment of training grant against 2nd instalment',
  'Payment of trainee stipend for the month',
  'Office rent and utility bill payment',
  'Purchase of computer and accessories',
  'Payment of consultancy fee',
  'Fuel bill for project vehicles',
  'Printing of training materials',
  'Fund received from the Finance Division',
  'Adjustment of advance against final bill',
  'Payment of assessment and certification fee',
]

const EXPENSE_LEDGERS = ledgers.filter((l) => l.code.startsWith('41') || l.code.startsWith('42'))
const BANK_LEDGERS = ledgers.filter((l) => ['1112', '1113', '1114'].includes(l.code))

function makeLines(voucherId: string, type: Voucher['type'], amount: number, i: number): VoucherLine[] {
  const expense = EXPENSE_LEDGERS[i % EXPENSE_LEDGERS.length]
  const bank = BANK_LEDGERS[i % BANK_LEDGERS.length]
  if (type === 'credit') {
    return [
      { id: `${voucherId}-1`, ledgerId: bank.id, description: 'Fund received', debit: amount, credit: 0 },
      { id: `${voucherId}-2`, ledgerId: 'led-3112', description: 'Fund received from source', debit: 0, credit: amount },
    ]
  }
  if (type === 'journal') {
    return [
      { id: `${voucherId}-1`, ledgerId: expense.id, description: 'Expense booked', debit: amount, credit: 0 },
      { id: `${voucherId}-2`, ledgerId: 'led-1121', description: 'Advance adjusted', debit: 0, credit: amount },
    ]
  }
  const tax = Math.round(amount * 0.05)
  return [
    { id: `${voucherId}-1`, ledgerId: expense.id, description: expense.name, debit: amount, credit: 0 },
    { id: `${voucherId}-2`, ledgerId: 'led-2111', description: 'Income tax deducted at source', debit: 0, credit: tax },
    { id: `${voucherId}-3`, ledgerId: bank.id, description: `Paid by cheque — ${bank.name}`, debit: 0, credit: amount - tax },
  ]
}

const TYPES: Voucher['type'][] = ['debit', 'debit', 'debit', 'credit', 'journal']

export const vouchers: Voucher[] = Array.from({ length: 48 }, (_, i) => {
  const type = TYPES[i % TYPES.length]
  const id = `vch-${String(i + 1).padStart(3, '0')}`
  const amount = 40_000 + ((i * 137_777) % 48_00_000)
  const month = 9 - Math.floor(i / 8)
  const day = ((i * 3) % 27) + 1
  const prefix = type === 'debit' ? 'DV' : type === 'credit' ? 'CV' : 'JV'
  const status: Voucher['status'] = i % 13 === 0 ? 'draft' : i % 7 === 0 ? 'posted' : 'approved'
  return {
    id,
    voucherNo: `${prefix}-26${String(Math.max(month, 1)).padStart(2, '0')}-${String(100 + i)}`,
    type,
    date: `2026-${String(Math.max(month, 1)).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    narration: NARRATIONS[i % NARRATIONS.length],
    payee: PAYEES[i % PAYEES.length],
    fundSource: ['ADB Loan 3140-BAN', 'ADB Grant 0387-BAN', 'GoB Development Budget', 'SDC Grant TF-0912'][i % 4],
    chequeNo: type === 'debit' ? `CHQ-${4471000 + i * 7}` : null,
    amount,
    status,
    preparedBy: 'Farhana Akter',
    approvedBy: status === 'approved' ? 'Md. Shafiqul Islam' : null,
    lines: makeLines(id, type, amount, i),
  }
})

export const chequeRegister: ChequeRegisterEntry[] = vouchers
  .filter((v) => v.type === 'debit')
  .map((voucher, i) => ({
    id: `chq-${String(i + 1).padStart(3, '0')}`,
    chequeNo: voucher.chequeNo!,
    date: voucher.date,
    bank: ['Sonali Bank PLC', 'Agrani Bank PLC', 'Janata Bank PLC'][i % 3],
    accountNo: ['0021-0310-004512', '0021-0310-004513', '1102-4477-88210'][i % 3],
    payee: voucher.payee,
    purpose: voucher.narration,
    amount: voucher.amount,
    voucherNo: voucher.voucherNo,
    status: i % 11 === 0 ? 'issued' : i % 23 === 0 ? 'cancelled' : 'cleared',
  }))

export const adviceRegister: AdviceRegisterEntry[] = Array.from({ length: 14 }, (_, i) => ({
  id: `adv-${String(i + 1).padStart(3, '0')}`,
  adviceNo: `ADV/SEIP/2026/${String(200 + i)}`,
  date: `2026-${String(9 - Math.floor(i / 3)).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}`,
  bank: ['Sonali Bank PLC', 'Agrani Bank PLC'][i % 2],
  beneficiaryCount: 40 + i * 13,
  purpose: ['Monthly salary disbursement', 'Trainee stipend disbursement', 'Training grant release'][i % 3],
  amount: 32_00_000 + i * 4_18_000,
  fundSource: ['ADB Loan 3140-BAN', 'GoB Development Budget'][i % 2],
  status: i === 0 ? 'draft' : i < 3 ? 'submitted' : 'cleared',
}))

export const advanceRegister: AdvanceRegisterEntry[] = Array.from({ length: 18 }, (_, i) => {
  const advance = 8_00_000 + i * 3_40_000
  const adjusted = i % 4 === 0 ? 0 : i % 3 === 0 ? Math.round(advance * 0.5) : advance
  return {
    id: `advr-${String(i + 1).padStart(3, '0')}`,
    date: `2026-${String(9 - Math.floor(i / 4)).padStart(2, '0')}-${String((i % 26) + 1).padStart(2, '0')}`,
    party: PAYEES[i % PAYEES.length],
    purpose: ['Training grant 1st instalment', 'Advance against assessment fee', 'Advance for office renovation'][i % 3],
    advanceAmount: advance,
    adjustedAmount: adjusted,
    voucherNo: `DV-2609-${String(140 + i)}`,
    status: adjusted === 0 ? 'pending' : adjusted < advance ? 'partially released' : 'cleared',
  }
})
