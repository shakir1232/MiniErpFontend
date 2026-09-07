import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ReportShell } from '@/components/common/report-shell'
import { DataTable } from '@/components/common/data-table'
import { fiscalYears } from '@/config/fiscal'
import { formatCurrency } from '@/lib/format'
import { useBudgetStore } from '../store'

/** Economic-code rows with one column per fiscal year — the classic RDPP sheet. */
export function CodeWiseBudgetPage() {
  const items = useBudgetStore((s) => s.items)
  const allocations = useBudgetStore((s) => s.allocations)

  const rows = useMemo(() => {
    const index = new Map<string, number>()
    for (const allocation of allocations) index.set(`${allocation.itemId}|${allocation.fiscalYearId}`, allocation.allocation)
    return items.map((item) => {
      const years = Object.fromEntries(fiscalYears.map((fy) => [fy.id, index.get(`${item.id}|${fy.id}`) ?? 0]))
      return { ...item, ...years }
    })
  }, [items, allocations])

  const columns = useMemo<ColumnDef<(typeof rows)[number], any>[]>(
    () => [
      { accessorKey: 'economicCode', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
      {
        accessorKey: 'description',
        header: 'Item description',
        meta: { label: 'Item' },
        cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
      },
      ...fiscalYears.map((fy) => ({
        id: fy.id,
        header: fy.label.replace('FY ', ''),
        meta: { align: 'right' as const, label: fy.label, hideOnMobile: !fy.current },
        accessorFn: (row: Record<string, unknown>) => row[fy.id] as number,
        cell: ({ getValue }: { getValue: () => unknown }) => formatCurrency(Number(getValue()), { compact: true }),
      })) as ColumnDef<(typeof rows)[number], any>[],
      {
        accessorKey: 'totalCost',
        header: 'Total',
        meta: { align: 'right', label: 'Total' },
        cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>(), { compact: true })}</span>,
      },
    ],
    [],
  )

  const total = rows.reduce((s, r) => s + r.totalCost, 0)

  return (
    <ReportShell
      title="RDPP Code Wise Budget"
      description="Year-wise distribution of the revised DPP cost by economic code"
      notes={`Total approved cost: ${formatCurrency(total)}`}
    >
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search item or code…"
        pageSize={25}
        dense
        emptyTitle="No budget items"
        footer={
          <div className="flex justify-between font-medium">
            <span>Total approved cost</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
        }
      />
    </ReportShell>
  )
}
