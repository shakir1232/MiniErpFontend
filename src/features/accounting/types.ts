export type AccountNature = 'asset' | 'liability' | 'income' | 'expense'

export type AccountGroup = {
  id: string
  code: string
  name: string
  nature: AccountNature
  parentId: string | null
  level: number
}

export type Ledger = {
  id: string
  code: string
  name: string
  groupId: string
  /** Government economic code used on vouchers and SOE reports. */
  economicCode: string
  openingBalance: number
  debit: number
  credit: number
  isSubsidiary: boolean
  status: 'active' | 'inactive'
}

export type VoucherType = 'debit' | 'credit' | 'journal'
export type VoucherStatus = 'draft' | 'posted' | 'approved' | 'cancelled'

export type VoucherLine = {
  id: string
  ledgerId: string
  description: string
  debit: number
  credit: number
}

export type Voucher = {
  id: string
  voucherNo: string
  type: VoucherType
  date: string
  narration: string
  payee: string
  fundSource: string
  chequeNo: string | null
  amount: number
  status: VoucherStatus
  preparedBy: string
  approvedBy: string | null
  lines: VoucherLine[]
}

export type ChequeRegisterEntry = {
  id: string
  chequeNo: string
  date: string
  bank: string
  accountNo: string
  payee: string
  purpose: string
  amount: number
  voucherNo: string
  status: 'issued' | 'cleared' | 'cancelled' | 'bounced'
}

export type AdviceRegisterEntry = {
  id: string
  adviceNo: string
  date: string
  bank: string
  beneficiaryCount: number
  purpose: string
  amount: number
  fundSource: string
  status: 'draft' | 'submitted' | 'cleared'
}

export type AdvanceRegisterEntry = {
  id: string
  date: string
  party: string
  purpose: string
  advanceAmount: number
  adjustedAmount: number
  voucherNo: string
  status: 'pending' | 'partially released' | 'cleared'
}
