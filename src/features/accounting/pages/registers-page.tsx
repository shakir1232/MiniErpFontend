import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MasterPage } from '@/components/common/master-page'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate, formatNumber, formatPercent } from '@/lib/format'
import { useAccountingStore } from '../store'
import type { AdviceRegisterEntry, AdvanceRegisterEntry, ChequeRegisterEntry } from '../types'

const toCheque = (v: Record<string, string>) => ({
  chequeNo: v.chequeNo,
  date: v.date,
  bank: v.bank,
  accountNo: v.accountNo,
  payee: v.payee,
  purpose: v.purpose,
  amount: Number(v.amount) || 0,
  voucherNo: v.voucherNo || '—',
})

const toAdvice = (v: Record<string, string>) => ({
  adviceNo: v.adviceNo,
  date: v.date,
  bank: v.bank,
  beneficiaryCount: Number(v.beneficiaryCount) || 0,
  purpose: v.purpose,
  amount: Number(v.amount) || 0,
  fundSource: v.fundSource,
})

const toAdvance2 = (v: Record<string, string>) => ({
  date: v.date,
  party: v.party,
  purpose: v.purpose,
  advanceAmount: Number(v.advanceAmount) || 0,
  voucherNo: v.voucherNo || '—',
})

export function ChequeRegisterPage() {
  const cheques = useAccountingStore((s) => s.cheques)
  const addCheque = useAccountingStore((s) => s.addCheque)
  const updateCheque = useAccountingStore((s) => s.updateCheque)
  const removeCheque = useAccountingStore((s) => s.removeCheque)

  const stats = useMemo(
    () => ({
      issued: cheques.filter((c) => c.status === 'issued').length,
      cleared: cheques.filter((c) => c.status === 'cleared').reduce((s, c) => s + c.amount, 0),
      total: cheques.reduce((s, c) => s + c.amount, 0),
    }),
    [cheques],
  )

  const columns = useMemo<ColumnDef<ChequeRegisterEntry, any>[]>(
    () => [
      {
        accessorKey: 'chequeNo',
        header: 'Cheque no.',
        meta: { label: 'Cheque no.' },
        cell: ({ getValue }) => <span className="font-mono text-sm font-medium">{getValue<string>()}</span>,
      },
      { accessorKey: 'date', header: 'Date', meta: { label: 'Date' }, cell: ({ getValue }) => formatDate(getValue<string>()) },
      { accessorKey: 'payee', header: 'Payee', meta: { label: 'Payee' } },
      {
        accessorKey: 'purpose',
        header: 'Purpose',
        meta: { label: 'Purpose', hideOnMobile: true },
        cell: ({ getValue }) => <span className="line-clamp-2 text-muted-foreground">{getValue<string>()}</span>,
      },
      { accessorKey: 'bank', header: 'Bank', meta: { label: 'Bank', hideOnMobile: true } },
      { accessorKey: 'voucherNo', header: 'Voucher', meta: { label: 'Voucher', className: 'font-mono text-xs' } },
      {
        accessorKey: 'amount',
        header: 'Amount',
        meta: { align: 'right', label: 'Amount' },
        cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { align: 'center', label: 'Status' },
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
    ],
    [],
  )

  return (
    <MasterPage
      title="Cheque register"
      description="Every cheque issued against project bank accounts"
      addLabel="Add cheque"
      searchPlaceholder="Search cheque no., payee or voucher…"
      columns={columns}
      data={cheques}
      pageSize={12}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Cheques issued" value={String(cheques.length)} />
          <StatCard label="Awaiting clearance" value={String(stats.issued)} tone="warning" />
          <StatCard label="Cleared value" value={formatCurrency(stats.cleared, { compact: true })} tone="success" />
        </div>
      }
      fields={[
        { name: 'chequeNo', label: 'Cheque number', required: true },
        { name: 'date', label: 'Issue date', type: 'date', required: true },
        { name: 'payee', label: 'Payee', required: true, span: true },
        { name: 'purpose', label: 'Purpose', type: 'textarea', span: true },
        { name: 'bank', label: 'Bank', defaultValue: 'Sonali Bank PLC' },
        { name: 'accountNo', label: 'Account number', defaultValue: '0021-0310-004512' },
        { name: 'voucherNo', label: 'Voucher number' },
        { name: 'amount', label: 'Amount (BDT)', type: 'number', required: true },
      ]}
      onCreate={(v) => addCheque({ ...toCheque(v), status: 'issued' })}
      onUpdate={(row, v) => updateCheque(row.id, toCheque(v))}
      onDelete={(row) => removeCheque(row.id)}
      rowLabel={(row) => row.chequeNo}
    />
  )
}

export function AdviceRegisterPage() {
  const advices = useAccountingStore((s) => s.advices)
  const addAdvice = useAccountingStore((s) => s.addAdvice)
  const updateAdvice = useAccountingStore((s) => s.updateAdvice)
  const removeAdvice = useAccountingStore((s) => s.removeAdvice)

  const columns = useMemo<ColumnDef<AdviceRegisterEntry, any>[]>(
    () => [
      {
        accessorKey: 'adviceNo',
        header: 'Advice no.',
        meta: { label: 'Advice no.' },
        cell: ({ getValue }) => <span className="font-mono text-sm font-medium">{getValue<string>()}</span>,
      },
      { accessorKey: 'date', header: 'Date', meta: { label: 'Date' }, cell: ({ getValue }) => formatDate(getValue<string>()) },
      { accessorKey: 'purpose', header: 'Purpose', meta: { label: 'Purpose' } },
      { accessorKey: 'bank', header: 'Bank', meta: { label: 'Bank', hideOnMobile: true } },
      { accessorKey: 'fundSource', header: 'Fund source', meta: { label: 'Fund source', hideOnMobile: true } },
      {
        accessorKey: 'beneficiaryCount',
        header: 'Beneficiaries',
        meta: { align: 'right', label: 'Beneficiaries' },
        cell: ({ getValue }) => formatNumber(getValue<number>()),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        meta: { align: 'right', label: 'Amount' },
        cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { align: 'center', label: 'Status' },
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
    ],
    [],
  )

  const total = advices.reduce((s, a) => s + a.amount, 0)

  return (
    <MasterPage
      title="Advice register"
      description="Bank advices raised for bulk disbursement to beneficiaries"
      addLabel="Add advice"
      searchPlaceholder="Search advice no. or purpose…"
      columns={columns}
      data={advices}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Advices" value={String(advices.length)} />
          <StatCard label="Total advised" value={formatCurrency(total, { compact: true })} tone="info" />
          <StatCard
            label="Beneficiaries"
            value={formatNumber(advices.reduce((s, a) => s + a.beneficiaryCount, 0))}
          />
        </div>
      }
      fields={[
        { name: 'adviceNo', label: 'Advice number', required: true, span: true },
        { name: 'date', label: 'Advice date', type: 'date', required: true },
        { name: 'bank', label: 'Bank', defaultValue: 'Sonali Bank PLC' },
        { name: 'purpose', label: 'Purpose', required: true, span: true },
        { name: 'fundSource', label: 'Fund source', defaultValue: 'ADB Loan 3140-BAN' },
        { name: 'beneficiaryCount', label: 'Beneficiary count', type: 'number' },
        { name: 'amount', label: 'Amount (BDT)', type: 'number', required: true },
      ]}
      onCreate={(v) => addAdvice({ ...toAdvice(v), status: 'draft' })}
      onUpdate={(row, v) => updateAdvice(row.id, toAdvice(v))}
      onDelete={(row) => removeAdvice(row.id)}
      rowLabel={(row) => row.adviceNo}
    />
  )
}

export function AdvanceRegisterPage() {
  const advances = useAccountingStore((s) => s.advances)
  const addAdvance = useAccountingStore((s) => s.addAdvance)
  const updateAdvance = useAccountingStore((s) => s.updateAdvance)
  const removeAdvance = useAccountingStore((s) => s.removeAdvance)

  const stats = useMemo(() => {
    const total = advances.reduce((s, a) => s + a.advanceAmount, 0)
    const adjusted = advances.reduce((s, a) => s + a.adjustedAmount, 0)
    return { total, adjusted, outstanding: total - adjusted }
  }, [advances])

  const columns = useMemo<ColumnDef<AdvanceRegisterEntry, any>[]>(
    () => [
      { accessorKey: 'date', header: 'Date', meta: { label: 'Date' }, cell: ({ getValue }) => formatDate(getValue<string>()) },
      {
        accessorKey: 'party',
        header: 'Party',
        meta: { label: 'Party' },
        cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'purpose',
        header: 'Purpose',
        meta: { label: 'Purpose', hideOnMobile: true },
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
      },
      { accessorKey: 'voucherNo', header: 'Voucher', meta: { label: 'Voucher', className: 'font-mono text-xs' } },
      {
        accessorKey: 'advanceAmount',
        header: 'Advance',
        meta: { align: 'right', label: 'Advance' },
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        accessorKey: 'adjustedAmount',
        header: 'Adjusted',
        meta: { align: 'right', label: 'Adjusted' },
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        id: 'outstanding',
        header: 'Outstanding',
        meta: { align: 'right', label: 'Outstanding' },
        accessorFn: (row) => row.advanceAmount - row.adjustedAmount,
        cell: ({ getValue }) => (
          <span className={getValue<number>() > 0 ? 'font-medium text-destructive' : 'font-medium'}>
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
      {
        id: 'progress',
        header: 'Adjusted %',
        meta: { align: 'right', label: 'Adjusted %', hideOnMobile: true },
        accessorFn: (row) => (row.advanceAmount ? (row.adjustedAmount / row.advanceAmount) * 100 : 0),
        cell: ({ getValue }) => (
          <div className="flex items-center justify-end gap-2">
            <Progress value={getValue<number>()} className="h-1.5 w-14" />
            <span className="w-10 text-right tabular-nums">{formatPercent(getValue<number>(), 0)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { align: 'center', label: 'Status' },
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
    ],
    [],
  )

  return (
    <MasterPage
      title="Advance control register"
      description="Advances issued to training institutes and staff, and their adjustment status"
      addLabel="Add advance"
      searchPlaceholder="Search party, purpose or voucher…"
      columns={columns}
      data={advances}
      pageSize={12}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Advance issued" value={formatCurrency(stats.total, { compact: true })} />
          <StatCard label="Adjusted" value={formatCurrency(stats.adjusted, { compact: true })} tone="success" />
          <StatCard label="Outstanding" value={formatCurrency(stats.outstanding, { compact: true })} tone="destructive" />
        </div>
      }
      fields={[
        { name: 'party', label: 'Party', required: true, span: true },
        { name: 'purpose', label: 'Purpose', span: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'voucherNo', label: 'Voucher number' },
        { name: 'advanceAmount', label: 'Advance amount (BDT)', type: 'number', required: true },
      ]}
      onCreate={(v) => addAdvance({ ...toAdvance2(v), adjustedAmount: 0, status: 'pending' })}
      onUpdate={(row, v) => updateAdvance(row.id, toAdvance2(v))}
      onDelete={(row) => removeAdvance(row.id)}
      rowLabel={(row) => `${row.party} advance`}
    />
  )
}
