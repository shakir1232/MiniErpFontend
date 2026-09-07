import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MasterPage } from '@/components/common/master-page'
import { StatCard } from '@/components/common/stat-card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/format'
import { useAdbGroupLookup, useBudgetStore } from '../store'
import type { BudgetItem, BudgetKind } from '../types'

const COPY: Partial<Record<BudgetKind, { title: string; description: string }>> = {
  DPP: {
    title: 'Original DPP setup',
    description: 'Item-wise cost table approved in the original Development Project Proposal',
  },
  RDPP: {
    title: 'Original RDPP budget',
    description: 'Revised DPP cost table currently in force',
  },
}

const toRecord = (v: Record<string, string>): Omit<BudgetItem, 'id'> => {
  const quantity = Number(v.quantity) || 0
  const unitRate = Number(v.unitRate) || 0
  const totalCost = quantity * unitRate
  const gobAmount = Number(v.gobAmount) || 0
  return {
    serial: v.serial,
    economicCode: v.economicCode,
    description: v.description,
    category: v.category as BudgetItem['category'],
    unit: v.unit || 'Lump sum',
    quantity,
    unitRate,
    totalCost,
    gobAmount,
    paAmount: Math.max(totalCost - gobAmount, 0),
    ownAmount: 0,
    groupId: v.groupId,
  }
}

export function BudgetItemsPage({ kind }: { kind: BudgetKind }) {
  const copy = COPY[kind] ?? COPY.RDPP!
  const items = useBudgetStore((s) => s.items)
  const addItem = useBudgetStore((s) => s.addItem)
  const updateItem = useBudgetStore((s) => s.updateItem)
  const removeItem = useBudgetStore((s) => s.removeItem)
  const adbGroups = useBudgetStore((s) => s.adbGroups)
  const groupById = useAdbGroupLookup()

  const totals = useMemo(
    () =>
      items.reduce(
        (acc, item) => ({
          total: acc.total + item.totalCost,
          gob: acc.gob + item.gobAmount,
          pa: acc.pa + item.paAmount,
        }),
        { total: 0, gob: 0, pa: 0 },
      ),
    [items],
  )

  const columns = useMemo<ColumnDef<BudgetItem, any>[]>(
    () => [
      { accessorKey: 'serial', header: 'SL', meta: { align: 'center', label: 'SL', hideOnMobile: true } },
      { accessorKey: 'economicCode', header: 'Economic code', meta: { label: 'Economic code', className: 'font-mono text-xs' } },
      {
        accessorKey: 'description',
        header: 'Item description',
        meta: { label: 'Item' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.description}</p>
            <p className="truncate text-xs text-muted-foreground">{groupById[row.original.groupId]?.name ?? '—'}</p>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        meta: { align: 'center', label: 'Category' },
        cell: ({ getValue }) => <Badge variant="secondary">{getValue<string>()}</Badge>,
      },
      { accessorKey: 'unit', header: 'Unit', meta: { label: 'Unit', hideOnMobile: true } },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        meta: { align: 'right', label: 'Quantity', hideOnMobile: true },
        cell: ({ getValue }) => formatNumber(getValue<number>()),
      },
      {
        accessorKey: 'unitRate',
        header: 'Unit rate',
        meta: { align: 'right', label: 'Unit rate', hideOnMobile: true },
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        accessorKey: 'gobAmount',
        header: 'GoB',
        meta: { align: 'right', label: 'GoB' },
        cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
      },
      {
        accessorKey: 'paAmount',
        header: 'Project aid',
        meta: { align: 'right', label: 'Project aid' },
        cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
      },
      {
        accessorKey: 'totalCost',
        header: 'Total cost',
        meta: { align: 'right', label: 'Total cost' },
        cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>(), { compact: true })}</span>,
      },
    ],
    [groupById],
  )

  return (
    <MasterPage
      title={copy.title}
      description={copy.description}
      addLabel="Add budget item"
      searchPlaceholder="Search item or economic code…"
      columns={columns}
      data={items}
      pageSize={15}
      stats={
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard label="Budget items" value={String(items.length)} />
          <StatCard label="Total cost" value={formatCurrency(totals.total, { compact: true })} tone="info" />
          <StatCard label="GoB share" value={formatCurrency(totals.gob, { compact: true })} />
          <StatCard label="Project aid" value={formatCurrency(totals.pa, { compact: true })} tone="success" />
        </div>
      }
      fields={[
        { name: 'serial', label: 'Serial', required: true },
        { name: 'economicCode', label: 'Economic code', required: true },
        { name: 'description', label: 'Item description', required: true, span: true },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          required: true,
          options: [
            { value: 'Revenue', label: 'Revenue' },
            { value: 'Capital', label: 'Capital' },
          ],
        },
        {
          name: 'groupId',
          label: 'ADB group',
          type: 'select',
          required: true,
          options: adbGroups.map((g) => ({ value: g.id, label: `${g.code} · ${g.name}` })),
        },
        { name: 'unit', label: 'Unit', placeholder: 'e.g. Trainee, Month' },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'unitRate', label: 'Unit rate (BDT)', type: 'number', required: true },
        { name: 'gobAmount', label: 'GoB amount (BDT)', type: 'number' },
      ]}
      onCreate={(v) => addItem(toRecord(v))}
      onUpdate={(row, v) => updateItem(row.id, toRecord(v))}
      onDelete={(row) => removeItem(row.id)}
      rowLabel={(row) => row.description}
    />
  )
}
