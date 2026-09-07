import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Boxes, PackageCheck, Wallet } from 'lucide-react'
import { MasterPage } from '@/components/common/master-page'
import { ReportShell } from '@/components/common/report-shell'
import { DataTable } from '@/components/common/data-table'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDate, formatNumber, formatPercent } from '@/lib/format'
import {
  useAssetCategoryLookup,
  useAssetLocationLookup,
  useAssetLookup,
  useAssetStore,
  useSupplierLookup,
} from '../store'
import type { Asset, AssetTransfer, DeliveryChallan } from '../types'

export function DeliveryChallansPage() {
  const challans = useAssetStore((s) => s.challans)
  const suppliers = useAssetStore((s) => s.suppliers)
  const addChallan = useAssetStore((s) => s.addChallan)
  const supplierById = useSupplierLookup()

  const columns = useMemo<ColumnDef<DeliveryChallan, any>[]>(
    () => [
      {
        accessorKey: 'challanNo',
        header: 'Challan no.',
        meta: { label: 'Challan no.' },
        cell: ({ getValue }) => <span className="font-mono text-sm font-medium">{getValue<string>()}</span>,
      },
      { accessorKey: 'date', header: 'Date', meta: { label: 'Date' }, cell: ({ getValue }) => formatDate(getValue<string>()) },
      {
        id: 'supplier',
        header: 'Supplier',
        meta: { label: 'Supplier' },
        accessorFn: (row) => supplierById[row.supplierId]?.name ?? '—',
      },
      { accessorKey: 'packageNo', header: 'Package', meta: { label: 'Package', className: 'font-mono text-xs', hideOnMobile: true } },
      {
        accessorKey: 'itemCount',
        header: 'Items',
        meta: { align: 'right', label: 'Items' },
        cell: ({ getValue }) => formatNumber(getValue<number>()),
      },
      {
        accessorKey: 'totalValue',
        header: 'Value',
        meta: { align: 'right', label: 'Value' },
        cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
      },
      { accessorKey: 'receivedBy', header: 'Received by', meta: { label: 'Received by', hideOnMobile: true } },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { align: 'center', label: 'Status' },
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
    ],
    [supplierById],
  )

  return (
    <MasterPage
      title="Delivery challan"
      description="Goods received against procurement packages"
      addLabel="Add challan"
      searchPlaceholder="Search challan, supplier or package…"
      columns={columns}
      data={challans}
      pageSize={12}
      fields={[
        { name: 'challanNo', label: 'Challan number', required: true },
        { name: 'date', label: 'Challan date', type: 'date', required: true },
        {
          name: 'supplierId',
          label: 'Supplier',
          type: 'select',
          required: true,
          span: true,
          options: suppliers.map((s) => ({ value: s.id, label: s.name })),
        },
        { name: 'packageNo', label: 'Package number' },
        { name: 'itemCount', label: 'Item count', type: 'number' },
        { name: 'totalValue', label: 'Total value (BDT)', type: 'number', required: true },
        { name: 'receivedBy', label: 'Received by' },
      ]}
      onCreate={(v) =>
        addChallan({
          challanNo: v.challanNo,
          date: v.date,
          supplierId: v.supplierId,
          packageNo: v.packageNo || '—',
          itemCount: Number(v.itemCount) || 0,
          totalValue: Number(v.totalValue) || 0,
          receivedBy: v.receivedBy || '—',
          status: 'pending',
        })
      }
    />
  )
}

export function AssetAssignmentsPage() {
  const assets = useAssetStore((s) => s.assets)
  const categories = useAssetStore((s) => s.categories)
  const locations = useAssetStore((s) => s.locations)
  const suppliers = useAssetStore((s) => s.suppliers)
  const addAsset = useAssetStore((s) => s.addAsset)
  const categoryById = useAssetCategoryLookup()
  const locationById = useAssetLocationLookup()

  const stats = useMemo(
    () => ({
      total: assets.length,
      assigned: assets.filter((a) => a.status === 'assigned').length,
      value: assets.reduce((s, a) => s + a.currentValue, 0),
    }),
    [assets],
  )

  const columns = useMemo<ColumnDef<Asset, any>[]>(
    () => [
      { accessorKey: 'tag', header: 'Asset tag', meta: { label: 'Asset tag', className: 'font-mono text-xs' } },
      {
        accessorKey: 'name',
        header: 'Asset',
        meta: { label: 'Asset' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {categoryById[row.original.categoryId]?.name ?? '—'}
            </p>
          </div>
        ),
      },
      {
        id: 'location',
        header: 'Location',
        meta: { label: 'Location' },
        accessorFn: (row) => locationById[row.locationId]?.name ?? '—',
      },
      {
        accessorKey: 'assignedTo',
        header: 'Assigned to',
        meta: { label: 'Assigned to' },
        cell: ({ getValue }) => getValue<string>() ?? <span className="text-muted-foreground">Unassigned</span>,
      },
      {
        accessorKey: 'purchaseValue',
        header: 'Purchase value',
        meta: { align: 'right', label: 'Purchase value', hideOnMobile: true },
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        accessorKey: 'condition',
        header: 'Condition',
        meta: { align: 'center', label: 'Condition' },
        cell: ({ getValue }) => (
          <StatusBadge
            status={getValue<string>()}
            tone={getValue<string>() === 'needs repair' ? 'warning' : getValue<string>() === 'condemned' ? 'destructive' : 'success'}
          />
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { align: 'center', label: 'Status' },
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
    ],
    [categoryById, locationById],
  )

  return (
    <MasterPage
      title="Asset assign"
      description="Assets issued to officers and units"
      addLabel="Add asset"
      searchPlaceholder="Search tag, asset or holder…"
      columns={columns}
      data={assets}
      pageSize={12}
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Total assets" value={formatNumber(stats.total)} icon={Boxes} />
          <StatCard label="Assigned" value={formatNumber(stats.assigned)} icon={PackageCheck} tone="success" />
          <StatCard label="Book value" value={formatCurrency(stats.value, { compact: true })} icon={Wallet} tone="info" />
        </div>
      }
      fields={[
        { name: 'tag', label: 'Asset tag', required: true },
        { name: 'serialNo', label: 'Serial number' },
        { name: 'name', label: 'Asset name', required: true, span: true },
        {
          name: 'categoryId',
          label: 'Category',
          type: 'select',
          required: true,
          options: categories.map((c) => ({ value: c.id, label: c.name })),
        },
        {
          name: 'locationId',
          label: 'Location',
          type: 'select',
          required: true,
          options: locations.map((l) => ({ value: l.id, label: l.name })),
        },
        {
          name: 'supplierId',
          label: 'Supplier',
          type: 'select',
          options: suppliers.map((s) => ({ value: s.id, label: s.name })),
        },
        { name: 'purchaseDate', label: 'Purchase date', type: 'date' },
        { name: 'purchaseValue', label: 'Purchase value (BDT)', type: 'number', required: true },
        { name: 'assignedTo', label: 'Assigned to' },
      ]}
      onCreate={(v) =>
        addAsset({
          tag: v.tag,
          name: v.name,
          categoryId: v.categoryId,
          supplierId: v.supplierId || suppliers[0].id,
          challanId: null,
          purchaseDate: v.purchaseDate || new Date().toISOString().slice(0, 10),
          purchaseValue: Number(v.purchaseValue) || 0,
          currentValue: Number(v.purchaseValue) || 0,
          locationId: v.locationId,
          assignedTo: v.assignedTo || null,
          condition: 'new',
          status: v.assignedTo ? 'assigned' : 'in store',
          serialNo: v.serialNo || '—',
        })
      }
    />
  )
}

export function AssetTransfersPage() {
  const transfers = useAssetStore((s) => s.transfers)
  const assets = useAssetStore((s) => s.assets)
  const locations = useAssetStore((s) => s.locations)
  const addTransfer = useAssetStore((s) => s.addTransfer)
  const assetById = useAssetLookup()
  const locationById = useAssetLocationLookup()

  const columns = useMemo<ColumnDef<AssetTransfer, any>[]>(
    () => [
      { accessorKey: 'transferNo', header: 'Transfer no.', meta: { label: 'Transfer no.', className: 'font-mono text-xs' } },
      { accessorKey: 'date', header: 'Date', meta: { label: 'Date' }, cell: ({ getValue }) => formatDate(getValue<string>()) },
      {
        id: 'asset',
        header: 'Asset',
        meta: { label: 'Asset' },
        accessorFn: (row) => assetById[row.assetId]?.name ?? '—',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{assetById[row.original.assetId]?.name ?? '—'}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{assetById[row.original.assetId]?.tag}</p>
          </div>
        ),
      },
      {
        id: 'from',
        header: 'From',
        meta: { label: 'From' },
        accessorFn: (row) => locationById[row.fromLocationId]?.name ?? '—',
      },
      {
        id: 'to',
        header: 'To',
        meta: { label: 'To' },
        accessorFn: (row) => locationById[row.toLocationId]?.name ?? '—',
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        meta: { label: 'Reason', hideOnMobile: true },
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { align: 'center', label: 'Status' },
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
    ],
    [assetById, locationById],
  )

  return (
    <MasterPage
      title="Asset transfer"
      description="Movement of assets between offices, centres and the central store"
      addLabel="Add transfer"
      searchPlaceholder="Search transfer, asset or location…"
      columns={columns}
      data={transfers}
      fields={[
        { name: 'transferNo', label: 'Transfer number', required: true },
        { name: 'date', label: 'Transfer date', type: 'date', required: true },
        {
          name: 'assetId',
          label: 'Asset',
          type: 'select',
          required: true,
          span: true,
          options: assets.slice(0, 40).map((a) => ({ value: a.id, label: `${a.tag} · ${a.name}` })),
        },
        {
          name: 'fromLocationId',
          label: 'From location',
          type: 'select',
          required: true,
          options: locations.map((l) => ({ value: l.id, label: l.name })),
        },
        {
          name: 'toLocationId',
          label: 'To location',
          type: 'select',
          required: true,
          options: locations.map((l) => ({ value: l.id, label: l.name })),
        },
        { name: 'reason', label: 'Reason', type: 'textarea', span: true },
      ]}
      onCreate={(v) =>
        addTransfer({
          transferNo: v.transferNo,
          assetId: v.assetId,
          fromLocationId: v.fromLocationId,
          toLocationId: v.toLocationId,
          date: v.date,
          reason: v.reason,
          approvedBy: 'Md. Shafiqul Islam',
          status: 'pending',
        })
      }
    />
  )
}

export function FixedAssetRegisterPage() {
  const assets = useAssetStore((s) => s.assets)
  const categoryById = useAssetCategoryLookup()
  const locationById = useAssetLocationLookup()
  const supplierById = useSupplierLookup()

  const rows = useMemo(
    () =>
      assets.map((asset) => ({
        ...asset,
        categoryName: categoryById[asset.categoryId]?.name ?? '—',
        locationName: locationById[asset.locationId]?.name ?? '—',
        supplierName: supplierById[asset.supplierId]?.name ?? '—',
        depreciation: asset.purchaseValue - asset.currentValue,
      })),
    [assets, categoryById, locationById, supplierById],
  )

  const totals = rows.reduce(
    (acc, r) => ({
      purchase: acc.purchase + r.purchaseValue,
      current: acc.current + r.currentValue,
    }),
    { purchase: 0, current: 0 },
  )

  const columns: ColumnDef<(typeof rows)[number], any>[] = [
    { accessorKey: 'tag', header: 'Asset tag', meta: { label: 'Asset tag', className: 'font-mono text-xs' } },
    {
      accessorKey: 'name',
      header: 'Description',
      meta: { label: 'Description' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.categoryName}</p>
        </div>
      ),
    },
    { accessorKey: 'supplierName', header: 'Supplier', meta: { label: 'Supplier', hideOnMobile: true } },
    {
      accessorKey: 'purchaseDate',
      header: 'Purchased',
      meta: { align: 'right', label: 'Purchased' },
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      accessorKey: 'purchaseValue',
      header: 'Cost',
      meta: { align: 'right', label: 'Cost' },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      accessorKey: 'depreciation',
      header: 'Accum. depreciation',
      meta: { align: 'right', label: 'Depreciation' },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      accessorKey: 'currentValue',
      header: 'Written down value',
      meta: { align: 'right', label: 'WDV' },
      cell: ({ getValue }) => <span className="font-medium">{formatCurrency(getValue<number>())}</span>,
    },
    { accessorKey: 'locationName', header: 'Location', meta: { label: 'Location', hideOnMobile: true } },
  ]

  return (
    <ReportShell
      title="Fixed Asset Register"
      description="Cost, accumulated depreciation and written down value of every asset"
      notes={`Depreciation to date: ${formatCurrency(totals.purchase - totals.current)} · Coverage: ${formatPercent(
        totals.purchase ? (totals.current / totals.purchase) * 100 : 0,
      )} of cost retained`}
    >
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search asset, tag or supplier…"
        pageSize={20}
        dense
        emptyTitle="No assets"
        footer={
          <div className="flex flex-wrap justify-between gap-2 font-medium">
            <span>Total</span>
            <span className="tabular-nums">
              Cost {formatCurrency(totals.purchase)} · WDV {formatCurrency(totals.current)}
            </span>
          </div>
        }
      />
    </ReportShell>
  )
}
