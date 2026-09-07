import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertTriangle, Package, PackageMinus, PackagePlus } from 'lucide-react'
import { MasterPage } from '@/components/common/master-page'
import { ReportShell } from '@/components/common/report-shell'
import { DataTable } from '@/components/common/data-table'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import { closingStock, useItemCategoryLookup, useItemLookup, useStoreStore } from '../store'
import type { ItemCategory, ItemIssue, ItemReceive, StoreItem } from '../types'

const toCategory = (v: Record<string, string>) => ({
  code: v.code,
  name: v.name,
  description: v.description,
})

const toItem = (v: Record<string, string>) => ({
  code: v.code,
  name: v.name,
  categoryId: v.categoryId,
  unit: v.unit,
  reorderLevel: Number(v.reorderLevel) || 0,
  unitPrice: Number(v.unitPrice) || 0,
  openingStock: Number(v.openingStock) || 0,
})

const toReceive = (v: Record<string, string>) => ({
  grn: v.grn,
  date: v.date,
  supplier: v.supplier,
  challanNo: v.challanNo || '—',
  itemId: v.itemId,
  quantity: Number(v.quantity) || 0,
  unitPrice: Number(v.unitPrice) || 0,
  remarks: v.remarks,
})

const toIssue = (v: Record<string, string>) => ({
  issueNo: v.issueNo,
  date: v.date,
  itemId: v.itemId,
  quantity: Number(v.quantity) || 0,
  issuedTo: v.issuedTo,
  department: v.department || '—',
  purpose: v.purpose,
})

export function ItemCategoriesPage() {
  const categories = useStoreStore((s) => s.categories)
  const items = useStoreStore((s) => s.items)
  const addCategory = useStoreStore((s) => s.addCategory)
  const updateCategory = useStoreStore((s) => s.updateCategory)
  const removeCategory = useStoreStore((s) => s.removeCategory)

  const columns = useMemo<ColumnDef<ItemCategory, any>[]>(
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
        id: 'items',
        header: 'Items',
        meta: { align: 'right', label: 'Items' },
        accessorFn: (row) => items.filter((i) => i.categoryId === row.id).length,
      },
    ],
    [items],
  )

  return (
    <MasterPage
      title="Item categories"
      description="Groupings for consumable store items"
      addLabel="Add category"
      searchPlaceholder="Search category…"
      columns={columns}
      data={categories}
      fields={[
        { name: 'code', label: 'Category code', required: true },
        { name: 'name', label: 'Category name', required: true },
        { name: 'description', label: 'Description', type: 'textarea', span: true },
      ]}
      onCreate={(v) => addCategory(toCategory(v))}
      onUpdate={(row, v) => updateCategory(row.id, toCategory(v))}
      onDelete={(row) => removeCategory(row.id)}
    />
  )
}

export function StoreItemsPage() {
  const items = useStoreStore((s) => s.items)
  const categories = useStoreStore((s) => s.categories)
  const addItem = useStoreStore((s) => s.addItem)
  const updateItem = useStoreStore((s) => s.updateItem)
  const removeItem = useStoreStore((s) => s.removeItem)
  const categoryById = useItemCategoryLookup()

  const stats = useMemo(() => {
    const value = items.reduce((s, i) => s + closingStock(i) * i.unitPrice, 0)
    const low = items.filter((i) => closingStock(i) <= i.reorderLevel).length
    return { count: items.length, value, low }
  }, [items])

  const columns = useMemo<ColumnDef<StoreItem, any>[]>(
    () => [
      { accessorKey: 'code', header: 'Item code', meta: { label: 'Item code', className: 'font-mono text-xs' } },
      {
        accessorKey: 'name',
        header: 'Item',
        meta: { label: 'Item' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-muted-foreground">{categoryById[row.original.categoryId]?.name ?? '—'}</p>
          </div>
        ),
      },
      { accessorKey: 'unit', header: 'Unit', meta: { align: 'center', label: 'Unit' } },
      {
        accessorKey: 'unitPrice',
        header: 'Unit price',
        meta: { align: 'right', label: 'Unit price' },
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        id: 'stock',
        header: 'In stock',
        meta: { align: 'right', label: 'In stock' },
        accessorFn: (row) => closingStock(row),
        cell: ({ getValue }) => <span className="font-medium">{formatNumber(getValue<number>())}</span>,
      },
      {
        accessorKey: 'reorderLevel',
        header: 'Reorder level',
        meta: { align: 'right', label: 'Reorder level', hideOnMobile: true },
        cell: ({ getValue }) => formatNumber(getValue<number>()),
      },
      {
        id: 'health',
        header: 'Status',
        meta: { align: 'center', label: 'Status' },
        accessorFn: (row) => (closingStock(row) <= row.reorderLevel ? 'reorder' : 'ok'),
        cell: ({ getValue }) => (
          <StatusBadge status={getValue<string>() === 'reorder' ? 'reorder' : 'in stock'} tone={getValue<string>() === 'reorder' ? 'warning' : 'success'} />
        ),
      },
    ],
    [categoryById],
  )

  return (
    <MasterPage
      title="Store items"
      description="Consumable items maintained in the central store"
      addLabel="Add item"
      searchPlaceholder="Search item or code…"
      columns={columns}
      data={items}
      pageSize={12}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Items" value={formatNumber(stats.count)} icon={Package} />
          <StatCard label="Stock value" value={formatCurrency(stats.value, { compact: true })} tone="info" />
          <StatCard label="Below reorder level" value={formatNumber(stats.low)} icon={AlertTriangle} tone="warning" />
        </div>
      }
      fields={[
        { name: 'code', label: 'Item code', required: true },
        {
          name: 'categoryId',
          label: 'Category',
          type: 'select',
          required: true,
          options: categories.map((c) => ({ value: c.id, label: c.name })),
        },
        { name: 'name', label: 'Item name', required: true, span: true },
        { name: 'unit', label: 'Unit', required: true, placeholder: 'e.g. Piece, Ream' },
        { name: 'unitPrice', label: 'Unit price (BDT)', type: 'number', required: true },
        { name: 'openingStock', label: 'Opening stock', type: 'number' },
        { name: 'reorderLevel', label: 'Reorder level', type: 'number' },
      ]}
      onCreate={(v) => addItem({ ...toItem(v), received: 0, issued: 0 })}
      onUpdate={(row, v) => updateItem(row.id, toItem(v))}
      onDelete={(row) => removeItem(row.id)}
    />
  )
}

export function ItemReceivesPage() {
  const receives = useStoreStore((s) => s.receives)
  const items = useStoreStore((s) => s.items)
  const addReceive = useStoreStore((s) => s.addReceive)
  const updateReceive = useStoreStore((s) => s.updateReceive)
  const removeReceive = useStoreStore((s) => s.removeReceive)
  const itemById = useItemLookup()

  const columns = useMemo<ColumnDef<ItemReceive, any>[]>(
    () => [
      { accessorKey: 'grn', header: 'GRN', meta: { label: 'GRN', className: 'font-mono text-xs' } },
      { accessorKey: 'date', header: 'Date', meta: { label: 'Date' }, cell: ({ getValue }) => formatDate(getValue<string>()) },
      {
        id: 'item',
        header: 'Item',
        meta: { label: 'Item' },
        accessorFn: (row) => itemById[row.itemId]?.name ?? '—',
        cell: ({ row }) => <span className="font-medium">{itemById[row.original.itemId]?.name ?? '—'}</span>,
      },
      { accessorKey: 'supplier', header: 'Supplier', meta: { label: 'Supplier' } },
      { accessorKey: 'challanNo', header: 'Challan', meta: { label: 'Challan', className: 'font-mono text-xs', hideOnMobile: true } },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        meta: { align: 'right', label: 'Quantity' },
        cell: ({ row }) => `${formatNumber(row.original.quantity)} ${itemById[row.original.itemId]?.unit ?? ''}`,
      },
      {
        id: 'value',
        header: 'Value',
        meta: { align: 'right', label: 'Value' },
        accessorFn: (row) => row.quantity * row.unitPrice,
        cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
      },
    ],
    [itemById],
  )

  const total = receives.reduce((s, r) => s + r.quantity * r.unitPrice, 0)

  return (
    <MasterPage
      title="Item receive"
      description="Goods received notes raising stock in the central store"
      addLabel="Receive items"
      searchPlaceholder="Search GRN, item or supplier…"
      columns={columns}
      data={receives}
      pageSize={12}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Receipts" value={formatNumber(receives.length)} icon={PackagePlus} />
          <StatCard label="Total value" value={formatCurrency(total, { compact: true })} tone="info" />
          <StatCard label="Distinct items" value={formatNumber(new Set(receives.map((r) => r.itemId)).size)} />
        </div>
      }
      fields={[
        { name: 'grn', label: 'GRN number', required: true },
        { name: 'date', label: 'Receive date', type: 'date', required: true },
        {
          name: 'itemId',
          label: 'Item',
          type: 'select',
          required: true,
          span: true,
          options: items.map((i) => ({ value: i.id, label: `${i.code} · ${i.name}` })),
        },
        { name: 'supplier', label: 'Supplier', required: true },
        { name: 'challanNo', label: 'Challan number' },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'unitPrice', label: 'Unit price (BDT)', type: 'number', required: true },
        { name: 'remarks', label: 'Remarks', type: 'textarea', span: true },
      ]}
      onCreate={(v) => addReceive({ ...toReceive(v), receivedBy: 'Sabbir Ahmed' })}
      onUpdate={(row, v) => updateReceive(row.id, toReceive(v))}
      onDelete={(row) => removeReceive(row.id)}
      rowLabel={(row) => row.grn}
    />
  )
}

export function ItemIssuesPage() {
  const issues = useStoreStore((s) => s.issues)
  const items = useStoreStore((s) => s.items)
  const addIssue = useStoreStore((s) => s.addIssue)
  const updateIssue = useStoreStore((s) => s.updateIssue)
  const removeIssue = useStoreStore((s) => s.removeIssue)
  const itemById = useItemLookup()

  const columns = useMemo<ColumnDef<ItemIssue, any>[]>(
    () => [
      { accessorKey: 'issueNo', header: 'Issue no.', meta: { label: 'Issue no.', className: 'font-mono text-xs' } },
      { accessorKey: 'date', header: 'Date', meta: { label: 'Date' }, cell: ({ getValue }) => formatDate(getValue<string>()) },
      {
        id: 'item',
        header: 'Item',
        meta: { label: 'Item' },
        accessorFn: (row) => itemById[row.itemId]?.name ?? '—',
        cell: ({ row }) => <span className="font-medium">{itemById[row.original.itemId]?.name ?? '—'}</span>,
      },
      { accessorKey: 'issuedTo', header: 'Issued to', meta: { label: 'Issued to' } },
      { accessorKey: 'department', header: 'Department', meta: { label: 'Department', hideOnMobile: true } },
      {
        accessorKey: 'purpose',
        header: 'Purpose',
        meta: { label: 'Purpose', hideOnMobile: true },
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        meta: { align: 'right', label: 'Quantity' },
        cell: ({ row }) => (
          <span className="font-medium">
            {formatNumber(row.original.quantity)} {itemById[row.original.itemId]?.unit ?? ''}
          </span>
        ),
      },
    ],
    [itemById],
  )

  return (
    <MasterPage
      title="Item issue"
      description="Store items issued to departments and training centres"
      addLabel="Issue items"
      searchPlaceholder="Search issue no., item or recipient…"
      columns={columns}
      data={issues}
      pageSize={12}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Issues" value={formatNumber(issues.length)} icon={PackageMinus} />
          <StatCard label="Units issued" value={formatNumber(issues.reduce((s, i) => s + i.quantity, 0))} tone="info" />
          <StatCard label="Departments served" value={formatNumber(new Set(issues.map((i) => i.department)).size)} />
        </div>
      }
      fields={[
        { name: 'issueNo', label: 'Issue number', required: true },
        { name: 'date', label: 'Issue date', type: 'date', required: true },
        {
          name: 'itemId',
          label: 'Item',
          type: 'select',
          required: true,
          span: true,
          options: items.map((i) => ({ value: i.id, label: `${i.code} · ${i.name}` })),
        },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'issuedTo', label: 'Issued to', required: true },
        { name: 'department', label: 'Department' },
        { name: 'purpose', label: 'Purpose', type: 'textarea', span: true },
      ]}
      onCreate={(v) => addIssue({ ...toIssue(v), approvedBy: 'Md. Rakibul Islam' })}
      onUpdate={(row, v) => updateIssue(row.id, toIssue(v))}
      onDelete={(row) => removeIssue(row.id)}
      rowLabel={(row) => row.issueNo}
    />
  )
}

export function StoreRegisterPage() {
  const items = useStoreStore((s) => s.items)
  const categoryById = useItemCategoryLookup()

  const rows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        categoryName: categoryById[item.categoryId]?.name ?? '—',
        closing: closingStock(item),
        value: closingStock(item) * item.unitPrice,
      })),
    [items, categoryById],
  )

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'name',
      header: 'Item',
      meta: { label: 'Item' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.categoryName}</p>
        </div>
      ),
    },
    { accessorKey: 'unit', header: 'Unit', meta: { align: 'center', label: 'Unit' } },
    {
      accessorKey: 'openingStock',
      header: 'Opening',
      meta: { align: 'right', label: 'Opening' },
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
    {
      accessorKey: 'received',
      header: 'Received',
      meta: { align: 'right', label: 'Received' },
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
    {
      accessorKey: 'issued',
      header: 'Issued',
      meta: { align: 'right', label: 'Issued' },
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
    {
      accessorKey: 'closing',
      header: 'Closing',
      meta: { align: 'right', label: 'Closing' },
      cell: ({ getValue }) => <span className="font-medium">{formatNumber(getValue<number>())}</span>,
    },
    {
      accessorKey: 'value',
      header: 'Stock value',
      meta: { align: 'right', label: 'Stock value' },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
  ]

  const total = rows.reduce((s, r) => s + r.value, 0)

  return (
    <ReportShell
      title="Store Register"
      description="Opening, receipt, issue and closing quantity for every store item"
      notes={`Total stock value: ${formatCurrency(total)}`}
    >
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search item…"
        pageSize={20}
        dense
        emptyTitle="No items"
        footer={
          <div className="flex justify-between font-medium">
            <span>Closing stock value</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
        }
      />
    </ReportShell>
  )
}

export function StockPositionPage() {
  const items = useStoreStore((s) => s.items)
  const categoryById = useItemCategoryLookup()

  const rows = useMemo(
    () =>
      items
        .map((item) => {
          const closing = closingStock(item)
          return {
            ...item,
            categoryName: categoryById[item.categoryId]?.name ?? '—',
            closing,
            coverage: item.reorderLevel ? (closing / item.reorderLevel) * 100 : 100,
            value: closing * item.unitPrice,
          }
        })
        .sort((a, b) => a.coverage - b.coverage),
    [items, categoryById],
  )

  const lowStock = rows.filter((r) => r.closing <= r.reorderLevel)

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    {
      accessorKey: 'name',
      header: 'Item',
      meta: { label: 'Item' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.code} · {row.original.categoryName}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'closing',
      header: 'In stock',
      meta: { align: 'right', label: 'In stock' },
      cell: ({ row }) => `${formatNumber(row.original.closing)} ${row.original.unit}`,
    },
    {
      accessorKey: 'reorderLevel',
      header: 'Reorder level',
      meta: { align: 'right', label: 'Reorder level' },
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
    {
      accessorKey: 'coverage',
      header: 'Coverage',
      meta: { align: 'right', label: 'Coverage' },
      cell: ({ getValue }) => (
        <div className="flex items-center justify-end gap-2">
          <Progress value={Math.min(getValue<number>(), 100)} className="h-1.5 w-16" />
          <span className="w-12 text-right tabular-nums">{Math.round(getValue<number>())}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'value',
      header: 'Stock value',
      meta: { align: 'right', label: 'Stock value' },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
  ]

  return (
    <ReportShell
      title="Current Stock Position"
      description="Items ordered by how close they are to the reorder level"
      notes={`${lowStock.length} item(s) at or below reorder level.`}
    >
      <DataTable columns={columns} data={rows} searchPlaceholder="Search item…" pageSize={20} dense emptyTitle="No items" />
    </ReportShell>
  )
}
