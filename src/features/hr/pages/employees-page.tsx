import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, UserCheck, UserRound, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/common/page-container'
import { PageHeader } from '@/components/common/page-header'
import { DataTable } from '@/components/common/data-table'
import { StatCard } from '@/components/common/stat-card'
import { StatusBadge } from '@/components/common/status-badge'
import { RecordSheet } from '@/components/common/record-sheet'
import { DetailList } from '@/components/common/detail-list'
import { FormField, FormGrid } from '@/components/common/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatDate } from '@/lib/format'
import { useDesignationLookup, useEmployeeGroupLookup, useHrStore } from '../store'
import type { Employee } from '../types'

const emptyForm = {
  name: '',
  code: '',
  designationId: '',
  employeeGroupId: '',
  mobile: '',
  email: '',
  joiningDate: '',
  contractEndDate: '',
  grossSalary: '',
  gender: 'male' as Employee['gender'],
}

export function EmployeesPage() {
  const employees = useHrStore((s) => s.employees)
  const designations = useHrStore((s) => s.designations)
  const groups = useHrStore((s) => s.employeeGroups)
  const addEmployee = useHrStore((s) => s.addEmployee)
  const designationById = useDesignationLookup()
  const groupById = useEmployeeGroupLookup()

  const [statusFilter, setStatusFilter] = useState<'all' | Employee['status']>('all')
  const [selected, setSelected] = useState<Employee | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const rows = useMemo(
    () => (statusFilter === 'all' ? employees : employees.filter((e) => e.status === statusFilter)),
    [employees, statusFilter],
  )

  const counts = useMemo(
    () => ({
      total: employees.length,
      active: employees.filter((e) => e.status === 'active').length,
      expired: employees.filter((e) => e.status === 'expired').length,
      payroll: employees.filter((e) => e.status === 'active').reduce((s, e) => s + e.grossSalary, 0),
    }),
    [employees],
  )

  const columns: ColumnDef<Employee, any>[] = [
    {
      accessorKey: 'name',
      header: 'Employee',
      meta: { label: 'Employee' },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{row.original.code}</p>
        </div>
      ),
    },
    {
      id: 'designation',
      header: 'Designation',
      meta: { label: 'Designation' },
      accessorFn: (row) => designationById[row.designationId]?.title ?? '—',
    },
    {
      id: 'group',
      header: 'Employee group',
      meta: { label: 'Group' },
      accessorFn: (row) => groupById[row.employeeGroupId]?.name ?? '—',
    },
    { accessorKey: 'mobile', header: 'Mobile', meta: { label: 'Mobile', hideOnMobile: true } },
    {
      accessorKey: 'grossSalary',
      header: 'Gross salary',
      meta: { align: 'right', label: 'Gross salary' },
      cell: ({ getValue }) => formatCurrency(getValue<number>()),
    },
    {
      accessorKey: 'contractEndDate',
      header: 'Contract ends',
      meta: { align: 'right', label: 'Contract ends' },
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { align: 'center', label: 'Status' },
      cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
  ]

  const submit = () => {
    if (!form.name || !form.code || !form.designationId || !form.employeeGroupId) {
      toast.error('Name, code, designation and employee group are required.')
      return
    }
    const group = groups.find((g) => g.id === form.employeeGroupId)!
    addEmployee({
      code: form.code,
      name: form.name,
      fatherName: '—',
      gender: form.gender,
      dateOfBirth: '',
      nid: '',
      tin: '',
      mobile: form.mobile,
      email: form.email,
      presentAddress: '',
      designationId: form.designationId,
      employeeGroupId: form.employeeGroupId,
      projectId: group.projectId,
      joiningDate: form.joiningDate || new Date().toISOString().slice(0, 10),
      contractEndDate: form.contractEndDate || new Date().toISOString().slice(0, 10),
      status: 'active',
      bank: '',
      branch: '',
      accountNo: '',
      grossSalary: Number(form.grossSalary) || 0,
      bloodGroup: '',
    })
    toast.success(`${form.name} added.`)
    setCreateOpen(false)
    setForm(emptyForm)
  }

  return (
    <PageContainer>
      <PageHeader
        title="Employees"
        description="Project staff on contract across all implementation units"
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Add employee
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total employees" value={String(counts.total)} icon={UserRound} />
        <StatCard label="Active" value={String(counts.active)} icon={UserCheck} tone="success" />
        <StatCard label="Contract expired" value={String(counts.expired)} icon={UserX} tone="warning" />
        <StatCard label="Monthly payroll" value={formatCurrency(counts.payroll, { compact: true })} tone="info" />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search name, code or mobile…"
        pageSize={12}
        onRowClick={setSelected}
        toolbar={
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        }
        emptyTitle="No employees"
        emptyDescription="Adjust the filter or add a new employee record."
      />

      <RecordSheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.name ?? ''}
        description={selected ? designationById[selected.designationId]?.title : undefined}
        wide
      >
        {selected ? (
          <Tabs defaultValue="personal">
            <TabsList>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="job">Job</TabsTrigger>
              <TabsTrigger value="bank">Bank</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="mt-4">
              <DetailList
                items={[
                  { label: 'Employee code', value: <span className="font-mono">{selected.code}</span> },
                  { label: "Father's name", value: selected.fatherName },
                  { label: 'Gender', value: <span className="capitalize">{selected.gender}</span> },
                  { label: 'Date of birth', value: formatDate(selected.dateOfBirth) },
                  { label: 'NID', value: selected.nid || '—' },
                  { label: 'TIN', value: selected.tin || '—' },
                  { label: 'Blood group', value: selected.bloodGroup || '—' },
                  { label: 'Mobile', value: selected.mobile },
                  { label: 'Email', value: selected.email, span: true },
                  { label: 'Present address', value: selected.presentAddress || '—', span: true },
                ]}
              />
            </TabsContent>
            <TabsContent value="job" className="mt-4">
              <DetailList
                items={[
                  { label: 'Designation', value: designationById[selected.designationId]?.title ?? '—' },
                  { label: 'Grade', value: designationById[selected.designationId]?.grade ?? '—' },
                  { label: 'Employee group', value: groupById[selected.employeeGroupId]?.name ?? '—' },
                  { label: 'Status', value: <StatusBadge status={selected.status} /> },
                  { label: 'Joining date', value: formatDate(selected.joiningDate) },
                  { label: 'Contract end', value: formatDate(selected.contractEndDate) },
                  { label: 'Gross monthly salary', value: formatCurrency(selected.grossSalary) },
                ]}
              />
            </TabsContent>
            <TabsContent value="bank" className="mt-4">
              <DetailList
                items={[
                  { label: 'Bank', value: selected.bank || '—' },
                  { label: 'Branch', value: selected.branch || '—' },
                  { label: 'Account number', value: <span className="font-mono">{selected.accountNo || '—'}</span> },
                ]}
              />
            </TabsContent>
          </Tabs>
        ) : null}
      </RecordSheet>

      <RecordSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add employee"
        description="Prototype only — records live in browser memory."
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Save employee</Button>
          </>
        }
      >
        <FormGrid>
          <FormField id="e-name" label="Full name" required>
            <Input id="e-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField id="e-code" label="Employee code" required>
            <Input id="e-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </FormField>
          <FormField label="Designation" required>
            <Select value={form.designationId} onValueChange={(v) => setForm({ ...form, designationId: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                {designations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Employee group" required>
            <Select value={form.employeeGroupId} onValueChange={(v) => setForm({ ...form, employeeGroupId: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Gender">
            <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as Employee['gender'] })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="e-salary" label="Gross salary (BDT)">
            <Input
              id="e-salary"
              inputMode="numeric"
              value={form.grossSalary}
              onChange={(e) => setForm({ ...form, grossSalary: e.target.value })}
            />
          </FormField>
          <FormField id="e-mobile" label="Mobile">
            <Input id="e-mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </FormField>
          <FormField id="e-email" label="Email">
            <Input id="e-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </FormField>
          <FormField id="e-join" label="Joining date">
            <Input id="e-join" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
          </FormField>
          <FormField id="e-end" label="Contract end date">
            <Input
              id="e-end"
              type="date"
              value={form.contractEndDate}
              onChange={(e) => setForm({ ...form, contractEndDate: e.target.value })}
            />
          </FormField>
        </FormGrid>
      </RecordSheet>
    </PageContainer>
  )
}
