import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MasterPage } from '@/components/common/master-page'
import { StatusBadge } from '@/components/common/status-badge'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/lib/format'
import { useLookup, useSettingsStore } from '../store'
import type {
  AssociationGroup,
  Bank,
  BankBranch,
  Currency,
  FundCategory,
  FundSource,
  FundingAgency,
  ImplementingAgency,
  Ministry,
  MinistryDirectorate,
  ProjectSector,
  ProjectType,
  SignatureSetup,
} from '../types'

/** Shared column shape for the plain code/name/description lookups. */
function codeNameColumns<T extends { code: string; name: string; description?: string }>(): ColumnDef<T, any>[] {
  return [
    { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { label: 'Name' },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      meta: { label: 'Description' },
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>() ?? '—'}</span>,
    },
  ]
}

export function ImplementingAgenciesPage() {
  const rows = useSettingsStore((s) => s.implementingAgencies)
  const add = useSettingsStore((s) => s.add)

  const columns: ColumnDef<ImplementingAgency, any>[] = [
    { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'name',
      header: 'Agency',
      meta: { label: 'Agency' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.address}</p>
        </div>
      ),
    },
    { accessorKey: 'type', header: 'Type', meta: { label: 'Type' } },
    { accessorKey: 'head', header: 'Head of agency', meta: { label: 'Head', hideOnMobile: true } },
  ]

  return (
    <MasterPage
      title="Implementing agency"
      description="Agencies responsible for executing project components"
      addLabel="Add agency"
      searchPlaceholder="Search agency…"
      columns={columns}
      data={rows}
      fields={[
        { name: 'code', label: 'Code', required: true },
        { name: 'type', label: 'Type', defaultValue: 'Government' },
        { name: 'name', label: 'Agency name', required: true, span: true },
        { name: 'head', label: 'Head of agency' },
        { name: 'address', label: 'Address', type: 'textarea', span: true },
      ]}
      onCreate={(v) => add('implementingAgencies', v as any)}
    />
  )
}

export function FundingAgenciesPage() {
  const rows = useSettingsStore((s) => s.fundingAgencies)
  const add = useSettingsStore((s) => s.add)

  const columns: ColumnDef<FundingAgency, any>[] = [
    { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'name',
      header: 'Funding agency',
      meta: { label: 'Funding agency' },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    { accessorKey: 'country', header: 'Country', meta: { label: 'Country' } },
    {
      accessorKey: 'type',
      header: 'Type',
      meta: { align: 'center', label: 'Type' },
      cell: ({ getValue }) => <Badge variant="secondary">{getValue<string>()}</Badge>,
    },
  ]

  return (
    <MasterPage
      title="Funding agency"
      description="Development partners and government sources financing the portfolio"
      addLabel="Add funding agency"
      searchPlaceholder="Search funding agency…"
      columns={columns}
      data={rows}
      fields={[
        { name: 'code', label: 'Code', required: true },
        { name: 'name', label: 'Agency name', required: true },
        { name: 'country', label: 'Country' },
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          defaultValue: 'Multilateral',
          options: ['Multilateral', 'Bilateral', 'Government', 'Own'].map((t) => ({ value: t, label: t })),
        },
      ]}
      onCreate={(v) => add('fundingAgencies', v as any)}
    />
  )
}

export function FundSourcesPage() {
  const rows = useSettingsStore((s) => s.fundSources)
  const agencies = useSettingsStore((s) => s.fundingAgencies)
  const currencies = useSettingsStore((s) => s.currencies)
  const categories = useSettingsStore((s) => s.fundCategories)
  const add = useSettingsStore((s) => s.add)
  const agencyById = useLookup(agencies)

  const columns: ColumnDef<FundSource, any>[] = [
    { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'name',
      header: 'Source of fund',
      meta: { label: 'Source of fund' },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      id: 'agency',
      header: 'Funding agency',
      meta: { label: 'Funding agency' },
      accessorFn: (row) => agencyById[row.fundingAgencyId]?.name ?? '—',
    },
    { accessorKey: 'category', header: 'Category', meta: { label: 'Category' } },
    { accessorKey: 'currency', header: 'Currency', meta: { align: 'center', label: 'Currency' } },
  ]

  return (
    <MasterPage
      title="Source of fund"
      description="Loans, grants and government allocations available to projects"
      addLabel="Add source"
      searchPlaceholder="Search source…"
      columns={columns}
      data={rows}
      fields={[
        { name: 'code', label: 'Code', required: true },
        { name: 'name', label: 'Source name', required: true },
        {
          name: 'fundingAgencyId',
          label: 'Funding agency',
          type: 'select',
          required: true,
          options: agencies.map((a) => ({ value: a.id, label: a.name })),
        },
        {
          name: 'category',
          label: 'Fund category',
          type: 'select',
          options: categories.map((c) => ({ value: c.name, label: c.name })),
        },
        {
          name: 'currency',
          label: 'Currency',
          type: 'select',
          defaultValue: 'BDT',
          options: currencies.map((c) => ({ value: c.code, label: c.code })),
        },
      ]}
      onCreate={(v) => add('fundSources', v as any)}
    />
  )
}

export function FundCategoriesPage() {
  const rows = useSettingsStore((s) => s.fundCategories)
  const add = useSettingsStore((s) => s.add)

  return (
    <MasterPage
      title="Fund categories"
      description="Classification applied to every source of fund"
      addLabel="Add category"
      searchPlaceholder="Search category…"
      columns={codeNameColumns<FundCategory>()}
      data={rows}
      fields={[
        { name: 'code', label: 'Code', required: true },
        { name: 'name', label: 'Category name', required: true },
        { name: 'description', label: 'Description', type: 'textarea', span: true },
      ]}
      onCreate={(v) => add('fundCategories', v as any)}
    />
  )
}

export function ProjectTypesPage() {
  const rows = useSettingsStore((s) => s.projectTypes)
  const add = useSettingsStore((s) => s.add)

  return (
    <MasterPage
      title="Project types"
      description="Approval instrument used for each project"
      addLabel="Add project type"
      searchPlaceholder="Search project type…"
      columns={codeNameColumns<ProjectType>()}
      data={rows}
      fields={[
        { name: 'code', label: 'Code', required: true },
        { name: 'name', label: 'Type name', required: true },
        { name: 'description', label: 'Description', type: 'textarea', span: true },
      ]}
      onCreate={(v) => add('projectTypes', v as any)}
    />
  )
}

export function ProjectSectorsPage() {
  const rows = useSettingsStore((s) => s.projectSectors)
  const add = useSettingsStore((s) => s.add)

  return (
    <MasterPage
      title="Project sectors"
      description="Sector classification used in IMED and ADP reporting"
      addLabel="Add sector"
      searchPlaceholder="Search sector…"
      columns={codeNameColumns<ProjectSector>()}
      data={rows}
      fields={[
        { name: 'code', label: 'Code', required: true },
        { name: 'name', label: 'Sector name', required: true },
        { name: 'description', label: 'Description', type: 'textarea', span: true },
      ]}
      onCreate={(v) => add('projectSectors', v as any)}
    />
  )
}

export function MinistriesPage() {
  const rows = useSettingsStore((s) => s.ministries)
  const directorates = useSettingsStore((s) => s.ministryDirectorates)
  const add = useSettingsStore((s) => s.add)

  const columns = useMemo<ColumnDef<Ministry, any>[]>(
    () => [
      { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
      {
        accessorKey: 'name',
        header: 'Ministry / Division',
        meta: { label: 'Ministry' },
        cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
      },
      { accessorKey: 'secretary', header: 'Administrative head', meta: { label: 'Head' } },
      {
        id: 'directorates',
        header: 'Directorates',
        meta: { align: 'right', label: 'Directorates' },
        accessorFn: (row) => directorates.filter((d) => d.ministryId === row.id).length,
      },
    ],
    [directorates],
  )

  return (
    <MasterPage
      title="Ministry"
      description="Ministries and divisions that own projects in the portfolio"
      addLabel="Add ministry"
      searchPlaceholder="Search ministry…"
      columns={columns}
      data={rows}
      fields={[
        { name: 'code', label: 'Code', required: true },
        { name: 'name', label: 'Ministry / Division', required: true },
        { name: 'secretary', label: 'Administrative head', span: true },
      ]}
      onCreate={(v) => add('ministries', v as any)}
    />
  )
}

export function MinistryDirectoratesPage() {
  const rows = useSettingsStore((s) => s.ministryDirectorates)
  const ministries = useSettingsStore((s) => s.ministries)
  const add = useSettingsStore((s) => s.add)
  const ministryById = useLookup(ministries)

  const columns: ColumnDef<MinistryDirectorate, any>[] = [
    { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'name',
      header: 'Directorate',
      meta: { label: 'Directorate' },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      id: 'ministry',
      header: 'Ministry / Division',
      meta: { label: 'Ministry' },
      accessorFn: (row) => ministryById[row.ministryId]?.name ?? '—',
    },
    { accessorKey: 'head', header: 'Head', meta: { label: 'Head', hideOnMobile: true } },
  ]

  return (
    <MasterPage
      title="Ministry directorates"
      description="Directorates, departments and agencies under each ministry"
      addLabel="Add directorate"
      searchPlaceholder="Search directorate…"
      columns={columns}
      data={rows}
      fields={[
        { name: 'code', label: 'Code', required: true },
        { name: 'name', label: 'Directorate name', required: true },
        {
          name: 'ministryId',
          label: 'Ministry / Division',
          type: 'select',
          required: true,
          options: ministries.map((m) => ({ value: m.id, label: m.name })),
        },
        { name: 'head', label: 'Head' },
      ]}
      onCreate={(v) => add('ministryDirectorates', v as any)}
    />
  )
}

export function CurrenciesPage() {
  const rows = useSettingsStore((s) => s.currencies)
  const add = useSettingsStore((s) => s.add)

  const columns: ColumnDef<Currency, any>[] = [
    { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'name',
      header: 'Currency',
      meta: { label: 'Currency' },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    { accessorKey: 'symbol', header: 'Symbol', meta: { align: 'center', label: 'Symbol' } },
    {
      accessorKey: 'rateToBdt',
      header: 'Rate to BDT',
      meta: { align: 'right', label: 'Rate to BDT' },
      cell: ({ getValue }) => getValue<number>().toFixed(2),
    },
  ]

  return (
    <MasterPage
      title="Currency"
      description="Exchange rates used to convert foreign-currency transactions"
      addLabel="Add currency"
      searchPlaceholder="Search currency…"
      columns={columns}
      data={rows}
      fields={[
        { name: 'code', label: 'ISO code', required: true },
        { name: 'name', label: 'Currency name', required: true },
        { name: 'symbol', label: 'Symbol' },
        { name: 'rateToBdt', label: 'Rate to BDT', type: 'number', required: true },
      ]}
      onCreate={(v) => add('currencies', { ...v, rateToBdt: Number(v.rateToBdt) || 1 } as any)}
    />
  )
}

export function BanksPage() {
  const rows = useSettingsStore((s) => s.banks)
  const branches = useSettingsStore((s) => s.bankBranches)
  const add = useSettingsStore((s) => s.add)

  const columns = useMemo<ColumnDef<Bank, any>[]>(
    () => [
      { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
      {
        accessorKey: 'name',
        header: 'Bank',
        meta: { label: 'Bank' },
        cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'type',
        header: 'Ownership',
        meta: { align: 'center', label: 'Ownership' },
        cell: ({ getValue }) => <Badge variant="secondary">{getValue<string>()}</Badge>,
      },
      {
        id: 'branches',
        header: 'Branches',
        meta: { align: 'right', label: 'Branches' },
        accessorFn: (row) => branches.filter((b) => b.bankId === row.id).length,
      },
    ],
    [branches],
  )

  return (
    <MasterPage
      title="Bank"
      description="Banks where project accounts are maintained"
      addLabel="Add bank"
      searchPlaceholder="Search bank…"
      columns={columns}
      data={rows}
      fields={[
        { name: 'code', label: 'Code', required: true },
        { name: 'name', label: 'Bank name', required: true },
        {
          name: 'type',
          label: 'Ownership',
          type: 'select',
          defaultValue: 'State-owned',
          options: ['State-owned', 'Private', 'Foreign', 'Specialised'].map((t) => ({ value: t, label: t })),
        },
      ]}
      onCreate={(v) => add('banks', v as any)}
    />
  )
}

export function BankBranchesPage() {
  const rows = useSettingsStore((s) => s.bankBranches)
  const banks = useSettingsStore((s) => s.banks)
  const add = useSettingsStore((s) => s.add)
  const bankById = useLookup(banks)

  const columns: ColumnDef<BankBranch, any>[] = [
    {
      id: 'bank',
      header: 'Bank',
      meta: { label: 'Bank' },
      accessorFn: (row) => bankById[row.bankId]?.name ?? '—',
    },
    {
      accessorKey: 'name',
      header: 'Branch',
      meta: { label: 'Branch' },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    { accessorKey: 'routingNo', header: 'Routing no.', meta: { label: 'Routing no.', className: 'font-mono text-xs' } },
    { accessorKey: 'district', header: 'District', meta: { label: 'District' } },
  ]

  return (
    <MasterPage
      title="Bank branch"
      description="Branch-level detail with routing numbers used on advices"
      addLabel="Add branch"
      searchPlaceholder="Search branch, routing no. or district…"
      columns={columns}
      data={rows}
      pageSize={15}
      fields={[
        {
          name: 'bankId',
          label: 'Bank',
          type: 'select',
          required: true,
          span: true,
          options: banks.map((b) => ({ value: b.id, label: b.name })),
        },
        { name: 'name', label: 'Branch name', required: true },
        { name: 'routingNo', label: 'Routing number', required: true },
        { name: 'district', label: 'District' },
      ]}
      onCreate={(v) => add('bankBranches', v as any)}
    />
  )
}

export function SignaturesPage() {
  const rows = useSettingsStore((s) => s.signatures)
  const add = useSettingsStore((s) => s.add)

  const columns: ColumnDef<SignatureSetup, any>[] = [
    {
      accessorKey: 'name',
      header: 'Signatory',
      meta: { label: 'Signatory' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.designation}</p>
        </div>
      ),
    },
    { accessorKey: 'purpose', header: 'Used on', meta: { label: 'Used on' } },
    { accessorKey: 'order', header: 'Order', meta: { align: 'right', label: 'Order' } },
    {
      id: 'status',
      header: 'Status',
      meta: { align: 'center', label: 'Status' },
      accessorFn: (row) => (row.active ? 'active' : 'inactive'),
      cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
  ]

  return (
    <MasterPage
      title="Signature setup"
      description="Signature blocks printed on vouchers, statements and certificates"
      addLabel="Add signatory"
      searchPlaceholder="Search signatory…"
      columns={columns}
      data={rows}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'designation', label: 'Designation', required: true },
        { name: 'purpose', label: 'Used on', required: true, span: true },
        { name: 'order', label: 'Print order', type: 'number' },
      ]}
      onCreate={(v) => add('signatures', { ...v, order: Number(v.order) || 99, active: true } as any)}
    />
  )
}

export function AssociationGroupsPage() {
  const rows = useSettingsStore((s) => s.associationGroups)
  const add = useSettingsStore((s) => s.add)

  const columns: ColumnDef<AssociationGroup, any>[] = [
    {
      accessorKey: 'name',
      header: 'Association',
      meta: { label: 'Association' },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    { accessorKey: 'sector', header: 'Sector', meta: { label: 'Sector' } },
    { accessorKey: 'focalPerson', header: 'Focal person', meta: { label: 'Focal person' } },
    {
      accessorKey: 'memberInstitutes',
      header: 'Member institutes',
      meta: { align: 'right', label: 'Member institutes' },
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
  ]

  return (
    <MasterPage
      title="Association group setup"
      description="Industry associations delivering training under the programme"
      addLabel="Add association"
      searchPlaceholder="Search association or sector…"
      columns={columns}
      data={rows}
      fields={[
        { name: 'name', label: 'Association name', required: true },
        { name: 'sector', label: 'Sector', required: true },
        { name: 'focalPerson', label: 'Focal person' },
        { name: 'memberInstitutes', label: 'Member institutes', type: 'number' },
      ]}
      onCreate={(v) => add('associationGroups', { ...v, memberInstitutes: Number(v.memberInstitutes) || 0 } as any)}
    />
  )
}
