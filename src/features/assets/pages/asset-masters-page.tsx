import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MasterPage } from '@/components/common/master-page'
import { StatusBadge } from '@/components/common/status-badge'
import { formatNumber, formatPercent } from '@/lib/format'
import { useAssetStore } from '../store'
import type { AssetCategory, AssetLocation, Supplier } from '../types'

const toSupplier = (v: Record<string, string>) => ({
  name: v.name,
  contactPerson: v.contactPerson,
  phone: v.phone,
  email: v.email,
  address: v.address,
  tin: v.tin,
  bin: v.bin,
})

const toCategory = (v: Record<string, string>) => ({
  code: v.code,
  name: v.name,
  depreciationRate: Number(v.depreciationRate) || 0,
  usefulLifeYears: Number(v.usefulLifeYears) || 0,
})

const toLocation = (v: Record<string, string>) => ({
  code: v.code,
  name: v.name,
  type: v.type as AssetLocation['type'],
  district: v.district,
  address: v.address,
  inCharge: v.inCharge,
})

export function SuppliersPage() {
  const suppliers = useAssetStore((s) => s.suppliers)
  const addSupplier = useAssetStore((s) => s.addSupplier)
  const updateSupplier = useAssetStore((s) => s.updateSupplier)
  const removeSupplier = useAssetStore((s) => s.removeSupplier)

  const columns = useMemo<ColumnDef<Supplier, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Supplier',
        meta: { label: 'Supplier' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.address}</p>
          </div>
        ),
      },
      { accessorKey: 'contactPerson', header: 'Contact person', meta: { label: 'Contact person' } },
      { accessorKey: 'phone', header: 'Phone', meta: { label: 'Phone' } },
      { accessorKey: 'email', header: 'Email', meta: { label: 'Email', hideOnMobile: true } },
      { accessorKey: 'tin', header: 'TIN', meta: { label: 'TIN', className: 'font-mono text-xs', hideOnMobile: true } },
      { accessorKey: 'bin', header: 'BIN', meta: { label: 'BIN', className: 'font-mono text-xs', hideOnMobile: true } },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { align: 'center', label: 'Status' },
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
    ],
    [],
  )

  return (
    <MasterPage
      title="Suppliers"
      description="Vendors registered for procurement of goods and services"
      addLabel="Add supplier"
      searchPlaceholder="Search supplier, contact or TIN…"
      columns={columns}
      data={suppliers}
      fields={[
        { name: 'name', label: 'Supplier name', required: true, span: true },
        { name: 'contactPerson', label: 'Contact person', required: true },
        { name: 'phone', label: 'Phone', required: true },
        { name: 'email', label: 'Email' },
        { name: 'tin', label: 'TIN' },
        { name: 'bin', label: 'BIN' },
        { name: 'address', label: 'Address', type: 'textarea', span: true },
      ]}
      onCreate={(v) => addSupplier({ ...toSupplier(v), status: 'active' })}
      onUpdate={(row, v) => updateSupplier(row.id, toSupplier(v))}
      onDelete={(row) => removeSupplier(row.id)}
    />
  )
}

export function AssetCategoriesPage() {
  const categories = useAssetStore((s) => s.categories)
  const assets = useAssetStore((s) => s.assets)
  const addCategory = useAssetStore((s) => s.addCategory)
  const updateCategory = useAssetStore((s) => s.updateCategory)
  const removeCategory = useAssetStore((s) => s.removeCategory)

  const columns = useMemo<ColumnDef<AssetCategory, any>[]>(
    () => [
      { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
      {
        accessorKey: 'name',
        header: 'Category',
        meta: { label: 'Category' },
        cell: ({ row }) => (
          <span className={row.original.parent ? 'pl-4 text-muted-foreground' : 'font-medium'}>{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'depreciationRate',
        header: 'Depreciation',
        meta: { align: 'right', label: 'Depreciation' },
        cell: ({ getValue }) => formatPercent(getValue<number>(), 0),
      },
      {
        accessorKey: 'usefulLifeYears',
        header: 'Useful life',
        meta: { align: 'right', label: 'Useful life' },
        cell: ({ getValue }) => `${getValue<number>()} yr`,
      },
      {
        id: 'count',
        header: 'Assets',
        meta: { align: 'right', label: 'Assets' },
        accessorFn: (row) => assets.filter((a) => a.categoryId === row.id).length,
        cell: ({ getValue }) => formatNumber(getValue<number>()),
      },
    ],
    [assets],
  )

  return (
    <MasterPage
      title="Asset categories"
      description="Category-wise depreciation rate and useful life used by the fixed asset register"
      addLabel="Add category"
      searchPlaceholder="Search category…"
      columns={columns}
      data={categories}
      fields={[
        { name: 'code', label: 'Category code', required: true },
        { name: 'name', label: 'Category name', required: true },
        { name: 'depreciationRate', label: 'Depreciation rate (%)', type: 'number', required: true },
        { name: 'usefulLifeYears', label: 'Useful life (years)', type: 'number', required: true },
      ]}
      onCreate={(v) => addCategory({ ...toCategory(v), parent: null })}
      onUpdate={(row, v) => updateCategory(row.id, toCategory(v))}
      onDelete={(row) => removeCategory(row.id)}
    />
  )
}

export function AssetLocationsPage() {
  const locations = useAssetStore((s) => s.locations)
  const assets = useAssetStore((s) => s.assets)
  const addLocation = useAssetStore((s) => s.addLocation)
  const updateLocation = useAssetStore((s) => s.updateLocation)
  const removeLocation = useAssetStore((s) => s.removeLocation)

  const columns = useMemo<ColumnDef<AssetLocation, any>[]>(
    () => [
      { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
      {
        accessorKey: 'name',
        header: 'Location',
        meta: { label: 'Location' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.address}</p>
          </div>
        ),
      },
      { accessorKey: 'type', header: 'Type', meta: { label: 'Type' } },
      { accessorKey: 'district', header: 'District', meta: { label: 'District' } },
      { accessorKey: 'inCharge', header: 'In charge', meta: { label: 'In charge', hideOnMobile: true } },
      {
        id: 'count',
        header: 'Assets held',
        meta: { align: 'right', label: 'Assets held' },
        accessorFn: (row) => assets.filter((a) => a.locationId === row.id).length,
        cell: ({ getValue }) => formatNumber(getValue<number>()),
      },
    ],
    [assets],
  )

  return (
    <MasterPage
      title="Asset locations"
      description="Offices, training centres and stores where assets are held"
      addLabel="Add location"
      searchPlaceholder="Search location or district…"
      columns={columns}
      data={locations}
      fields={[
        { name: 'code', label: 'Location code', required: true },
        { name: 'name', label: 'Location name', required: true },
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          required: true,
          options: ['Head Office', 'PIU', 'Training Centre', 'Store'].map((t) => ({ value: t, label: t })),
        },
        { name: 'district', label: 'District', required: true },
        { name: 'inCharge', label: 'In charge' },
        { name: 'address', label: 'Address', type: 'textarea', span: true },
      ]}
      onCreate={(v) => addLocation(toLocation(v))}
      onUpdate={(row, v) => updateLocation(row.id, toLocation(v))}
      onDelete={(row) => removeLocation(row.id)}
    />
  )
}
