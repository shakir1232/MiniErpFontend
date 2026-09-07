import { useMemo } from 'react'
import { create } from 'zustand'
import { uid } from '@/lib/id'
import { dropById, patchById } from '@/lib/collection'
import {
  accountGroups as seedGroups,
  adviceRegister as seedAdvice,
  advanceRegister as seedAdvance,
  chequeRegister as seedCheques,
  ledgers as seedLedgers,
  vouchers as seedVouchers,
} from './data/accounting'
import type {
  AccountGroup,
  AdviceRegisterEntry,
  AdvanceRegisterEntry,
  ChequeRegisterEntry,
  Ledger,
  Voucher,
  VoucherType,
} from './types'

type AccountingState = {
  groups: AccountGroup[]
  ledgers: Ledger[]
  vouchers: Voucher[]
  cheques: ChequeRegisterEntry[]
  advices: AdviceRegisterEntry[]
  advances: AdvanceRegisterEntry[]

  addLedger: (ledger: Omit<Ledger, 'id'>) => void
  updateLedger: (id: string, patch: Partial<Ledger>) => void
  removeLedger: (id: string) => void

  addGroup: (group: Omit<AccountGroup, 'id'>) => void

  addVoucher: (voucher: Omit<Voucher, 'id'>) => void
  updateVoucher: (id: string, patch: Partial<Voucher>) => void
  removeVoucher: (id: string) => void
  setVoucherStatus: (id: string, status: Voucher['status']) => void

  addCheque: (cheque: Omit<ChequeRegisterEntry, 'id'>) => void
  updateCheque: (id: string, patch: Partial<ChequeRegisterEntry>) => void
  removeCheque: (id: string) => void

  addAdvice: (advice: Omit<AdviceRegisterEntry, 'id'>) => void
  updateAdvice: (id: string, patch: Partial<AdviceRegisterEntry>) => void
  removeAdvice: (id: string) => void

  addAdvance: (advance: Omit<AdvanceRegisterEntry, 'id'>) => void
  updateAdvance: (id: string, patch: Partial<AdvanceRegisterEntry>) => void
  removeAdvance: (id: string) => void
}

export const useAccountingStore = create<AccountingState>()((set) => ({
  groups: seedGroups,
  ledgers: seedLedgers,
  vouchers: seedVouchers,
  cheques: seedCheques,
  advices: seedAdvice,
  advances: seedAdvance,

  addLedger: (ledger) => set((s) => ({ ledgers: [{ ...ledger, id: uid('led') }, ...s.ledgers] })),
  updateLedger: (id, patch) => set((s) => ({ ledgers: patchById(s.ledgers, id, patch) })),
  removeLedger: (id) => set((s) => ({ ledgers: dropById(s.ledgers, id) })),

  addGroup: (group) => set((s) => ({ groups: [...s.groups, { ...group, id: uid('g') }] })),

  addVoucher: (voucher) => set((s) => ({ vouchers: [{ ...voucher, id: uid('vch') }, ...s.vouchers] })),
  updateVoucher: (id, patch) => set((s) => ({ vouchers: patchById(s.vouchers, id, patch) })),
  removeVoucher: (id) => set((s) => ({ vouchers: dropById(s.vouchers, id) })),
  setVoucherStatus: (id, status) =>
    set((s) => ({
      vouchers: s.vouchers.map((v) =>
        v.id === id ? { ...v, status, approvedBy: status === 'approved' ? 'Md. Shafiqul Islam' : v.approvedBy } : v,
      ),
    })),
  addCheque: (cheque) => set((s) => ({ cheques: [{ ...cheque, id: uid('chq') }, ...s.cheques] })),
  updateCheque: (id, patch) => set((s) => ({ cheques: patchById(s.cheques, id, patch) })),
  removeCheque: (id) => set((s) => ({ cheques: dropById(s.cheques, id) })),

  addAdvice: (advice) => set((s) => ({ advices: [{ ...advice, id: uid('adv') }, ...s.advices] })),
  updateAdvice: (id, patch) => set((s) => ({ advices: patchById(s.advices, id, patch) })),
  removeAdvice: (id) => set((s) => ({ advices: dropById(s.advices, id) })),

  addAdvance: (advance) => set((s) => ({ advances: [{ ...advance, id: uid('advr') }, ...s.advances] })),
  updateAdvance: (id, patch) => set((s) => ({ advances: patchById(s.advances, id, patch) })),
  removeAdvance: (id) => set((s) => ({ advances: dropById(s.advances, id) })),
}))

export function useVouchersOfType(type: VoucherType) {
  const vouchers = useAccountingStore((s) => s.vouchers)
  return useMemo(() => vouchers.filter((v) => v.type === type), [vouchers, type])
}

export function useLedgerLookup() {
  const ledgers = useAccountingStore((s) => s.ledgers)
  return useMemo(() => Object.fromEntries(ledgers.map((l) => [l.id, l])), [ledgers])
}

export function useGroupLookup() {
  const groups = useAccountingStore((s) => s.groups)
  return useMemo(() => Object.fromEntries(groups.map((g) => [g.id, g])), [groups])
}

/** Closing balance follows the ledger's nature: Dr for assets/expenses, Cr otherwise. */
export function ledgerBalance(ledger: Ledger, nature: AccountGroup['nature']) {
  const raw = ledger.openingBalance + ledger.debit - ledger.credit
  return nature === 'asset' || nature === 'expense' ? raw : -raw
}
