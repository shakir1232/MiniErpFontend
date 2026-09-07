import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MasterPage } from '@/components/common/master-page'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import { useChallansOfKind, usePayrollStore } from '../store'
import type { Challan } from '../types'

const toChallan = (v: Record<string, string>) => ({
  challanNo: v.challanNo,
  month: v.month,
  depositDate: v.depositDate,
  bank: v.bank,
  branch: v.branch,
  amount: Number(v.amount) || 0,
  employeeCount: Number(v.employeeCount) || 0,
  economicCode: v.economicCode,
})

export function ChallanPage({ kind }: { kind: Challan['kind'] }) {
  const rows = useChallansOfKind(kind)
  const addChallan = usePayrollStore((s) => s.addChallan)
  const updateChallan = usePayrollStore((s) => s.updateChallan)
  const removeChallan = usePayrollStore((s) => s.removeChallan)
  const isTax = kind === 'tax'

  const totals = useMemo(
    () => ({
      deposited: rows.filter((r) => r.status === 'cleared').reduce((s, r) => s + r.amount, 0),
      pending: rows.filter((r) => r.status !== 'cleared').reduce((s, r) => s + r.amount, 0),
      count: rows.length,
    }),
    [rows],
  )

  const columns = useMemo<ColumnDef<Challan, any>[]>(
    () => [
      {
        accessorKey: 'challanNo',
        header: 'Challan no.',
        meta: { label: 'Challan no.' },
        cell: ({ getValue }) => <span className="font-mono text-sm font-medium">{getValue<string>()}</span>,
      },
      { accessorKey: 'month', header: 'Payroll month', meta: { label: 'Month' } },
      {
        accessorKey: 'depositDate',
        header: 'Deposit date',
        meta: { align: 'right', label: 'Deposit date' },
        cell: ({ getValue }) => formatDate(getValue<string>()),
      },
      {
        id: 'bank',
        header: 'Bank / Branch',
        meta: { label: 'Bank', hideOnMobile: true },
        accessorFn: (row) => `${row.bank} — ${row.branch}`,
      },
      {
        accessorKey: 'economicCode',
        header: 'Economic code',
        meta: { label: 'Economic code', className: 'font-mono text-xs', hideOnMobile: true },
      },
      {
        accessorKey: 'employeeCount',
        header: 'Employees',
        meta: { align: 'right', label: 'Employees' },
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

  return (
    <MasterPage
      title={isTax ? 'TAX challan' : 'VAT challan'}
      description={
        isTax
          ? 'Income tax deducted at source and deposited to the treasury'
          : 'VAT deducted from individual consultants and deposited to the treasury'
      }
      addLabel="Add challan"
      searchPlaceholder="Search challan number or month…"
      columns={columns}
      data={rows}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Challans" value={String(totals.count)} />
          <StatCard label="Cleared" value={formatCurrency(totals.deposited, { compact: true })} tone="success" />
          <StatCard label="Awaiting clearance" value={formatCurrency(totals.pending, { compact: true })} tone="warning" />
        </div>
      }
      fields={[
        { name: 'challanNo', label: 'Challan number', required: true, span: true },
        { name: 'month', label: 'Payroll month', placeholder: 'e.g. September 2026', required: true },
        { name: 'depositDate', label: 'Deposit date', type: 'date', required: true },
        { name: 'bank', label: 'Bank', defaultValue: 'Sonali Bank PLC' },
        { name: 'branch', label: 'Branch', defaultValue: 'Ramna Corporate Branch' },
        {
          name: 'economicCode',
          label: 'Economic code',
          defaultValue: isTax ? '1-1141-0001-0111' : '1-1133-0010-0311',
        },
        { name: 'employeeCount', label: 'Employee count', type: 'number' },
        { name: 'amount', label: 'Amount (BDT)', type: 'number', required: true },
      ]}
      onCreate={(v) => addChallan({ ...toChallan(v), kind, status: 'draft' })}
      onUpdate={(row, v) => updateChallan(row.id, toChallan(v))}
      onDelete={(row) => removeChallan(row.id)}
      rowLabel={(row) => row.challanNo}
    />
  )
}
