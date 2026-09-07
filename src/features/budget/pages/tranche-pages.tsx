import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MasterPage } from '@/components/common/master-page'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Progress } from '@/components/ui/progress'
import { fiscalYears } from '@/config/fiscal'
import { formatCurrency, formatPercent } from '@/lib/format'
import { useAdbGroupLookup, useBudgetStore } from '../store'
import type { AdbGroup, GroupMapping, Tranche } from '../types'

const FUND_SOURCES = ['ADB Loan 3140-BAN', 'ADB Grant 0387-BAN', 'GoB Development Budget', 'SDC Grant TF-0912']

const toTranche = (v: Record<string, string>) => ({
  name: v.name,
  fundSource: v.fundSource,
  fiscalYearId: v.fiscalYearId,
  allocated: Number(v.allocated) || 0,
  released: Number(v.released) || 0,
})

const toAdbGroup = (v: Record<string, string>) => ({
  code: v.code,
  name: v.name,
  category: v.category || 'Revenue',
  description: v.description,
})

const toMapping = (v: Record<string, string>) => ({
  adbGroupId: v.adbGroupId,
  economicCode: v.economicCode,
  ledgerName: v.ledgerName,
  remarks: v.remarks,
})

export function TrancheAllocationPage() {
  const tranches = useBudgetStore((s) => s.tranches)
  const addTranche = useBudgetStore((s) => s.addTranche)
  const updateTranche = useBudgetStore((s) => s.updateTranche)
  const removeTranche = useBudgetStore((s) => s.removeTranche)
  const fyById = useMemo(() => Object.fromEntries(fiscalYears.map((f) => [f.id, f])), [])

  const totals = useMemo(
    () =>
      tranches.reduce(
        (acc, t) => ({
          allocated: acc.allocated + t.allocated,
          released: acc.released + t.released,
          utilised: acc.utilised + t.utilised,
        }),
        { allocated: 0, released: 0, utilised: 0 },
      ),
    [tranches],
  )

  const columns = useMemo<ColumnDef<Tranche, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Tranche',
        meta: { label: 'Tranche' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.fundSource}</p>
          </div>
        ),
      },
      {
        id: 'fy',
        header: 'Fiscal year',
        meta: { label: 'Fiscal year' },
        accessorFn: (row) => fyById[row.fiscalYearId]?.label ?? '—',
      },
      {
        accessorKey: 'allocated',
        header: 'Allocated',
        meta: { align: 'right', label: 'Allocated' },
        cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
      },
      {
        accessorKey: 'released',
        header: 'Released',
        meta: { align: 'right', label: 'Released' },
        cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
      },
      {
        accessorKey: 'utilised',
        header: 'Utilised',
        meta: { align: 'right', label: 'Utilised' },
        cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
      },
      {
        id: 'progress',
        header: 'Utilisation',
        meta: { align: 'right', label: 'Utilisation' },
        accessorFn: (row) => (row.allocated ? (row.utilised / row.allocated) * 100 : 0),
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
    [fyById],
  )

  return (
    <MasterPage
      title="Tranche wise allocation"
      description="Loan and grant tranches released by development partners"
      addLabel="Add tranche"
      searchPlaceholder="Search tranche or fund source…"
      columns={columns}
      data={tranches}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Allocated" value={formatCurrency(totals.allocated, { compact: true })} />
          <StatCard label="Released" value={formatCurrency(totals.released, { compact: true })} tone="info" />
          <StatCard label="Utilised" value={formatCurrency(totals.utilised, { compact: true })} tone="success" />
        </div>
      }
      fields={[
        { name: 'name', label: 'Tranche name', required: true },
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
          options: fiscalYears.map((f) => ({ value: f.id, label: f.label })),
        },
        { name: 'allocated', label: 'Allocated (BDT)', type: 'number', required: true },
        { name: 'released', label: 'Released (BDT)', type: 'number' },
      ]}
      onCreate={(v) => addTranche({ ...toTranche(v), utilised: 0, status: 'pending' })}
      onUpdate={(row, v) => updateTranche(row.id, toTranche(v))}
      onDelete={(row) => removeTranche(row.id)}
    />
  )
}

export function AdbGroupPage() {
  const groups = useBudgetStore((s) => s.adbGroups)
  const items = useBudgetStore((s) => s.items)
  const addGroup = useBudgetStore((s) => s.addAdbGroup)
  const updateGroup = useBudgetStore((s) => s.updateAdbGroup)
  const removeGroup = useBudgetStore((s) => s.removeAdbGroup)

  const columns = useMemo<ColumnDef<AdbGroup, any>[]>(
    () => [
      { accessorKey: 'code', header: 'Code', meta: { align: 'center', label: 'Code', className: 'font-mono' } },
      {
        accessorKey: 'name',
        header: 'Group',
        meta: { label: 'Group' },
        cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
      },
      { accessorKey: 'category', header: 'Category', meta: { label: 'Category' } },
      {
        accessorKey: 'description',
        header: 'Description',
        meta: { label: 'Description', hideOnMobile: true },
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
      },
      {
        id: 'items',
        header: 'Budget items',
        meta: { align: 'right', label: 'Budget items' },
        accessorFn: (row) => items.filter((i) => i.groupId === row.id).length,
      },
      {
        id: 'value',
        header: 'Approved cost',
        meta: { align: 'right', label: 'Approved cost' },
        accessorFn: (row) => items.filter((i) => i.groupId === row.id).reduce((s, i) => s + i.totalCost, 0),
        cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
      },
    ],
    [items],
  )

  return (
    <MasterPage
      title="ADB group (CoA)"
      description="Development-partner expenditure categories used for tranche reporting"
      addLabel="Add ADB group"
      searchPlaceholder="Search group…"
      columns={columns}
      data={groups}
      fields={[
        { name: 'code', label: 'Group code', required: true },
        { name: 'name', label: 'Group name', required: true },
        { name: 'category', label: 'Category', type: 'select', options: [
          { value: 'Revenue', label: 'Revenue' },
          { value: 'Capital', label: 'Capital' },
        ] },
        { name: 'description', label: 'Description', type: 'textarea', span: true },
      ]}
      onCreate={(v) => addGroup(toAdbGroup(v))}
      onUpdate={(row, v) => updateGroup(row.id, toAdbGroup(v))}
      onDelete={(row) => removeGroup(row.id)}
    />
  )
}

export function GroupMappingPage() {
  const mappings = useBudgetStore((s) => s.mappings)
  const groups = useBudgetStore((s) => s.adbGroups)
  const addMapping = useBudgetStore((s) => s.addMapping)
  const updateMapping = useBudgetStore((s) => s.updateMapping)
  const removeMapping = useBudgetStore((s) => s.removeMapping)
  const groupById = useAdbGroupLookup()

  const columns = useMemo<ColumnDef<GroupMapping, any>[]>(
    () => [
      {
        id: 'group',
        header: 'ADB group',
        meta: { label: 'ADB group' },
        accessorFn: (row) => groupById[row.adbGroupId]?.name ?? '—',
        cell: ({ row }) => (
          <span className="font-medium">
            {groupById[row.original.adbGroupId]?.code} · {groupById[row.original.adbGroupId]?.name ?? '—'}
          </span>
        ),
      },
      { accessorKey: 'economicCode', header: 'Economic code', meta: { label: 'Economic code', className: 'font-mono text-xs' } },
      { accessorKey: 'ledgerName', header: 'Ledger', meta: { label: 'Ledger' } },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        meta: { label: 'Remarks', hideOnMobile: true },
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>() || '—'}</span>,
      },
    ],
    [groupById],
  )

  return (
    <MasterPage
      title="Group mapping"
      description="Links each economic code to the ADB expenditure group it reports under"
      addLabel="Add mapping"
      searchPlaceholder="Search economic code or ledger…"
      columns={columns}
      data={mappings}
      fields={[
        {
          name: 'adbGroupId',
          label: 'ADB group',
          type: 'select',
          required: true,
          span: true,
          options: groups.map((g) => ({ value: g.id, label: `${g.code} · ${g.name}` })),
        },
        { name: 'economicCode', label: 'Economic code', required: true },
        { name: 'ledgerName', label: 'Ledger name', required: true },
        { name: 'remarks', label: 'Remarks', type: 'textarea', span: true },
      ]}
      onCreate={(v) => addMapping(toMapping(v))}
      onUpdate={(row, v) => updateMapping(row.id, toMapping(v))}
      onDelete={(row) => removeMapping(row.id)}
      rowLabel={(row) => row.ledgerName}
    />
  )
}
