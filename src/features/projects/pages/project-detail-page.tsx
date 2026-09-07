import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Building2, Landmark, Users } from 'lucide-react'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { SectionCard } from '@/components/common/section-card'
import { DetailList } from '@/components/common/detail-list'
import { DataTable } from '@/components/common/data-table'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate, formatNumber, formatPercent } from '@/lib/format'
import { useProjectStore } from '../store'
import type { ImplementationAgency, ProjectBankAccount, ProjectDirector, ProjectSourceOfFund } from '../types'

export function ProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId))
  const allDirectors = useProjectStore((s) => s.directors)
  const allAccounts = useProjectStore((s) => s.bankAccounts)
  const allSources = useProjectStore((s) => s.sourcesOfFund)
  const allAgencies = useProjectStore((s) => s.agencies)

  const directors = useMemo(() => allDirectors.filter((d) => d.projectId === projectId), [allDirectors, projectId])
  const accounts = useMemo(() => allAccounts.filter((a) => a.projectId === projectId), [allAccounts, projectId])
  const sources = useMemo(() => allSources.filter((f) => f.projectId === projectId), [allSources, projectId])
  const agencies = useMemo(() => allAgencies.filter((a) => a.projectId === projectId), [allAgencies, projectId])

  if (!project) {
    return (
      <PageContainer>
        <EmptyState
          title="Project not found"
          description="It may have been removed in this prototype session."
          action={
            <Button variant="outline" onClick={() => navigate('/projects')}>
              Back to projects
            </Button>
          }
        />
      </PageContainer>
    )
  }

  const utilisation = project.approvedCost ? (project.cumulativeExpenditure / project.approvedCost) * 100 : 0

  const directorColumns: ColumnDef<ProjectDirector, any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { label: 'Name' },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.current ? <Badge variant="secondary" className="text-[10px]">current</Badge> : null}
        </div>
      ),
    },
    { accessorKey: 'designation', header: 'Designation', meta: { label: 'Designation' } },
    { accessorKey: 'phone', header: 'Phone', meta: { label: 'Phone' } },
    {
      id: 'tenure',
      header: 'Tenure',
      meta: { align: 'right', label: 'Tenure' },
      accessorFn: (r) => `${formatDate(r.fromDate)} – ${r.toDate ? formatDate(r.toDate) : 'present'}`,
    },
  ]

  const accountColumns: ColumnDef<ProjectBankAccount, any>[] = [
    {
      accessorKey: 'accountName',
      header: 'Account',
      meta: { label: 'Account' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.accountName}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.original.accountNo}</p>
        </div>
      ),
    },
    {
      id: 'bank',
      header: 'Bank / Branch',
      meta: { label: 'Bank' },
      accessorFn: (r) => `${r.bank} — ${r.branch}`,
    },
    { accessorKey: 'fundSource', header: 'Fund source', meta: { label: 'Fund source' } },
    { accessorKey: 'currency', header: 'Ccy', meta: { align: 'center', label: 'Currency' } },
    {
      accessorKey: 'currentBalance',
      header: 'Balance',
      meta: { align: 'right', label: 'Balance' },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { align: 'center', label: 'Status' },
      cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
  ]

  const sourceColumns: ColumnDef<ProjectSourceOfFund, any>[] = [
    { accessorKey: 'source', header: 'Source', meta: { label: 'Source' }, cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span> },
    { accessorKey: 'fundingAgency', header: 'Funding agency', meta: { label: 'Agency' } },
    { accessorKey: 'category', header: 'Category', meta: { label: 'Category' } },
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
      id: 'pct',
      header: 'Use %',
      meta: { align: 'right', label: 'Use %' },
      accessorFn: (r) => (r.allocated ? (r.utilised / r.allocated) * 100 : 0),
      cell: ({ getValue }) => formatPercent(getValue<number>(), 0),
    },
  ]

  const agencyColumns: ColumnDef<ImplementationAgency, any>[] = [
    {
      accessorKey: 'name',
      header: 'Agency',
      meta: { label: 'Agency' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.focalPerson} · {row.original.contact}
          </p>
        </div>
      ),
    },
    { accessorKey: 'type', header: 'Type', meta: { label: 'Type' } },
    {
      accessorKey: 'contractedTrainees',
      header: 'Contracted',
      meta: { align: 'right', label: 'Contracted' },
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
    {
      accessorKey: 'certifiedTrainees',
      header: 'Certified',
      meta: { align: 'right', label: 'Certified' },
      cell: ({ getValue }) => formatNumber(getValue<number>()),
    },
    {
      id: 'rate',
      header: 'Certification %',
      meta: { align: 'right', label: 'Certification %' },
      accessorFn: (r) => (r.contractedTrainees ? (r.certifiedTrainees / r.contractedTrainees) * 100 : 0),
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
  ]

  return (
    <PageContainer>
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
        <Link to="/projects">
          <ArrowLeft className="size-4" /> All projects
        </Link>
      </Button>

      <PageHeader
        title={project.shortName}
        description={project.name}
        actions={<StatusBadge status={project.status} className="text-sm" />}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Approved cost" value={formatCurrency(project.approvedCost, { compact: true })} icon={Landmark} />
        <StatCard
          label="Cumulative expenditure"
          value={formatCurrency(project.cumulativeExpenditure, { compact: true })}
          trend={{ value: utilisation, label: 'utilised' }}
          tone="info"
        />
        <StatCard label="Implementing agencies" value={String(agencies.length)} icon={Building2} />
        <StatCard label="Districts covered" value={String(project.districts)} icon={Users} tone="success" />
      </div>

      <Tabs defaultValue="overview">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 no-scrollbar">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="funds">Source of fund</TabsTrigger>
            <TabsTrigger value="accounts">Bank accounts</TabsTrigger>
            <TabsTrigger value="directors">Project directors</TabsTrigger>
            <TabsTrigger value="agencies">Implementing agencies</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <SectionCard title="Project profile">
            <DetailList
              items={[
                { label: 'Project code', value: <span className="font-mono">{project.code}</span> },
                { label: 'Project type', value: project.projectType },
                { label: 'Ministry / Division', value: project.ministry },
                { label: 'Sector', value: project.sector },
                { label: 'Implementing agency', value: project.implementingAgency },
                { label: 'Funding agencies', value: project.fundingAgencies.join(', ') || '—' },
                { label: 'Start date', value: formatDate(project.startDate) },
                { label: 'Closing date', value: formatDate(project.endDate) },
                { label: 'Current RDPP revision', value: `Revision ${project.currentRdppRevision}` },
                { label: 'Districts covered', value: String(project.districts) },
                { label: 'Description', value: project.description, span: true },
              ]}
            />
          </SectionCard>

          <SectionCard title="Financing structure">
            <DetailList
              items={[
                { label: 'GoB share', value: formatCurrency(project.gobShare) },
                { label: 'Project aid (PA)', value: formatCurrency(project.paShare) },
                { label: 'Own fund', value: formatCurrency(project.ownFund) },
                { label: 'Total approved cost', value: formatCurrency(project.approvedCost) },
              ]}
            />
          </SectionCard>

          <SectionCard title="Project director">
            <DetailList
              items={[
                { label: 'Name', value: project.projectDirector },
                { label: 'Phone', value: project.pdPhone },
                { label: 'Email', value: project.pdEmail },
              ]}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="funds" className="mt-4">
          <DataTable columns={sourceColumns} data={sources} searchPlaceholder="Search fund sources…" emptyTitle="No fund sources recorded" />
        </TabsContent>
        <TabsContent value="accounts" className="mt-4">
          <DataTable columns={accountColumns} data={accounts} searchPlaceholder="Search accounts…" emptyTitle="No bank accounts recorded" />
        </TabsContent>
        <TabsContent value="directors" className="mt-4">
          <DataTable columns={directorColumns} data={directors} searchPlaceholder="Search directors…" emptyTitle="No project directors recorded" />
        </TabsContent>
        <TabsContent value="agencies" className="mt-4">
          <DataTable columns={agencyColumns} data={agencies} searchPlaceholder="Search agencies…" emptyTitle="No implementing agencies recorded" />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
