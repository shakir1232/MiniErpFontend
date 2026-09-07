import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MasterPage } from '@/components/common/master-page'
import { formatNumber } from '@/lib/format'
import { useHrStore } from '../store'
import { useProjectStore } from '@/features/projects/store'
import type { EmployeeGroup } from '../types'

const toRecord = (v: Record<string, string>): Omit<EmployeeGroup, 'id'> => ({
  name: v.name,
  code: v.code,
  projectId: v.projectId,
  headcount: Number(v.headcount) || 0,
  description: v.description,
})

export function EmployeeGroupsPage() {
  const groups = useHrStore((s) => s.employeeGroups)
  const employees = useHrStore((s) => s.employees)
  const addGroup = useHrStore((s) => s.addEmployeeGroup)
  const updateGroup = useHrStore((s) => s.updateEmployeeGroup)
  const removeGroup = useHrStore((s) => s.removeEmployeeGroup)
  const projects = useProjectStore((s) => s.projects)

  const projectById = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects])

  const columns = useMemo<ColumnDef<EmployeeGroup, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Employee group',
        meta: { label: 'Group' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{row.original.code}</p>
          </div>
        ),
      },
      {
        id: 'project',
        header: 'Project',
        meta: { label: 'Project' },
        accessorFn: (row) => projectById[row.projectId]?.shortName ?? '—',
      },
      {
        accessorKey: 'description',
        header: 'Description',
        meta: { label: 'Description' },
        cell: ({ getValue }) => <span className="line-clamp-2 text-muted-foreground">{getValue<string>()}</span>,
      },
      {
        id: 'assigned',
        header: 'Assigned',
        meta: { align: 'right', label: 'Assigned staff' },
        accessorFn: (row) => employees.filter((e) => e.employeeGroupId === row.id).length,
      },
      {
        accessorKey: 'headcount',
        header: 'Sanctioned',
        meta: { align: 'right', label: 'Sanctioned' },
        cell: ({ getValue }) => formatNumber(getValue<number>()),
      },
    ],
    [employees, projectById],
  )

  return (
    <MasterPage
      title="Employee groups"
      description="Units that staff are attached to for payroll and reporting"
      addLabel="Add employee group"
      searchPlaceholder="Search employee groups…"
      columns={columns}
      data={groups}
      fields={[
        { name: 'name', label: 'Group name', required: true, span: true },
        { name: 'code', label: 'Short code', required: true },
        {
          name: 'projectId',
          label: 'Project',
          type: 'select',
          required: true,
          options: projects.map((p) => ({ value: p.id, label: p.shortName })),
        },
        { name: 'headcount', label: 'Sanctioned headcount', type: 'number' },
        { name: 'description', label: 'Description', type: 'textarea', span: true },
      ]}
      onCreate={(v) => addGroup(toRecord(v))}
      onUpdate={(row, v) => updateGroup(row.id, toRecord(v))}
      onDelete={(row) => removeGroup(row.id)}
    />
  )
}
