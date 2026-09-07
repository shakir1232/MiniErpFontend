import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ReportShell } from '@/components/common/report-shell'
import { DataTable } from '@/components/common/data-table'
import { ChartCard } from '@/components/common/chart-card'
import { FormField } from '@/components/common/form-field'
import { StatusBadge } from '@/components/common/status-badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fiscalYears } from '@/config/fiscal'
import { axisProps, gridProps, tooltipStyle } from '@/lib/chart'
import { compactNumber, formatCurrency, formatDate, formatPercent } from '@/lib/format'
import { useAppStore } from '@/stores/app-store'
import { useAdbGroupLookup, useBudgetStore, useYearlyRows } from '../store'
import type { ContractImplementation, ImplementationProblem } from '../types'

/* --------------------------------- Variance report -------------------------------- */

export function VarianceReportPage({ label }: { label: 'RDPP' | 'RADP' }) {
  const storedFy = useAppStore((s) => s.activeFiscalYearId)
  const [fiscalYearId, setFiscalYearId] = useState(storedFy)
  const rows = useYearlyRows(fiscalYearId)
  const groupById = useAdbGroupLookup()

  const withVariance = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        variance: row.allocation - row.expenditure,
        variancePct: row.allocation ? ((row.allocation - row.expenditure) / row.allocation) * 100 : 0,
        groupName: groupById[row.groupId]?.name ?? '—',
      })),
    [rows, groupById],
  )

  const totals = withVariance.reduce(
    (acc, r) => ({ allocation: acc.allocation + r.allocation, expenditure: acc.expenditure + r.expenditure }),
    { allocation: 0, expenditure: 0 },
  )

  const columns: ColumnDef<(typeof withVariance)[number], any>[] = [
    { accessorKey: 'economicCode', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'description',
      header: 'Item',
      meta: { label: 'Item' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.description}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.groupName}</p>
        </div>
      ),
    },
    {
      accessorKey: 'allocation',
      header: 'Budget',
      meta: { align: 'right', label: 'Budget' },
      cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
    },
    {
      accessorKey: 'expenditure',
      header: 'Actual',
      meta: { align: 'right', label: 'Actual' },
      cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
    },
    {
      accessorKey: 'variance',
      header: 'Variance',
      meta: { align: 'right', label: 'Variance' },
      cell: ({ getValue }) => (
        <span className={getValue<number>() < 0 ? 'text-destructive' : undefined}>
          {formatCurrency(getValue<number>(), { compact: true })}
        </span>
      ),
    },
    {
      accessorKey: 'variancePct',
      header: 'Variance %',
      meta: { align: 'right', label: 'Variance %' },
      cell: ({ getValue }) => formatPercent(getValue<number>(), 1),
    },
  ]

  return (
    <ReportShell
      title={`${label} Variance Report`}
      description="Approved allocation compared with actual expenditure, item by item"
      period={fiscalYears.find((f) => f.id === fiscalYearId)?.label}
      filters={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField label="Fiscal year">
            <Select value={fiscalYearId} onValueChange={setFiscalYearId}>
              <SelectTrigger className="w-full">
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
          </FormField>
        </div>
      }
      notes={`Overall utilisation: ${formatPercent(
        totals.allocation ? (totals.expenditure / totals.allocation) * 100 : 0,
      )}`}
    >
      <DataTable
        columns={columns}
        data={withVariance}
        searchPlaceholder="Search item or code…"
        pageSize={20}
        dense
        emptyTitle="No budget lines"
        footer={
          <div className="flex flex-wrap justify-between gap-2 font-medium">
            <span>Total</span>
            <span className="tabular-nums">
              Budget {formatCurrency(totals.allocation)} · Actual {formatCurrency(totals.expenditure)} · Variance{' '}
              {formatCurrency(totals.allocation - totals.expenditure)}
            </span>
          </div>
        }
      />
    </ReportShell>
  )
}

/* ------------------------------ Tranche expenditure -------------------------------- */

export function TrancheExpenditurePage() {
  const tranches = useBudgetStore((s) => s.tranches)
  const fyById = useMemo(() => Object.fromEntries(fiscalYears.map((f) => [f.id, f])), [])

  const columns = useMemo<ColumnDef<(typeof tranches)[number], any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Tranche',
        meta: { label: 'Tranche' },
        cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
      },
      { accessorKey: 'fundSource', header: 'Fund source', meta: { label: 'Fund source' } },
      {
        id: 'fy',
        header: 'Fiscal year',
        meta: { label: 'Fiscal year' },
        accessorFn: (row) => fyById[row.fiscalYearId]?.label ?? '—',
      },
      {
        accessorKey: 'released',
        header: 'Released',
        meta: { align: 'right', label: 'Released' },
        cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
      },
      {
        accessorKey: 'utilised',
        header: 'Expenditure',
        meta: { align: 'right', label: 'Expenditure' },
        cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
      },
      {
        id: 'unspent',
        header: 'Unspent',
        meta: { align: 'right', label: 'Unspent' },
        accessorFn: (row) => row.released - row.utilised,
        cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
      },
      {
        id: 'rate',
        header: 'Burn rate',
        meta: { align: 'right', label: 'Burn rate' },
        accessorFn: (row) => (row.released ? (row.utilised / row.released) * 100 : 0),
        cell: ({ getValue }) => (
          <div className="flex items-center justify-end gap-2">
            <Progress value={getValue<number>()} className="h-1.5 w-14" />
            <span className="w-10 text-right tabular-nums">{formatPercent(getValue<number>(), 0)}</span>
          </div>
        ),
      },
    ],
    [fyById],
  )

  const totals = tranches.reduce(
    (acc, t) => ({ released: acc.released + t.released, utilised: acc.utilised + t.utilised }),
    { released: 0, utilised: 0 },
  )

  return (
    <ReportShell
      title="Tranche Wise Expenditure Statement"
      description="Expenditure charged against each released tranche"
      notes={`Unspent balance: ${formatCurrency(totals.released - totals.utilised)}`}
    >
      <DataTable
        columns={columns}
        data={tranches}
        searchPlaceholder="Search tranche…"
        dense
        emptyTitle="No tranches"
        footer={
          <div className="flex flex-wrap justify-between gap-2 font-medium">
            <span>Total</span>
            <span className="tabular-nums">
              Released {formatCurrency(totals.released)} · Expenditure {formatCurrency(totals.utilised)}
            </span>
          </div>
        }
      />
    </ReportShell>
  )
}

/* ------------------------------- IMED progress reports ----------------------------- */

export function ProgressReportPage({
  variant,
}: {
  variant: 'imed-monthly' | 'imed-quarterly' | 'target-achievement' | 'erd-monthly' | 'quarterly-financial'
}) {
  const progress = useBudgetStore((s) => s.progress)

  const COPY = {
    'imed-monthly': { title: 'IMED Monthly Progress Report', description: 'Monthly physical and financial progress reported to IMED' },
    'imed-quarterly': { title: 'IMED Quarterly Progress Report', description: 'Quarterly consolidation of physical and financial progress' },
    'target-achievement': { title: 'Target and Achievement', description: 'Month-wise target against achievement' },
    'erd-monthly': { title: 'ERD Monthly Report', description: 'Monthly utilisation reported to the Economic Relations Division' },
    'quarterly-financial': { title: 'Quarterly Financial Progress Report', description: 'Financial progress consolidated by quarter' },
  }[variant]

  const quarterly = useMemo(() => {
    const quarters = [
      ['Q1 (Jul–Sep)', 0, 3],
      ['Q2 (Oct–Dec)', 3, 6],
      ['Q3 (Jan–Mar)', 6, 9],
      ['Q4 (Apr–Jun)', 9, 12],
    ] as const
    return quarters.map(([label, start, end]) => {
      const slice = progress.slice(start, end)
      return {
        id: label,
        month: label,
        financialTarget: slice.reduce((s, r) => s + r.financialTarget, 0),
        financialAchievement: slice.reduce((s, r) => s + r.financialAchievement, 0),
        physicalTarget: Number(slice.reduce((s, r) => s + r.physicalTarget, 0).toFixed(1)),
        physicalAchievement: Number(slice.reduce((s, r) => s + r.physicalAchievement, 0).toFixed(1)),
        cumulativeFinancial: slice.at(-1)?.cumulativeFinancial ?? 0,
        cumulativePhysical: slice.at(-1)?.cumulativePhysical ?? 0,
      }
    })
  }, [progress])

  const isQuarterly = variant === 'imed-quarterly' || variant === 'quarterly-financial'
  const rows = isQuarterly ? quarterly : progress

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    {
      accessorKey: 'month',
      header: isQuarterly ? 'Quarter' : 'Month',
      meta: { label: isQuarterly ? 'Quarter' : 'Month' },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'financialTarget',
      header: 'Financial target',
      meta: { align: 'right', label: 'Financial target' },
      cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
    },
    {
      accessorKey: 'financialAchievement',
      header: 'Financial achievement',
      meta: { align: 'right', label: 'Financial achievement' },
      cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
    },
    {
      id: 'financialPct',
      header: 'Financial %',
      meta: { align: 'right', label: 'Financial %' },
      accessorFn: (row) => (row.financialTarget ? (row.financialAchievement / row.financialTarget) * 100 : 0),
      cell: ({ getValue }) => formatPercent(getValue<number>(), 0),
    },
    {
      accessorKey: 'physicalTarget',
      header: 'Physical target %',
      meta: { align: 'right', label: 'Physical target %', hideOnMobile: true },
      cell: ({ getValue }) => formatPercent(getValue<number>(), 1),
    },
    {
      accessorKey: 'physicalAchievement',
      header: 'Physical achievement %',
      meta: { align: 'right', label: 'Physical achievement %', hideOnMobile: true },
      cell: ({ getValue }) => formatPercent(getValue<number>(), 1),
    },
    {
      accessorKey: 'cumulativeFinancial',
      header: 'Cumulative financial',
      meta: { align: 'right', label: 'Cumulative financial', hideOnMobile: true },
      cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
    },
  ]

  return (
    <ReportShell title={COPY.title} description={COPY.description}>
      <div className="space-y-4">
        <ChartCard title="Target vs achievement" description="Financial progress through the year" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={progress} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...axisProps} tickFormatter={(v: string) => v.slice(0, 3)} />
              <YAxis {...axisProps} width={52} tickFormatter={(v: number) => compactNumber(v)} />
              <Tooltip {...tooltipStyle} formatter={((v: any, n: any) => [formatCurrency(Number(v)), n]) as any} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="financialTarget" name="Target" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={26} />
              <Bar dataKey="financialAchievement" name="Achievement" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={26} />
              <Line dataKey="cumulativeFinancial" name="Cumulative" type="monotone" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <DataTable
          columns={columns}
          data={rows}
          searchPlaceholder={null}
          pageSize={12}
          dense
          emptyTitle="No progress data"
        />
      </div>
    </ReportShell>
  )
}

/* --------------------------- Implementation problems (C) --------------------------- */

export function ImplementationProblemsPage() {
  const problems = useBudgetStore((s) => s.problems)

  const columns = useMemo<ColumnDef<ImplementationProblem, any>[]>(
    () => [
      { accessorKey: 'quarter', header: 'Quarter', meta: { label: 'Quarter' } },
      {
        accessorKey: 'problem',
        header: 'Problem identified',
        meta: { label: 'Problem' },
        cell: ({ getValue }) => <span className="block max-w-md">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'measureTaken',
        header: 'Measure taken',
        meta: { label: 'Measure taken' },
        cell: ({ getValue }) => <span className="block max-w-md text-muted-foreground">{getValue<string>()}</span>,
      },
      { accessorKey: 'responsible', header: 'Responsible', meta: { label: 'Responsible', hideOnMobile: true } },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { align: 'center', label: 'Status' },
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} tone={getValue<string>() === 'resolved' ? 'success' : undefined} />,
      },
    ],
    [],
  )

  return (
    <ReportShell
      title="Implementation Problem and Measure — Annexure C"
      description="Issues encountered during implementation and the corrective action taken"
    >
      <DataTable columns={columns} data={problems} searchPlaceholder="Search problem…" dense emptyTitle="No problems recorded" />
    </ReportShell>
  )
}

/* -------------------------- Contract implementation (D) ---------------------------- */

export function ContractImplementationPage() {
  const contracts = useBudgetStore((s) => s.contracts)

  const columns = useMemo<ColumnDef<ContractImplementation, any>[]>(
    () => [
      { accessorKey: 'packageNo', header: 'Package', meta: { label: 'Package', className: 'font-mono text-xs' } },
      {
        accessorKey: 'description',
        header: 'Description',
        meta: { label: 'Description' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="max-w-sm font-medium">{row.original.description}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.contractor}</p>
          </div>
        ),
      },
      { accessorKey: 'method', header: 'Method', meta: { align: 'center', label: 'Method' } },
      {
        accessorKey: 'contractValue',
        header: 'Contract value',
        meta: { align: 'right', label: 'Contract value' },
        cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
      },
      {
        accessorKey: 'signedOn',
        header: 'Signed',
        meta: { align: 'right', label: 'Signed', hideOnMobile: true },
        cell: ({ getValue }) => (getValue<string>() === '—' ? '—' : formatDate(getValue<string>())),
      },
      {
        accessorKey: 'completionDate',
        header: 'Completion',
        meta: { align: 'right', label: 'Completion', hideOnMobile: true },
        cell: ({ getValue }) => formatDate(getValue<string>()),
      },
      {
        accessorKey: 'physicalProgress',
        header: 'Physical',
        meta: { align: 'right', label: 'Physical progress' },
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
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} tone={getValue<string>() === 'ongoing' ? 'info' : undefined} />,
      },
    ],
    [],
  )

  return (
    <ReportShell
      title="Contract Implementation Report — Annexure D"
      description="Procurement packages with contract value and progress"
      notes={`Total contract value: ${formatCurrency(contracts.reduce((s, c) => s + c.contractValue, 0))}`}
    >
      <DataTable columns={columns} data={contracts} searchPlaceholder="Search package or contractor…" dense emptyTitle="No contracts" />
    </ReportShell>
  )
}
