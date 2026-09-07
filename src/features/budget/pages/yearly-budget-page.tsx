import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { StatCard } from '@/components/common/stat-card'
import { ChartCard } from '@/components/common/chart-card'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fiscalYears } from '@/config/fiscal'
import { axisProps, gridProps, tooltipStyle } from '@/lib/chart'
import { compactNumber, formatCurrency, formatPercent } from '@/lib/format'
import { useAppStore } from '@/stores/app-store'
import { useAdbGroupLookup, useYearlyRows } from '../store'
import type { BudgetKind } from '../types'

const COPY: Record<string, { title: string; description: string }> = {
  RDPP: { title: 'RDPP yearly budget', description: 'Revised DPP allocation and expenditure for the selected fiscal year' },
  ADP: { title: 'ADP yearly budget', description: 'Annual Development Programme allocation for the selected fiscal year' },
  RADP: { title: 'RADP yearly budget', description: 'Revised ADP allocation and expenditure for the selected fiscal year' },
  DPP: { title: 'Yearly ADP budget setup', description: 'Distribute the approved cost of each item across fiscal years' },
}

export function YearlyBudgetPage({ kind }: { kind: BudgetKind }) {
  const copy = COPY[kind]
  const storedFy = useAppStore((s) => s.activeFiscalYearId)
  const [fiscalYearId, setFiscalYearId] = useState(storedFy)
  const rows = useYearlyRows(fiscalYearId)
  const groupById = useAdbGroupLookup()

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          allocation: acc.allocation + r.allocation,
          expenditure: acc.expenditure + r.expenditure,
        }),
        { allocation: 0, expenditure: 0 },
      ),
    [rows],
  )

  const byGroup = useMemo(() => {
    const map = new Map<string, { name: string; allocation: number; expenditure: number }>()
    for (const row of rows) {
      const group = groupById[row.groupId]
      const key = group?.name ?? 'Unmapped'
      const current = map.get(key) ?? { name: key, allocation: 0, expenditure: 0 }
      current.allocation += row.allocation
      current.expenditure += row.expenditure
      map.set(key, current)
    }
    return Array.from(map.values())
  }, [rows, groupById])

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    { accessorKey: 'economicCode', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'description',
      header: 'Item',
      meta: { label: 'Item' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.description}</p>
          <p className="truncate text-xs text-muted-foreground">{groupById[row.original.groupId]?.name ?? '—'}</p>
        </div>
      ),
    },
    { accessorKey: 'category', header: 'Category', meta: { align: 'center', label: 'Category', hideOnMobile: true } },
    {
      accessorKey: 'allocation',
      header: 'Allocation',
      meta: { align: 'right', label: 'Allocation' },
      cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
    },
    {
      accessorKey: 'expenditure',
      header: 'Expenditure',
      meta: { align: 'right', label: 'Expenditure' },
      cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      meta: { align: 'right', label: 'Balance' },
      cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
    },
    {
      accessorKey: 'utilisation',
      header: 'Utilisation',
      meta: { align: 'right', label: 'Utilisation' },
      cell: ({ getValue }) => (
        <div className="flex items-center justify-end gap-2">
          <Progress value={getValue<number>()} className="h-1.5 w-14" />
          <span className="w-10 text-right tabular-nums">{formatPercent(getValue<number>(), 0)}</span>
        </div>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          <Select value={fiscalYearId} onValueChange={setFiscalYearId}>
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fiscalYears.map((fy) => (
                <SelectItem key={fy.id} value={fy.id}>
                  {fy.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Allocation" value={formatCurrency(totals.allocation, { compact: true })} />
        <StatCard label="Expenditure" value={formatCurrency(totals.expenditure, { compact: true })} tone="info" />
        <StatCard label="Balance" value={formatCurrency(totals.allocation - totals.expenditure, { compact: true })} tone="warning" />
        <StatCard
          label="Utilisation"
          value={formatPercent(totals.allocation ? (totals.expenditure / totals.allocation) * 100 : 0)}
          tone="success"
        />
      </div>

      <ChartCard title="Allocation by ADB group" description="Allocation versus expenditure for the selected year">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byGroup} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="name" {...axisProps} interval={0} tickFormatter={(v: string) => v.split(' ')[0]} />
            <YAxis {...axisProps} width={52} tickFormatter={(v: number) => compactNumber(v)} />
            <Tooltip {...tooltipStyle} formatter={((v: any, n: any) => [formatCurrency(Number(v)), n]) as any} />
            <Bar dataKey="allocation" name="Allocation" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expenditure" name="Expenditure" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search item or code…"
        pageSize={15}
        dense
        emptyTitle="No allocation"
        footer={
          <div className="flex flex-wrap justify-between gap-2 font-medium">
            <span>Total</span>
            <span className="tabular-nums">
              Allocation {formatCurrency(totals.allocation)} · Expenditure {formatCurrency(totals.expenditure)}
            </span>
          </div>
        }
      />
    </PageContainer>
  )
}
