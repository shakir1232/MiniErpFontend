import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MasterPage } from '@/components/common/master-page'
import { ReportShell } from '@/components/common/report-shell'
import { DataTable } from '@/components/common/data-table'
import { StatCard } from '@/components/common/stat-card'
import { Progress } from '@/components/ui/progress'
import { fiscalYears } from '@/config/fiscal'
import { formatCurrency, formatPercent } from '@/lib/format'
import { useAdbGroupLookup, useBudgetStore } from '../store'
import type { AdbGroupCategory, TrancheMapping } from '../types'

const toTrancheMapping = (v: Record<string, string>) => ({
  trancheId: v.trancheId,
  adbGroupId: v.adbGroupId,
  ceilingAmount: Number(v.ceilingAmount) || 0,
  claimedAmount: Number(v.claimedAmount) || 0,
  remarks: v.remarks,
})

const toCategory = (v: Record<string, string>) => ({
  code: v.code,
  name: v.name,
  description: v.description,
  reportingOrder: Number(v.reportingOrder) || 99,
})

export function TrancheMappingPage() {
  const mappings = useBudgetStore((s) => s.trancheMappings)
  const tranches = useBudgetStore((s) => s.tranches)
  const groups = useBudgetStore((s) => s.adbGroups)
  const addTrancheMapping = useBudgetStore((s) => s.addTrancheMapping)
  const updateTrancheMapping = useBudgetStore((s) => s.updateTrancheMapping)
  const removeTrancheMapping = useBudgetStore((s) => s.removeTrancheMapping)
  const groupById = useAdbGroupLookup()
  const trancheById = useMemo(() => Object.fromEntries(tranches.map((t) => [t.id, t])), [tranches])

  const totals = useMemo(
    () =>
      mappings.reduce(
        (acc, m) => ({ ceiling: acc.ceiling + m.ceilingAmount, claimed: acc.claimed + m.claimedAmount }),
        { ceiling: 0, claimed: 0 },
      ),
    [mappings],
  )

  const columns = useMemo<ColumnDef<TrancheMapping, any>[]>(
    () => [
      {
        id: 'tranche',
        header: 'Tranche',
        meta: { label: 'Tranche' },
        accessorFn: (row) => trancheById[row.trancheId]?.name ?? '—',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{trancheById[row.original.trancheId]?.name ?? '—'}</p>
            <p className="truncate text-xs text-muted-foreground">{trancheById[row.original.trancheId]?.fundSource}</p>
          </div>
        ),
      },
      {
        id: 'group',
        header: 'ADB group',
        meta: { label: 'ADB group' },
        accessorFn: (row) => groupById[row.adbGroupId]?.name ?? '—',
      },
      {
        accessorKey: 'ceilingAmount',
        header: 'Category ceiling',
        meta: { align: 'right', label: 'Ceiling' },
        cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
      },
      {
        accessorKey: 'claimedAmount',
        header: 'Claimed',
        meta: { align: 'right', label: 'Claimed' },
        cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
      },
      {
        id: 'available',
        header: 'Available',
        meta: { align: 'right', label: 'Available' },
        accessorFn: (row) => row.ceilingAmount - row.claimedAmount,
        cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
      },
      {
        id: 'usage',
        header: 'Claimed %',
        meta: { align: 'right', label: 'Claimed %' },
        accessorFn: (row) => (row.ceilingAmount ? (row.claimedAmount / row.ceilingAmount) * 100 : 0),
        cell: ({ getValue }) => (
          <div className="flex items-center justify-end gap-2">
            <Progress value={getValue<number>()} className="h-1.5 w-14" />
            <span className="w-10 text-right tabular-nums">{formatPercent(getValue<number>(), 0)}</span>
          </div>
        ),
      },
    ],
    [groupById, trancheById],
  )

  return (
    <MasterPage
      title="Tranche mapping"
      description="Category ceilings agreed with the development partner for each tranche"
      addLabel="Add mapping"
      searchPlaceholder="Search tranche or group…"
      columns={columns}
      data={mappings}
      pageSize={15}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Total ceiling" value={formatCurrency(totals.ceiling, { compact: true })} />
          <StatCard label="Claimed" value={formatCurrency(totals.claimed, { compact: true })} tone="info" />
          <StatCard label="Available" value={formatCurrency(totals.ceiling - totals.claimed, { compact: true })} tone="success" />
        </div>
      }
      fields={[
        {
          name: 'trancheId',
          label: 'Tranche',
          type: 'select',
          required: true,
          span: true,
          options: tranches.map((t) => ({ value: t.id, label: `${t.name} · ${t.fundSource}` })),
        },
        {
          name: 'adbGroupId',
          label: 'ADB group',
          type: 'select',
          required: true,
          span: true,
          options: groups.map((g) => ({ value: g.id, label: `${g.code} · ${g.name}` })),
        },
        { name: 'ceilingAmount', label: 'Category ceiling (BDT)', type: 'number', required: true },
        { name: 'claimedAmount', label: 'Claimed to date (BDT)', type: 'number' },
        { name: 'remarks', label: 'Remarks', type: 'textarea', span: true },
      ]}
      onCreate={(v) => addTrancheMapping(toTrancheMapping(v))}
      onUpdate={(row, v) => updateTrancheMapping(row.id, toTrancheMapping(v))}
      onDelete={(row) => removeTrancheMapping(row.id)}
      rowLabel={() => 'this mapping'}
    />
  )
}

export function AdbGroupCategoryPage() {
  const categories = useBudgetStore((s) => s.adbGroupCategories)
  const groups = useBudgetStore((s) => s.adbGroups)
  const addCategory = useBudgetStore((s) => s.addAdbGroupCategory)
  const updateCategory = useBudgetStore((s) => s.updateAdbGroupCategory)
  const removeCategory = useBudgetStore((s) => s.removeAdbGroupCategory)

  const columns = useMemo<ColumnDef<AdbGroupCategory, any>[]>(
    () => [
      { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
      {
        accessorKey: 'name',
        header: 'Category',
        meta: { label: 'Category' },
        cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        meta: { label: 'Description' },
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
      },
      {
        id: 'groups',
        header: 'ADB groups',
        meta: { align: 'right', label: 'ADB groups' },
        accessorFn: (row) => groups.filter((g) => g.category.toLowerCase().startsWith(row.code.slice(0, 3).toLowerCase())).length,
      },
      { accessorKey: 'reportingOrder', header: 'Order', meta: { align: 'right', label: 'Order' } },
    ],
    [groups],
  )

  return (
    <MasterPage
      title="ADB group category"
      description="Top-level grouping used when reporting expenditure to the development partner"
      addLabel="Add category"
      searchPlaceholder="Search category…"
      columns={columns}
      data={categories}
      fields={[
        { name: 'code', label: 'Code', required: true },
        { name: 'name', label: 'Category name', required: true },
        { name: 'reportingOrder', label: 'Reporting order', type: 'number' },
        { name: 'description', label: 'Description', type: 'textarea', span: true },
      ]}
      onCreate={(v) => addCategory(toCategory(v))}
      onUpdate={(row, v) => updateCategory(row.id, toCategory(v))}
      onDelete={(row) => removeCategory(row.id)}
    />
  )
}

/** RADP report: fiscal-year allocation and expenditure grouped by ADB category. */
export function RadpReportPage() {
  const items = useBudgetStore((s) => s.items)
  const allocations = useBudgetStore((s) => s.allocations)
  const groupById = useAdbGroupLookup()

  const rows = useMemo(() => {
    const map = new Map<string, { group: string; allocation: number; expenditure: number; items: number }>()
    for (const item of items) {
      const key = groupById[item.groupId]?.name ?? 'Unmapped'
      const current = map.get(key) ?? { group: key, allocation: 0, expenditure: 0, items: 0 }
      const yearRows = allocations.filter((a) => a.itemId === item.id)
      current.allocation += yearRows.reduce((s, a) => s + a.allocation, 0)
      current.expenditure += yearRows.reduce((s, a) => s + a.expenditure, 0)
      current.items += 1
      map.set(key, current)
    }
    return Array.from(map.values())
  }, [items, allocations, groupById])

  const totals = rows.reduce(
    (acc, r) => ({ allocation: acc.allocation + r.allocation, expenditure: acc.expenditure + r.expenditure }),
    { allocation: 0, expenditure: 0 },
  )

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    {
      accessorKey: 'group',
      header: 'ADB group',
      meta: { label: 'ADB group' },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    { accessorKey: 'items', header: 'Items', meta: { align: 'right', label: 'Items' } },
    {
      accessorKey: 'allocation',
      header: 'RADP allocation',
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
      id: 'balance',
      header: 'Balance',
      meta: { align: 'right', label: 'Balance' },
      accessorFn: (row) => row.allocation - row.expenditure,
      cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
    },
    {
      id: 'utilisation',
      header: 'Utilisation',
      meta: { align: 'right', label: 'Utilisation' },
      accessorFn: (row) => (row.allocation ? (row.expenditure / row.allocation) * 100 : 0),
      cell: ({ getValue }) => formatPercent(getValue<number>(), 1),
    },
  ]

  return (
    <ReportShell
      title="RADP Report"
      description="Revised ADP allocation and expenditure summarised by expenditure group"
      period={`Cumulative, ${fiscalYears[0].label} – ${fiscalYears.at(-1)!.label}`}
      notes={`Overall utilisation: ${formatPercent(
        totals.allocation ? (totals.expenditure / totals.allocation) * 100 : 0,
      )}`}
    >
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search group…"
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
    </ReportShell>
  )
}
