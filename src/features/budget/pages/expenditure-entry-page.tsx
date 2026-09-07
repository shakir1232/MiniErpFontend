import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MasterPage } from '@/components/common/master-page'
import { StatCard } from '@/components/common/stat-card'
import { fiscalYears } from '@/config/fiscal'
import { formatCurrency, formatDate } from '@/lib/format'
import { useBudgetItemLookup, useBudgetStore } from '../store'
import type { ExpenditureEntry } from '../types'

const FUND_SOURCES = ['ADB Loan 3140-BAN', 'ADB Grant 0387-BAN', 'GoB Development Budget', 'SDC Grant TF-0912']

export function ExpenditureEntryPage() {
  const entries = useBudgetStore((s) => s.expenditure)
  const items = useBudgetStore((s) => s.items)
  const addExpenditure = useBudgetStore((s) => s.addExpenditure)
  const itemById = useBudgetItemLookup()

  const totals = useMemo(() => {
    const total = entries.reduce((s, e) => s + e.amount, 0)
    const bySource = FUND_SOURCES.map((source) => ({
      source,
      amount: entries.filter((e) => e.fundSource === source).reduce((s, e) => s + e.amount, 0),
    })).sort((a, b) => b.amount - a.amount)
    return { total, top: bySource[0], count: entries.length }
  }, [entries])

  const columns = useMemo<ColumnDef<ExpenditureEntry, any>[]>(
    () => [
      { accessorKey: 'date', header: 'Date', meta: { label: 'Date' }, cell: ({ getValue }) => formatDate(getValue<string>()) },
      { accessorKey: 'voucherNo', header: 'Voucher', meta: { label: 'Voucher', className: 'font-mono text-xs' } },
      {
        id: 'item',
        header: 'Budget item',
        meta: { label: 'Budget item' },
        accessorFn: (row) => itemById[row.itemId]?.description ?? '—',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{itemById[row.original.itemId]?.description ?? '—'}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {itemById[row.original.itemId]?.economicCode ?? '—'}
            </p>
          </div>
        ),
      },
      { accessorKey: 'fundSource', header: 'Fund source', meta: { label: 'Fund source' } },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        meta: { label: 'Remarks', hideOnMobile: true },
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        meta: { align: 'right', label: 'Amount' },
        cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
      },
    ],
    [itemById],
  )

  return (
    <MasterPage
      title="Expenditure entry"
      description="Expenditure booked against approved budget items for the running fiscal year"
      addLabel="Add expenditure"
      searchPlaceholder="Search item, voucher or fund source…"
      columns={columns}
      data={entries}
      pageSize={15}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Entries" value={String(totals.count)} />
          <StatCard label="Total booked" value={formatCurrency(totals.total, { compact: true })} tone="info" />
          <StatCard
            label="Largest fund source"
            value={formatCurrency(totals.top?.amount ?? 0, { compact: true })}
            hint={totals.top?.source}
          />
        </div>
      }
      fields={[
        {
          name: 'itemId',
          label: 'Budget item',
          type: 'select',
          required: true,
          span: true,
          options: items.map((i) => ({ value: i.id, label: `${i.economicCode} · ${i.description}` })),
        },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'voucherNo', label: 'Voucher number' },
        {
          name: 'fundSource',
          label: 'Fund source',
          type: 'select',
          required: true,
          options: FUND_SOURCES.map((s) => ({ value: s, label: s })),
        },
        {
          name: 'fiscalYearId',
          label: 'Fiscal year',
          type: 'select',
          required: true,
          defaultValue: 'fy-2026-27',
          options: fiscalYears.map((f) => ({ value: f.id, label: f.label })),
        },
        { name: 'amount', label: 'Amount (BDT)', type: 'number', required: true },
        { name: 'remarks', label: 'Remarks', type: 'textarea', span: true },
      ]}
      onCreate={(v) =>
        addExpenditure({
          date: v.date,
          itemId: v.itemId,
          fiscalYearId: v.fiscalYearId,
          fundSource: v.fundSource,
          amount: Number(v.amount) || 0,
          voucherNo: v.voucherNo || '—',
          remarks: v.remarks,
        })
      }
    />
  )
}
