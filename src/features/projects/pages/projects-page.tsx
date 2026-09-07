import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { FolderKanban, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { RowActions } from '@/components/common/row-actions'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { RecordSheet } from '@/components/common/record-sheet'
import { FormField, FormGrid } from '@/components/common/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate, formatPercent } from '@/lib/format'
import { useProjectStore } from '../store'
import type { Project, ProjectStatus } from '../types'

const STATUSES: ProjectStatus[] = ['active', 'closing', 'closed', 'pipeline']

const emptyForm = {
  name: '',
  shortName: '',
  code: '',
  status: 'pipeline' as ProjectStatus,
  ministry: '',
  implementingAgency: '',
  approvedCost: '',
  startDate: '',
  endDate: '',
  description: '',
}

export function ProjectsPage() {
  const navigate = useNavigate()
  const projects = useProjectStore((s) => s.projects)
  const addProject = useProjectStore((s) => s.addProject)
  const updateProject = useProjectStore((s) => s.updateProject)
  const removeProject = useProjectStore((s) => s.removeProject)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState<Project | null>(null)
  const [form, setForm] = useState(emptyForm)

  const totals = projects.reduce(
    (acc, p) => ({
      approved: acc.approved + p.approvedCost,
      spent: acc.spent + p.cumulativeExpenditure,
      active: acc.active + (p.status === 'active' ? 1 : 0),
    }),
    { approved: 0, spent: 0, active: 0 },
  )

  const columns: ColumnDef<Project, any>[] = [
    {
      accessorKey: 'shortName',
      header: 'Project',
      meta: { label: 'Project' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.shortName}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.name}</p>
        </div>
      ),
    },
    { accessorKey: 'code', header: 'Code', meta: { label: 'Code', className: 'font-mono text-xs' } },
    {
      accessorKey: 'implementingAgency',
      header: 'Implementing agency',
      meta: { label: 'Agency' },
      cell: ({ getValue }) => <span className="line-clamp-2">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'approvedCost',
      header: 'Approved cost',
      meta: { align: 'right', label: 'Approved cost' },
      cell: ({ getValue }) => formatCurrency(getValue<number>(), { compact: true }),
    },
    {
      id: 'utilisation',
      header: 'Utilisation',
      meta: { align: 'right', label: 'Utilisation' },
      accessorFn: (row) => (row.approvedCost ? (row.cumulativeExpenditure / row.approvedCost) * 100 : 0),
      cell: ({ getValue }) => (
        <div className="flex items-center justify-end gap-2">
          <Progress value={getValue<number>()} className="h-1.5 w-14" />
          <span className="w-10 text-right tabular-nums">{formatPercent(getValue<number>(), 0)}</span>
        </div>
      ),
    },
    {
      accessorKey: 'endDate',
      header: 'Closing',
      meta: { align: 'right', label: 'Closing date' },
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { align: 'center', label: 'Status' },
      cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'right', label: 'Actions', pinMobile: true, className: 'w-px' },
      cell: ({ row }) => (
        <RowActions onEdit={() => openEdit(row.original)} onDelete={() => setDeleting(row.original)} />
      ),
    },
  ]

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (project: Project) => {
    setEditing(project)
    setForm({
      name: project.name,
      shortName: project.shortName,
      code: project.code,
      status: project.status,
      ministry: project.ministry,
      implementingAgency: project.implementingAgency,
      approvedCost: String(project.approvedCost),
      startDate: project.startDate,
      endDate: project.endDate,
      description: project.description,
    })
    setOpen(true)
  }

  const submit = () => {
    if (!form.name || !form.shortName || !form.code) {
      toast.error('Name, short name and project code are required.')
      return
    }
    if (editing) {
      updateProject(editing.id, {
        name: form.name,
        shortName: form.shortName,
        code: form.code,
        status: form.status,
        ministry: form.ministry,
        implementingAgency: form.implementingAgency,
        approvedCost: Number(form.approvedCost) || 0,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description,
      })
      toast.success(`${form.shortName} updated.`)
      setOpen(false)
      setEditing(null)
      setForm(emptyForm)
      return
    }
    addProject({
      name: form.name,
      shortName: form.shortName,
      code: form.code,
      status: form.status,
      ministry: form.ministry || 'Finance Division',
      implementingAgency: form.implementingAgency || 'Finance Division, Ministry of Finance',
      fundingAgencies: [],
      sector: 'Education & Skills Development',
      projectType: 'Investment Project',
      startDate: form.startDate || new Date().toISOString().slice(0, 10),
      endDate: form.endDate || new Date().toISOString().slice(0, 10),
      approvedCost: Number(form.approvedCost) || 0,
      gobShare: 0,
      paShare: 0,
      ownFund: 0,
      cumulativeExpenditure: 0,
      currentRdppRevision: 0,
      projectDirector: 'To be appointed',
      pdPhone: '—',
      pdEmail: '—',
      districts: 0,
      description: form.description,
    })
    toast.success(`${form.shortName} added to the portfolio.`)
    setOpen(false)
    setForm(emptyForm)
  }

  return (
    <PageContainer>
      <PageHeader
        title="Projects info"
        description="Development projects administered under the programme"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" /> New project
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Projects" value={String(projects.length)} hint={`${totals.active} active`} icon={FolderKanban} />
        <StatCard label="Total approved cost" value={formatCurrency(totals.approved, { compact: true })} />
        <StatCard
          label="Cumulative expenditure"
          value={formatCurrency(totals.spent, { compact: true })}
          trend={{ value: (totals.spent / totals.approved) * 100, label: 'of approved cost' }}
          tone="info"
        />
      </div>

      <DataTable
        columns={columns}
        data={projects}
        searchPlaceholder="Search by name, code or agency…"
        onRowClick={(row) => navigate(`/projects/${row.id}`)}
        emptyTitle="No projects"
        emptyDescription="Add a project to start capturing budget and expenditure."
      />

      <RecordSheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setEditing(null)
        }}
        title={editing ? `Edit ${editing.shortName}` : 'New project'}
        description="Prototype only — records live in browser memory."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editing ? 'Update project' : 'Save project'}</Button>
          </>
        }
      >
        <FormGrid>
          <FormField id="p-name" label="Project name" required className="sm:col-span-2">
            <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField id="p-short" label="Short name" required>
            <Input id="p-short" value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} />
          </FormField>
          <FormField id="p-code" label="Project code" required>
            <Input id="p-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ProjectStatus })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="p-cost" label="Approved cost (BDT)" hint="Numbers only">
            <Input
              id="p-cost"
              inputMode="numeric"
              value={form.approvedCost}
              onChange={(e) => setForm({ ...form, approvedCost: e.target.value })}
            />
          </FormField>
          <FormField id="p-ministry" label="Ministry / Division">
            <Input id="p-ministry" value={form.ministry} onChange={(e) => setForm({ ...form, ministry: e.target.value })} />
          </FormField>
          <FormField id="p-ia" label="Implementing agency">
            <Input
              id="p-ia"
              value={form.implementingAgency}
              onChange={(e) => setForm({ ...form, implementingAgency: e.target.value })}
            />
          </FormField>
          <FormField id="p-start" label="Start date">
            <Input id="p-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </FormField>
          <FormField id="p-end" label="Closing date">
            <Input id="p-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </FormField>
          <FormField id="p-desc" label="Description" className="sm:col-span-2">
            <Textarea
              id="p-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormField>
        </FormGrid>
      </RecordSheet>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(next) => !next && setDeleting(null)}
        title={`Delete ${deleting?.shortName ?? 'project'}?`}
        description="Budget, accounting and payroll records stay in the prototype session, but the project disappears from the portfolio."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleting) {
            removeProject(deleting.id)
            toast.success(`${deleting.shortName} deleted.`)
          }
          setDeleting(null)
        }}
      />
    </PageContainer>
  )
}
