import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { ChartCard } from '@/components/common/chart-card'
import { DataTable } from '@/components/common/data-table'
import { StatCard } from '@/components/common/stat-card'
import { Progress } from '@/components/ui/progress'
import { axisProps, gridProps, tooltipStyle } from '@/lib/chart'
import { compactNumber, formatCurrency, formatPercent } from '@/lib/format'
import { useActiveFiscalYear } from '@/stores/app-store'
import { fundSplit, monthlyFlow } from '../data/dashboard'

type FundRow = (typeof fundSplit)[number]

export function FundUtilisationPage() {
  const fy = useActiveFiscalYear()

  const cumulative = useMemo(() => {
    let alloc = 0
    let exp = 0
    return monthlyFlow.map((m) => {
      alloc += m.allocation
      exp += m.expenditure
      return { month: m.month, allocation: alloc, expenditure: exp }
    })
  }, [])

  const totalAllocated = fundSplit.reduce((s, f) => s + f.value, 0)
  const totalReleased = fundSplit.reduce((s, f) => s + f.released, 0)

  const columns: ColumnDef<FundRow, any>[] = [
    {
      accessorKey: 'name',
      header: 'Source of fund',
      meta: { label: 'Source' },
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'value',
      header: 'Allocated',
      meta: { align: 'right', label: 'Allocated' },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      accessorKey: 'released',
      header: 'Released',
      meta: { align: 'right', label: 'Released' },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      id: 'balance',
      header: 'Balance',
      meta: { align: 'right', label: 'Balance' },
      accessorFn: (row) => row.value - row.released,
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      id: 'progress',
      header: 'Release %',
      meta: { align: 'right', label: 'Release %' },
      accessorFn: (row) => (row.released / row.value) * 100,
      cell: ({ getValue }) => (
        <div className="flex items-center justify-end gap-2">
          <Progress value={getValue<number>()} className="h-1.5 w-16" />
          <span className="w-11 text-right tabular-nums">{formatPercent(getValue<number>(), 0)}</span>
        </div>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader title="Fund utilisation" description={`Cumulative position for ${fy.label}`} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total allocated" value={formatCurrency(totalAllocated, { compact: true })} />
        <StatCard
          label="Total released"
          value={formatCurrency(totalReleased, { compact: true })}
          trend={{ value: (totalReleased / totalAllocated) * 100, label: 'of allocation' }}
          tone="info"
        />
        <StatCard
          label="Undrawn balance"
          value={formatCurrency(totalAllocated - totalReleased, { compact: true })}
          tone="warning"
        />
      </div>

      <ChartCard title="Cumulative allocation vs expenditure" description={fy.label} height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cumulative} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="allocFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} width={52} tickFormatter={(v: number) => compactNumber(v)} />
            <Tooltip {...tooltipStyle} formatter={((v: any, n: any) => [formatCurrency(Number(v)), n]) as any} />
            <Area
              dataKey="allocation"
              name="Allocation"
              type="monotone"
              stroke="var(--chart-2)"
              fill="url(#allocFill)"
              strokeWidth={2}
            />
            <Area
              dataKey="expenditure"
              name="Expenditure"
              type="monotone"
              stroke="var(--chart-1)"
              fill="url(#expFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <DataTable
        columns={columns}
        data={fundSplit}
        searchPlaceholder="Search fund sources…"
        emptyTitle="No fund sources"
        footer={
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(totalAllocated)}</span>
          </div>
        }
      />
    </PageContainer>
  )
}
